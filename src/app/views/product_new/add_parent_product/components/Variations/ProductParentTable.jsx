// components/ProductListTable/ProductParentTable.jsx
import React, { useEffect, useRef, useCallback } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    TextField,
    Typography,
    CircularProgress,
    InputAdornment,
    FormControl
} from '@mui/material';
import { ApiService } from 'app/services/ApiService';
import { apiEndpoints } from 'app/constant/apiEndpoints';
import { localStorageKey } from 'app/constant/localStorageKey';
import dayjs from 'dayjs';
import {useParentProductStore} from "../../../states/parentProductStore";

const auth_key = localStorage.getItem(localStorageKey.auth_key);

const ProductParentTable = ({
                                combinations,
                                formdataaaaa
                            }) => {
    const {
        sellerSky,
        variantArrValues,
        skuErrors,
        loadingSkus,
        parentVariants,
        setSellerSku,
        setVariantArrValue,
        setSkuErrors,
        setLoadingSkus,
        checkForDuplicateSkus,
        validateChildProductVariants,
        trimValue
    } = useParentProductStore();

    const [localSellerSky, setLocalSellerSky] = React.useState(
        sellerSky || Array(combinations.length).fill("")
    );

    const debounceTimers = useRef({});

    useEffect(() => {
        if (sellerSky && sellerSky.length > 0) {
            setLocalSellerSky([...sellerSky]);
        }
    }, [sellerSky]);

    const validateSkuAndVariants = async (sku, index) => {
        const trimmedSku = trimValue(sku);

        // Check for duplicate SKUs first
        const duplicateError = checkForDuplicateSkus(trimmedSku, index);
        if (duplicateError) {
            setSkuErrors({ [index]: duplicateError });

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
            setSkuErrors({ [index]: "" });

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
            setLoadingSkus({ [index]: true });

            let url = apiEndpoints.getProductBySku + `/${trimmedSku}`;
            const res = await ApiService.get(url, auth_key);

            if (res.status === 200) {
                let obj = res.data.data;

                const variantError = validateChildProductVariants(obj, parentVariants);
                if (variantError) {
                    setSkuErrors({ [index]: variantError });
                    return;
                }

                setSkuErrors({ [index]: "" });

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
                    isExistingProduct: true
                };
                setVariantArrValue(newInputsFields);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setSkuErrors({ [index]: "SKU not found" });

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
                setSkuErrors({ [index]: "Error validating SKU" });
            }
        } finally {
            setLoadingSkus({ [index]: false });
        }
    };

    const debouncedValidateSku = useCallback((sku, index) => {
        const trimmedSku = trimValue(sku);

        if (debounceTimers.current[index]) {
            clearTimeout(debounceTimers.current[index]);
        }

        debounceTimers.current[index] = setTimeout(() => {
            validateSkuAndVariants(trimmedSku, index);
        }, 500);
    }, [variantArrValues]);

    const handleSellerSkuChange = async (index, event) => {
        const value = trimValue(event.target.value);

        const newSellerSkyValues = [...localSellerSky];
        newSellerSkyValues[index] = value;
        setLocalSellerSky(newSellerSkyValues);
        setSellerSku(newSellerSkyValues);

        setSkuErrors({ [index]: "" });

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
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            {formdataaaaa?.map((item) => {
                                return (
                                    <TableCell
                                        key={item}
                                        align="center"
                                        sx={{ width: "230px" }}
                                    >
                                        {item}
                                    </TableCell>
                                );
                            })}
                            <TableCell align="center" sx={{ width: "230px" }}>
                                Seller SKU *
                            </TableCell>
                            <TableCell align="center" sx={{ width: "230px" }}>
                                Quantity
                            </TableCell>
                            <TableCell align="center" sx={{ width: "230px" }}>
                                Sale Price
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {combinations.map((item, index) => {
                            const currentVariantData = variantArrValues[index] || {};
                            const isExistingProduct = currentVariantData.isExistingProduct;
                            const disableFields = shouldDisableFields(currentVariantData);

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

                                    <TableCell align="center" sx={{ width: "230px" }}>
                                        <FormControl fullWidth sx={{ m: 1 }} size="small">
                                            <TextField
                                                size="small"
                                                value={localSellerSky[index] || ""}
                                                onChange={(e) => handleSellerSkuChange(index, e)}
                                                error={!!skuErrors[index]}
                                                helperText={skuErrors[index]}
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

                                    <TableCell align="center" sx={{ width: "230px" }}>
                                        <FormControl fullWidth sx={{ m: 1 }} size="small">
                                            <TextField
                                                size="small"
                                                name="qty"
                                                value={currentVariantData.qty || ""}
                                                onChange={(e) => handleVariantForm(e, index)}
                                                id="outlined-adornment-quantity"
                                                placeholder="Quantity"
                                                disabled={disableFields || currentVariantData.qty === "0"}
                                                required={!isExistingProduct}
                                                error={!isExistingProduct && !currentVariantData.qty}
                                            />
                                        </FormControl>
                                    </TableCell>

                                    <TableCell align="center" sx={{ width: "230px" }}>
                                        <FormControl fullWidth sx={{ m: 1 }} size="small">
                                            <TextField
                                                size="small"
                                                type="text"
                                                name="sale_price"
                                                onChange={(e) => handleVariantForm(e, index)}
                                                value={currentVariantData.sale_price || ""}
                                                id="outlined-adornment-quantity"
                                                placeholder="Sale Price"
                                                disabled={disableFields || currentVariantData.sale_price === "0"}
                                                required={!isExistingProduct}
                                                error={!isExistingProduct && !currentVariantData.sale_price}
                                            />
                                        </FormControl>
                                    </TableCell>
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
};

export default ProductParentTable;
