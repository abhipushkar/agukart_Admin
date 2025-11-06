import React, {useState, useCallback} from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    IconButton,
    FormControl,
    Select,
    MenuItem,
    Box,
    Button,
    TextField,
    CircularProgress,
    Typography,
    alpha,
    Menu
} from '@mui/material';
import {
    KeyboardArrowRight,
    KeyboardArrowDown,
    Favorite,
    FavoriteBorder,
    ArrowDropDown
} from '@mui/icons-material';
import {REACT_APP_WEB_URL} from 'config';
import {ROUTE_CONSTANT} from 'app/constant/routeContanst';
import {toast} from 'react-toastify';
import {useProductStore} from "../../states/useProductStore";

// Stats Sub-table Component
const StatsSubTable = () => (
    <Box>
        <Table size="small" sx={{width: '100%', backgroundColor: '#f9f9f9', minWidth: '150px'}}>
            <TableHead>
                <TableRow>
                    <TableCell sx={{
                        border: '1px solid #e0e0e0',
                        padding: '3px 6px',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        width: '50%'
                    }}>
                        Performance
                    </TableCell>
                    <TableCell sx={{
                        border: '1px solid #e0e0e0',
                        padding: '3px 6px',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        width: '50%'
                    }}>
                        Last 30 days
                    </TableCell>
                    <TableCell sx={{
                        border: '1px solid #e0e0e0',
                        padding: '3px 6px',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        width: '50%'
                    }}>
                        All Time
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell sx={{
                        border: '1px solid #e0e0e0',
                        padding: '3px 6px',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        width: '50%'
                    }}>
                        Sales
                    </TableCell>
                    <TableCell
                        sx={{border: '1px solid #e0e0e0', padding: '3px 6px', fontSize: '0.65rem', width: '50%'}}>
                        -
                    </TableCell><TableCell
                    sx={{border: '1px solid #e0e0e0', padding: '3px 6px', fontSize: '0.65rem', width: '50%'}}>
                    -
                </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell
                        sx={{border: '1px solid #e0e0e0', padding: '3px 6px', fontSize: '0.65rem', fontWeight: 'bold'}}>
                        Unit Sold
                    </TableCell>
                    <TableCell sx={{border: '1px solid #e0e0e0', padding: '3px 6px', fontSize: '0.65rem'}}>
                        -
                    </TableCell><TableCell sx={{border: '1px solid #e0e0e0', padding: '3px 6px', fontSize: '0.65rem'}}>
                    -
                </TableCell>
                </TableRow><TableRow>
                <TableCell
                    sx={{border: '1px solid #e0e0e0', padding: '3px 6px', fontSize: '0.65rem', fontWeight: 'bold'}}>
                    Now in Cart
                </TableCell>
                <TableCell sx={{border: '1px solid #e0e0e0', padding: '3px 6px', fontSize: '0.65rem'}}>
                    -
                </TableCell><TableCell sx={{border: '1px solid #e0e0e0', padding: '3px 6px', fontSize: '0.65rem'}}>
                -
            </TableCell>
            </TableRow>
            </TableBody>
        </Table>
    </Box>
);

