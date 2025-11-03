import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box, InputAdornment, OutlinedInput, TextField, Typography, CircularProgress } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateField } from "@mui/x-date-pickers/DateField";
import { useState } from "react";
import { useEffect } from "react";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { result } from "lodash";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";
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
                                               parentVariants
                                           }) {
    console.log("ProductParentTable combinations:", combinations);
    const [sellerSkyValues, setSellerSkyValues] = React.useState(
        sellerSky ? sellerSky : Array(combinations.length).fill("")
    );

    const auth_key = localStorage.getItem(localStorageKey.auth_key);

    // Enhanced variant conflict validation
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

    // Enhanced SKU validation with variant conflict detection
    const validateSkuAndVariants = async (sku, index) => {
        if (!sku) {
            setSkuErrors(prev => ({ ...prev, [index]: "" }));
            return;
        }

        try {
            setLoadingSkus(prev => ({ ...prev, [index]: true }));

            let url = apiEndpoints.getProductBySku + `/${sku}`;
            const res = await ApiService.get(url, auth_key);

            if (res.status === 200) {
                let obj = res.data.data;

                // Check for variant conflicts
                const variantError = validateChildProductVariants(obj, parentVariants);
                if (variantError) {
                    setSkuErrors(prev => ({ ...prev, [index]: variantError }));
                    return;
                }

                setSkuErrors(prev => ({ ...prev, [index]: "" }));

                // Update the variant values with the fetched data
                let sale_start_date = obj.sale_start_date ? dayjs(obj.sale_start_date) : "";
                let sale_end_date = obj.sale_end_date ? dayjs(obj.sale_end_date) : "";

                const newInputsFields = [...variantArrValues];
                newInputsFields[index] = {
                    ...newInputsFields[index],
                    ...obj,
                    _id: obj?.product_id,
                    sale_start_date,
                    sale_end_date
                };
                setVariantArrValue(newInputsFields);
            }
        } catch (error) {
            console.log(error);
            if (error.response?.status === 404) {
                setSkuErrors(prev => ({ ...prev, [index]: "SKU not found" }));
            } else {
                setSkuErrors(prev => ({ ...prev, [index]: "Error validating SKU" }));
            }
        } finally {
            setLoadingSkus(prev => ({ ...prev, [index]: false }));
        }
    };

    // Enhanced SKU change handler
    const handleSellerSkuChange = async (index, event) => {
        const value = event.target.value;

        const newSellerSkyValues = [...sellerSkyValues];
        newSellerSkyValues[index] = value;
        setSellerSkyValues(newSellerSkyValues);
        setSellerSku(newSellerSkyValues);

        // Clear previous error
        setSkuErrors(prev => ({ ...prev, [index]: "" }));

        // Validate SKU and variants
        await validateSkuAndVariants(value, index);
    };

    const handleVariantForm = (e, index) => {
        if (e.target.name === "qty") {
            if (/^\d*$/.test(e.target.value)) {
                const newInputsFields = [...variantArrValues];
                newInputsFields[index][e.target.name] = e.target.value;
                setVariantArrValue(newInputsFields);
            }
            return;
        }

        if (e.target.name === "price") {
            if (/^\d*$/.test(e.target.value)) {
                const newInputsFields = [...variantArrValues];
                newInputsFields[index][e.target.name] = e.target.value;
                setVariantArrValue(newInputsFields);
            }
            return;
        }

        if (e.target.name === "sale_price") {
            if (/^\d*$/.test(e.target.value)) {
                const newInputsFields = [...variantArrValues];
                newInputsFields[index][e.target.name] = e.target.value;
                setVariantArrValue(newInputsFields);
            }
            return;
        }
        const newInputsFields = [...variantArrValues];
        newInputsFields[index][e.target.name] = e.target.value;
        setVariantArrValue(newInputsFields);
    };

    // FIXED: Better array synchronization
    useEffect(() => {
        let arr = [...variantArrValues];
        let length = combinations.length - arr.length;

        if (length > 0) {
            // Add missing items
            const newItems = Array(length).fill(null).map((_, index) => ({
                _id: "",
                product_id: "",
                sale_price: "",
                price: "",
                sale_start_date: "",
                sale_end_date: "",
                qty: ""
            }));
            setVariantArrValue(prev => [...prev, ...newItems]);

            // Also update sellerSky array
            const newSellerSky = [...sellerSky];
            newSellerSky.push(...Array(length).fill(""));
            setSellerSku(newSellerSky);
            setSellerSkyValues(newSellerSky);
        } else if (length < 0) {
            // Remove extra items
            setVariantArrValue(prev => prev.slice(0, combinations.length));

            // Also update sellerSky array
            const newSellerSky = [...sellerSky];
            newSellerSky.splice(combinations.length);
            setSellerSku(newSellerSky);
            setSellerSkyValues(newSellerSky);
        }
    }, [combinations.length]);

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
        newInputsFields[index][name] = e;
        setVariantArrValue(newInputsFields);
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
                                Quantity *
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{
                                    width: "230px"
                                }}
                            >
                                Sale Price *
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{
                                    width: "230px"
                                }}
                            >
                                Price
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{
                                    width: "230px"
                                }}
                            >
                                Sale Start Date
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{
                                    width: "230px"
                                }}
                            >
                                Sale End Date
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {combinations.map((item, index) => {
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

                                    {/* Seller SKU with enhanced validation */}
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

                                    {/* Quantity */}
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
                                                value={variantArrValues[index]?.qty || ""}
                                                onChange={(e) => {
                                                    handleVariantForm(e, index);
                                                }}
                                                id="outlined-adornment-quantity"
                                                placeholder="Quantity"
                                                required
                                                error={!variantArrValues[index]?.qty}
                                            />
                                        </FormControl>
                                    </TableCell>

                                    {/* Sale Price */}
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
                                                value={variantArrValues[index]?.sale_price || ""}
                                                id="outlined-adornment-quantity"
                                                placeholder="Sale Price"
                                                required
                                                error={!variantArrValues[index]?.sale_price}
                                            />
                                        </FormControl>
                                    </TableCell>

                                    {/* Regular Price */}
                                    <TableCell
                                        align="center"
                                        sx={{
                                            width: "230px"
                                        }}
                                    >
                                        <FormControl fullWidth sx={{ m: 1 }} size="small">
                                            <TextField
                                                size="small"
                                                name="price"
                                                value={variantArrValues[index]?.price || ""}
                                                onChange={(e) => {
                                                    handleVariantForm(e, index);
                                                }}
                                                id="outlined-adornment-amount"
                                                placeholder="Price"
                                            />
                                        </FormControl>
                                    </TableCell>

                                    {/* Sale Start Date */}
                                    <TableCell
                                        align="center"
                                        sx={{
                                            width: "230px"
                                        }}
                                    >
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DemoContainer
                                                components={["DateField"]}
                                                sx={{
                                                    paddingTop: "0",
                                                    justifyContent: "center"
                                                }}
                                            >
                                                <DatePicker
                                                    label="Start Date"
                                                    value={
                                                        variantArrValues[index]?.sale_start_date
                                                            ? variantArrValues[index]?.sale_start_date
                                                            : null
                                                    }
                                                    onChange={(e) => dateHandler(e, "sale_start_date", index)}
                                                    slotProps={{ textField: { size: 'small' } }}
                                                />
                                            </DemoContainer>
                                        </LocalizationProvider>
                                    </TableCell>

                                    {/* Sale End Date */}
                                    <TableCell
                                        align="center"
                                        sx={{
                                            width: "230px"
                                        }}
                                    >
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DemoContainer
                                                components={["DateField"]}
                                                sx={{
                                                    paddingTop: "0",
                                                    justifyContent: "center"
                                                }}
                                            >
                                                <DatePicker
                                                    label="End Date"
                                                    value={
                                                        variantArrValues[index]?.sale_end_date
                                                            ? variantArrValues[index]?.sale_end_date
                                                            : null
                                                    }
                                                    onChange={(e) => dateHandler(e, "sale_end_date", index)}
                                                    slotProps={{ textField: { size: 'small' } }}
                                                />
                                            </DemoContainer>
                                        </LocalizationProvider>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Global validation message */}
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
