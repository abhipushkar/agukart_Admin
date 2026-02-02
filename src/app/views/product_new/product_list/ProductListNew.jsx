import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    RadioGroup,
    FormControlLabel,
    Radio,
    Checkbox,
    OutlinedInput,
    ListItemText,
    Typography,
    TablePagination,
    InputAdornment,
    IconButton,
    Menu,
    Paper, Link, styled
} from '@mui/material';
import {
    Breadcrumb,
    ConfirmModal
} from 'app/components';
import {
    Search as SearchIcon,
    Clear as ClearIcon,
    ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { exportToExcel } from 'app/utils/excelExport';
import { ROUTE_CONSTANT } from 'app/constant/routeContanst';
import { toast } from 'react-toastify';
import { useProductStore } from "../states/useProductStore";
import ProductTableNew from "./components/ProductTableNew";
import { localStorageKey } from "../../../constant/localStorageKey";
import Switch from "@mui/material/Switch";

const IOSSwitch = styled((props) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: 2,
        transitionDuration: '300ms',
        '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                backgroundColor: '#1976d2',
                opacity: 1,
                border: 0,
                ...theme.applyStyles('dark', {
                    backgroundColor: '#1976d2',
                }),
            },
            '&.Mui-disabled + .MuiSwitch-track': {
                opacity: 0.5,
            },
        },
        '&.Mui-focusVisible .MuiSwitch-thumb': {
            color: '#1976d2',
            border: '6px solid #fff',
        },
        '&.Mui-disabled .MuiSwitch-thumb': {
            color: theme.palette.grey[100],
            ...theme.applyStyles('dark', {
                color: theme.palette.grey[600],
            }),
        },
        '&.Mui-disabled + .MuiSwitch-track': {
            opacity: 0.7,
            ...theme.applyStyles('dark', {
                opacity: 0.3,
            }),
        },
    },
    '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        width: 22,
        height: 22,
    },
    '& .MuiSwitch-track': {
        borderRadius: 26 / 2,
        backgroundColor: '#E9E9EA',
        opacity: 1,
        transition: theme.transitions.create(['background-color'], {
            duration: 500,
        }),
        ...theme.applyStyles('dark', {
            backgroundColor: '#39393D',
        }),
    },
}));

