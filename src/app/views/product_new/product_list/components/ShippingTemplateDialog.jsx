import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    FormControl,
    FormLabel,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Chip,
    Stack,
    CircularProgress
} from "@mui/material";
import { apiEndpoints } from 'app/constant/apiEndpoints';
import { useProductStore } from '../../states/useProductStore';
import { localStorageKey } from 'app/constant/localStorageKey';
import { ApiService } from 'app/services/ApiService';

const ShippingTemplateDialog = ({ isOpen = false, onClose }) => {
    const { selection } = useProductStore();
    const auth_key = localStorage.getItem(localStorageKey.auth_key);
    const [shippingTemplates, setShippingTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    console.log(selection.flatSelectedProducts);

    useEffect(() => {
        const getTemplateData = async () => {
            try {
                const res = await ApiService.get(
                    apiEndpoints.getShippingTemplates,
                    auth_key
                );
                if (res.status === 200) {
                    return res.data.templates;
                }
            } catch (error) {
                console.error("Error fetching all templates:", error);
                setError(error.message);
            }
        };

        const fetchTemplates = async () => {
            setLoading(true);
            const templates = await getTemplateData();
            setShippingTemplates(templates || []);
            setLoading(false);
        };

        if (isOpen) {
            fetchTemplates();
        }
    }, [isOpen, auth_key]);

    const handleChange = (event) => {
        setError('');
        setSelectedTemplate(event.target.value);
    };

    const handleDialogClose = () => {
        setSelectedTemplate('');
        setError('');
        setLoading(false);
        onClose();
    };

    const handleTemplateChangeSubmit = async () => {
        if (!selectedTemplate) {
            setError('Please select a shipping template');
            return;
        }

        try {
            const payload = {
                shippingTemplateId: selectedTemplate,
                productIds: selection.flatSelectedProducts.map(product => product.id)
            };
            setLoading(true);
            const res = await ApiService.post(`bulkChangeShippingTemplate`, payload, auth_key);

            if (res.status !== 200) {
                throw new Error(res.data?.message || 'Failed to update shipping template');
            }

            handleDialogClose();
        } catch (error) {
            setError(error.message);
            setLoading(false);
            setTimeout(() => {
                setError('');
            }, 3000);
        }
    };

    return (
        <Dialog
            open={isOpen}
            onClose={handleDialogClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    padding: 1,

                }
            }}
        >
            <DialogTitle sx={{
                borderBottom: 1,
                borderColor: 'divider',
                pb: 2
            }}>
                <Typography variant="h6" fontWeight={600}>
                    Change Shipping Template
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
                {/* Selected Products Section */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Selected Products ({selection.flatSelectedProducts.length})
                    </Typography>
                    <Box sx={{
                        maxHeight: '200px', // Fixed max height for scroll
                        overflowY: 'auto',
                        bgcolor: 'background.default',
                        p: 1.5,
                        borderRadius: 1,
                        border: 1,
                        borderColor: 'divider'
                    }}>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                            {selection.flatSelectedProducts.map((product, index) => (
                                <Chip
                                    key={product.id}
                                    label={product.sku}
                                    size="small"
                                    variant="outlined"
                                    sx={{ m: 0.5 }}
                                />
                            ))}
                        </Stack>
                    </Box>
                </Box>

                {/* Shipping Template Selection */}
                <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                    <InputLabel id="shipping-template-label">
                        Shipping Template
                    </InputLabel>
                    <Select
                        labelId="shipping-template-label"
                        value={selectedTemplate}
                        label="Shipping Template"
                        onChange={handleChange}
                        disabled={loading}
                    >
                        {shippingTemplates.map((template) => (
                            <MenuItem key={template._id} value={template._id}>
                                {template.title}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Error Message */}
                {error && (
                    <Box sx={{ mt: 2 }}>
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{
                p: 2.5,
                gap: 1
            }}>
                <Button
                    onClick={handleDialogClose}
                    variant="outlined"
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleTemplateChangeSubmit}
                    disabled={loading || !selectedTemplate}
                    startIcon={loading && <CircularProgress size={18} />}
                >
                    {loading ? 'Submitting...' : 'Submit'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};


export default ShippingTemplateDialog;