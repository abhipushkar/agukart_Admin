import {
    Box, Button, Divider, Paper, Stack, TextField, Autocomplete, MenuItem, IconButton,
    FormControl, InputAdornment, FormControlLabel, Radio, RadioGroup
} from "@mui/material";
import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import AppsIcon from "@mui/icons-material/Apps";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { useEffect } from "react";
import ConfirmModal from "app/components/ConfirmModal";
import ClearIcon from "@mui/icons-material/Clear";
import { useProfileData } from "app/contexts/profileContext";
import { useCallback } from "react";


const Add = () => {
    const [query] = useSearchParams();
    const queryId = query.get("id");
    const { logUserData } = useProfileData();
    const navigate = useNavigate();
    const auth_key = localStorage.getItem(localStorageKey.auth_key);
    const formatDateToLocalInput = (date, hours = 0, minutes = 0) => {
        const pad = (n) => (n < 10 ? '0' + n : n);

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const h = pad(hours);
        const m = pad(minutes);

        return `${year}-${month}-${day}T${h}:${m}`;
    };
    const [formValues, setFormValues] = useState({
        puchasedItem: "",
        tags: [],
        title: "",
        coupon_code: "",
        discountType: "",
        discountAmout: "",
        discountMAxAmount: "",
        noOfTimes: "",
        valid: "all",
        startDate: formatDateToLocalInput(new Date(), 0, 0),
        expiryDate: formatDateToLocalInput(new Date(), 12, 0),
        description: ""
    });
    console.log({ formValues })
    const [errors, setErrors] = useState({
        puchasedItem: "",
        tags: "",
        title: "",
        coupon_code: "",
        discountType: "",
        discountAmout: "",
        discountMAxAmount: "",
        noOfTimes: "",
        valid: "",
        startDate: "",
        expiryDate: "",
        description: ""
    });
    console.log(errors, "errors");
    const [toggleProductWise, setToggleProductWise] = useState(false);
    const [toggleEntireCalalog, setToggleEntireCalalog] = useState(false);

    const [open, setOpen] = useState(false);
    const [type, setType] = useState("");
    const [route, setRoute] = useState(null);
    const [msg, setMsg] = useState(null);
    const [allCategory] = useState([]);
    console.log(allCategory, "allCategory");
    console.log({ formValues })

    const logOut = () => {
        localStorage.removeItem(localStorageKey.auth_key);
        localStorage.removeItem(localStorageKey.designation_id);
        localStorage.removeItem(localStorageKey.vendorId);
        setRoute(ROUTE_CONSTANT.login);
    };

    const handleOpen = useCallback((type, msg) => {
        setMsg(msg?.message);
        setOpen(true);
        setType(type);
        if (msg?.response?.status === 401) {
            logOut();
        }
    }, []);

    const handleClose = () => {
        setOpen(false);
        if (route !== null) {
            navigate(route);
        }
        setRoute(null);
        setMsg(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log({ name, value });
        if (name === "puchasedItem" && value === "Product Wise") {
            setToggleProductWise(true);
            setToggleEntireCalalog(false);
            setFormValues((prev) => ({ ...prev, tags: [] }));
            setFormValues((prev) => ({ ...prev, [name]: value }));
            setErrors((prv) => ({ ...prv, [name]: "" }));
        }
        else if (name === "puchasedItem" && value === "Entire Catalog") {
            setToggleEntireCalalog(true);
            setToggleProductWise(false);
            setFormValues((prev) => ({ ...prev, tags: [] }));
            setFormValues((prev) => ({ ...prev, [name]: value }));
            setErrors((prv) => ({ ...prv, [name]: "", tags: "" }));
        }
        else {
            setFormValues((prev) => ({ ...prev, [name]: value }));
            setErrors((prv) => ({ ...prv, [name]: "" }));
        }
    };

    const handleAddCoupon = async () => {
        const newErrors = {};
        if (!formValues.puchasedItem) newErrors.puchasedItem = "Purchased Item is required";
        if (formValues.puchasedItem === "Product Wise" && !formValues.tags.length > 0) newErrors.tags = "Tags is required";
        if (!formValues.title) newErrors.title = "Coupon Title is required";
        if (!formValues.discountType) newErrors.discountType = "Discount Type is required";
        if (formValues.discountType === "percentage" && formValues.discountAmout > 100) newErrors.discountAmout = "Discount Amount cannot be more than 100 when Discount Type is Percentage";
        if (!formValues.discountAmout) newErrors.discountAmout = "Discount Amount is required";
        if (!formValues.discountMAxAmount) newErrors.discountMAxAmount = "Maximum Discount Amount is required";
        if (!formValues.noOfTimes && formValues.noOfTimes !== 0) newErrors.noOfTimes = "Number Of Times is required";
        if (!formValues.valid) newErrors.valid = "Valid is required";
        // if (!formValues.description) newErrors.description = "Description is required";
        if (!formValues.startDate) newErrors.startDate = "Start Date & Time is required";
        if (!formValues.coupon_code) newErrors.coupon_code = "Coupon Code is required";
        if (!formValues.expiryDate) newErrors.expiryDate = "Expiry Date & Time is required";
        if (formValues.startDate && formValues.expiryDate) {
            const startDateTime = new Date(formValues.startDate);
            const expiryDateTime = new Date(formValues.expiryDate);
            if (startDateTime.getTime() >= expiryDateTime.getTime()) {
                newErrors.startDate = "Start Date and Time cannot be later than and equal Expiry Date and Time";
            }
        }
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            try {
                const payload = {
                    _id: queryId ? queryId : "0",
                    purchased_items: formValues?.puchasedItem,
                    product_id: formValues?.tags,
                    vendor_id: logUserData?._id,
                    coupon_title: formValues.title,
                    discount_type: formValues.discountType,
                    discount_amount: formValues.discountAmout,
                    max_discount: formValues.discountMAxAmount,
                    no_of_times: formValues.noOfTimes,
                    valid_for: formValues.valid,
                    start_date: formValues.startDate,
                    coupon_code: formValues.coupon_code,
                    expiry_date: formValues.expiryDate,
                    coupon_description: formValues.description
                };
                const res = await ApiService.post(apiEndpoints.addCoupon, payload, auth_key);
                if (res?.status === 200) {
                    console.log("res---", res);
                    // if (!queryId) {
                    setRoute(ROUTE_CONSTANT.catalog.coupon.list);
                    // }
                    handleOpen("success", res?.data);
                }
            } catch (error) {
                handleOpen("error", error?.response?.data || error);
            }
        }
    };
    const formatDateTimeLocal = (dateStr) => {
        const date = new Date(dateStr);
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60000);
        return localDate.toISOString().slice(0, 16);
    };

    useEffect(() => {
        const getCoupon = async () => {
            try {
                const res = await ApiService.get(`${apiEndpoints.getCouponById}/${queryId}`, auth_key);
                if (res?.status === 200) {
                    console.log("res-----", res);
                    const resData = res?.data?.coupon;
                    setFormValues((prev) => ({
                        ...prev,
                        puchasedItem: resData?.purchased_items,
                        tags: resData?.product_id,
                        title: resData?.coupon_title,
                        coupon_code: resData?.coupon_code,
                        discountType: resData?.discount_type,
                        discountAmout: resData?.discount_amount,
                        discountMAxAmount: resData?.max_discount,
                        noOfTimes: resData?.no_of_times,
                        valid: resData?.valid_for,
                        startDate: formatDateTimeLocal(resData.start_date),
                        expiryDate: formatDateTimeLocal(resData.expiry_date),
                        description: resData?.coupon_description
                    }));
                    if (resData?.purchased_items === "Product Wise") {
                        setToggleProductWise(true);
                    } else if (resData?.purchased_items === "Entire Catalog") {
                        setToggleEntireCalalog(true);
                    }
                }
            } catch (error) {
                handleOpen("error", error?.response?.data || error);
            }
        };

        if (queryId) {
            getCoupon();
        }
    }, [auth_key, handleOpen, queryId]);

    const handleTagHandler = (_, newValue) => {
        // Process each value in newValue array and split using comma, space, or newline
        const processedValues = newValue
            .flatMap(value =>
                typeof value === "string"
                    ? value.split(/[\s,]+/).map(v => v.trim())  // Split by space, comma, or newline
                    : [value]
            )
            .filter(v => v); // Remove empty values

        setFormValues((prev) => ({
            ...prev,
            tags: [...new Set(processedValues)], // Remove duplicates
        }));
    };
    return (
        <>
            <Box sx={{ margin: "30px" }}>
                <Box sx={{ py: "16px", marginBottom: "20px" }} component={Paper}>
                    <Stack sx={{ ml: "24px", mb: "12px" }} gap={1} direction={"row"}>
                        <Box>
                            <AppsIcon />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Go To</Typography>
                        </Box>
                    </Stack>
                    <Divider />
                    <Box sx={{ ml: "24px", mt: "16px" }}>
                        <Button
                            onClick={() => navigate(ROUTE_CONSTANT.catalog.coupon.list)}
                            startIcon={<AppsIcon />}
                            variant="contained"
                        >
                            Coupon List
                        </Button>
                    </Box>
                </Box>
                <Box sx={{ p: "24px" }} component={Paper}>
                    <Box
                        sx={{
                            display: "flex",
                            marginBottom: "20px",
                            gap: "20px"
                        }}
                    >
                        <Box
                            sx={{
                                fontSize: "14px",
                                fontWeight: 700,
                                wordBreak: "normal",
                                width: "15%",
                                textOverflow: "ellipsis",
                                display: "flex",
                                textWrap: "wrap"
                            }}
                        >
                            Purchased Item
                            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
                                {" "}
                                *
                            </span>
                            :
                        </Box>
                        <Box width={"100%"}>
                            <Box
                                sx={{
                                    height: "auto",
                                    width: "100%"
                                }}
                            >
                                <FormControl fullWidth>
                                    <TextField
                                        error={Boolean(errors.puchasedItem)}
                                        helperText={errors.puchasedItem}
                                        select
                                        sx={{
                                            "& .MuiInputBase-root": {
                                                height: "40px"
                                            },
                                            "& .MuiFormLabel-root": {
                                                top: "-7px"
                                            }
                                        }}
                                        label="Select Purchased Item"
                                        labelId="pib"
                                        id="pibb"
                                        value={formValues?.puchasedItem}
                                        name="puchasedItem"
                                        onChange={handleChange}
                                        InputProps={{
                                            endAdornment: formValues?.puchasedItem ? (
                                                <InputAdornment position="end" sx={{ mr: 3 }}>
                                                    <IconButton
                                                        onClick={() => {
                                                            handleChange({ target: { name: "puchasedItem", value: "" } });
                                                            setErrors((prv) => ({ ...prv, puchasedItem: "Puchased Item is required" }));
                                                        }}
                                                        edge="end"
                                                    >
                                                        <ClearIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            ) : null
                                        }}
                                    >
                                        <MenuItem
                                            value="Product Wise"
                                            sx={{
                                                display: "Product Wise" === formValues?.puchasedItem ? "none" : "block"
                                            }}
                                        >
                                            Product Wise
                                        </MenuItem>
                                        <MenuItem
                                            value="Entire Catalog"
                                            sx={{
                                                display: "Entire Catalog" === formValues?.puchasedItem ? "none" : "block"
                                            }}
                                        >
                                            Entire Catalog
                                        </MenuItem>
                                    </TextField>
                                </FormControl>
                            </Box>
                        </Box>
                    </Box>
                    {
                        toggleProductWise && (
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    marginBottom: "20px",
                                    gap: "20px",
                                }}
                            >
                                <Box
                                    sx={{
                                        fontSize: "14px",
                                        fontWeight: 700,
                                        wordBreak: "normal",
                                        width: "15%",
                                        textOverflow: "ellipsis",
                                        display: "flex",
                                        textWrap: "wrap",
                                    }}
                                >
                                    Product Wise SKU Codes{" "}
                                    <span
                                        style={{
                                            color: "red",
                                            fontSize: "15px",
                                            marginRight: "3px",
                                            marginLeft: "3px",
                                        }}
                                    >
                                        *
                                    </span>
                                    :
                                </Box>
                                <Autocomplete
                                    multiple
                                    freeSolo
                                    limitTags={4}
                                    id="multiple-limit-tags"
                                    options={[]}
                                    getOptionLabel={(option) => option}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Enter SKU Codes ..."
                                            placeholder="Enter a SKU Codes ..."
                                            sx={{
                                                "& .MuiInputBase-root": {
                                                    padding: "0 11px",
                                                },
                                                "& .MuiFormLabel-root": {
                                                    top: "-7px",
                                                },
                                            }}
                                            error={Boolean(errors?.tags)}
                                            helperText={errors?.tags || ""}
                                        />
                                    )}
                                    sx={{ width: "100%" }}
                                    onChange={handleTagHandler}
                                    onBlur={() => {
                                        if (
                                            formValues?.puchasedItem === "Product Wise" &&
                                            formValues.tags.length === 0
                                        ) {
                                            setErrors((prv) => ({
                                                ...prv,
                                                tags: "Tags are required",
                                            }));
                                        } else {
                                            setErrors((prv) => ({
                                                ...prv,
                                                tags: "",
                                            }));
                                        }
                                    }}
                                    value={formValues.tags}
                                    isOptionEqualToValue={(option, value) => option === value}
                                />
                            </Box>
                        )
                    }
                    {
                        toggleEntireCalalog && <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                marginBottom: "20px",
                                gap: "20px",
                            }}
                        >
                            <Box
                                sx={{
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    wordBreak: "normal",
                                    width: "15%",
                                    textOverflow: "ellipsis",
                                    display: "flex",
                                    textWrap: "wrap",
                                }}
                            >
                                Exclude Items (optional){" "}
                                :
                            </Box>
                            <Autocomplete
                                multiple
                                freeSolo
                                limitTags={4}
                                id="multiple-limit-tags"
                                options={[]}
                                getOptionLabel={(option) => option}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Enter SKU Codes ..."
                                        placeholder="Enter a SKU Codes ..."
                                        // error={Boolean(errors?.tags)}
                                        // helperText={errors?.tags || ""}
                                        sx={{
                                            "& .MuiInputBase-root": {
                                                padding: "0 11px",
                                            },
                                            "& .MuiFormLabel-root": {
                                                top: "-7px",
                                            },
                                        }}
                                    />
                                )}
                                sx={{ width: "100%" }}
                                onChange={handleTagHandler}
                                // onBlur={() => {
                                //         if (
                                //             formValues?.puchasedItem === "Entire Catalog" &&
                                //             formValues.tags.length === 0
                                //         ) {
                                //             setErrors((prv) => ({
                                //                 ...prv,
                                //                 tags: "Tags are required",
                                //             }));
                                //         } else {
                                //             setErrors((prv) => ({
                                //                 ...prv,
                                //                 tags: "",
                                //             }));
                                //         }
                                //     }}
                                value={formValues.tags}
                                isOptionEqualToValue={(option, value) => option === value}
                            />
                        </Box>
                    }
                    <Box
                        sx={{
                            display: "flex",
                            marginBottom: "20px",
                            gap: "20px"
                        }}
                    >
                        <Box
                            sx={{
                                fontSize: "14px",
                                fontWeight: 700,
                                wordBreak: "normal",
                                width: "15%",
                                textOverflow: "ellipsis",
                                display: "flex",
                                textWrap: "wrap"
                            }}
                        >
                            Coupon Title
                            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
                                {" "}
                                *
                            </span>
                            :
                        </Box>
                        <Box width={"100%"}>
                            <Box
                                sx={{
                                    height: "auto", // Set your desired height
                                    width: "100%"
                                }}
                            >
                                <TextField
                                    error={errors.title && true}
                                    helperText={errors.title}
                                    onBlur={() => {
                                        if (!formValues.title) {
                                            setErrors((prv) => ({ ...prv, title: "Coupon Title is required" }));
                                        }
                                    }}
                                    name="title"
                                    label="Coupon Title"
                                    onChange={handleChange}
                                    value={formValues.title}
                                    rows={4}
                                    sx={{
                                        width: "100%",
                                        "& .MuiInputBase-root": {
                                            height: "40px"
                                        },
                                        "& .MuiFormLabel-root": {
                                            top: "-7px"
                                        }
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            marginBottom: "20px",
                            gap: "20px"
                        }}
                    >
                        <Box
                            sx={{
                                fontSize: "14px",
                                fontWeight: 700,
                                wordBreak: "normal",
                                width: "15%",
                                textOverflow: "ellipsis",
                                display: "flex",
                                textWrap: "wrap"
                            }}
                        >
                            Coupon Code
                            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
                                {" "}
                                *
                            </span>
                            :
                        </Box>
                        <Box width={"100%"}>
                            <Box
                                sx={{
                                    height: "auto",
                                    width: "100%"
                                }}
                            >
                                <TextField
                                    error={errors.coupon_code && true}
                                    helperText={errors.coupon_code}
                                    onBlur={() => {
                                        if (!formValues.coupon_code) {
                                            setErrors((prv) => ({ ...prv, coupon_code: "Coupon Code is required" }));
                                        }
                                    }}
                                    name="coupon_code"
                                    label="Coupon Code"
                                    onChange={handleChange}
                                    value={formValues.coupon_code}
                                    sx={{
                                        width: "100%",
                                        "& .MuiInputBase-root": {
                                            height: "40px"
                                        },
                                        "& .MuiFormLabel-root": {
                                            top: "-7px"
                                        }
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            marginBottom: "20px",
                            gap: "20px"
                        }}
                    >
                        <Box
                            sx={{
                                fontSize: "14px",
                                fontWeight: 700,
                                wordBreak: "normal",
                                width: "15%",
                                textOverflow: "ellipsis",
                                display: "flex",
                                textWrap: "wrap"
                            }}
                        >
                            Discount Type
                            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
                                {" "}
                                *
                            </span>
                            :
                        </Box>
                        <FormControl>
                            <RadioGroup
                                row
                                aria-label="discountType"
                                name="discountType"
                                value={formValues.discountType}
                                onChange={handleChange}
                                sx={{ alignItems: "center" }}
                            >
                                <FormControlLabel value="flat" control={<Radio />} label="Flat" />
                                <FormControlLabel value="percentage" control={<Radio />} label="Percentage" />
                            </RadioGroup>
                        </FormControl>
                        {errors.discountType && (
                            <Typography
                                sx={{
                                    fontSize: "12px",
                                    color: "#FF3D57",
                                    marginLeft: "14px",
                                    marginRight: "14px",
                                    marginTop: "3px"
                                }}
                            >
                                {errors.discountType}
                            </Typography>
                        )}
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            marginBottom: "20px",
                            gap: "20px",
                        }}
                    >
                        <Box
                            sx={{
                                fontSize: "14px",
                                fontWeight: 700,
                                wordBreak: "normal",
                                width: "15%",
                                textOverflow: "ellipsis",
                                display: "flex",
                                textWrap: "wrap"
                            }}
                        >
                            Discount Amount
                            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
                                {" "}
                                *
                            </span>
                            :
                        </Box>
                        <Box width={"100%"}>
                            <Box
                                sx={{
                                    height: "auto",
                                    width: "100%",
                                }}
                            >
                                <TextField
                                    error={errors.discountAmout && true}
                                    helperText={errors.discountAmout}
                                    onBlur={() => {
                                        if (!formValues.discountAmout) {
                                            setErrors((prv) => ({
                                                ...prv,
                                                discountAmout: "Discount Amount is Required",
                                            }));
                                        }
                                    }}
                                    type="text"
                                    name="discountAmout"
                                    label="Discount Amount"
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Allow only numbers
                                        if (/^\d*$/.test(value)) {
                                            handleChange(e);
                                        }
                                    }}
                                    value={formValues.discountAmout}
                                    inputProps={{
                                        inputMode: "numeric",
                                        pattern: "[0-9]*",
                                    }}
                                    sx={{
                                        width: "100%",
                                        "& .MuiInputBase-root": {
                                            height: "40px",
                                        },
                                        "& .MuiFormLabel-root": {
                                            top: "-7px",
                                        },
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            marginBottom: "20px",
                            gap: "20px",
                        }}
                    >
                        <Box
                            sx={{
                                fontSize: "14px",
                                fontWeight: 700,
                                wordBreak: "normal",
                                width: "15%",
                                textOverflow: "ellipsis",
                                display: "flex",
                                textWrap: "wrap"
                            }}
                        >
                            Max Amount
                            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
                                {" "}
                                *
                            </span>
                            :
                        </Box>
                        <Box width={"100%"}>
                            <Box
                                sx={{
                                    height: "auto",
                                    width: "100%",
                                }}
                            >
                                <TextField
                                    error={errors.discountMAxAmount && true}
                                    helperText={errors.discountMAxAmount}
                                    onBlur={() => {
                                        if (!formValues.discountMAxAmount) {
                                            setErrors((prv) => ({
                                                ...prv,
                                                discountMAxAmount: "Maximum Discount Amount is Required",
                                            }));
                                        }
                                    }}
                                    type="text"
                                    name="discountMAxAmount"
                                    label="Maximum Discount Amount"
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Allow only numbers
                                        if (/^\d*$/.test(value)) {
                                            handleChange(e);
                                        }
                                    }}
                                    value={formValues.discountMAxAmount}
                                    inputProps={{
                                        inputMode: "numeric",
                                        pattern: "[0-9]*",
                                    }}
                                    sx={{
                                        width: "100%",
                                        "& .MuiInputBase-root": {
                                            height: "40px",
                                        },
                                        "& .MuiFormLabel-root": {
                                            top: "-7px",
                                        },
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            marginBottom: "20px",
                            gap: "20px",
                        }}
                    >
                        <Box
                            sx={{
                                fontSize: "14px",
                                fontWeight: 700,
                                wordBreak: "normal",
                                width: "15%",
                                textOverflow: "ellipsis",
                                display: "flex",
                                textWrap: "wrap"
                            }}
                        >
                            No. Of Times
                            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
                                {" "}
                                *
                            </span>
                            :
                        </Box>
                        <Box width={"100%"}>
                            <Box
                                sx={{
                                    height: "auto",
                                    width: "100%",
                                }}
                            >
                                <TextField
                                    error={errors.noOfTimes && true}
                                    helperText={errors.noOfTimes}
                                    onBlur={() => {
                                        if (!formValues.noOfTimes) {
                                            setErrors((prv) => ({
                                                ...prv,
                                                noOfTimes: "No Of Times is Required",
                                            }));
                                        }
                                    }}
                                    type="text"
                                    name="noOfTimes"
                                    label="No Of Times (Enter 0 to allow multiple attempts)"
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Allow only numbers (no alphabets or special characters)
                                        if (/^\d*$/.test(value)) {
                                            handleChange(e);
                                        }
                                    }}
                                    value={formValues.noOfTimes}
                                    inputProps={{
                                        inputMode: "numeric",
                                        pattern: "[0-9]*",
                                    }}
                                    sx={{
                                        width: "100%",
                                        "& .MuiInputBase-root": {
                                            height: "40px",
                                        },
                                        "& .MuiFormLabel-root": {
                                            top: "-7px",
                                        },
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            marginBottom: "20px",
                            gap: "20px"
                        }}
                    >
                        <Box
                            sx={{
                                fontSize: "14px",
                                fontWeight: 700,
                                wordBreak: "normal",
                                width: "15%",
                                textOverflow: "ellipsis",
                                display: "flex",
                                textWrap: "wrap"
                            }}
                        >
                            Coupon Valid For
                            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
                                {" "}
                                *
                            </span>
                            :
                        </Box>
                        <FormControl>
                            <RadioGroup
                                row
                                aria-label="valid"
                                name="valid"
                                value={formValues.valid}
                                onChange={handleChange}
                                sx={{ alignItems: "center" }}
                            >
                                <FormControlLabel value="all" control={<Radio />} label="All" />
                                <FormControlLabel value="new user" control={<Radio />} label="New User" />
                                <FormControlLabel value="old user" control={<Radio />} label="Old User" />
                            </RadioGroup>
                        </FormControl>
                        {errors.valid && (
                            <Typography
                                sx={{
                                    fontSize: "12px",
                                    color: "#FF3D57",
                                    marginLeft: "14px",
                                    marginRight: "14px",
                                    marginTop: "3px"
                                }}
                            >
                                {errors.valid}
                            </Typography>
                        )}
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            marginBottom: "20px",
                            gap: "20px",
                        }}
                    >
                        <Box
                            sx={{
                                fontSize: "14px",
                                fontWeight: 700,
                                wordBreak: "normal",
                                width: "15%",
                                textOverflow: "ellipsis",
                                display: "flex",
                                textWrap: "wrap"
                            }}
                        >
                            Description
                            :
                        </Box>
                        <Box width={"100%"}>
                            <Box
                                sx={{
                                    height: "auto",
                                    width: "100%",
                                }}
                            >
                                <TextField
                                    error={errors.description && true}
                                    helperText={errors.description}
                                    // onBlur={() => {
                                    //     if (!formValues.description) {
                                    //         setErrors((prv) => ({
                                    //             ...prv,
                                    //             description: "Description is Required",
                                    //         }));
                                    //     }
                                    // }}
                                    name="description"
                                    label="Description"
                                    onChange={handleChange}
                                    value={formValues.description}
                                    multiline
                                    rows={4}
                                    sx={{
                                        width: "100%",
                                        "& .MuiInputBase-root": {
                                            height: "auto",
                                        },
                                        "& .MuiFormLabel-root": {
                                            top: "-7px",
                                        },
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            marginBottom: "20px",
                            gap: "20px"
                        }}
                    >
                        <Box
                            sx={{
                                fontSize: "14px",
                                fontWeight: 700,
                                wordBreak: "normal",
                                width: "15%",
                                textOverflow: "ellipsis",
                                display: "flex",
                                textWrap: "wrap"
                            }}
                        >
                            Offer Time
                            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
                                {" "}
                                *
                            </span>
                            :
                        </Box>
                        <Box width="50%">
                            <TextField
                                error={errors.startDate && true}
                                helperText={errors.startDate}
                                onBlur={() => {
                                    if (!formValues.startDate) {
                                        setErrors((prv) => ({ ...prv, startDate: "Start Date & Time is Required" }));
                                    }
                                }}
                                type="datetime-local"
                                name="startDate"
                                label="Start Date & Time *"
                                onChange={handleChange}
                                value={formValues.startDate}
                                InputLabelProps={{
                                    shrink: true
                                }}
                                sx={{
                                    width: "100%",
                                    "& .MuiInputBase-root": {
                                        height: "40px"
                                    },
                                    "& .MuiFormLabel-root": {
                                        top: "-7px"
                                    }
                                }}
                            />
                        </Box>
                        <Box width="50%">
                            <TextField
                                error={errors.expiryDate && true}
                                helperText={errors.expiryDate}
                                onBlur={() => {
                                    if (!formValues.expiryDate) {
                                        setErrors((prv) => ({ ...prv, expiryDate: "Expiry Date & Time is Required" }));
                                    }
                                }}
                                type="datetime-local"
                                name="expiryDate"
                                label="Expiry Date & Time *"
                                onChange={handleChange}
                                value={formValues.expiryDate}
                                InputLabelProps={{
                                    shrink: true
                                }}
                                sx={{
                                    width: "100%",
                                    "& .MuiInputBase-root": {
                                        height: "40px"
                                    },
                                    "& .MuiFormLabel-root": {
                                        top: "-7px"
                                    }
                                }}
                            />
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "end",
                            marginTop: "15px",
                            gap: "5px"
                        }}
                    >
                        <Button variant="contained" onClick={handleAddCoupon}>
                            Submit
                        </Button>
                    </Box>
                </Box>
            </Box>
            <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
        </>
    );
};

export default Add;
