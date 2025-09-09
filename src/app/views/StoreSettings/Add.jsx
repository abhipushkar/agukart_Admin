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
  const [productList, setProductList] = useState([]);
  console.log({productList})
  const [formValues, setFormValues] = useState({
    store_name: "",
    product_select: "",
    selectedSkuCodes: [],
    selectedProducts:[],
    sort_order: ""
  });
  console.log({ formValues });
  const [errors, setErrors] = useState({
    store_name: "",
    product_select: "",
    selectedProducts:"",
    selectedSkuCodes: "",
    sort_order: ""
  });
  console.log(errors, "errors");

  // const productList = [
  //   { id: 1, name: "Milk" },
  //   { id: 2, name: "Cheese" },
  //   { id: 3, name: "Butter" },
  //   { id: 4, name: "Yogurt" },
  //   { id: 5, name: "Paneer" }
  // ];

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
    if (name === "sort_order" && !/^\d*$/.test(value)) {
      return; 
    }
    if(name == "product_select" && value == "Products Name"){
      setFormValues((prev) => ({ ...prev, [name]: value,selectedSkuCodes:[]}));
      setErrors((prv) => ({ ...prv, [name]: ""}));
    }else if(name == "product_select" && value == "Products SKU"){
      setFormValues((prev) => ({ ...prev, [name]: value,selectedProducts:[]}));
      setErrors((prv) => ({ ...prv, [name]: ""}));
    }else{
      setFormValues((prev) => ({ ...prev, [name]: value }));
      setErrors((prv) => ({ ...prv, [name]: "" }));
    }
  };

  const handleAddStore = async () => {
    const newErrors = {};
    if (!formValues.product_select) newErrors.product_select = "Add product via is required";
    if (formValues.product_select=="products name" && !formValues.selectedSkuCodes.length > 0) newErrors.selectedSkuCodes = "SKU codes is required";
    if (formValues.product_select=="products sku" && !formValues.selectedProducts.length > 0) newErrors.selectedProducts = "Products is required";
    if (!formValues.store_name) newErrors.store_name = "Store page name is required";
    if (!formValues.sort_order) newErrors.sort_order = "Sort order is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      try {
        let payload = {
          store_name: formValues.store_name,
          product_select: formValues.product_select,
          sort_order : formValues.sort_order,
        };
        if(formValues.product_select == "Products Name"){
          payload.selected_products = formValues.selectedProducts
        }else{
          payload.selected_sku_codes = formValues.selectedSkuCodes
        }
        if(queryId){
          payload._id = queryId
        }
        let url = "";
        if(queryId){
          url = apiEndpoints.updateStore;
        }else{
          url = apiEndpoints.addStore;
        }
        const res = await ApiService.post(url, payload, auth_key);
        if (res?.status === 200) {
          console.log("res---", res);
          // if (!queryId) {
          setRoute(ROUTE_CONSTANT.storeSetting.list);
          // }
          handleOpen("success", res?.data);
        }
      } catch (error) {
        handleOpen("error", error?.response?.data || error);
      }
    }
  };
  const getStore = async () => {
    try {
      const res = await ApiService.get(`${apiEndpoints.getStoreById}/${queryId}`, auth_key);
      if (res?.status === 200) {
        console.log("res-----", res);
        const resData = res?.data?.store;
        setFormValues((prev) => ({
          ...prev,
          store_name: resData?.store_name,
          product_select: resData?.product_select,
          selectedSkuCodes: resData?.selected_sku_codes,
          selectedProducts: resData?.selected_products,
          sort_order: resData?.sort_order
        }));
      }
    } catch (error) {
      handleOpen("error", error?.response?.data || error);
    }
  };

  useEffect(() => {
    if (queryId) {
      getStore();
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
      selectedSkuCodes: [...new Set(processedValues)] // Remove duplicates
    }));
  };

  const handleProductSelection = (event, newValue) => {
    console.log({newValue})
    setFormValues((prev) => ({ ...prev, selectedProducts: newValue.map((item) => item._id) }));
    setErrors((prev) => ({ ...prev, selectedProducts: newValue.length === 0 ? "Products is required" : "" }));
  };

  const getVendorProducts = async() => {
    try {
      const res = await ApiService.get(`${apiEndpoints.getVendorProducts}`, auth_key);
      if (res?.status === 200) {
        console.log("res-----", res);
        const resData = res?.data?.products;
        setProductList(resData);
      }
    } catch (error) {
      console.log(error?.response?.data || error);
    }
  }

  useEffect(()=>{
    getVendorProducts();
  },[])
  
  return (
    <>
      <Box sx={{ marginInline: "30px", marginBlock:"15px" }}>
        <Box sx={{ py: "16px", marginBottom: "10px" }} component={Paper}>
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
              onClick={() => navigate(ROUTE_CONSTANT.storeSetting.list)}
              startIcon={<AppsIcon />}
              variant="contained"
            >
              Store List
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
              Store Page Name
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
                  error={errors.store_name && true}
                  helperText={errors.store_name}
                  onBlur={() => {
                    if (!formValues.store_name) {
                      setErrors((prv) => ({ ...prv, store_name: "Store page name is required" }));
                    }
                  }}
                  name="store_name"
                  label="Store page name"
                  onChange={handleChange}
                  value={formValues.store_name}
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
              Add Products Via
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
                    error={Boolean(errors.product_select)}
                    helperText={errors.product_select}
                    select
                    sx={{
                      "& .MuiInputBase-root": {
                        height: "40px"
                      },
                      "& .MuiFormLabel-root": {
                        top: "-7px"
                      }
                    }}
                    label="Select Add Product Via"
                    labelId="pib"
                    id="pibb"
                    value={formValues?.product_select}
                    name="product_select"
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: formValues?.product_select ? (
                        <InputAdornment position="end" sx={{ mr: 3 }}>
                          <IconButton
                            onClick={() => {
                              handleChange({ target: { name: "product_select", value: "" } });
                              setErrors((prv) => ({
                                ...prv,
                                product_select: "Add products via is required"
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
                    <MenuItem value="Products Name">Products Name</MenuItem>
                    <MenuItem value="Products SKU">Products SKU</MenuItem>
                  </TextField>
                </FormControl>
              </Box>
            </Box>
          </Box>
          {formValues.product_select === "Products Name" && (
            <Box sx={{ display: "flex", flexDirection: "row", marginBottom: "20px", gap: "20px" }}>
              <Box sx={{ fontSize: "14px", fontWeight: 700, width: "15%", textOverflow: "ellipsis" , padding: "0px"}}>
                Select Product Names
                <span style={{ color: "red", fontSize: "15px", margin: "0 3px" }}>*</span>:
              </Box>
              <Autocomplete
                multiple
                id="product-name-select"
                options={productList}
                getOptionLabel={(option) => option.product_title}
                 renderOption={(props, option) => (
                  <li {...props} style={{ display: "flex", alignItems: "center", gap: "10px" , paddingBlock: "0px" }}>
                    <Avatar
                      alt={option.product_title}
                      src={option.product_image}
                      sx={{ width: 70, height: 70, borderRadius: 2 }}
                      variant="square"
                    />
                    <span dangerouslySetInnerHTML={{ __html: option.product_title }} sx={{ fontSize: "12px" }} />
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Product Names..."
                    placeholder="Enter a Product Name..."
                    error={Boolean(errors.selectedProducts)}
                    helperText={errors.selectedProducts || ""}
                  />
                )}
                sx={{ width: "100%" }}
                onChange={handleProductSelection}
                value={productList.filter((item) => formValues.selectedProducts.includes(item._id))}
                onBlur={() => {
                  if (formValues.selectedProducts.length === 0) {
                    setErrors((prev) => ({ ...prev, selectedProducts: "Products is required" }));
                  } else {
                    setErrors((prev) => ({ ...prev, selectedProducts: "" }));
                  }
                }}
                isOptionEqualToValue={(option, value) => option._id === value._id}
              />
            </Box>
          )}
          {formValues.product_select == "Products SKU" && (
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
                Product Wise SKU Codes{" "}
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
                limitselectedSkuCodes={4}
                id="multiple-limit-selectedSkuCodes"
                options={[]}
                getOptionLabel={(option) => option}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Enter SKU Codes ..."
                    placeholder="Enter a SKU Codes ..."
                    sx={{
                      "& .MuiInputBase-root": {
                        padding: "0 11px"
                      },
                      "& .MuiFormLabel-root": {
                        top: "-7px"
                      }
                    }}
                    error={Boolean(errors?.selectedSkuCodes)}
                    helperText={errors?.selectedSkuCodes || ""}
                  />
                )}
                sx={{ width: "100%" }}
                onChange={handleTagHandler}
                onBlur={() => {
                  if (formValues.selectedSkuCodes.length === 0) {
                    setErrors((prv) => ({
                      ...prv,
                      selectedSkuCodes: "SKU codes is required"
                    }));
                  } else {
                    setErrors((prv) => ({
                      ...prv,
                      selectedSkuCodes: ""
                    }));
                  }
                }}
                value={formValues.selectedSkuCodes}
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
              Sort order
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
                  error={errors.sort_order && true}
                  helperText={errors.sort_order}
                  onBlur={() => {
                    if (!formValues.sort_order) {
                      setErrors((prv) => ({ ...prv, sort_order: "Sort order is required" }));
                    }
                  }}
                  name="sort_order"
                  label="Sort Order"
                  onChange={handleChange}
                  value={formValues.sort_order}
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
              justifyContent: "end",
              marginTop: "15px",
              gap: "5px"
            }}
          >
            <Button variant="contained" onClick={handleAddStore}>
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