// Common Settings Column Component (with Badge)
const CommonSettingsColumn = ({product, isProduct, onFieldChange, onBadgeChange, actionLoading, filters}) => {
    const [localData, setLocalData] = useState({
        sale_price: product.sale_price || '',
        sort_order: product.sort_order || ''
    });

    const handleFieldChange = (field, value) => {
        setLocalData(prev => ({...prev, [field]: value}));
        onFieldChange(field, value);
    };

    if (!isProduct) {
        return <Typography variant="body2" sx={{fontSize: '0.75rem'}}>-</Typography>;
    }

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
            {/* Sale Price */}
            {!filters.hiddenColumns.includes('Sale Price') && (
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                    <Typography variant="body2" sx={{fontWeight: 'bold', textWrap: "noWrap", minWidth: '50px', fontSize: '0.7rem'}}>
                        Sale Price:
                    </Typography>
                    <TextField
                        type="number"
                        value={localData.sale_price}
                        onChange={(e) => handleFieldChange('sale_price', e.target.value)}
                        size="small"
                        sx={{width: '70px', '& .MuiInputBase-input': {fontSize: '0.75rem', padding: '4px 8px'}}}
                        disabled={actionLoading}
                    />
                </Box>
            )}

            {/* Sort Order */}
            {!filters.hiddenColumns.includes('Sort Order') && (
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                    <Typography variant="body2" sx={{fontWeight: 'bold', textWrap: "noWrap", minWidth: '50px', fontSize: '0.7rem'}}>
                        Sort Order:
                    </Typography>
                    <TextField
                        type="number"
                        value={localData.sort_order}
                        onChange={(e) => handleFieldChange('sort_order', e.target.value)}
                        size="small"
                        sx={{width: '70px', '& .MuiInputBase-input': {fontSize: '0.75rem', padding: '4px 8px'}}}
                        disabled={actionLoading}
                    />
                </Box>
            )}

            {/* Badge */}
            {!filters.hiddenColumns.includes('Badge') && (
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                    <Typography variant="body2" sx={{fontWeight: 'bold', textWrap: "noWrap", minWidth: '50px', fontSize: '0.7rem'}}>
                        Badge:
                    </Typography>
                    <FormControl size="small" sx={{minWidth: '120px'}} disabled={actionLoading}>
                        <Select
                            value={product.product_bedge || ''}
                            onChange={(e) => onBadgeChange(e.target.value)}
                            displayEmpty
                            sx={{fontSize: '0.75rem', height: '32px'}}
                        >
                            <MenuItem value="" sx={{fontSize: '0.75rem'}}>None</MenuItem>
                            <MenuItem value="Agu's Pics" sx={{fontSize: '0.75rem'}}>Agu's Pics</MenuItem>
                            <MenuItem value="Popular Now" sx={{fontSize: '0.75rem'}}>Popular Now</MenuItem>
                            <MenuItem value="Best Seller" sx={{fontSize: '0.75rem'}}>Best Seller</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            )}
        </Box>
    );
};

