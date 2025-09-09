import * as React from "react";
import FormControl from "@mui/material/FormControl";
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Typography
} from "@mui/material";
import { TextField } from "@mui/material";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { formatMeridiem } from "@mui/x-date-pickers/internals/utils/date-utils";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import {useState, useEffect } from "react";

const OfferDetails = ({
  formData,
  setFormData,
  keys,
  inputErrors,
  setInputErrors,
  addProducthandler,
  EditProducthandler,
  handleUploadVideo,
  editVideoHandler,
  handleUploadImage2,
  handleUploadImage,
  setLoading,
  loading,
  draftLoading,
  variationsData,
  formValues,
  handleDraftProduct,
  queryId
}) => {
  const [shippingTemplateData,setShippingTemplateData] = useState([]);
  const [exchangePolicy,setExchangePolicy] = useState([]);
  console.log({shippingTemplateData,exchangePolicy});

  // const [inputErrors, setInputErrors] = React.useState({
  //   sellerSku: "",
  //   shipingTemplates: "",
  //   yourPrice: "",
  //   quantity: "",
  //   productionTime: ""
  // });

  // console.log("hhhhhhhhhhhhhhhhhhhhhhhh", uniqueSetVideoarr);

  const formDataHandler = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleDateChange = (newDate) => {
    setFormData((prv) => ({ ...prv, saleStartDate: newDate }));
    console.log(newDate ? newDate.format("YYYY-MM-DD") : "No date selected");
  };

  const handleReleaseDateChange = (newDate) => {
    setFormData((prv) => ({ ...prv, saleEndDate: newDate }));
    console.log(newDate ? newDate.format("YYYY-MM-DD") : "No date selected");
  };
  const handleReStockChange = (newDate) => {
    setFormData((prv) => ({ ...prv, reStockDate: newDate }));
    console.log(newDate ? newDate.format("YYYY-MM-DD") : "No date selected");
  };

  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const designation_id = localStorage.getItem(localStorageKey.designation_id);
  const vendorId = localStorage.getItem(localStorageKey.vendorId);

  const navigate = useNavigate();

  const getAllShippingTemplates = async () => {
    try {
      const res = await ApiService.get(apiEndpoints.getAllShippingTemplates,auth_key);
      if (res.status === 200) {
        setShippingTemplateData(res?.data?.template);
      }
    } 
    catch (error) {
      console.log("error", error);
    }
  }

  const getExchangePolicy = async () => {
    try {
      const payload = {
        vendor_id : formData?.vendor
      }
      const res = await ApiService.post(apiEndpoints.getAllExchangePolicy,payload,auth_key);
      if (res.status === 200) {
        setExchangePolicy(res?.data?.policies);
      }
    } 
    catch (error) {
      console.log("error", error);
    }
  }

  useEffect(() => {
    getAllShippingTemplates();
    getExchangePolicy();
  }, []);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "15px"
        }}
      >
        <Box
          sx={{
            display: "flex",
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
            Seller Sku
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
              *
            </span>
            :
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%"
            }}
          >
            <TextField
              error={inputErrors.sellerSku && true}
              value={formData.sellerSku}
              helperText={inputErrors.sellerSku}
              onBlur={() => {
                if (!formData.sellerSku) {
                  setInputErrors((prv) => ({ ...prv, sellerSku: "Seller Sku is Required" }));
                }
              }}
              onChange={(e) => {
                formDataHandler(e);
                setInputErrors((prv) => ({ ...prv, sellerSku: "" }));
              }}
              onch
              fullWidth
              label="Seller Sku"
              name="sellerSku"
              id="fullWidth"
            />
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
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
            Product Tax Code
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>
            :
          </Box>
          <Box
            sx={{
              width: "100%"
            }}
          >
            <TextField
              value={formData.ProductTaxCode}
              onChange={(e) => {
                formDataHandler(e);
              }}
              fullWidth
              label="Product Tax"
              name="ProductTaxCode"
              id="ProductTaxCode"
            />
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
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
            Shipping Templates
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
              *
            </span>
            :
          </Box>
          <Box
            sx={{
              width: "100%"
            }}
          >
            <FormControl fullWidth>
              <TextField
                error={inputErrors.shipingTemplates && true}
                helperText={inputErrors.shipingTemplates}
                onBlur={() => {
                  if (!formData.shipingTemplates) {
                    setInputErrors((prv) => ({
                      ...prv,
                      shipingTemplates: "Shiping Template is Required"
                    }));
                  }
                }}
                onChange={(e) => {
                  formDataHandler(e);
                  setInputErrors((prv) => ({ ...prv, shipingTemplates: "" }));
                }}
                name="shipingTemplates"
                select
                id="dem-simple-select"
                value={formData.shipingTemplates}
                label="Shiping Template"
              >
              {
                shippingTemplateData?.map((item) => (
                  <MenuItem key={item._id} value={item._id}>{item.title}</MenuItem>
                ))
              }
              </TextField>
            </FormControl>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
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
            Return And Exchange Policy
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
              *
            </span>
            :
          </Box>
          <Box
            sx={{
              width: "100%"
            }}
          >
            <FormControl fullWidth>
              <TextField
                error={inputErrors.exchangePolicy && true}
                helperText={inputErrors.exchangePolicy}
                onBlur={() => {
                  if (!formData.exchangePolicy) {
                    setInputErrors((prv) => ({
                      ...prv,
                      exchangePolicy: "Return and exchange policy is required"
                    }));
                  }
                }}
                onChange={(e) => {
                  formDataHandler(e);
                  setInputErrors((prv) => ({ ...prv, exchangePolicy: "" }));
                }}
                name="exchangePolicy"
                select
                id="dem-simple-select"
                value={formData.exchangePolicy}
                label="Return and Exchange Policy"
              >
              {
                exchangePolicy?.map((item) => (
                  <MenuItem key={item._id} value={item._id}>{item.policyTitle}</MenuItem>
                ))
              }
              </TextField>
            </FormControl>
          </Box>
        </Box>
        {/* <Box
          sx={{
            display: "flex",
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
            Your Price
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
              *
            </span>
            :
          </Box>
          <Box
            sx={{
              width: "100%"
            }}
          >
            <FormControl fullWidth>
              <InputLabel htmlFor="outlined-adornment-amount">Amount</InputLabel>
              <OutlinedInput
                error={inputErrors.yourPrice && true}
                value={formData.yourPrice}
                onBlur={() => {
                  if (!formValues?.isCheckedPrice && !formData.yourPrice) {
                    setInputErrors((prv) => ({ ...prv, yourPrice: "Price is Required" }));
                  }
                }}
                onChange={(e) => {
                  formDataHandler(e);
                  if (!formValues?.isCheckedPrice) {
                    setInputErrors((prv) => ({ ...prv, yourPrice: "" }));
                  }
                }}
                id="outlinassd-aaaadornment-amount"
                startAdornment={<InputAdornment position="start">$</InputAdornment>}
                label="Amount"
                name="yourPrice"
              />
            </FormControl>

            {inputErrors.yourPrice && (
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "#FF3D57",
                  marginLeft: "14px",
                  marginRight: "14px"
                }}
              >
                {inputErrors.yourPrice}
              </Typography>
            )}
          </Box>
        </Box> */}
        <Box
          sx={{
            display: "flex",
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
            Sale Price
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>
            :
          </Box>
          <Box
            sx={{
              width: "100%"
            }}
          >
            <FormControl fullWidth>
              <InputLabel htmlFor="outlined-adornment-amount">Amount</InputLabel>
              <OutlinedInput
                error={inputErrors.salePrice && true}
                value={formData.salePrice}
                onChange={(e) => {
                  formDataHandler(e);
                  if (!formValues?.isCheckedPrice) {
                    setInputErrors((prv) => ({ ...prv, salePrice: "" }));
                  }
                }}
                onBlur={() => {
                  if (!formValues?.isCheckedPrice && !formData.salePrice) {
                    setInputErrors((prv) => ({ ...prv, salePrice: "Sale Price is Required" }));
                  }
                }}
                id="outlined-adornment-amount"
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
                  marginLeft: "14px",
                  marginRight: "14px"
                }}
              >
                {inputErrors.salePrice}
              </Typography>
            )}
          </Box>
        </Box>
        {/* <Box
          sx={{
            display: "flex",
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
            Sale Start Date{" "}
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>
            :
          </Box>
          <Box
            sx={{
              width: "100%"
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Select Date"
                value={formData.saleStartDate}
                onChange={handleDateChange}
              />
            </LocalizationProvider>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
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
            Sale End Date
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>
            :
          </Box>
          <Box
            sx={{
              width: "100%"
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Select Date"
                value={formData.saleEndDate}
                onChange={handleReleaseDateChange}
              />
            </LocalizationProvider>
          </Box>
        </Box> */}
        <Box
          sx={{
            display: "flex",
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
            Qunatity
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
              *
            </span>
            :
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%"
            }}
          >
            <TextField
              error={inputErrors.quantity && true}
              helperText={inputErrors.quantity}
              onBlur={() => {
                if (!formValues?.isCheckedQuantity) {
                  if (!formData.quantity) {
                    setInputErrors((prv) => ({ ...prv, quantity: "Quantity is Required" }));
                  }
                }
              }}
              onChange={(e) => {
                formDataHandler(e);
                if (!formValues?.isCheckedQuantity) {
                  setInputErrors((prv) => ({ ...prv, quantity: "" }));  
                }
              }}
              name="quantity"
              value={formData.quantity}
              fullWidth
              label="Quantity"
              id="fusssllWidth"
            />
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
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
            Max Order Quantity
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>
            :
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%"
            }}
          >
            <TextField
              onChange={(e) => {
                formDataHandler(e);
              }}
              name="maxOrderQuantity"
              fullWidth
              value={formData.maxOrderQuantity}
              label="Max Order Quantity"
              id="fullWidth"
            />
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
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
            Production Time
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>
            :
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%"
            }}
          >
            <TextField
              onChange={(e) => {
                formDataHandler(e);
              }}
              name="productionTime"
              fullWidth
              value={formData.productionTime}
              label="Max Order Quantity"
              id="fullWidth"
            />
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
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
            Color
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>
            :
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%"
            }}
          >
            <TextField
              fullWidth
              value={formData.color}
              label="Color"
              helperText={inputErrors.color}
              onChange={(e) => {
                formDataHandler(e);
              }}
              name="color"
              id="fufffllWidth"
            />
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
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
            Offering Can be{" "}
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>{" "}
            :
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%"
            }}
          >
            <FormControl fullWidth>
              <TextField
                value={formData.offeringCanBe}
                select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Offering"
                onChange={(e) => {
                  formDataHandler(e);
                }}
                name="offeringCanBe"
              >
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
              </TextField>
            </FormControl>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
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
            is Gift Wrap Avaliable{" "}
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>
            :
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%"
            }}
          >
            <FormControl fullWidth>
              <TextField
                value={formData.isGiftWrap}
                select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Gift Wrap"
                onChange={(e) => {
                  formDataHandler(e);
                }}
                name="isGiftWrap"
              >
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
              </TextField>
            </FormControl>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
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
            Restock Date{" "}
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>
            :
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%"
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Select Date"
                value={formData.reStockDate}
                onChange={handleReStockChange}
              />
            </LocalizationProvider>
          </Box>
        </Box>
        {/* <Box
          sx={{
            display: "flex",
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
            Fullfillment Channel{" "}
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
              *
            </span>
            :
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%"
            }}
          >
            <FormControl>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                name="radio-buttons-group"
                value={formData.fullfillmentChannel}
              >
                <FormControlLabel
                  value="Merchant Fulfilled"
                  name="fullfillmentChannel"
                  control={<Radio />}
                  onChange={formDataHandler}
                  label="I will ship this item myself (Merchant Fulfilled) "
                />
                <FormControlLabel
                  value="Amazon  Fulfilled"
                  name="fullfillmentChannel"
                  onChange={formDataHandler}
                  control={<Radio />}
                  label="Amzon will ship and provide customer service  (Amazon  Fulfilled)"
                />
              </RadioGroup>
            </FormControl>
            {inputErrors.fullfillmentChannel && (
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "#FF3D57",
                  marginLeft: "14px",
                  marginRight: "14px"
                }}
              >
                {inputErrors.fullfillmentChannel}
              </Typography>
            )}
          </Box>
        </Box> */}
        {/* <Box
          sx={{
            display: "flex",
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
            Production Time:
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%"
            }}
          >
            <TextField fullWidth label="Seller Sku" id="fullWidth" />
          </Box>
        </Box> */}
        {/* <Box
          sx={{
            display: "flex",
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
            Closure Type:
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%"
            }}
          >
            <TextField fullWidth label="Seller Sku" id="fullWidth" />
          </Box>
        </Box> */}
        {/* <Box
          sx={{
            display: "flex",
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
            Style Name:
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%"
            }}
          >
            <TextField fullWidth label="Seller Sku" id="fullWidth" />
          </Box>
        </Box> */}
        {/* <Box
          sx={{
            display: "flex",
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
            Style Name:
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%"
            }}
          >
            <TextField fullWidth label="Seller Sku" id="fullWidth" />
          </Box>
        </Box> */}
        {/* <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: "20px",
              width: "50%"
            }}
          >
            <Box
              sx={{
                fontSize: "14px",
                fontWeight: "700",
                width: "36%"
              }}
            >
              Item Display Dimentions:
            </Box>
            <Box
              sx={{
                width: "100%"
              }}
            >
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Dimentions</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={age}
                  label="Dimentions"
                  onChange={formDataHandler}
                >
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: "20px",
              width: "50%"
            }}
          >
            <Box
              sx={{
                fontSize: "14px",
                fontWeight: "700",
                width: "20%"
              }}
            >
              Item Display Dimentions:
            </Box>
            <Box
              sx={{
                width: "100%"
              }}
            >
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Dimentions</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={age}
                  label="Dimentions"
                  onChange={formDataHandler}
                >
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box> */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            marginTop: "20px"
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: "5px"
            }}
          >
            <Button
              endIcon={draftLoading ? <CircularProgress size={15} /> : ""}
              disabled={draftLoading}
              onClick={handleDraftProduct}
              variant="contained"
            >
              Save As Draft
            </Button>
            {queryId ? (
              <Button
                endIcon={loading ? <CircularProgress size={15} /> : ""}
                disabled={loading}
                onClick={EditProducthandler}
                variant="contained"
              >
                Submit
              </Button>
            ) : (
              <Button
                endIcon={loading ? <CircularProgress size={15} /> : ""}
                disabled={loading}
                onClick={addProducthandler}
                variant="contained"
              >
                Submit
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default OfferDetails;
