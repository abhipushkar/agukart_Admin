import styled from "@emotion/styled";
import { Breadcrumb } from "app/components";
import { Icon, TablePagination, TextField, CircularProgress, TableContainer, Link } from "@mui/material";
import { useState, useEffect, useCallback, useRef } from "react";
import {
    Box,
    Button,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import React from "react";
import Switch from "@mui/material/Switch";
import { useNavigate } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { exportToExcel } from "app/utils/excelExport";
import { toast } from "react-toastify";
import OutlinedInput from "@mui/material/OutlinedInput";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import ConfirmModal from "app/components/ConfirmModal";
import debounce from "lodash.debounce";

const Container = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
        marginBottom: "30px",
        [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
    }
}));

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

const COLUMN_OPTIONS = ["Display Layout", "Short Order", "Status", "Categories", "Product", "Action"];

const SORTING_OPTIONS = [
    { value: { sortBy: 'variant_name', order: 1 }, label: 'Name (A to Z)' },
    { value: { sortBy: 'variant_name', order: -1 }, label: 'Name (Z to A)' },
    { value: { sortBy: 'createdAt', order: -1 }, label: 'Date Created (New to Old)' },
    { value: { sortBy: 'createdAt', order: 1 }, label: 'Date Created (Old to New)' },
    { value: { sortBy: 'updatedAt', order: -1 }, label: 'Last Updated' },
];

