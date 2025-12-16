import {
    Box, Button, Divider, Paper, Stack, TextField, Autocomplete, MenuItem, IconButton,
    FormControl, InputAdornment, FormControlLabel, Radio, RadioGroup, Switch
} from "@mui/material";
import React, { useState, useEffect, useCallback } from "react";
import Typography from "@mui/material/Typography";
import AppsIcon from "@mui/icons-material/Apps";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import ConfirmModal from "app/components/ConfirmModal";
import ClearIcon from "@mui/icons-material/Clear";
import { useProfileData } from "app/contexts/profileContext";

// Reusable Label Component to ensure consistency and readability
const FormLabel = ({ label, required }) => (
    <Box
        sx={{
            fontSize: "14px",
            fontWeight: 700,
            wordBreak: "normal",
            width: "15%",
            textOverflow: "ellipsis",
            display: "flex",
            flexWrap: "wrap"
        }}
    >
        {label}
        {required && (
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
                {" "}*
            </span>
        )}
        :
    </Box>
);

// Reusable Row Component for Form Fields
const FormRow = ({ label, required, children, error }) => (
    <Box sx={{ display: "flex", marginBottom: "20px", gap: "20px" }}>
        <FormLabel label={label} required={required} />
        <Box width={"100%"}>
            <Box sx={{ height: "auto", width: "100%" }}>
                {children}
            </Box>
            {error && typeof error === 'string' && ( // Sometimes error might be handled inside children (TextField), but if separate
                <Typography sx={{ fontSize: "12px", color: "#FF3D57", mt: "3px" }}>
                    {error}
                </Typography>
            )}
        </Box>
    </Box>
);

