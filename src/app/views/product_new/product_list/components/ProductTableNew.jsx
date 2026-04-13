import React, { useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    Menu, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import {
    KeyboardArrowRight,
    KeyboardArrowDown,
    ArrowDropDown, Star, StarOutline
} from '@mui/icons-material';
import { REACT_APP_WEB_URL } from 'config';
import { ROUTE_CONSTANT } from 'app/constant/routeContanst';
import { toast } from 'react-toastify';
import { useProductStore } from "../../states/useProductStore";
import debounce from 'lodash.debounce';

const getCurrentScrollPosition = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return 0;

    let maxScrollTop = Math.max(
        window.scrollY || 0,
        document.documentElement?.scrollTop || 0,
        document.body?.scrollTop || 0,
        document.scrollingElement?.scrollTop || 0
    );

    const containers = document.querySelectorAll(
        'main, [role="main"], .main-content, .main-content-wrap, .content-wrap, .simplebar-content-wrapper'
    );

    containers.forEach((el) => {
        if (!el) return;
        if (el.scrollHeight > el.clientHeight && el.scrollTop > maxScrollTop) {
            maxScrollTop = el.scrollTop;
        }
    });

    // Fallback: detect active scroll container even if selector-based lookup misses it.
    document.querySelectorAll('*').forEach((el) => {
        if (!el) return;
        if (el.scrollHeight > el.clientHeight && el.scrollTop > maxScrollTop) {
            maxScrollTop = el.scrollTop;
        }
    });

    return maxScrollTop;
};

// Stats Sub-table Component
const StatsSubTable = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Table size="small" sx={{ width: '100%', backgroundColor: '#f9f9f9', minWidth: '150px' }}>
            <TableHead>
                <TableRow>
                    <TableCell sx={{
                        border: '1px solid #e0e0e0',
                        padding: '3px 6px',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        width: '50%',
                        textAlign: 'center'
                    }}>
                        Performance
                    </TableCell>
                    <TableCell sx={{
                        border: '1px solid #e0e0e0',
                        padding: '3px 6px',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        width: '50%',
                        textAlign: 'center'
                    }}>
                        Last 30 days
                    </TableCell>
                    <TableCell sx={{
                        border: '1px solid #e0e0e0',
                        padding: '3px 6px',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        width: '50%',
                        textAlign: 'center'
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
                        width: '50%',
                        textAlign: 'center'
                    }}>
                        Sales
                    </TableCell>
                    <TableCell
                        sx={{ border: '1px solid #e0e0e0', padding: '3px 6px', fontSize: '0.65rem', width: '50%', textAlign: 'center' }}>
                        -
                    </TableCell>
                    <TableCell
                        sx={{ border: '1px solid #e0e0e0', padding: '3px 6px', fontSize: '0.65rem', width: '50%', textAlign: 'center' }}>
                        -
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell
                        sx={{ border: '1px solid #e0e0e0', padding: '3px 6px', fontSize: '0.65rem', fontWeight: 'bold', textAlign: 'center' }}>
                        Unit Sold
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #e0e0e0', padding: '3px 6px', fontSize: '0.65rem', textAlign: 'center' }}>
                        -
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #e0e0e0', padding: '3px 6px', fontSize: '0.65rem', textAlign: 'center' }}>
                        -
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell
                        sx={{ border: '1px solid #e0e0e0', padding: '3px 6px', fontSize: '0.65rem', fontWeight: 'bold', textAlign: 'center' }}>
                        Now in Cart
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #e0e0e0', padding: '3px 6px', fontSize: '0.65rem', textAlign: 'center' }}>
                        -
                    </TableCell><TableCell sx={{ border: '1px solid #e0e0e0', padding: '3px 6px', fontSize: '0.65rem', textAlign: 'center' }}>
                        -
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell
                        sx={{ border: '1px solid #e0e0e0', padding: '3px 6px', fontSize: '0.65rem', fontWeight: 'bold', textAlign: 'center' }}>
                        Views
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #e0e0e0', padding: '3px 6px', fontSize: '0.65rem', textAlign: 'center' }}>
                        -
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #e0e0e0', padding: '3px 6px', fontSize: '0.65rem', textAlign: 'center' }}>
                        -
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell
                        sx={{ border: '1px solid #e0e0e0', padding: '3px 6px', fontSize: '0.65rem', fontWeight: 'bold', textAlign: 'center' }}>
                        Favorites
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #e0e0e0', padding: '3px 6px', fontSize: '0.65rem', textAlign: 'center' }}>
                        -
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #e0e0e0', padding: '3px 6px', fontSize: '0.65rem', textAlign: 'center' }}>
                        -
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </Box>
);

