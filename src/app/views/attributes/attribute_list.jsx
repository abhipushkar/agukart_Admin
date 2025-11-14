import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    TextField,
    Switch,
    IconButton,
    Breadcrumbs,
    Link,
    CircularProgress,
    Divider,
    Stack,
    TablePagination,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Home as HomeIcon,
    List as ListIcon,
    Apps as AppsIcon
} from "@mui/icons-material";
import { ROUTE_CONSTANT } from "../../constant/routeContanst";
import { ApiService } from "../../services/ApiService";
import ConfirmModal from "../../components/ConfirmModal";
import debounce from "lodash.debounce";

// Sorting options
const SORTING_OPTIONS = [
    { value: { sortBy: 'name', order: 1 }, label: 'Name (A to Z)' },
    { value: { sortBy: 'name', order: -1 }, label: 'Name (Z to A)' },
    { value: { sortBy: 'createdAt', order: -1 }, label: 'Date Created (New to Old)' },
    { value: { sortBy: 'createdAt', order: 1 }, label: 'Date Created (Old to New)' },
    { value: { sortBy: 'updatedAt', order: -1 }, label: 'Last Updated' },
];

const AttributesList = () => {
    // State management
    const [attributes, setAttributes] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedAttribute, setSelectedAttribute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [apiLoading, setApiLoading] = useState(false);

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    // Sorting state
    const [sorting, setSorting] = useState({ sortBy: "createdAt", order: -1 });

    // UI state
    const navigate = useNavigate();
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        type: "",
        msg: "",
        onConfirm: null
    });

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

    // Handle search with debouncing
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        debounceRef.current(value);
    };

    // Fetch attributes
    const fetchAttributes = useCallback(async () => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem("auth_key");

            // Build query parameters
            const params = new URLSearchParams({
                page: (page + 1).toString(),
                limit: rowsPerPage.toString(),
            });

            // Add search if provided
            if (debouncedSearch.trim()) {
                params.append('search', debouncedSearch.trim());
            }

            // Add sorting if provided
            if (sorting.sortBy) {
                params.append('sort', JSON.stringify({
                    [sorting.sortBy]: sorting.order
                }));
            }

            const url = `get-attribute-list?${params.toString()}`;
            const response = await ApiService.get(url, accessToken);

            if (response.data.success) {
                const attributesData = response.data.data || [];
                const pagination = response.data.pagination || {};

                // Add serial numbers based on current page
                const attributesWithSerial = attributesData.map((attr, index) => ({
                    ...attr,
                    serialNumber: (page * rowsPerPage) + index + 1
                }));

                setAttributes(attributesWithSerial);
                setTotalCount(pagination.total || attributesData.length || 0);
            } else {
                console.error("Failed to fetch attributes:", response.data.message);
                setAttributes([]);
                setTotalCount(0);
                showConfirmModal("error", "Failed to fetch attributes");
            }
        } catch (error) {
            console.error("Error fetching attributes:", error);
            showConfirmModal("error", "Error fetching attributes. Please try again.");
            setAttributes([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, sorting, page, rowsPerPage]);

    // Fetch data when dependencies change
    useEffect(() => {
        fetchAttributes();
    }, [fetchAttributes]);

    // Confirm modal handlers
    const showConfirmModal = (type, msg, onConfirm) => {
        setConfirmModal({
            open: true,
            type,
            msg,
            onConfirm
        });
    };

    const closeConfirmModal = () => {
        setConfirmModal({
            open: false,
            type: "",
            msg: "",
            onConfirm: null
        });
    };

    const handleConfirm = () => {
        if (confirmModal.onConfirm) {
            confirmModal.onConfirm();
        }
        closeConfirmModal();
    };

    // Status change handlers
    const handleStatusChange = async (id) => {
        setApiLoading(true);
        try {
            const accessToken = localStorage.getItem("auth_key");
            const attribute = attributes.find(attr => attr._id === id);

            const response = await ApiService.post(
                `update-attribute-list/${id}`,
                { ...attribute, status: !attribute.status },
                accessToken
            );

            if (response.data.success) {
                // Refresh the list to get updated data from server
                await fetchAttributes();
            } else {
                showConfirmModal("error", "Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            showConfirmModal("error", "Error updating status");
        } finally {
            setApiLoading(false);
        }
    };

    const handleViewOnProductChange = async (id) => {
        setApiLoading(true);
        try {
            const accessToken = localStorage.getItem("auth_key");
            const attribute = attributes.find(attr => attr._id === id);

            const response = await ApiService.post(
                `update-attribute-list/${id}`,
                { ...attribute, viewOnProductPage: !attribute.viewOnProductPage },
                accessToken
            );

            if (response.data.success) {
                // Refresh the list to get updated data from server
                await fetchAttributes();
            } else {
                showConfirmModal("error", "Failed to update view on product page setting");
            }
        } catch (error) {
            console.error("Error updating view on product page:", error);
            showConfirmModal("error", "Error updating view on product page setting");
        } finally {
            setApiLoading(false);
        }
    };

    const handleViewInFiltersChange = async (id) => {
        setApiLoading(true);
        try {
            const accessToken = localStorage.getItem("auth_key");
            const attribute = attributes.find(attr => attr._id === id);

            const response = await ApiService.post(
                `update-attribute-list/${id}`,
                { ...attribute, viewInFilters: !attribute.viewInFilters },
                accessToken
            );

            if (response.data.success) {
                // Refresh the list to get updated data from server
                await fetchAttributes();
            } else {
                showConfirmModal("error", "Failed to update view in filters setting");
            }
        } catch (error) {
            console.error("Error updating view in filters:", error);
            showConfirmModal("error", "Error updating view in filters setting");
        } finally {
            setApiLoading(false);
        }
    };

    // Delete handlers
    const handleDeleteClick = (attribute) => {
        try {
            setSelectedAttribute(attribute);
            showConfirmModal(
                "warning",
                `Are you sure you want to delete the attribute "${attribute.name}"?`,
                handleDeleteConfirm
            );
        } catch (e) {
            showConfirmModal("error", e.message);
        }
    };

    const handleDeleteConfirm = async () => {
        setApiLoading(true);
        try {
            const accessToken = localStorage.getItem("auth_key");

            const response = await ApiService.delete(
                `delete-attribute-list/${selectedAttribute._id}`,
                accessToken
            );

            if (response.data.success) {
                // Refresh the list to get updated data from server
                await fetchAttributes();
                setSelectedAttribute(null);
                showConfirmModal("success", "Attribute deleted successfully!");
            } else {
                showConfirmModal("error", "Failed to delete attribute");
            }
        } catch (error) {
            console.error("Error deleting attribute:", error);
            showConfirmModal("error", "Error deleting attribute");
        } finally {
            setApiLoading(false);
        }
    };

    // Edit handler
    const handleEdit = (id) => {
        navigate(`${ROUTE_CONSTANT.catalog.attribute.add}?id=${id}`);
    };

    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    // Sorting handler
    const handleSortingChange = (e) => {
        const newSorting = e.target.value ? JSON.parse(e.target.value) : { sortBy: '', order: 1 };
        setSorting(newSorting);
        setPage(0);
    };

    // Export handler
    const handleExport = () => {
        // Implement export functionality here
        console.log("Export functionality to be implemented");
    };

    if (loading && attributes.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link color="inherit" href="#" sx={{ display: 'flex', alignItems: 'center' }}>
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Home
                </Link>
                <Link color="inherit" href="#" sx={{ display: 'flex', alignItems: 'center' }}>
                    <ListIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Attributes
                </Link>
                <Typography color="text.primary">Attributes List</Typography>
            </Breadcrumbs>

            <Box sx={{ py: "16px", marginBottom: "20px" }} component={Paper}>
                <Stack sx={{ ml: "24px", mb: "12px" }} gap={1} direction={"row"}>
                    <AppsIcon />
                    <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Go To</Typography>
                </Stack>
                <Divider />
                <Box sx={{ ml: "24px", mt: "16px" }}>
                    <Button
                        onClick={() => navigate("/")}
                        startIcon={<AppsIcon />}
                        variant="contained"
                    >
                        Dashboard
                    </Button>
                </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4">Attributes List</Typography>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
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

                    {/* Search */}
                    <TextField
                        size="small"
                        label="Search Attributes"
                        value={search}
                        onChange={handleSearch}
                        disabled={apiLoading}
                        placeholder="Search by name..."
                    />

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate(ROUTE_CONSTANT.catalog.attribute.add)}
                        disabled={apiLoading}
                    >
                        Add Attribute
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleExport}
                        disabled={apiLoading || attributes.length === 0}
                    >
                        Export Attributes
                    </Button>
                </Box>
            </Box>

            {/* Loading indicator */}
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
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>S.No</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>View on Product Page</TableCell>
                                <TableCell>View in Filters</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attributes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        {loading ? 'Loading attributes...' : 'No attributes found'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                attributes.map((attr) => (
                                    <TableRow key={attr._id}>
                                        <TableCell>{attr.serialNumber}</TableCell>
                                        <TableCell>{attr.name}</TableCell>
                                        <TableCell>{attr.type}</TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={attr.status}
                                                onChange={() => handleStatusChange(attr._id)}
                                                disabled={apiLoading}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={attr.viewOnProductPage}
                                                onChange={() => handleViewOnProductChange(attr._id)}
                                                disabled={apiLoading}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={attr.viewInFilters}
                                                onChange={() => handleViewInFiltersChange(attr._id)}
                                                disabled={apiLoading}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => handleEdit(attr._id)}
                                                color="primary"
                                                disabled={apiLoading}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleDeleteClick(attr)}
                                                color="error"
                                                disabled={apiLoading}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                <TablePagination
                    rowsPerPageOptions={[25, 50, 75, 100]}
                    component="div"
                    count={totalCount} // Changed from attributes.length to totalCount
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    disabled={loading || apiLoading}
                />
            </Box>

            {/* Confirm Modal */}
            <ConfirmModal
                open={confirmModal.open}
                handleClose={closeConfirmModal}
                onConfirm={handleConfirm}
                type={confirmModal.type}
                msg={confirmModal.msg}
            />
        </Box>
    );
};

export default AttributesList;