const VariantList = () => {
    const navigate = useNavigate();
    const auth_key = localStorage.getItem(localStorageKey.auth_key);

    // State management
    const [rowsPerPage, setRowsPerPage] = useState(200);
    const [page, setPage] = useState(0);
    const [allVariants, setAllVariants] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [variant_id, setVariantId] = useState("");
    const [personName, setPersonName] = useState(
        JSON.parse(localStorage.getItem(localStorageKey.variantTable)) || []
    );
    const [open, setOpen] = useState(false);
    const [type, setType] = useState("");
    const [route, setRoute] = useState(null);
    const [msg, setMsg] = useState(null);
    const [sorting, setSorting] = useState({ sortBy: "variant_name", order: 1 });
    const [loading, setLoading] = useState(false);
    const [updatingIds, setUpdatingIds] = useState(new Set());
    const [excelData, setExcelData] = useState([]);

    // Refs
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

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        debounceRef.current(value);
    };

    const logOut = () => {
        localStorage.removeItem(localStorageKey.auth_key);
        localStorage.removeItem(localStorageKey.designation_id);
        localStorage.removeItem(localStorageKey.vendorId);
        setRoute(ROUTE_CONSTANT.login);
    };

    const handleOpen = (type, msg) => {
        setMsg(msg?.message);
        setOpen(true);
        setType(type);
        if (msg?.response?.status === 401) {
            logOut();
        }
    };

    const handleClose = () => {
        setOpen(false);
        setMsg(null);
        if (route) {
            navigate(route);
            setRoute(null);
        }
    };

    const handleColumnPreferenceChange = (event) => {
        const value = event.target.value;
        const newPersonName = typeof value === "string" ? value.split(",") : value;
        setPersonName(newPersonName);
        localStorage.setItem(localStorageKey.variantTable, JSON.stringify(newPersonName));
        if (newPersonName.length <= 0) {
            localStorage.removeItem(localStorageKey.variantTable);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    // Get variant list - stable function that doesn't change often
    const getVariantList = useCallback(async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams({
                page: (page + 1).toString(),
                limit: rowsPerPage.toString(),
            });

            if (debouncedSearch.trim()) {
                params.append('search', debouncedSearch.trim());
            }

            if (sorting.sortBy) {
                params.append('sort', JSON.stringify({
                    [sorting.sortBy]: sorting.order
                }));
            }

            const url = `${apiEndpoints.getVariant}?${params.toString()}`;
            const res = await ApiService.get(url, auth_key);

            if (res.status === 200) {
                const variants = res?.data?.data || [];
                const pagination = res?.data?.pagination || {};

                const myNewList = variants.map((e, i) => {
                    const serialNumber = (page * rowsPerPage) + i + 1;
                    return { "S.No": serialNumber, ...e };
                });

                const newExcelData = myNewList?.map((e, i) => ({
                    "S.NO": (page * rowsPerPage) + i + 1,
                    title: e.title,
                    status: e.status ? "Active" : "In Active"
                })) || [];

                setAllVariants(myNewList || []);
                setTotalCount(pagination.total || variants.length || 0);
                setExcelData(newExcelData);
            }
        } catch (error) {
            handleOpen("error", error);
        } finally {
            setLoading(false);
        }
    }, [auth_key, debouncedSearch, sorting, page, rowsPerPage]);

    // Effect to trigger API call when dependencies change
    useEffect(() => {
        getVariantList();
    }, [getVariantList]);

    const handleDelete = useCallback(async () => {
        if (!variant_id) return;

        try {
            const res = await ApiService.delete(`${apiEndpoints.deleteVariant}/${variant_id}`, auth_key);
            if (res.status === 200) {
                getVariantList();
                toast.success(res?.data?.message);
                setOpen(false);
                setVariantId("");
            }
        } catch (error) {
            handleOpen("error", error);
        }
    }, [auth_key, getVariantList, variant_id]);

    // Generic toggle function for status changes
    const toggleStatus = useCallback(async (row, statusType, endpoint) => {
        const id = row._id;
        setUpdatingIds(prev => new Set(prev).add(id));

        try {
            const payload = {
                id,
                status: !row[statusType]
            };

            const res = await ApiService.post(endpoint, payload, auth_key);
            if (res.status === 200) {
                await getVariantList();
                toast.success(`Status updated successfully`);
            }
        } catch (error) {
            handleOpen("error", error);
        } finally {
            setUpdatingIds(prev => {
                const newUpdatingIds = new Set(prev);
                newUpdatingIds.delete(id);
                return newUpdatingIds;
            });
        }
    }, [auth_key, getVariantList]);

    // Specific toggle handlers
    const changeVariantStatus = useCallback((row) =>
        toggleStatus(row, 'status', apiEndpoints.changeStatusVariant), [toggleStatus]);

    const changeVariantCateStatus = useCallback((row) =>
        toggleStatus(row, 'category_status', apiEndpoints.changeStatusVariantCategory), [toggleStatus]);

    const changeVariantProductStatus = useCallback((row) =>
        toggleStatus(row, 'product_status', apiEndpoints.changeStatusVariantProduct), [toggleStatus]);

    const handleSortingChange = (e) => {
        const newSorting = e.target.value ? JSON.parse(e.target.value) : { sortBy: '', order: 1 };
        setSorting(newSorting);
        setPage(0);
    };

    const handleExport = () => {
        if (excelData.length === 0) {
            toast.warning("No data to export");
            return;
        }
        exportToExcel(excelData, 'variants.xlsx');
        toast.success(`Exported ${excelData.length} variants successfully`);
    };

    const isUpdating = (id) => updatingIds.has(id);

    return (
        <Container>
            <Box
                sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                className="breadcrumb"
            >
                <Breadcrumb routeSegments={[{ name: "Variant", path: "" }, { name: "Variant List" }]} />
                <Box display={"flex"} gap={"16px"} alignItems={"center"}>
                    {/* Sorting Filter */}
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={JSON.stringify(sorting)}
                            label="Sort By"
                            onChange={handleSortingChange}
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

                    {/* Column Preferences */}
                    <FormControl
                        sx={{
                            width: 300,
                            "& .MuiOutlinedInput-root": { height: "38px" },
                            "& .MuiFormLabel-root": { top: "-7px" }
                        }}
                    >
                        <InputLabel id="column-preference-label">Columns Hidden</InputLabel>
                        <Select
                            labelId="column-preference-label"
                            multiple
                            value={personName}
                            onChange={handleColumnPreferenceChange}
                            input={<OutlinedInput label="Columns Hidden" />}
                            renderValue={(selected) => `${selected.length} columns hidden`}
                            MenuProps={MenuProps}
                        >
                            {COLUMN_OPTIONS.map((name) => (
                                <MenuItem key={name} value={name}>
                                    <Checkbox checked={personName.includes(name)} />
                                    <ListItemText primary={name} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Search */}
                    <TextField
                        size="small"
                        label="Search Variants"
                        onChange={handleSearchChange}
                        value={search}
                        type="text"
                        placeholder="Search by name..."
                    />

                    {/* Action Buttons */}
                    <Link href={`${ROUTE_CONSTANT.catalog.variant.add}`}>
                        <Button
                            variant="contained"
                            sx={{ whiteSpace: "nowrap", width: "180px", minWidth: "120px" }}
                        >
                            Add Variant
                        </Button>
                    </Link>

                    <Button
                        onClick={handleExport}
                        variant="contained"
                        sx={{ whiteSpace: "nowrap", width: "180px", minWidth: "120px" }}
                        disabled={excelData.length === 0}
                    >
                        Export Variants
                    </Button>
                </Box>
            </Box>

            {/* Loading Overlay */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress />
                </Box>
            )}

            <Box sx={{ position: 'relative' }}>
                <TableContainer
                    sx={{
                        paddingLeft: 2,
                        paddingRight: 2,
                        opacity: loading ? 0.6 : 1,
                        transition: 'opacity 0.3s ease'
                    }}
                    component={Paper}
                >
                    <Table
                        sx={{
                            width: "max-content",
                            minWidth: "100%",
                            '.MuiTableCell-root': { padding: '12px 5px' }
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell>S.No</TableCell>
                                <TableCell>Name</TableCell>
                                {!personName.includes("Display Layout") && <TableCell>Display Layout</TableCell>}
                                {!personName.includes("Status") && <TableCell>Status</TableCell>}
                                {!personName.includes("Categories") && <TableCell>Categories</TableCell>}
                                {!personName.includes("Product") && <TableCell>Product</TableCell>}
                                {!personName.includes("Action") &&
                                    <TableCell sx={{ textAlign: "center" }}>Action</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {allVariants.length > 0 ? (
                                allVariants.map((row) => (
                                    <TableRow key={row._id}>
                                        <TableCell>{row["S.No"]}</TableCell>
                                        <TableCell>{row.variant_name}</TableCell>

                                        {!personName.includes("Display Layout") && (
                                            <TableCell>
                                                {row.display_layout === 1
                                                    ? "Dropdown swatch"
                                                    : row.display_layout === 2
                                                        ? "Visual swatch"
                                                        : "Text swatch"}
                                            </TableCell>
                                        )}

                                        {!personName.includes("Status") && (
                                            <TableCell>
                                                <Box sx={{ position: 'relative' }}>
                                                    <Switch
                                                        onChange={() => changeVariantStatus(row)}
                                                        checked={row.status}
                                                        disabled={isUpdating(row._id)}
                                                    />
                                                    {isUpdating(row._id) && (
                                                        <CircularProgress
                                                            size={24}
                                                            sx={{
                                                                position: 'absolute',
                                                                top: '50%',
                                                                left: '50%',
                                                                marginTop: '-12px',
                                                                marginLeft: '-12px',
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </TableCell>
                                        )}

                                        {!personName.includes("Categories") && (
                                            <TableCell>
                                                <Box sx={{ position: 'relative' }}>
                                                    <Switch
                                                        onChange={() => changeVariantCateStatus(row)}
                                                        checked={row.category_status}
                                                        disabled={isUpdating(row._id)}
                                                    />
                                                    {isUpdating(row._id) && (
                                                        <CircularProgress
                                                            size={24}
                                                            sx={{
                                                                position: 'absolute',
                                                                top: '50%',
                                                                left: '50%',
                                                                marginTop: '-12px',
                                                                marginLeft: '-12px',
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </TableCell>
                                        )}

                                        {!personName.includes("Product") && (
                                            <TableCell>
                                                <Box sx={{ position: 'relative' }}>
                                                    <Switch
                                                        onChange={() => changeVariantProductStatus(row)}
                                                        checked={row.product_status}
                                                        disabled={isUpdating(row._id)}
                                                    />
                                                    {isUpdating(row._id) && (
                                                        <CircularProgress
                                                            size={24}
                                                            sx={{
                                                                position: 'absolute',
                                                                top: '50%',
                                                                left: '50%',
                                                                marginTop: '-12px',
                                                                marginLeft: '-12px',
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </TableCell>
                                        )}

                                        {!personName.includes("Action") && (
                                            <TableCell sx={{ textAlign: "center" }}>
                                                <IconButton
                                                    onClick={() => {
                                                        handleOpen("variantDelete");
                                                        setVariantId(row?._id);
                                                    }}
                                                    disabled={isUpdating(row._id)}
                                                >
                                                    <Icon sx={{ color: "#DC3545" }}>delete</Icon>
                                                </IconButton>
                                                <Link href={`${ROUTE_CONSTANT.catalog.variant.add}?id=${row._id}`}>
                                                    <IconButton
                                                        disabled={isUpdating(row._id)}
                                                    >
                                                        <Icon color="primary">edit</Icon>
                                                    </IconButton>
                                                </Link>

                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        {loading ? 'Loading variants...' : 'No variants found'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                <TablePagination
                    rowsPerPageOptions={[25, 50, 75, 100, 200]}
                    component="div"
                    count={totalCount}
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
                handleDelete={handleDelete}
                type={type}
                msg={msg}
            />
        </Container>
    );
};

export default VariantList;