// Product Row Component
const ProductRow = ({product, index}) => {
    const {
        actionLoading,
        selection,
        filters,
        expandedRows,
        toggleProductSelection,
        toggleExpandedRow,
        toggleFeatured,
        updateProductField,
        updateSortOrder,
        updateBadge,
        deleteProduct
    } = useProductStore();

    const [actionAnchorEl, setActionAnchorEl] = useState(null);

    const designation_id = localStorage.getItem('designation_id');
    const isProduct = product.type === 'product';
    const hasVariations = product.productData?.length > 0;
    const isExpanded = expandedRows.has(product._id);
    const isSelected = selection.productIds.includes(product._id);

    // Check if all Product Information sub-columns are hidden
    const showProductInfoColumn = !filters.hiddenColumns.includes('Product Id') ||
        !filters.hiddenColumns.includes('SKU') ||
        !filters.hiddenColumns.includes('Product Title');

    // Check if all Common Settings sub-columns are hidden
    const showCommonSettingsColumn = !filters.hiddenColumns.includes('Sale Price') ||
        !filters.hiddenColumns.includes('Sort Order') ||
        !filters.hiddenColumns.includes('Badge');

    const handleFieldChange = useCallback(async (field, value) => {
        if (field === 'sale_price' && value > product.price) {
            toast.error('Sale price must be less than your price');
            return;
        }

        try {
            if (field === 'sort_order') {
                await updateSortOrder(product._id, parseInt(value) || 0);
            } else {
                await updateProductField(product._id, field, parseFloat(value) || 0);
            }
        } catch (error) {
            console.error('Error updating field:', error);
        }
    }, [product._id, product.price, updateProductField, updateSortOrder]);

    const handleBadgeChange = async (badge) => {
        try {
            await updateBadge(product._id, badge);
        } catch (error) {
            console.error('Error updating badge:', error);
        }
    };

    const handleToggleFeatured = async () => {
        try {
            await toggleFeatured(product._id, product.featured);
            toast.success('Featured status updated successfully');
        } catch (error) {
            toast.error('Failed to update featured status');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteProduct(product._id);
            toast.success('Product deleted successfully');
            setActionAnchorEl(null);
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const capitalizeFirstLetter = (str) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const getProductTitle = () => {
        return product.product_title?.replace(/<\/?[^>]+(>|$)/g, "") || '';
    };

    const VIEW_W = 200;
    const VIEW_H = 200;
    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
    const clampPan = ({scale = 1, x = 0, y = 0}) => {
        const maxX = ((VIEW_W * scale) - VIEW_W) / 2;
        const maxY = ((VIEW_H * scale) - VIEW_H) / 2;
        return {
            scale,
            x: clamp(x, -maxX, maxX),
            y: clamp(y, -maxY, maxY),
        };
    };

    return (
        <>
            <TableRow
                sx={{
                    cursor: 'pointer',
                    backgroundColor: isExpanded ? alpha('#f5f5f5', 0.5) : 'transparent',
                    opacity: actionLoading ? 0.6 : 1,
                    pointerEvents: actionLoading ? 'none' : 'auto'
                }}
            >
                {/* Checkbox - Fixed 60px */}
                <TableCell sx={{width: '60px', minWidth: '60px', maxWidth: '60px', padding: '4px'}}>
                    <Checkbox
                        checked={isSelected}
                        onChange={() => toggleProductSelection(product._id, product.productData || [])}
                        size="small"
                        disabled={actionLoading}
                        sx={{padding: '4px'}}
                    />
                </TableCell>

                {/* Status - Contractible */}
                {!filters.hiddenColumns.includes('Status') && (
                    <TableCell align="center" sx={{padding: '4px'}}>
                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5}}>
                            {hasVariations && (
                                <IconButton
                                    size="small"
                                    onClick={() => toggleExpandedRow(product._id)}
                                    disabled={actionLoading}
                                    sx={{padding: '2px'}}
                                >
                                    {isExpanded ? <KeyboardArrowDown fontSize="small"/> :
                                        <KeyboardArrowRight fontSize="small"/>}
                                </IconButton>
                            )}
                            <Typography variant="body2" sx={{fontSize: '0.75rem'}}>
                                {isProduct ? product.status : `${product.type} (${product.productData?.length || 0})`}
                            </Typography>
                        </Box>
                    </TableCell>
                )}

                {/* Featured - Contractible */}
                {!filters.hiddenColumns.includes('Featured') && (
                    <TableCell align="center" sx={{padding: '4px'}}>
                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5}}>
                            <IconButton
                                size="small"
                                color={product.featured ? "error" : "default"}
                                onClick={handleToggleFeatured}
                                disabled={actionLoading}
                                sx={{padding: '2px'}}
                            >
                                {product.featured ? <Favorite fontSize="small"/> : <FavoriteBorder fontSize="small"/>}
                            </IconButton>
                        </Box>
                    </TableCell>
                )}

                {/* Image - Fixed 200px */}
                {!filters.hiddenColumns.includes('Image') && (
                    <TableCell sx={{width: '200px', minWidth: '200px', maxWidth: '200px', padding: '4px'}}
                               align="center">
                        <Box
                            sx={{
                                height: "200px",
                                overflow: "hidden",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "2px solid #c0c0c0",
                                background: "#f4f4f4",
                                width: "200px",
                                margin: '0 auto'
                            }}
                        >
                            <img
                                src={product?.type === "product" ? product?.image?.[0] : product?.image}
                                alt="Zoomable"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                    transformOrigin: "center center",
                                    transition: "transform 0.15s ease-out",
                                    willChange: "transform",
                                    backfaceVisibility: "hidden",
                                    ...(() => {
                                        const {x, y, scale} = clampPan(product?.zoom || {});
                                        return {
                                            transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                                        };
                                    })(),
                                }}
                            />
                        </Box>
                    </TableCell>
                )}

                {/* Product Information - Only show if at least one sub-column is visible */}
                {showProductInfoColumn && (
                    <TableCell sx={{padding: '4px 8px', minWidth: '150px'}} align="center">
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
                            {/* Product ID */}
                            {!filters.hiddenColumns.includes('Product Id') && (
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                    <Typography variant="body2"
                                                sx={{fontWeight: 'bold', minWidth: '45px', fontSize: '0.7rem'}}>
                                        ID:
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.65rem',
                                        wordBreak: 'break-all'
                                    }}>
                                        {product._id}
                                    </Typography>
                                </Box>
                            )}

                            {/* SKU */}
                            {!filters.hiddenColumns.includes('SKU') && (
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                    <Typography variant="body2"
                                                sx={{fontWeight: 'bold', minWidth: '45px', fontSize: '0.7rem'}}>
                                        SKU:
                                    </Typography>
                                    <Typography variant="body2" sx={{fontSize: '0.75rem'}}>
                                        {capitalizeFirstLetter(isProduct ? product.sku_code : product.seller_sku)}
                                    </Typography>
                                </Box>
                            )}

                            {/* Product Title */}
                            {!filters.hiddenColumns.includes('Product Title') && (
                                <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 0.5}}>
                                    <Typography variant="body2"
                                                sx={{fontWeight: 'bold', minWidth: '45px', fontSize: '0.7rem'}}>
                                        Title:
                                    </Typography>
                                    <a
                                        href={`${REACT_APP_WEB_URL}/products?id=${product._id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            color: 'inherit',
                                            textDecoration: 'underline',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            lineHeight: '1.2'
                                        }}
                                    >
                                        {getProductTitle()}
                                    </a>
                                </Box>
                            )}
                        </Box>
                    </TableCell>
                )}

                {/* Available Quantity - Contractible */}
                {!filters.hiddenColumns.includes('Available') && (
                    <TableCell align="center" sx={{padding: '4px', minWidth: '80px'}}>
                        <Typography variant="body2" sx={{fontSize: '0.75rem'}}>
                            {isProduct ? product.qty : '-'}
                        </Typography>
                    </TableCell>
                )}

                {/* Common Settings Column - Only show if at least one sub-column is visible */}
                {showCommonSettingsColumn && (
                    <TableCell align="center" sx={{padding: '4px', minWidth: '150px'}}>
                        <CommonSettingsColumn
                            product={product}
                            isProduct={isProduct}
                            onFieldChange={handleFieldChange}
                            onBadgeChange={handleBadgeChange}
                            actionLoading={actionLoading}
                            filters={filters}
                        />
                    </TableCell>
                )}

                {/* Performance Stats - Fixed 200px */}
                <TableCell align="center" sx={{width: '200px', minWidth: '200px', maxWidth: '200px', padding: '4px'}}>
                    <StatsSubTable/>
                </TableCell>

                {/* Actions - Contractible */}
                <TableCell align="center" sx={{padding: '4px', minWidth: '120px'}}>
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Button
                            variant="contained"
                            sx={{
                                borderRadius: '4px 0 0px 4px',
                                border: '1px solid #cacaca',
                                borderRight: 'none',
                                boxShadow: 'none',
                                background: '#fff',
                                color: '#000',
                                '&:hover': {color: '#fff', boxShadow: 'none'},
                                fontSize: '0.7rem',
                                padding: '2px 8px',
                                minWidth: 'auto'
                            }}
                            disabled={actionLoading}
                        >
                            Action
                        </Button>
                        <Button
                            variant="contained"
                            sx={{
                                background: '#fff',
                                color: '#000',
                                border: '1px solid #cacaca',
                                borderLeft: 'none',
                                borderRadius: '0px 4px 4px 0px',
                                minWidth: 'auto',
                                padding: '2px 4px',
                                fontSize: '0.7rem'
                            }}
                            onClick={(e) => setActionAnchorEl(e.currentTarget)}
                            disabled={actionLoading}
                        >
                            <ArrowDropDown fontSize="small"/>
                        </Button>

                        <Menu
                            anchorEl={actionAnchorEl}
                            open={Boolean(actionAnchorEl)}
                            onClose={() => setActionAnchorEl(null)}
                        >
                            <MenuItem sx={{fontSize: '0.8rem'}}>
                                <a
                                    href={
                                        product.type === 'variations'
                                            ? `${ROUTE_CONSTANT.catalog.product.parentProducts}?id=${product._id}`
                                            : `${ROUTE_CONSTANT.catalog.product.add}?id=${product._id}`
                                    }
                                    className="w-full h-full block"
                                    style={{textDecoration: 'none', color: 'inherit'}}
                                >
                                    Edit
                                </a>
                            </MenuItem>
                            <MenuItem sx={{fontSize: '0.8rem'}}>
                                <a
                                    href={`${ROUTE_CONSTANT.catalog.product.add}?_id=${product._id}`}
                                    className="w-full h-full block"
                                    style={{textDecoration: 'none', color: 'inherit'}}
                                >
                                    Copy Listing
                                </a>
                            </MenuItem>
                            <MenuItem onClick={handleDelete} sx={{fontSize: '0.8rem'}}>Delete</MenuItem>
                        </Menu>
                    </Box>
                </TableCell>
            </TableRow>

            {/* Expanded variations */}
            {isExpanded && hasVariations && product.productData.map((variation) => (
                <VariationRow
                    key={variation._id}
                    variation={variation}
                    parentProduct={product}
                />
            ))}
        </>
    );
};

// Variation Row Component
const VariationRow = ({variation, parentProduct}) => {
    const {
        actionLoading,
        selection,
        filters,
        toggleProductSelection,
        toggleFeatured,
        updateProductField,
        updateSortOrder,
        updateBadge,
        deleteProduct
    } = useProductStore();

    const [actionAnchorEl, setActionAnchorEl] = useState(null);

    const designation_id = localStorage.getItem('designation_id');
    const isSelected = selection.productIds.includes(variation._id);

    // Check if all Product Information sub-columns are hidden
    const showProductInfoColumn = !filters.hiddenColumns.includes('Product Id') ||
        !filters.hiddenColumns.includes('SKU') ||
        !filters.hiddenColumns.includes('Product Title');

    // Check if all Common Settings sub-columns are hidden
    const showCommonSettingsColumn = !filters.hiddenColumns.includes('Sale Price') ||
        !filters.hiddenColumns.includes('Sort Order') ||
        !filters.hiddenColumns.includes('Badge');

    const handleFieldChange = useCallback(async (field, value) => {
        try {
            if (field === 'sort_order') {
                await updateSortOrder(variation._id, parseInt(value) || 0);
            } else {
                await updateProductField(variation._id, field, parseFloat(value) || 0);
            }
        } catch (error) {
            console.error('Error updating field:', error);
        }
    }, [variation._id, updateProductField, updateSortOrder]);

    const handleBadgeChange = async (badge) => {
        try {
            await updateBadge(variation._id, badge);
        } catch (error) {
            console.error('Error updating badge:', error);
        }
    };

    const handleToggleFeatured = async () => {
        try {
            await toggleFeatured(variation._id, variation.featured);
            toast.success('Featured status updated successfully');
        } catch (error) {
            toast.error('Failed to update featured status');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteProduct(variation._id);
            toast.success('Product deleted successfully');
            setActionAnchorEl(null);
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const capitalizeFirstLetter = (str) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const getProductTitle = () => {
        return capitalizeFirstLetter(variation.product_title?.replace(/<\/?[^>]+(>|$)/g, "") || '');
    };

    const VIEW_W = 200;
    const VIEW_H = 200;
    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
    const clampPan = ({scale = 1, x = 0, y = 0}) => {
        const maxX = ((VIEW_W * scale) - VIEW_W) / 2;
        const maxY = ((VIEW_H * scale) - VIEW_H) / 2;
        return {
            scale,
            x: clamp(x, -maxX, maxX),
            y: clamp(y, -maxY, maxY),
        };
    };

    return (
        <TableRow
            sx={{
                backgroundColor: '#fafafa',
                opacity: actionLoading ? 0.6 : 1,
                pointerEvents: actionLoading ? 'none' : 'auto'
            }}
        >
            <TableCell sx={{width: '60px', minWidth: '60px', maxWidth: '60px', padding: '4px'}}>
                <Checkbox
                    checked={isSelected}
                    onChange={() => toggleProductSelection(variation._id, [])}
                    size="small"
                    disabled={actionLoading}
                    sx={{padding: '4px'}}
                />
            </TableCell>

            {!filters.hiddenColumns.includes('Status') && (
                <TableCell align="center" sx={{padding: '4px'}}>
                    <Typography variant="body2" sx={{fontSize: '0.75rem'}}>{variation.productStatus}</Typography>
                </TableCell>
            )}

            {/* Featured - Contractible */}
            {!filters.hiddenColumns.includes('Featured') && (
                <TableCell align="center" sx={{padding: '4px'}}>
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5}}>
                        <IconButton
                            size="small"
                            color={variation.featured ? "error" : "default"}
                            onClick={handleToggleFeatured}
                            disabled={actionLoading}
                            sx={{padding: '2px'}}
                        >
                            {variation.featured ? <Favorite fontSize="small"/> : <FavoriteBorder fontSize="small"/>}
                        </IconButton>
                    </Box>
                </TableCell>
            )}

            {!filters.hiddenColumns.includes('Image') && (
                <TableCell sx={{width: '200px', minWidth: '200px', maxWidth: '200px', padding: '4px'}} align="center">
                    <Box
                        sx={{
                            height: "200px",
                            overflow: "hidden",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid #c0c0c0",
                            background: "#f4f4f4",
                            width: "200px",
                            margin: '0 auto'
                        }}
                    >
                        <img
                            src={variation?.image?.[0]}
                            alt="Variation"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                transformOrigin: "center center",
                                transition: "transform 0.15s ease-out",
                                willChange: "transform",
                                backfaceVisibility: "hidden",
                                ...(() => {
                                    const {x, y, scale} = clampPan(variation?.zoom || {});
                                    return {
                                        transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                                    };
                                })(),
                            }}
                        />
                    </Box>
                </TableCell>
            )}

            {/* Product Information for Variation - Only show if at least one sub-column is visible */}
            {showProductInfoColumn && (
                <TableCell sx={{padding: '4px 8px', minWidth: '150px'}} align="center">
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
                        {/* Product ID */}
                        {!filters.hiddenColumns.includes('Product Id') && (
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                <Typography variant="body2"
                                            sx={{fontWeight: 'bold', minWidth: '45px', fontSize: '0.7rem'}}>
                                    ID:
                                </Typography>
                                <Typography variant="body2"
                                            sx={{fontFamily: 'monospace', fontSize: '0.65rem', wordBreak: 'break-all'}}>
                                    {variation._id}
                                </Typography>
                            </Box>
                        )}

                        {/* SKU */}
                        {!filters.hiddenColumns.includes('SKU') && (
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                <Typography variant="body2"
                                            sx={{fontWeight: 'bold', minWidth: '45px', fontSize: '0.7rem'}}>
                                    SKU:
                                </Typography>
                                <Typography variant="body2" sx={{fontSize: '0.75rem'}}>
                                    {capitalizeFirstLetter(variation.sku_code)}
                                </Typography>
                            </Box>
                        )}

                        {/* Product Title */}
                        {!filters.hiddenColumns.includes('Product Title') && (
                            <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 0.5}}>
                                <Typography variant="body2"
                                            sx={{fontWeight: 'bold', minWidth: '45px', fontSize: '0.7rem'}}>
                                    Title:
                                </Typography>
                                <a
                                    href={`${REACT_APP_WEB_URL}/products?id=${variation._id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: 'inherit',
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        lineHeight: '1.2'
                                    }}
                                >
                                    {getProductTitle()}
                                </a>
                            </Box>
                        )}
                    </Box>
                </TableCell>
            )}

            {!filters.hiddenColumns.includes('Available') && (
                <TableCell align="center" sx={{padding: '4px', minWidth: '80px'}}>
                    <Typography variant="body2" sx={{fontSize: '0.75rem'}}>{variation.qty}</Typography>
                </TableCell>
            )}

            {/* Common Settings for Variation - Only show if at least one sub-column is visible */}
            {showCommonSettingsColumn && (
                <TableCell align="center" sx={{padding: '4px', minWidth: '150px'}}>
                    <CommonSettingsColumn
                        product={variation}
                        isProduct={true}
                        onFieldChange={handleFieldChange}
                        onBadgeChange={handleBadgeChange}
                        actionLoading={actionLoading}
                        filters={filters}
                    />
                </TableCell>
            )}

            {/* Performance Stats - Fixed 200px */}
            <TableCell align="center" sx={{width: '200px', minWidth: '200px', maxWidth: '200px', padding: '4px'}}>
                <StatsSubTable/>
            </TableCell>

            {/* Actions - Contractible */}
            <TableCell align="center" sx={{padding: '4px', minWidth: '120px'}}>
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Button
                        variant="contained"
                        sx={{
                            borderRadius: '4px 0 0px 4px',
                            border: '1px solid #cacaca',
                            borderRight: 'none',
                            boxShadow: 'none',
                            background: '#fff',
                            color: '#000',
                            '&:hover': {color: '#fff', boxShadow: 'none'},
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            minWidth: 'auto'
                        }}
                        disabled={actionLoading}
                    >
                        Action
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            background: '#fff',
                            color: '#000',
                            border: '1px solid #cacaca',
                            borderLeft: 'none',
                            borderRadius: '0px 4px 4px 0px',
                            minWidth: 'auto',
                            padding: '2px 4px',
                            fontSize: '0.7rem'
                        }}
                        onClick={(e) => setActionAnchorEl(e.currentTarget)}
                        disabled={actionLoading}
                    >
                        <ArrowDropDown fontSize="small"/>
                    </Button>

                    <Menu
                        anchorEl={actionAnchorEl}
                        open={Boolean(actionAnchorEl)}
                        onClose={() => setActionAnchorEl(null)}
                    >
                        <MenuItem sx={{fontSize: '0.8rem'}}>
                            <a
                                href={`${ROUTE_CONSTANT.catalog.product.add}?id=${variation._id}`}
                                className="w-full h-full block"
                                style={{textDecoration: 'none', color: 'inherit'}}
                            >
                                Edit
                            </a>
                        </MenuItem>
                        <MenuItem sx={{fontSize: '0.8rem'}}>
                            <a
                                href={`${ROUTE_CONSTANT.catalog.product.add}?_id=${variation._id}`}
                                className="w-full h-full block"
                                style={{textDecoration: 'none', color: 'inherit'}}
                            >
                                Copy Listing
                            </a>
                        </MenuItem>
                        <MenuItem onClick={handleDelete} sx={{fontSize: '0.8rem'}}>Delete</MenuItem>
                    </Menu>
                </Box>
            </TableCell>
        </TableRow>
    );
};

