import React, { useState, useEffect } from "react";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  TextField,
  Button,
  Stack,
  Box,
  MenuItem,
  Container as MuiContainer,
  InputAdornment,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  IconButton,
  FormControl,
  Paper,
  Divider
} from "@mui/material";
import Typography from "@mui/material/Typography";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "@emotion/styled";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Dropdown, DropdownMenuItem, DropdownNestedMenuItem } from "./DropDown";
import ArrowRight from "@mui/icons-material/ArrowRight";

// import { Dropdown, DropdownMenuItem, DropdownNestedMenuItem } from "./DropDown";

import PropTypes from "prop-types";
import CloseIcon from "@mui/icons-material/Close";

import { autocompleteClasses } from "@mui/material/Autocomplete";
import { TextRotateVerticalRounded } from "@mui/icons-material";
import { useCallback } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import ConfirmModal from "app/components/ConfirmModal";
import AppsIcon from "@mui/icons-material/Apps";

function Tag(props) {
  const { label, onDelete, ...other } = props;
  return (
    <div {...other}>
      <span>{label}</span>
      <CloseIcon onClick={onDelete} />
    </div>
  );
}

Tag.propTypes = {
  label: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired
};

const theme = createTheme();

const StyledContainer = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
  }
}));

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  description: Yup.string().required("Description is required"),
  metaTitle: Yup.string().required("Meta Title is required"),
  metaKeywords: Yup.string().required("Meta Keywords is required"),
  metaDescription: Yup.string().required("Meta Description is required")
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const Add = () => {
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [formValues, setFormValues] = useState({
    parent_id: "",
    title: "",
    tags: [],
    tags_id: [],
    restrictedTags:[],
    catName: "",
    catId: "",
    productsMatch: "",
    equalTo: "",
    value: ""
  });
  console.log({formValues},"fghntntntjnt")

  const [errors, setErrors] = useState({
    title: "",
    images: "",
    tags: "",
    restrictedTags:"",
    catName: "",
    productsMatch: "",
    equalTo: "",
    value: "",
    parent_id: ""
  });

  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedVariantIds, setSelectedVariantIds] = useState([]);
  const [query, setQuery] = useSearchParams();
  const queryId = query.get("id");
  const [allTags, setAllTags] = useState([]);
  const [allActiveCat, setAllActiveCat] = useState([]);
  const [getActiveAdminCategory, setAllActiveCategory] = useState([]);
  console.log({ getActiveAdminCategory });
  const [selectdVariantLable, setSelectedVarintLabel] = useState([]);
  const [topRatedUrl, setTopRatedUrl] = useState(null);
  const [render, setRander] = useState(true);
  const [SearchList, setSearchList] = useState([]);
  const [varintList, setVariantList] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState([]);
  const [SelectedEditVariant, setSelectedEditVariant] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);
  const [existingData, setExistingData] = useState(null);
  const [selectedCatLable, setSelectedCatLable] = useState("Select Category");
  console.log({selectedCatLable})
  const [parentId, setParentId] = useState(null);
  console.log({parentId})

  const logOut = () => {
    localStorage.removeItem(localStorageKey.auth_key);
    localStorage.removeItem(localStorageKey.designation_id);
    localStorage.removeItem(localStorageKey.vendorId);
    setRoute(ROUTE_CONSTANT.login);
  };

  console.log({ formValues });
  console.log({ image });
  console.log({ imgUrl });
  console.log({ formValues });
  console.log({ allActiveCat });
  console.log("queryIdqueryId", queryId);

  const getAllActiveCategory = async () => {
    try {
      const res = await ApiService.get(apiEndpoints.getActiveAdminCategory, auth_key);
      if (res?.status === 200) {
        setAllActiveCategory([{ subs: res?.data?.data }]);
        setRander(false);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  const getVaraintList = async () => {
    const typeParam = "type=Category";
    const urlWithParam = `${apiEndpoints.getVariant}?${typeParam}`;
    // console.log("urlWithParamurlWithParam", urlWithParam);
    try {
      const res = await ApiService.get(urlWithParam, auth_key);
      console.log("resresres", res);
      if (res.status === 200) {
        setVariantList(res?.data?.variant);
        setSearchList(res?.data?.variant);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  useEffect(() => {
    getAllActiveCategory();
    getVaraintList();
  }, []);

  function returnJSX(subItems) {
    if (!subItems?.length) {
      return [];
    }
    let content = subItems.map((items) => {
      if (!items?.subs?.length) {
        return (
          <DropdownMenuItem
            onClick={() => {
              setParentId(items?._id);
              setSelectedCatLable(items.title);
              getParentCategory(items?._id);
            }}
          >
            {items?.title}
          </DropdownMenuItem>
        );
      } else {
        return (
          <DropdownNestedMenuItem
            onClick={() => {
              setParentId(items?._id);
              setSelectedCatLable(items?.title);
              setSelectedVarintLabel([]);
              setSelectedVariant([]);
              setSelectedVariantIds([]);
              getParentCategory(items?._id);
            }}
            label={items?.title}
            menu={returnJSX(items?.subs || []) || []}
            rightIcon={<ArrowRight />}
          />
        );
      }
    });
    return content || [];
  }

  const getParentCategory = async (id) => {
    try {
      console.log("djslkjfjsdklfjd");
      const res = await ApiService.get(apiEndpoints.getParentAdminCatgory, auth_key);

      if (res.status === 200) {
        const findSubCatgory = res?.data?.data.find((cat) => cat._id === id);
        console.log({ findSubCatgory }, "hello");
        setSelectedCatLable(findSubCatgory?.title);
      }
    } catch (error) {
      console.log(error);
    }
  };

  function findObjectByTitle(data, title) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].title === title) {
        return data[i];
      }
      if (data[i].subs && data[i].subs.length > 0) {
        const result = findObjectByTitle(data[i].subs, title);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  useEffect(() => {
    const obj = findObjectByTitle(getActiveAdminCategory, selectedCatLable);
  }, [selectedCatLable]);

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
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prv) => ({ ...prv, [name]: "" }));
  };

  const handleTagHandler = (event, value) => {
    setFormValues((prv) => ({ ...prv, tags_id: value.map((option) => option?._id) }));
    setFormValues((prv) => ({ ...prv, tags: value }));
    setErrors((prv) => ({ ...prv, tags: "" }));
  };

  const handleCatChange = (event, value) => {
    if (value?.length <= 1) {
      setFormValues((prv) => ({ ...prv, catId: value?.map((option) => option?._id) }));
      setFormValues((prv) => ({ ...prv, catName: value }));
      setErrors((prv) => ({ ...prv, catName: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!formValues.title) newErrors.title = "Title is required";
    if (!imgUrl) newErrors.images = "Image is required";
    if (formValues.tags?.length <= 0) newErrors.tags = "Tags is required";
    // if (!formValues.productsMatch) newErrors.productsMatch = "Products match is required";
    // if (!formValues.equalTo) newErrors.equalTo = "Equal To is required";
    // if (!formValues.value) newErrors.value = "Value is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);
        const payload = {
          parent_id: parentId,
          _id: queryId ? queryId : "new",
          title: formValues?.title,
          tag: formValues?.tags,
          parent_id: parentId,
          productsMatch: formValues?.productsMatch,
          equalTo: formValues?.equalTo,
          value: formValues?.value,
          restricted_keywords: formValues?.restrictedTags || []
        };
        const res = await ApiService.post(apiEndpoints.addAdminCategory, payload, auth_key);
        console.log(res);
        if (res.status === 200) {
          // setFormValues({
          //   title: "",
          //   tags: [],
          //   tags_id: [],
          //   catName: "",
          //   catId: ""
          // });
          // setImage(null);
          // toast.success(res?.data?.message);
          if (image) {
            handleUploadImg(res?.data?.adminCategory?._id);
          }
          // navigate(ROUTE_CONSTANT.catalog.adminCategory.list);
          // if (!queryId) {
            setRoute(ROUTE_CONSTANT.catalog.adminCategory.list);
          // }
          handleOpen("success", res?.data);
        }
      } catch (error) {
        setLoading(false);
        handleOpen("error", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUploadImg = async (id) => {
    try {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("_id", id);
      const res = await ApiService.postImage(apiEndpoints.addAdminCategoryImg, formData, auth_key);
      if (res?.status === 200) {
        console.log(res);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  const getTagList = useCallback(async () => {
    try {
      let url = `${apiEndpoints.getAllSearchTerms}`;

      const res = await ApiService.get(url, auth_key);
      if (res.status === 200) {
        // const myNewList = res?.data?.data.map((e, i) => {
        //   return { "S.No": i + 1, ...e };
        // });
        setAllTags(res?.data?.data);
        // setSearchList(myNewList);

        // const xData = myNewList.map((e, i) => {
        //   let obj = {
        //     "S.NO": i + 1,
        //     title: e.title,
        //     status: e.status ? "Active" : "In Active"
        //   };
        //   return obj;
        // });
      }
    } catch (error) {
      handleOpen("error", error);
    }
  }, [auth_key]);

  const getActiveCategory = useCallback(async () => {
    try {
      let url = `${apiEndpoints.getActiveAdminCategory}`;
      const res = await ApiService.get(url, auth_key);
      console.log(res.data.data, "fjdjlfdskl");
      if (res.status === 200) {
        const myNewList = res?.data?.data.map((e, i) => {
          return { "S.No": i + 1, ...e };
        });
        console.log(myNewList, "myNewList");
        setAllActiveCat(myNewList);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  }, [auth_key]);

  useEffect(() => {
    getTagList();
    getActiveCategory();
  }, []);

  const getCategory = async () => {
    try {
      console.log("queryIdfggggggggggggggggggg", queryId);
      const res = await ApiService.get(`${apiEndpoints.getAdminCategoryById}/${queryId}`, auth_key);
      console.log({res}, "hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
      if (res?.status === 200) {
        if(res?.data?.data?.parent_id?._id){
          setParentId(res.data.data.parent_id._id);
        }
        const resData = res?.data?.data;
        console.log({resData})
        setFormValues((prev) => ({
          ...prev,
          title: resData?.title,
          tags: resData?.tag,
          restrictedTags:resData?.restricted_keywords || [],
          catName: resData?.parent_id?._id,
          catId: resData?._id,
          parent_id: resData?.parent_id?._id,
          productsMatch: resData?.productsMatch,
          equalTo: resData?.equalTo,
          value: resData?.value,
        }));
        setImgUrl(resData?.image);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  useEffect(() => {
    if (queryId) {
      getCategory();
    } else {
      setFormValues({
        title: "",
        tags: [],
        tags_id: [],
        restrictedTags:[],
        catName: "",
        catId: "",
        productsMatch: "",
        equalTo: "",
        value: "",
        parent_id: ""
      });
      setImage(null);
      setImgUrl(null);
    }
  }, [queryId]);

  useEffect(() => {
    if (parentId) {
      // Check if parentId has a valid value
      console.log("this is working");
      console.log("parentssaId", parentId);
      getCateLabel();
    }
  }, [parentId]);
  console.log(parentId, "parentIdparentIdparentId");
  const getCateLabel = async () => {
    try {
      console.log(parentId, "helllofjsdkl");
      if (parentId) {
        const res = await ApiService.get(apiEndpoints.getParentAdminCatgory, auth_key);
        console.log({ res }, "fidsjkkl");

        if (res.status === 200) {
          const find = res?.data?.data.find((item) => item._id === parentId);
          console.log({ find }, "fdjskfjdkljfsdljfkljsdkljflksdjlfkjsdl");
          if (find?.title) {
            setSelectedCatLable(find.title);
          } else {
            setSelectedCatLable("Select Category");
          }
        } else {
          setSelectedCatLable("Select Category");
        }
      } else {
        setSelectedCatLable("Select Category");
      }
    } catch (error) {
      handleOpen("error", error);
      setSelectedCatLable("Select Category");
    }
  };

  const handleRestritedTagHandler = (event, newValue) => {
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
          restrictedTags: [...new Set(processedValues)], // Remove duplicates
      }));
  };
  return (
    <ThemeProvider theme={theme}>
      <MuiContainer>
        <StyledContainer>
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
                onClick={() => navigate(ROUTE_CONSTANT.catalog.adminCategory.list)}
                startIcon={<AppsIcon />}
                variant="contained"
              >
                Admin Category List
              </Button>
            </Box>
          </Box>
          <h2>{queryId ? "Edit Admin Category" : "Add Admin Category"}</h2>
          <form>
            {allActiveCat.length >= 0 && (
              <Box sx={{ minWidth: "50%" }}>
                {getActiveAdminCategory.length === 0 ? (
                  <Stack sx={{ position: "relative" }}>
                    <TextField
                      sx={{
                        bgcolor: "#F0F0F0",
                        cursor: "pointer",
                        outline: "none",
                        height: "40px"
                      }}
                      readOnly
                      value={selectedCatLable}
                    />
                    <ArrowDropDownIcon
                      sx={{
                        position: "absolute",
                        right: "10px",
                        top: "28%",
                        width: "20px",
                        height: "20px"
                      }}
                    />
                  </Stack>
                ) : (
                  getActiveAdminCategory?.map((item) => {
                    return (
                      <Dropdown
                        trigger={
                          <Stack sx={{ position: "relative" }}>
                            <TextField
                              sx={{
                                bgcolor: "#F0F0F0",
                                cursor: "pointer",
                                height: "40px",
                                outline: "none",
                                "& .MuiInputBase-root": { height: "40px" }
                              }}
                              readOnly
                              value={selectedCatLable}
                            />

                            <ArrowDropDownIcon
                              sx={{
                                position: "absolute",
                                right: "10px",
                                top: "28%",
                                width: "20px",
                                height: "20px"
                              }}
                            />
                          </Stack>
                        }
                        menu={returnJSX(item?.subs || []) || []}
                      />
                    );
                  })
                )}
                {/* 
              <span style={{ color: "red" }}>
                <ErrorMessage name="category" component="div" />
              </span> */}
              </Box>
            )}
            <Stack spacing={2} direction="row" sx={{ marginBottom: 2, marginTop: 2 }}>
              <TextField
                error={errors.title && true}
                helperText={errors.title}
                onBlur={() => {
                  if (!formValues.title) {
                    setErrors((prv) => ({ ...prv, title: "Title is Required" }));
                  }
                }}
                type="text"
                variant="outlined"
                color="primary"
                label="Title"
                fullWidth
                name="title"
                placeholder="Title"
                onChange={handleChange}
                value={formValues?.title}
                sx={{
                  "& .MuiInputBase-root": {
                    height: "40px"
                  },
                  "& .MuiFormLabel-root": {
                    top: "-7px"
                  }
                }}
              />
            </Stack>
            <Box marginBottom={2}>
              <Autocomplete
                multiple
                limitTags={4}
                id="multiple-limit-tags"
                options={allTags}
                getOptionLabel={(option) => option}
                renderInput={(params) => {
                  return (
                    <TextField
                      {...params}
                      label="Tag "
                      placeholder="Select Tag "
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
                onChange={handleTagHandler}
                onBlur={() => {
                  if (formValues.tags.length <= 0) {
                    setErrors((prv) => ({ ...prv, tags: "Tags is Required" }));
                  }
                }}
                value={formValues?.tags}
                defaultValue={formValues?.tags.length > 0 ? formValues?.tags : []}
                name="tags"
                isOptionEqualToValue={(option, value) => option === value}
              />
              {errors.tags && (
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#FF3D57",
                    marginLeft: "14px",
                    marginRight: "14px",
                    marginTop: "3px"
                  }}
                >
                  {errors.tags}
                </Typography>
              )}
            </Box>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    marginBottom: "20px",
                    gap: "20px",
                }}
            >
                 {/* <Box
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
                        Restricted Keywords{" "}
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
                </Box> */}
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
                            label="Enter Restricted Keywords ..."
                            placeholder="Enter Restricted Keywords ..."
                            sx={{
                                "& .MuiInputBase-root": {
                                    padding: "0 11px",
                                },
                                "& .MuiFormLabel-root": {
                                    top: "-7px",
                                },
                            }}
                            // error={Boolean(errors?.restrictedTags)}
                            // helperText={errors?.restrictedTags || ""}
                        />
                    )}
                    sx={{ width: "100%" }}
                    onChange={handleRestritedTagHandler}
                    // onBlur={() => {
                    //     if (
                    //         formValues.restrictedTags.length === 0
                    //     ) {
                    //         setErrors((prv) => ({
                    //             ...prv,
                    //             restrictedTags: "Restricted keywords are required",
                    //         }));
                    //     } else {
                    //         setErrors((prv) => ({
                    //             ...prv,
                    //             restrictedTags: "",
                    //         }));
                    //     }
                    // }}
                    value={formValues.restrictedTags}
                    isOptionEqualToValue={(option, value) => option === value}
                />
            </Box>
            <Stack direction="row" spacing={2} sx={{ marginBottom: 2 }}>
              <FormControl fullWidth>
                <TextField
                  error={Boolean(errors.productsMatch)}
                  helperText={errors.productsMatch}
                  select
                  sx={{
                    "& .MuiInputBase-root": { height: "40px" },
                    "& .MuiFormLabel-root": { top: "-7px" }
                  }}
                  label="Select Products Match"
                  labelId="productsMatch-label"
                  id="productsMatch"
                  value={formValues?.productsMatch}
                  name="productsMatch"
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: formValues?.productsMatch ? (
                      <InputAdornment position="end" sx={{ mr: 3 }}>
                        <IconButton
                          onClick={() => {
                            handleChange({ target: { name: "productsMatch", value: "" } });
                            // setErrors((prv) => ({ ...prv, productsMatch: "Products match is required" }));
                          }}
                          edge="end"
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }}
                >
                  <MenuItem value="Product Title">Product Title</MenuItem>
                  <MenuItem value="Product Tag">Product Tag</MenuItem>
                </TextField>
              </FormControl>
              <FormControl fullWidth>
                <TextField
                  error={Boolean(errors.equalTo)}
                  helperText={errors.equalTo}
                  select
                  sx={{
                    "& .MuiInputBase-root": { height: "40px" },
                    "& .MuiFormLabel-root": { top: "-7px" }
                  }}
                  label="Select Equal To"
                  labelId="equalTo-label"
                  id="equalTo"
                  value={formValues?.equalTo}
                  name="equalTo"
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: formValues?.equalTo ? (
                      <InputAdornment position="end" sx={{ mr: 3 }}>
                        <IconButton
                          onClick={() => {
                            handleChange({ target: { name: "equalTo", value: "" } });
                            // setErrors((prv) => ({ ...prv, equalTo: "Equal To is required" }));
                          }}
                          edge="end"
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }}
                >
                  <MenuItem value="is equal to">is equal to</MenuItem>
                  <MenuItem value="is not equal to">is not equal to</MenuItem>
                </TextField>
              </FormControl>
              <TextField
                error={Boolean(errors.value)}
                helperText={errors.value}
                // onBlur={() => {
                //   if (!formValues.value) {
                //     setErrors((prv) => ({ ...prv, value: "Value is Required" }));
                //   }
                // }}
                type="text"
                variant="outlined"
                color="primary"
                label="Value"
                fullWidth
                name="value"
                placeholder="Value"
                onChange={handleChange}
                value={formValues?.value}
                sx={{
                  "& .MuiInputBase-root": { height: "40px" },
                  "& .MuiFormLabel-root": { top: "-7px" }
                }}
              />
            </Stack>

            <Box marginBottom={2}>
              <TextField
                sx={{
                  "& .MuiInputBase-root": {
                    height: "40px"
                  },
                  "& .MuiFormLabel-root": {
                    top: "-7px"
                  }
                }}
                fullWidth
                value={image?.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachFileIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      id="file-input"
                      onChange={(event) => {
                        //   handleImageSelect(event);
                        handleImageChange(event);
                      }}
                    />
                  ),
                  readOnly: true
                }}
                placeholder="Select file"
                onClick={() => document.getElementById("file-input").click()}
              />
              {errors.images && (
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#FF3D57",
                    marginLeft: "14px",
                    marginRight: "14px",
                    marginTop: "3px"
                  }}
                >
                  {errors.images}
                </Typography>
              )}
            </Box>

            {imgUrl && <img style={{ marginBottom: "35px" }} src={imgUrl} width={200} alt="" />}

            <Button
              endIcon={loading ? <CircularProgress size={15} /> : ""}
              disabled={loading ? true : false}
              sx={{ mr: "16px" }}
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </form>
        </StyledContainer>
      </MuiContainer>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </ThemeProvider>
  );
};

export default Add;
