import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    TextField,
    MenuItem,
    InputAdornment,
    OutlinedInput,
    FormControl,
    InputLabel,
    Button,
    CircularProgress
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useProductFormStore } from "../../../../states/useAddProducts";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";

const ProductOffer = () => {
    const {
        formData,
        setFormData,
        formValues,
        inputErrors,
        setInputErrors,
        loading,
        draftLoading,
        shippingTemplateData,
        exchangePolicy,
    } = useProductFormStore();

    const auth_key = localStorage.getItem(localStorageKey.auth_key);

    // Form data handler
    const handleFieldChange = (field, value) => {
        setFormData({ [field]: value });

        // Clear error when field is updated
        if (inputErrors[field]) {
            setInputErrors({ [field]: "" });
        }
    };

    useEffect(() => {
        if(formValues.isCheckedPrice) {
            setFormData({salePrice: 0});
        }

        if(formValues.isCheckedQuantity) {
            setFormData({quantity: 0});
        }
    }, [formValues]);

    // Date handlers
    const handleSaleStartDateChange = (newDate) => {
        handleFieldChange('saleStartDate', newDate);
    };

    const handleSaleEndDateChange = (newDate) => {
        handleFieldChange('saleEndDate', newDate);
    };

    const handleReStockChange = (newDate) => {
        handleFieldChange('reStockDate', newDate);
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                maxWidth: "1200px",
                mx: "auto"
            }}
        >
            {/* Product Tax Code */}
            <Box
                sx={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center"
                }}
            >
                <Box
                    sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        width: "12.7%",
                        minWidth: "120px"
                    }}
                >
                    Product Tax Code:
                </Box>
                <Box sx={{ width: "50%" }}>
                    <FormControl fullWidth>
                        <TextField
                            value={formData.ProductTaxCode}
                            onChange={(e) => handleFieldChange('ProductTaxCode', e.target.value)}
                            fullWidth
                            label="Product Tax Code"
                            name="ProductTaxCode"
                        />
                    </FormControl>
                </Box>
            </Box>

            {/* Shipping Templates */}
            <Box
                sx={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center"
                }}
            >
                <Box
                    sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        width: "12.7%",
                        minWidth: "120px"
                    }}
                >
                    Shipping Templates
                    <span style={{ color: "red", marginLeft: "3px" }}>*</span>:
                </Box>
                <Box sx={{ width: "50%" }}>
                    <FormControl fullWidth>
                        <TextField
                            error={!!inputErrors.shipingTemplates}
                            helperText={inputErrors.shipingTemplates}
                            value={formData.shipingTemplates}
                            onChange={(e) => handleFieldChange('shipingTemplates', e.target.value)}
                            onBlur={() => {
                                if (!formData.shipingTemplates) {
                                    setInputErrors(prev => ({ ...prev, shipingTemplates: "Shipping Template is Required" }));
                                }
                            }}
                            select
                            label="Shipping Template"
                            name="shipingTemplates"
                        >
                            {shippingTemplateData?.map((item) => (
                                <MenuItem key={item._id} value={item._id}>
                                    {item.title}
                                </MenuItem>
                            ))}
                        </TextField>
                    </FormControl>
                </Box>
            </Box>

            {/* Return and Exchange Policy */}
            <Box
                sx={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center"
                }}
            >
                <Box
                    sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        width: "12.7%",
                        minWidth: "120px"
                    }}
                >
                    Return & Exchange Policy
                    <span style={{ color: "red", marginLeft: "3px" }}>*</span>:
                </Box>
                <Box sx={{ width: "50%" }}>
                    <FormControl fullWidth>
                        <TextField
                            error={!!inputErrors.exchangePolicy}
                            helperText={inputErrors.exchangePolicy}
                            value={formData.exchangePolicy}
                            onChange={(e) => handleFieldChange('exchangePolicy', e.target.value)}
                            onBlur={() => {
                                if (!formData.exchangePolicy) {
                                    setInputErrors(prev => ({ ...prev, exchangePolicy: "Return and exchange policy is required" }));
                                }
                            }}
                            select
                            label="Return and Exchange Policy"
                            name="exchangePolicy"
                        >
                            {exchangePolicy?.map((item) => (
                                <MenuItem key={item._id} value={item._id}>
                                    {item.policyTitle}
                                </MenuItem>
                            ))}
                        </TextField>
                    </FormControl>
                </Box>
            </Box>

            {/* Sale Price */}
            <Box
                sx={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center"
                }}
            >
                <Box
                    sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        width: "12.7%",
                        minWidth: "120px"
                    }}
                >
                    Sale Price:
                </Box>
                <Box sx={{ width: "50%" }}>
                    <FormControl fullWidth>
                        <InputLabel htmlFor="sale-price">Amount</InputLabel>
                        <OutlinedInput
                            error={!!inputErrors.salePrice}
                            value={formData.salePrice}
                            onChange={(e) => handleFieldChange('salePrice', e.target.value)}
                            disabled={formValues.isCheckedPrice}
                            onBlur={() => {
                                if (!formData.salePrice) {
                                    setInputErrors({salePrice: "Sale Price is Required" });
                                }
                            }}
                            id="sale-price"
                            startAdornment={<InputAdornment position="start">$</InputAdornment>}
                            label="Amount"
                            name="salePrice"
                        />
                    </FormControl>
                    {inputErrors.salePrice && (
                        <Typography
                            sx={{
                                fontSize: "12px",
                                color: "#FF3D57",
                                mt: 0.5
                            }}
                        >
                            {inputErrors.salePrice}
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Quantity */}
            <Box
                sx={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center"
                }}
            >
                <Box
                    sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        width: "12.7%",
                        minWidth: "120px"
                    }}
                >
                    Quantity
                    <span style={{ color: "red", marginLeft: "3px" }}>*</span>:
                </Box>
                <Box sx={{ width: "50%" }}>
                    <FormControl fullWidth>
                        <TextField
                            error={!!inputErrors.quantity}
                            helperText={inputErrors.quantity}
                            value={formData.quantity}
                            onChange={(e) => handleFieldChange('quantity', e.target.value)}
                            disabled={formValues.isCheckedQuantity}
                            onBlur={() => {
                                if (!formData.quantity) {
                                    setInputErrors(prev => ({ ...prev, quantity: "Quantity is Required" }));
                                }
                            }}
                            fullWidth
                            label="Quantity"
                            name="quantity"
                        />
                    </FormControl>
                </Box>
            </Box>

            {/* Sale Start Date */}
            <Box
                sx={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center",
                }}
            >
                <Box
                    sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        width: "12.7%",
                        minWidth: "120px"
                    }}
                >
                    Sale Start Date:
                </Box>
                <Box sx={{ width: "50%" }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Select Start Date"
                            value={formData.saleStartDate}
                            onChange={handleSaleStartDateChange}
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </LocalizationProvider>
                </Box>
            </Box>

            {/* Sale End Date */}
            <Box
                sx={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center"
                }}
            >
                <Box
                    sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        width: "12.7%",
                        minWidth: "120px"
                    }}
                >
                    Sale End Date:
                </Box>
                <Box sx={{ width: "50%" }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Select End Date"
                            value={formData.saleEndDate}
                            onChange={handleSaleEndDateChange}
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </LocalizationProvider>
                </Box>
            </Box>

            {/* Max Order Quantity */}
            <Box
                sx={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center"
                }}
            >
                <Box
                    sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        width: "12.7%",
                        minWidth: "120px"
                    }}
                >
                    Max Order Quantity:
                </Box>
                <Box sx={{ width: "50%" }}>
                    <FormControl fullWidth>
                        <TextField
                            value={formData.maxOrderQuantity}
                            onChange={(e) => handleFieldChange('maxOrderQuantity', e.target.value)}
                            fullWidth
                            label="Max Order Quantity"
                            name="maxOrderQuantity"
                        />
                    </FormControl>
                </Box>
            </Box>

            {/* Production Time */}
            <Box
                sx={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center"
                }}
            >
                <Box
                    sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        width: "12.7%",
                        minWidth: "120px"
                    }}
                >
                    Production Time:
                </Box>
                <Box sx={{ width: "50%" }}>
                    <FormControl fullWidth>
                        <TextField
                            value={formData.productionTime}
                            onChange={(e) => handleFieldChange('productionTime', e.target.value)}
                            fullWidth
                            label="Production Time"
                            name="productionTime"
                        />
                    </FormControl>
                </Box>
            </Box>

            {/* Color */}
            <Box
                sx={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center"
                }}
            >
                <Box
                    sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        width: "12.7%",
                        minWidth: "120px"
                    }}
                >
                    Color:
                </Box>
                <Box sx={{ width: "50%" }}>
                    <FormControl fullWidth>
                        <TextField
                            value={formData.color}
                            onChange={(e) => handleFieldChange('color', e.target.value)}
                            fullWidth
                            label="Color"
                            name="color"
                        />
                    </FormControl>
                </Box>
            </Box>

            {/* Offering Can Be */}
            <Box
                sx={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center"
                }}
            >
                <Box
                    sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        width: "12.7%",
                        minWidth: "120px"
                    }}
                >
                    Offering Can Be:
                </Box>
                <Box sx={{ width: "50%" }}>
                    <FormControl fullWidth>
                        <TextField
                            value={formData.offeringCanBe}
                            onChange={(e) => handleFieldChange('offeringCanBe', e.target.value)}
                            select
                            label="Offering"
                            name="offeringCanBe"
                        >
                            <MenuItem value="gift">Gift</MenuItem>
                            <MenuItem value="premium">Premium</MenuItem>
                            <MenuItem value="standard">Standard</MenuItem>
                            <MenuItem value="custom">Custom</MenuItem>
                        </TextField>
                    </FormControl>
                </Box>
            </Box>

            {/* Is Gift Wrap Available */}
            <Box
                sx={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center"
                }}
            >
                <Box
                    sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        width: "12.7%",
                        minWidth: "120px"
                    }}
                >
                    Is Gift Wrap Available:
                </Box>
                <Box sx={{ width: "50%" }}>
                    <FormControl fullWidth>
                        <TextField
                            value={formData.isGiftWrap}
                            onChange={(e) => handleFieldChange('isGiftWrap', e.target.value)}
                            select
                            label="Gift Wrap"
                            name="isGiftWrap"
                        >
                            <MenuItem value="yes">Yes</MenuItem>
                            <MenuItem value="no">No</MenuItem>
                        </TextField>
                    </FormControl>
                </Box>
            </Box>

            {/* Restock Date */}
            <Box
                sx={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center"
                }}
            >
                <Box
                    sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        width: "12.7%",
                        minWidth: "120px"
                    }}
                >
                    Restock Date:
                </Box>
                <Box sx={{ width: "50%" }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Select Restock Date"
                            value={formData.reStockDate}
                            onChange={handleReStockChange}
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </LocalizationProvider>
                </Box>
            </Box>
        </Box>
    );
};

export default ProductOffer;
