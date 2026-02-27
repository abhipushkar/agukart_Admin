import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    LinearProgress,
    Divider,
    Stack,
    IconButton,
    Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Download as DownloadIcon,
    Apps as AppsIcon,
    ErrorOutline as ErrorOutlineIcon,
    CheckCircleOutline as CheckCircleOutlineIcon
} from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from 'react-router-dom';
import * as XLSX from "xlsx";
import { useBulkTrackingStore } from "./useBulkTrackingStore";
import { ROUTE_CONSTANT } from 'app/constant/routeContanst';
import { ConfirmModal } from 'app/components';

// Styled components for colored cells
const PassedCell = styled(TableCell)(({ theme }) => ({
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    fontWeight: 500
}));

const FailedCell = styled(TableCell)(({ theme }) => ({
    backgroundColor: '#ffebee',
    color: '#c62828',
    fontWeight: 500
}));

const TrackingUploadStatus = () => {
    const navigate = useNavigate();
    const { uploads, clearUploads, removeUpload, loadUploads } = useBulkTrackingStore();
    const [expandedRows, setExpandedRows] = useState({});
    const [open, setOpen] = useState(false);
    const [uploadId, setUploadId] = useState(null);

    // Load from IndexedDB on mount
    useEffect(() => {
        loadUploads();
    }, [loadUploads]);

    // Rest of your component code remains the same...
    const handleDownload = (upload) => {
        const { originalRows, invalidRows, fileName } = upload;

        const invalidMap = new Map();
        if (invalidRows) {
            invalidRows.forEach(row => {
                invalidMap.set(row.row - 2, row.reason); // adjust index
            });
        }

        const annotatedRows = originalRows.map((row, index) => ({
            ...row,
            validationStatus: invalidMap.has(index)
                ? `FAILED: ${invalidMap.get(index)}`
                : "PASSED"
        }));

        // SheetJS Community Edition doesn't support cell styling like colors.
        // To support colors, we generate an HTML table and convert it to Excel using the Blob approach.
        let htmlString = '<table><thead><tr>';

        // Add Headers
        const headers = Object.keys(annotatedRows[0] || {});
        headers.forEach(header => {
            htmlString += `<th>${header}</th>`;
        });
        htmlString += '</tr></thead><tbody>';

        // Add Body with colors
        annotatedRows.forEach(row => {
            htmlString += '<tr>';
            const isFailed = row.validationStatus.startsWith('FAILED');
            const bgColor = isFailed ? '#FFEBEB' : '#EAF7EA';
            const color = isFailed ? '#C52626' : '#29762B';

            headers.forEach(header => {
                const cellValue = row[header] !== undefined ? row[header] : '';
                htmlString += `<td style="background-color: ${bgColor}; color: ${color}; font-weight: bold;">${cellValue}</td>`;
            });

            htmlString += '</tr>';
        });
        htmlString += '</tbody></table>';

        const blob = new Blob([htmlString], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `validated_${fileName.replace(/\.[^/.]+$/, "")}.xls`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const toggleRowExpansion = (uploadId) => {
        setExpandedRows(prev => ({
            ...prev,
            [uploadId]: !prev[uploadId]
        }));
    };

    const getStatusChip = (upload) => {
        const { validCount, totalRows, invalidRows } = upload;

        if (validCount === totalRows) {
            return (
                <Chip
                    icon={<CheckCircleOutlineIcon />}
                    label="Successful"
                    size="small"
                    sx={{
                        bgcolor: '#e8f5e9',
                        color: '#2e7d32',
                        fontWeight: 500,
                        '& .MuiChip-icon': { color: '#2e7d32' }
                    }}
                />
            );
        } else if (validCount === 0 && invalidRows?.length > 0) {
            return (
                <Chip
                    icon={<ErrorOutlineIcon />}
                    label="Action required"
                    size="small"
                    sx={{
                        bgcolor: '#ffebee',
                        color: '#c62828',
                        fontWeight: 500,
                        '& .MuiChip-icon': { color: '#c62828' }
                    }}
                />
            );
        } else if (validCount > 0 && validCount < totalRows) {
            return (
                <Chip
                    icon={<DownloadIcon />}
                    label="Partial success"
                    size="small"
                    sx={{
                        bgcolor: '#fff3e0',
                        color: '#ed6c02',
                        fontWeight: 500,
                        '& .MuiChip-icon': { color: '#ed6c02' }
                    }}
                />
            );
        }
        return null;
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleDialogClose = () => {
        setOpen(false);
        setUploadId(null);
    }

    if (!uploads || uploads.length === 0) {
        return (
            <Box sx={{ m: 3 }}>
                {/* Go To Button */}
                <Box sx={{ py: "16px", mb: 3 }} component={Paper}>
                    <Stack sx={{ ml: "16px", mb: "12px" }} gap={1} direction={"row"}>
                        <Box>
                            <AppsIcon />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Go To</Typography>
                        </Box>
                    </Stack>
                    <Divider />
                    <Box sx={{ ml: "16px", mt: "16px" }}>
                        <Button
                            onClick={() => navigate(ROUTE_CONSTANT.orders.orderPage)}
                            startIcon={<AppsIcon />}
                            variant="contained"
                        >
                            Orders List
                        </Button>
                    </Box>
                </Box>

                {/* Empty State */}
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No bulk upload history
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Upload a file to see the processing status here
                    </Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 3, mx: 8 }}>
            {/* Header with Go To button and Clear All */}
            {/* Go To Button */}
            <Box sx={{ py: "16px", mb: 3 }} component={Paper}>
                <Stack sx={{ ml: "16px", mb: "12px" }} gap={1} direction={"row"}>
                    <Box>
                        <AppsIcon />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Go To</Typography>
                    </Box>
                </Stack>
                <Divider />
                <Box sx={{ ml: "16px", mt: "16px" }}>
                    <Button
                        onClick={() => navigate(ROUTE_CONSTANT.orders.orderPage)}
                        startIcon={<AppsIcon />}
                        variant="contained"
                    >
                        Orders List
                    </Button>
                </Box>
            </Box>

            {/* Upload History Table */}
            <Box display={'flex'} justifyContent={'space-between'}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Check Upload Status
                </Typography>
                {/* Clear All Button */}
                {uploads.length > 0 && (
                    <Button
                        variant="contained"
                        startIcon={<DeleteIcon />}
                        onClick={() => {
                            setUploadId("all");
                            setOpen(true);
                        }}
                        size="small"
                        color="error"
                    >
                        Clear History
                    </Button>
                )}
            </Box>
            <TableContainer component={Paper} elevation={5} variant="outlined" sx={{ borderRadius: 2, mt: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, width: '30%', pl: 2 }}>File name</TableCell>
                            <TableCell sx={{ fontWeight: 600, width: '20%' }}>Successful / Total Rows</TableCell>
                            <TableCell sx={{ fontWeight: 600, width: '25%', pl: 2 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600, width: '25%' }}> </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {uploads.map((upload) => (
                            <React.Fragment key={upload.id}>
                                {/* Main Row */}
                                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Box sx={{ pl: 2 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {upload.fileName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDate(upload.timestamp)}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box ml={2}>
                                            {upload.status === 'processing' ? (
                                                <Typography variant="body2">—</Typography>
                                            ) : (
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {upload.validCount} / {upload.totalRows}
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {upload.status === 'processing' ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LinearProgress sx={{ width: 60 }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    Processing
                                                </Typography>
                                            </Box>
                                        ) : (
                                            getStatusChip(upload)
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
                                            {upload.status !== 'processing' && (
                                                <>
                                                    <Tooltip title="Download Processing Summary">
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            startIcon={<DownloadIcon />}
                                                            onClick={() => handleDownload(upload)}
                                                            sx={{
                                                                textTransform: 'none', // Keeps text as "Download Summary" instead of "DOWNLOAD SUMMARY"
                                                                // Removed hover transparent bgcolor to keep the contained look
                                                            }}
                                                        >
                                                            Download Summary
                                                        </Button>

                                                    </Tooltip>

                                                    {upload.invalidRows?.length > 0 && (
                                                        <Tooltip title="View Details">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => toggleRowExpansion(upload.id)}
                                                                color={expandedRows[upload.id] ? 'primary' : 'default'}
                                                            >
                                                                <AppsIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </>
                                            )}

                                            <Tooltip title="Remove from history">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setUploadId(upload.id);
                                                        setOpen(true);
                                                    }}
                                                    color="error"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>

                                {/* Expanded Row for Invalid Entries */}
                                {expandedRows[upload.id] && upload.invalidRows?.length > 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ p: 0, border: 0 }}>
                                            <Box sx={{ p: 2, bgcolor: '#fafafa' }}>
                                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                                    Invalid Entries ({upload.invalidRows.length})
                                                </Typography>
                                                <TableContainer component={Paper} elevation={0} variant="outlined">
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>Row</TableCell>
                                                                <TableCell>Order ID</TableCell>
                                                                <TableCell>Reason</TableCell>
                                                                <TableCell>Value</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {upload.invalidRows.map((invalid, idx) => {
                                                                const originalRow = upload.originalRows[invalid.row - 2];
                                                                return (
                                                                    <TableRow key={idx}>
                                                                        <TableCell>{invalid.row}</TableCell>
                                                                        <TableCell>
                                                                            {invalid.id || originalRow?.order_id || 'N/A'}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Box component="span" sx={{
                                                                                bgcolor: '#ffebee',
                                                                                color: '#c62828',
                                                                                px: 1,
                                                                                py: 0.5,
                                                                                borderRadius: 1,
                                                                                fontSize: '0.75rem',
                                                                                fontWeight: 500
                                                                            }}>
                                                                                {invalid.reason}
                                                                            </Box>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {originalRow ? (
                                                                                <Box>
                                                                                    {Object.entries(originalRow).map(([key, val]) => (
                                                                                        <Typography key={key} variant="caption" display="block">
                                                                                            <strong>{key}:</strong> {String(val) ? String(val) : "  ——"}
                                                                                        </Typography>
                                                                                    ))}
                                                                                </Box>
                                                                            ) : '—'}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            })}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Info about max storage */}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'right' }}>
                Showing last {uploads.length} of 5 recent uploads
            </Typography>
            <ConfirmModal
                open={open}
                type={"variantDelete"}
                msg={""}
                handleDelete={() => uploadId === "all" ? clearUploads() : removeUpload(uploadId)}
                handleClose={handleDialogClose}
            />
        </Box>
    );
};

export default TrackingUploadStatus;