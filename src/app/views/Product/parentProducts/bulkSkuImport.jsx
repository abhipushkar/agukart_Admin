import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    IconButton,
    Alert,
    Paper
} from '@mui/material';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import ClearIcon from '@mui/icons-material/Clear';

const BulkSkuImport = ({ open, onClose, onImport, combinations, existingSkus = [] }) => {
    const [skuList, setSkuList] = useState('');
    const [validationError, setValidationError] = useState('');

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setSkuList(text);
            validateSkuList(text);
        } catch (err) {
            setSkuList('');
            setValidationError('Failed to read clipboard');
        }
    };

    const validateSkuList = (text) => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const skus = lines.map(line => line.trim());

        // Check if number of SKUs matches number of combinations
        if (skus.length !== combinations.length) {
            setValidationError(`Number of SKUs (${skus.length}) doesn't match number of combinations (${combinations.length})`);
            return false;
        }

        // Check for duplicates within the pasted list
        const uniqueSkus = new Set();
        const duplicates = [];
        skus.forEach((sku, index) => {
            if (uniqueSkus.has(sku) && sku !== '') {
                duplicates.push({ sku, line: index + 1 });
            }
            uniqueSkus.add(sku);
        });

        if (duplicates.length > 0) {
            setValidationError(`Duplicate SKUs found: ${duplicates.map(d => `"${d.sku}" at line ${d.line}`).join(', ')}`);
            return false;
        }

        // Check for conflicts with existing SKUs
        const existingSkuSet = new Set(existingSkus.filter(sku => sku && sku.trim() !== ''));
        const conflicts = [];
        skus.forEach((sku, index) => {
            if (sku && existingSkuSet.has(sku)) {
                conflicts.push({ sku, line: index + 1 });
            }
        });

        if (conflicts.length > 0) {
            setValidationError(`SKUs already exist: ${conflicts.map(c => `"${c.sku}" at line ${c.line}`).join(', ')}`);
            return false;
        }

        setValidationError('');
        return true;
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setSkuList(value);
        validateSkuList(value);
    };

    const handleClear = () => {
        setSkuList('');
        setValidationError('');
    };

    const handleImport = () => {
        if (validateSkuList(skuList)) {
            const skus = skuList.split('\n')
                .map(line => line.trim())
                .filter(line => line !== '');
            onImport(skus);
            onClose();
        }
    };

    const handleClose = () => {
        setSkuList('');
        setValidationError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">Bulk Import SKUs</Typography>
                    <IconButton onClick={handleClose} size="small">
                        <ClearIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            <strong>Instructions:</strong> Paste or type SKUs below, one per line.
                            Make sure the order matches the table (total {combinations.length} combinations).
                        </Typography>
                    </Alert>

                    {/* Combination Preview */}
                    <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Combination Preview ({combinations.length} items)
                        </Typography>
                        <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
                            {combinations.map((comb, index) => (
                                <Typography
                                    key={index}
                                    variant="body2"
                                    sx={{
                                        py: 0.5,
                                        borderBottom: index < combinations.length - 1 ? '1px solid #e0e0e0' : 'none',
                                        fontFamily: 'monospace',
                                        fontSize: '12px'
                                    }}
                                >
                                    <span style={{ color: '#666', marginRight: 8 }}>{index + 1}.</span>
                                    {Object.keys(comb)
                                        .sort()
                                        .map(key => comb[key]?.value)
                                        .join(' | ')}
                                </Typography>
                            ))}
                        </Box>
                    </Paper>

                    {/* SKU Input Area */}
                    <Box sx={{ mb: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle2" fontWeight={600}>
                                SKU List (one per line)
                            </Typography>
                            <Button
                                size="small"
                                startIcon={<ContentPasteIcon />}
                                onClick={handlePaste}
                                variant="outlined"
                            >
                                Paste from Clipboard
                            </Button>
                        </Box>
                        <TextField
                            multiline
                            rows={10}
                            fullWidth
                            value={skuList}
                            onChange={handleChange}
                            placeholder={`Enter ${combinations.length} SKUs, one per line...\n\nExample:\nSKU001\nSKU002\nSKU003\n...`}
                            variant="outlined"
                            error={!!validationError}
                            helperText={
                                validationError ||
                                `${skuList.split('\n').filter(l => l.trim() !== '').length} of ${combinations.length} SKUs entered`
                            }
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    fontFamily: 'monospace',
                                    fontSize: '14px'
                                }
                            }}
                        />
                    </Box>

                    {/* Existing SKUs Warning */}
                    {existingSkus.filter(sku => sku && sku.trim() !== '').length > 0 && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                                <strong>Note:</strong> There are already {existingSkus.filter(sku => sku && sku.trim() !== '').length} SKUs entered.
                                Importing will replace existing SKUs in the matching positions.
                            </Typography>
                        </Alert>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClear} color="inherit">
                    Clear
                </Button>
                <Button onClick={handleClose} color="inherit">
                    Cancel
                </Button>
                <Button
                    onClick={handleImport}
                    variant="contained"
                    disabled={!!validationError || skuList.trim() === ''}
                >
                    Import SKUs
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BulkSkuImport;
