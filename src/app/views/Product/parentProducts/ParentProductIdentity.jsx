import * as React from "react";
import FormControl from "@mui/material/FormControl";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography
} from "@mui/material";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import MyImageGrid from "../Demo";
import { toast } from "react-toastify";
import { TextField } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import CloseIcon from "@mui/icons-material/Close";
import { combinedMaterials, unitValueOptions } from "app/data/Index";
import { v4 as uuidv4 } from "uuid";
import CircularProgress from "@mui/material/CircularProgress";
// import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  DropdownNestedMenuItem,
  Dropdown,
  DropdownMenuItem
} from "app/views/Catalog/Category/DropDown";
import { ArrowRight, SingleBed } from "@mui/icons-material";
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ProductParentTable from "app/components/ProductListTable/ProductParentTable";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { useEffect } from "react";
import { useState } from "react";
import dayjs from "dayjs";
import ConfirmModal from "app/components/ConfirmModal";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const ParentProductIdentity = ({ productId }) => {
  const [formData, setFormData] = React.useState({
    productTitle: "",
    description: "",
    subCategory: "",
    sellerSku:"",
    Innervariations: {},
    variantData: [],
    variant_id: [],
    variant_name: [],
    images: []
  });

  console.log("formDataformData", formData);
  const [inputFields, setInputFields] = React.useState([
    { id: 1, attributeValue: "", sortOrder: "", status: false }
  ]);
  const [value, setValue] = React.useState("female");
  const [selectedBrand, setSelectedBand] = React.useState("");
  const [brandlist, setBrandList] = React.useState([]);
  const [allCategory, setAllCategory] = React.useState([]);
  const [selectedCatLable, setSelectedCatLable] = React.useState("Select Category");
  const [showVariant, setShowVariant] = React.useState(false);
  const [varintList, setVariantList] = React.useState([]);
  const [varientAttribute, setVarientAttribute] = React.useState([]);
  const [images, setImages] = React.useState(formData.images);
  const [isCoponentLoader, setIsconponentLoader] = useState(false);
  const [issubmitLoader, setIsSubmitLoader] = useState(false);

  const [variantArrValues, setVariantArrValue] = useState([
    {
      _id: "",
      product_id:"",
      sale_price: "",
      price: "",
      sale_start_date: "",
      sale_end_date: "",
      qty: ""
    }
  ]);

  console.log("sssssssssssssstest", { issubmitLoader });

  const [inputErrors, setInputErrors] = React.useState({
    productTitle: "",
    variations: "",
    brandname: "",
    subCategory: "",
    description: "",
    sellerSku:"",
    innervariation: "",
    parentImage: ""
  });

  const auth_key = localStorage.getItem(localStorageKey.auth_key);

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
      const urlWithParam = `${apiEndpoints.getAllActiveVarient}?${typeParam}`;
      const res = await ApiService.get(urlWithParam, auth_key);
      // console.log("resresresres", res);
      if (res.status === 200) {
        setVariantList(res?.data?.parent);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  React.useEffect(() => {
    getBrandList();
    getVaraintList();
    getChildCategory();
  }, []);

  React.useEffect(() => {
    if (Object.keys(formData.Innervariations).length > 0) {
      let arr = [];
      for (let i = 0; i < formData.variant_name.length; i++) {
        // setVarientAttribute((prv) => [...prv, formData.Innervariations[formData.variant_name[i]]]);

        // console.log("hhhhhhhhhhhhhhhhh", formData.Innervariations[formData.variant_name[i]]);
        let data = formData.Innervariations[formData.variant_name[i]];

        // console.log(data, "datatttttttttt");
        const newarrrr = formData.Innervariations[formData.variant_name[i]]?.map((item) => {
          return item._id;
        });

        if (!newarrrr) {
          return;
        }
        // console.log("newarrrrnewarrrrnewarrrrnewarrrr", newarrrr);sss
        arr.push(newarrrr);
      }

      const myarr = arr.flat();
      // console.log("ddddfsdfdssdfdsdfdfdfsdfffdsfdsf", myarr);
      setVarientAttribute(myarr);
    }
  }, [formData.variant_name, formData.Innervariations]);

  const varintHandler = (event, value) => {
    setFormData((prev) => ({
      ...prev,
      variantData: value
    }));
    setFormData((prev) => ({
      ...prev,
      variant_id: value.map((option) => option.id)
    }));
    setFormData((prev) => ({
      ...prev,
      variant_name: value.map((option) => option.variant_name)
    }));
    setInputErrors((prev) => ({ ...prev, variations: "" }));
  };
  const InnervariationsHandle = (variantId) => (event, value) => {
    setFormData((prev) => ({
      ...prev,
      Innervariations: {
        ...prev.Innervariations,
        [variantId]: value
      }
    }));
    setInputErrors((prev) => ({ ...prev, innervariation: "" }));
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

  const { Innervariations } = formData;
  let combinations = [];
  // Extract all variation arrays
  const variationKeys = Object.keys(Innervariations);
  const variations = variationKeys.map((key) => Innervariations[key]);

  // Create combinations
  function combine(attributes, index, currentCombination) {
    if (index === attributes.length) {
      combinations.push({ ...currentCombination });
      return;
    }

    attributes[index].forEach((attribute) => {
      const key = `key${index + 1}`;

      currentCombination[key] = {
        value: attribute.attribute_value,
        _id: attribute._id
      };
      combine(attributes, index + 1, currentCombination);
    });
  }

  console.log(formData.Innervariations, "gejjjjjjjjehhhhhhhhhehhhhhhh");

  combine(variations, 0, {});
  const [sellerSky, setSellerSku] = React.useState([]);
  const [parentId, setParentId] = useState("");
  const [imgName, setImgName] = useState();
  console.log("aaaaaaaaaasellerSky", sellerSky);

  const paramCombinations = combinations.map((variation, index) => {
    const comb = Object.keys(variation)
      .map((key) => variation[key]._id)
      .join(",");
    return {
      comb: comb,
      sku_code: sellerSky[index] ? `${sellerSky[index]}` : ""
    };
  });
  //end combination end
  console.log({ formData });
  console.log("paramCombinations---", combinations);
  console.log("varientAttribute---", varientAttribute);

  const navigate = useNavigate();

  const parentsubmitHandle = async () => {
    if (!formData.productTitle) {
      setInputErrors((prv) => ({ ...prv, productTitle: "Product Title is Required" }));
    }
    if (!formData.description) {
      setInputErrors((prv) => ({ ...prv, description: "Description is Required" }));
    }
    // if (!formData.subCategory) {
    //   setInputErrors((prv) => ({ ...prv, subCategory: "subCategory is Required" }));
    // }
    if (!formData.sellerSku) {
      setInputErrors((prv) => ({ ...prv, sellerSku: "Seller Sku is Required" }));
    }
    if (formData.variantData.length === 0) {
      setInputErrors((prv) => ({ ...prv, variations: " Please Select At least one Variant" }));
    }
    if (Object.keys(formData.Innervariations).length == 0) {
      setInputErrors((prv) => ({
        ...prv,
        innervariation: " Please Select At least one Innervariations Variant"
      }));
    }
    if (images.length === 0) {
      setInputErrors((prv) => ({ ...prv, parentImage: " Images Is Required" }));
    }

    if (
      formData.productTitle &&
      formData.description &&
      // formData.subCategory &&
      formData.variantData &&
      formData.sellerSku &&
      Object.keys(formData.Innervariations).length > 0
    ) {
      const combine = variantArrValues.map((obj, i) => {
        return { ...obj, ...paramCombinations[i] };
      });

      const param = {
        _id: productId ? productId : "new",
        product_title: formData.productTitle,
        description: formData.description,
        seller_sku:formData.sellerSku,
        variant_id: formData.variant_id,
        variant_attribute_id: varientAttribute,
        combinations: combine,
        sub_category: formData?.subCategory || "",
        sku: sellerSky
      };

      console.log({ combine });

      function validateProductArray(combine) {
        return combine.every((product) => {
          return (
            // product.price &&
            product.sale_price &&
            // product.sale_start_date &&
            // product.sale_end_date &&
            product.qty &&
            product.comb &&
            product.sku_code
          );
        });
      }

      const check = validateProductArray(combine);

      if (!check) {
        toast.error("All Fields Are Mandatory");
        return;
      }

      try {
        setIsSubmitLoader(true);
        const urlWithParam = `${apiEndpoints.AddParentProduct}`;
        const ImagesurlWithParam = `${apiEndpoints.ParentImagesAddParentProduct}`;
        const res = await ApiService.post(urlWithParam, param, auth_key);
        console.log("resresresres", res);
        if (res.status === 200) {
          if (images?.[0]?.file) {
            const formData = new FormData();
            formData.append("_id", parentId ? parentId : res?.data?.parent_product._id);
            formData.append(
              "file",
              productId
                ? images?.[0]?.file
                  ? images?.[0]?.file
                  : images?.[0]?.src
                : images?.[0]?.file
            );
            const Imagesres = await ApiService.postImage(ImagesurlWithParam, formData, auth_key);
            console.log("ImagesresImagesres", Imagesres);
          }
          // setVariantList(res?.data?.parent_product);
          setFormData({
            productTitle: "",
            description: "",
            subCategory: "",
            sellerSku:"",
            Innervariations: {},
            variantData: [],
            variant_id: [],
            variant_name: [],
            images: []
          });
          // navigate(ROUTE_CONSTANT.catalog.product.list);
          setRoute(ROUTE_CONSTANT.catalog.product.list);
          handleOpen("success", res?.data);
        }
      } catch (error) {
        setIsSubmitLoader(false);
        console.log("errorerrorerrorerror", error);
        // handleOpen("error", error);
      } finally {
        setIsSubmitLoader(false);
      }
    }
  };
  const inputFileRef = React.useRef(null);

  const handleButtonClick = () => {
    inputFileRef.current.click();
  };

  const handleImageChange = (e) => {
    const fileList = Array.from(e.target.files);

    if (fileList.length + images.length > 1) {
      toast.error("Only one image can be uploaded");
      return;
    }

    const imageUrls = fileList.map((file) => ({
      src: URL.createObjectURL(file),
      id: images.length,
      file: file,
      _id: uuidv4()
    }));

    setImages(imageUrls);
  };

  // const parentsubmitHandle = async () => {
  //   alert("hiji");
  // };

  const getParentProductDetail = async () => {
    try {
      const res = await ApiService.get(
        `${apiEndpoints.getParentProductDetail}/${productId}`,
        auth_key
      );
      if (res?.status === 200) {
        const resData = res?.data?.data;
        setImgName(resData?.image);
        setFormData((prev) => ({
          ...prev,
          productTitle: resData?.product_title,
          description: resData?.description,
          sellerSku:resData?.seller_sku,
          images: [{ src: `${res?.data?.base_url}${resData?.image}` }],
          // images: [resData?.image],
          variant_id: resData?.variant_id?.map((option) => option?._id),
          variant_name: resData?.variant_id?.map((option) => option?.variant_name),
          subCategory: resData?.sub_category
        }));

        setParentId(resData?._id);
        setVarientAttribute(resData?.variant_attribute_id.map((option) => option._id));
        setSellerSku(resData?.sku);

        const arr = resData?.sku.map(async (sku, i) => {
          let url = apiEndpoints.getProductBySku + `/${sku}`;
          const res = await ApiService.get(url, auth_key);

          if (res.status === 200) {
            let obj = res.data.data;
            let sale_start_date = dayjs(obj.sale_start_date);
            let sale_end_date = dayjs(obj.sale_end_date);
            return { ...obj,_id:obj.product_id,sale_end_date, sale_start_date };
          }
        });

        Promise.all(arr).then((e) => {
          setVariantArrValue(e);
        });
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  console.log({ variantArrValues });
  useEffect(() => {
    if (productId) {
      setImages(formData?.images);
    }
  }, [formData?.images]);

  useEffect(() => {
    if (formData?.variant_id && varintList) {
      const filteredVariantData = varintList.filter((variant) =>
        formData.variant_id.includes(variant.id)
      );

      setFormData((prev) => ({
        ...prev,
        variantData: filteredVariantData
      }));
    }
  }, [formData?.variant_id, varintList]);

  useEffect(() => {
    if (varientAttribute && formData?.variantData) {
      // Create an object to store the results
      const filteredData = formData.variantData.reduce((acc, item) => {
        if (item?.variant_attribute) {
          // Filter the variant attributes
          const filteredAttributes = item.variant_attribute.filter((variant) =>
            varientAttribute.includes(variant._id)
          );

          // Only add to the result if there are filtered attributes
          if (filteredAttributes.length > 0) {
            acc[item.variant_name] = filteredAttributes;
          }
        }
        return acc;
      }, {});

      console.log("Filtered Data:", filteredData);
      setFormData((prev) => ({ ...prev, Innervariations: filteredData }));
    }
  }, [formData?.variantData]);

  useEffect(() => {
    if (productId) {
      getParentProductDetail();
    }
  }, []);
  console.log("formData?.Innervariations---", formData?.Innervariations);

  return (
    <>
      {isCoponentLoader ? (
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            justifyContent: "center"
          }}
        >
          <Stack spacing={2} direction="row" alignItems="center">
            {/* <CircularProgress size="30px" />
          <CircularProgress size={40} /> */}
            <CircularProgress size="3rem" />
          </Stack>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "10px"
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
                Product Title
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
                <TextField
                  error={inputErrors.productTitle && true}
                  helperText={inputErrors.productTitle}
                  sx={{
                    mb: 2,
                    "& .MuiInputBase-root": {
                      height: "40px"
                    },
                    "& .MuiFormLabel-root": {
                      top: "-7px"
                    }
                  }}
                  onBlur={() => {
                    if (!formData.productTitle) {
                      setInputErrors((prv) => ({
                        ...prv,
                        productTitle: "Product Title Required"
                      }));
                    }
                  }}
                  value={formData.productTitle}
                  name="productTitle"
                  onChange={(e) => {
                    formDataHandler(e);
                    setInputErrors((pre) => ({ ...pre, productTitle: "" }));
                  }}
                  fullWidth
                  label="Product Title"
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
                Description
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
                <TextField
                  error={inputErrors.description && true}
                  helperText={inputErrors.description}
                  multiline
                  name="description"
                  value={formData.description}
                  onBlur={() => {
                    if (!formData.description) {
                      setInputErrors((prv) => ({ ...prv, description: "Product Title Required" }));
                    }
                  }}
                  onChange={(e) => {
                    formDataHandler(e);
                    setInputErrors((prv) => ({ ...prv, description: "" }));
                  }}
                  rows={2}
                  sx={{
                    width: "100%",
                    mb: 2
                  }}
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
                Sub category
                {/* <span
                  style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}
                >
                  {" "}
                  *
                </span> */}
                :
              </Box>
              <Box
                sx={{
                  width: "100%"
                }}
              >
                <FormControl fullWidth>
                  <TextField
                    select
                    error={inputErrors.subCategory && true}
                    sx={{
                      "& .MuiInputBase-root": {
                        height: "40px"
                      },
                      "& .MuiFormLabel-root": {
                        top: "-7px"
                      }
                    }}
                    helperText={inputErrors.subCategory}
                    // onBlur={() => {
                    //   if (!formData.subCategory) {
                    //     setInputErrors((prv) => ({
                    //       ...prv,
                    //       subCategory: " Sub Categories Required"
                    //     }));
                    //   }
                    // }}
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
                  </TextField>
                </FormControl>
              </Box>
            </Box>
            {/*  */}
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
                <TextField
                  error={inputErrors.sellerSku && true}
                  helperText={inputErrors.sellerSku}
                  sx={{
                    mb: 2,
                    "& .MuiInputBase-root": {
                      height: "40px"
                    },
                    "& .MuiFormLabel-root": {
                      top: "-7px"
                    }
                  }}
                  onBlur={() => {
                    if (!formData.sellerSku) {
                      setInputErrors((prv) => ({
                        ...prv,
                        sellerSku: "Seller Sku Required"
                      }));
                    }
                  }}
                  value={formData.sellerSku}
                  name="sellerSku"
                  onChange={(e) => {
                    formDataHandler(e);
                    setInputErrors((pre) => ({ ...pre, sellerSku: "" }));
                  }}
                  fullWidth
                  label="Seller Sku"
                  id="fullWidth"
                />
              </Box>
            </Box>
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
                  fontWeight: "700",
                  wordBreak: "normal",
                  width: "16%",
                  textWrap: "nowrap"
                }}
              >
                images <span style={{ color: "red", fontSize: "15px" }}> *</span> :
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  gap: "5px"
                }}
              >
                <div onClick={handleButtonClick}>
                  <ControlPointIcon />
                </div>
                <div onClick={handleButtonClick}>Upload Multiple Files</div>
                <input
                  multiple
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={inputFileRef}
                  style={{ display: "none" }}
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
                  fontWeight: "700",
                  wordBreak: "normal",
                  width: "16%",
                  textWrap: "nowrap"
                }}
              >
                Upload Images:
              </Box>
              <Box sx={{ width: 400 }}>
                <MyImageGrid images={images} setImages={setImages} setFormData={setFormData} />
                {inputErrors.images && (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#FF3D57",
                      marginLeft: "14px",
                      marginRight: "14px",
                      marginTop: "45px"
                    }}
                  >
                    {inputErrors.images}
                  </Typography>
                )}
                {images.length > 0
                  ? ""
                  : inputErrors.parentImage && (
                      <Typography
                        sx={{
                          fontSize: "12px",
                          display: "block",
                          color: "#FF3D57",
                          marginLeft: "14px",
                          marginRight: "14px",
                          marginTop: "3px"
                        }}
                      >
                        {inputErrors.parentImage}
                      </Typography>
                    )}
              </Box>
            </Box>
            {/*  */}
            <Box
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
                <span
                  style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}
                >
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
                    if (formData?.variantData?.length === 0) {
                      setInputErrors((prev) => ({
                        ...prev,
                        variations: "Please Select Variation"
                      }));
                    }
                  }}
                  id="multiple-limit-tags"
                  options={varintList}
                  getOptionLabel={(option) => option?.variant_name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Variant"
                      placeholder="Select Variant"
                      sx={{
                        "& .MuiInputBase-root": {
                          // height: "40px",
                          padding: "0 11px"
                        },
                        "& .MuiFormLabel-root": {
                          top: "-7px"
                        }
                      }}
                    />
                  )}
                  sx={{ width: "100%" }}
                  onChange={varintHandler}
                  name="variantData"
                  // value={formData.variantData || []}
                  value={
                    formData.variantData.length > 0
                      ? formData.variantData
                      : formData.variant_id
                      ? varintList.filter((variant) => formData.variant_id.includes(variant.id))
                      : []
                  }
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
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
            </Box>
            <Stack gap={"16px"} sx={{ pb: 0 }}>
              {formData?.variantData?.map((inputField, index) => (
                <Stack key={inputField._id} alignItems={"center"} direction={"row"}>
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
                    {inputField?.variant_name} <HelpOutlineIcon sx={{ width: "15px" }} />:
                  </Box>

                  <Box width={"100%"} my={2} ml={3}>
                    <Autocomplete
                      multiple
                      limitTags={4}
                      onBlur={() => {
                        if (Object.keys(formData.Innervariations).length == 0) {
                          setInputErrors((prv) => ({
                            ...prv,
                            innervariation: "Please Select Ineer Variation Fields"
                          }));
                        }
                      }}
                      id="multiple-limit-tags"
                      options={inputField?.variant_attribute}
                      getOptionLabel={(option) => option.attribute_value}
                      renderInput={(params) => {
                        return (
                          <TextField
                            {...params}
                            label={inputField?.variant_name}
                            placeholder={`select ${inputField?.variant_name}`}
                            sx={{
                              "& .MuiInputBase-root": {
                                // height: "40px",
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
                      onChange={InnervariationsHandle(inputField?.variant_name)}
                      defaultValue={formData?.Innervariations || []}
                      name={inputField?.variant_name}
                      // value={formData?.Innervariations[inputField?.variant_name] || []}
                      value={
                        formData?.Innervariations.length > 0
                          ? formData?.Innervariations[inputField?.variant_name]
                          : varientAttribute
                          ? inputField?.variant_attribute?.filter((variant) =>
                              varientAttribute.includes(variant._id)
                            )
                          : []
                      }
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                    />
                    {inputErrors.innervariation && (
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "#FF3D57",
                          marginLeft: "14px",
                          marginRight: "14px",
                          marginTop: "3px"
                        }}
                      >
                        {inputErrors.innervariation}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              ))}
            </Stack>
            {Object.keys(formData?.Innervariations).length > 0 ? (
              <ProductParentTable
                variantArrValues={variantArrValues}
                setVariantArrValue={setVariantArrValue}
                combinations={combinations}
                formdataaaaa={formData.variant_name}
                sellerSky={sellerSky}
                setSellerSku={setSellerSku}
                setIsconponentLoader={setIsconponentLoader}
              />
            ) : (
              <></>
            )}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: "5px"
                }}
              >
                {/* <Button variant="contained">Save as Draft</Button> */}
                <Button
                  disabled={issubmitLoader ? true : false}
                  variant="contained"
                  onClick={parentsubmitHandle}
                >
                  Submit
                </Button>
              </Box>
            </Box>
          </Box>
        </>
      )}
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </>
  );
};

export default ParentProductIdentity;
