import React, {useEffect, useState} from 'react';
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
    Paper, Link
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
import {useNavigate, useLocation} from 'react-router-dom';
import {exportToExcel} from 'app/utils/excelExport';
import {ROUTE_CONSTANT} from 'app/constant/routeContanst';
import {toast} from 'react-toastify';
import {useProductStore} from "../states/useProductStore";
import ProductTableNew from "./components/ProductTableNew";

const ProductListNew = () => {
    const navigate = useNavigate();
    const location = useLocation();

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
        clearSelection
    } = useProductStore();

    // Local state
    const [categories, setCategories] = useState([]);
    const [actionAnchorEl, setActionAnchorEl] = useState(null);
    const [confirmModal, setConfirmModal] = useState({open: false, type: '', message: ''});

    // Column options for hide/show
    const columnOptions = [
        'Status',
        'Image',
        'Featured',
        'Product Id',
        'SKU',
        'Product Title',
        'Available',
        'Sale Price',
        'Sort Order',
        'Badge'
    ];

    // Get available actions based on current filter status
    const getAvailableActions = () => {
        const {status} = filters;

        switch (status) {
            case 'all':
                return [
                    {key: 'active', label: 'Active'},
                    {key: 'inactive', label: 'Inactive'},
                    {key: 'draft', label: 'Draft'},
                    {key: 'delete', label: 'Delete'}
                ];
            case 'active':
                return [
                    {key: 'inactive', label: 'Inactive'},
                    {key: 'delete', label: 'Delete'}
                ];
            case 'inactive':
                return [
                    {key: 'active', label: 'Active'},
                    {key: 'delete', label: 'Delete'}
                ];
            case 'sold-out':
                return [
                    {key: 'delete', label: 'Delete'}
                ];
            case 'draft':
                return [
                    {key: 'active', label: 'Active'},
                    {key: 'delete', label: 'Delete'}
                ];
            case 'delete':
                return [
                    {key: 'active', label: 'Active'},
                    {key: 'inactive', label: 'Inactive'}
                ];
            default:
                return [];
        }
    };

    // Sync URL hash with status filter
    useEffect(() => {
        const hash = location.hash.replace('#', '');
        if (hash && ['all', 'active', 'inactive', 'sold-out', 'draft', 'delete'].includes(hash)) {
            setFilters({status: hash});
        }
    }, [location.hash]);

    // Update URL hash when status changes
    useEffect(() => {
        if (filters.status && filters.status !== 'all') {
            window.location.hash = filters.status;
        } else {
            window.location.hash = 'all';
        }
    }, [filters.status]);

    // Fetch initial data
    useEffect(() => {
        fetchProductsFirstTime();
        fetchCategories();
    }, [fetchProducts, filters.status]);

    const fetchCategories = async () => {
        // This would be your category fetching logic
        // For now, using empty array
        setCategories([]);
    };

    // Handle status filter change with hash routing
    const handleStatusChange = (event) => {
        const newStatus = event.target.value;
        setFilters({status: newStatus});

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
        setFilters({hiddenColumns: value});
    };

    // Export products
    const handleExport = () => {
        const exportData = products
            .filter(product => product.type === 'product')
            .map(product => product)
            .concat(
                products
                    .filter(product => product.type === 'variations')
                    .flatMap(product => product.productData.map(item => item))
            );

        exportToExcel(exportData, 'Products.xlsx');
    };

    const isAllSelected = selection.productIds.length > 0 &&
        selection.productIds.length === selection.totalProductCount;

    const availableActions = getAvailableActions();

    return (
        <Box sx={{margin: '30px'}}>
            {/* Header */}
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3}}>
                <Breadcrumb routeSegments={[{name: 'Product', path: ''}, {name: 'Product List'}]}/>

                <Box sx={{display: 'flex', gap: 2}}>
                    <Link href={ROUTE_CONSTANT.catalog.product.parentProducts}>
                        <Button
                            variant="contained"
                            // onClick={() => navigate(ROUTE_CONSTANT.catalog.product.parentProducts)}
                        >
                            Add Parent Products
                        </Button>
                    </Link>
                    <Link href={ROUTE_CONSTANT.catalog.product.add} >

                        <Button
                            variant="contained"
                            // onClick={() => navigate(ROUTE_CONSTANT.catalog.product.add)}
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
            <Box sx={{display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center'}}>
                {/* Bulk Actions */}
                <Paper sx={{display: 'flex', alignItems: 'center', px: 1, py: 0.5}}>
                    <Checkbox
                        checked={isAllSelected}
                        onChange={(e) => e.target.checked ? selectAll(products) : deselectAll()}
                        size="small"
                    />
                    <Typography variant="body2" sx={{mx: 1}}>
                        {selection.productIds.length} selected
                    </Typography>

                    <Button
                        size="small"
                        onClick={(e) => setActionAnchorEl(e.currentTarget)}
                        disabled={selection.productIds.length === 0 || availableActions.length === 0}
                        endIcon={<ArrowDropDownIcon/>}
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
                <FormControl size="small" sx={{minWidth: 200}}>
                    <InputLabel>Category</InputLabel>
                    <Select
                        value={filters.category}
                        label="Category"
                        onChange={(e) => setFilters({category: e.target.value})}
                    >
                        <MenuItem value="">All Categories</MenuItem>
                        {categories.map(category => (
                            <MenuItem key={category.id} value={category.id}>
                                {category.title}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Search */}
                <Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
                    <TextField
                        size="small"
                        label="Search SKU, Title, Product Id"
                        value={filters.search}
                        onChange={(e) => setFilters({search: e.target.value})}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        sx={{minWidth: 250}}
                        InputProps={{
                            endAdornment: filters.search && (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => setFilters({search: ''})}
                                    >
                                        <ClearIcon/>
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
            <Paper sx={{p: 2, mb: 2, backgroundColor: '#f5f5f5'}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    {/* Status Filter */}
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <Typography variant="body2" fontWeight="bold">Filters:</Typography>
                        <Typography variant="body2">Status:</Typography>
                        <RadioGroup
                            row
                            value={filters.status}
                            onChange={handleStatusChange}
                        >
                            <FormControlLabel value="all" control={<Radio/>} label="All"/>
                            <FormControlLabel value="active" control={<Radio/>} label="Active"/>
                            <FormControlLabel value="inactive" control={<Radio/>} label="Inactive"/>
                            <FormControlLabel value="sold-out" control={<Radio/>} label="Sold Out"/>
                            <FormControlLabel value="draft" control={<Radio/>} label="Draft"/>
                            <FormControlLabel value="delete" control={<Radio/>} label="Deleted"/>
                            <FormControlLabel value="deleteByAdmin" control={<Radio/>} label="Deleted By Admin"/>
                        </RadioGroup>
                    </Box>

                    {/* Column Preferences */}
                    <FormControl size="small" sx={{minWidth: 300}}>
                        <InputLabel>Columns</InputLabel>
                        <Select
                            multiple
                            value={filters.hiddenColumns}
                            onChange={handleColumnVisibilityChange}
                            input={<OutlinedInput label="Columns"/>}
                            renderValue={(selected) => `${selected.length} columns hidden`}
                        >
                            {columnOptions.map(column => (
                                <MenuItem key={column} value={column}>
                                    <Checkbox checked={!filters.hiddenColumns.includes(column)}/>
                                    <ListItemText primary={column}/>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {/* Product Table */}
            <ProductTableNew/>

            {/* Pagination */}
            <TablePagination
                rowsPerPageOptions={[25, 50, 75, 100]}
                component="div"
                count={filteredProducts.length}
                rowsPerPage={pagination.rowsPerPage}
                page={pagination.page}
                onPageChange={(_, newPage) => setPagination({page: newPage})}
                onRowsPerPageChange={(e) => setPagination({
                    rowsPerPage: parseInt(e.target.value, 10),
                    page: 0
                })}
            />

            {/* Confirm Modal */}
            <ConfirmModal
                open={confirmModal.open}
                handleClose={() => setConfirmModal({open: false, type: '', message: ''})}
                type={confirmModal.type}
                msg={confirmModal.message}
            />
        </Box>
    );
};

export default ProductListNew;