const Add = () => {
    const [query] = useSearchParams();
    const queryId = query.get("id");
    const { logUserData } = useProfileData();
    const navigate = useNavigate();
    const auth_key = localStorage.getItem(localStorageKey.auth_key);

    // Format date for 'date' input (YYYY-MM-DD)
    const formatDateToLocalInput = (date) => {
        if (!date) return "";
        const pad = (n) => (n < 10 ? '0' + n : n);
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        return `${year}-${month}-${day}`;
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
        startDate: formatDateToLocalInput(new Date()),
        expiryDate: formatDateToLocalInput(new Date()),
        description: "",
        isSynced: false,
    });

    const [errors, setErrors] = useState({});

    // Derived state for conditional rendering
    const isProductWise = formValues.puchasedItem === "Product Wise";
    const isEntireCatalog = formValues.puchasedItem === "Entire Catalog";

    const [open, setOpen] = useState(false);
    const [type, setType] = useState("");
    const [route, setRoute] = useState(null);
    const [msg, setMsg] = useState(null);

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
        const { name, value, checked, type } = e.target;
        const val = type === "checkbox" ? checked : value;

        setFormValues((prev) => {
            const updates = { ...prev, [name]: val };

            // Handle dependent fields reset logic
            if (name === "puchasedItem") {
                updates.tags = [];
            }
            return updates;
        });

        // Clear errors for the field being modified
        setErrors((prev) => ({ ...prev, [name]: "", tags: name === "puchasedItem" ? "" : prev.tags }));
    };

    const handleTagHandler = (_, newValue) => {
        // Process each value in newValue array and split using comma, space, or newline
        const processedValues = newValue
            .flatMap(value =>
                typeof value === "string"
                    ? value.split(/[\s,]+/).map(v => v.trim())
                    : [value]
            )
            .filter(v => v);

        setFormValues((prev) => ({
            ...prev,
            tags: [...new Set(processedValues)],
        }));

        if (isProductWise && processedValues.length > 0) {
            setErrors((prev) => ({ ...prev, tags: "" }));
        }
    };


    const validate = () => {
        const newErrors = {};
        if (!formValues.puchasedItem) newErrors.puchasedItem = "Purchased Item is required";
        if (isProductWise && formValues.tags.length === 0) newErrors.tags = "Tags is required";
        if (!formValues.title) newErrors.title = "Coupon Title is required";
        if (!formValues.discountType) newErrors.discountType = "Discount Type is required";
        if (formValues.discountType === "percentage" && Number(formValues.discountAmout) > 100) newErrors.discountAmout = "Discount Amount cannot be more than 100 when Discount Type is Percentage";
        if (!formValues.discountAmout) newErrors.discountAmout = "Discount Amount is required";
        if (!formValues.discountMAxAmount) newErrors.discountMAxAmount = "Maximum Discount Amount is required";
        if (formValues.noOfTimes === "" || formValues.noOfTimes === null || formValues.noOfTimes === undefined) newErrors.noOfTimes = "Number Of Times is required";
        if (!formValues.valid) newErrors.valid = "Valid is required";
        if (!formValues.startDate) newErrors.startDate = "Start Date is required";
        if (!formValues.coupon_code) newErrors.coupon_code = "Coupon Code is required";
        if (!formValues.expiryDate) newErrors.expiryDate = "Expiry Date is required";

        // Date Logic Validation: Start Date <= Expiry Date
        // Since input type is date, the value is YYYY-MM-DD. 
        if (formValues.startDate && formValues.expiryDate) {
            const start = new Date(formValues.startDate);
            const end = new Date(formValues.expiryDate);
            if (start > end) {
                newErrors.startDate = "Start Date cannot be later than Expiry Date";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddCoupon = async () => {
        if (!validate()) return;

        try {
            const payload = {
                _id: queryId || "0",
                purchased_items: formValues.puchasedItem,
                product_id: formValues.tags,
                vendor_id: logUserData?._id,
                coupon_title: formValues.title,
                discount_type: formValues.discountType,
                discount_amount: formValues.discountAmout,
                max_discount: formValues.discountMAxAmount,
                no_of_times: formValues.noOfTimes,
                valid_for: formValues.valid,
                start_date: formValues.startDate, // Sending YYYY-MM-DD
                coupon_code: formValues.coupon_code,
                expiry_date: formValues.expiryDate, // Sending YYYY-MM-DD
                coupon_description: formValues.description,
                isSynced: formValues.isSynced // Matches backend key "isSynced"
            };

            const res = await ApiService.post(apiEndpoints.addCoupon, payload, auth_key);
            if (res?.status === 200) {
                setRoute(ROUTE_CONSTANT.catalog.coupon.list);
                handleOpen("success", res?.data);
            }
        } catch (error) {
            handleOpen("error", error?.response?.data || error);
        }
    };

    // Helper to extract YYYY-MM-DD from ISO string or similar
    const extractDateString = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "";
        const pad = (n) => (n < 10 ? '0' + n : n);
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }

    useEffect(() => {
        const getCoupon = async () => {
            if (!queryId) return;
            try {
                const res = await ApiService.get(`${apiEndpoints.getCouponById}/${queryId}`, auth_key);
                if (res?.status === 200) {
                    const resData = res?.data?.coupon;
                    setFormValues({
                        puchasedItem: resData?.purchased_items || "",
                        tags: resData?.product_id || [],
                        title: resData?.coupon_title || "",
                        coupon_code: resData?.coupon_code || "",
                        discountType: resData?.discount_type || "",
                        discountAmout: resData?.discount_amount || "",
                        discountMAxAmount: resData?.max_discount || "",
                        noOfTimes: resData?.no_of_times ?? "",
                        valid: resData?.valid_for || "all",
                        startDate: extractDateString(resData.start_date),
                        expiryDate: extractDateString(resData.expiry_date),
                        description: resData?.coupon_description || "",
                        isSynced: resData?.isSynced || false
                    });
                }
            } catch (error) {
                handleOpen("error", error?.response?.data || error);
            }
        };

        getCoupon();
    }, [auth_key, handleOpen, queryId]);

    return (
        <>
            <Box sx={{ margin: "30px" }}>
                <Box sx={{ py: "16px", marginBottom: "20px" }} component={Paper}>
                    <Stack sx={{ ml: "24px", mb: "12px" }} gap={1} direction={"row"}>
                        <Box><AppsIcon /></Box>
                        <Box><Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Go To</Typography></Box>
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
                    {/* Purchased Item */}
                    <FormRow label="Purchased Item" required error={errors.puchasedItem}>
                        <FormControl fullWidth>
                            <TextField
                                error={Boolean(errors.puchasedItem)}
                                helperText={errors.puchasedItem ? "" : ""} // Handled visually by error prop mostly, but we can keep blank to avoid double message if we used FormRow error
                                select
                                sx={{
                                    "& .MuiInputBase-root": { height: "40px" },
                                    "& .MuiFormLabel-root": { top: "-7px" }
                                }}
                                label="Select Purchased Item"
                                value={formValues.puchasedItem}
                                name="puchasedItem"
                                onChange={handleChange}
                                InputProps={{
                                    endAdornment: formValues.puchasedItem ? (
                                        <InputAdornment position="end" sx={{ mr: 3 }}>
                                            <IconButton
                                                onClick={() => {
                                                    handleChange({ target: { name: "puchasedItem", value: "" } });
                                                }}
                                                edge="end"
                                            >
                                                <ClearIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    ) : null
                                }}
                            >
                                <MenuItem value="Product Wise" sx={{ display: isProductWise ? "none" : "block" }}>Product Wise</MenuItem>
                                <MenuItem value="Entire Catalog" sx={{ display: isEntireCatalog ? "none" : "block" }}>Entire Catalog</MenuItem>
                            </TextField>
                        </FormControl>
                    </FormRow>

                    {/* Product Wise Tags */}
                    {isProductWise && (
                        <FormRow label="Product Wise SKU Codes" required error={errors.tags}>
                            <Autocomplete
                                multiple
                                freeSolo
                                limitTags={4}
                                options={[]}
                                getOptionLabel={(option) => option}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Enter SKU Codes ..."
                                        placeholder="Enter SKU Codes ..."
                                        sx={{
                                            "& .MuiInputBase-root": { padding: "0 11px" },
                                            "& .MuiFormLabel-root": { top: "-7px" },
                                        }}
                                        error={Boolean(errors.tags)}
                                    />
                                )}
                                onChange={handleTagHandler}
                                value={formValues.tags}
                            />
                        </FormRow>
                    )}

                    {/* Exclude Items (Entire Catalog) */}
                    {isEntireCatalog && (
                        <FormRow label="Exclude Items (optional)">
                            <Autocomplete
                                multiple
                                freeSolo
                                limitTags={4}
                                options={[]}
                                getOptionLabel={(option) => option}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Enter SKU Codes ..."
                                        placeholder="Enter SKU Codes ..."
                                        sx={{
                                            "& .MuiInputBase-root": { padding: "0 11px" },
                                            "& .MuiFormLabel-root": { top: "-7px" },
                                        }}
                                    />
                                )}
                                onChange={handleTagHandler}
                                value={formValues.tags}
                            />
                        </FormRow>
                    )}

                    {/* Coupon Title */}
                    <FormRow label="Coupon Title" required>
                        <TextField
                            error={Boolean(errors.title)}
                            helperText={errors.title}
                            name="title"
                            label="Coupon Title"
                            onChange={handleChange}
                            value={formValues.title}
                            sx={{
                                width: "100%",
                                "& .MuiInputBase-root": { height: "40px" },
                                "& .MuiFormLabel-root": { top: "-7px" }
                            }}
                        />
                    </FormRow>

                    {/* Coupon Code */}
                    <FormRow label="Coupon Code" required>
                        <TextField
                            error={Boolean(errors.coupon_code)}
                            helperText={errors.coupon_code}
                            name="coupon_code"
                            label="Coupon Code"
                            onChange={handleChange}
                            value={formValues.coupon_code}
                            sx={{
                                width: "100%",
                                "& .MuiInputBase-root": { height: "40px" },
                                "& .MuiFormLabel-root": { top: "-7px" }
                            }}
                        />
                    </FormRow>

                    {/* Discount Type */}
                    <FormRow label="Discount Type" required error={errors.discountType}>
                        <FormControl>
                            <RadioGroup
                                row
                                name="discountType"
                                value={formValues.discountType}
                                onChange={handleChange}
                                sx={{ alignItems: "center" }}
                            >
                                <FormControlLabel value="flat" control={<Radio />} label="Flat" />
                                <FormControlLabel value="percentage" control={<Radio />} label="Percentage" />
                            </RadioGroup>
                        </FormControl>
                    </FormRow>

                    {/* Discount Amount */}
                    <FormRow label="Discount Amount" required>
                        <TextField
                            error={Boolean(errors.discountAmout)}
                            helperText={errors.discountAmout}
                            type="text"
                            name="discountAmout"
                            label="Discount Amount"
                            onChange={(e) => {
                                if (/^\d*$/.test(e.target.value)) handleChange(e);
                            }}
                            value={formValues.discountAmout}
                            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                            sx={{
                                width: "100%",
                                "& .MuiInputBase-root": { height: "40px" },
                                "& .MuiFormLabel-root": { top: "-7px" }
                            }}
                        />
                    </FormRow>

                    {/* Max Amount */}
                    <FormRow label="Max Amount" required>
                        <TextField
                            error={Boolean(errors.discountMAxAmount)}
                            helperText={errors.discountMAxAmount}
                            type="text"
                            name="discountMAxAmount"
                            label="Maximum Discount Amount"
                            onChange={(e) => {
                                if (/^\d*$/.test(e.target.value)) handleChange(e);
                            }}
                            value={formValues.discountMAxAmount}
                            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                            sx={{
                                width: "100%",
                                "& .MuiInputBase-root": { height: "40px" },
                                "& .MuiFormLabel-root": { top: "-7px" }
                            }}
                        />
                    </FormRow>

                    {/* No. Of Times */}
                    <FormRow label="No. Of Times" required>
                        <TextField
                            error={Boolean(errors.noOfTimes)}
                            helperText={errors.noOfTimes}
                            type="text"
                            name="noOfTimes"
                            label="No Of Times (Enter 0 to allow multiple attempts)"
                            onChange={(e) => {
                                if (/^\d*$/.test(e.target.value)) handleChange(e);
                            }}
                            value={formValues.noOfTimes}
                            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                            sx={{
                                width: "100%",
                                "& .MuiInputBase-root": { height: "40px" },
                                "& .MuiFormLabel-root": { top: "-7px" }
                            }}
                        />
                    </FormRow>

                    {/* Coupon Valid For */}
                    <FormRow label="Coupon Valid For" required error={errors.valid}>
                        <FormControl>
                            <RadioGroup
                                row
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
                    </FormRow>

                    {/* isSynced Toggle */}
                    <FormRow label="Sync Status">
                        <Box>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formValues.isSynced}
                                        onChange={handleChange}
                                        name="isSynced"
                                        color="primary"
                                    />
                                }
                                label={formValues.isSynced ? "Synced" : "Not Synced"}
                            />
                            <Typography variant="caption" display="block" sx={{ color: "gray", marginTop: "4px" }}>
                                {formValues.isSynced
                                    ? "If Synced is On, the shop's promotions will be removed and this coupon offer will be applied."
                                    : "If Synced is Off, the coupon discount will stack on the shop offer."}
                            </Typography>
                        </Box>
                    </FormRow>

                    {/* Description */}
                    <FormRow label="Description">
                        <TextField
                            error={Boolean(errors.description)}
                            helperText={errors.description}
                            name="description"
                            label="Description"
                            onChange={handleChange}
                            value={formValues.description}
                            multiline
                            rows={4}
                            sx={{
                                width: "100%",
                                "& .MuiInputBase-root": { height: "auto" },
                                "& .MuiFormLabel-root": { top: "-7px" }
                            }}
                        />
                    </FormRow>

                    {/* Offer Time (Actually Date now) */}
                    <Box sx={{ display: "flex", mb: "20px", gap: "20px" }}>
                        <FormLabel label="Offer Date" required />
                        <Box sx={{ display: "flex", width: "100%", gap: "20px" }}>
                            <Box width="50%">
                                <TextField
                                    error={Boolean(errors.startDate)}
                                    helperText={errors.startDate}
                                    type="date"
                                    name="startDate"
                                    label="Start Date *"
                                    onChange={handleChange}
                                    value={formValues.startDate}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{
                                        width: "100%",
                                        "& .MuiInputBase-root": { height: "40px" },
                                        "& .MuiFormLabel-root": { top: "-7px" }
                                    }}
                                />
                            </Box>
                            <Box width="50%">
                                <TextField
                                    error={Boolean(errors.expiryDate)}
                                    helperText={errors.expiryDate}
                                    type="date"
                                    name="expiryDate"
                                    label="Expiry Date *"
                                    onChange={handleChange}
                                    value={formValues.expiryDate}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{
                                        width: "100%",
                                        "& .MuiInputBase-root": { height: "40px" },
                                        "& .MuiFormLabel-root": { top: "-7px" }
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>

                    {/* Submit Button */}
                    <Box sx={{ display: "flex", justifyContent: "end", marginTop: "15px", gap: "5px" }}>
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
