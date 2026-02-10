import { useState, useEffect } from 'react'
import {
    Box,
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    FormLabel,
    InputLabel
} from '@mui/material';
import { apiEndpoints } from 'app/constant/apiEndpoints';
import { useProductStore } from '../../states/useProductStore';
import { localStorageKey } from 'app/constant/localStorageKey';
import { ApiService } from 'app/services/ApiService';

const ShippingTemplateDialog = ({ isOpen = false, onClose }) => {
    const { selection } = useProductStore();
    const auth_key = localStorage.getItem(localStorageKey.auth_key);
    const [shippingTemplates, setshippingTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('')
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    console.log('flat', selection.flatSelectedProducts);
    useEffect(() => {
        const getTemplateData = async () => {
            try {
                const res = await ApiService.get(
                    apiEndpoints.getShippingTemplates,
                    auth_key
                );
                if (res.status === 200) {
                    console.log('flat', selection.flatSelectedProducts);
                    return res.data.templates;
                }
            } catch (error) {
                console.error("Error fetching all templates:", error);
                setError(error);
            }
        };

        const fetchTemplates = async () => {
            setLoading(true);
            const templates = await getTemplateData();
            setshippingTemplates(templates || []);
            setLoading(false);
        };

        fetchTemplates();
    }, []);

    const handleChange = (event) => {
        setError('')
        setSelectedTemplate(event.target.value);
    };

    const handleDialogClose = () => {
        setSelectedTemplate('');
        setError('');
        setLoading(false);
        onClose();
    }

    const handleTemplateChangeSubmit = async () => {
        try {
            const payload = {
                shippingTemplateId: selectedTemplate,
                productIds: selection.flatSelectedProducts.map(product => product.id)
            }
            setLoading(true);
            const res = await ApiService.post(`bulkChangeShippingTemplate`, payload, auth_key);
            console.log(res);
            if (res.status !== 200) {
                throw new Error(res.message);
            }
            handleDialogClose();
        } catch (error) {
            setError(error.message);
            console.log(error.message);
            setLoading(false);
            setTimeout(() => {
                setError('');
            }, 3000);
        }
    };

    return (
        <>
            <Dialog
                open={isOpen || false}
                onClose={handleDialogClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Change Shipping Template
                </DialogTitle>
                <DialogContent>
                    <Box>
                        Selected Products :{selection.flatSelectedProducts.length}
                        {/* <Box sx={{ pt: 1, display: 'flex', gap: 1 }}>
                            {
                                selection.flatSelectedProducts.map(product => (
                                    <Typography sx={{ fontWeight: 500 }} key={product.id}>
                                        {product.sku},
                                    </Typography>
                                ))
                            }
                        </Box> */}
                    </Box>

                    <FormControl sx={{ p: 2 }}>
                        <FormLabel sx={{ color: 'inherit', textDecorationColor: 'none' }}>Choose Shipping Template</FormLabel>
                        <FormControl fullWidth size="small">
                            <InputLabel id="shipping-template-label">
                                Shipping Template
                            </InputLabel>
                            <Select
                                labelId="shipping-template-label"
                                value={selectedTemplate}
                                label="Shipping Template"
                                onChange={handleChange}
                            >
                                {shippingTemplates.map((template) => (
                                    <MenuItem key={template._id} value={template._id}>
                                        {template.title}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Box sx={{ ml: '0px' }}>
                        {error.length > 0 && (<Typography sx={{ color: 'red', fontWeight: '500' }}>
                            {error}
                        </Typography>)}
                    </Box>
                    <Box sx={{ ml: 'auto' }}>
                        <Button onClick={handleDialogClose}>
                            cancel
                        </Button>
                        <Button
                            variant='contained'
                            onClick={handleTemplateChangeSubmit}
                        >
                            {loading ? 'Submitting' : 'Submit'}
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </>
    )
}


export default ShippingTemplateDialog;