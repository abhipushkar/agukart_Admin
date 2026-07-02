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
    Snackbar,
    Tooltip,
    Card, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Slider
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';
import { ApiService } from 'app/services/ApiService';
import { localStorageKey } from 'app/constant/localStorageKey';
import { ConfirmModal } from 'app/components';

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
    const [customReasons, setCustomReasons] = useState({});
    const [open, setOpen] = useState(false);
    const [walletRefundAmount, setWalletRefundAmount] = useState('');
    const [sourceRefundAmount, setSourceRefundAmount] = useState('');
    const [refundDialogOpen, setRefundDialogOpen] = useState(false);
    const [refundTo, setRefundTo] = useState("");
    const [validationErrors, setValidationErrors] = useState({
        wallet: false,
        source: false
    });

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info'
    });

    const handleSnackbarClose = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const showSnackbar = (message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    };

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
    const CUSTOM_REASON = "__CUSTOM__";

    const refundOptions = [
        { value: "paypal", label: "PayPal Source Account" },
        { value: "wallet", label: "Gift Card Wallet" },
        { value: "split", label: "Split Amount" },
    ];

    const parseNumber = (value) => {
        if (value === '' || value === undefined || value === null) return 0;
        const num = parseFloat(value);
        return isNaN(num) ? 0 : Math.max(0, num);
    };
    const updateItemAtIndex = (items, index, updater) =>
        items.map((item, i) => (i === index ? updater(item) : item));

    const normalizeRefundData = (apiData) => {
        const customMap = {};
        const items = apiData.items.map(item => {
            const isCustom = item.reason_code && !refundReasons.includes(item.reason_code);
            if (isCustom) {
                customMap[item.item_id] = item.reason_code;
            }
            return {
                ...item,
                reason_code: isCustom ? CUSTOM_REASON : item.reason_code,
                coupon_adjustment_amount: 0,
                voucher_adjustment_amount: 0,
            };
        });
        setCustomReasons(customMap);
        return { ...apiData, items, };
    };

    const initializeData = useCallback(async (mode, res) => {
        try {
            const auth_key = localStorage.getItem(localStorageKey.auth_key);
            res = await ApiService.get(`refund-context/${suborderId}`, auth_key);
        } catch (error) {
            setError({ "message": error })
            console.log('error fetching', error);
        }
        const data = normalizeRefundData(res.data);

        setRefundTo('');

        const itemsWithDerivedValues = data.items.map(item => {
            return {
                ...item,
                title: item.title?.replace(/<\/?[^>]+(>|$)/g, ""),
                entered_refund_amount: 0,
                net_refund_amount: 0,
                reason_code: '',
            };
        });

        let initialRefundData = {
            ...data,
            items: itemsWithDerivedValues,
            note_to_yourself: '',
            shipping_refund: 0,
            entered_shipping_refund: 0,
            voucher_refund: 0,
            entered_voucher_refund: 0,
            coupon_refund: 0,
            entered_coupon_refund: 0,
        };

        if (mode === 'cancel') {
            const shippingRefund = initialRefundData.shipping.paid - initialRefundData.shipping.refunded;
            const voucherRefund = initialRefundData.voucher?.paid - initialRefundData.voucher?.refunded || 0;
            const couponRefund = initialRefundData.coupon?.paid - initialRefundData.coupon?.refunded || 0;

            initialRefundData = {
                ...initialRefundData,
                items: initialRefundData.items.map(item => {
                    const maxRefundable = item.amount - parseNumber(item.refunded_cash_amount);
                    return {
                        ...item,
                        entered_refund_amount: maxRefundable,
                        net_refund_amount: maxRefundable,
                        reason_code: 'Buyer Cancelled',
                        voucher_adjustment_amount: 0,
                        coupon_adjustment_amount: 0,
                    };
                }),
                shipping_refund: shippingRefund,
                entered_shipping_refund: shippingRefund,
                voucher_refund: voucherRefund,
                entered_voucher_refund: voucherRefund,
                coupon_refund: couponRefund,
                entered_coupon_refund: couponRefund,
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
                }))
            };
        });
    };

    const handleItemRefundBlur = (index) => {
        setRefundData(prev => {
            if (!prev) return prev;

            const items = updateItemAtIndex(prev.items, index, item => {
                const validValue = parseNumber(item.entered_refund_amount);
                const maxAllowed = item.amount - item.refunded_cash_amount;
                const voucherAmount = parseNumber(item.voucher_adjustment_amount);
                const couponAmount = parseNumber(item.coupon_adjustment_amount);

                // Ensure refund amount is at least voucher + coupon
                const clampedValue = Math.min(validValue, maxAllowed);
                const finalValue = Math.max(clampedValue, voucherAmount + couponAmount);

                // Calculate net refund after adjustments
                const netRefund = finalValue - voucherAmount - couponAmount;

                return {
                    ...item,
                    entered_refund_amount: finalValue,
                    net_refund_amount: netRefund, // This is the actual net refund
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

            const itemId = prev.items[index]?.item_id;

            if (reason_code !== CUSTOM_REASON && itemId) {
                setCustomReasons(current => {
                    const updated = { ...current };
                    delete updated[itemId];
                    return updated;
                });
            }

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


    // Handle voucher refund change (similar to shipping)
    const handleVoucherRefundChange = (value) => {
        setRefundData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                entered_voucher_refund: value
            };
        });
    };

    const handleVoucherRefundBlur = () => {
        setRefundData(prev => {
            if (!prev) return prev;
            const num = parseNumber(prev.entered_voucher_refund);
            const maxAllowed = prev.voucher?.paid - prev.voucher?.refunded || 0;
            const clampedValue = Math.min(num, maxAllowed);
            return {
                ...prev,
                entered_voucher_refund: clampedValue,
                voucher_refund: clampedValue,
            };
        });
    };

    // Handle coupon refund change
    const handleCouponRefundChange = (value) => {
        setRefundData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                entered_coupon_refund: value
            };
        });
    };

    const handleCouponRefundBlur = () => {
        setRefundData(prev => {
            if (!prev) return prev;
            const num = parseNumber(prev.entered_coupon_refund);
            const maxAllowed = prev.coupon?.paid - prev.coupon?.refunded || 0;
            const clampedValue = Math.min(num, maxAllowed);
            return {
                ...prev,
                entered_coupon_refund: clampedValue,
                coupon_refund: clampedValue,
            };
        });
    };

    useEffect(() => {
        if (!refundData) {
            setIsFormValid(false);
            return;
        }

        let isValid = true;

        // In cancel mode, always valid
        if (isCancelMode) {
            setIsFormValid(true);
            return;
        }

        // Check each item
        refundData.items.every((item) => {
            // If item has refund amount, check reason
            if (parseNumber(item.entered_refund_amount) > 0) {
                if (!item.reason_code) {
                    isValid = false;
                    return false;
                }

                if (item.reason_code === CUSTOM_REASON && !customReasons[item.item_id]?.trim()) {
                    isValid = false;
                    return false;
                }
            }

            // Check for negative net refund (voucher + coupon > refund)
            const refundAmount = parseNumber(item.entered_refund_amount);
            const voucherAmount = parseNumber(item.voucher_adjustment_amount);
            const couponAmount = parseNumber(item.coupon_adjustment_amount);
            const netRefund = refundAmount - voucherAmount - couponAmount;

            if (netRefund < 0) {
                isValid = false;
                return false;
            }

            return true;
        });

        // Also check if voucher_refund exceeds available voucher
        if (refundData.voucher_refund > (refundData.voucher?.paid - refundData.voucher?.refunded || 0)) {
            isValid = false;
        }

        // Check if coupon_refund exceeds available coupon
        if (refundData.coupon_refund > (refundData.coupon?.paid - refundData.coupon?.refunded || 0)) {
            isValid = false;
        }

        setIsFormValid(isValid);
    }, [refundData, customReasons, isCancelMode]);

    // Toggle cancel mode
    const toggleCancelMode = () => {
        if (!refundData) return;

        const newCancelMode = !isCancelMode;
        setIsCancelMode(newCancelMode);

        const newParams = new URLSearchParams(searchParams);
        newParams.set("mode", newCancelMode ? "cancel" : "refund");
        setSearchParams(newParams);

        if (newCancelMode) {
            // CANCEL MODE - calculate full refunds
            const shippingRefund = refundData.shipping.paid - refundData.shipping.refunded;
            const voucherRefund = refundData.voucher?.paid - refundData.voucher?.refunded || 0;
            const couponRefund = refundData.coupon?.paid - refundData.coupon?.refunded || 0;

            const newItems = refundData.items.map(item => {
                const maxRefundable = item.amount - parseNumber(item.refunded_cash_amount);
                return {
                    ...item,
                    entered_refund_amount: maxRefundable,
                    net_refund_amount: maxRefundable,
                    reason_code: 'Buyer Cancelled',
                    voucher_adjustment_amount: 0,
                    coupon_adjustment_amount: 0,
                };
            });

            setRefundData({
                ...refundData,
                items: newItems,
                shipping_refund: shippingRefund,
                entered_shipping_refund: shippingRefund,
                voucher_refund: voucherRefund,
                entered_voucher_refund: voucherRefund,
                coupon_refund: couponRefund,
                entered_coupon_refund: couponRefund,
            });
        } else {
            // REFUND MODE → reset everything to 0
            const resetItems = refundData.items.map(item => ({
                ...item,
                entered_refund_amount: 0,
                net_refund_amount: 0,
                reason_code: '',
                voucher_adjustment_amount: 0,
                coupon_adjustment_amount: 0,
            }));

            setRefundData({
                ...refundData,
                items: resetItems,
                shipping_refund: 0,
                entered_shipping_refund: 0,
                voucher_refund: 0,
                entered_voucher_refund: 0,
                coupon_refund: 0,
                entered_coupon_refund: 0,
                note_to_yourself: '',
            });

            setIsFormValid(false);
        }
    };

    // Calculate totals for the summary panel
    const calculateTotals = () => {
        if (!refundData) {
            return {
                refundAmount: 0,
                orderAmount: 0,
                beforeRefunded: 0,
                enteredOrderRefund: 0,
                totalVoucherAdjustment: 0,
                totalCouponAdjustment: 0,
                hasNegativeNetRefund: false
            };
        }

        let orderAmount = 0;
        let hasNegativeNetRefund = false;

        // Calculate item totals
        const enteredOrderRefund = refundData.items.reduce((sum, item) => {
            orderAmount = orderAmount + item.amount;
            return sum + (typeof item.entered_refund_amount === 'number' ? item.entered_refund_amount : 0);
        }, 0);

        // Calculate adjustments
        const totalVoucherAdjustment = refundData.items.reduce((sum, item) => {
            return sum + (typeof item.voucher_adjustment_amount === 'number' ? item.voucher_adjustment_amount : 0);
        }, 0);

        const totalCouponAdjustment = refundData.items.reduce((sum, item) => {
            return sum + (typeof item.coupon_adjustment_amount === 'number' ? item.coupon_adjustment_amount : 0);
        }, 0);

        // Final refund amount: items + shipping - voucher_refund - coupon_refund
        const refundAmount = enteredOrderRefund +
            refundData.shipping_refund -
            refundData.voucher_refund -
            refundData.coupon_refund;

        const beforeRefunded = refundData.items.reduce((sum, item) => {
            const refunded_cash_amount = typeof item.refunded_cash_amount === 'number' ? item.refunded_cash_amount : 0;
            return sum + refunded_cash_amount;
        }, 0) + refundData.shipping.refunded;

        orderAmount = orderAmount + refundData.shipping.paid;

        if (refundAmount < 0) {
            hasNegativeNetRefund = true;
        }

        return {
            refundAmount,
            beforeRefunded,
            orderAmount,
            enteredOrderRefund,
            totalVoucherAdjustment,
            totalCouponAdjustment,
            hasNegativeNetRefund
        };
    };
    const totals = calculateTotals();

    const handleRefundDialogClose = () => {
        setRefundDialogOpen(false);
        setWalletRefundAmount('');
        setSourceRefundAmount('');
        setValidationErrors({ wallet: false, source: false });
        setSliderValue(100);
    };

    // Add this state for slider value (percentage for PayPal)
    const [sliderValue, setSliderValue] = useState(100); // 100% to PayPal, 0% to Wallet

    // Add useEffect to sync slider with input fields
    useEffect(() => {
        if (refundTo === 'split' && refundData) {
            const total = totals.refundAmount;
            const paypalPercent = parseNumber(sourceRefundAmount) / total * 100;
            if (!isNaN(paypalPercent) && isFinite(paypalPercent)) {
                setSliderValue(Math.round(paypalPercent));
            }
        }
    }, [sourceRefundAmount, refundTo, refundData]);

    // Add this function to handle slider change
    const handleSliderChange = (event, newValue) => {
        setSliderValue(newValue);
        const total = totals.refundAmount;
        const paypalAmount = (newValue / 100) * total;
        const walletAmount = total - paypalAmount;

        setSourceRefundAmount(paypalAmount.toFixed(2));
        setWalletRefundAmount(walletAmount.toFixed(2));

        // Validate the new amounts
        validateSplitAmounts(walletAmount.toFixed(2), paypalAmount.toFixed(2));
    };

    const validateSplitAmounts = (wallet, source) => {
        const walletNum = parseNumber(wallet);
        const sourceNum = parseNumber(source);
        const total = walletNum + sourceNum;
        const targetTotal = totals.refundAmount;

        const errors = {
            wallet: walletNum < 0 || walletNum > targetTotal || (walletNum > 0 && sourceNum > 0 && total !== targetTotal),
            source: sourceNum < 0 || sourceNum > targetTotal || (walletNum > 0 && sourceNum > 0 && total !== targetTotal)
        };

        setValidationErrors(errors);
        return !errors.wallet && !errors.source;
    };
    const handleRefundDialogConfirm = () => {
        if (refundTo === 'split') {
            const walletNum = parseNumber(walletRefundAmount);
            const sourceNum = parseNumber(sourceRefundAmount);
            const total = walletNum + sourceNum;
            const targetTotal = totals.refundAmount;

            if (walletNum < 0 || sourceNum < 0) {
                showSnackbar('Amounts cannot be negative', 'error');
                return;
            }

            if (walletNum > targetTotal || sourceNum > targetTotal) {
                showSnackbar('Individual amounts cannot exceed total refund amount', 'error');
                return;
            }

            if (total !== targetTotal) {
                showSnackbar(`Total split amounts (${total.toFixed(2)}) must equal refund amount (${targetTotal.toFixed(2)})`, 'error');
                return;
            }

            // Set the split amounts in refundData or process as needed
            // Add your logic here to handle the split refund

            handleRefundDialogClose();
            setOpen(true);
        } else {
            handleRefundDialogClose();
            setOpen(true);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        navigate(-1); // Go back to previous page
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!isFormValid) {
            if (totals.hasNegativeNetRefund) {
                showSnackbar('Adjustments cannot exceed refund amount for any item', 'error');
            } else {
                showSnackbar('Please fix validation errors before submitting', 'warning');
            }
            return;
        }

        const payload = {
            ...refundData,
            items: refundData.items
                .filter(
                    (item) => parseNumber(item.entered_refund_amount) > 0
                )
                .map((item) => {
                    const refundAmount = parseNumber(item.entered_refund_amount);
                    const voucherAmount = parseNumber(item.voucher_adjustment_amount);
                    const couponAmount = parseNumber(item.coupon_adjustment_amount);
                    const netRefund = refundAmount - voucherAmount - couponAmount;

                    return {
                        ...item,
                        reason_code:
                            item.reason_code === CUSTOM_REASON
                                ? customReasons[item.item_id]?.trim()
                                : item.reason_code,
                        coupon_amount: couponAmount,
                        voucher_amount: voucherAmount,
                        net_refund_amount: netRefund,
                        entered_refund_amount: netRefund,
                    };
                }),
            // Add voucher and coupon refunds to payload
            voucher_refund: refundData.voucher_refund,
            coupon_refund: refundData.coupon_refund,
        };

        try {
            if (isCancelMode) {
                setSubmitting(true);
                const auth_key = localStorage.getItem(localStorageKey.auth_key);
                const res = await ApiService.post(`cancel/${suborderId}`, payload, auth_key);
                console.log(res);
                showSnackbar('Order cancelled successfully!', 'success');
            }
            else {
                setSubmitting(true);
                const auth_key = localStorage.getItem(localStorageKey.auth_key);
                const res = await ApiService.post(`refund/${suborderId}`, payload, auth_key);
                console.log(res);
                showSnackbar('Refund submitted successfully!', 'success');
            }
            initializeData(isCancelMode ? "cancel" : "refund");
        } catch (error) {
            console.log({ 'error message': error });
            showSnackbar(error.response.data.message, 'error');
            initializeData(isCancelMode ? "cancel" : "refund");
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
                                                                        <MenuItem value={CUSTOM_REASON}>
                                                                            Other (Custom Reason)
                                                                        </MenuItem>
                                                                    </Select>
                                                                    {item.reason_code === CUSTOM_REASON && (
                                                                        <TextField
                                                                            fullWidth
                                                                            size="small"
                                                                            sx={{ mt: 1 }}
                                                                            label="Custom reason"
                                                                            value={customReasons[item.item_id] || ""}
                                                                            onChange={(e) =>
                                                                                setCustomReasons((prev) => ({
                                                                                    ...prev,
                                                                                    [item.item_id]: e.target.value,
                                                                                }))
                                                                            }
                                                                        />
                                                                    )}
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
                                                        <Tooltip title={
                                                            <Box>
                                                                <Table sx={{
                                                                    tableLayout: "auto",
                                                                    width: "max-content",
                                                                    "& th, & td": {
                                                                        whiteSpace: "nowrap",
                                                                    },
                                                                }}
                                                                >
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell>Date</TableCell>
                                                                            <TableCell>Reason</TableCell>
                                                                            <TableCell>Amount</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {item.history?.length > 0 && item?.history?.map(h => (
                                                                            <TableRow key={h.createdAt}>
                                                                                <TableCell sx={{ pr: 3 }}>{new Date(h.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", }) || ""}</TableCell>
                                                                                <TableCell sx={{ pr: 3 }}>{h.reason_code || ""}</TableCell>
                                                                                <TableCell align='right' sx={{ color: 'error.main' }}>{h.entered_refund_amount}</TableCell>
                                                                            </TableRow>

                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </Box>}
                                                            disableHoverListener={Number(item.refunded_cash_amount) <= 0}
                                                            placement="bottom"
                                                            slotProps={{
                                                                tooltip: {
                                                                    component: Card,
                                                                    sx: {
                                                                        border: "1px Solid #dfdfdf",
                                                                        bgcolor: "#fff",
                                                                        maxWidth: "none",
                                                                        boxShadow: "0 2px 5px #0000002b"
                                                                    },
                                                                }
                                                            }}
                                                        >
                                                            <span style={{ cursor: "pointer" }}>
                                                                ${Number(item.refunded_cash_amount ?? 0).toFixed(2)}
                                                            </span>
                                                        </Tooltip>
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
                                                        {isCancelMode && (
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                                Net refund: ${item.net_refund_amount?.toFixed(2) || '0.00'}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                </TableRow>

                                            </React.Fragment>
                                        );
                                    })}

                                    {/* VOUCHER ROW */}
                                    {refundData.voucher?.paid > 0 && (
                                        <TableRow>
                                            <TableCell sx={{ pl: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    Voucher
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                ${refundData.voucher.paid.toFixed(2)}
                                            </TableCell>
                                            <TableCell align="right" sx={{
                                                color: Number(refundData.voucher.refunded) > 0 ? "violet" : "inherit",
                                            }}>
                                                <Tooltip title={
                                                    <Box>
                                                        <Table sx={{
                                                            tableLayout: "auto",
                                                            width: "max-content",
                                                            "& th, & td": {
                                                                whiteSpace: "nowrap",
                                                            },
                                                        }}>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell>Date</TableCell>
                                                                    <TableCell>Reason</TableCell>
                                                                    <TableCell>Amount</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {refundData?.voucher?.history?.length > 0 && refundData.voucher?.history?.map(h => (
                                                                    <TableRow key={h.createdAt}>
                                                                        <TableCell sx={{ pr: 3 }}>{new Date(h.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", }) || ""}</TableCell>
                                                                        <TableCell sx={{ pr: 3 }}>{h.reason_code || ""}</TableCell>
                                                                        <TableCell align='right' sx={{ color: 'error.main' }}>{h.entered_refund_amount}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </Box>}
                                                    disableHoverListener={Number(refundData.voucher.refunded) <= 0}
                                                    placement="bottom"
                                                    slotProps={{
                                                        tooltip: {
                                                            component: Card,
                                                            sx: {
                                                                border: "1px Solid #dfdfdf",
                                                                bgcolor: "#fff",
                                                                maxWidth: "none",
                                                                boxShadow: "0 2px 5px #0000002b"
                                                            },
                                                        }
                                                    }}
                                                >
                                                    <span style={{ cursor: "pointer" }}>${refundData.voucher.refunded.toFixed(2)}</span>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    value={isCancelMode ? formatDisplayValue(refundData.voucher.paid - refundData.voucher.refunded) : formatDisplayValue(refundData.entered_voucher_refund)}
                                                    onChange={(e) => handleVoucherRefundChange(e.target.value)}
                                                    onBlur={() => handleVoucherRefundBlur()}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">-{currencySymbols[refundData.currency] || refundData.currency}</InputAdornment>
                                                        ),
                                                    }}
                                                    disabled={isCancelMode}
                                                    sx={{ width: 120 }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {/* COUPON ROW */}
                                    {refundData.coupon?.paid > 0 && (
                                        <TableRow>
                                            <TableCell sx={{ pl: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    Coupon
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                ${refundData.coupon.paid.toFixed(2)}
                                            </TableCell>
                                            <TableCell align="right" sx={{
                                                color: Number(refundData.coupon.refunded) > 0 ? "orange" : "inherit",
                                            }}>
                                                <Tooltip title={
                                                    <Box>
                                                        <Table sx={{
                                                            tableLayout: "auto",
                                                            width: "max-content",
                                                            "& th, & td": {
                                                                whiteSpace: "nowrap",
                                                            },
                                                        }}>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell>Date</TableCell>
                                                                    <TableCell>Reason</TableCell>
                                                                    <TableCell>Amount</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {refundData?.coupon?.history?.length > 0 && refundData.coupon?.history?.map(h => (
                                                                    <TableRow key={h.createdAt}>
                                                                        <TableCell sx={{ pr: 3 }}>{new Date(h.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", }) || ""}</TableCell>
                                                                        <TableCell sx={{ pr: 3 }}>{h.reason_code || ""}</TableCell>
                                                                        <TableCell align='right' sx={{ color: 'error.main' }}>{h.entered_refund_amount}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </Box>}
                                                    disableHoverListener={Number(refundData.coupon.refunded) <= 0}
                                                    placement="bottom"
                                                    slotProps={{
                                                        tooltip: {
                                                            component: Card,
                                                            sx: {
                                                                border: "1px Solid #dfdfdf",
                                                                bgcolor: "#fff",
                                                                maxWidth: "none",
                                                                boxShadow: "0 2px 5px #0000002b"
                                                            },
                                                        }
                                                    }}
                                                >
                                                    <span style={{ cursor: "pointer" }}>${refundData.coupon.refunded.toFixed(2)}</span>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    value={isCancelMode ? formatDisplayValue(refundData.coupon.paid - refundData.coupon.refunded) : formatDisplayValue(refundData.entered_coupon_refund)}
                                                    onChange={(e) => handleCouponRefundChange(e.target.value)}
                                                    onBlur={() => handleCouponRefundBlur()}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">-{currencySymbols[refundData.currency] || refundData.currency}</InputAdornment>
                                                        ),
                                                    }}
                                                    disabled={isCancelMode}
                                                    sx={{ width: 120 }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )}

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
                                        <TableCell align="right" sx={{
                                            color: Number(refundData.shipping.refunded) > 0 ? "error.main" : "inherit",
                                        }}
                                        >
                                            <Tooltip title={
                                                <Box>
                                                    <Table
                                                        sx={{
                                                            tableLayout: "auto",
                                                            width: "max-content",
                                                            "& th, & td": {
                                                                whiteSpace: "nowrap",
                                                            },
                                                        }}>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>Date</TableCell>
                                                                <TableCell>Reason</TableCell>
                                                                <TableCell>Amount</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {refundData?.shipping?.history?.length > 0 && refundData.shipping?.history?.map(h => (
                                                                <TableRow key={h.createdAt}>
                                                                    <TableCell sx={{ pr: 3 }}>{new Date(h.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", }) || ""}</TableCell>
                                                                    <TableCell sx={{ pr: 3 }}>{h.reason_code || ""}</TableCell>
                                                                    <TableCell align='right' sx={{ color: 'error.main' }}>{h.entered_refund_amount}</TableCell>
                                                                </TableRow>

                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </Box>}
                                                disableHoverListener={Number(refundData.shipping.refunded) <= 0}
                                                placement="bottom"
                                                slotProps={{
                                                    tooltip: {
                                                        component: Card,
                                                        sx: {
                                                            border: "1px Solid #dfdfdf",
                                                            bgcolor: "#fff",
                                                            maxWidth: "none",
                                                            boxShadow: "0 2px 5px #0000002b"
                                                        },
                                                    }
                                                }}
                                            >
                                                <span style={{ cursor: "pointer" }}>${refundData.shipping.refunded.toFixed(2)}</span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell align="right">
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={isCancelMode ? formatDisplayValue(refundData.shipping.paid - refundData.shipping.refunded) : formatDisplayValue(refundData.entered_shipping_refund)}
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
                                {suborderId}
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

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
                            <Typography variant="body2">Refund amount</Typography>
                            <Typography variant="body2">
                                ${totals.enteredOrderRefund.toFixed(2)}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
                            <Typography variant="body2">Refund shipping</Typography>
                            <Typography variant="body2">
                                ${refundData.shipping_refund.toFixed(2)}
                            </Typography>
                        </Box>

                        {refundData.voucher_refund > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
                                <Typography variant="body2">Voucher refund</Typography>
                                <Typography variant="body2" sx={{ color: 'violet' }}>
                                    -${refundData.voucher_refund.toFixed(2)}
                                </Typography>
                            </Box>
                        )}

                        {refundData.coupon_refund > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
                                <Typography variant="body2">Coupon refund</Typography>
                                <Typography variant="body2" sx={{ color: 'orange' }}>
                                    -${refundData.coupon_refund.toFixed(2)}
                                </Typography>
                            </Box>
                        )}

                        <hr style={{ width: "50px", marginLeft: "auto", marginRight: "6px" }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, mb: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                Amount to refund
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: 'red' }}>
                                ${totals.refundAmount.toFixed(2)}
                            </Typography>
                        </Box>
                    </Box>

                    <Box mt={3}>
                        <TextField
                            select
                            fullWidth
                            label="Refund To"
                            value={refundTo}
                            onChange={(e) => setRefundTo(e.target.value)}
                            disabled={(!isFormValid || submitting || totals.refundAmount.toFixed(2) === 0)}
                        >
                            {refundOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
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
                            onClick={() => {
                                if (refundTo === 'split') {
                                    setSourceRefundAmount(totals.refundAmount.toFixed(2));
                                    setWalletRefundAmount('0.00');
                                    setSliderValue(100);
                                    setRefundDialogOpen(true);
                                } else {
                                    setOpen(true);
                                }
                            }}
                            disabled={!isFormValid || submitting || totals.refundAmount === 0 || !refundTo || totals.hasNegativeNetRefund}
                        >
                            {submitting ? 'Submitting...' : 'Submit refund'}
                        </Button>
                    </Box>

                    {totals.hasNegativeNetRefund && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            Voucher or Coupon adjustment cannot exceed refund amount for any item
                        </Alert>
                    )}

                    {!isFormValid && !totals.hasNegativeNetRefund && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            Please add reason for refund before submitting!
                        </Alert>
                    )}

                </Grid>
            </Grid>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
            <ConfirmModal
                open={open}
                handleClose={() => setOpen(false)}
                type={"warning"}
                msg={`Are you sure you want to refund $${totals.refundAmount.toFixed(2)} to ${refundTo === 'wallet' ? 'Gift Card Wallet' : refundTo === 'paypal' ? 'PayPal Source Account' : 'Gift Card Wallet and Paypal'}?`}
                onConfirm={handleSubmit}
            />
            <Dialog
                open={refundDialogOpen}
                onClose={handleRefundDialogClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 600 }}>
                    {refundTo === 'split' ? 'Split Refund Amount' : 'Confirm Refund'}
                </DialogTitle>
                <DialogContent>
                    {refundTo === 'split' ? (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Total refund amount: <strong>${totals.refundAmount.toFixed(2)}</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Please split the total amount between Gift Card Wallet and PayPal Source
                            </Typography>

                            <TextField
                                fullWidth
                                label="Gift Card Wallet Amount"
                                type="number"
                                value={walletRefundAmount}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setWalletRefundAmount(val);
                                    if (sourceRefundAmount) {
                                        validateSplitAmounts(val, sourceRefundAmount);
                                    }
                                }}
                                onBlur={() => {
                                    if (walletRefundAmount && sourceRefundAmount) {
                                        validateSplitAmounts(walletRefundAmount, sourceRefundAmount);
                                    }
                                }}
                                error={validationErrors.wallet}
                                helperText={validationErrors.wallet &&
                                    `Amount must be between 0 and ${totals.refundAmount.toFixed(2)} and total must equal ${totals.refundAmount.toFixed(2)}`
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">{currencySymbols[refundData?.currency] || '$'}</InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 2 }}
                            />

                            <TextField
                                fullWidth
                                label="PayPal Source Amount"
                                type="number"
                                value={sourceRefundAmount}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSourceRefundAmount(val);
                                    if (walletRefundAmount) {
                                        validateSplitAmounts(walletRefundAmount, val);
                                    }
                                }}
                                onBlur={() => {
                                    if (walletRefundAmount && sourceRefundAmount) {
                                        validateSplitAmounts(walletRefundAmount, sourceRefundAmount);
                                    }
                                }}
                                error={validationErrors.source}
                                helperText={validationErrors.source &&
                                    `Amount must be between 0 and ${totals.refundAmount.toFixed(2)} and total must equal ${totals.refundAmount.toFixed(2)}`
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">{currencySymbols[refundData?.currency] || '$'}</InputAdornment>
                                    ),
                                }}
                            />
                            {/* Add this Box with slider after the TextFields */}
                            <Box sx={{ mt: 3, mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Gift Card Wallet: ${walletRefundAmount || '0.00'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        PayPal: ${sourceRefundAmount || '0.00'}
                                    </Typography>
                                </Box>
                                {/* slider to add split values easily */}
                                <Slider
                                    value={sliderValue}
                                    onChange={handleSliderChange}
                                    aria-label="Refund split slider"
                                    marks={[{ value: 50, label: '' }]}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
                                    Slide to adjust split between Gift Card Wallet and PayPal
                                </Typography>
                            </Box>
                        </Box>
                    ) : (
                        <DialogContentText>
                            Are you sure you want to refund <strong>${totals.refundAmount.toFixed(2)}</strong> to{' '}
                            {refundTo === 'wallet' ? 'Gift Card Wallet' : 'PayPal Source Account'}?
                        </DialogContentText>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={handleRefundDialogClose} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRefundDialogConfirm}
                        color="primary"
                        variant="contained"
                        disabled={
                            refundTo === 'split' &&
                            (validationErrors.wallet ||
                                validationErrors.source ||
                                !walletRefundAmount ||
                                !sourceRefundAmount ||
                                parseNumber(walletRefundAmount) + parseNumber(sourceRefundAmount) !== totals.refundAmount)
                        }
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default RefundPage;