const ProductListNew = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const SORTING_OPTIONS = [
        { value: { sortBy: 'product_title', order: 1 }, label: 'Title (A to Z)' },
        { value: { sortBy: 'product_title', order: -1 }, label: 'Title (Z to A)' },
        { value: { sortBy: 'sku_code', order: 1 }, label: 'SKU (A to Z)' },
        { value: { sortBy: 'sku_code', order: -1 }, label: 'SKU (Z to A)' },
        { value: { sortBy: 'createdAt', order: -1 }, label: 'Date Created (New to Old)' },
        { value: { sortBy: 'createdAt', order: 1 }, label: 'Date Created (Old to New)' },
        { value: { sortBy: 'updatedAt', order: -1 }, label: 'Last Updated' },
    ];

    // Zustand store
    const {
        products,
        filteredProducts,
        loading,
        filters,
        pagination,
        selection,
        fetchProducts,
        fetchProductsFirstTime,
        setFilters,
        setPagination,
        searchProducts,
        bulkUpdateStatus,
        selectAll,
        deselectAll,
        showFeaturedOnly,
        setShowFeaturedOnly,
        allActiveCategories,
        getAllActiveCategories,
    } = useProductStore();

    // Local state
    const [categories, setCategories] = useState([]);
    const [actionAnchorEl, setActionAnchorEl] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ open: false, type: '', message: '' });

    // Column options for hide/show
    const columnOptions = [
        'Status',
        'Image',
        'Featured',
        'Shop Name',
        'Product Id',
        'SKU',
        'Product Title',
        'Available',
        'Sale Price',
        'Sort Order',
        'Image Badge'
    ];

    // Get status of selected products
    const getSelectedProductsStatus = () => {
        if (selection.productIds.length === 0) return new Set();

        const selectedStatuses = new Set();

        // Check all products (including variations)
        products.forEach(product => {
            // Check main product
            if (selection.productIds.includes(product._id)) {
                selectedStatuses.add(product.status);
            }

            // Check variations
            if (product.productData && product.productData.length > 0) {
                product.productData.forEach(variation => {
                    if (selection.productIds.includes(variation._id)) {
                        selectedStatuses.add(variation.productStatus);
                    }
                });
            }
        });

        return selectedStatuses;
    };

    // Get available actions based on current filter status and selected products
    const getAvailableActions = () => {
        const { status } = filters;
        const selectedStatuses = getSelectedProductsStatus();

        // If no products selected, return empty array
        if (selection.productIds.length === 0) {
            return [];
        }

        // If we're in "all" filter, determine actions based on selected products' status
        if (status === 'all') {
            // If mixed statuses are selected, show only common actions
            if (selectedStatuses.size > 1) {
                return getCommonActionsForMixedStatus(selectedStatuses);
            }

            // If all selected products have the same status, show actions for that status
            const singleStatus = Array.from(selectedStatuses)[0];
            return getActionsForStatus(singleStatus);
        }

        // For specific status filters, use the predefined logic
        switch (status) {
            case 'active':
                return [
                    { key: 'inactive', label: 'Inactive' },
                    { key: 'delete', label: 'Delete' }
                ];
            case 'inactive':
                return [
                    { key: 'active', label: 'Active' },
                    { key: 'delete', label: 'Delete' }
                ];
            case 'sold-out':
                return [
                    { key: 'delete', label: 'Delete' }
                ];
            case 'draft':
                return [
                    { key: 'active', label: 'Active' },
                    { key: 'delete', label: 'Delete' }
                ];
            case 'delete':
                return [
                    { key: 'active', label: 'Active' },
                    { key: 'inactive', label: 'Inactive' }
                ];
            case 'deleteByAdmin':
                return [];
            default:
                return [];
        }
    };

    // Get actions for a specific status
    const getActionsForStatus = (status) => {
        switch (status) {
            case 'active':
                return [
                    { key: 'inactive', label: 'Inactive' },
                    { key: 'delete', label: 'Delete' }
                ];
            case 'inactive':
                return [
                    { key: 'active', label: 'Active' },
                    { key: 'delete', label: 'Delete' }
                ];
            case 'sold-out':
                return [
                    { key: 'delete', label: 'Delete' }
                ];
            case 'draft':
                return [
                    { key: 'active', label: 'Active' },
                    { key: 'delete', label: 'Delete' }
                ];
            case 'delete':
                return [
                    { key: 'active', label: 'Active' },
                    { key: 'inactive', label: 'Inactive' }
                ];
            case 'deleteByAdmin':
                return [];
            default:
                return [
                    { key: 'active', label: 'Active' },
                    { key: 'inactive', label: 'Inactive' },
                    { key: 'draft', label: 'Draft' },
                    { key: 'delete', label: 'Delete' }
                ];
        }
    };

    // Get common actions when multiple statuses are selected
    const getCommonActionsForMixedStatus = (selectedStatuses) => {
        const allPossibleActions = [
            { key: 'active', label: 'Active' },
            { key: 'inactive', label: 'Inactive' },
            { key: 'draft', label: 'Draft' },
            { key: 'delete', label: 'Delete' }
        ];

        // Filter actions that are valid for ALL selected statuses
        return allPossibleActions.filter(action => {
            return Array.from(selectedStatuses).every(status => {
                const statusActions = getActionsForStatus(status);
                return statusActions.some(sa => sa.key === action.key);
            });
        });
    };

    // Sync URL hash with status filter
    useEffect(() => {
        const hash = location.hash.replace('#', '');
        if (hash && ['all', 'active', 'inactive', 'sold-out', 'draft', 'delete', 'deleteByAdmin'].includes(hash)) {
            setFilters({ status: hash });
        }
    }, [location.hash]);

    // Update URL hash when status changes
    useEffect(() => {
        if (filters.status && filters.status !== 'all') {
            window.location.hash = filters.status;
        } else {
            window.location.hash = 'all';
        }

        deselectAll();
    }, [filters.status]);

    useEffect(() => {
        getAllActiveCategories();
    }, []);

    // Fetch initial data
    useEffect(() => {
        fetchProductsFirstTime();
        // getAllActiveCategories();
    }, [fetchProducts, filters.status, filters.category, filters.sorting, showFeaturedOnly, pagination.page, pagination.rowsPerPage]);

    // Handle status filter change with hash routing
    const handleStatusChange = (event) => {
        const newStatus = event.target.value;
        setFilters({ status: newStatus });
        setPagination({ page: 0 })

        // Update URL hash
        if (newStatus && newStatus !== 'all') {
            window.location.hash = newStatus;
        } else {
            window.location.hash = 'all';
        }
    };

    // Handle search
    const handleSearch = () => {
        searchProducts();
    };

    // Handle bulk actions
    const handleBulkAction = async (action) => {
        try {
            let result;
            switch (action) {
                case 'active':
                    result = await bulkUpdateStatus(true);
                    break;
                case 'inactive':
                    result = await bulkUpdateStatus(false);
                    break;
                case 'draft':
                    result = await bulkUpdateStatus('draft', true);
                    break;
                case 'delete':
                    result = await bulkUpdateStatus('delete', true);
                    break;
                default:
                    return;
            }

            if (result?.success) {
                toast.success(result.message || 'Action completed successfully');
                setActionAnchorEl(null);
            }
        } catch (error) {
            toast.error('Failed to perform bulk action');
        }
    };

    // Handle column visibility change
    const handleColumnVisibilityChange = (event) => {
        const value = event.target.value;
        setFilters({ hiddenColumns: value });
    };

    // Export in chunks for large datasets
    const handleExport = () => {
        const CHUNK_SIZE = 1000; // Export 1000 records at a time

        try {
            const allProducts = products
                .filter(product => product.type === 'product')
                .map(product => sanitizeProductData(product))
                .concat(
                    products
                        .filter(product => product.type === 'variations')
                        .flatMap(product => product.productData.map(item => sanitizeProductData(item)))
                );

            // If dataset is large, warn user
            if (allProducts.length > CHUNK_SIZE) {
                toast.warning(`Exporting ${allProducts.length} products. This may take a while.`);
            }

            // Export in chunks if needed
            for (let i = 0; i < allProducts.length; i += CHUNK_SIZE) {
                const chunk = allProducts.slice(i, i + CHUNK_SIZE);
                const fileName = i === 0 ? 'Products.xlsx' : `Products_Part_${i / CHUNK_SIZE + 1}.xlsx`;
                exportToExcel(chunk, fileName);
            }

            if (allProducts.length > CHUNK_SIZE) {
                toast.success(`Exported ${allProducts.length} products in multiple files.`);
            } else {
                toast.success(`Exported ${allProducts.length} products successfully.`);
            }

        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export products. Please try again with fewer records.');
        }
    };

    const sanitizeProductData = (product) => {
        const sanitized = { ...product };

        // Truncate long text fields to avoid Excel cell limits
        const textFields = [
            'description',
            'product_title',
            'title',
            'long_description',
            'specifications',
            'features'
        ];

        textFields.forEach(field => {
            if (sanitized[field] && typeof sanitized[field] === 'string' && sanitized[field].length > 32700) {
                // Truncate to 32700 characters and add ellipsis
                sanitized[field] = sanitized[field].substring(0, 32700) + '... [truncated]';
            }
        });

        // Handle nested objects that might contain long text
        if (sanitized.productData && Array.isArray(sanitized.productData)) {
            sanitized.productData = sanitized.productData.map(variation =>
                typeof variation === 'object' ? sanitizeProductData(variation) : variation
            );
        }

        // Remove any fields that are too complex for Excel
        delete sanitized.images; // Remove image arrays
        delete sanitized.variants; // Remove complex variant structures
        delete sanitized.combinations; // Remove combination data

        // Convert any remaining objects to strings if they're too complex
        Object.keys(sanitized).forEach(key => {
            if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
                try {
                    const stringified = JSON.stringify(sanitized[key]);
                    if (stringified.length > 32700) {
                        sanitized[key] = '[Complex Object - too large for Excel]';
                    } else {
                        sanitized[key] = stringified;
                    }
                } catch {
                    sanitized[key] = '[Unserializable Object]';
                }
            }
        });

        return sanitized;
    };

    const isAllSelected = selection.productIds.length > 0 &&
        selection.productIds.length === selection.totalProductCount;

    const availableActions = getAvailableActions();
    const selectedStatuses = getSelectedProductsStatus();

    // console.log("Sorting Filters: ", filters.sorting);

    return (
        <Box sx={{ margin: '30px' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Breadcrumb routeSegments={[{ name: 'Product', path: '' }, { name: 'Product List' }]} />

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Link href={ROUTE_CONSTANT.catalog.product.parentProducts}>
                        <Button
                            variant="contained"
                        >
                            Add Parent Products
                        </Button>
                    </Link>
                    <Link href={ROUTE_CONSTANT.catalog.product.add}>
                        <Button
                            variant="contained"
                        >
                            Add Product
                        </Button>
                    </Link>

                    <Button variant="contained" onClick={handleExport}>
                        Export Products
                    </Button>
                </Box>
            </Box>

            {/* Filters and Actions */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Bulk Actions */}
                <Paper sx={{ display: 'flex', alignItems: 'center', }}>
                    <Checkbox
                        checked={isAllSelected}
                        onChange={(e) => e.target.checked ? selectAll(products) : deselectAll()}
                        size="small"
                    />
                    <Typography variant="body2" sx={{ mx: 1 }}>
                        {selection.productIds.length} selected
                        {filters.status === 'all' && selectedStatuses.size > 0 && (
                            <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                ({Array.from(selectedStatuses).join(', ')})
                            </Typography>
                        )}
                    </Typography>

                    <Button
                        size="small"
                        onClick={(e) => setActionAnchorEl(e.currentTarget)}
                        disabled={selection.productIds.length === 0 || availableActions.length === 0}
                        endIcon={<ArrowDropDownIcon />}
                    >
                        Actions
                    </Button>

                    <Menu
                        anchorEl={actionAnchorEl}
                        open={Boolean(actionAnchorEl)}
                        onClose={() => setActionAnchorEl(null)}
                    >
                        {availableActions.map((action) => (
                            <MenuItem
                                key={action.key}
                                onClick={() => handleBulkAction(action.key)}
                            >
                                {action.label}
                            </MenuItem>
                        ))}
                    </Menu>
                </Paper>

                {/* Category Filter */}
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                        value={filters.category}
                        label="Category"
                        onChange={(e) => setFilters({ category: e.target.value })}
                    >
                        <MenuItem value="">All Categories</MenuItem>
                        {allActiveCategories.map(category => (
                            <MenuItem key={category.id} value={category.id}>
                                {category.title}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Sorting Filter */}
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                        value={filters.sorting.sortBy ? JSON.stringify(filters.sorting) : ''}
                        label="Sort By"
                        onChange={(e) => {
                            const newSorting = e.target.value ? JSON.parse(e.target.value) : { sortBy: '', order: 1 };
                            setFilters({ sorting: newSorting });
                        }}
                        renderValue={(selected) => {
                            if (!selected) return 'Select sorting...';
                            const sorting = JSON.parse(selected);
                            const option = SORTING_OPTIONS.find(opt =>
                                opt.value.sortBy === sorting.sortBy && opt.value.order === sorting.order
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
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                        size="small"
                        label="Search SKU, Title, Product Id"
                        value={filters.search}
                        onChange={(e) => setFilters({ search: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        sx={{ minWidth: 250 }}
                        InputProps={{
                            endAdornment: filters.search && (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => setFilters({ search: '' })}
                                    >
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    <Button variant="contained" onClick={handleSearch}>
                        Search
                    </Button>
                </Box>
            </Box>

            {/* Status Filter and Column Preferences */}
            <Paper sx={{ p: 1, mb: 2, backgroundColor: '#f5f5f5' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Status Filter */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" fontWeight="bold">Filters:</Typography>
                        <Typography variant="body2">Status:</Typography>
                        <RadioGroup
                            row
                            value={filters.status}
                            onChange={handleStatusChange}
                        >
                            <FormControlLabel value="all" control={<Radio />} label="All" />
                            <FormControlLabel value="active" control={<Radio />} label="Active" />
                            <FormControlLabel value="inactive" control={<Radio />} label="Inactive" />
                            <FormControlLabel value="sold-out" control={<Radio />} label="Sold Out" />
                            <FormControlLabel value="draft" control={<Radio />} label="Draft" />
                            <FormControlLabel value="delete" control={<Radio />} label="Deleted" />
                            {localStorage.getItem(localStorageKey.designation_id) === "2" && (
                                <FormControlLabel value="deleteByAdmin" control={<Radio />} label="Deleted By Admin" />)}
                        </RadioGroup>
                    </Box>

                    <FormControl sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <FormControlLabel value={showFeaturedOnly}
                            onChange={event => setShowFeaturedOnly(event.target.checked)}
                            control={<Switch sx={{ m: 1 }} />} label={"Show only Featured"} />
                    </FormControl>

                    {/* Column Preferences */}
                    <FormControl size="small" sx={{ minWidth: 300 }}>
                        <InputLabel>Columns</InputLabel>
                        <Select
                            multiple
                            value={filters.hiddenColumns}
                            onChange={handleColumnVisibilityChange}
                            input={<OutlinedInput label="Columns" />}
                            renderValue={(selected) => `${selected.length} columns hidden`}
                        >
                            {columnOptions.map(column => (
                                <MenuItem key={column} value={column}>
                                    <Checkbox checked={!filters.hiddenColumns.includes(column)} />
                                    <ListItemText primary={column} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {/* Product Table */}
            <ProductTableNew />

            {/* Pagination */}
            <TablePagination
                rowsPerPageOptions={[25, 50, 75, 100]}
                component="div"
                count={filteredProducts.length}
                rowsPerPage={pagination.rowsPerPage}
                page={pagination.page}
                onPageChange={(_, newPage) => setPagination({ page: newPage })}
                onRowsPerPageChange={(e) => setPagination({
                    rowsPerPage: parseInt(e.target.value, 10),
                    page: 0
                })}
            />

            {/* Confirm Modal */}
            <ConfirmModal
                open={confirmModal.open}
                handleClose={() => setConfirmModal({ open: false, type: '', message: '' })}
                type={confirmModal.type}
                msg={confirmModal.message}
            />
        </Box>
    );
};

export default ProductListNew;
