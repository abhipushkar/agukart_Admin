import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Autocomplete,
  MenuItem,
  IconButton,
  FormControl,
  InputAdornment,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import AppsIcon from "@mui/icons-material/Apps";
import ClearIcon from "@mui/icons-material/Clear";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import ConfirmModal from "app/components/ConfirmModal";
import { useProfileData } from "app/contexts/profileContext";

// --- Constants ---
const PURCHASED_ITEM_OPTIONS = [
  { value: "Product Wise", label: "Product Wise" },
  { value: "Entire Catalog", label: "Entire Catalog" },
];

const PROMOTION_TYPE_OPTIONS = [
  { value: "qty_per_product", label: "Via Quantity on Each Product" },
  { value: "qty_total_shop", label: "Via Quantity on Any Product" },
  { value: "amount", label: "Via Amount" },
];

// --- Reusable Components ---

const LabeledField = ({ label, required, children, error, helperText }) => (
  <Box sx={{ display: "flex", marginBottom: "20px", gap: "20px" }}>
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
      {label}
      {required && (
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
      )}
      :
    </Box>
    <Box width="100%">
      <Box sx={{ height: "auto", width: "100%" }}>
        {children}
        {/* If the child is not a TextField that handles its own error, we could display it here.
            However, most inputs in this form are TextFields which have their own error props.
            For RadioGroup, we handle error separately. */}
      </Box>
    </Box>
  </Box>
);

const CommonTextField = ({ name, value, onChange, error, label, ...props }) => (
  <TextField
    error={Boolean(error)}
    helperText={error}
    name={name}
    value={value}
    onChange={onChange}
    label={label || name}
    fullWidth
    sx={{
      "& .MuiInputBase-root": { height: "40px" },
      "& .MuiFormLabel-root": { top: "-7px" },
    }}
    {...props}
  />
);

