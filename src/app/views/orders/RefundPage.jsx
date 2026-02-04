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
    Select,
    MenuItem,
    TextField,
    Button,
    Grid,
    InputAdornment,
    FormControl,
    InputLabel,
    Alert,
    CircularProgress,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { ApiService } from 'app/services/ApiService';
import { localStorageKey } from 'app/constant/localStorageKey';

const RefundPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const suborderId = searchParams.get('subOrder');
    const mode = searchParams.get('mode');
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [refundData, setRefundData] = useState(null);
    const [isCancelMode, setIsCancelMode] = useState(mode === 'cancel');
    const [isFormValid, setIsFormValid] = useState(true);

    const currencySymbols = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        CAD: '$',
        AUD: '$',
        JPY: '¥',
        INR: '₹'
    };

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

    const parseNumber = (value) => {
        if (value === '' || value === undefined || value === null) return 0;
        const num = parseFloat(value);
        return isNaN(num) ? 0 : Math.max(0, num);
    };
    const updateItemAtIndex = (items, index, updater) =>
        items.map((item, i) => (i === index ? updater(item) : item));

    const initializeData = useCallback(async (mode, res) => {
        try {
            const auth_key = localStorage.getItem(localStorageKey.auth_key);
            res = await ApiService.get(`refund-context/${suborderId}`, auth_key);
        } catch (error) {
            setError({ "message": error })
            console.log('error fetching', error);
        }
        const data = res.data;
        const itemsWithDerivedValues = data.items.map(item => {
            return {
                ...item,
                title: item.title?.replace(/<\/?[^>]+(>|$)/g, ""),
                entered_refund_amount: 0,
                net_refund_amount: 0,
                reason_code: '',
                voucher_adjustment_amount: 0,
            };
        });

        let initialRefundData = {
            ...data,
            items: itemsWithDerivedValues,
            note_to_yourself: '',
            shipping_refund: 0,
            entered_shipping_refund: 0,
        };

        if (mode === 'cancel') {
            const shippingRefund = initialRefundData.shipping.paid - initialRefundData.shipping.refunded;
            initialRefundData = {
                ...initialRefundData,
                items: initialRefundData.items.map(item => {
                    const maxRefundable = item.amount - parseNumber(item.refunded_cash_amount);
                    return {
                        ...item,
                        entered_refund_amount: maxRefundable,
                        net_refund_amount: maxRefundable,
                        reason_code: 'Buyer Cancelled'
                    };
                }),
                shipping_refund: shippingRefund
            };
        }
        console.log("initial", initialRefundData);
        setRefundData(initialRefundData);
    }, []);


    useEffect(() => {
        initializeData(mode);
        setLoading(false);
    }, [suborderId, mode]);


    // Handle item refund amount change - FIXED: Use string value and parse on blur
    const handleItemRefundChange = (index, value) => {
        setRefundData(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                items: updateItemAtIndex(prev.items, index, item => ({
                    ...item,
                    entered_refund_amount: value,
                    net_refund_amount: value,
                }))
            };
        });
    };

    // Handle item refund blur - calculate derived values when user leaves field
    const handleItemRefundBlur = (index) => {
        setRefundData(prev => {
            if (!prev) return prev;

            const items = updateItemAtIndex(prev.items, index, item => {
                const validValue = parseNumber(item.entered_refund_amount);
                const maxAllowed = item.amount - item.refunded_cash_amount;
                if (validValue > maxAllowed) return item;
                const updatedItem = {
                    ...item,
                    entered_refund_amount: validValue,
                    net_refund_amount: validValue
                };

                return {
                    ...updatedItem,
                };
            });

            return {
                ...prev,
                items
            };
        });
    };

    // Handle reason_code change
    const handleReasonChange = (index, reason_code) => {
        setRefundData(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                items: updateItemAtIndex(prev.items, index, item => ({
                    ...item,
                    reason_code
                }))
            };
        });
    };

    // Handle shipping refund change - FIXED: Use string value
    const handleShippingRefundChange = (value) => {
        setRefundData(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                entered_shipping_refund: value
            };
        });
    };

    // Handle shipping refund blur
    const handleShippingRefundBlur = () => {
        setRefundData(prev => {
            if (!prev) return prev;

            const num = parseNumber(prev.entered_shipping_refund);
            const maxAllowed = prev.shipping.paid - prev.shipping.refunded;

            return {
                ...prev,
                entered_shipping_refund: Math.min(num, maxAllowed),
                shipping_refund: Math.min(num, maxAllowed),
            };
        });
    };


    const handleVoucherChange = (index, value) => {
        setRefundData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                items: updateItemAtIndex(prev.items, index, item => ({
                    ...item,
                    voucher_adjustment_amount: value,
                }))
            };
        });
    };

    const handleVoucherChangeBlur = (index) => {
        setRefundData(prev => {
            if (!prev) return prev;

            const items = updateItemAtIndex(prev.items, index, item => {
                const validValue = parseNumber(item.voucher_adjustment_amount);
                const maxAllowed = item.refunded_voucher_amount
                if (item.voucher_adjustment_amount > maxAllowed) return item;
                return {
                    ...item,
                    voucher_adjustment_amount: validValue
                };
            });
            return {
                ...prev,
                items
            };
        });
    };


    useEffect(() => {
        if (!refundData) {
            setIsFormValid(false);
            return;
        }

        const isValid = refundData.items.every(item => {
            const maxAllowed = item.amount - item.refunded_cash_amount;

            if (item.entered_refund_amount > maxAllowed) return false;
            if (item.entered_refund_amount > 0 && !item.reason_code) return false;

            return true;
        });
        if (refundData.shipping_refund > (refundData.shipping.paid - refundData.shipping.refunded)) {
            setIsFormValid(false);
            return;
        }
        setIsFormValid(isValid);
    }, [refundData]);

    // Toggle cancel mode
    const toggleCancelMode = () => {
        if (!refundData) return;

        const newCancelMode = !isCancelMode;
        setIsCancelMode(newCancelMode);

        const newParams = new URLSearchParams(searchParams);
        newParams.set("mode", newCancelMode ? "cancel" : "refund");
        setSearchParams(newParams);

        if (newCancelMode) {
            const newItems = refundData.items.map(item => {
                const maxRefundable = item.amount - parseNumber(item.refunded_cash_amount);
                return {
                    ...item,
                    entered_refund_amount: maxRefundable,
                    net_refund_amount: maxRefundable,
                    reason_code: 'Buyer Cancelled'
                };

            });

            setRefundData({
                ...refundData,
                items: newItems,
            });
        } else {
            // REFUND MODE → reset
            setIsFormValid(false);
            initializeData("refund");
            setIsFormValid(true);
        }
    };

    // Calculate totals for the summary panel
    const calculateTotals = () => {
        if (!refundData) {
            return {
                refundAmount: 0,
                orderAmount: 0,
                beforeRefunded: 0,
                enteredOrderRefund: 0
            };
        }

        let orderAmount = 0;
        const enteredOrderRefund = refundData.items.reduce((sum, item) => {
            orderAmount = item.amount + orderAmount;
            return sum + (typeof item.entered_refund_amount === 'number' ? item.entered_refund_amount : 0);
        }, 0);

        const refundAmount = enteredOrderRefund + refundData.shipping_refund;
        const beforeRefunded = refundData.items.reduce((sum, item) => {
            const refunded_cash_amount = typeof item.refunded_cash_amount === 'number' ? item.refunded_cash_amount : 0;
            return sum + refunded_cash_amount + refundData.shipping.refunded;
        }, 0);

        orderAmount = orderAmount + refundData.shipping.paid;

        return {
            refundAmount,
            beforeRefunded,
            orderAmount,
            enteredOrderRefund
        };
    };
    const totals = calculateTotals();

    // Handle cancel
    const handleCancel = () => {
        navigate(-1); // Go back to previous page
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!isFormValid) {
            alert('Please fix validation errors before submitting');
            return;
        }
        try {
            if (isCancelMode) {
                setSubmitting(true);
                const auth_key = localStorage.getItem(localStorageKey.auth_key);
                const res = await ApiService.post(`cancel/${suborderId}`, refundData, auth_key);
                console.log(res);
            }
            else {
                setSubmitting(true);
                const auth_key = localStorage.getItem(localStorageKey.auth_key);
                const res = await ApiService.post(`refund/${suborderId}`, refundData, auth_key);
                console.log(res)
            }
        } catch (error) {
            console.log({ 'error message': error })
        }

        setSubmitting(false);
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

    const shippingRefund = typeof refundData.shippingRefund === 'number' ? refundData.shipping_refund : 0;
    const shippingValidationError = shippingRefund > refundData.shipping.paid - refundData.shipping.refunded;

    // Format display value for inputs (convert number to string for display)
    const formatDisplayValue = (value) => {
        if (value === undefined || value === null) return '';
        if (typeof value === 'number') return value.toFixed(2).toString();
        return value;
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1300, margin: '0 auto' }}>
            {/* Header - EXACT text from screenshot */}
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
                Refund Or Cancel Order
            </Typography>

            {/* Cancel Mode Toggle */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <Button
                    variant={isCancelMode ? "contained" : "outlined"}
                    onClick={toggleCancelMode}
                    sx={{ mr: 2 }}
                >
                    {isCancelMode ? "Refund instead of cancel" : "Cancel instead of refund"}
                </Button>
                {isCancelMode && (
                    <Typography variant="body2" color="warning.main">
                        All items will be fully refunded
                    </Typography>
                )}
            </Box>

            <Grid container spacing={3}>
                {/* Left Column - Refund Items Table */}
                <Grid item xs={12} md={8.5}>


                    {/* Section header - EXACT text from screenshot */}
                    <Box sx={{
                        border: '1px solid',
                        borderColor: 'grey.300',
                        borderRadius: 1,
                        bgcolor: 'white',
                    }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'rgba(20, 89, 135, 0.8)', borderBottom: '1px solid', borderColor: 'grey.300', p: 1, bgcolor: 'rgba(29, 149, 196, 0.09)' }}>
                            Ordered items
                        </Typography>

                        <TableContainer >
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ pl: 1, fontWeight: 600, width: '50%' }}>Item</TableCell>
                                        <TableCell align="right" sx={{ pl: 1, fontWeight: 600, width: '15%' }}>Order Amount</TableCell>
                                        <TableCell align="right" sx={{ pl: 1, fontWeight: 600, width: '15%' }}>Before Refunded</TableCell>
                                        <TableCell align="right" sx={{ px: 1, fontWeight: 600, width: '20%' }}>Amount to refund</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {refundData.items.map((item, index) => {

                                        return (
                                            <React.Fragment key={item.item_id}>
                                                {/* Main Item Row */}
                                                <TableRow>
                                                    <TableCell sx={{
                                                        wordBreak: 'normal',
                                                        overflowWrap: 'break-word',
                                                        pl: 1
                                                    }}>
                                                        <Box>
                                                            <Box sx={{
                                                                display: 'grid', gridTemplateColumns: 'auto 1fr',
                                                                gridTemplateRows: 'auto auto',
                                                                columnGap: 2,
                                                                rowGap: 2,
                                                                alignItems: 'center'
                                                            }}>
                                                                <a
                                                                    href=""
                                                                    target="_blank"
                                                                    style={{ textDecoration: "none" }}
                                                                >
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{
                                                                            fontWeight: 500, color: "rgba(20, 98, 151, 0.95)", "&:hover": { textDecoration: "underline" }, cursor: "pointer",
                                                                        }}
                                                                    >
                                                                        {item.title}
                                                                    </Typography>
                                                                </a>
                                                                <img src={`https://api.agukart.com/uploads/product/${item.image}`} alt={""} style={{ height: "125px", width: "125px", objectFit: "cover", aspectRatio: "1/1" }} />
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Quantity: {item.quantity}
                                                                </Typography>
                                                            </Box>
                                                            {!isCancelMode && (
                                                                <FormControl fullWidth size="small" sx={{ mt: 1, minWidth: 200 }}>
                                                                    <InputLabel>Reason for refund</InputLabel>
                                                                    <Select
                                                                        value={item.reason_code}
                                                                        onChange={(e) => handleReasonChange(index, e.target.value)}
                                                                        label="Reason for refund"
                                                                        disabled={isCancelMode}
                                                                    >
                                                                        <MenuItem value="">
                                                                            <em>Select a reason_code</em>
                                                                        </MenuItem>
                                                                        {refundReasons.map(reason_code => (
                                                                            <MenuItem key={reason_code} value={reason_code}>
                                                                                {reason_code}
                                                                            </MenuItem>
                                                                        ))}
                                                                    </Select>
                                                                </FormControl>
                                                            )}
                                                            {isCancelMode && (
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Reason: {item.reason_code}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        ${item.amount.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell
                                                        align="right"
                                                        sx={{
                                                            color: Number(item.refunded_cash_amount) > 0 ? "error.main" : "inherit",
                                                        }}
                                                    >
                                                        ${Number(item.refunded_cash_amount ?? 0).toFixed(2)}
                                                    </TableCell>

                                                    <TableCell align="right">
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            value={formatDisplayValue(item.entered_refund_amount)}
                                                            onChange={(e) => handleItemRefundChange(index, e.target.value)}
                                                            onBlur={() => handleItemRefundBlur(index)}
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">{currencySymbols[refundData.currency] || refundData.currency}</InputAdornment>
                                                                ),
                                                            }}
                                                            disabled={isCancelMode}
                                                            sx={{ width: 120 }}
                                                        />
                                                    </TableCell>
                                                </TableRow>

                                                {/* Voucher Discount Row (Conditional) - EXACT label from screenshot */}
                                                {item.refunded_voucher_amount > 0 && (
                                                    <TableRow>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: 500, ml: 2 }}>
                                                                Agukart Voucher Discount
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography variant="body2" color="violet">
                                                                -${item.refunded_voucher_amount.toFixed(2)}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography variant="body2" color="violet">
                                                                -${item.refunded_voucher_amount.toFixed(2)}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <TextField
                                                                type="number"
                                                                size="small"
                                                                value={formatDisplayValue(item.voucher_adjustment_amount)}
                                                                onChange={(e) => handleVoucherChange(e.target.value)}
                                                                onBlur={handleVoucherChangeBlur}
                                                                InputProps={{
                                                                    startAdornment: (
                                                                        <InputAdornment position="start">{currencySymbols[refundData.currency] || refundData.currency}</InputAdornment>
                                                                    ),
                                                                }}
                                                                disabled={isCancelMode}
                                                                sx={{ width: 120 }}
                                                            />

                                                        </TableCell>
                                                    </TableRow>
                                                )}

                                            </React.Fragment>
                                        );
                                    })}
                                    {/* SHIPPING ROW */}
                                    <TableRow>
                                        <TableCell sx={{ pl: 1 }}>
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
                                                value={formatDisplayValue(refundData.entered_shipping_refund)}
                                                onChange={(e) => handleShippingRefundChange(e.target.value)}
                                                onBlur={() => handleShippingRefundBlur()}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">{currencySymbols[refundData.currency] || refundData.currency}</InputAdornment>
                                                    ),
                                                }}
                                                disabled={isCancelMode}
                                                sx={{ width: 120 }}
                                            />
                                        </TableCell>
                                    </TableRow>


                                    <TableRow>
                                        <TableCell sx={{ pl: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                Total
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 500 }}>
                                            ${totals.orderAmount.toFixed(2)}
                                        </TableCell>
                                        <TableCell align="right">
                                            ${totals.beforeRefunded.toFixed(2)}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography sx={{ color: 'red', fontWeight: 500 }}>
                                                ${totals.refundAmount.toFixed(2)}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>

                    {/* Note to yourself section */}
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
                            value={refundData.note_to_yourself}
                            onChange={(e) =>
                                setRefundData((prev) => ({
                                    ...prev,
                                    note_to_yourself: e.target.value,
                                }))
                            }
                        />
                    </Box>


                </Grid>

                {/* Right Column - Refund Summary Panel */}
                <Grid item xs={12} md={3.5}>

                    <Box
                        sx={{
                            border: '1px solid',
                            borderColor: 'grey.300',
                            borderRadius: 1,
                            bgcolor: 'white'
                        }}
                    >
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'rgba(20, 89, 135, 0.8)', borderBottom: '1px solid', borderColor: 'grey.300', p: 1, bgcolor: 'rgba(29, 149, 196, 0.09)' }}>
                            Order summary
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gridTemplateRows: 'auto auto', columnGap: 1, rowGap: 2, py: 2 }}>
                            <Typography variant="body2" gutterBottom sx={{ pl: 1 }}>
                                Customer:
                            </Typography>
                            <Typography variant="body2" gutterBottom sx={{ fontWeight: 500 }}>
                                {refundData.customer_name}
                            </Typography>
                            <Typography variant="body2" gutterBottom sx={{ pl: 1 }}>
                                Order ID:
                            </Typography>
                            <Typography variant="body2" gutterBottom sx={{ color: 'rgba(20, 98, 151, 0.95)' }}>
                                {refundData.order_id}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{
                        border: '1px solid',
                        borderColor: 'grey.300',
                        borderRadius: 1,
                        bgcolor: 'white',
                        mt: 3
                    }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'rgba(20, 89, 135, 0.8)', borderBottom: '1px solid', borderColor: 'grey.300', p: 1, bgcolor: 'rgba(29, 149, 196, 0.09)' }}>
                            Refund summary
                        </Typography>

                        {/* Refund Amount */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
                            <Typography variant="body2">Refund amount</Typography>
                            <Typography variant="body2">
                                ${totals.enteredOrderRefund.toFixed(2)}
                            </Typography>
                        </Box>

                        {/* Return Shipping */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
                            <Typography variant="body2">Refund shipping</Typography>
                            <Typography variant="body2">
                                ${refundData.shipping_refund.toFixed(2)}
                            </Typography>
                        </Box>

                        {/* Voucher Adjustment (Conditional) - EXACT label from screenshot */}
                        {refundData.isVoucherApplied && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
                                <Typography variant="body2">Agukart Voucher Adjustment</Typography>
                                <Typography variant="body2">
                                    -${refundData.voucher_adjustment_amount}
                                </Typography>
                            </Box>
                        )}
                        <hr
                            style={{
                                width: "50px",
                                marginLeft: "auto",
                                marginRight: "6px",
                            }}
                        />

                        {/* Amount to refund */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, mb: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                Amount to refund
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: 'red' }}>
                                ${totals.refundAmount.toFixed(2)}
                            </Typography>
                        </Box>
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
                            disabled={!isFormValid || submitting}
                        >
                            {submitting ? 'submitting' : 'Submit refund'}
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

                </Grid>
            </Grid>
        </Box>
    );
};

export default RefundPage;
