import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box, InputAdornment, TextField, Typography, CircularProgress } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import { useRef, useCallback } from "react";
import { useEffect } from "react";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import dayjs from "dayjs";
import { toast } from "react-toastify";

export default function ProductParentTable({
    combinations,
    formdataaaaa,
    setSellerSku,
    sellerSky,
    variantArrValues,
    setVariantArrValue,
    setIsconponentLoader,
    skuErrors,
    setSkuErrors,
    loadingSkus,
    setLoadingSkus,
    parentVariants,
    checkForDuplicateSkus,
    selectedVendor, // Added selectedVendor prop
    combinationKeys
}) {
    const [sellerSkyValues, setSellerSkyValues] = React.useState(
        sellerSky ? sellerSky : Array(combinations.length).fill("")
    );

    const auth_key = localStorage.getItem(localStorageKey.auth_key);

    const debounceTimers = useRef({});

    useEffect(() => {
        if (sellerSky && sellerSky.length > 0) {
            setSellerSkyValues([...sellerSky]);
        }
    }, [sellerSky]);

    const trimValue = (value) => {
        if (typeof value === 'string') {
            return value.trim();
        }
        return value;
    };

    const validateChildProductVariants = (childProductData, parentVariants) => {
        if (!childProductData?.variants_used || !parentVariants?.length) return null;

        const parentVariantNames = parentVariants.map(v => v.variant_name);
        const childVariantNames = childProductData.variants_used.map(v => v.variant_name);

        const conflictingVariants = parentVariantNames.filter(parentVariant =>
            childVariantNames.includes(parentVariant)
        );

        if (conflictingVariants.length > 0) {
            return `Child product already uses variants: ${conflictingVariants.join(', ')}. Please select different variants.`;
        }

        return null;
    };

    // Validate vendor match
    const validateVendorMatch = (childProductData, selectedVendor) => {
        if (!childProductData?.vendor_id || !selectedVendor) return null;

        if (childProductData.vendor_id !== selectedVendor._id) {
            return `SKU not found in this shop.`;
        }

        return null;
    };

    const combinationKeyToIndex = React.useMemo(() => {
        const map = {};
        combinationKeys?.forEach((key, index) => {
            if (key) {
                map[key] = index;
            }
        });
        return map;
    }, [combinationKeys]);

    const validateSkuAndVariants = useCallback(async (sku, index, combinationKey) => {
        const trimmedSku = trimValue(sku);

        // Check for duplicate SKUs first
        const duplicateError = checkForDuplicateSkus(trimmedSku, index);
        if (duplicateError) {
            const errorKey = combinationKey || index;
            setSkuErrors(prev => ({ ...prev, [errorKey]: duplicateError }));

            // Clear the product data if it's a duplicate SKU
            const newInputsFields = [...variantArrValues];
            newInputsFields[index] = {
                ...newInputsFields[index],
                _id: "",
                product_id: "",
                price: "",
                sale_price: "",
                qty: "",
                sale_start_date: "",
                sale_end_date: "",
                isExistingProduct: false
            };
            setVariantArrValue(newInputsFields);
            return;
        }

        if (!trimmedSku) {
            setSkuErrors(prev => ({ ...prev, [index]: "" }));

            const newInputsFields = [...variantArrValues];
            newInputsFields[index] = {
                ...newInputsFields[index],
                _id: "",
                product_id: "",
                price: "",
                sale_price: "",
                qty: "",
                sale_start_date: "",
                sale_end_date: "",
                isExistingProduct: false
            };
            setVariantArrValue(newInputsFields);
            return;
        }

        try {
            setLoadingSkus(prev => ({ ...prev, [index]: true }));

            let url = apiEndpoints.getProductBySku + `/${trimmedSku}`;
            const res = await ApiService.get(url, auth_key);

            if (res.status === 200) {
                let obj = res.data.data;

                // Validate variants
                const variantError = validateChildProductVariants(obj, parentVariants);
                if (variantError) {
                    setSkuErrors(prev => ({ ...prev, [index]: variantError }));
                    return;
                }

                // Validate vendor match
                const vendorError = validateVendorMatch(obj, selectedVendor);
                if (vendorError) {
                    setSkuErrors(prev => ({ ...prev, [index]: vendorError }));
                    return;
                }

                const errorKey = combinationKey || index;
                setSkuErrors(prev => ({ ...prev, [errorKey]: "" }));

                let sale_start_date = obj.sale_start_date ? dayjs(obj.sale_start_date) : "";
                let sale_end_date = obj.sale_end_date ? dayjs(obj.sale_end_date) : "";

                const newInputsFields = [...variantArrValues];
                newInputsFields[index] = {
                    ...newInputsFields[index],
                    _id: obj?.product_id || newInputsFields[index]?._id || "",
                    product_id: obj?.product_id || newInputsFields[index]?.product_id || "",
                    price: obj.price !== undefined && obj.price !== null ? obj.price : (newInputsFields[index]?.price || ""),
                    sale_price: obj.sale_price !== undefined && obj.sale_price !== null ? obj.sale_price : (newInputsFields[index]?.sale_price || ""),
                    qty: obj.qty !== undefined && obj.qty !== null ? obj.qty : (newInputsFields[index]?.qty || ""),
                    sale_start_date: sale_start_date || newInputsFields[index]?.sale_start_date || "",
                    sale_end_date: sale_end_date || newInputsFields[index]?.sale_end_date || "",
                    // Mark as existing product if we got valid data from API
                    isExistingProduct: true
                };
                setVariantArrValue(newInputsFields);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setSkuErrors(prev => ({ ...prev, [index]: "SKU not found" }));

                const newInputsFields = [...variantArrValues];
                newInputsFields[index] = {
                    ...newInputsFields[index],
                    _id: "",
                    product_id: "",
                    price: newInputsFields[index]?.price || "",
                    sale_price: newInputsFields[index]?.sale_price || "",
                    qty: newInputsFields[index]?.qty || "",
                    sale_start_date: newInputsFields[index]?.sale_start_date || "",
                    sale_end_date: newInputsFields[index]?.sale_end_date || "",
                    isExistingProduct: false
                };
                setVariantArrValue(newInputsFields);
            } else {
                setSkuErrors(prev => ({ ...prev, [index]: "Error validating SKU" }));
            }
        } finally {
            setLoadingSkus(prev => ({ ...prev, [index]: false }));
        }
    }, [auth_key, checkForDuplicateSkus, parentVariants, selectedVendor, setLoadingSkus, setSkuErrors, setVariantArrValue, variantArrValues]);

    const debouncedValidateSku = useCallback((sku, index) => {
        const trimmedSku = trimValue(sku);
        const combinationKey = combinationKeys?.[index];

        if (debounceTimers.current[index]) {
            clearTimeout(debounceTimers.current[index]);
        }

        debounceTimers.current[index] = setTimeout(() => {
            validateSkuAndVariants(trimmedSku, index, combinationKey);
        }, 500);
    }, [combinationKeys, validateSkuAndVariants]);

    // Revalidate all SKUs when vendor changes
    useEffect(() => {
        if (selectedVendor) {
            sellerSkyValues.forEach((sku, index) => {
                if (sku && trimValue(sku)) {
                    debouncedValidateSku(sku, index);
                }
            });
        }
    }, [selectedVendor]);

    const handleSellerSkuChange = async (index, event) => {
        const value = trimValue(event.target.value);

        const newSellerSkyValues = [...sellerSkyValues];
        newSellerSkyValues[index] = value;
        setSellerSkyValues(newSellerSkyValues);
        setSellerSku(newSellerSkyValues);

        setSkuErrors(prev => ({ ...prev, [index]: "" }));

        debouncedValidateSku(value, index);
    };

    const handleVariantForm = (e, index) => {
        const fieldName = e.target.name;
        const value = fieldName === 'qty' || fieldName === 'price' || fieldName === 'sale_price'
            ? e.target.value
            : trimValue(e.target.value);

        if (fieldName === "qty" || fieldName === "price" || fieldName === "sale_price") {
            if (/^\d*\.?\d*$/.test(value) || value === "") {
                const newInputsFields = [...variantArrValues];
                newInputsFields[index] = {
                    ...newInputsFields[index],
                    [fieldName]: value
                };
                setVariantArrValue(newInputsFields);
            }
            return;
        }

        const newInputsFields = [...variantArrValues];
        newInputsFields[index] = {
            ...newInputsFields[index],
            [fieldName]: value
        };
        setVariantArrValue(newInputsFields);
    };

    useEffect(() => {
        if (combinations.length > 0 && variantArrValues.length !== combinations.length) {
            const newVariantArrValues = [...variantArrValues];

            if (combinations.length > variantArrValues.length) {
                const itemsToAdd = combinations.length - variantArrValues.length;
                for (let i = 0; i < itemsToAdd; i++) {
                    newVariantArrValues.push({
                        _id: "",
                        product_id: "",
                        sale_price: "",
                        price: "",
                        sale_start_date: "",
                        sale_end_date: "",
                        qty: "",
                        isExistingProduct: false
                    });
                }
            } else if (combinations.length < variantArrValues.length) {
                newVariantArrValues.splice(combinations.length);
            }

            setVariantArrValue(newVariantArrValues);
        }
    }, [combinations.length]);

    useEffect(() => {
        return () => {
            Object.values(debounceTimers.current).forEach(timer => {
                clearTimeout(timer);
            });
        };
    }, []);

    const dateHandler = (e, name, index) => {
        if (name === "sale_end_date") {
            const newInputsFields = [...variantArrValues];
            if (
                newInputsFields[index]?.sale_start_date &&
                e &&
                dayjs(e).isBefore(newInputsFields[index]?.sale_start_date)
            ) {
                toast.error("End Sale Date should be after Start Sale Date");
                newInputsFields[index][name] = null;
                return;
            }
        }
        const newInputsFields = [...variantArrValues];
        newInputsFields[index] = {
            ...newInputsFields[index],
            [name]: e
        };
        setVariantArrValue(newInputsFields);
    };

    // Helper function to check if fields should be disabled
    const shouldDisableFields = (variantData) => {
        return variantData.isExistingProduct &&
            (variantData.sale_price === 0 || variantData.sale_price === "0") &&
            (variantData.qty === 0 || variantData.qty === "0");
    };

    return (
        <Box sx={{ marginTop: '20px' }}>
            <Typography variant="h6" gutterBottom>
                Variant Combinations
            </Typography>
            {selectedVendor && (
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    Selected Shop: <strong>{selectedVendor.shopName}</strong>
                </Typography>
            )}
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            {formdataaaaa?.map((item) => {
                                return (
                                    <TableCell
                                        key={item}
                                        align="center"
                                        sx={{
                                            width: "230px"
                                        }}
                                    >
                                        {item}
                                    </TableCell>
                                );
                            })}
                            <TableCell
                                align="center"
                                sx={{
                                    width: "230px"
                                }}
                            >
                                Seller SKU *
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{
                                    width: "230px"
                                }}
                            >
                                Quantity
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{
                                    width: "230px"
                                }}
                            >
                                Sale Price
                            </TableCell>
                            {/* Remove Price, Sale Start Date, and Sale End Date columns */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {combinations.map((item, index) => {
                            const currentVariantData = variantArrValues[index] || {};
                            const isExistingProduct = currentVariantData.isExistingProduct;
                            const disableFields = shouldDisableFields(currentVariantData);
                            const combinationKey = combinationKeys?.[index];
                            const currentSkuError = combinationKey ? skuErrors[combinationKey] : skuErrors[index];

                            return (
                                <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }} key={index}>
                                    {formdataaaaa?.map((iddd, iindexx) => {
                                        const dynamicKey = `key${iindexx + 1}`;
                                        return (
                                            <TableCell key={iindexx} align="center" component="th" scope="row">
                                                {item[dynamicKey]?.value}
                                            </TableCell>
                                        );
                                    })}

                                    <TableCell
                                        align="center"
                                        sx={{
                                            width: "230px"
                                        }}
                                    >
                                        <FormControl fullWidth sx={{ m: 1 }} size="small">
                                            <TextField
                                                size="small"
                                                value={sellerSkyValues[index] || ""}
                                                onChange={(e) => handleSellerSkuChange(index, e)}
                                                error={!!currentSkuError}
                                                helperText={currentSkuError}
                                                id="outlined-adornment-quantity"
                                                placeholder="Seller SKU"
                                                InputProps={{
                                                    endAdornment: loadingSkus[index] ? (
                                                        <InputAdornment position="end">
                                                            <CircularProgress size={20} />
                                                        </InputAdornment>
                                                    ) : null
                                                }}
                                            />
                                        </FormControl>
                                    </TableCell>

                                    <TableCell
                                        align="center"
                                        sx={{
                                            width: "230px"
                                        }}
                                    >
                                        <FormControl fullWidth sx={{ m: 1 }} size="small">
                                            <TextField
                                                size="small"
                                                name="qty"
                                                value={currentVariantData.qty || ""}
                                                onChange={(e) => {
                                                    handleVariantForm(e, index);
                                                }}
                                                id="outlined-adornment-quantity"
                                                placeholder="Quantity"
                                                disabled={disableFields || currentVariantData.qty === "0"}
                                                // Remove required attribute for existing products
                                                required={!isExistingProduct}
                                                error={!isExistingProduct && !currentVariantData.qty}
                                            />
                                        </FormControl>
                                    </TableCell>

                                    <TableCell
                                        align="center"
                                        sx={{
                                            width: "230px"
                                        }}
                                    >
                                        <FormControl fullWidth sx={{ m: 1 }} size="small">
                                            <TextField
                                                size="small"
                                                type="text"
                                                name="sale_price"
                                                onChange={(e) => {
                                                    handleVariantForm(e, index);
                                                }}
                                                value={currentVariantData.sale_price || ""}
                                                id="outlined-adornment-quantity"
                                                placeholder="Sale Price"
                                                disabled={disableFields || currentVariantData.sale_price === "0"}
                                                // Remove required attribute for existing products
                                                required={!isExistingProduct}
                                                error={!isExistingProduct && !currentVariantData.sale_price}
                                            />
                                        </FormControl>
                                    </TableCell>

                                    {/* Remove Price, Sale Start Date, and Sale End Date columns */}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {Object.values(skuErrors).some(error => error) && (
                <Typography
                    color="error"
                    variant="body2"
                    sx={{ mt: 1, p: 1, backgroundColor: '#ffebee', borderRadius: 1 }}
                >
                    Please resolve SKU validation errors before submitting
                </Typography>
            )}
        </Box>
    );
}
