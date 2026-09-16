import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
    Box,
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Paper,
    TableSortLabel,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Stack, Typography, Divider,
    Card
} from "@mui/material";
import { Icon } from "@mui/material";
import Switch from "@mui/material/Switch";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { ApiService } from "app/services/ApiService";
import { localStorageKey } from "app/constant/localStorageKey";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { exportToExcel } from "app/utils/excelExport";
import { Breadcrumb } from "app/components";
import styled from "@emotion/styled";
import ConfirmModal from "app/components/ConfirmModal";
import OutlinedInput from "@mui/material/OutlinedInput";
import ListItemText from "@mui/material/ListItemText";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import debounce from "lodash.debounce";
import {
    Apps as AppsIcon,
    DragIndicator as DragIndicatorIcon,
} from "@mui/icons-material";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250
        }
    }
};

const names = ["Status", "Popular", "Special", "Menu Item", "Action"];

const reorderList = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

const CategoryList = () => {
    // State management
    const [searchParams] = useSearchParams();
    const queryId = searchParams.get("id");
    const [categoryList, setCategoryList] = useState([]);
    const [excelData, setExcelData] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(200);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [type, setType] = useState("");
    const [route, setRoute] = useState(null);
    const [msg, setMsg] = useState("")
    const [statusData, setStatusData] = useState({});
    const [personName, setPersonName] = useState(
        JSON.parse(localStorage.getItem(localStorageKey.adminCatTable)) || []
    );
    const [loading, setLoading] = useState(false);

    // Pagination state from server
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 25,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
    });

    // Sorting state
    const [order, setOrder] = useState("none");
    const [orderBy, setOrderBy] = useState(null);// Add with other state declarations
    const [isDragging, setIsDragging] = useState(false);
    const [hasOrderChanges, setHasOrderChanges] = useState(false);
    const [pendingOrderIds, setPendingOrderIds] = useState([]);

    const navigate = useNavigate();
    const auth_key = localStorage.getItem(localStorageKey.auth_key);
    const debounceRef = useRef();

    // Initialize debounce
    useEffect(() => {
        debounceRef.current = debounce((searchValue) => {
            setDebouncedSearch(searchValue);
            setPage(0); // Reset to first page when search changes
        }, 500);

        return () => {
            debounceRef.current?.cancel();
        };
    }, []);

    // Handle search with debouncing
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        debounceRef.current(value);
    };

    // Handle column preferences
    const handleChange = (event) => {
        const {
            target: { value }
        } = event;
        const setPerson = typeof value === "string" ? value.split(",") : value;
        setPersonName(setPerson);
        localStorage.setItem(localStorageKey.adminCatTable, JSON.stringify(setPerson));
        if (setPerson.length <= 0) {
            localStorage.removeItem(localStorageKey.adminCatTable);
        }
    };

    // Authentication and modal handlers
    const logOut = () => {
        localStorage.removeItem(localStorageKey.auth_key);
        localStorage.removeItem(localStorageKey.designation_id);
        localStorage.removeItem(localStorageKey.vendorId);
        setRoute(ROUTE_CONSTANT.login)
    };

    const handleOpen = (type, msg) => {
        setMsg(msg?.message);
        setOpen(true);
        setType(type);
        if (msg?.response?.status === 401) {
            logOut()
        }
    };

    const handleClose = () => {
        setOpen(false);
        if (route !== null) {
            navigate(route)
        }
        setRoute(null)
        setMsg("")
    };

    // Fetch admin category list with search, pagination, and sorting
    const getCategoryList = useCallback(async () => {
        try {
            setLoading(true);

            // Build query parameters
            const params = new URLSearchParams({
                page: (page + 1).toString(), // Convert to 1-based for server
                limit: rowsPerPage.toString(),
            });

            // Add search if provided
            if (debouncedSearch) {
                params.append('search', debouncedSearch);
            }

            if (queryId) {
                params.append('categoryId', queryId);
            }

            const url = `${apiEndpoints.getChildrenAdminCategory}?${params.toString()}`;
            const res = await ApiService.get(url, auth_key);

            if (res.status === 200) {
                const serverData = res?.data?.data || [];
                const serverPagination = res?.data?.pagination || {
                    total: 0,
                    page: 1,
                    limit: rowsPerPage,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPrevPage: false
                };

                // Add serial numbers based on server pagination
                const myNewList = serverData.map((e, i) => {
                    const serialNumber = (serverPagination.page - 1) * serverPagination.limit + i + 1;
                    return { "S.No": serialNumber, ...e };
                });

                // Prepare Excel data
                const xData = myNewList.map((e, i) => {
                    let obj = {
                        "S.NO": (serverPagination.page - 1) * serverPagination.limit + i + 1,
                        title: e.title,
                        status: e.status ? "Active" : "In Active"
                    };
                    return obj;
                });

                setExcelData(xData);
                setCategoryList(myNewList);
                setPagination(serverPagination);
            }
        } catch (error) {
            handleOpen("error", error);
        } finally {
            setLoading(false);
        }
    }, [auth_key, debouncedSearch, queryId, page, rowsPerPage]);

    // Fetch data when dependencies change
    useEffect(() => {
        getCategoryList();
    }, [getCategoryList]);

    // Pagination handlers
    const handleChangePage = useCallback((event, newPage) => {
        setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0); // Reset to first page when rows per page changes
    }, []);

    // Status change handlers
    const handleStatusChange = useCallback(async () => {
        if (statusData) {
            try {
                const payload = statusData;
                const res = await ApiService.post(
                    apiEndpoints.changeStatusAdminCategory,
                    payload,
                    auth_key
                );
                if (res.status === 200) {
                    getCategoryList();
                }
            } catch (error) {
                handleOpen("error", error);
            }
        }
    }, [auth_key, getCategoryList, statusData]);

    const handlePopularStatusChange = useCallback(async () => {
        if (statusData) {
            try {
                const payload = statusData;
                const res = await ApiService.post(
                    apiEndpoints.changePopularStatusAdminCategory,
                    payload,
                    auth_key
                );
                if (res.status === 200) {
                    getCategoryList();
                }
            } catch (error) {
                handleOpen("error", error);
            }
        }
    }, [auth_key, getCategoryList, statusData]);

    const handleSpecialCatStatusChange = useCallback(async () => {
        if (statusData) {
            try {
                const payload = statusData;
                const res = await ApiService.post(
                    apiEndpoints.changeSpecialStatusAdminCategory,
                    payload,
                    auth_key
                );
                if (res.status === 200) {
                    getCategoryList();
                }
            } catch (error) {
                handleOpen("error", error);
            }
        }
    }, [auth_key, getCategoryList, statusData]);

    const handleMenuItemStatusChange = useCallback(async () => {
        if (statusData) {
            try {
                const payload = statusData;
                const res = await ApiService.post(
                    apiEndpoints.changeMenuStatusAdminCategory,
                    payload,
                    auth_key
                );
                if (res.status === 200) {
                    getCategoryList();
                }
            } catch (error) {
                handleOpen("error", error);
            }
        }
    }, [auth_key, getCategoryList, statusData]);

    // Client-side sorting (for other columns)
    const handleRequestSort = (property) => {
        let newOrder;
        if (orderBy !== property) {
            newOrder = "asc";
        } else {
            newOrder = order === "asc" ? "desc" : order === "desc" ? "none" : "asc";
        }
        setOrder(newOrder);
        setOrderBy(newOrder === "none" ? null : property);
    };

    const sortComparator = (a, b, orderBy) => {
        if (typeof a[orderBy] === "string" && typeof b[orderBy] === "string") {
            return a[orderBy].localeCompare(b[orderBy]);
        }
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    };

    // Apply client-side sorting only for non-admin category columns
    const sortedRows = orderBy
        ? [...categoryList].sort((a, b) =>
            order === "asc"
                ? sortComparator(a, b, orderBy)
                : order === "desc"
                    ? sortComparator(b, a, orderBy)
                    : 0
        )
        : categoryList;

    const onDragStart = () => {
        setIsDragging(true);
    };

    const onDragEnd = (result) => {
        setIsDragging(false);

        if (!result.destination) return;

        const { source, destination } = result;

        if (source.index === destination.index) return;

        // Reorder the category list
        const reordered = reorderList(sortedRows, source.index, destination.index);

        // Update the category list with new order
        setCategoryList(reordered);

        // Extract the ordered IDs
        const orderedIds = reordered.map((item) => item._id);
        setPendingOrderIds(orderedIds);
        setHasOrderChanges(true);
    };

    const handleSaveOrder = async () => {
        if (!pendingOrderIds.length) return;

        try {
            setLoading(true);
            const payload = {
                parentId: queryId || null,
                orderedIds: pendingOrderIds,
            };

            const res = await ApiService.patch(
                apiEndpoints.reorderAdminCategory,
                payload,
                auth_key
            );

            if (res.status === 200) {
                setHasOrderChanges(false);
                setPendingOrderIds([]);
                getCategoryList();
            }
        } catch (error) {
            handleOpen("error", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ margin: "30px" }}>
            {queryId ? (
                <Box sx={{ py: "16px", marginBottom: "20px" }} component={Paper}>
                    <Stack sx={{ ml: "24px", mb: "12px" }} gap={1} direction={"row"}>
                        <AppsIcon />
                        <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Go To</Typography>
                    </Stack>
                    <Divider />
                    <Box sx={{ ml: "24px", mt: "16px" }}>
                        <Button
                            onClick={() => navigate(ROUTE_CONSTANT.catalog.adminCategory.list)}
                            startIcon={<AppsIcon />}
                            variant="contained"
                        >
                            Admin Categories
                        </Button>
                    </Box>
                </Box>
            ) : (
                <Box sx={{ py: "16px", marginBottom: "20px" }} component={Paper}>
                    <Stack sx={{ ml: "24px", mb: "12px" }} gap={1} direction={"row"}>
                        <AppsIcon />
                        <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Go To</Typography>
                    </Stack>
                    <Divider />
                    <Box sx={{ ml: "24px", mt: "16px" }}>
                        <Button
                            onClick={() => navigate(ROUTE_CONSTANT.dashboard)}
                            startIcon={<AppsIcon />}
                            variant="contained"
                        >
                            Dashboard
                        </Button>
                    </Box>
                </Box>
            )}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 2
                }}
                className="breadcrumb"
            >
                <Breadcrumb routeSegments={[{ name: "Catalog", path: "" }, { name: "Admin Category" }]} />
                <Box display={"flex"} gap={"16px"} alignItems={"center"}>
                    <Box>
                        <TextField
                            size="small"
                            type="text"
                            label="Search Admin Categories"
                            onChange={handleSearch}
                            value={search}
                            placeholder="Search by title..."
                        />
                    </Box>
                    <Link
                        to={ROUTE_CONSTANT.catalog.adminCategory.add}
                    >
                        <Button variant="contained"
                            sx={{ whiteSpace: "nowrap" }}
                        >
                            Add Admin Category
                        </Button>
                    </Link>
                    <Button
                        onClick={() => navigate(ROUTE_CONSTANT.catalog.adminCategory.all)}
                        variant="outlined"
                        component={Card}
                        sx={{
                            border: "2px solid",
                            borderWidth: 2,
                            "&:hover": {
                                borderWidth: 2,
                            }, whiteSpace: "nowrap"
                        }}
                    >
                        All Admin Categories
                    </Button>
                </Box>
            </Box>

            <Box>
                <TableContainer component={Paper} sx={{ overflow: 'visible' }}>
                    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                        <Table
                            sx={{
                                width: 'auto',
                                minWidth: '100%',
                                maxWidth: 'max-content',
                                '.MuiTableCell-root': {
                                    padding: "12px 5px"
                                }
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        Drag
                                    </TableCell>
                                    <TableCell>
                                        Admin Category
                                    </TableCell>
                                    {!personName?.includes("Status") && (
                                        <TableCell sortDirection={orderBy === "status" ? order : false}>
                                            <TableSortLabel
                                                active={orderBy === "status"}
                                                direction={orderBy === "status" ? order : "asc"}
                                                onClick={() => handleRequestSort("status")}
                                            >
                                                Status
                                            </TableSortLabel>
                                        </TableCell>
                                    )}
                                    {!personName?.includes("Popular") && (
                                        <TableCell sortDirection={orderBy === "popular" ? order : false}>
                                            <TableSortLabel
                                                active={orderBy === "popular"}
                                                direction={orderBy === "popular" ? order : "asc"}
                                                onClick={() => handleRequestSort("popular")}
                                            >
                                                Popular
                                            </TableSortLabel>
                                        </TableCell>
                                    )}
                                    {!personName?.includes("Special") && (
                                        <TableCell sortDirection={orderBy === "special" ? order : false}>
                                            <TableSortLabel
                                                active={orderBy === "special"}
                                                direction={orderBy === "special" ? order : "asc"}
                                                onClick={() => handleRequestSort("special")}
                                            >
                                                Special
                                            </TableSortLabel>
                                        </TableCell>
                                    )}
                                    {!personName?.includes("Menu Item") && (
                                        <TableCell sortDirection={orderBy === "menuStatus" ? order : false}>
                                            <TableSortLabel
                                                active={orderBy === "menuStatus"}
                                                direction={orderBy === "menuStatus" ? order : "asc"}
                                                onClick={() => handleRequestSort("menuStatus")}
                                            >
                                                Menu Item
                                            </TableSortLabel>
                                        </TableCell>
                                    )}
                                    {!personName?.includes("Action") && <TableCell>Action</TableCell>}
                                </TableRow>
                            </TableHead>
                            <Droppable droppableId="adminCategoryList" type="adminCategoryList">
                                {(provided) => (
                                    <TableBody
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={9} sx={{ textAlign: "center" }}>
                                                    <CircularProgress />
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            <>
                                                {sortedRows?.length > 0 ? (
                                                    sortedRows.map((row, i) => (
                                                        <Draggable
                                                            key={row._id}
                                                            draggableId={row._id.toString()}
                                                            index={i}
                                                            isDragDisabled={loading}
                                                        >
                                                            {(provided, snapshot) => (
                                                                <TableRow
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    sx={{
                                                                        ...provided.draggableProps.style,
                                                                        backgroundColor: snapshot.isDragging ? 'rgba(51, 138, 224, 0.1)' : 'inherit',
                                                                        borderBottom: snapshot.isDragging ? '2px dashed rgb(51, 138, 224)' : 'inherit',
                                                                    }}
                                                                >
                                                                    <TableCell
                                                                        {...provided.dragHandleProps}
                                                                        sx={{ cursor: "grab" }}
                                                                    >
                                                                        <DragIndicatorIcon color="disabled" />
                                                                    </TableCell>
                                                                    <TableCell
                                                                        sx={{ '&:hover': { color: 'primary.main' } }}
                                                                        component={Link}
                                                                        to={`${ROUTE_CONSTANT.catalog.adminCategory.list}?id=${row?._id}`}
                                                                    >
                                                                        {row?.title}
                                                                    </TableCell>

                                                                    {/* ... keep the rest of the cells EXACTLY the same ... */}
                                                                    {!personName?.includes("Status") && (
                                                                        <TableCell>
                                                                            <Switch
                                                                                onClick={() => {
                                                                                    handleOpen("adminCatStatus");
                                                                                    setStatusData(() => ({ id: row?._id, status: !row.status }));
                                                                                }}
                                                                                checked={row.status}
                                                                            />
                                                                        </TableCell>
                                                                    )}
                                                                    {!personName?.includes("Popular") && (
                                                                        <TableCell>
                                                                            <Switch
                                                                                onClick={() => {
                                                                                    handleOpen("adminCatPopularStatus");
                                                                                    setStatusData(() => ({ id: row?._id, popular: !row.popular }));
                                                                                }}
                                                                                checked={row?.popular}
                                                                            />
                                                                        </TableCell>
                                                                    )}
                                                                    {!personName?.includes("Special") && (
                                                                        <TableCell>
                                                                            <Switch
                                                                                onClick={() => {
                                                                                    handleOpen("adminSpecialCatStatus");
                                                                                    setStatusData(() => ({ id: row?._id, special: !row.special }));
                                                                                }}
                                                                                checked={row?.special}
                                                                            />
                                                                        </TableCell>
                                                                    )}
                                                                    {!personName?.includes("Menu Item") && (
                                                                        <TableCell>
                                                                            <Switch
                                                                                onClick={() => {
                                                                                    handleOpen("adminMenuItemStatus");
                                                                                    setStatusData(() => ({ id: row?._id, menuStatus: !row.menuStatus }));
                                                                                }}
                                                                                checked={row?.menuStatus}
                                                                            />
                                                                        </TableCell>
                                                                    )}
                                                                    {!personName?.includes("Action") && (
                                                                        <TableCell>
                                                                            <Link
                                                                                to={`${ROUTE_CONSTANT.catalog.adminCategory.add}?id=${row._id}`}
                                                                            >
                                                                                <Icon color="primary">edit</Icon>
                                                                            </Link>{" "}
                                                                        </TableCell>
                                                                    )}
                                                                </TableRow>
                                                            )}
                                                        </Draggable>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={8} sx={{ textAlign: "center" }}>
                                                            No admin categories found
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </>
                                        )}
                                        {provided.placeholder}
                                    </TableBody>
                                )}
                            </Droppable>
                        </Table>
                    </DragDropContext>
                </TableContainer>
                <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
                    {hasOrderChanges && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSaveOrder}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : null}
                        >
                            Update Order
                        </Button>
                    )}
                    <TablePagination
                        rowsPerPageOptions={[25, 50, 75, 100, 200]}
                        component="div"
                        count={pagination.total}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        disabled={loading}
                        sx={{ ml: "auto" }}
                    />
                </Box>
            </Box>
            <ConfirmModal
                open={open}
                handleClose={handleClose}
                type={type}
                msg={msg}
                handleStatusChange={handleStatusChange}
                handleFeaturedStatusChange={handlePopularStatusChange}
                handleSpecialCatStatusChange={handleSpecialCatStatusChange}
                handleFour={handleMenuItemStatusChange}
            />
        </Box>
    );
};

export default CategoryList;