const Add = () => {
  const [query] = useSearchParams();
  const queryId = query.get("id");
  const { logUserData } = useProfileData();
  const navigate = useNavigate();
  const auth_key = localStorage.getItem(localStorageKey.auth_key);

  const formatDateToLocalInput = (date, hours = 0, minutes = 0) => {
    const pad = (n) => (n < 10 ? "0" + n : n);
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    // Removed time components for default value generation as per new requirements
    return `${year}-${month}-${day}`;
  };

  const initialFormValues = {
    puchasedItem: "",
    tags: [],
    title: "",
    offerType: "",
    discountAmout: "",
    promotion_type: "",
    qty: "",
    amount: "",
    startDate: formatDateToLocalInput(new Date()),
    expiryDate: formatDateToLocalInput(new Date())
  };

  const [formValues, setFormValues] = useState(initialFormValues);
  const [errors, setErrors] = useState({});
  const [open, setOpen] = React.useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);

  const isProductWise = formValues.puchasedItem === "Product Wise";
  const isEntireCatalog = formValues.puchasedItem === "Entire Catalog";

  const logOut = () => {
    localStorage.removeItem(localStorageKey.auth_key);
    localStorage.removeItem(localStorageKey.designation_id);
    localStorage.removeItem(localStorageKey.vendorId);
    setRoute(ROUTE_CONSTANT.login);
  };

  const handleOpen = (type, msg) => {
    setMsg(msg?.message);
    setOpen(true);
    setType(type);
    if (msg?.response?.status === 401) {
      logOut();
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (route) navigate(route);
    setRoute(null);
    setMsg(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValues = { ...formValues, [name]: value };
    let newErrors = { ...errors, [name]: "" };

    // Specific logic for Purchased Item
    if (name === "puchasedItem") {
      newValues.tags = [];
      newErrors.tags = "";
    }
    // Specific logic for Promotion Type
    else if (name === "promotion_type") {
      newValues.qty = "";
      newValues.amount = "";
      newErrors.qty = "";
      newErrors.amount = "";
    }

    setFormValues(newValues);
    setErrors(newErrors);
  };

  const handleTagHandler = (event, newValue) => {
    const processedValues = newValue
      .flatMap((value) =>
        typeof value === "string"
          ? value.split(/[\s,]+/).map((v) => v.trim())
          : [value]
      )
      .filter((v) => v);

    setFormValues((prev) => ({
      ...prev,
      tags: [...new Set(processedValues)],
    }));

    // Validation on change for tags if needed, or clear error
    if (errors.tags && processedValues.length > 0) {
      setErrors(prev => ({ ...prev, tags: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const v = formValues;

    if (!v.puchasedItem) newErrors.puchasedItem = "Purchased Item is required";
    if (v.puchasedItem === "Product Wise" && (!v.tags || v.tags.length === 0))
      newErrors.tags = "SKU Codes are required";
    if (!v.title) newErrors.title = "Promotional Title is required";
    if (!v.offerType) newErrors.offerType = "Offer Type is required";
    if (v.offerType === "percentage" && Number(v.discountAmout) > 100)
      newErrors.discountAmout = "Offer Amount cannot be more than 100 when Discount Type is Percentage";
    if (!v.discountAmout) newErrors.discountAmout = "Discount Amount is required";
    if (!v.promotion_type) newErrors.promotion_type = "Promotion type is required";
    if (v.promotion_type.includes("amount") && !v.amount) newErrors.amount = "Amount is required";
    if (v.promotion_type.includes("qty") && !v.qty) newErrors.qty = "Qty is required";

    // Date Validation
    if (!v.startDate) newErrors.startDate = "Start Date is required";
    if (!v.expiryDate) newErrors.expiryDate = "Expiry Date is required";
    if (v.startDate && v.expiryDate) {
      const startDateTime = new Date(`${v.startDate}T00:00`);
      const expiryDateTime = new Date(`${v.expiryDate}T00:00`);
      if (startDateTime.getTime() >= expiryDateTime.getTime()) {
        newErrors.startDate = "Start Date cannot be later than or equal to Expiry Date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCoupon = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        _id: queryId || "0",
        vendor_id: logUserData?._id,
        purchased_items: formValues.puchasedItem,
        product_id: formValues.tags,
        promotional_title: formValues.title,
        offer_type: formValues.offerType,
        discount_amount: formValues.discountAmout,
        promotion_type: formValues.promotion_type,
        offer_amount: formValues.amount,
        qty: formValues.qty,
        start_date: `${formValues.startDate}T00:00`,
        expiry_date: `${formValues.expiryDate}T00:00`
      };

      const res = await ApiService.post(apiEndpoints.addPromotionalOffer, payload, auth_key);
      if (res?.status === 200) {
        setRoute(ROUTE_CONSTANT.catalog.promotionalOffer.list);
        handleOpen("success", res?.data);
      }
    } catch (error) {
      handleOpen("error", error?.response?.data || error);
    }
  };

  const formatDateTimeLocal = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.split("T")[0]; // Just return the date part
  };

  const getPromotionalOffer = async () => {
    try {
      const res = await ApiService.get(`${apiEndpoints.getPromotionalOfferById}/${queryId}`, auth_key);
      if (res?.status === 200) {
        const resData = res?.data?.promotion;
        setFormValues((prev) => ({
          ...prev,
          puchasedItem: resData?.purchased_items,
          tags: resData?.product_id || [],
          title: resData?.promotional_title,
          offerType: resData?.offer_type,
          discountAmout: resData?.discount_amount,
          promotion_type: resData?.promotion_type,
          amount: resData?.offer_amount,
          qty: resData?.qty,
          startDate: formatDateTimeLocal(resData.start_date),
          expiryDate: formatDateTimeLocal(resData.expiry_date),
        }));
      }
    } catch (error) {
      handleOpen("error", error?.response?.data || error);
    }
  };

  useEffect(() => {
    if (queryId) {
      getPromotionalOffer();
    }
  }, [queryId]);

  return (
    <>
      <Box sx={{ margin: "30px" }}>
        {/* Header Section */}
        <Box sx={{ py: "16px", marginBottom: "20px" }} component={Paper}>
          <Stack sx={{ ml: "24px", mb: "12px" }} gap={1} direction={"row"}>
            <Box><AppsIcon /></Box>
            <Box><Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Go To</Typography></Box>
          </Stack>
          <Divider />
          <Box sx={{ ml: "24px", mt: "16px" }}>
            <Button
              onClick={() => navigate(ROUTE_CONSTANT.catalog.promotionalOffer.list)}
              startIcon={<AppsIcon />}
              variant="contained"
            >
              Promotional Offer List
            </Button>
          </Box>
        </Box>

        {/* Form Section */}
        <Box sx={{ p: "24px" }} component={Paper}>

          <LabeledField label="Purchased Item" required>
            <CommonTextField
              select
              label="Select Purchased Item"
              name="puchasedItem"
              value={formValues.puchasedItem}
              onChange={handleChange}
              error={errors.puchasedItem}
              InputProps={{
                endAdornment: formValues.puchasedItem && (
                  <InputAdornment position="end" sx={{ mr: 3 }}>
                    <IconButton
                      onClick={() => handleChange({ target: { name: "puchasedItem", value: "" } })}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            >
              {PURCHASED_ITEM_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </CommonTextField>
          </LabeledField>

          {isProductWise && (
            <LabeledField label="Product Wise SKU Code" required>
              <Autocomplete
                multiple
                freeSolo
                limitTags={4}
                options={[]}
                getOptionLabel={(option) => option}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Enter SKU Codes..."
                    error={Boolean(errors.tags)}
                    helperText={errors.tags}
                    sx={{ "& .MuiInputBase-root": { padding: "0 11px" } }}
                  />
                )}
                sx={{ width: "100%" }}
                onChange={handleTagHandler}
                value={formValues.tags}
                isOptionEqualToValue={(option, value) => option === value}
              />
            </LabeledField>
          )}

          {isEntireCatalog && (
            <LabeledField label="Exclude Items (optional)">
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
                    sx={{ "& .MuiInputBase-root": { padding: "0 11px" } }}
                  />
                )}
                sx={{ width: "100%" }}
                onChange={handleTagHandler}
                value={formValues.tags}
                isOptionEqualToValue={(option, value) => option === value}
              />
            </LabeledField>
          )}

          <LabeledField label="Promotional Title" required>
            <CommonTextField
              name="title"
              label="Promotional Title"
              value={formValues.title}
              onChange={handleChange}
              error={errors.title}
            />
          </LabeledField>

          <LabeledField label="Offer Type" required>
            <FormControl>
              <RadioGroup
                row
                name="offerType"
                value={formValues.offerType}
                onChange={handleChange}
                sx={{ alignItems: "center" }}
              >
                <FormControlLabel value="flat" control={<Radio />} label="Flat" />
                <FormControlLabel value="percentage" control={<Radio />} label="Percentage" />
              </RadioGroup>
              {errors.offerType && (
                <Typography sx={{ fontSize: "12px", color: "#FF3D57", ml: "14px", mt: "3px" }}>
                  {errors.offerType}
                </Typography>
              )}
            </FormControl>
          </LabeledField>

          <LabeledField label="Discount Amount" required>
            <CommonTextField
              name="discountAmout"
              label="Discount Amount"
              value={formValues.discountAmout}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value)) handleChange(e);
              }}
              error={errors.discountAmout}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            />
          </LabeledField>

          <LabeledField label="Promotion Type" required>
            <CommonTextField
              select
              label="Select Promotion Type"
              name="promotion_type"
              value={formValues.promotion_type}
              onChange={handleChange}
              error={errors.promotion_type}
              InputProps={{
                endAdornment: formValues.promotion_type && (
                  <InputAdornment position="end" sx={{ mr: 3 }}>
                    <IconButton
                      onClick={() => handleChange({ target: { name: "promotion_type", value: "" } })}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            >
              {PROMOTION_TYPE_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </CommonTextField>
          </LabeledField>

          {formValues.promotion_type.includes("qty") && (
            <LabeledField label="Qty" required>
              <CommonTextField
                name="qty"
                label="Qty"
                value={formValues.qty}
                onChange={(e) => {
                  if (/^\d*$/.test(e.target.value)) handleChange(e);
                }}
                error={errors.qty}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              />
            </LabeledField>
          )}

          {formValues.promotion_type === "amount" && (
            <LabeledField label="Amount" required>
              <CommonTextField
                name="amount"
                label="Amount"
                value={formValues.amount}
                onChange={(e) => {
                  if (/^\d*$/.test(e.target.value)) handleChange(e);
                }}
                error={errors.amount}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              />
            </LabeledField>
          )}

          <Box sx={{ display: "flex", mb: "20px", gap: "20px" }}>
            <Box sx={{ width: "15%", fontWeight: 700, fontSize: "14px" }}>
              Offer Time <span style={{ color: "red" }}>*</span>:
            </Box>
            <Box sx={{ width: "85%", display: "flex", gap: "20px" }}>
              <Box width="50%">
                <CommonTextField
                  type="date"
                  name="startDate"
                  label="Start Date *"
                  value={formValues.startDate}
                  onChange={handleChange}
                  error={errors.startDate}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box width="50%">
                <CommonTextField
                  type="date"
                  name="expiryDate"
                  label="Expiry Date *"
                  value={formValues.expiryDate}
                  onChange={handleChange}
                  error={errors.expiryDate}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "end", mt: "15px" }}>
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
