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
  RadioGroup
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

const Add = () => {
  const [query, setQuery] = useSearchParams();
  const queryId = query.get("id");
  console.log(queryId, "queryId");
  const { logUserData, setLogUserData } = useProfileData();
  console.log(logUserData, "logUserData");
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
    title:"",
    offerType: "",
    discountAmout: "",
    promotion_type:"",
    qty: "",
    amount :"",
    startDate: formatDateToLocalInput(new Date(), 0, 0),
    expiryDate: formatDateToLocalInput(new Date(), 12, 0)
  });
  const [toggleProductWise, setToggleProductWise] = useState(false);
  const [toggleEntireCalalog, setToggleEntireCalalog] = useState(false);
  const [errors, setErrors] = useState({
    puchasedItem: "",
    tags: "",
    title:"",
    offerType: "",
    discountAmout: "",
    promotion_type:"",
    qty: "",
    amount :"",
    startDate: "",
    expiryDate: ""
  });

  const [open, setOpen] = React.useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);
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
    if (name == "puchasedItem" && value == "Product Wise") {
      setToggleProductWise(true);
      setToggleEntireCalalog(false);
      setFormValues((prev) => ({ ...prev, tags: [] }));
      setFormValues((prev) => ({ ...prev, [name]: value }));
      setErrors((prv) => ({ ...prv, [name]: "" }));
    } else if (name == "puchasedItem" && value == "Entire Catalog") {
      setToggleEntireCalalog(true);
      setToggleProductWise(false);
      setFormValues((prev) => ({ ...prev, tags: [] }));
      setFormValues((prev) => ({ ...prev, [name]: value }));
      setErrors((prv) => ({ ...prv, [name]: "", tags: "" }));
    } else if (name == "promotion_type") {
      setFormValues((prev) => ({ ...prev, [name]: value, qty:"",amount:"" }));
      setErrors((prv) => ({ ...prv, [name]: "", qty:"",amount:"" }));
    } 
    else {
      setFormValues((prev) => ({ ...prev, [name]: value }));
      setErrors((prv) => ({ ...prv, [name]: "" }));
    }
  };

  const handleAddCoupon = async () => {
    const newErrors = {};
    if (!formValues.puchasedItem) newErrors.puchasedItem = "Purchased Item is required";
    if (formValues.puchasedItem == "Product Wise" && !formValues.tags.length > 0)
      newErrors.tags = "Tags is required";
    if (!formValues.title) newErrors.title = "Promotional Title is required";
    if (!formValues.offerType) newErrors.offerType = "Offer Type is required";
    if (formValues.offerType === "percentage" && formValues.discountAmout > 100)
      newErrors.discountAmout =
        "Offer Amount cannot be more than 100 when Discount Type is Percentage";
    if (!formValues.discountAmout) newErrors.discountAmout = "Discount Amount is required";
    if (!formValues.promotion_type) newErrors.promotion_type = "Promotion type is required";
    if (formValues.promotion_type == "amount" && !formValues.amount) newErrors.amount = "Amount is required";
    if (formValues.promotion_type == "qty" && !formValues.qty) newErrors.qty = "Qty is required";
    if (!formValues.startDate) newErrors.startDate = "Start Date & Time is required";
    if (!formValues.expiryDate) newErrors.expiryDate = "Expiry Date & Time is required";
    if (formValues.startDate && formValues.expiryDate) {
      const startDateTime = new Date(formValues.startDate);
      const expiryDateTime = new Date(formValues.expiryDate);

      if (startDateTime.getTime() >= expiryDateTime.getTime()) {
        newErrors.startDate = "Start Date and Time cannot be later than and equal to Expiry Date and Time";
      }
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      try {
        const payload = {
          _id: queryId ? queryId : "0",
          vendor_id: logUserData?._id,
          purchased_items: formValues?.puchasedItem,
          product_id: formValues?.tags,
          promotional_title: formValues.title,
          offer_type: formValues.offerType,
          discount_amount: formValues.discountAmout,
          promotion_type: formValues.promotion_type,
          offer_amount: formValues.amount,
          qty: formValues.qty,
          start_date: formValues.startDate,
          expiry_date: formValues.expiryDate
        };
        const res = await ApiService.post(apiEndpoints.addPromotionalOffer, payload, auth_key);
        if (res?.status === 200) {
          console.log("res---", res);
        //   if (!queryId) {
            setRoute(ROUTE_CONSTANT.catalog.promotionalOffer.list);
        //   }
          handleOpen("success", res?.data);
        }
      } catch (error) {
        handleOpen("error", error?.response?.data || error);
      }
    }
  };
  const formatDateTimeLocal = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getPromotionalOffer = async () => {
    try {
      const res = await ApiService.get(
        `${apiEndpoints.getPromotionalOfferById}/${queryId}`,
        auth_key
      );
      if (res?.status === 200) {
        console.log("res-----", res);
        const resData = res?.data?.promotion;
        setFormValues((prev) => ({
          ...prev,
          puchasedItem: resData?.purchased_items,
          tags: resData?.product_id,
          title : resData?.promotional_title,
          offerType: resData?.offer_type,
          discountAmout: resData?.discount_amount,
          promotion_type: resData?.promotion_type,
          amount: resData?.offer_amount,
          qty: resData?.qty,
          startDate: formatDateTimeLocal(resData.start_date),
          expiryDate: formatDateTimeLocal(resData.expiry_date)
        }));
        if (resData?.purchased_items == "Product Wise") {
          setToggleProductWise(true);
        } else if (resData?.purchased_items == "Entire Catalog") {
          setToggleEntireCalalog(true);
        }
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

  const handleTagHandler = (event, newValue) => {
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
              onClick={() => navigate(ROUTE_CONSTANT.catalog.promotionalOffer.list)}
              startIcon={<AppsIcon />}
              variant="contained"
            >
              Promotional Offer List
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
                              setErrors((prv) => ({
                                ...prv,
                                puchasedItem: "Puchased Item is required"
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
                    <MenuItem
                      value="Product Wise"
                    >
                      Product Wise
                    </MenuItem>
                    <MenuItem
                      value="Entire Catalog"
                    >
                      Entire Catalog
                    </MenuItem>
                  </TextField>
                </FormControl>
              </Box>
            </Box>
          </Box>
          {toggleProductWise && (
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
                Product Wise SKU Code{" "}
                <span
                  style={{
                    color: "red",
                    fontSize: "15px",
                    marginRight: "3px",
                    marginLeft: "3px"
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
                    label="Enter SKU Codes..."
                    placeholder="Enter a SKU Codes..."
                    sx={{
                      "& .MuiInputBase-root": {
                        padding: "0 11px"
                      },
                      "& .MuiFormLabel-root": {
                        top: "-7px"
                      }
                    }}
                    error={Boolean(errors?.tags)}
                    helperText={errors?.tags || ""}
                  />
                )}
                sx={{ width: "100%" }}
                onChange={handleTagHandler}
                onBlur={() => {
                  if (formValues?.puchasedItem === "Product Wise" && formValues.tags.length === 0) {
                    setErrors((prv) => ({
                      ...prv,
                      tags: "SKU Codes are required"
                    }));
                  } else {
                    setErrors((prv) => ({
                      ...prv,
                      tags: ""
                    }));
                  }
                }}
                value={formValues.tags}
                isOptionEqualToValue={(option, value) => option === value}
              />
            </Box>
          )}
          {toggleEntireCalalog && (
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
                Exclude Items (optional) :
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
          )}
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
              Promotional Title
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
                      setErrors((prv) => ({ ...prv, title: "Promotional Title is required" }));
                    }
                  }}
                  name="title"
                  label="Promotional Title"
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
              Offer Type
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
                aria-label="offerType"
                name="offerType"
                value={formValues.offerType}
                onChange={handleChange}
                sx={{ alignItems: "center" }}
              >
                <FormControlLabel value="flat" control={<Radio />} label="Flat" />
                <FormControlLabel value="percentage" control={<Radio />} label="Percentage" />
              </RadioGroup>
            </FormControl>
            {errors.offerType && (
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "#FF3D57",
                  marginLeft: "14px",
                  marginRight: "14px",
                  marginTop: "3px"
                }}
              >
                {errors.offerType}
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
              Promotion Type
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
                <FormControl fullWidth>
                  <TextField
                    error={Boolean(errors.promotion_type)}
                    helperText={errors.promotion_type}
                    select
                    sx={{
                      "& .MuiInputBase-root": {
                        height: "40px"
                      },
                      "& .MuiFormLabel-root": {
                        top: "-7px"
                      }
                    }}
                    label="Select promotion Type"
                    labelId="pib"
                    id="pibb"
                    value={formValues?.promotion_type}
                    name="promotion_type"
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: formValues?.promotion_type ? (
                        <InputAdornment position="end" sx={{ mr: 3 }}>
                          <IconButton
                            onClick={() => {
                              handleChange({ target: { name: "promotion_type", value: "" } });
                              setErrors((prv) => ({
                                ...prv,
                                puchasedItem: "Promotion type is required"
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
                    <MenuItem
                      value="qty"
                    >
                      Via Qty
                    </MenuItem>
                    <MenuItem
                      value="amount"
                    >
                      Via Amount
                    </MenuItem>
                  </TextField>
                </FormControl>
              </Box>
            </Box>
          </Box>
          {
            formValues.promotion_type === "qty" && (
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
                  Qty
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
                      error={errors.qty && true}
                      helperText={errors.qty}
                      onBlur={() => {
                        if (!formValues.qty) {
                          setErrors((prv) => ({
                            ...prv,
                            qty: "Qty is required"
                          }));
                        }
                      }}
                      type="text"
                      name="qty"
                      label="Qty"
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only numbers (no alphabets or special characters)
                        if (/^\d*$/.test(value)) {
                          handleChange(e);
                        }
                      }}
                      value={formValues.qty}
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
          {
            formValues.promotion_type === "amount" && (
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
                  Amount
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
                      error={errors.amount && true}
                      helperText={errors.amount}
                      onBlur={() => {
                        if (!formValues.amount) {
                          setErrors((prv) => ({
                            ...prv,
                            amount: "Amount is required"
                          }));
                        }
                      }}
                      type="text"
                      name="amount"
                      label="Amount"
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only numbers (no alphabets or special characters)
                        if (/^\d*$/.test(value)) {
                          handleChange(e);
                        }
                      }}
                      value={formValues.amount}
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
