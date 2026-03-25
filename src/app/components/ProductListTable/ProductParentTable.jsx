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
    parentId,
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
    selectedVendor,
    combinationKeys,
    skuByKeyMap, // Maps combination keys to SKUs from parent
    currentCombinationStatus
}) {
    // Map SKUs by combination key instead of index to handle sequence changes
    const auth_key = localStorage.getItem(localStorageKey.auth_key);

    const debounceTimers = useRef({});
    const prevVendorRef = useRef(null);

    // Initialize SKU state from the skuByKeyMap (passed from parent)
    useEffect(() => {
        // The parent passes skuByKeyMap which is the lookup from combo key -> SKU
        // We just use it directly to display SKUs without rebuilding
        console.log("Initialized with skuByKeyMap:", skuByKeyMap);
    }, [skuByKeyMap]);

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

    const validateSkuReuse = (childProductData) => {
        if (!selectedVendor || !childProductData) return null;

        if (childProductData.parent_id && childProductData.vendor_id === selectedVendor._id && childProductData.parent_id !== parentId) {
            return "SKU already used in another parent product";
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
        const errorKey = combinationKey || index;

        // Check for duplicate SKUs first
        const duplicateError = checkForDuplicateSkus(trimmedSku, index);
        if (duplicateError) {
            setSkuErrors(prev => ({ ...prev, [errorKey]: duplicateError }));

            setVariantArrValue(prev => {
                const newInputsFields = [...prev];
                // Use current index from mapping to handle shifting during async call
                const currentIndex = combinationKey && combinationKeyToIndex[combinationKey] !== undefined
                    ? combinationKeyToIndex[combinationKey]
                    : index;

                if (newInputsFields[currentIndex]) {
                    newInputsFields[currentIndex] = {
                        ...newInputsFields[currentIndex],
                        _id: "",
                        product_id: "",
                        price: "",
                        sale_price: "",
                        qty: "",
                        sale_start_date: "",
                        sale_end_date: "",
                        isExistingProduct: false
                    };
                }
                return newInputsFields;
            });
            return;
        }

        if (!trimmedSku) {
            setSkuErrors(prev => ({ ...prev, [errorKey]: "" }));
            setVariantArrValue(prev => {
                const newInputsFields = [...prev];
                const currentIndex = combinationKey && combinationKeyToIndex[combinationKey] !== undefined
                    ? combinationKeyToIndex[combinationKey]
                    : index;

                if (newInputsFields[currentIndex]) {
                    newInputsFields[currentIndex] = {
                        ...newInputsFields[currentIndex],
                        _id: "",
                        product_id: "",
                        price: "",
                        sale_price: "",
                        qty: "",
                        sale_start_date: "",
                        sale_end_date: "",
                        isExistingProduct: false
                    };
                }
                return newInputsFields;
            });
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
                    setSkuErrors(prev => ({ ...prev, [errorKey]: variantError }));
                    return;
                }

                // Validate vendor match
                const vendorError = validateVendorMatch(obj, selectedVendor);
                if (vendorError) {
                    setSkuErrors(prev => ({ ...prev, [errorKey]: vendorError }));
                    return;
                }

                // Validate SKU reuse
                const skuReuseError = validateSkuReuse(obj);
                if (skuReuseError) {
                    setSkuErrors(prev => ({ ...prev, [errorKey]: skuReuseError }));
                    return;
                }

                setSkuErrors(prev => ({ ...prev, [errorKey]: "" }));

                let sale_start_date = obj.sale_start_date ? dayjs(obj.sale_start_date) : "";
                let sale_end_date = obj.sale_end_date ? dayjs(obj.sale_end_date) : "";

                setVariantArrValue(prev => {
                    const newInputsFields = [...prev];
                    // IMPORTANT: Find the latest index for this specific combination
                    const currentIndex = combinationKey && combinationKeyToIndex[combinationKey] !== undefined
                        ? combinationKeyToIndex[combinationKey]
                        : index;

                    if (newInputsFields[currentIndex]) {
                        newInputsFields[currentIndex] = {
                            ...newInputsFields[currentIndex],
                            _id: obj?.product_id || newInputsFields[currentIndex]?._id || "",
                            product_id: obj?.product_id || newInputsFields[currentIndex]?.product_id || "",
                            price: obj.price !== undefined && obj.price !== null ? obj.price : (newInputsFields[currentIndex]?.price || ""),
                            sale_price: obj.sale_price !== undefined && obj.sale_price !== null ? obj.sale_price : (newInputsFields[currentIndex]?.sale_price || ""),
                            qty: obj.qty !== undefined && obj.qty !== null ? obj.qty : (newInputsFields[currentIndex]?.qty || ""),
                            sale_start_date: sale_start_date || newInputsFields[currentIndex]?.sale_start_date || "",
                            sale_end_date: sale_end_date || newInputsFields[currentIndex]?.sale_end_date || "",
                            isExistingProduct: true
                        };
                    }
                    return newInputsFields;
                });
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setSkuErrors(prev => ({ ...prev, [errorKey]: "SKU not found" }));
                setVariantArrValue(prev => {
                    const newInputsFields = [...prev];
                    const currentIndex = combinationKey && combinationKeyToIndex[combinationKey] !== undefined
                        ? combinationKeyToIndex[combinationKey]
                        : index;
                    if (newInputsFields[currentIndex]) {
                        newInputsFields[currentIndex] = {
                            ...newInputsFields[currentIndex],
                            _id: "",
                            product_id: "",
                            isExistingProduct: false
                        };
                    }
                    return newInputsFields;
                });
            } else {
                setSkuErrors(prev => ({ ...prev, [errorKey]: "Error validating SKU" }));
            }
        } finally {
            setLoadingSkus(prev => ({ ...prev, [index]: false }));
        }
    }, [auth_key, checkForDuplicateSkus, combinationKeyToIndex, parentVariants, selectedVendor, setLoadingSkus, setSkuErrors, setVariantArrValue]);

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

    // Trigger validation when a new row is added or deleted
    useEffect(() => {
        if (combinations.length > 0 && sellerSky.length > 0) {
            sellerSky.forEach((sku, index) => {
                if (sku && trimValue(sku)) {
                    const combinationKey = combinationKeys?.[index];
                    validateSkuAndVariants(sku, index, combinationKey);
                }
            });
        }
    }, [combinations.length]);

    useEffect(() => {
        if (!sellerSky?.length) return;

        setVariantArrValue(prev => {
            const newInputsFields = [...prev];
            let hasChanges = false;

            sellerSky.forEach((sku, index) => {
                const trimmedSku = typeof sku === 'string' ? sku.trim() : sku;
                const isSkuEmpty = trimmedSku === "" || trimmedSku === undefined || trimmedSku === null;

                if (isSkuEmpty && newInputsFields[index]) {
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
                    hasChanges = true;
                }
            });

            return hasChanges ? newInputsFields : prev;
        });
    }, [sellerSky, setVariantArrValue]);

    // Only revalidate when vendor ID actually changes, not on every sellerSky update
    useEffect(() => {
        const vendorId = selectedVendor?._id;

        // Only trigger if vendor ID changed from previous value
        if (vendorId && vendorId !== prevVendorRef.current) {
            console.log('Vendor changed, revalidating SKUs');
            prevVendorRef.current = vendorId;

            sellerSky.forEach((sku, index) => {
                if (sku && trimValue(sku)) {
                    debouncedValidateSku(sku, index);
                }
            });
        }
    }, [selectedVendor?._id]);

    const handleSellerSkuChange = async (index, event) => {
        const value = trimValue(event.target.value);
        const combinationKey = combinationKeys?.[index];

        // Update the sellerSku array
        const newSellerSku = [...sellerSky];
        newSellerSku[index] = value;
        setSellerSku(newSellerSku);

        const errorKey = combinationKey || index;
        setSkuErrors(prev => ({ ...prev, [errorKey]: "" }));

        debouncedValidateSku(value, index);
    };

    const handleVariantForm = (e, index) => {
        const fieldName = e.target.name;
        const value = fieldName === 'qty' || fieldName === 'price' || fieldName === 'sale_price'
            ? e.target.value
            : trimValue(e.target.value);

        setVariantArrValue(prev => {
            const newInputsFields = [...prev];
            if (newInputsFields[index]) {
                if (fieldName === "qty" || fieldName === "price" || fieldName === "sale_price") {
                    if (/^\d*\.?\d*$/.test(value) || value === "") {
                        newInputsFields[index] = {
                            ...newInputsFields[index],
                            [fieldName]: value
                        };
                    }
                } else {
                    newInputsFields[index] = {
                        ...newInputsFields[index],
                        [fieldName]: value
                    };
                }
            }
            return newInputsFields;
        });
    };

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
                <Table sx={{ tableLayout: "auto" }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            {formdataaaaa?.map((item) => {
                                return (
                                    <TableCell
                                        key={item}
                                        align="center"
                                        sx={{
                                            whiteSpace: "nowrap",
                                            mr: 0.5
                                        }}
                                    >
                                        {item}
                                    </TableCell>
                                );
                            })}
                            <TableCell
                                align="center"
                                sx={{
                                    whiteSpace: "nowrap",
                                    mr: 0.5
                                }}
                            >
                                status
                            </TableCell>
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
                                    width: "110px"
                                }}
                            >
                                Quantity
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{
                                    width: "110px"
                                }}
                            >
                                Sale Price
                            </TableCell>
                            {/* Remove Price, Sale Start Date, and Sale End Date columns */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {combinations && combinations.length > 0 ? (
                            combinations.map((item, index) => {
                                const currentVariantData = variantArrValues[index] || {};
                                const isExistingProduct = currentVariantData.isExistingProduct;
                                const disableFields = shouldDisableFields(currentVariantData);
                                const combinationKey = combinationKeys?.[index];
                                const currentSkuError = combinationKey ? skuErrors[combinationKey] : skuErrors[index];
                                const hasInactiveAttribute = Object.values(item || {}).some(
                                    (attribute) => attribute?.status === false
                                );

                                // Debug logging
                                if (index < 3 || index >= combinations.length - 2) {
                                    console.log(`Row ${index}:`, {
                                        combinationKey,
                                        itemKeys: Object.keys(item),
                                        hasVariantData: !!currentVariantData._id,
                                        skuError: currentSkuError
                                    });
                                }

                                return (
                                    <TableRow
                                        sx={{
                                            backgroundColor: hasInactiveAttribute ? "action.hover" : "transparent",
                                            "&:last-child td, &:last-child th": { border: 0 }
                                        }}
                                        key={index}
                                    >
                                        {formdataaaaa?.map((iddd, iindexx) => {
                                            const dynamicKey = `key${iindexx + 1}`;
                                            const attributeItem = item[dynamicKey];
                                            return (
                                                <TableCell key={iindexx} align="center" component="th" scope="row">
                                                    <Typography color={attributeItem?.status === false ? "text.secondary" : "text.primary"}>
                                                        {attributeItem?.value || 'N/A'}
                                                    </Typography>
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell
                                            align="center"
                                            sx={{
                                                whiteSpace: "nowrap"
                                            }}
                                        >
                                            <Typography>
                                                {currentCombinationStatus.find((comb) => { return comb.sku === sellerSky[index] })?.status ?? ""}
                                            </Typography>
                                        </TableCell>

                                        <TableCell
                                            align="center"
                                            sx={{
                                                width: "230px"
                                            }}
                                        >
                                            <FormControl sx={{ m: 1, width: "auto" }} size="small">
                                                <TextField
                                                    size="small"
                                                    value={sellerSky[index] || ""}
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
                                                width: "110px"
                                            }}
                                        >
                                            <FormControl sx={{ m: 1, width: "auto" }} size="small">
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
                                                width: "110px"
                                            }}
                                        >
                                            <FormControl sx={{ m: 1, width: "auto" }} size="small">
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
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={formdataaaaa?.length + 3} align="center">
                                    <Typography variant="body2" sx={{ py: 2 }}>
                                        No combinations available. Please select attributes from all required variants.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
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
