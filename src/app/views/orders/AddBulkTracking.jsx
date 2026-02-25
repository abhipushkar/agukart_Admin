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
    Divider
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
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState(null); // 'uploading', 'success', 'error'
    const [downloadTemplate, setDownloadTemplate] = useState(false);
    const [uploadHistory, setUploadHistory] = useState([]);
    const [error, setError] = useState('');

    // Handle file drop
    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
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
            simulateUpload(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ACCEPTED_FILE_TYPES,
        maxSize: MAX_FILE_SIZE,
        multiple: false
    });

    // Simulate file upload (replace with actual API call)
    const simulateUpload = (file) => {
        setUploadStatus('uploading');
        setUploadProgress(0);

        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setUploadStatus('success');

                    // Add to upload history
                    setUploadHistory(prev => [{
                        id: Date.now(),
                        fileName: file.name,
                        fileSize: file.size,
                        timestamp: new Date().toISOString(),
                        status: 'success',
                        records: Math.floor(Math.random() * 100) + 50 // Simulated record count
                    }, ...prev].slice(0, 5));

                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    };

    // Handle file removal
    const handleRemoveFile = () => {
        setFile(null);
        setUploadProgress(0);
        setUploadStatus(null);
        setError('');
    };

    // Handle download template
    const handleDownloadTemplate = () => {
        // Implement template download logic
        console.log('Downloading template...');
        setDownloadTemplate(true);
        setTimeout(() => setDownloadTemplate(false), 2000);
    };

    // Handle submit
    const handleSubmit = () => {
        if (!file) {
            setError('Please upload a file first');
            return;
        }

        // Implement submit logic
        console.log('Submitting file:', file);
        onClose();
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

                                {uploadStatus === 'uploading' && (
                                    <Box sx={{ width: 100 }}>
                                        <LinearProgress variant="determinate" value={uploadProgress} />
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                            {uploadProgress}%
                                        </Typography>
                                    </Box>
                                )}

                                {uploadStatus === 'success' && (
                                    <Chip
                                        icon={<CheckCircleIcon />}
                                        label="Uploaded"
                                        color="success"
                                        size="small"
                                    />
                                )}

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
                                onClick={() => { }} // Leave blank for now
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
                    disabled={!file || uploadStatus === 'uploading'}
                    startIcon={<CloudUploadIcon />}
                    sx={{ minWidth: 150 }}
                >
                    Submit products
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddBulkTracking;