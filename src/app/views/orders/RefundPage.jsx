import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Select,
    MenuItem,
    TextField,
    Button,
    Grid,
    InputAdornment,
    FormControl,
    InputLabel,
    Card,
    CardContent,
    Alert,
    Divider,
    CircularProgress
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ApiService } from 'app/services/ApiService';
import { toast } from 'react-toastify';
import { localStorageKey } from 'app/constant/localStorageKey';

const RefundPage = () => {
    const [searchParams] = useSearchParams();
    const authToken = localStorage.getItem(localStorageKey.auth_key);
    const suborderId = searchParams.get('subOrder');
    const mode = searchParams.get('mode'); // 'refund' or 'cancel'
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refundData, setRefundData] = useState(null);
    const [isCancelMode, setIsCancelMode] = useState(mode === 'cancel');
    const [internalNotes, setInternalNotes] = useState('');

    // Refund reasons EXACTLY as per screenshot - with correct casing
    const refundReasons = [
        'Could Not Ship',
        'Customer Return',
        'General Adjustment',
        'Buyer Cancelled',
        'Different Item',
        'Product not as described',
        'Shipping Address Undeliverable',
        'No Inventory',
        'Order not received',
        'Pricing Error'
    ];

    // Function to strip HTML from title
    const stripHtml = useCallback((html) => {
        if (!html) return '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
    }, []);

    // Function to get full image URL
    const getImageUrl = useCallback((imageName) => {
        if (!imageName) return '';
        // Check if it's already a full URL
        if (imageName.startsWith('http')) {
            return imageName;
        }
        // Handle different possible image formats
        return `https://api.agukart.com/uploads/product/${imageName}`;
    }, []);

    // Calculate derived values for an item - REALTIME CALCULATION
    const calculateItemDerivedValues = useCallback((item) => {
        const enteredRefund = typeof item.enteredRefund === 'number' ? item.enteredRefund : 0;
        const cashPaid = item.price - item.voucherApplied - (item.refundedCash || 0);

        // Calculate max refundable based on original price minus what's already refunded
        const maxRefundable = Math.max(0, item.price - (item.refundedCash || 0) - (item.refundedVoucher || 0));

        // Voucher adjustment calculation
        let voucherAdjustment = 0;
        if (enteredRefund > cashPaid) {
            voucherAdjustment = Math.min(enteredRefund - cashPaid, item.voucherApplied || 0);
        }

        const netRefund = Math.max(0, enteredRefund - voucherAdjustment);

        return {
            cashPaid,
            maxRefundable,
            voucherAdjustment,
            netRefund
        };
    }, []);

    // Fetch refund context from backend API
    const fetchRefundContext = useCallback(async () => {
        if (!suborderId) {
            setError('Suborder ID is required');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await ApiService.get(`refund-context/${suborderId}`, authToken);

            if (response.data) {
                const apiData = response.data;

                // Transform API response to match UI data structure
                const transformedData = {
                    orderId: apiData.order_id,
                    suborderId: apiData.sub_order_id,
                    currency: apiData.currency,
                    customerName: apiData.customer_name || 'Customer',
                    items: apiData.items.map(item => ({
                        orderItemId: item.item_id,
                        title: stripHtml(item.title),
                        rawTitle: item.title,
                        image: getImageUrl(item.image),
                        quantity: item.quantity,
                        price: item.amount,
                        // Note: The actual API might not have these fields yet
                        voucherApplied: item.voucher_applied || 0,
                        refundedCash: item.refunded_cash_amount || 0,
                        refundedVoucher: item.refunded_voucher_amount || 0,
                        // Frontend state fields
                        enteredRefund: 0,
                        reason: '',
                    })),
                    shipping: {
                        paid: apiData.shipping?.paid || 0,
                        refunded: apiData.shipping?.refunded || 0
                    }
                };

                // Calculate initial derived values for each item
                const itemsWithCalculations = transformedData.items.map(item => {
                    const calculated = calculateItemDerivedValues({
                        ...item,
                        enteredRefund: 0
                    });
                    return {
                        ...item,
                        ...calculated
                    };
                });

                const initialRefundData = {
                    ...transformedData,
                    items: itemsWithCalculations,
                    shippingRefund: 0,
                    maxShippingRefund: transformedData.shipping.paid - transformedData.shipping.refunded
                };

                // If mode is cancel, auto-fill cancel mode
                if (mode === 'cancel') {
                    const newItems = initialRefundData.items.map(item => {
                        const maxRefundable = Math.max(0, item.price - item.refundedCash - item.refundedVoucher);
                        const updatedItem = {
                            ...item,
                            enteredRefund: maxRefundable,
                            reason: 'Buyer Cancelled'
                        };
                        const derived = calculateItemDerivedValues(updatedItem);
                        return {
                            ...updatedItem,
                            ...derived
                        };
                    });

                    initialRefundData.items = newItems;
                    initialRefundData.shippingRefund = initialRefundData.shipping.paid - initialRefundData.shipping.refunded;
                }

                setRefundData(initialRefundData);
                setError(null);
            }
        } catch (error) {
            console.error('Error fetching refund context:', error);
            setError('Failed to load refund data. Please try again.');
            toast.error('Failed to load refund data');
        } finally {
            setLoading(false);
        }
    }, [authToken, mode, suborderId, stripHtml, getImageUrl, calculateItemDerivedValues]);

    // Initialize with backend API data
    useEffect(() => {
        if (suborderId) {
            fetchRefundContext();
        } else {
            setError('No suborder ID provided');
            setLoading(false);
        }
    }, [suborderId, mode, fetchRefundContext]);

    // Handle item refund amount change with realtime calculation
    const handleItemRefundChange = useCallback((index, value) => {
        if (!refundData) return;

        const newItems = [...refundData.items];
        newItems[index] = {
            ...newItems[index],
            enteredRefund: value // Keep as string for typing
        };

        setRefundData({
            ...refundData,
            items: newItems
        });
    }, [refundData]);

    // Handle item refund blur with realtime calculation
    const handleItemRefundBlur = useCallback((index) => {
        if (!refundData) return;

        const newItems = [...refundData.items];
        const item = newItems[index];
        const value = item.enteredRefund;

        // Parse the value on blur
        const numValue = value === '' || value === undefined ? 0 : parseFloat(value);
        const maxRefundable = Math.max(0, item.price - item.refundedCash - item.refundedVoucher);
        const validValue = isNaN(numValue) ? 0 : Math.max(0, Math.min(numValue, maxRefundable));

        const updatedItem = {
            ...item,
            enteredRefund: validValue
        };

        // Recalculate derived values in realtime
        const derived = calculateItemDerivedValues(updatedItem);

        newItems[index] = {
            ...updatedItem,
            ...derived
        };

        setRefundData({
            ...refundData,
            items: newItems
        });
    }, [refundData, calculateItemDerivedValues]);

    // Handle reason change
    const handleReasonChange = useCallback((index, reason) => {
        if (!refundData) return;

        const newItems = [...refundData.items];
        newItems[index].reason = reason;

        setRefundData({
            ...refundData,
            items: newItems
        });
    }, [refundData]);

    // Handle shipping refund change
    const handleShippingRefundChange = useCallback((value) => {
        if (!refundData) return;

        setRefundData({
            ...refundData,
            shippingRefund: value
        });
    }, [refundData]);

    // Handle shipping refund blur
    const handleShippingRefundBlur = useCallback(() => {
        if (!refundData) return;

        const value = refundData.shippingRefund;
        const numValue = value === '' || value === undefined ? 0 : parseFloat(value);
        const maxShipping = refundData.shipping.paid - refundData.shipping.refunded;
        const validValue = isNaN(numValue) ? 0 : Math.max(0, Math.min(numValue, maxShipping));

        setRefundData({
            ...refundData,
            shippingRefund: validValue
        });
    }, [refundData]);

    // Handle internal notes change
    const handleNotesChange = useCallback((e) => {
        setInternalNotes(e.target.value);
    }, []);

    // Toggle cancel mode with realtime calculations
    const toggleCancelMode = useCallback(() => {
        if (!refundData) return;

        const newCancelMode = !isCancelMode;
        setIsCancelMode(newCancelMode);

        if (newCancelMode) {
            // Auto-fill maximum refundable amounts for all items with realtime calculation
            const newItems = refundData.items.map(item => {
                const maxRefundable = Math.max(0, item.price - item.refundedCash - item.refundedVoucher);
                const updatedItem = {
                    ...item,
                    enteredRefund: maxRefundable,
                    reason: 'Buyer Cancelled'
                };
                const derived = calculateItemDerivedValues(updatedItem);
                return {
                    ...updatedItem,
                    ...derived
                };
            });

            // Auto-fill shipping refund
            setRefundData({
                ...refundData,
                items: newItems,
                shippingRefund: refundData.shipping.paid - refundData.shipping.refunded
            });
        } else {
            // Reset to zero with realtime calculation
            const newItems = refundData.items.map(item => {
                const updatedItem = {
                    ...item,
                    enteredRefund: 0,
                    reason: ''
                };
                const derived = calculateItemDerivedValues(updatedItem);
                return {
                    ...updatedItem,
                    ...derived
                };
            });

            setRefundData({
                ...refundData,
                items: newItems,
                shippingRefund: 0
            });
        }
    }, [refundData, isCancelMode, calculateItemDerivedValues]);

    // REAL-TIME CALCULATIONS FOR SUMMARY - Using useMemo for performance
    const summaryCalculations = useMemo(() => {
        if (!refundData) {
            return {
                totalItemRefund: 0,
                totalShippingRefund: 0,
                totalRefundAmount: 0,
                totalVoucherAdjustment: 0,
                netAmountToRefund: 0,
                totalBeforeRefunded: 0,
                totalOrderAmount: 0,
                remainingRefundable: 0
            };
        }

        // Calculate totals from items with realtime updates
        const totals = refundData.items.reduce((acc, item) => {
            const enteredRefund = typeof item.enteredRefund === 'number' ? item.enteredRefund : 0;
            const voucherAdjustment = item.voucherAdjustment || 0;
            const netRefund = item.netRefund || 0;
            const beforeRefunded = (item.refundedCash || 0) + (item.refundedVoucher || 0);
            const remaining = Math.max(0, item.price - beforeRefunded - enteredRefund);

            return {
                totalItemRefund: acc.totalItemRefund + enteredRefund,
                totalVoucherAdjustment: acc.totalVoucherAdjustment + voucherAdjustment,
                totalNetRefund: acc.totalNetRefund + netRefund,
                totalBeforeRefunded: acc.totalBeforeRefunded + beforeRefunded,
                totalOrderAmount: acc.totalOrderAmount + item.price,
                remainingRefundable: acc.remainingRefundable + remaining
            };
        }, {
            totalItemRefund: 0,
            totalVoucherAdjustment: 0,
            totalNetRefund: 0,
            totalBeforeRefunded: 0,
            totalOrderAmount: 0,
            remainingRefundable: 0
        });

        const shippingRefund = typeof refundData.shippingRefund === 'number' ? refundData.shippingRefund : 0;
        const totalRefundAmount = totals.totalItemRefund + shippingRefund;
        const netAmountToRefund = totalRefundAmount - totals.totalVoucherAdjustment;

        return {
            totalItemRefund: totals.totalItemRefund,
            totalShippingRefund: shippingRefund,
            totalRefundAmount,
            totalVoucherAdjustment: totals.totalVoucherAdjustment,
            netAmountToRefund,
            totalBeforeRefunded: totals.totalBeforeRefunded,
            totalOrderAmount: totals.totalOrderAmount,
            remainingRefundable: totals.remainingRefundable,
            maxShippingRefund: refundData.maxShippingRefund || 0
        };
    }, [refundData]);

    // Validate form with realtime calculations
    const validateForm = useCallback(() => {
        if (!refundData) return false;

        // Rule 1: Any item has refund > 0 and no reason selected
        const hasInvalidReason = refundData.items.some(item => {
            const entered = typeof item.enteredRefund === 'number' ? item.enteredRefund : 0;
            return entered > 0 && !item.reason;
        });

        if (hasInvalidReason) return false;

        // Rule 2: Check if any refund exceeds max refundable
        const exceedsMaxRefundable = refundData.items.some(item => {
            const entered = typeof item.enteredRefund === 'number' ? item.enteredRefund : 0;
            const maxRefundable = Math.max(0, item.price - item.refundedCash - item.refundedVoucher);
            return entered > maxRefundable;
        });

        if (exceedsMaxRefundable) return false;

        // Rule 3: Shipping refund exceeds remaining shipping
        const shippingRefund = typeof refundData.shippingRefund === 'number' ? refundData.shippingRefund : 0;
        const maxShippingRefund = refundData.shipping.paid - refundData.shipping.refunded;
        if (shippingRefund > maxShippingRefund) return false;

        // Rule 4: Check if net amount to refund is negative
        if (summaryCalculations.netAmountToRefund < 0) return false;

        return true;
    }, [refundData, summaryCalculations]);

    // Handle refund submission
    const handleRefundSubmit = async () => {
        if (!validateForm()) {
            toast.error('Please fix validation errors before submitting');
            return;
        }

        try {
            setLoading(true);

            // Prepare items payload with calculated values
            const itemsPayload = refundData.items
                .filter(item => {
                    const entered = typeof item.enteredRefund === 'number' ? item.enteredRefund : 0;
                    return entered > 0;
                })
                .map(item => ({
                    item_id: item.orderItemId,
                    reason_code: item.reason,
                    entered_refund_amount: typeof item.enteredRefund === 'number' ? item.enteredRefund : 0,
                    voucher_adjustment_amount: item.voucherAdjustment || 0,
                    net_refund_amount: item.netRefund || 0,
                }));

            const payload = {
                items: itemsPayload,
                shipping_refund: typeof refundData.shippingRefund === 'number' ? refundData.shippingRefund : 0,
                notes: internalNotes || '',
            };

            const response = await ApiService.post(`refund/${suborderId}`, payload, authToken);

            if (response.data) {
                toast.success('Refund submitted successfully!');
                navigate(-1);
            }
        } catch (error) {
            console.error('Error submitting refund:', error);
            toast.error(error?.response?.data?.message || 'Failed to submit refund');
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel submission
    const handleCancelSubmit = async () => {
        try {
            setLoading(true);

            const payload = {
                notes: internalNotes || ''
            };

            const response = await ApiService.post(`cancel/${suborderId}`, payload, authToken);

            if (response.data) {
                toast.success('Order cancelled successfully!');
                navigate(-1);
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error(error?.response?.data?.message || 'Failed to cancel order');
        } finally {
            setLoading(false);
        }
    };

    // Handle form submission based on mode
    const handleSubmit = async () => {
        if (isCancelMode) {
            await handleCancelSubmit();
        } else {
            await handleRefundSubmit();
        }
    };

    // Handle cancel
    const handleCancel = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    // Retry loading refund context
    const handleRetry = useCallback(() => {
        fetchRefundContext();
    }, [fetchRefundContext]);

    // Format display value for inputs
    const formatDisplayValue = useCallback((value) => {
        if (value === undefined || value === null) return '';
        if (typeof value === 'number') return value.toString();
        return value;
    }, []);

    if (loading && !refundData) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading refund data...</Typography>
            </Box>
        );
    }

    if (error && !refundData) {
        return (
            <Box p={3}>
                <Alert severity="error">{error}</Alert>
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button onClick={handleCancel}>
                        Go Back
                    </Button>
                    <Button variant="contained" onClick={handleRetry}>
                        Retry
                    </Button>
                </Box>
            </Box>
        );
    }

    if (!refundData) {
        return (
            <Box p={3}>
                <Alert severity="info">Initializing refund interface...</Alert>
            </Box>
        );
    }

    const isFormValid = validateForm();
    const shippingValidationError = summaryCalculations.totalShippingRefund > summaryCalculations.maxShippingRefund;

    return (
        <Box sx={{ p: 3, maxWidth: 1440, margin: '0 auto' }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
                Refund Or Cancel Order
            </Typography>

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <Button
                    variant={isCancelMode ? "contained" : "outlined"}
                    onClick={toggleCancelMode}
                    sx={{ mr: 2 }}
                    disabled={loading}
                >
                    Cancel instead of refund
                </Button>
                {isCancelMode && (
                    <Typography variant="body2" color="warning.main">
                        All items will be fully refunded
                    </Typography>
                )}
            </Box>

            {loading && (
                <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        Processing...
                    </Typography>
                </Box>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                Ordered items
                            </Typography>

                            <TableContainer component={Paper} variant="outlined" sx={{
                                p: 2
                            }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }} align='center'>Image</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Order Amount</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Before Refunded</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Amount to refund</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {refundData.items.map((item, index) => {
                                            const beforeRefunded = (item.refundedCash || 0) + (item.refundedVoucher || 0);

                                            return (
                                                <React.Fragment key={item.orderItemId}>
                                                    <TableRow>
                                                        <TableCell>
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                                                                    {item.title}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary" display="block">
                                                                    Quantity: {item.quantity}
                                                                </Typography>
                                                                {!isCancelMode && (
                                                                    <FormControl fullWidth size="small" sx={{ mt: 1, minWidth: 200 }}>
                                                                        <InputLabel>Reason for refund</InputLabel>
                                                                        <Select
                                                                            value={item.reason}
                                                                            onChange={(e) => handleReasonChange(index, e.target.value)}
                                                                            label="Reason for refund"
                                                                            disabled={isCancelMode || loading}
                                                                        >
                                                                            <MenuItem value="">
                                                                                <em>Select a reason</em>
                                                                            </MenuItem>
                                                                            {refundReasons.map(reason => (
                                                                                <MenuItem key={reason} value={reason}>
                                                                                    {reason}
                                                                                </MenuItem>
                                                                            ))}
                                                                        </Select>
                                                                    </FormControl>
                                                                )}
                                                                {isCancelMode && (
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        Reason: {item.reason}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align='right' sx={{
                                                            p: 0,
                                                        }}>
                                                            {item.image && (
                                                                <Box
                                                                    component="img"
                                                                    src={item.image}
                                                                    alt={item.title}
                                                                    sx={{
                                                                        width: 130,
                                                                        height: 130,
                                                                        objectFit: 'cover',
                                                                        borderRadius: 1
                                                                    }}
                                                                    onError={(e) => {
                                                                        e.target.src = 'https://via.placeholder.com/130x130?text=No+Image';
                                                                    }}
                                                                />
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            ${item.price?.toFixed(2)}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            ${beforeRefunded?.toFixed(2)}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <TextField
                                                                type="number"
                                                                size="small"
                                                                value={formatDisplayValue(item.enteredRefund)}
                                                                onChange={(e) => handleItemRefundChange(index, e.target.value)}
                                                                onBlur={() => handleItemRefundBlur(index)}
                                                                InputProps={{
                                                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                                }}
                                                                disabled={isCancelMode || loading}
                                                                sx={{ width: 120 }}
                                                                inputProps={{
                                                                    step: "0.01",
                                                                    min: "0",
                                                                    max: Math.max(0, item.price - item.refundedCash - item.refundedVoucher)
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>

                                                    {item.voucherAdjustment > 0 && (
                                                        <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                                            <TableCell colSpan={4}>
                                                                <Typography variant="body2" sx={{ fontWeight: 500, ml: 2 }}>
                                                                    Agukart Voucher Discount
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Typography variant="body2" color="error.main">
                                                                    -${item.voucherAdjustment?.toFixed(2)}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}

                                        <TableRow>
                                            <TableCell colSpan={5}>
                                                <Divider sx={{ my: 1 }} />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    Shipping
                                                </Typography>
                                            </TableCell>
                                            <TableCell></TableCell>
                                            <TableCell align="right">
                                                ${refundData.shipping.paid?.toFixed(2)}
                                            </TableCell>
                                            <TableCell align="right">
                                                ${refundData.shipping.refunded?.toFixed(2)}
                                            </TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    value={formatDisplayValue(refundData.shippingRefund)}
                                                    onChange={(e) => handleShippingRefundChange(e.target.value)}
                                                    onBlur={handleShippingRefundBlur}
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                    }}
                                                    disabled={isCancelMode || loading}
                                                    sx={{ width: 120 }}
                                                    inputProps={{
                                                        step: "0.01",
                                                        min: "0",
                                                        max: summaryCalculations.maxShippingRefund
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Box sx={{ mt: 3 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Note to yourself:
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    placeholder="Add any internal notes..."
                                    variant="outlined"
                                    size="small"
                                    value={internalNotes}
                                    onChange={handleNotesChange}
                                    disabled={loading}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Column - Refund Summary Panel with REAL-TIME CALCULATIONS */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Order summary
                            </Typography>

                            <Typography variant="body2" gutterBottom>
                                Customer: {refundData.customerName}
                            </Typography>
                            <Typography variant="body2" gutterBottom sx={{ mb: 3 }}>
                                Order ID: {refundData.orderId}
                            </Typography>

                            <Divider sx={{ my: 2 }} />

                            {/* Order Totals Section */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Order Totals
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2">Items Total:</Typography>
                                    <Typography variant="body2">
                                        ${summaryCalculations.totalOrderAmount.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2">Shipping:</Typography>
                                    <Typography variant="body2">
                                        ${refundData.shipping.paid.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2">Already Refunded:</Typography>
                                    <Typography variant="body2">
                                        ${summaryCalculations.totalBeforeRefunded.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Remaining Refundable:</Typography>
                                    <Typography variant="body2" color="primary.main" fontWeight={500}>
                                        ${summaryCalculations.remainingRefundable.toFixed(2)}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Refund summary
                            </Typography>

                            {/* Item Refunds */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Item refunds:</Typography>
                                <Typography variant="body2">
                                    ${summaryCalculations.totalItemRefund.toFixed(2)}
                                </Typography>
                            </Box>

                            {/* Shipping Refund */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Shipping refund:</Typography>
                                <Typography variant="body2">
                                    ${summaryCalculations.totalShippingRefund.toFixed(2)}
                                </Typography>
                            </Box>

                            {/* Subtotal */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, pt: 1 }}>
                                <Typography variant="body2" fontWeight={500}>
                                    Subtotal:
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    ${summaryCalculations.totalRefundAmount.toFixed(2)}
                                </Typography>
                            </Box>

                            {/* Voucher Adjustment */}
                            {/* {summaryCalculations.totalVoucherAdjustment > 0 && ( */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Agukart Voucher Adjustment:</Typography>
                                <Typography variant="body2" color="error.main">
                                    -${summaryCalculations.totalVoucherAdjustment.toFixed(2)}
                                </Typography>
                            </Box>
                            {/* )} */}

                            <Divider sx={{ my: 2 }} />

                            {/* Amount to refund - MAIN TOTAL */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                mb: 3,
                                p: 2,
                                backgroundColor: 'action.hover',
                                borderRadius: 1
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Amount to refund:
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                    ${summaryCalculations.netAmountToRefund.toFixed(2)}
                                </Typography>
                            </Box>

                            {/* Validation Messages */}
                            {!isFormValid && !loading && (
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    {shippingValidationError ?
                                        'Shipping refund cannot exceed remaining shipping amount' :
                                        'Please fix all validation errors before submitting'
                                    }
                                </Alert>
                            )}

                            {/* Action Buttons */}
                            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleSubmit}
                                    disabled={!isFormValid || loading}
                                >
                                    {isCancelMode ? 'Submit cancel' : 'Submit refund'}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default RefundPage;
