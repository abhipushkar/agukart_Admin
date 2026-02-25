import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    LinearProgress,
    IconButton,
    Alert
} from '@mui/material';
import {
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';

const TrackingUploadStatus = () => {
    const [uploadData, setUploadData] = useState(null);
    const [isDbLoading, setIsDbLoading] = useState(true);

    const [status, setStatus] = useState('idle'); // 'processing', 'success', 'error', 'idle'
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [errorText, setErrorText] = useState(null);
    const workerRef = useRef(null);

    useEffect(() => {
        const loadFromIndexedDB = async () => {
            try {
                const db = await new Promise((resolve, reject) => {
                    const req = indexedDB.open('TrackingUploadDB', 1);
                    req.onupgradeneeded = (e) => e.target.result.createObjectStore('uploads');
                    req.onsuccess = (e) => resolve(e.target.result);
                    req.onerror = (e) => reject(e.target.error);
                });

                const data = await new Promise((resolve, reject) => {
                    if (!db.objectStoreNames.contains('uploads')) return resolve(null);
                    const tx = db.transaction('uploads', 'readonly');
                    const store = tx.objectStore('uploads');
                    const getReq = store.get('currentUpload');
                    getReq.onsuccess = () => resolve(getReq.result);
                    getReq.onerror = (e) => reject(e.target.error);
                });

                if (data && data.file) {
                    setUploadData(data);
                } else {
                    setStatus('idle');
                }
            } catch (err) {
                console.error("Error loading file from DB", err);
                setStatus('idle');
            } finally {
                setIsDbLoading(false);
            }
        };

        loadFromIndexedDB();
    }, []);

    useEffect(() => {
        if (!uploadData || !uploadData.file) return;

        const { file, validSubOrdersMap, allowedCouriers } = uploadData;

        setStatus('processing');
        setProgress(10);
        setErrorText(null);

        // Initialize worker
        workerRef.current = new Worker(new URL('./workers/TrackingWorker.js', import.meta.url));

        workerRef.current.onmessage = (event) => {
            const { fatalError, totalRows, validCount, invalidCount, invalidRows, shipments } = event.data;
            console.log(`[TrackingUploadStatus Sanity Check] Worker returned:`, { fatalError, totalRows, validCount, invalidCount });

            if (fatalError) {
                setStatus('error');
                setErrorText(fatalError);
                return;
            }

            setProgress(100);
            setStatus('success');
            setResult({
                totalRows,
                validCount,
                invalidCount,
                invalidRows,
                shipments
            });
        };

        workerRef.current.postMessage({ file, validSubOrdersMap, allowedCouriers });

        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
            }
        };
    }, [uploadData]);

    const getStatusChip = (status) => {
        switch (status) {
            case 'in-progress':
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress sx={{ width: 60 }} />
                        <Typography variant="caption" color="text.secondary">In Progress</Typography>
                    </Box>
                );
            case 'successful':
                return <Chip label="Successful" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 500 }} />;
            case 'action-required':
                return <Chip label="Action required" size="small" sx={{ bgcolor: '#fff3e0', color: '#ed6c02', fontWeight: 500 }} />;
            default:
                return null;
        }
    };

    if (isDbLoading) {
        return (
            <Box sx={{ mt: 3, p: 3, textAlign: 'center' }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
                    Loading upload data...
                </Typography>
            </Box>
        );
    }

    if (!uploadData?.file && status === 'idle') {
        return (
            <Box sx={{ mt: 3, p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    Currently no bulk upload workers running.
                </Typography>
            </Box>
        );
    }

    const { file } = uploadData || {};

    return (
        <Box sx={{ mt: 3 }}>
            {/* Header */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Check Upload Status
            </Typography>

            {status === 'error' && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Failed to parse {file?.name}: {errorText}
                </Alert>
            )}

            {status === 'success' && result && (
                <Box sx={{ mb: 3 }}>
                    <Alert severity={result.invalidCount > 0 ? "warning" : "success"}>
                        Parsed {file?.name}: Found {result.validCount} valid tracking records. {result.totalRows - result.validCount} rows were ignored or invalid.
                    </Alert>

                    {result.invalidRows?.length > 0 && (
                        <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ mt: 2, maxHeight: 300 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Row No.</TableCell>
                                        <TableCell>Order ID</TableCell>
                                        <TableCell>Reason</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {result.invalidRows.map((err, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{err.row}</TableCell>
                                            <TableCell>{err.id || 'N/A'}</TableCell>
                                            <TableCell>{err.reason}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            )}

            {/* Current Status Box instead of table */}
            <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2, p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {file?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Processing
                        </Typography>
                    </Box>
                    <Box>
                        {status === 'processing' && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <LinearProgress sx={{ width: 100 }} />
                                <Typography variant="caption" color="text.secondary">In Progress</Typography>
                            </Box>
                        )}
                        {status === 'success' && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="body2">
                                    {result?.validCount} / {result?.totalRows} Successful
                                </Typography>
                                {getStatusChip(result?.invalidCount > 0 ? 'action-required' : 'successful')}
                            </Box>
                        )}
                        {status === 'error' && (
                            <Chip label="Error" size="small" color="error" />
                        )}
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default TrackingUploadStatus;