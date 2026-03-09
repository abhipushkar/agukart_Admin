import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Stack,
    Grid,
    FormControl,
    Select,
    MenuItem,
    Alert,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ApiService } from "app/services/ApiService";
import { localStorageKey } from 'app/constant/localStorageKey';
import { useOrderStore } from './useOrderStore';

const CompleteOrder = ({ open, onClose, subOrders, shipmentId }) => {

    const shippingServices = useOrderStore(state => state.shippingServices);
    const fetchAllShippingServices = useOrderStore(state => state.fetchAllShippingServices);
    const [trackingStatuses] = useState([
        'Pre-Shipped',
        'No tracking',
        'track on',
        'Pre transit',
        'Out for delivery',
        'In transit',
        'Delivery attempt',
        'Delivered',
        'Cancelled'
    ]);
    const [orderData, setOrderData] = useState({});
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [missingTrackingInfo, setMissingTrackingInfo] = useState({ count: 0, orders: [] });
    const [shipmentData, setShipmentData] = useState({});
    const [isEdit, setIsEdit] = useState(false);

    // subOrders is always an array
    const orders = subOrders || [];

    useEffect(() => {
        if (shippingServices.length === 0) {
            fetchAllShippingServices();
        }
    }, [shippingServices.length, fetchAllShippingServices]);

    // General date formatting function for MUI date inputs (YYYY-MM-DD)
    const formatDateForInput = (dateValue) => {
        if (!dateValue) return '';
        try {
            // If it's already a string in YYYY-MM-DD format
            if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                return dateValue;
            }
            // Convert to Date object
            const date = new Date(dateValue);
            // Check if date is valid
            if (isNaN(date.getTime())) return '';
            // Format to YYYY-MM-DD
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    };

    // Helper for current date
    const getCurrentDateFormatted = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {

        const editMode = shipmentId !== null && shipmentId !== undefined;
        setIsEdit(editMode);
        let existingShipmentData = null;
        if (editMode && subOrders && subOrders[0]?.items?.[0]?.shipments) {
            existingShipmentData = subOrders[0].items[0].shipments.find(
                shipment => shipment._id === shipmentId
            );
            if (existingShipmentData) {
                setShipmentData(existingShipmentData);
            }
        }
        // Initialize order data for each subOrder
        const initialData = {};
        orders.forEach(order => {
            const defaultService = shippingServices.find(service => service.isDefault);
            initialData[order.sub_order_id] = {
                courierName: (editMode && existingShipmentData)
                    ? existingShipmentData.courierName || ''
                    : defaultService?.title || '',
                trackingNumber: editMode && existingShipmentData
                    ? existingShipmentData.trackingNumber || ''
                    : '',
                trackingStatus: editMode && existingShipmentData
                    ? existingShipmentData.delivery_status || ''
                    : '',
                delivered_date: editMode && existingShipmentData
                    ? formatDateForInput(existingShipmentData.delivered_date)
                    : getCurrentDateFormatted()
            };
        });
        setOrderData(initialData);
    }, [orders, shipmentId, shippingServices]);

    const handleInputChange = (subOrderId, field, value) => {
        setOrderData(prev => ({
            ...prev,
            [subOrderId]: {
                ...prev[subOrderId],
                [field]: value
            }
        }));
    };

    const validateTrackingNumbers = () => {
        const missing = [];
        orders.forEach(order => {
            const data = orderData[order.sub_order_id];
            if (!data?.trackingNumber || data.trackingNumber.trim() === '') {
                missing.push({
                    sub_order_id: order.sub_order_id,
                    receiver_name: order.parentSale?.receiver_name || 'Unknown'
                });
            }
        });

        setMissingTrackingInfo({
            count: missing.length,
            orders: missing
        });

        return missing.length === 0;
    };

    const handleSubmitOrders = async () => {
        setLoading(true);
        try {
            const auth_key = localStorage.getItem(localStorageKey.auth_key);

            if (isEdit && orders.length > 0) {
                const sub_order_id = orders[0].sub_order_id; // Get from the first order

                const payload = {
                    courierName: orderData[sub_order_id]?.courierName || '',
                    trackingNumber: orderData[sub_order_id]?.trackingNumber || '',
                    delivery_status: orderData[sub_order_id]?.trackingStatus || '',
                    delivered_date: orderData[sub_order_id]?.delivered_date || ''
                };

                const res = await ApiService.patch(
                    `edit-shipment/${sub_order_id}/${shipmentId}`,
                    payload,
                    auth_key
                );
            } else {
                // Prepare shipments array payload
                const shipments = orders.map(order => ({
                    sub_order_id: order.sub_order_id,
                    courierName: orderData[order.sub_order_id]?.courierName || '',
                    trackingNumber: orderData[order.sub_order_id]?.trackingNumber || '',
                    delivery_status: orderData[order.sub_order_id]?.trackingStatus || '',
                    delivered_date: orderData[order.sub_order_id]?.delivered_date || ''
                }));

                const payload = { shipments };

                const res = await ApiService.post('complete-order', payload, auth_key);
            }
            setSnackbar({
                open: true,
                message: isEdit ? 'Tracking Updated successfully' : 'Orders completed successfully',
                severity: 'success'
            });

            // Close dialog after success
            setTimeout(() => {
                onClose();
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error("Error completing orders:", error);
            setSnackbar({
                open: true,
                message: 'Failed to complete orders',
                severity: 'error'
            });
        } finally {
            setLoading(false);
            setConfirmDialogOpen(false);
        }
    };

    const handleCompleteOrderClick = () => {
        const allHaveTracking = validateTrackingNumbers();

        if (allHaveTracking) {
            // All orders have tracking numbers, submit directly
            handleSubmitOrders();
        } else {
            // Show confirmation dialog for missing tracking numbers
            setConfirmDialogOpen(true);
        }
    };

    const getConfirmationText = () => {
        const { count, orders: missingOrders } = missingTrackingInfo;
        if (count === 0) return '';

        const orderList = missingOrders.map(o => `Receipt ID: ${o.sub_order_id}`).join(', ');
        return `${count} order${count !== 1 ? 's' : ''} ${count !== 1 ? 'do' : 'does'} not have tracking numbers: ${orderList}. Are you sure you want to continue without tracking numbers?`;
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        minHeight: '60vh',
                        maxHeight: '90vh',
                        borderRadius: 2
                    }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: 1,
                    borderColor: 'divider',
                    pb: 2,
                    mb: 3
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {!isEdit ? (`Complete ${orders.length} order${orders.length !== 1 ? 's' : ''}`) : ("Update Existing Tracking")}
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3, overflowY: 'auto', pt: 3 }}>
                    {/* Order Cards */}
                    <Stack spacing={3}>
                        {orders.map((order, index) => {
                            const parentSale = order.parentSale;
                            const hasTrackingNumber = orderData[order.sub_order_id]?.trackingNumber?.trim() !== '';

                            return (
                                <Paper
                                    key={order.sub_order_id || index}
                                    elevation={0}
                                    variant="outlined"
                                    sx={{
                                        p: 3,
                                        backgroundColor: '#fafafa',
                                        borderLeft: hasTrackingNumber ? '4px solid #4caf50' : undefined
                                    }}
                                >
                                    <Grid container spacing={4}>
                                        {/* First Column - Buyer Info */}
                                        <Grid item xs={12} md={3}>
                                            <Box>
                                                <Typography sx={{ color: 'text.secondary', fontWeight: 500, mb: 2 }}>
                                                    Receipt Id: {order.sub_order_id}
                                                </Typography>
                                                <Typography sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}>
                                                    Shop: {parentSale?.saleDetaildata[0].items[0].shop_name || order.shop_name}
                                                </Typography>
                                                <Box sx={{ ml: 2 }}>
                                                    <Typography sx={{ fontWeight: 500 }}>{parentSale?.receiver_name}</Typography>
                                                    <Typography>{parentSale?.address_line1}</Typography>
                                                    {parentSale?.address_line2 && <Typography>{parentSale?.address_line2}</Typography>}
                                                    <Typography>
                                                        {parentSale?.city}, {parentSale?.state} {parentSale?.pincode}
                                                    </Typography>
                                                    <Typography>{parentSale?.country}</Typography>
                                                </Box>
                                            </Box>
                                        </Grid>

                                        {/* Second Column - Delivery Company */}
                                        <Grid item xs={12} md={3}>
                                            <Typography sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}>
                                                Delivery company:
                                            </Typography>
                                            <FormControl fullWidth size="small">
                                                <Select
                                                    value={orderData[order.sub_order_id]?.courierName || ''}
                                                    displayEmpty
                                                    onChange={(e) => handleInputChange(order.sub_order_id, 'courierName', e.target.value)}
                                                    renderValue={(selected) => {
                                                        if (!selected) {
                                                            return <Typography sx={{ color: 'text.secondary' }}>Select delivery company</Typography>;
                                                        }
                                                        return selected;
                                                    }}
                                                >
                                                    <MenuItem value="" disabled>
                                                        <Typography sx={{ color: 'text.secondary' }}>Select delivery company</Typography>
                                                    </MenuItem>
                                                    {shippingServices.map((service) => (
                                                        <MenuItem
                                                            key={service._id || service.name}
                                                            value={service.title}
                                                            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                                        >
                                                            <span>{service.title}</span>
                                                            {service.isDefault && (
                                                                <Box component="span" sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M12 2L15 9H22L16 14L19 21L12 16.5L5 21L8 14L2 9H9L12 2Z" fill="#00b3ff" stroke="#7ca4be" strokeWidth="1" />
                                                                    </svg>
                                                                </Box>
                                                            )}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        {/* Third Column - Tracking Number */}
                                        <Grid item xs={12} md={3}>
                                            <Typography sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}>
                                                Tracking number:
                                            </Typography>
                                            <TextField
                                                size="small"
                                                placeholder="Enter tracking number"
                                                variant="outlined"
                                                fullWidth
                                                value={orderData[order.sub_order_id]?.trackingNumber || ''}
                                                onChange={(e) => handleInputChange(order.sub_order_id, 'trackingNumber', e.target.value)}
                                                error={!orderData[order.sub_order_id]?.trackingNumber && orderData[order.sub_order_id]?.trackingNumber !== ''}
                                                helperText={!orderData[order.sub_order_id]?.trackingNumber && orderData[order.sub_order_id]?.trackingNumber !== '' ? 'Required' : ''}
                                            />
                                        </Grid>

                                        {/* Fourth Column - Tracking Status */}
                                        <Grid item xs={12} md={3}>
                                            <Typography sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}>
                                                Tracking Status:
                                            </Typography>
                                            <FormControl fullWidth size="small">
                                                <Select
                                                    value={orderData[order.sub_order_id]?.trackingStatus || ''}
                                                    displayEmpty
                                                    onChange={(e) => handleInputChange(order.sub_order_id, 'trackingStatus', e.target.value)}
                                                    renderValue={(selected) => {
                                                        if (!selected) {
                                                            return <Typography sx={{ color: 'text.secondary' }}>Select status</Typography>;
                                                        }
                                                        return selected;
                                                    }}
                                                >
                                                    <MenuItem value="" disabled>
                                                        <Typography sx={{ color: 'text.secondary' }}>Select status</Typography>
                                                    </MenuItem>
                                                    {trackingStatuses.map((status) => (
                                                        <MenuItem key={status} value={status}>
                                                            {status}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            {/* add date selector here visible if orderData[order.sub_order_id]?.trackingStatus === "Delivered"  */}
                                            {orderData[order.sub_order_id]?.trackingStatus === "Delivered" && (
                                                <Box sx={{ mt: 2 }}>
                                                    <Typography sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}>
                                                        Delivered Date:
                                                    </Typography>
                                                    <TextField
                                                        size="small"
                                                        type="date"
                                                        variant="outlined"
                                                        fullWidth
                                                        value={orderData[order.sub_order_id]?.delivered_date || ''}
                                                        onChange={(e) => handleInputChange(order.sub_order_id, 'delivered_date', e.target.value)}
                                                        error={!orderData[order.sub_order_id]?.delivered_date && orderData[order.sub_order_id]?.delivered_date !== ''}
                                                        helperText={!orderData[order.sub_order_id]?.delivered_date && orderData[order.sub_order_id]?.delivered_date !== '' ? 'Required' : ''}
                                                    />
                                                </Box>
                                            )}
                                        </Grid>
                                    </Grid>
                                </Paper>
                            );
                        })}
                    </Stack>
                </DialogContent>

                <DialogActions sx={{
                    p: 3,
                    borderTop: 1,
                    borderColor: 'divider',
                    justifyContent: 'flex-start',
                    gap: 2
                }}>
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        disabled={loading}
                        sx={{
                            px: 4,
                            py: 1,
                            color: 'text.primary',
                            borderColor: 'divider',
                            '&:hover': {
                                borderColor: 'text.primary',
                                backgroundColor: 'action.hover'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCompleteOrderClick}
                        disabled={loading}
                        sx={{
                            px: 4,
                            py: 1,
                            bgcolor: 'primary.main',
                            '&:hover': {
                                bgcolor: 'primary.dark'
                            }
                        }}
                    >
                        {loading ? 'Processing...' : 'Complete order'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirmation Dialog for missing tracking numbers */}
            <Dialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Missing Tracking Numbers</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Typography>
                        {getConfirmationText()}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setConfirmDialogOpen(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmitOrders}
                        disabled={loading}
                        sx={{
                            bgcolor: 'primary.main',
                            '&:hover': {
                                bgcolor: 'primary.dark'
                            }
                        }}
                    >
                        {loading ? 'Processing...' : 'Continue'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default CompleteOrder;