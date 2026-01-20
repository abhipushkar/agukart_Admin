import React, { useState, useEffect } from 'react';
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

const RefundPage = () => {
    const [searchParams] = useSearchParams();
    const suborderId = searchParams.get('suborderId');
    const mode = searchParams.get('mode'); // 'refund' or 'cancel'
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [refundData, setRefundData] = useState(null);
    const [isCancelMode, setIsCancelMode] = useState(mode === 'cancel');

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

    // Mock data structure matching API response format
    const mockRefundData = {
        orderId: '111-3068482-1473629',
        suborderId: suborderId || 'SUB-123456',
        currency: 'USD',
        customerName: 'Connie b mason',
        items: [
            {
                orderItemId: 'item-001',
                title: 'Armor ring, sterling silver ring, long ring, shield ring, full finger ring, minimalist ring, big ring, modern ring, plain silver ring',
                image: 'https://example.com/image.jpg',
                quantity: 1,
                price: 37.99,
                voucherApplied: 2.00,
                refundedCash: 0,
                refundedVoucher: 0
            }
        ],
        shipping: {
            paid: 10.00,
            refunded: 0
        }
    };

    // Calculate derived values for an item
    const calculateDerivedValues = (item, shippingData) => {
        const enteredRefund = typeof item.enteredRefund === 'number' ? item.enteredRefund : 0;
        const cashPaid = item.price - item.voucherApplied - item.refundedCash;
        const maxRefundable = item.price - item.refundedCash - item.refundedVoucher;

        // Voucher adjustment calculation - EXACT RULE from requirements
        let voucherAdjustment = 0;
        if (enteredRefund > cashPaid) {
            voucherAdjustment = enteredRefund - cashPaid;
        }

        const netRefund = enteredRefund - voucherAdjustment;
        const maxShippingRefund = shippingData ? shippingData.paid - shippingData.refunded : 0;

        return {
            cashPaid,
            maxRefundable,
            voucherAdjustment,
            netRefund,
            maxShippingRefund
        };
    };

    // Initialize with mock data
    useEffect(() => {
        const initializeData = (data) => {
            const itemsWithDerivedValues = data.items.map(item => {
                const derived = calculateDerivedValues({
                    ...item,
                    enteredRefund: 0
                }, data.shipping);

                return {
                    ...item,
                    enteredRefund: 0,
                    reason: '',
                    ...derived
                };
            });

            const initialRefundData = {
                ...data,
                items: itemsWithDerivedValues,
                shippingRefund: 0,
                maxShippingRefund: data.shipping.paid - data.shipping.refunded
            };

            // If mode is cancel, auto-fill cancel mode
            if (mode === 'cancel') {
                const newItems = initialRefundData.items.map(item => {
                    const maxRefundable = item.price - item.refundedCash - item.refundedVoucher;
                    const updatedItem = {
                        ...item,
                        enteredRefund: maxRefundable,
                        reason: 'Buyer Cancelled'
                    };

                    const derived = calculateDerivedValues(updatedItem, initialRefundData.shipping);

                    return {
                        ...updatedItem,
                        ...derived
                    };
                });

                initialRefundData.items = newItems;
                initialRefundData.shippingRefund = initialRefundData.shipping.paid - initialRefundData.shipping.refunded;
            }

            setRefundData(initialRefundData);
        };

        // Initialize with mock data immediately
        initializeData(mockRefundData);
        setLoading(false);
    }, [suborderId, mode]);

    // Handle item refund amount change - FIXED: Use string value and parse on blur
    const handleItemRefundChange = (index, value) => {
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
    };

    // Handle item refund blur - calculate derived values when user leaves field
    const handleItemRefundBlur = (index) => {
        if (!refundData) return;

        const newItems = [...refundData.items];
        const item = newItems[index];
        const value = item.enteredRefund;

        // Parse the value on blur
        const numValue = value === '' || value === undefined ? 0 : parseFloat(value);
        const validValue = isNaN(numValue) ? 0 : Math.max(0, numValue);

        const updatedItem = {
            ...item,
            enteredRefund: validValue
        };

        // Recalculate derived values
        const derived = calculateDerivedValues(updatedItem, refundData.shipping);

        newItems[index] = {
            ...updatedItem,
            ...derived
        };

        setRefundData({
            ...refundData,
            items: newItems
        });
    };

    // Handle reason change
    const handleReasonChange = (index, reason) => {
        if (!refundData) return;

        const newItems = [...refundData.items];
        newItems[index].reason = reason;

        setRefundData({
            ...refundData,
            items: newItems
        });
    };

    // Handle shipping refund change - FIXED: Use string value
    const handleShippingRefundChange = (value) => {
        if (!refundData) return;

        setRefundData({
            ...refundData,
            shippingRefund: value // Keep as string for typing
        });
    };

    // Handle shipping refund blur
    const handleShippingRefundBlur = () => {
        if (!refundData) return;

        const value = refundData.shippingRefund;
        const numValue = value === '' || value === undefined ? 0 : parseFloat(value);
        const validValue = isNaN(numValue) ? 0 : Math.max(0, numValue);

        setRefundData({
            ...refundData,
            shippingRefund: validValue
        });
    };

    // Toggle cancel mode
    const toggleCancelMode = () => {
        if (!refundData) return;

        const newCancelMode = !isCancelMode;
        setIsCancelMode(newCancelMode);

        searchParams.set("mode", isCancelMode ? "refund" : "cancel")

        if (newCancelMode) {
            // Auto-fill maximum refundable amounts for all items
            const newItems = refundData.items.map(item => {
                const maxRefundable = item.price - item.refundedCash - item.refundedVoucher;
                const updatedItem = {
                    ...item,
                    enteredRefund: maxRefundable,
                    reason: 'Buyer Cancelled'
                };

                // Recalculate derived values
                const derived = calculateDerivedValues(updatedItem, refundData.shipping);

                return {
                    ...updatedItem,
                    ...derived
                };
            });

            // Auto-fill shipping refund (full shipping amount)
            setRefundData({
                ...refundData,
                items: newItems,
                shippingRefund: refundData.shipping.paid - refundData.shipping.refunded
            });
        } else {
            // Reset to zero
            const newItems = refundData.items.map(item => {
                const updatedItem = {
                    ...item,
                    enteredRefund: 0,
                    reason: ''
                };

                const derived = calculateDerivedValues(updatedItem, refundData.shipping);

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
    };

    // Calculate totals for the summary panel
    const calculateTotals = () => {
        if (!refundData) return {
            refundAmount: 0,
            voucherAdjustment: 0,
            amountToRefund: 0
        };

        const refundAmount = refundData.items.reduce((sum, item) => {
            const entered = typeof item.enteredRefund === 'number' ? item.enteredRefund : 0;
            return sum + entered;
        }, 0) + (typeof refundData.shippingRefund === 'number' ? refundData.shippingRefund : 0);

        const voucherAdjustment = refundData.items.reduce((sum, item) => {
            return sum + (item.voucherAdjustment || 0);
        }, 0);

        const amountToRefund = refundAmount - voucherAdjustment;

        return {
            refundAmount,
            voucherAdjustment,
            amountToRefund
        };
    };

    // Validate form - EXACT rules from requirements (no blocking of voucher-adjusted amounts)
    const validateForm = () => {
        if (!refundData) return false;

        // Rule 1: Any item has refund > 0 and no reason selected
        const hasInvalidReason = refundData.items.some(item => {
            const entered = typeof item.enteredRefund === 'number' ? item.enteredRefund : 0;
            return entered > 0 && !item.reason;
        });

        if (hasInvalidReason) return false;

        // Rule 2: Amount to refund < 0
        const totals = calculateTotals();
        if (totals.amountToRefund < 0) return false;

        // Rule 3: Entered refund exceeds remaining refundable amount (after voucher)
        const exceedsMaxRefundable = refundData.items.some(item => {
            const entered = typeof item.enteredRefund === 'number' ? item.enteredRefund : 0;
            const maxRefundable = item.price - item.refundedCash - item.refundedVoucher;
            return entered > maxRefundable;
        });

        if (exceedsMaxRefundable) return false;

        // Rule 4: Shipping refund exceeds remaining shipping
        const shippingRefund = typeof refundData.shippingRefund === 'number' ? refundData.shippingRefund : 0;
        const maxShippingRefund = refundData.shipping.paid - refundData.shipping.refunded;
        if (shippingRefund > maxShippingRefund) return false;

        return true;
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) {
            alert('Please fix validation errors before submitting');
            return;
        }

        // Mock success for now
        alert(`Refund ${isCancelMode ? 'cancellation' : 'request'} submitted successfully!\n\n` +
            `Amount to refund: $${calculateTotals().amountToRefund.toFixed(2)}\n` +
            `This is a demo - API integration pending.`);

        // For demo: show what would be sent
        console.log('Would submit payload:', {
            type: isCancelMode ? 'CANCEL' : 'REFUND',
            items: refundData.items.map(item => ({
                orderItemId: item.orderItemId,
                reasonCode: item.reason,
                enteredRefund: typeof item.enteredRefund === 'number' ? item.enteredRefund : 0,
                voucherAdjustment: item.voucherAdjustment || 0,
                netRefund: item.netRefund || 0
            })),
            shippingRefund: typeof refundData.shippingRefund === 'number' ? refundData.shippingRefund : 0
        });
    };

    // Handle cancel
    const handleCancel = () => {
        navigate(-1); // Go back to previous page
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Alert severity="error">{error}</Alert>
                <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                    Go Back
                </Button>
            </Box>
        );
    }

    // Show UI even if refundData is null
    if (!refundData) {
        return (
            <Box p={3}>
                <Alert severity="info">Initializing refund interface...</Alert>
            </Box>
        );
    }

    const totals = calculateTotals();
    const isFormValid = validateForm();
    const shippingRefund = typeof refundData.shippingRefund === 'number' ? refundData.shippingRefund : 0;
    const shippingValidationError = shippingRefund > refundData.maxShippingRefund;

    // Format display value for inputs (convert number to string for display)
    const formatDisplayValue = (value) => {
        if (value === undefined || value === null) return '';
        if (typeof value === 'number') return value.toString();
        return value;
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
            {/* Header - EXACT text from screenshot */}
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
                Refund Or Cancel Order
            </Typography>

            {/* Demo notice */}
            <Alert severity="info" sx={{ mb: 3 }}>
                Demo Mode: Using mock data. API integration pending.
                {suborderId && ` Suborder ID: ${suborderId}`}
                {mode && ` Mode: ${mode}`}
            </Alert>

            {/* Cancel Mode Toggle */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <Button
                    variant={isCancelMode ? "contained" : "outlined"}
                    onClick={toggleCancelMode}
                    sx={{ mr: 2 }}
                >
                    Cancel instead of refund
                </Button>
                {isCancelMode && (
                    <Typography variant="body2" color="warning.main">
                        All items will be fully refunded
                    </Typography>
                )}
            </Box>

            <Grid container spacing={3}>
                {/* Left Column - Refund Items Table */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            {/* Section header - EXACT text from screenshot */}
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                Ordered items
                            </Typography>

                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Order Amount</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Before Refunded</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Amount to refund</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {refundData.items.map((item, index) => {
                                            const beforeRefunded = item.refundedCash + item.refundedVoucher;

                                            return (
                                                <React.Fragment key={item.orderItemId}>
                                                    {/* Main Item Row */}
                                                    <TableRow>
                                                        <TableCell>
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                    {item.title}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Quantity: {item.quantity}
                                                                </Typography>
                                                                {!isCancelMode && (
                                                                    <FormControl fullWidth size="small" sx={{ mt: 1, minWidth: 200 }}>
                                                                        <InputLabel>Reason for refund</InputLabel>
                                                                        <Select
                                                                            value={item.reason}
                                                                            onChange={(e) => handleReasonChange(index, e.target.value)}
                                                                            label="Reason for refund"
                                                                            disabled={isCancelMode}
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
                                                        <TableCell align="right">
                                                            ${item.price.toFixed(2)}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            ${beforeRefunded.toFixed(2)}
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
                                                                disabled={isCancelMode}
                                                                sx={{ width: 120 }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>

                                                    {/* Voucher Discount Row (Conditional) - EXACT label from screenshot */}
                                                    {item.voucherAdjustment > 0 && (
                                                        <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                                            <TableCell colSpan={3}>
                                                                <Typography variant="body2" sx={{ fontWeight: 500, ml: 2 }}>
                                                                    Agukart Voucher Discount
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Typography variant="body2" color="error.main">
                                                                    -${item.voucherAdjustment.toFixed(2)}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}

                                        {/* Shipping Row */}
                                        <TableRow>
                                            <TableCell colSpan={4}>
                                                <Divider sx={{ my: 1 }} />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    Shipping
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                ${refundData.shipping.paid.toFixed(2)}
                                            </TableCell>
                                            <TableCell align="right">
                                                ${refundData.shipping.refunded.toFixed(2)}
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
                                                    disabled={isCancelMode}
                                                    sx={{ width: 120 }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Note to yourself section - EXACT text from screenshot */}
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
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Column - Refund Summary Panel */}
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

                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Refund summary
                            </Typography>

                            {/* Refund Amount */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Refund amount</Typography>
                                <Typography variant="body2">
                                    ${totals.refundAmount.toFixed(2)}
                                </Typography>
                            </Box>

                            {/* Return Shipping */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Return shipping</Typography>
                                <Typography variant="body2">
                                    ${shippingRefund.toFixed(2)}
                                </Typography>
                            </Box>

                            {/* Voucher Adjustment (Conditional) - EXACT label from screenshot */}
                            {totals.voucherAdjustment > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">Agukart Voucher Adjustment</Typography>
                                    <Typography variant="body2" color="error.main">
                                        -${totals.voucherAdjustment.toFixed(2)}
                                    </Typography>
                                </Box>
                            )}

                            <Divider sx={{ my: 2 }} />

                            {/* Amount to refund */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    Amount to refund
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    ${totals.amountToRefund.toFixed(2)}
                                </Typography>
                            </Box>

                            {/* Action Buttons - EXACT text from screenshot */}
                            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleSubmit}
                                    disabled={!isFormValid}
                                >
                                    Submit refund
                                </Button>
                            </Box>

                            {!isFormValid && (
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    {shippingValidationError ?
                                        'Shipping refund cannot exceed remaining shipping amount' :
                                        'Please fix all validation errors before submitting'
                                    }
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default RefundPage;
