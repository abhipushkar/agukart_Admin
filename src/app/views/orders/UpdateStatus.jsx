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
    IconButton,
    Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ApiService } from "app/services/ApiService";
import { localStorageKey } from 'app/constant/localStorageKey';
import { useOrderStore } from './useOrderStore';

const UpdateStatus = ({ open, onClose, subOrder }) => {
    console.log(subOrder);
    const shippingServices = useOrderStore(state => state.shippingServices);
    const fetchAllShippingServices = useOrderStore(state => state.fetchAllShippingServices);

    const [trackingStatuses] = useState([
        'Pre-Shipped',
        'No tracking',
        'Pre transit',
        'Out for delivery',
        'In transit',
        'Delivery attempt',
        'Delivered'
    ]);

    const [originalDeliveryStatus, setOriginalDeliveryStatus] = useState('');
    const [originalDeliveredDate, setOriginalDeliveredDate] = useState('');
    const [showAllShipments, setShowAllShipments] = useState(false);
    const [shipmentData, setShipmentData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Get parent sale info
    const parentSale = subOrder?.parentSale;

    // Format date for input
    const formatDateForInput = (dateValue) => {
        if (!dateValue) return '';
        try {
            if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                return dateValue;
            }
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return '';
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (error) {
            return '';
        }
    };

    // Get current date
    const getCurrentDateFormatted = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Initialize data
    useEffect(() => {
        if (shippingServices.length === 0) {
            fetchAllShippingServices();
        }

        if (subOrder) {
            // Set original delivery status from subOrder
            setOriginalDeliveryStatus(subOrder.delivery_status || '');
            setOriginalDeliveredDate(formatDateForInput(subOrder.delivered_date || subOrder.items?.[0]?.delivered_date));

            // Initialize shipment data from subOrder.items[0].shipments
            const shipments = subOrder.items?.[0]?.shipments || [];
            const initializedShipments = shipments.map(shipment => ({
                ...shipment,
                // Ensure dates are formatted for input if needed
                delivered_date: shipment.delivered_date
                    ? formatDateForInput(shipment.delivered_date)
                    : null,
                // Preserve original values for comparison
                _originalDeliveryStatus: shipment.delivery_status || ''
            }));

            setShipmentData(initializedShipments);
        }
    }, [subOrder, shippingServices.length, fetchAllShippingServices]);

    // Handle delivery status change at subOrder level
    const handleDeliveryStatusChange = (e) => {
        const newStatus = e.target.value;
        setOriginalDeliveryStatus(newStatus);

        // Show all shipments if status changed from original
        if (newStatus !== subOrder?.delivery_status) {
            setShowAllShipments(true);
        } else {
            setShowAllShipments(false);
        }
    };

    const handleDeliveredDateChange = (e) => {
        const newDate = formatDateForInput(e.target.value);
        setOriginalDeliveredDate(newDate);
    };

    // Handle shipment field changes
    const handleShipmentChange = (index, field, value) => {
        setShipmentData(prev => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [field]: value
            };
            return updated;
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const auth_key = localStorage.getItem(localStorageKey.auth_key);

            // Prepare payload with only changed shipments
            const updatedShipments = shipmentData
                .filter(shipment =>
                    shipment.delivery_status !== shipment._originalDeliveryStatus ||
                    (shipment.delivery_status === 'Delivered' && shipment.delivered_date)
                )
                .map(({ _originalDeliveryStatus, ...shipment }) => ({
                    shipment_id: shipment._id,
                    delivery_status: shipment.delivery_status,
                    delivered_date: shipment.delivery_status === 'Delivered'
                        ? shipment.delivered_date || getCurrentDateFormatted()
                        : null
                }));

            // When only 1 shipment exists, mirror the root-level status/date into it (no individual UI shown)
            let shipment_updates;
            if (shipmentData.length === 1) {
                const single = shipmentData[0];
                shipment_updates = [{
                    sub_order_id: subOrder.sub_order_id,
                    shipment_id: single._id,
                    trackingNumber: single.trackingNumber,
                    delivery_status: originalDeliveryStatus,
                    delivered_date: originalDeliveryStatus === 'Delivered' ? originalDeliveredDate : null
                }];
            } else {
                shipment_updates = updatedShipments.map(s => ({
                    sub_order_id: subOrder.sub_order_id,
                    ...s
                }));
            }

            const order_updates = [
                {
                    sub_order_id: subOrder.sub_order_id,
                    delivery_status: originalDeliveryStatus,
                    delivered_date: originalDeliveryStatus === 'Delivered' ? originalDeliveredDate : null
                }
            ];

            const payload = {
                shipment_updates,
                order_updates
            };

            const res = await ApiService.post('update-shipment-status', payload, auth_key);

            if (res?.status === 200) {
                setSnackbar({
                    open: true,
                    message: 'Status updated successfully',
                    severity: 'success'
                });
                setShowAllShipments(false);
                setTimeout(() => {
                    window.location.reload();
                    onClose();
                }, 1000);
            } else {
                throw new Error(res?.data?.message || 'Failed to update status');
            }

        } catch (error) {
            console.error("Error updating status:", error);
            setSnackbar({
                open: true,
                message: 'Failed to update status',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        height: '85vh', // Fixed height (80% of viewport height)
                        minHeight: '500px', // Minimum height
                        maxHeight: '90vh', // Maximum height
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
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Update Tracking Status
                    </Typography>
                    <IconButton
                        onClick={() => {
                            setShowAllShipments(false);
                            onClose();
                        }} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3, paddingTop: '16px !important', overflowY: 'auto' }}>
                    <Stack spacing={2}>
                        {/* SubOrder Info Card */}
                        <Paper elevation={0} variant="outlined"
                            sx={{
                                p: 2,
                                backgroundColor: '#fafafa',
                                mt: 2
                            }}
                        >
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography component="div" display="flex" alignItems="center" gap={2}>
                                        <Typography sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}>
                                            Receipt Id: <strong>{subOrder?.sub_order_id}</strong>
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}>
                                            Shop: <strong>{parentSale?.saleDetaildata[0].items[0].shop_name || subOrder?.shop_name}</strong>
                                        </Typography>
                                    </Typography>

                                    <Box>
                                        <Typography sx={{ fontWeight: 500 }}>{parentSale?.receiver_name}</Typography>
                                        <Typography>
                                            {parentSale?.address_line1}{parentSale?.address_line2 || ""}
                                            <br />
                                            {parentSale?.city}, {parentSale?.state} {parentSale?.pincode}, {parentSale?.country}
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <Typography sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}>
                                        Root Delivery Status:
                                    </Typography>
                                    <FormControl fullWidth size="small" sx={{ maxWidth: 300 }}>
                                        <Select
                                            value={originalDeliveryStatus}
                                            onChange={handleDeliveryStatusChange}
                                            displayEmpty
                                        >
                                            {trackingStatuses.map((status) => (
                                                <MenuItem key={status} value={status}>
                                                    {status}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    {showAllShipments && (
                                        <Typography variant="caption" color="info.main" sx={{ mt: 1, display: 'block' }}>
                                            Root status changed.
                                        </Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    {originalDeliveryStatus === 'Delivered' && (<Box>
                                        <Typography sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}>
                                            Root Delivered Date:
                                        </Typography>
                                        <TextField
                                            size="small"
                                            type="date"
                                            variant="outlined"
                                            fullWidth
                                            value={originalDeliveredDate}
                                            onChange={handleDeliveredDateChange}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Box>)}
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Shipments Cards - Only visible when showAllShipments is true AND more than 1 shipment */}
                        {showAllShipments && shipmentData.length > 1 && (
                            <>
                                <Typography variant="h6" sx={{ fontWeight: 600, mt: 2 }}>
                                    Update Individual Shipments
                                </Typography>

                                {shipmentData.map((shipment, index) => {
                                    const isDelivered = shipment.delivery_status === 'Delivered';

                                    return (
                                        <Paper
                                            key={shipment._id || index}
                                            elevation={0}
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                backgroundColor: '#ffffff',
                                                borderLeft: shipment.delivery_status !== shipment._originalDeliveryStatus
                                                    ? '4px solid #1976d2'
                                                    : undefined
                                            }}
                                        >
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={4}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                        Shipment #{index + 1}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        <strong>Tracking Number:</strong>{' '}
                                                        {shipment.trackingNumber || 'N/A'}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        <strong>Courier:</strong>{' '}
                                                        {shipment.courierName || 'N/A'}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        <strong>Shipped Date:</strong>{' '}
                                                        {shipment.shipped_date
                                                            ? new Date(shipment.shipped_date).toLocaleDateString()
                                                            : 'N/A'}
                                                    </Typography>
                                                </Grid>

                                                <Grid item xs={12} md={3} ml={"auto"}>
                                                    <Typography sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}>
                                                        Shipment Status:
                                                    </Typography>
                                                    <FormControl fullWidth size="small">
                                                        <Select
                                                            value={shipment.delivery_status || ''}
                                                            onChange={(e) => handleShipmentChange(index, 'delivery_status', e.target.value)}
                                                            displayEmpty
                                                        >
                                                            <MenuItem value="" disabled>
                                                                <Typography color="text.secondary">Select status</Typography>
                                                            </MenuItem>
                                                            {trackingStatuses.map((status) => (
                                                                <MenuItem key={status} value={status}>
                                                                    {status}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>

                                                <Grid item xs={12} md={3}>
                                                    {isDelivered && (
                                                        <Box>
                                                            <Typography sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}>
                                                                Delivered Date:
                                                            </Typography>
                                                            <TextField
                                                                size="small"
                                                                type="date"
                                                                variant="outlined"
                                                                fullWidth
                                                                value={shipment.delivered_date || ''}
                                                                onChange={(e) => handleShipmentChange(index, 'delivered_date', e.target.value)}
                                                                InputLabelProps={{ shrink: true }}
                                                            />
                                                        </Box>
                                                    )}
                                                </Grid>

                                            </Grid>

                                            {shipment.delivery_status !== shipment._originalDeliveryStatus && (
                                                <Box sx={{ mt: 2 }}>
                                                    <Typography variant="caption" color="success.main">
                                                        Shipment status modified
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Paper>
                                    );
                                })}
                            </>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions sx={{
                    py: 2,
                    px: 4,
                    borderTop: 1,
                    borderColor: 'divider',
                    display: 'flex', justifyContent: 'space-between'
                }}>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setShowAllShipments(false);
                            onClose();
                        }}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                        sx={{
                            bgcolor: 'primary.main',
                            '&:hover': { bgcolor: 'primary.dark' }
                        }}
                    >
                        {loading ? 'Processing...' : 'Update Status'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default UpdateStatus;