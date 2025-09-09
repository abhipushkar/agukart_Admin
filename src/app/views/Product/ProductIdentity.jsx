import * as React from "react";
import FormControl from "@mui/material/FormControl";
import ProductTitleEditor from "./ProductTitleEditor/ProductTitleEditor";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  CircularProgress,
  InputAdornment,
  IconButton
} from "@mui/material";
import { TextField } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { DropdownNestedMenuItem, Dropdown, DropdownMenuItem } from "../Catalog/Category/DropDown";
import { ArrowRight } from "@mui/icons-material";
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ClearIcon from "@mui/icons-material/Clear";
import { useEffect } from "react";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { useState } from "react";
import ConfirmModal from "app/components/ConfirmModal";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const ProductIdentity = ({
  formData,
  setFormData,
  setTabsValue,
  inputErrors,
  setInputErrors,
  loading,
  draftLoading,
  EditProducthandler,
  queryId,
  handleDraftProduct 
}) => {
  const [value, setValue] = React.useState("female");
  const [selectedBrand, setSelectedBand] = React.useState("");
  const [brandlist, setBrandList] = React.useState([]);
  const [allCategory, setAllCategory] = React.useState([]);
  const [allVendors, setAllVendors] = React.useState([]);
  const [selectedCatLable, setSelectedCatLable] = React.useState("Select Category");
  const [showVariant, setShowVariant] = React.useState(false);
  const [varintList, setVariantList] = React.useState([]);
  const navigate = useNavigate();

  const [open, setOpen] = React.useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);

  const logOut = () => {
    localStorage.removeItem(localStorageKey.auth_key);
    localStorage.removeItem(localStorageKey.designation_id);
    localStorage.removeItem(localStorageKey.vendorId);
    setRoute(ROUTE_CONSTANT.login)
  };

  const handleOpen = (type, msg) => {
    setMsg(msg?.message);
    setOpen(true);
    setType(type);
    if (msg?.response?.status === 401) {
      logOut()
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

  // const [inputErrors, setInputErrors] = React.useState({
  //   productTitle: "",
  //   subCategory: "",
  //   vendor: ""
  // });

  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const designation_id = localStorage.getItem(localStorageKey.designation_id);
  const getBrandList = async () => {
    try {
      const res = await ApiService.get(apiEndpoints.getBrand, auth_key);
      if (res.status === 200) {
        setBrandList(res?.data?.brand);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  const formDataHandler = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getVaraintList = async () => {
    try {
      const typeParam = "type=Product";
      const urlWithParam = `${apiEndpoints.getVariant}?${typeParam}`;
      const res = await ApiService.get(urlWithParam, auth_key);
      if (res.status === 200) {
        setVariantList(res?.data?.variant);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  const getVendorList = async () => {
    try {
      const res = await ApiService.get(apiEndpoints.getVendorsList, auth_key);
      if (res?.status === 200) {
        setAllVendors(res?.data?.data);
        console.log("res-----", res);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  React.useEffect(() => {
    getBrandList();
    getVaraintList();
    getChildCategory();
    getVendorList();
  }, []);

  const varintHandler = (event, value) => {
    setFormData((prv) => ({ ...prv, variations: value.map((option) => option._id) }));
    setFormData((prv) => ({ ...prv, variantData: value }));
    setInputErrors((prv) => ({ ...prv, variations: "" }));
  };

  console.log({ formData });

  const getParentCategory = async (id) => {
    try {
      const res = await ApiService.get(apiEndpoints.getParentCatgory, auth_key);
      if (res.status === 200) {
        const findSubCatgory = res?.data?.data.find((cat) => cat._id === id);
        console.log({ findSubCatgory });
        setFormData((prv) => ({ ...prv, catLable: findSubCatgory?.title }));
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };
  const getChildCategory = async () => {
    try {
      const res = await ApiService.get(apiEndpoints.getChildCategory, auth_key);
      console.log({ res });
      if (res.status === 200) {
        setAllCategory(res?.data?.data);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "vendor") {
      setFormData((prev) => ({ ...prev, vendor: value }));
    }
    setInputErrors((prv) => ({ ...prv, [name]: "" }));
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}
      >
        {designation_id === "2" && (
          <Box
            sx={{
              display: "flex",
              gap: "20px",
              mb: 2
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
              Shop Name
              <span
                style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}
              >
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
              <Autocomplete
                id="single-select-country"
                options={allVendors}
                getOptionLabel={(option) => `${option.shopName || option.name}`}
                renderInput={(params) => {
                  return (
                    <TextField
                      {...params}
                      label="Select Shop Name"
                      placeholder="Select Shop Name"
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "40px",
                          padding: "0 11px"
                        },
                        "& .MuiFormLabel-root": {
                          top: "-7px"
                        }
                      }}
                      error={inputErrors.vendor && true}
                      helperText={inputErrors.vendor}
                    />
                  );
                }}
                sx={{ width: "100%" }}
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: "vendor",
                      value: newValue ? newValue._id : ""
                    }
                  });
                }}
                onBlur={() => {
                  if (!formData.vendor) {
                    setInputErrors((prev) => ({ ...prev, vendor: "Shop name is Required" }));
                  }
                }}
                value={allVendors.find((item) => item._id === formData.vendor) || null}
                isOptionEqualToValue={(option, value) => option._id === value._id}
              />
            </Box>
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            gap: "20px",
            mb: 2
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
            Product Title
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
            <ProductTitleEditor
              formData={formData}
              setInputErrors={setInputErrors}
              setFormData={setFormData}
            />
            {inputErrors.productTitle && (
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "#FF3D57"
                }}
              >
                {inputErrors.productTitle}
              </Typography>
            )}
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
            Sub category
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
              {/* <TextField
                select
                sx={{
                  "& .MuiInputBase-root": {
                    height: "40px"
                  },
                  "& .MuiFormLabel-root": {
                    top: "-7px"
                  }
                }}
                error={inputErrors.subCategory && true}
                helperText={inputErrors.subCategory}
                onBlur={() => {
                  if (!formData.subCategory) {
                    setInputErrors((prv) => ({ ...prv, subCategory: "Product Titlte Required" }));
                  }
                }}
                id="demo-simple-select"
                value={formData.subCategory}
                label="Sub category"
                onChange={(e) => {
                  setInputErrors((prv) => ({ ...prv, subCategory: "" }));
                  setFormData((prv) => ({ ...prv, subCategory: e.target.value }));
                }}
              >
                {allCategory?.map((cat) => {
                  return <MenuItem value={cat._id}>{cat.title}</MenuItem>;
                })}
              </TextField> */}

              <Autocomplete
                id="single-select-cory"
                options={allCategory}
                getOptionLabel={(option) => option.title}
                renderInput={(params) => {
                  return (
                    <TextField
                      {...params}
                      label="Select Category"
                      placeholder="Select Category"
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "40px",
                          padding: "0 11px"
                        },
                        "& .MuiFormLabel-root": {
                          top: "-7px"
                        }
                      }}
                      error={inputErrors.subCategory && true}
                      helperText={inputErrors.subCategory}
                    />
                  );
                }}
                sx={{ width: "100%" }}
                onChange={(e, newValue) => {
                  setInputErrors((prv) => ({ ...prv, subCategory: "" }));
                  // Store _id of the selected category, handle null value if cleared
                  setFormData((prv) => ({
                    ...prv,
                    subCategory: newValue ? newValue._id : ""
                  }));
                }}
                onBlur={() => {
                  if (!formData.subCategory) {
                    setInputErrors((prv) => ({ ...prv, subCategory: " Category is Required" }));
                  }
                }}
                value={allCategory.find((item) => item._id === formData.subCategory) || null}
                isOptionEqualToValue={(option, value) => option._id === value._id}
              />
            </FormControl>
          </Box>
        </Box>

        {/* <Box
          sx={{
            marginTop: "22px",
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
            Variations
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
              *
            </span>
            :
          </Box>
          <Box width={"100%"}>
            <Autocomplete
              multiple
              limitTags={4}
              onBlur={() => {
                if (formData.variations.length === 0) {
                  setInputErrors((prv) => ({ ...prv, variations: "Please Select Variation" }));
                }
              }}
              id="multiple-limit-tags"
              options={varintList}
              getOptionLabel={(option) => option.variant_name}
              renderInput={(params) => {
                return <TextField {...params} label="Variant" placeholder="Select Variant" />;
              }}
              sx={{ width: "100%" }}
              onChange={varintHandler}
              defaultValue={formData.variantData || []}
              name="variations"
              isOptionEqualToValue={(option, value) => option._id === value._id}
            />
            {inputErrors.variations && (
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "#FF3D57",
                  marginLeft: "14px",
                  marginRight: "14px",
                  marginTop: "3px"
                }}
              >
                {inputErrors.variations}
              </Typography>
            )}
          </Box>
        </Box> */}
        <Box
          sx={{
            display: "flex",
            gap: "20px",
            marginTop: "20px"
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
              textAlign: "center",
              gap: "3px"
            }}
          >
            Brand Name <HelpOutlineIcon sx={{ width: "15px" }} />:
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%"
            }}
          >
            <FormControl fullWidth>
              {/* <TextField
                select
                sx={{
                  "& .MuiInputBase-root": {
                    height: "40px"
                  },
                  "& .MuiFormLabel-root": {
                    top: "-7px"
                  }
                }}
                label={"Brand"}
                labelId="pib"
                id="pibb"
                value={formData.brandName}
                name="brandName"
                onChange={(e) => formDataHandler(e)}
                InputProps={{
                  endAdornment: formData.brandName ? (
                    <InputAdornment position="end" sx={{ mr: 3 }}>
                      <IconButton
                        onClick={() =>
                          formDataHandler({ target: { name: "brandName", value: "" } })
                        }
                        edge="end"
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }}
              >
                {brandlist?.map((brand) => (
                  <MenuItem key={brand._id} value={brand._id}>
                    {brand.title}
                  </MenuItem>
                ))}
              </TextField> */}

              <Autocomplete
                id="single-select-country"
                options={brandlist}
                getOptionLabel={(option) => option.title}
                renderInput={(params) => {
                  return (
                    <TextField
                      {...params}
                      label="Select Brand"
                      placeholder="Select Brand"
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "40px",
                          padding: "0 11px"
                        },
                        "& .MuiFormLabel-root": {
                          top: "-7px"
                        }
                      }}
                    />
                  );
                }}
                sx={{ width: "100%" }}
                onChange={(e, newValue) => {
                  setFormData((prv) => ({
                    ...prv,
                    brandName: newValue ? newValue._id : ""
                  }));
                }}
                value={brandlist.find((item) => item._id === formData.brandName) || null}
                isOptionEqualToValue={(option, value) => option._id === value._id}
              />
            </FormControl>
          </Box>
        </Box>

        {/* <Box
          sx={{
            display: "flex",
            gap: "20px",
            marginTop: "20px"
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
              textAlign: "center",
              display: "flex",
              gap: "3px"
            }}
          >
            Brand Name <HelpOutlineIcon sx={{ width: "15px" }} />:
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%"
            }}
          >
            <FormControl fullWidth>
              <TextField
                select
                label={"Brand"}
                labelId="pib"
                id="pibb"
                value={formData.brandName}
                name="brandName"
                onChange={(e) => {
                  formDataHandler(e);
                }}
              >
                {brandlist?.map((brand) => {
                  return (
                    <MenuItem key={brand._id} value={brand._id}>
                      {brand.title}
                    </MenuItem>
                  );
                })}
              </TextField>
            </FormControl>
          </Box>
        </Box> */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end"
          }}
        >
          {/* <div>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#d32f2f"
              }}
            >
              Cancel
            </Button>
          </div> */}
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
            <Button
              // disabled={
              //   formData.productTitle &&
              //   formData.subCategory &&
              //   formData.variations.length > 0 &&
              //   formData.brandName
              //     ? false
              //     : true
              // }
              onClick={() => {
                // if (!formData.productTitle) {
                //   setInputErrors((prv) => ({ ...prv, productTitle: "Product Titlte Required" }));
                // }
                // if (!formData.subCategory) {
                //   setInputErrors((prv) => ({ ...prv, subCategory: "SubCategory Titlte Required" }));
                // }
                // // if (formData.variations.length === 0) {
                // //   setInputErrors((prv) => ({ ...prv, variations: "SubCategory Titlte Required" }));
                // // }
                // if (!formData.brandName) {
                //   setInputErrors((prv) => ({ ...prv, brandname: "SubCategory Titlte Required" }));
                // }
                // if (designation_id === "2" && !formData.vendor) {
                //   setInputErrors((prv) => ({ ...prv, vendor: "Vendor is Required" }));
                // }

                // if (
                //   formData.productTitle &&
                //   formData.subCategory
                //   // formData.variations.length > 0
                // ) {
                // }
                setTabsValue((prv) => prv + 1);
              }}
              variant="contained"
            >
              Next
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
              ""
            )}
          </Box>
        </Box>
      </Box>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </>
  );
};

export default ProductIdentity;