// Common Settings Column Component (without Badge)
const CommonSettingsColumn = ({ product, isProduct, onFieldChange, actionLoading, filters }) => {
    const [localData, setLocalData] = useState({
        sale_price: product.sale_price || '',
        sort_order: product.sort_order || ''
    });

    const handleFieldChange = (field, value) => {
        setLocalData(prev => ({ ...prev, [field]: value }));
        onFieldChange(field, value);
    };

    if (!isProduct) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>-</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center', justifyContent: 'center' }}>
            {/* Sale Price */}
            {!filters.hiddenColumns.includes('Sale Price') && product.sale_price > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                    <Typography variant="body2"
                        sx={{ fontWeight: 'bold', textWrap: "noWrap", minWidth: '50px', fontSize: '0.7rem' }}>
                        Sale Price:
                    </Typography>
                    <TextField
                        type="number"
                        value={localData.sale_price}
                        onChange={(e) => handleFieldChange('sale_price', e.target.value)}
                        size="small"
                        sx={{ width: '70px', '& .MuiInputBase-input': { fontSize: '0.75rem', padding: '4px 8px', textAlign: 'center' } }}
                        disabled={actionLoading}
                    />
                </Box>
            )}

            {/* Sort Order */}
            {!filters.hiddenColumns.includes('Sort Order') && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                    <Typography variant="body2"
                        sx={{ fontWeight: 'bold', textWrap: "noWrap", minWidth: '50px', fontSize: '0.7rem' }}>
                        Sort Order:
                    </Typography>
                    <TextField
                        type="number"
                        value={localData.sort_order}
                        onChange={(e) => handleFieldChange('sort_order', e.target.value)}
                        size="small"
                        sx={{ width: '70px', '& .MuiInputBase-input': { fontSize: '0.75rem', padding: '4px 8px', textAlign: 'center' } }}
                        disabled={actionLoading}
                    />
                </Box>
            )}
        </Box>
    );
};

// Image Badge Column Component
const ImageBadgeColumn = ({ product, isProduct, onBadgeChange, actionLoading, filters }) => {
    if (!isProduct || filters.hiddenColumns.includes('Image Badge')) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>-</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: "column", justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <FormControl size="small" sx={{ minWidth: '150px', px: 2 }} disabled={actionLoading}>
                <RadioGroup
                    value={product.product_bedge || ''}
                    onChange={(e) => onBadgeChange(e.target.value)}
                    row
                    sx={{ fontSize: '0.75rem', height: '32px', justifyContent: 'start' }}
                >
                    <FormControlLabel value="" sx={{ fontSize: '0.75rem' }} control={<Radio />} label={"None"} />
                    <FormControlLabel value="Agu's Pics" sx={{ fontSize: '0.75rem' }} control={<Radio />}
                        label={"Agu's Pics"} />
                    <FormControlLabel value="Popular Now" sx={{ fontSize: '0.75rem' }} control={<Radio />}
                        label={"Popular Now"} />
                    <FormControlLabel value="Best Seller" sx={{ fontSize: '0.75rem' }} control={<Radio />}
                        label={"Best Seller"} />
                </RadioGroup>
            </FormControl>
            <Box height={140}></Box>
        </Box>
    );
};

