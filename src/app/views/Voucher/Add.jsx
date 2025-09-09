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
  Avatar
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
import { set } from "lodash";

const Add = () => {
  const [query, setQuery] = useSearchParams();
  const queryId = query.get("id");
  console.log(queryId, "queryId");
  const { logUserData, setLogUserData } = useProfileData();
  console.log(logUserData, "logUserData");
  const navigate = useNavigate();
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [shopList, setShopList] = useState([]);
  const [shopBaseUrl, setShopBaseUrl] = useState("");
  const formatDateToLocalInput = (date, hours = 0, minutes = 0) => {
    const pad = (n) => (n < 10 ? "0" + n : n);

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const h = pad(hours);
    const m = pad(minutes);

    return `${year}-${month}-${day}T${h}:${m}`;
  };
  const [formValues, setFormValues] = useState({
    for: "",
    selectedProducts: "",
    tags: [],
    title: "",
    claim_code: "",
    discountType: "",
    discountAmout: "",
    discountMAxAmount: "",
    cartAmount:"",
    noOfTimes: "",
    voucherLimit: "",
    valid: "all",
    autoUserAccount: "yes",
    startDate: formatDateToLocalInput(new Date(), 0, 0),
    expiryDate: formatDateToLocalInput(new Date(), 12, 0),
    description: ""
  });
  console.log({ formValues });
  const [errors, setErrors] = useState({
    for: "",
    selectedProducts: "",
    tags: "",
    title: "",
    claim_code: "",
    discountType: "",
    discountAmout: "",
    cartAmount:"",
    discountMAxAmount: "",
    noOfTimes: "",
    voucherLimit:"",
    valid: "",
    autoUserAccount:"",
    startDate: "",
    expiryDate: "",
    description: ""
  });
  console.log(errors, "errors");
  const [open, setOpen] = React.useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);
  const [allCategory, setAllCategory] = useState([]);
  console.log(allCategory, "allCategory");
  console.log({ formValues });

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
    if (route !== null) {
      navigate(route);
    }
    setRoute(null);
    setMsg(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log({ name, value });
    if (name == "for") {
      setFormValues((prev) => ({ ...prev, selectedProducts: "", tags: [] }));
      setFormValues((prev) => ({ ...prev, [name]: value }));
      setErrors((prv) => ({ ...prv, [name]: "" }));
    }
    if(name == "discountType"){
      setFormValues((prev) => ({ ...prev, [name]: value,discountAmout:"",discountMAxAmount:""}));
      setErrors((prv) => ({ ...prv, [name]: "" }));
    }
    if (name == "selectedProducts" && value == "select wise") {
      setFormValues((prev) => ({ ...prev, tags: [] }));
      setFormValues((prev) => ({ ...prev, [name]: value }));
      setErrors((prv) => ({ ...prv, [name]: "" }));
    } else {
      setFormValues((prev) => ({ ...prev, [name]: value }));
      setErrors((prv) => ({ ...prv, [name]: "" }));
    }
  };

  const handleAddVoucher = async () => {
    const newErrors = {};
    if (!formValues.for) newErrors.for = "For is required";
    if (!formValues.selectedProducts) newErrors.selectedProducts = formValues.for == "product" ? "Select product is required" : "Select Shop is required";
    if (formValues.selectedProducts == "select wise" && !formValues.tags.length > 0)
      newErrors.tags = (formValues.for == "product" ? "Product SKU is required" : "Shop name is required");
    if (!formValues.title) newErrors.title = "Coupon Title is required";
    if (!formValues.discountType) newErrors.discountType = "Discount Type is required";
    if (formValues.discountType === "percentage" && formValues.discountAmout > 100)
      newErrors.discountAmout =
        "Discount Amount cannot be more than 100 when Discount Type is Percentage";
    if (!formValues.discountAmout) newErrors.discountAmout = "Discount Amount is required";
    if (!formValues.discountMAxAmount && formValues.discountType === "percentage") newErrors.discountMAxAmount = "Maximum Discount Amount is required";
    if (!formValues.cartAmount) newErrors.cartAmount = "Cart Amount is required";
    if (!formValues.noOfTimes && formValues.noOfTimes !== 0)
      newErrors.noOfTimes = "Number Of Times is required";
    if (!formValues.voucherLimit) newErrors.voucherLimit = "Voucher Limit is required";
    if (!formValues.valid) newErrors.valid = "Valid is required";
    if (!formValues.autoUserAccount) newErrors.autoUserAccount = "Auto User Account is required";
    // if (!formValues.description) newErrors.description = "Description is required";
    if (!formValues.startDate) newErrors.startDate = "Start Date & Time is required";
    if (!formValues.claim_code) newErrors.claim_code = "Coupon Code is required";
    if (!formValues.expiryDate) newErrors.expiryDate = "Expiry Date & Time is required";
    if (formValues.startDate && formValues.expiryDate) {
      const startDateTime = new Date(formValues.startDate);
      const expiryDateTime = new Date(formValues.expiryDate);
      if (startDateTime.getTime() >= expiryDateTime.getTime()) {
        newErrors.startDate =
          "Start Date and Time cannot be later than and equal Expiry Date and Time";
      }
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      try {
        let payload = {
          _id: queryId ? queryId : "0",
          type: formValues?.for,
          wiseType: formValues?.selectedProducts,
          promotionTitle: formValues.title,
          claim_code: formValues.claim_code,
          discount_type: formValues.discountType,
          discount_amount: formValues.discountAmout,
          max_amount: formValues.discountMAxAmount,
          cart_amount: formValues.cartAmount,
          voucher_limit: formValues.voucherLimit,
          usage_limits: formValues.noOfTimes,
          type_of_users: formValues.valid,
          auto_voucher: formValues.autoUserAccount,
          description: formValues.description,
          startDate: formValues.startDate,
          endDate: formValues.expiryDate
        };
        if(formValues?.for == "product"){
            payload.product_skus = formValues?.tags;
            payload.shop_ids = []
        }else{
            payload.shop_ids = formValues?.tags;
            payload.product_skus = []
        }
        const res = await ApiService.post(apiEndpoints.addVoucher, payload, auth_key);
        if (res?.status === 200) {
          console.log("res---", res);
          // if (!queryId) {
          setRoute(ROUTE_CONSTANT.voucher.list);
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
  const getVoucher = async () => {
    try {
      const res = await ApiService.get(`${apiEndpoints.getVoucherById}/${queryId}`, auth_key);
      if (res?.status === 200) {
        console.log("res-----", res);
        const resData = res?.data?.voucher;
        setFormValues((prev) => ({
          ...prev,
          for: resData?.type,
          selectedProducts: resData?.wiseType,
          tags: resData?.type == "product" ? resData?.product_skus : resData?.shop_ids,
          title: resData?.promotionTitle,
          claim_code: resData?.claim_code,
          discountType: resData?.discount_type,
          discountAmout: resData?.discount_amount,
          discountMAxAmount: resData?.max_amount,
          cartAmount: resData?.cart_amount,
          noOfTimes: resData?.usage_limits,
          voucherLimit: resData?.voucher_limit,
          valid: resData?.type_of_users,
          description: resData?.description,
          startDate: formatDateTimeLocal(resData.startDate || ""),
          expiryDate: formatDateTimeLocal(resData.endDate || ""),
        }));
      }
    } catch (error) {
      handleOpen("error", error?.response?.data || error);
    }
  };

  useEffect(() => {
    if (queryId) {
      getVoucher();
    }
  }, [queryId]);

  const handleTagHandler = (event, newValue) => {
    // Process each value in newValue array and split using comma, space, or newline
    const processedValues = newValue
      .flatMap((value) =>
        typeof value === "string"
          ? value.split(/[\s,]+/).map((v) => v.trim()) // Split by space, comma, or newline
          : [value]
      )
      .filter((v) => v); // Remove empty values

    setFormValues((prev) => ({
      ...prev,
      tags: [...new Set(processedValues)] // Remove duplicates
    }));
  };

  const handleShopSelection = (event, newValue) => {
    console.log({ newValue });
    setFormValues((prev) => ({ ...prev, tags: newValue.map((item) => item._id) }));
    setErrors((prev) => ({ ...prev, tags: newValue.length === 0 ? "Tags is required" : "" }));
  };

  const getAllShops = async () => {
    try {
      let url = `${apiEndpoints.getVendors}`;
      const res = await ApiService.get(url, auth_key);

      if (res.status === 200) {
        const myNewList = res?.data?.data;
        setShopList(myNewList);
        setShopBaseUrl(res?.data?.shopIconBaseUrl || "");
      }
    } catch (error) {
      console.log(error?.response?.data || error);
    }
  };

  useEffect(() => {
    getAllShops();
  }, []);
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
              onClick={() => navigate(ROUTE_CONSTANT.voucher.list)}
              startIcon={<AppsIcon />}
              variant="contained"
            >
              Voucher List
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
              For
              <span
                style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}
              >
                {" "}
                *
              </span>
              :
            </Box>
            <FormControl>
              <RadioGroup
                row
                aria-label="for"
                name="for"
                value={formValues.for}
                onChange={handleChange}
                sx={{ alignItems: "center" }}
              >
                <FormControlLabel value="product" control={<Radio />} label="Product" />
                <FormControlLabel value="shop" control={<Radio />} label="Shop" />
              </RadioGroup>
            </FormControl>
            {errors.for && (
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "#FF3D57",
                  marginLeft: "14px",
                  marginRight: "14px",
                  marginTop: "3px"
                }}
              >
                {errors.for}
              </Typography>
            )}
          </Box>
          {formValues.for && (
            <>
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
                  {formValues.for == "product" ? "Select Products" : "Select Shops"}
                  <span
                    style={{
                      color: "red",
                      fontSize: "15px",
                      marginRight: "3px",
                      marginLeft: "3px"
                    }}
                  >
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
                        error={Boolean(errors.selectedProducts)}
                        helperText={errors.selectedProducts}
                        select
                        sx={{
                          "& .MuiInputBase-root": {
                            height: "40px"
                          },
                          "& .MuiFormLabel-root": {
                            top: "-7px"
                          }
                        }}
                        label={formValues.for == "product" ? "Select Products" : "Select Shops"}
                        labelId="pib"
                        id="pibb"
                        value={formValues?.selectedProducts}
                        name="selectedProducts"
                        onChange={handleChange}
                        InputProps={{
                          endAdornment: formValues?.selectedProducts ? (
                            <InputAdornment position="end" sx={{ mr: 3 }}>
                              <IconButton
                                onClick={() => {
                                  handleChange({ target: { name: "selectedProducts", value: "" } });
                                  setErrors((prv) => ({
                                    ...prv,
                                    selectedProducts: "Puchased Item is required"
                                  }));
                                }}
                                edge="end"
                              >
                                <ClearIcon />
                              </IconButton>
                            </InputAdornment>
                          ) : null
                        }}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="select wise">Select Wise</MenuItem>
                      </TextField>
                    </FormControl>
                  </Box>
                </Box>
              </Box>
              {formValues.for == "product" && formValues.selectedProducts && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
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
                    {formValues.selectedProducts == "all" ? "Exclude SKU (optional)" : "Add SKU Codes"}:
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
                        error={Boolean(errors?.tags)}
                        helperText={errors?.tags || ""}
                        sx={{
                          "& .MuiInputBase-root": {
                            padding: "0 11px"
                          },
                          "& .MuiFormLabel-root": {
                            top: "-7px"
                          }
                        }}
                      />
                    )}
                    sx={{ width: "100%" }}
                    onChange={handleTagHandler}
                    onBlur={() => {
                            if (
                                formValues?.selectedProducts === "all" &&
                                formValues.tags.length === 0
                            ) {
                                setErrors((prv) => ({
                                    ...prv,
                                    tags: "Product SKU is required",
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
              )}
              {formValues.for == "shop" && formValues.selectedProducts && (
                <Box
                  sx={{ display: "flex", flexDirection: "row", marginBottom: "20px", gap: "20px" }}
                >
                  <Box
                    sx={{
                      fontSize: "14px",
                      fontWeight: 700,
                      width: "15%",
                      textOverflow: "ellipsis",
                      padding: "0px"
                    }}
                  >
                    {formValues.selectedProducts == "all" ? "Exclude Shops (optional)" : "Add Shops"}:
                    <span style={{ color: "red", fontSize: "15px", margin: "0 3px" }}>*</span>:
                  </Box>
                  <Autocomplete
                    multiple
                    id="shop-name-select"
                    options={shopList}
                    getOptionLabel={(option) => option?.vendorData?.shop_name || option?.name}
                    renderOption={(props, option) => (
                      <li
                        {...props}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          paddingBlock: "0px",
                          marginBottom: "10px"
                        }}
                      >
                        <Avatar
                          alt={option?.vendorData?.shop_name}
                          src={`${shopBaseUrl}${option?.vendorData?.shop_icon}`}
                          sx={{ width: 70, height: 70, borderRadius: 2 }}
                          variant="square"
                        />
                        <Box
                          dangerouslySetInnerHTML={{
                            __html: option?.vendorData?.shop_name || option?.name
                          }}
                          sx={{ fontSize: "12px" }}
                        />
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Shop Names..."
                        placeholder="Enter a Shop Name..."
                        error={Boolean(errors.tags)}
                        helperText={errors.tags || ""}
                      />
                    )}
                    sx={{ width: "100%" }}
                    onChange={handleShopSelection}
                    value={shopList?.filter((item) => formValues?.tags?.includes(item._id))}
                    onBlur={() => {
                      if (formValues.tags.length === 0) {
                        setErrors((prev) => ({
                          ...prev,
                          tags: "Shop name is required"
                        }));
                      } else {
                        setErrors((prev) => ({ ...prev, tags: "" }));
                      }
                    }}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                  />
                </Box>
              )}
            </>
          )}
          {formValues.for == "shop" && <></>}
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
              Voucher Title
              <span
                style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}
              >
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
                  label="Voucher Title"
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
              Claim Code
              <span
                style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}
              >
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
                  error={errors.claim_code && true}
                  helperText={errors.claim_code}
                  onBlur={() => {
                    if (!formValues.claim_code) {
                      setErrors((prv) => ({ ...prv, claim_code: "Coupon Code is required" }));
                    }
                  }}
                  name="claim_code"
                  label="Claim Code"
                  onChange={handleChange}
                  value={formValues.claim_code}
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
              <span
                style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}
              >
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
              Discount Amount
              <span
                style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}
              >
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
                  error={errors.discountAmout && true}
                  helperText={errors.discountAmout}
                  onBlur={() => {
                    if (!formValues.discountAmout) {
                      setErrors((prv) => ({
                        ...prv,
                        discountAmout: "Discount Amount is Required"
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
                    pattern: "[0-9]*"
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
          </Box>
          {
            formValues.discountType == "percentage" && (
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
                    Max Amount
                    <span
                        style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}
                    >
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
                        error={errors.discountMAxAmount && true}
                        helperText={errors.discountMAxAmount}
                        onBlur={() => {
                            if (!formValues.discountMAxAmount) {
                            setErrors((prv) => ({
                                ...prv,
                                discountMAxAmount: "Maximum Discount Amount is Required"
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
                            pattern: "[0-9]*"
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
                </Box>
            )
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
              Cart Amount
              <span
                style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}
              >
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
                  error={errors.cartAmount && true}
                  helperText={errors.cartAmount}
                  onBlur={() => {
                    if (!formValues.cartAmount) {
                      setErrors((prv) => ({
                        ...prv,
                        cartAmount: "Cart Amount is Required"
                      }));
                    }
                  }}
                  type="text"
                  name="cartAmount"
                  label="Cart Amount"
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only numbers
                    if (/^\d*$/.test(value)) {
                      handleChange(e);
                    }
                  }}
                  value={formValues.cartAmount}
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*"
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
              No. Of Times
              <span
                style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}
              >
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
                  error={errors.noOfTimes && true}
                  helperText={errors.noOfTimes}
                  onBlur={() => {
                    if (!formValues.noOfTimes) {
                      setErrors((prv) => ({
                        ...prv,
                        noOfTimes: "No Of Times is Required"
                      }));
                    }
                  }}
                  type="text"
                  name="noOfTimes"
                  label="No. of time user can use this voucher (Enter 0 to allow multiple attempts)"
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
                    pattern: "[0-9]*"
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
              Total Voucher Limit
              <span
                style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}
              >
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
                  error={errors.voucherLimit && true}
                  helperText={errors.voucherLimit}
                  onBlur={() => {
                    if (!formValues.voucherLimit) {
                      setErrors((prv) => ({
                        ...prv,
                        voucherLimit: "Voucher limit is required"
                      }));
                    }
                  }}
                  type="text"
                  name="voucherLimit"
                  label="Voucher Limit"
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only numbers (no alphabets or special characters)
                    if (/^\d*$/.test(value)) {
                      handleChange(e);
                    }
                  }}
                  value={formValues.voucherLimit}
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*"
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
              Type of Users
              <span
                style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}
              >
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
              Auto Voucher in user's A/c
              <span
                style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}
              >
                {" "}
                *
              </span>
              :
            </Box>
            <FormControl>
              <RadioGroup
                row
                aria-label="autoUserAccount"
                name="autoUserAccount"
                value={formValues.autoUserAccount}
                onChange={handleChange}
                sx={{ alignItems: "center" }}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
            {errors.autoUserAccount && (
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "#FF3D57",
                  marginLeft: "14px",
                  marginRight: "14px",
                  marginTop: "3px"
                }}
              >
                {errors.autoUserAccount}
              </Typography>
            )}
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
              Description :
            </Box>
            <Box width={"100%"}>
              <Box
                sx={{
                  height: "auto",
                  width: "100%"
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
                      height: "auto"
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
              Offer Time
              <span
                style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}
              >
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
            <Button variant="contained" onClick={handleAddVoucher}>
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