// Main Product Table Component
const ProductTableNew = () => {
    const {
        filteredProducts,
        loading,
        actionLoading,
        filters,
        pagination
    } = useProductStore();

    // Check if all Product Information sub-columns are hidden
    const showProductInfoColumn = !filters.hiddenColumns.includes('Product Id') ||
        !filters.hiddenColumns.includes('SKU') ||
        !filters.hiddenColumns.includes('Product Title');

    // Check if all Common Settings sub-columns are hidden
    const showCommonSettingsColumn = !filters.hiddenColumns.includes('Sale Price') ||
        !filters.hiddenColumns.includes('Sort Order') ||
        !filters.hiddenColumns.includes('Badge');

    const columnHeaders = [
        {key: 'checkbox', label: '', align: 'center', fixed: true, width: '60px'},
        {key: 'Status', label: 'Status', align: 'center', hideable: true, fixed: true, width: "100px"},
        {key: 'Featured', label: 'Featured', align: 'center', hideable: true, fixed: true, width: "100px"},
        {key: 'Image', label: 'Images', align: 'center', hideable: true, fixed: true, width: '200px'},
        {
            key: 'ProductInfo',
            label: 'Product Information',
            align: 'center',
            fixed: false,
            conditional: showProductInfoColumn
        },
        {key: 'Available', label: 'Available', align: 'center', hideable: true, fixed: true, width: "100px"},
        {
            key: 'CommonSettings',
            label: 'Settings',
            align: 'center',
            fixed: false,
            conditional: showCommonSettingsColumn
        },
        {key: 'Performance', label: 'Performance Stats', align: 'center', fixed: true, width: '300px'},
        {key: 'Action', label: 'Action', align: 'center', fixed: false}
    ];

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200}}>
                <CircularProgress/>
            </Box>
        );
    }

    const visibleProducts = pagination.rowsPerPage > 0
        ? filteredProducts.slice(
            pagination.page * pagination.rowsPerPage,
            pagination.page * pagination.rowsPerPage + pagination.rowsPerPage
        )
        : filteredProducts;

    return (
        <TableContainer
            component={Paper}
            sx={{
                position: 'relative',
                opacity: actionLoading ? 0.9 : 1,
                pointerEvents: actionLoading ? 'none' : 'auto'
            }}
        >
            {actionLoading && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10
                    }}
                >
                    <CircularProgress/>
                </Box>
            )}

            <Table sx={{minWidth: '100%'}} size="small">
                <TableHead>
                    <TableRow>
                        {columnHeaders.map((column) => {
                            // Skip column if it's hideable and hidden
                            if (column.hideable && filters.hiddenColumns.includes(column.key)) {
                                return null;
                            }
                            // Skip column if it has conditional rendering and condition is false
                            if (column.conditional !== undefined && !column.conditional) {
                                return null;
                            }
                            return (
                                <TableCell
                                    key={column.key}
                                    align={column.align}
                                    sx={{
                                        fontWeight: 'bold',
                                        backgroundColor: '#f5f5f5',
                                        whiteSpace: 'nowrap',
                                        padding: '8px 4px',
                                        fontSize: '0.75rem',
                                        ...(column.fixed && {
                                            width: column.width,
                                            minWidth: column.width,
                                            maxWidth: column.width
                                        })
                                    }}
                                >
                                    {column.label}
                                </TableCell>
                            );
                        })}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {visibleProducts.length > 0 && visibleProducts[0] !== 'No Product Found' ? (
                        visibleProducts.map((product, index) => (
                            <ProductRow
                                key={product._id}
                                product={product}
                                index={index}
                            />
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columnHeaders.length} align="center">
                                <Typography variant="body1" sx={{p: 3}}>
                                    No products found
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ProductTableNew;