// Product Row Component
const ProductRow = ({ product, index }) => {
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
        deleteProduct,
        deleteProductByAdmin,
        persistListViewContext,
    } = useProductStore();
    const navigate = useNavigate();

    const [actionAnchorEl, setActionAnchorEl] = useState(null);

    const designation_id = localStorage.getItem('designation_id');
    const isProduct = product.type === 'product';
    const hasVariations = product.productData?.length > 0;
    const isExpanded = expandedRows.has(product._id);
    const isSelected = selection.productIds.includes(product._id);
    const activeChild = product.productData?.find(
        child => child.productStatus === 'active'
    );
    const getEditUrl =
        product.type === "variations"
            ? `${ROUTE_CONSTANT.catalog.product.parentProducts}?id=${product._id}`
            : `${ROUTE_CONSTANT.catalog.product.add}?id=${product._id}`;

    const getCopyUrl =
        product.type === "variations"
            ? `${ROUTE_CONSTANT.catalog.product.parentProducts}?id=${product._id}&listing=copy`
            : `${ROUTE_CONSTANT.catalog.product.add}?_id=${product._id}&listing=copy`;

    const handleLinkClick = (e) => {
        // Only run for normal left click (not ctrl/cmd/middle click)
        if (
            e.button !== 0 ||     // not left click
            e.ctrlKey ||          // ctrl click
            e.metaKey ||          // cmd click (mac)
            e.shiftKey ||
            e.altKey
        ) {
            return; // let browser handle it (new tab etc.)
        }

        persistListViewContext({
            status: filters.status,
            scrollY: getCurrentScrollPosition()
        });

        setActionAnchorEl(null);
    };

    // Check if all Product Information sub-columns are hidden
    const showProductInfoColumn = !filters.hiddenColumns.includes('Product Id') ||
        !filters.hiddenColumns.includes('SKU') ||
        !filters.hiddenColumns.includes('Product Title') || !filters.hiddenColumns.includes("Featured") || !filters.hiddenColumns.includes("Shop Name");

    // Check if all Common Settings sub-columns are hidden
    const showCommonSettingsColumn = !filters.hiddenColumns.includes('Sale Price') ||
        !filters.hiddenColumns.includes('Sort Order');

    // Fixed debounce function for API calls
    const debouncedApiCall = useRef(
        debounce(async (field, value, productId, productPrice) => {
            try {
                if (field === 'sale_price' && parseFloat(value) > parseFloat(productPrice)) {
                    toast.error('Sale price must be less than your price');
                    return;
                }

                if (field === 'sort_order') {
                    await updateSortOrder(productId, parseInt(value) || 0);
                } else {
                    await updateProductField(productId, field, parseFloat(value) || 0);
                }
            } catch (error) {
                console.error('Error updating field:', error);
            }
        }, 1000)
    ).current;

    const handleFieldChange = useCallback((field, value) => {
        // Convert to number and handle empty values
        const numValue = value === '' ? 0 : parseFloat(value);
        debouncedApiCall(field, numValue, product._id, product.price);
    }, [product._id, product.price, debouncedApiCall]);

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
            if (designation_id === "2" && filters.status === "delete") {
                await deleteProductByAdmin(product._id);
            } else {
                await deleteProduct(product._id);
            }
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

    const navigateWithListContext = (url) => {
        persistListViewContext({
            status: filters.status,
            scrollY: getCurrentScrollPosition()
        });
        setActionAnchorEl(null);
        navigate(url);
    };

    const VIEW_W = 200;
    const VIEW_H = 200;
    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
    const clampPan = ({ scale = 1, x = 0, y = 0 }) => {
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
                    cursor: actionLoading ? "none" : 'pointer',
                    backgroundColor: isExpanded ? alpha('#f5f5f5', 0.5) : 'transparent',
                    pointerEvents: actionLoading ? 'none' : 'auto',
                    '& td': {
                        verticalAlign: 'middle', // Changed from 'top' to 'middle' for center alignment
                        textAlign: 'center'
                    }
                }}
            >
                {/* Checkbox - Fixed 60px */}
                <TableCell sx={{ width: '60px', minWidth: '60px', maxWidth: '60px', padding: '4px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Checkbox
                            checked={isSelected}
                            onChange={() => toggleProductSelection(product._id, product.productData || [], isProduct ? product.sku_code : product.seller_sku)}
                            size="small"
                            disabled={actionLoading}
                            sx={{ padding: '4px' }}
                        />
                    </Box>
                </TableCell>

                {/* Status - Contractible */}
                {!filters.hiddenColumns.includes('Status') && (
                    <TableCell sx={{ padding: '4px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            {hasVariations && (
                                <IconButton
                                    size="small"
                                    onClick={() => toggleExpandedRow(product._id)}
                                    disabled={actionLoading}
                                    sx={{ padding: '2px' }}
                                >
                                    {isExpanded ? <KeyboardArrowDown fontSize="small" /> :
                                        <KeyboardArrowRight fontSize="small" />}
                                </IconButton>
                            )}
                            <Box>
                                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                    {isProduct ? product.status : `${product.type} \n${product.totalChildCount}(${product.productData?.length || 0})`}
                                </Typography>
                                {isProduct && product.status === "inactive" && (<Typography color={"error"} variant="body2" sx={{ fontSize: '0.75rem' }}>
                                    {product.inactiveReason}
                                </Typography>)}
                            </Box>
                        </Box>
                    </TableCell>
                )}

                {/* Image - Fixed 200px */}
                {!filters.hiddenColumns.includes('Image') && (
                    <TableCell sx={{ width: '200px', minWidth: '200px', maxWidth: '200px', padding: '4px' }}>
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
                                        const { x, y, scale } = clampPan(product?.zoom || {});
                                        return {
                                            transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                                        };
                                    })(),
                                }}
                            />
                        </Box>
                    </TableCell>
                )}

                {/* Image Badge - New Column */}
                {!filters.hiddenColumns.includes('Image Badge') && (
                    <TableCell sx={{ padding: '4px', minWidth: '120px' }}>
                        <ImageBadgeColumn
                            product={product}
                            isProduct={isProduct}
                            onBadgeChange={handleBadgeChange}
                            actionLoading={actionLoading}
                            filters={filters}
                        />
                    </TableCell>
                )}

                {/* Product Information - Only show if at least one sub-column is visible */}
                {showProductInfoColumn && (
                    <TableCell sx={{ padding: '4px 16px', minWidth: '150px' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                            {/* Featured inside Product Information */}
                            {!filters.hiddenColumns.includes('Featured') && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                                    <IconButton
                                        size="small"
                                        color={product.featured ? "info" : "default"}
                                        onClick={handleToggleFeatured}
                                        disabled={actionLoading}
                                        sx={{ padding: '2px' }}
                                    >
                                        {product.featured ? <Star fontSize="small" /> : <StarOutline fontSize="small" />}
                                    </IconButton>
                                    <Typography variant="body2" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
                                        Featured
                                    </Typography>
                                </Box>
                            )}

                            {/* Product Title */}
                            {!filters.hiddenColumns.includes('Product Title') && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                                    <a
                                        href={product.type === 'variations'
                                            ? activeChild
                                                ? `${REACT_APP_WEB_URL}/products/${activeChild._id}`
                                                : undefined
                                            : product.status === 'active'
                                                ? `${REACT_APP_WEB_URL}/products/${product._id}`
                                                : undefined
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            color: 'inherit',
                                            textDecoration: 'underline',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            lineHeight: '1.2',
                                            wordBreak: 'break-word',
                                            overflowWrap: 'break-word',
                                            whiteSpace: 'normal',
                                            textAlign: 'center'
                                        }}
                                    >
                                        {getProductTitle()}
                                    </a>
                                </Box>
                            )}

                            {/* Shop Name */}
                            {!hasVariations && !filters.hiddenColumns.includes('Shop Name') && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                                    <Typography variant="body2"
                                        sx={{ fontWeight: 'bold', minWidth: '45px', fontSize: '0.7rem' }}>
                                        Shop Name:
                                    </Typography>
                                    <Typography variant="body2"
                                        sx={{ fontFamily: 'monospace', fontSize: '0.65rem', wordBreak: 'break-all' }}>
                                        {product.shop_name || "-"}
                                    </Typography>
                                </Box>
                            )}

                            {/* Product ID */}
                            {!filters.hiddenColumns.includes('Product Id') && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                                    <Typography variant="body2"
                                        sx={{ fontWeight: 'bold', minWidth: '45px', fontSize: '0.7rem' }}>
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
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                                    <Typography variant="body2"
                                        sx={{ fontWeight: 'bold', minWidth: '45px', fontSize: '0.7rem' }}>
                                        SKU:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                        {capitalizeFirstLetter(isProduct ? product.sku_code : product.seller_sku)}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </TableCell>
                )}

                {/* Available Quantity - Contractible */}
                {!filters.hiddenColumns.includes('Available') && (
                    <TableCell sx={{ padding: '4px', minWidth: '80px' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            {isProduct ? product.status !== "sold-out" && product.qty === "0" ? "Combinations" : product.qty : '-'}
                        </Typography>
                    </TableCell>
                )}

                {/* Common Settings Column - Only show if at least one sub-column is visible */}
                {showCommonSettingsColumn && (
                    <TableCell sx={{ padding: '4px', minWidth: '150px' }}>
                        <CommonSettingsColumn
                            product={product}
                            isProduct={isProduct}
                            onFieldChange={handleFieldChange}
                            actionLoading={actionLoading}
                            filters={filters}
                        />
                    </TableCell>
                )}

                {/* Performance Stats - Fixed 200px */}
                <TableCell sx={{ width: '200px', minWidth: '200px', maxWidth: '200px', padding: '4px' }}>
                    <StatsSubTable />
                </TableCell>

                {/* Actions - Contractible */}
                <TableCell sx={{ padding: '4px', minWidth: '120px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            sx={{
                                borderRadius: '4px 0 0px 4px',
                                border: '1px solid #cacaca',
                                borderRight: 'none',
                                boxShadow: 'none',
                                background: '#fff',
                                color: '#000',
                                '&:hover': { color: '#fff', boxShadow: 'none' },
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
                            <ArrowDropDown fontSize="small" />
                        </Button>

                        <Menu
                            anchorEl={actionAnchorEl}
                            open={Boolean(actionAnchorEl)}
                            onClose={() => setActionAnchorEl(null)}
                        >
                            <MenuItem
                                component={Link}
                                to={getEditUrl}
                                onClick={handleLinkClick}
                                sx={{ fontSize: "0.8rem" }}
                            >
                                Edit
                            </MenuItem>

                            <MenuItem
                                component={Link}
                                to={getCopyUrl}
                                onClick={handleLinkClick}
                                sx={{ fontSize: "0.8rem" }}
                            >
                                Copy Listing
                            </MenuItem>

                            {(filters.status === "delete" && designation_id === "2") ||
                                filters.status !== "delete" ? (
                                <MenuItem onClick={handleDelete} sx={{ fontSize: "0.8rem" }}>
                                    Delete
                                </MenuItem>
                            ) : null}
                        </Menu>
                    </Box>
                </TableCell>
            </TableRow>

            {/* Expanded variations */}
            {!filters.isSearched && isExpanded && hasVariations && product.productData.map((variation) => (
                <VariationRow
                    key={variation._id}
                    variation={variation}
                    parentProduct={product}
                    isParentSelected={isSelected}
                />
            ))}
        </>
    );
};

// Variation Row Component
const VariationRow = ({ variation, parentProduct, isParentSelected }) => {
    const {
        actionLoading,
        selection,
        filters,
        toggleProductSelection,
        toggleFeatured,
        updateProductField,
        updateSortOrder,
        updateBadge,
        deleteProduct,
        persistListViewContext,
    } = useProductStore();
    const navigate = useNavigate();

    const [actionAnchorEl, setActionAnchorEl] = useState(null);

    const designation_id = localStorage.getItem('designation_id');
    const isSelected = selection.productIds.includes(variation._id);

    // Check if all Product Information sub-columns are hidden
    const showProductInfoColumn = !filters.hiddenColumns.includes('Product Id') ||
        !filters.hiddenColumns.includes('SKU') ||
        !filters.hiddenColumns.includes('Product Title') || !filters.hiddenColumns.includes("Featured") || !filters.hiddenColumns.includes("Shop Name");

    // Check if all Common Settings sub-columns are hidden
    const showCommonSettingsColumn = !filters.hiddenColumns.includes('Sale Price') ||
        !filters.hiddenColumns.includes('Sort Order');

    const editUrl = `${ROUTE_CONSTANT.catalog.product.add}?id=${variation._id}`;
    const copyUrl = `${ROUTE_CONSTANT.catalog.product.add}?_id=${variation._id}&listing=copy`;

    const handleLinkClick = (e) => {
        // Only run for normal left click (not ctrl/cmd/middle click)
        if (
            e.button !== 0 ||     // not left click
            e.ctrlKey ||          // ctrl click
            e.metaKey ||          // cmd click (mac)
            e.shiftKey ||
            e.altKey
        ) {
            return; // let browser handle it (new tab etc.)
        }

        persistListViewContext({
            status: filters.status,
            scrollY: getCurrentScrollPosition()
        });

        setActionAnchorEl(null);
    };

    // Fixed debounce function for API calls
    const debouncedApiCall = useRef(
        debounce(async (field, value, productId) => {
            try {
                if (field === 'sort_order') {
                    await updateSortOrder(productId, parseInt(value) || 0);
                } else {
                    await updateProductField(productId, field, parseFloat(value) || 0);
                }
            } catch (error) {
                console.error('Error updating field:', error);
            }
        }, 1000)
    ).current;

    const handleFieldChange = useCallback((field, value) => {
        // Convert to number and handle empty values
        const numValue = value === '' ? 0 : parseFloat(value);
        debouncedApiCall(field, numValue, variation._id);
    }, [variation._id, debouncedApiCall]);

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

    const navigateWithListContext = (url) => {
        persistListViewContext({
            status: filters.status,
            scrollY: getCurrentScrollPosition()
        });
        setActionAnchorEl(null);
        navigate(url);
    };

    const VIEW_W = 200;
    const VIEW_H = 200;
    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
    const clampPan = ({ scale = 1, x = 0, y = 0 }) => {
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
                backgroundColor: '#f8f8f8',
                cursor: actionLoading ? "none" : "auto",
                pointerEvents: actionLoading ? 'none' : 'auto',
                '& td': {
                    verticalAlign: 'middle', // Changed from 'top' to 'middle' for center alignment
                    textAlign: 'center'
                },
                '& td:first-of-type': {
                    paddingLeft: '40px',
                    position: 'relative',
                    '&::before': {
                        content: '"↳"',
                        position: 'absolute',
                        left: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#666',
                        fontSize: '0.8rem'
                    }
                }
            }}
        >
            <TableCell sx={{ width: '60px', minWidth: '60px', maxWidth: '60px', padding: '4px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Checkbox
                        checked={isSelected}
                        onChange={() => toggleProductSelection(variation._id, [], variation.sku_code)}
                        size="small"
                        disabled={actionLoading || isParentSelected}
                        sx={{ padding: '4px' }}
                    />
                </Box>
            </TableCell>

            {!filters.hiddenColumns.includes('Status') && (
                <TableCell sx={{ padding: '4px' }}>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{variation.productStatus}</Typography>
                    {variation.productStatus === "inactive" && (<Typography color={"error"} variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {variation.inactiveReason}
                    </Typography>)}
                </TableCell>
            )}

            {!filters.hiddenColumns.includes('Image') && (
                <TableCell sx={{ width: '200px', minWidth: '200px', maxWidth: '200px', padding: '4px' }}>
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
                                    const { x, y, scale } = clampPan(variation?.zoom || {});
                                    return {
                                        transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                                    };
                                })(),
                            }}
                        />
                    </Box>
                </TableCell>
            )}

            {/* Image Badge for Variation */}
            {!filters.hiddenColumns.includes('Image Badge') && (
                <TableCell sx={{ padding: '4px', minWidth: '120px' }}>
                    <ImageBadgeColumn
                        product={variation}
                        isProduct={true}
                        onBadgeChange={handleBadgeChange}
                        actionLoading={actionLoading}
                        filters={filters}
                    />
                </TableCell>
            )}

            {/* Product Information for Variation */}
            {showProductInfoColumn && (
                <TableCell sx={{ padding: '4px 8px', minWidth: '150px' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                        {/* Featured inside Product Information */}
                        {!filters.hiddenColumns.includes('Featured') && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                                <IconButton
                                    size="small"
                                    color={variation.featured ? "info" : "default"}
                                    onClick={handleToggleFeatured}
                                    disabled={actionLoading}
                                    sx={{ padding: '2px' }}
                                >
                                    {variation.featured ? <Star fontSize="small" /> : <StarOutline fontSize="small" />}
                                </IconButton>
                                <Typography variant="body2" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
                                    Featured
                                </Typography>
                            </Box>
                        )}

                        {/* Product Title */}
                        {!filters.hiddenColumns.includes('Product Title') && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                                <a
                                    href={`${REACT_APP_WEB_URL}/products/${variation._id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: 'inherit',
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        lineHeight: '1.2',
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word',
                                        whiteSpace: 'normal',
                                        textAlign: 'center'
                                    }}
                                >
                                    {getProductTitle()}
                                </a>
                            </Box>
                        )}

                        {/* Shop Name */}
                        {!filters.hiddenColumns.includes('Shop Name') && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                                <Typography variant="body2"
                                    sx={{ fontWeight: 'bold', minWidth: '45px', fontSize: '0.7rem' }}>
                                    Shop Name:
                                </Typography>
                                <Typography variant="body2"
                                    sx={{ fontFamily: 'monospace', fontSize: '0.65rem', wordBreak: 'break-all' }}>
                                    {variation.shop_name || "-"}
                                </Typography>
                            </Box>
                        )}

                        {/* Product ID */}
                        {!filters.hiddenColumns.includes('Product Id') && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                                <Typography variant="body2"
                                    sx={{ fontWeight: 'bold', minWidth: '45px', fontSize: '0.7rem' }}>
                                    ID:
                                </Typography>
                                <Typography variant="body2"
                                    sx={{ fontFamily: 'monospace', fontSize: '0.65rem', wordBreak: 'break-all' }}>
                                    {variation._id}
                                </Typography>
                            </Box>
                        )}

                        {/* SKU */}
                        {!filters.hiddenColumns.includes('SKU') && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                                <Typography variant="body2"
                                    sx={{ fontWeight: 'bold', minWidth: '45px', fontSize: '0.7rem' }}>
                                    SKU:
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                    {capitalizeFirstLetter(variation.sku_code)}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </TableCell>
            )}

            {!filters.hiddenColumns.includes('Available') && (
                <TableCell sx={{ padding: '4px', minWidth: '80px' }}>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{variation.productStatus !== "sold-out" && variation.qty === "0" ? "Combinations" : variation.qty}</Typography>
                </TableCell>
            )}

            {/* Common Settings for Variation */}
            {showCommonSettingsColumn && (
                <TableCell sx={{ padding: '4px', minWidth: '150px' }}>
                    <CommonSettingsColumn
                        product={variation}
                        isProduct={true}
                        onFieldChange={handleFieldChange}
                        actionLoading={actionLoading}
                        filters={filters}
                    />
                </TableCell>
            )}

            {/* Performance Stats */}
            <TableCell sx={{ width: '200px', minWidth: '200px', maxWidth: '200px', padding: '4px' }}>
                <StatsSubTable />
            </TableCell>

            {/* Actions */}
            <TableCell sx={{ padding: '4px', minWidth: '120px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        sx={{
                            borderRadius: '4px 0 0px 4px',
                            border: '1px solid #cacaca',
                            borderRight: 'none',
                            boxShadow: 'none',
                            background: '#fff',
                            color: '#000',
                            '&:hover': { color: '#fff', boxShadow: 'none' },
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
                        <ArrowDropDown fontSize="small" />
                    </Button>

                    <Menu
                        anchorEl={actionAnchorEl}
                        open={Boolean(actionAnchorEl)}
                        onClose={() => setActionAnchorEl(null)}
                    >
                        <MenuItem
                            component={Link}
                            to={editUrl}
                            onClick={handleLinkClick}
                            sx={{ fontSize: "0.8rem" }}
                        >
                            Edit
                        </MenuItem>

                        <MenuItem
                            component={Link}
                            to={copyUrl}
                            onClick={handleLinkClick}
                            sx={{ fontSize: "0.8rem" }}
                        >
                            Copy Listing
                        </MenuItem>

                        <MenuItem onClick={handleDelete} sx={{ fontSize: "0.8rem" }}>
                            Delete
                        </MenuItem>
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
        !filters.hiddenColumns.includes('Product Title') || !filters.hiddenColumns.includes("Featured") || !filters.hiddenColumns.includes("Shop Name");

    // Check if all Common Settings sub-columns are hidden
    const showCommonSettingsColumn = !filters.hiddenColumns.includes('Sale Price') ||
        !filters.hiddenColumns.includes('Sort Order');

    const columnHeaders = [
        { key: 'checkbox', label: '', align: 'center', fixed: true, width: '60px' },
        { key: 'Status', label: 'Status', align: 'center', hideable: true, fixed: true, width: "100px" },
        { key: 'Image', label: 'Images', align: 'center', hideable: true, fixed: true, width: '200px' },
        { key: 'Image Badge', label: 'Image Badge', align: 'center', hideable: true, fixed: true, width: "170px" },
        {
            key: 'ProductInfo',
            label: 'Product Information',
            align: 'center',
            fixed: false,
            conditional: showProductInfoColumn
        },
        { key: 'Available', label: 'Available', align: 'center', hideable: true, fixed: true, width: "100px" },
        {
            key: 'CommonSettings',
            label: 'Settings',
            align: 'center',
            fixed: true,
            width: "150px",
            conditional: showCommonSettingsColumn
        },
        { key: 'Performance', label: 'Performance Stats', align: 'center', fixed: true, width: '300px' },
        { key: 'Action', label: 'Action', align: 'center', fixed: true, width: "100px" },
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <CircularProgress />
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
                cursor: actionLoading ? "none" : "auto",
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
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        zIndex: 10,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <CircularProgress />
                </Box>
            )}

            <Table sx={{ minWidth: '100%' }} size="small">
                <TableHead>
                    <TableRow>
                        {columnHeaders.map((column) => {
                            if (column.hideable && filters.hiddenColumns.includes(column.key)) {
                                return null;
                            }
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
                    {!filters.isSearched &&
                        visibleProducts.length > 0 &&
                        visibleProducts[0] !== 'No Product Found' ? (
                        visibleProducts.map((product, index) => (
                            <ProductRow
                                key={product._id}
                                product={product}
                                index={index}
                            />
                        ))
                    ) : filters.isSearched &&
                        visibleProducts.length > 0 &&
                        visibleProducts[0] !== 'No Product Found' ? (
                        visibleProducts.map((product, index) => {
                            if (product.type === 'variations') {
                                const searchValue = filters.search.trim().toLowerCase();

                                return product.productData
                                    .filter((variation) =>
                                        variation.sku_code
                                            ?.toLowerCase()
                                            .includes(searchValue)
                                    )
                                    .map((variation) => (
                                        <VariationRow
                                            key={variation._id}
                                            variation={variation}
                                            parentProduct={product}
                                        />
                                    ));
                            }

                            // product.type === 'product'
                            return (
                                <ProductRow
                                    key={product._id}
                                    product={product}
                                    index={index}
                                />
                            );
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columnHeaders.length} align="center">
                                <Typography variant="body1" sx={{ p: 3 }}>
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
