import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    IconButton,
    Paper,
    LinearProgress,
    Alert,
    Stack,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Snackbar
} from '@mui/material';
import {
    Close as CloseIcon,
    CloudUpload as CloudUploadIcon,
    InsertDriveFile as FileIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    Info as InfoIcon,
    SystemUpdateAlt as SystemUpdateAltIcon,
    OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { ROUTE_CONSTANT } from '../../constant/routeContanst';
import { ApiService } from '../../services/ApiService';
import { fetchCompletedOrders120Days } from './useOrderStore';
import { localStorageKey } from 'app/constant/localStorageKey';
import { useBulkTrackingStore } from "./useBulkTrackingStore";

// Styled components
const DropzoneArea = styled(Paper)(({ theme, isDragActive, hasError }) => ({
    border: `2px dashed ${hasError ? theme.palette.error.main : isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(4),
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: isDragActive ? theme.palette.action.hover : 'transparent',
    transition: 'all 0.2s ease',
    '&:hover': {
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.action.hover
    }
}));

const FilePreview = styled(Paper)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(1.5, 2),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(2)
}));

// Constants
const ACCEPTED_FILE_TYPES = {
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/tab-separated-values': ['.tsv', '.txt']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const UpdateBulkStatus = ({ open, onClose }) => {
    const navigate = useNavigate();
    const addUpload = useBulkTrackingStore(state => state.addUpload);

    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [fetchedSubOrdersMap, setFetchedSubOrdersMap] = useState({});
    const fetchPromiseRef = useRef(null);
    const auth_key = localStorage.getItem(localStorageKey.auth_key);

    useEffect(() => {
        if (open) {
            fetchPromiseRef.current = (async () => {
                try {
                    const allSubOrders = await fetchCompletedOrders120Days();
                    let map = {};
                    if (Array.isArray(allSubOrders)) {
                        allSubOrders.forEach((subOrder) => {
                            const subOrderId = subOrder._id || subOrder.sub_order_id;
                            if (subOrderId) {
                                map[subOrderId] = subOrder;
                            }
                        });
                    }
                    setFetchedSubOrdersMap(map);
                    return map;
                } catch (err) {
                    console.error("Failed to fetch sub orders map", err);
                    return {};
                }
            })();
        } else {
            // cleanup on close
            setFetchedSubOrdersMap({});
            fetchPromiseRef.current = null;
            setFile(null);
            setError('');
        }
    }, [open]);

    const handleClose = () => {
        setFile(null);
        setError('');
        onClose();
    };

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        if (rejectedFiles.length > 0) {
            const rejection = rejectedFiles[0];
            if (rejection.errors[0].code === 'file-too-large') {
                setError('File size exceeds 10MB limit');
            } else if (rejection.errors[0].code === 'file-invalid-type') {
                setError('Invalid file type. Please upload Excel or TSV files');
            } else {
                setError('Error uploading file');
            }
            return;
        }

        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setError('');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ACCEPTED_FILE_TYPES,
        maxSize: MAX_FILE_SIZE,
        multiple: false
    });

    const handleRemoveFile = () => {
        setFile(null);
        setError('');
    };

    const handleDownloadTemplate = () => {
        // Mock template downloading
    };

    const handleSubmit = async () => {
        if (!file) {
            setError('Please upload a file first');
            return;
        }

        setIsSubmitting(true);
        setError('');

        let currentValidationMap = fetchedSubOrdersMap;

        // Ensure fetch is complete if user clicked submit quickly
        if (fetchPromiseRef.current) {
            currentValidationMap = await fetchPromiseRef.current;
        }

        if (!currentValidationMap || Object.keys(currentValidationMap).length === 0) {
            setError('Failed to fetch tracking data for validation, or no eligible orders found. Please try again.');
            setIsSubmitting(false);
            return;
        }

        // Emit an initial 'processing' upload status to useBulkTrackingStore
        // to show realtime progress to TrackingUploadStatus
        const processingRecordId = Date.now();
        addUpload({
            id: processingRecordId,
            fileName: file.name,
            status: 'processing',
            timestamp: processingRecordId
        });

        const worker = new Worker(new URL('./workers/UpdateDeliveryStatusWorker.js', import.meta.url));

        worker.onmessage = async (event) => {
            const { fatalError, shipment_updates, order_updates, totalRows, validCount, invalidCount, invalidRows, originalRows } = event.data;
            worker.terminate();

            if (fatalError) {
                setError(`Parse Error: ${fatalError}`);
                setIsSubmitting(false);
                return;
            }

            if (!shipment_updates?.length && !order_updates?.length) {
                setError('No valid shipment or order updates found in the file.');
                setIsSubmitting(false);
                return;
            }

            try {
                const payload = {};
                if (shipment_updates?.length > 0) {
                    payload.shipment_updates = shipment_updates;
                }
                if (order_updates?.length > 0) {
                    payload.order_updates = order_updates;
                }

                // Actual API Submission for Delivery Bulk Updates
                const res = await ApiService.post('update-shipment-status', payload, auth_key);

                if (res?.status === 200) {
                    setSnackbar({
                        open: true,
                        message: 'Status updates completed successfully',
                        severity: 'success'
                    });

                    const uploadRecord = {
                        id: processingRecordId, // update the existing processing record
                        fileName: file.name,
                        totalRows,
                        validCount,
                        invalidCount,
                        invalidRows,
                        originalRows,
                        status: 'success', // explicitly mark success
                        timestamp: Date.now() // Note: Keep timestamp updated or just maintain initial ID
                    };

                    // Update the processing record in the store
                    useBulkTrackingStore.getState().removeUpload(processingRecordId).then(() => {
                        addUpload(uploadRecord);
                    });

                    setTimeout(() => {
                        handleClose();
                        if (validCount !== totalRows) {
                            navigate(ROUTE_CONSTANT.orders.trackingUploadStatus);
                        }
                    }, 1000);
                } else {
                    throw new Error(res?.data?.message || 'Failed to update status');
                }

            } catch (err) {
                console.error("Failed to complete update order status API", err);
                setError(err.response?.data?.message || err.message || 'API request failed.');
                setIsSubmitting(false);
            }
        };

        worker.postMessage({ file, validSubOrdersMap: currentValidationMap });
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    minHeight: '600px',
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: 1,
                borderColor: 'divider',
                pb: 2
            }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Update Bulk Status
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Upload a file to bulk update delivery status of trackings and orders
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
                <Stack spacing={3}>
                    {/* Upload Section */}
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                            Upload file
                        </Typography>

                        <DropzoneArea {...getRootProps()} isDragActive={isDragActive} hasError={!!error}>
                            <input {...getInputProps()} />
                            <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="body1" gutterBottom>
                                {isDragActive ? 'Drop file here' : 'Drag file here to upload'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Accepted file formats: Excel, TSV (Max 10MB)
                            </Typography>
                        </DropzoneArea>

                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
                                {error}
                            </Alert>
                        )}

                        {file && (
                            <FilePreview elevation={1}>
                                <FileIcon sx={{ color: 'primary.main' }} />
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {file.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {formatFileSize(file.size)}
                                    </Typography>
                                </Box>
                                <IconButton size="small" onClick={handleRemoveFile} sx={{ ml: 1 }}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </FilePreview>
                        )}
                    </Box>

                    {/* Options Section */}
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                            Options
                        </Typography>

                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="outlined"
                                size="medium"
                                startIcon={<SystemUpdateAltIcon />}
                                onClick={handleDownloadTemplate}
                                disableRipple
                                sx={{
                                    textTransform: 'none',
                                    borderColor: 'divider',
                                    color: 'text.primary',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        backgroundColor: 'action.hover'
                                    }
                                }}
                            >
                                Download Blank Template
                            </Button>

                            <Button
                                variant="outlined"
                                size="medium"
                                startIcon={<OpenInNewIcon />}
                                onClick={() => {
                                    handleClose();
                                    navigate(ROUTE_CONSTANT.orders.trackingUploadStatus);
                                }}
                                sx={{
                                    textTransform: 'none',
                                    borderColor: 'divider',
                                    color: 'text.primary',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        backgroundColor: 'action.hover'
                                    }
                                }}
                            >
                                Check Upload Status
                            </Button>
                        </Stack>
                    </Box>

                    {/* Info Banner */}
                    <Alert severity="info" icon={<InfoIcon />}>
                        <Typography variant="body2" fontWeight={500}>
                            Note:- Orders older than 120 days will be rejected!
                        </Typography>
                        <Typography variant="body2">
                            Make sure your file contains the proper delivery statuses.
                        </Typography>
                    </Alert>
                </Stack>
            </DialogContent>

            <DialogActions sx={{
                p: 3,
                borderTop: 1,
                borderColor: 'divider',
                justifyContent: 'space-between'
            }}>
                <Button
                    variant="outlined"
                    onClick={handleClose}
                    sx={{ minWidth: 100 }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!file || isSubmitting}
                    startIcon={isSubmitting ? <LinearProgress sx={{ width: 20 }} /> : <CloudUploadIcon />}
                    sx={{ minWidth: 150 }}
                >
                    {isSubmitting ? 'Processing...' : 'Submit Update'}
                </Button>
            </DialogActions>

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
        </Dialog>
    );
};

export default UpdateBulkStatus;