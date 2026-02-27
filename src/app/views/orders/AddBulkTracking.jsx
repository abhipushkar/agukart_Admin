import React, { useState, useCallback } from 'react';
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
import { fetchAllActiveSubOrders } from './useOrderStore';
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

const TemplateCard = styled(Paper)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: theme.palette.action.hover
    }
}));

// Constants
const ACCEPTED_FILE_TYPES = {
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/tab-separated-values': ['.tsv', '.txt']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const AddBulkTracking = ({ open, onClose }) => {
    const navigate = useNavigate();
    const addUpload = useBulkTrackingStore(state => state.addUpload);

    const [file, setFile] = useState(null);
    const [parsedShipments, setParsedShipments] = useState(null);
    const [parseError, setParseError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState(null); // 'uploading', 'success', 'error'
    const [downloadTemplate, setDownloadTemplate] = useState(false);
    const [uploadHistory, setUploadHistory] = useState([]);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deliveryServices, setDeliveryServices] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [fetchedSubOrdersMap, setFetchedSubOrdersMap] = useState({});
    const [isLoadingData, setIsLoadingData] = useState(false);
    const auth_key = localStorage.getItem(localStorageKey.auth_key);

    React.useEffect(() => {
        if (open) {
            const loadData = async () => {
                setIsLoadingData(true);
                try {
                    // Fetch delivery services
                    const res = await ApiService.get("get-delivery-service", auth_key);
                    if (res.status === 200) {
                        setDeliveryServices(res?.data?.data || []);
                    }
                } catch (err) {
                    console.error("Failed to fetch delivery services", err);
                }

                try {
                    // Fetch 90 days of active sub orders
                    const allSubOrders = await fetchAllActiveSubOrders();
                    let map = {};
                    if (Array.isArray(allSubOrders)) {

                        allSubOrders.forEach((subOrder) => {
                            const subOrderId = subOrder._id || subOrder.sub_order_id;
                            if (subOrderId) {
                                map[subOrderId] = subOrder.order_status || 'new';
                            }
                        });
                    }
                    setFetchedSubOrdersMap(map);
                } catch (err) {
                    console.error("Failed to fetch sub orders map", err);
                }

                setIsLoadingData(false);
            };
            loadData();
        }
    }, [open, auth_key]);

    const allowedCouriers = React.useMemo(() => {
        return deliveryServices.map(s => s.name);
    }, [deliveryServices]);

    // Handle file drop
    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        if (isLoadingData) {
            setError('Please wait until order data implies loading...');
            return;
        }

        if (rejectedFiles.length > 0) {
            const rejection = rejectedFiles[0];
            if (rejection.errors[0].code === 'file-too-large') {
                setError('File size exceeds 5MB limit');
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
        setUploadProgress(0);
        setUploadStatus(null);
        setError('');
        setParsedShipments(null);
        setParseError('');
    };

    // Handle download template
    const handleDownloadTemplate = () => {
        // Implement template download logic
        setDownloadTemplate(true);
        setTimeout(() => setDownloadTemplate(false), 2000);
    };

    // Handle submit
    const handleSubmit = async () => {
        if (!file) {
            setError('Please upload a file first');
            return;
        }

        setIsSubmitting(true);
        setError('');

        // 1. Process the file via Worker to get parsed shipments
        const worker = new Worker(new URL('./workers/TrackingWorker.js', import.meta.url));

        worker.onmessage = async (event) => {
            const { fatalError, shipments, totalRows, validCount, invalidCount, invalidRows, originalRows } = event.data;
            worker.terminate();

            if (fatalError) {
                setError(`Parse Error: ${fatalError}`);
                setIsSubmitting(false);
                return;
            }

            if (!shipments || shipments.length === 0) {
                setError('No valid shipments found in the file based on current active orders.');
                setIsSubmitting(false);
                return;
            }

            // 2. Map shipments to payload structure requested by USER
            try {
                const payloadShipments = shipments.map(item => ({
                    sub_order_id: item.sub_order_id,
                    courierName: item.courierName || '',
                    trackingNumber: item.trackingNumber || '',
                    delivery_status: item.trackingStatus || ''
                }));

                const payload = { shipments: payloadShipments };

                // 3. Make API call
                const res = await ApiService.post('complete-order', payload, auth_key);

                setSnackbar({
                    open: true,
                    message: 'Orders completed successfully',
                    severity: 'success'
                });

                if (file) {
                    const uploadRecord = {
                        id: Date.now(),
                        fileName: file.name,
                        totalRows,
                        validCount,
                        invalidCount,
                        invalidRows,
                        originalRows,
                        createdAt: new Date().toISOString()
                    };
                    addUpload(uploadRecord);
                }

                // Close dialog after success
                setTimeout(() => {
                    onClose();
                    navigate(ROUTE_CONSTANT.orders.trackingUploadStatus);
                }, 1000);
            } catch (err) {
                console.error("Failed to complete order API", err);
                setError(err.response?.data?.message || err.message || 'API request failed.');
                setIsSubmitting(false);
            }
        };

        worker.postMessage({ file, validSubOrdersMap: fetchedSubOrdersMap, allowedCouriers });
    };
    // Format file size
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
            onClose={onClose}
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
                        Add Bulk Trackings on Orders
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Upload multiple tracking numbers at once using an Excel or TSV file
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
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
                                    onClose();
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

                    {/* Upload History Section */}
                    {uploadHistory.length > 0 && (
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    Recent Uploads
                                </Typography>
                                <Button
                                    size="small"
                                    startIcon={<RefreshIcon />}
                                    onClick={() => setUploadHistory([])}
                                >
                                    Clear
                                </Button>
                            </Box>

                            <List disablePadding>
                                {uploadHistory.map((item, index) => (
                                    <React.Fragment key={item.id}>
                                        {index > 0 && <Divider />}
                                        <ListItem>
                                            <ListItemIcon>
                                                {item.status === 'success' ? (
                                                    <CheckCircleIcon color="success" />
                                                ) : (
                                                    <ErrorIcon color="error" />
                                                )}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {item.fileName}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatFileSize(item.fileSize)} • {item.records} records • {new Date(item.timestamp).toLocaleString()}
                                                    </Typography>
                                                }
                                            />
                                            <Chip
                                                label="Processed"
                                                size="small"
                                                color="success"
                                                variant="outlined"
                                            />
                                        </ListItem>
                                    </React.Fragment>
                                ))}
                            </List>
                        </Box>
                    )}

                    {/* Info Banner */}
                    <Alert severity="info" icon={<InfoIcon />}>
                        <Typography variant="body2" fontWeight={500}>
                            Note:- Orders older than 90 days will be rejected!
                        </Typography>
                        <Typography variant="body2">
                            Make sure your file follows the template format. The tracking numbers will be
                            automatically matched with orders using order IDs or receipt numbers.
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
                    onClick={onClose}
                    sx={{ minWidth: 100 }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!file || isSubmitting || isLoadingData}
                    startIcon={isSubmitting ? <LinearProgress sx={{ width: 20 }} /> : <CloudUploadIcon />}
                    sx={{ minWidth: 150 }}
                >
                    {isLoadingData ? 'Loading data...' : isSubmitting ? 'Submitting...' : 'Submit products'}
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

export default AddBulkTracking;