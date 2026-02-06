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
    CircularProgress
} from "@mui/material";
import { Icon } from "@mui/material";
import Switch from "@mui/material/Switch";
import { Link, useNavigate } from "react-router-dom";
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
import Checkbox from "@mui/material/Checkbox";
import debounce from "lodash.debounce";

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

const names = ["Tags", "Status", "Popular", "Special", "Menu Item", "Action"];

// Sorting options for admin category column
const SORTING_OPTIONS = [
    { value: { sortBy: 'parent', order: 1 }, label: 'Admin Category (A to Z)' },
    { value: { sortBy: 'parent', order: -1 }, label: 'Admin Category (Z to A)' },
    { value: { sortBy: 'createdAt', order: -1 }, label: 'Date Created (New to Old)' },
    { value: { sortBy: 'createdAt', order: 1 }, label: 'Date Created (Old to New)' },
    { value: { sortBy: 'updatedAt', order: -1 }, label: 'Last Updated' },
];

const List = () => {
    // State management
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
    const [orderBy, setOrderBy] = useState(null);
    const [serverSorting, setServerSorting] = useState({ sortBy: "parent", order: 1 });

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
            if (debouncedSearch.trim()) {
                params.append('search', debouncedSearch.trim());
            }

            // Add server-side sorting if provided
            if (serverSorting.sortBy) {
                params.append('sort', JSON.stringify({
                    [serverSorting.sortBy]: serverSorting.order
                }));
            }

            const url = `${apiEndpoints.getAdminCategory}?${params.toString()}`;
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
    }, [auth_key, debouncedSearch, serverSorting, page, rowsPerPage]);

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

    // Server-side sorting handler
    const handleServerSortingChange = (e) => {
        const newSorting = e.target.value ? JSON.parse(e.target.value) : { sortBy: '', order: 1 };
        setServerSorting(newSorting);
        setPage(0); // Reset to first page when sorting changes
    };

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

    const Container = styled("div")(({ theme }) => ({
        margin: "30px",
        [theme.breakpoints.down("sm")]: { margin: "16px" },
        "& .breadcrumb": {
            marginBottom: "30px",
            [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
        }
    }));

    return (
        <Box sx={{ margin: "30px" }}>
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
                    {/* Server-side Sorting Filter */}
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Sort Admin Category</InputLabel>
                        <Select
                            value={JSON.stringify(serverSorting)}
                            label="Sort Admin Category"
                            onChange={handleServerSortingChange}
                            renderValue={(selected) => {
                                const selectedSorting = JSON.parse(selected);
                                const option = SORTING_OPTIONS.find(opt =>
                                    opt.value.sortBy === selectedSorting.sortBy &&
                                    opt.value.order === selectedSorting.order
                                );
                                return option ? option.label : 'Custom Sort';
                            }}
                        >
                            {SORTING_OPTIONS.map((option, index) => (
                                <MenuItem
                                    key={index}
                                    value={JSON.stringify(option.value)}
                                >
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box>
                        <FormControl
                            sx={{
                                width: 300,
                                "& .MuiOutlinedInput-root": {
                                    height: "38px"
                                },
                                "& .MuiFormLabel-root": {
                                    top: "-7px"
                                }
                            }}
                        >
                            <InputLabel id="demo-multiple-checkbox-label">Preference: Columns hidden</InputLabel>
                            <Select
                                labelId="demo-multiple-checkbox-label"
                                id="demo-multiple-checkbox"
                                multiple
                                value={personName}
                                onChange={handleChange}
                                input={<OutlinedInput label="Preference: Columns hidden" />}
                                renderValue={(selected) => `${selected.length} columns hidden`}
                                MenuProps={MenuProps}
                            >
                                {names.map((name) => (
                                    <MenuItem key={name} value={name}>
                                        <Checkbox checked={personName.indexOf(name) > -1} />
                                        <ListItemText primary={name} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
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
                            sx={{ whiteSpace: "nowrap", width: "180px", minWidth: "120px" }}>
                            Add Admin Category
                        </Button>
                    </Link>

                    <Button onClick={() => exportToExcel(excelData)} variant="contained" sx={{ whiteSpace: "nowrap", width: "180px", minWidth: "120px" }}>
                        Export Categories
                    </Button>
                </Box>
            </Box>

            <Box>
                <TableContainer sx={{ paddingLeft: 2, paddingRight: 2 }} component={Paper}>
                    <Table
                        sx={{
                            width: 'auto',
                            minWidth: {
                                xl: '100%',
                                lg: '100%',
                                md: 'max-content',
                                sm: 'max-content',
                                xs: 'max-content'
                            },
                            maxWidth: {
                                xl: 'max-content',
                                lg: 'max-content',
                                md: 'auto',
                                sm: 'auto',
                                xs: 'auto'
                            },
                            '.MuiTableCell-root': {
                                padding: "12px 5px"
                            }
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell sortDirection={orderBy === "S.No" ? order : false}>
                                    <TableSortLabel
                                        active={orderBy === "S.No"}
                                        direction={orderBy === "S.No" ? order : "asc"}
                                        onClick={() => handleRequestSort("S.No")}
                                    >
                                        S.No
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    Admin Category
                                </TableCell>
                                {!personName?.includes("Tags") && (
                                    <TableCell sortDirection={orderBy === "tag" ? order : false}>
                                        <TableSortLabel
                                            active={orderBy === "tag"}
                                            direction={orderBy === "tag" ? order : "asc"}
                                            onClick={() => handleRequestSort("tag")}
                                        >
                                            Tags
                                        </TableSortLabel>
                                    </TableCell>
                                )}
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
                        <TableBody>
                            {
                                loading ? (
                                    <TableRow>
                                        <TableCell colSpan={9} sx={{ textAlign: "center" }}>
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <>
                                        {
                                            sortedRows?.length > 0 ? (
                                                <>
                                                    {
                                                        sortedRows.map((row, i) => {
                                                            return (
                                                                <TableRow key={row._id}>
                                                                    <TableCell>{row["S.No"]}</TableCell>
                                                                    <TableCell sx={{ wordBreak: "break-word" }}>{row?.parent}</TableCell>
                                                                    {!personName?.includes("Tags") && (
                                                                        <TableCell>
                                                                            {row?.tag?.map((tag, index) => (
                                                                                <span key={index}>
                                                                                    {tag}
                                                                                    {index < row.tag.length - 1 ? ", " : ""}
                                                                                </span>
                                                                            ))}
                                                                        </TableCell>
                                                                    )}
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
                                                            );
                                                        })
                                                    }
                                                </>
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={8} sx={{ textAlign: "center" }}>
                                                        {loading ? 'Loading admin categories...' : 'No admin categories found'}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        }
                                    </>
                                )
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[25, 50, 75, 100, 200]}
                    component="div"
                    count={pagination.total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    disabled={loading}
                />
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

export default List;
