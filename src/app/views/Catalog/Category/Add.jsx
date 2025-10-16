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
    FormControl,
    FormLabel,
    RadioGroup,
    Radio,
    IconButton,
    Grid,
    Paper,
    Divider,
    Typography
} from "@mui/material";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "@emotion/styled";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AppsIcon from "@mui/icons-material/Apps";

import ArrowRight from "@mui/icons-material/ArrowRight";

import { Dropdown, DropdownMenuItem, DropdownNestedMenuItem } from "./DropDown";

import PropTypes from "prop-types";
import CloseIcon from "@mui/icons-material/Close";
import ClearIcon from "@mui/icons-material/Clear";

import { autocompleteClasses } from "@mui/material/Autocomplete";

import Autocomplete from "@mui/material/Autocomplete";
import { TextRotateVerticalRounded } from "@mui/icons-material";
import ConfirmModal from "app/components/ConfirmModal";

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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const Add = () => {
    const auth_key = localStorage.getItem(localStorageKey.auth_key);
    const [fileName, setFileName] = useState("");
    const [image, setImage] = useState(null);
    const [getCatData, setCatData] = useState({});
    console.log(getCatData, "f");
    const [query, setQuery] = useSearchParams();
    const [allActiveCategory, setAllActiveCategory] = useState([]);
    const [selectedCatLable, setSelectedCatLable] = useState("Select Category");
    const [selectedCatId, setSelectedCatId] = useState("");
    console.log({selectedCatId})
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [render, setRander] = useState(true);
    const [varintList, setVariantList] = useState([]);
    const [attributeList, setAttributeList] = useState([]);
    const [editCatLable, setEditCatLable] = useState("");
    const [selectdVariantLable, setSelectedVarintLabel] = useState([]);
    const [endCatName, setEndCatName] = useState("");
    const [topRatedImg, setTopRatedImg] = useState(null);
    const [topRatedUrl, setTopRatedUrl] = useState(null);
    console.log("selectedCatLable------", selectedCatLable);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Name is required"),
        description: Yup.string().required("Description is required"),
        metaTitle: Yup.string().required("Meta Title is required"),
        metaKeywords: Yup.string().required("Meta Keywords is required"),
        metaDescription: Yup.string().required("Meta Description is required"),
        // productsMatch: Yup.string().test(
        //   "required-condition",
        //   "Products must match is required",
        //   function (value) {
        //     if (showVarint && !value) {
        //       return false;
        //     }
        //     return true;
        //   }
        // ),
        // equalTo: Yup.string().test(
        //   "required-condition",
        //   "Equal to is required",
        //   function (value) {
        //     if (showVarint && !value) {
        //       return false;
        //     }
        //     return true;
        //   }
        // ),
        // value: Yup.string().test(
        //   "required-condition",
        //   "Value is required",
        //   function (value) {
        //     if (showVarint && !value) {
        //       return false;
        //     }
        //     return true;
        //   }
        // ),
    });

    const [selectedVariant, setSelectedVariant] = useState([]);
    const [selectedVariantIds, setSelectedVariantIds] = useState([]);
    const [SelectedEditVariant, setSelectedEditVariant] = useState([]);
    const [SelectedEditAttribute, setSelectedEditAttribute] = useState([]);

    const [search, setSearch] = useState("");
    const [SearchList, setSearchList] = useState([]);

    const [open, setOpen] = React.useState(false);
    const [type, setType] = useState("");
    const [route, setRoute] = useState(null);
    const [msg, setMsg] = useState(null);

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

    const handleChange = (event, value) => {
        setSelectedVariantIds(value.map((option) => option._id));
        setSelectedEditVariant(value);
    };

    const handleImageChange = (e, name) => {
        const file = e.target.files[0];
        if (name === "topRated") {
            setTopRatedImg(file);
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setTopRatedUrl(reader.result);
                };
                reader.readAsDataURL(file);
            }
        } else {
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const queryId = query.get("id");
    console.log("queryIdqueryId", queryId);

    const navigate = useNavigate();

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImage(event.target.files[0]);
            setFileName(file.name);
        } else {
            setFileName("");
        }
    };

    const handleSubmit = async (values) => {
        console.log({ values });
        let payload = {
            _id: queryId ? getCatData._id : "new",
            title: values.name,
            description: values.description,
            parent_id: !selectedCatId ? null : selectedCatId,
            meta_title: values.metaTitle,
            meta_keywords: values.metaKeywords,
            meta_description: values.metaDescription,
            variant_id: selectedVariantIds,
            attributeList_id: SelectedEditAttribute.map(attr => attr._id),
            productsMatch: values.productsMatch,
            equalTo: values.equalTo,
            value: values.value,
            bestseller: values.bestSelling,
            restricted_keywords: values.tags
        };

        const variant_id = SelectedEditVariant.map((variant) => {
            return variant._id;
        });
        payload = { ...payload, variant_id: variant_id };

        try {
            setLoading(true);
            const res = await ApiService.post(apiEndpoints.addCategory, payload, auth_key);
            console.log(res);
            if (res.status === 200) {
                if (image || topRatedImg) {
                    if (queryId) {
                        handleUploadImage(getCatData._id, res?.data);
                    } else {
                        handleUploadImage(res?.data?.data?._id, res?.data);
                    }
                } else {
                    // navigate(ROUTE_CONSTANT.catalog.category.list);
                    // if (!queryId) {
                    setRoute(ROUTE_CONSTANT.catalog.category.list);
                    // }
                    handleOpen("success", res?.data);
                }
            }
        } catch (error) {
            setLoading(false);
            handleOpen("error", error?.response?.data || error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadImage = async (id, msg) => {
        try {
            const formData = new FormData();
            {
                image && formData.append("file", image);
            }
            {
                topRatedImg && formData.append("image", topRatedImg);
            }
            formData.append("_id", id);
            const res = await ApiService.postImage(apiEndpoints.addCategoryImage, formData, auth_key);
            if (res?.status === 200) {
                // navigate(ROUTE_CONSTANT.catalog.category.list);
                setRoute(ROUTE_CONSTANT.catalog.category.list);
                handleOpen("success", msg);
            }
        } catch (error) {
            handleOpen("error", error?.response?.data || error);
        }
    };

    const getCategoryData = async () => {
        if (queryId) {
            try {
                const res = await ApiService.get(`${apiEndpoints.editCategory}/${queryId}`, auth_key);
                if (res.status === 200) {
                    setTopRatedUrl(res?.data?.data?.topRatedImage);
                    setCatData(res?.data?.data);
                    setSelectedCatId(res?.data?.data?.parent_id);
                    if (res?.data?.data?.parent_id) {
                        catData(res?.data?.data?.parent_id);
                    } else {
                        setSelectedCatLable("Select Category");
                    }
                    setSelectedEditVariant(res?.data?.data?.variant_data);
                    setSelectedEditAttribute(res?.data?.data?.attributeList_data || []);
                }
            } catch (error) {
                handleOpen("error", error?.response?.data || error);
            }
        }
    };

    // useEffect(() => {
    //   if (getCatData && getCatData?.slug) {
    //     setSelectedCatLable(getCatData?.slug?.replaceAll("-", " > "));
    //   }
    // }, [getCatData?.slug]);

    const getCateLabel = async () => {
        try {
            if (getCatData?.parent_id) {
                const res = await ApiService.get(apiEndpoints.getParentCatgory, auth_key);
                console.log({ res });

                if (res.status === 200) {
                    const find = res?.data?.data.find((item) => item._id === getCatData?.parent_id);
                    console.log({ find });
                    if (find?.title?.includes(">")) {
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
            handleOpen("error", error?.response?.data || error);
            setSelectedCatLable("Select Category");
        }
    };

    const catData = async (id) => {
        try {
            const res = await ApiService.get(`${apiEndpoints.editCategory}/${id}`, auth_key);
            if (res.status === 200) {
                // setSelectedCatLable(res?.data?.data?.title);
            }
        } catch (error) {
            handleOpen("error", error?.response?.data || error);
        }
    };

    const getAllActiveCategory = async () => {
        try {
            const res = await ApiService.get(apiEndpoints.getAllActiveCategory, auth_key);
            if (res?.status === 200) {
                setAllActiveCategory([{ subs: res?.data?.subCatgory }]);
                setRander(false);
            }
        } catch (error) {
            handleOpen("error", error?.response?.data || error);
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
            handleOpen("error", error?.response?.data || error);
        }
    };

    const getAttributeList = async () => {
        try {
            const res = await ApiService.get("get-attribute-list", auth_key);
            if (res?.data?.success) {
                setAttributeList(res?.data?.data || []);
            }
        } catch (error) {
            handleOpen("error", error?.response?.data || error);
        }
    };

    useEffect(() => {
        getAllActiveCategory();
        getVaraintList();
        getAttributeList();
    }, []);

    useEffect(() => {
        if (queryId) {
            getCategoryData();
        }
    }, [queryId]);

    useEffect(() => {
        if (getCatData?.parent_id) {
            getCateLabel();
        }
    }, [getCatData?.parent_id]);

    // const variantSelection = (catName) => {
    //   const handleClick = (event, variant, prvent) => {
    //     // console.log({ endCatName, selectdVariantLable });
    //     setEndCatName(catName);
    //     if (prvent === "prevent") {
    //       event.stopPropagation();
    //       return;
    //     }
    //     event.stopPropagation();

    //     const neW = (prev) => {
    //       if (selectdVariantLable.includes(`${catName}-${variant}`)) {
    //         const filterVariant = selectdVariantLable.filter((item) => {
    //           return item !== `${catName}-${variant}`;
    //         });
    //         return filterVariant;
    //       }
    //       if (catName !== endCatName) {
    //         return [`${catName}-${variant}`];
    //       }
    //       return [...prev, `${catName}-${variant}`];
    //     };
    //     setSelectedVarintLabel((prev) => {
    //       const val = neW(prev);

    //       const mod = val.map((v) => {
    //         return v.split("-")?.[1];
    //       });
    //       setSelectedCatLable(`${catName}=>${mod?.join(", ")}`);
    //       return val;
    //     });
    //   };

    //   return (
    //     <Box sx={{ display: "flex", flexDirection: "column" }}>
    //       {varintList?.map((item, index) => {
    //         return (
    //           <MenuItem key={index} disableRipple disableTouchRipple>
    //             <FormControlLabel
    //               onClick={(e) => handleClick(e, item?.variant_name, "prevent")}
    //               control={
    //                 <Checkbox
    //                   aria-multiselcetable
    //                   onClick={(e) => {
    //                     handleClick(e, item?.variant_name);
    //                   }}
    //                   checked={
    //                     selectdVariantLable?.includes(`${endCatName}-${item?.variant_name}`) &&
    //                     `${endCatName}-${item?.variant_name}` === `${catName}-${item?.variant_name}`
    //                   }
    //                 />
    //               }
    //               label={item?.variant_name}
    //             />
    //           </MenuItem>
    //         );
    //       })}
    //     </Box>
    //   );
    // };

    function returnJSX(subItems) {
        if (!subItems?.length) {
            return [];
        }
        let content = subItems.map((items) => {
            if (!items?.subs?.length) {
                return (
                    <DropdownMenuItem
                        onClick={() => {
                            setSelectedCatId(items?.id);
                            setSelectedCatLable(items.title);
                            getParentCategory(items?.id);
                        }}
                    >
                        {items?.title}
                    </DropdownMenuItem>
                );
            } else {
                return (
                    <DropdownNestedMenuItem
                        onClick={() => {
                            setSelectedCatId(items?.id);
                            setSelectedCatLable(items?.title);
                            setSelectedVarintLabel([]);
                            setSelectedVariant([]);
                            setSelectedVariantIds([]);
                            getParentCategory(items?.id);
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

    const handleReset = () => {
        setFileName("");
        setSelectedCatLable("Select Category");
        setImage(null);
        setSelectedCatId("");
        setImagePreview(null);
        setTopRatedImg(null);
        setTopRatedUrl(null);
        setSelectedEditVariant([]);
        setSelectedEditAttribute([]);
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
        const obj = findObjectByTitle(allActiveCategory, selectedCatLable);
    }, [selectedCatLable]);

    console.log({ getCatData });

    const getParentCategory = async (id) => {
        try {
            const res = await ApiService.get(apiEndpoints.getParentCatgory, auth_key);
            if (res.status === 200) {
                const findSubCatgory = res?.data?.data.find((cat) => cat._id === id);
                console.log({ findSubCatgory });
                setSelectedCatLable(findSubCatgory?.title);
            }
        } catch (error) {
            console.log(error);
        }
    };
    console.log(getCatData, "getCatData")
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
                                onClick={() => navigate(ROUTE_CONSTANT.catalog.category.list)}
                                startIcon={<AppsIcon />}
                                variant="contained"
                            >
                                Category List
                            </Button>
                        </Box>
                    </Box>
                    <h2>{queryId ? "Edit Category" : "Add Category"}</h2>
                    <Formik
                        initialValues={{
                            name: queryId ? getCatData?.title : "",
                            description: queryId ? getCatData?.description : "",
                            metaTitle: queryId ? getCatData?.meta_title : "",
                            metaKeywords: queryId ? getCatData?.meta_keywords : "",
                            metaDescription: queryId ? getCatData?.meta_description : "",
                            tags: queryId ? getCatData?.restricted_keywords || []: [],
                            bestSelling: queryId ? getCatData?.bestseller : "No",
                            productsMatch: queryId && getCatData?.productsMatch ? getCatData.productsMatch : "",
                            equalTo: queryId && getCatData?.equalTo ? getCatData.equalTo : "",
                            value: queryId ? getCatData?.value : "",
                        }}
                        enableReinitialize={true}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ setFieldValue, resetForm, values, handleChange, errors }) => {
                            console.log("values", values);
                            const handleTagHandler = (event, newValue) => {
                                // Process each value in newValue array and split using comma, space, or newline
                                const processedValues = newValue
                                    .flatMap(value =>
                                        typeof value === "string"
                                            ? value.split(/[\s,]+/).map(v => v.trim())  // Split by space, comma, or newline
                                            : [value]
                                    )
                                    .filter(v => v); // Remove empty values
                                setFieldValue("tags",[...new Set(processedValues)]);
                            };
                            return <Form>
                                <Stack spacing={2} direction="row" sx={{ marginBottom: 4 }}>
                                    <Box sx={{ minWidth: "50%" }}>
                                        {allActiveCategory.length === 0 ? (
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
                                            allActiveCategory?.map((item) => {
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

                                        <span style={{ color: "red" }}>
                      <ErrorMessage name="category" component="div" />
                    </span>
                                    </Box>

                                    <Field
                                        as={TextField}
                                        type="text"
                                        variant="outlined"
                                        color="primary"
                                        label={queryId ? "" : "Title"}
                                        fullWidth
                                        name="name"
                                        placeholder={queryId ? "Title" : ""}
                                        helperText={
                                            <span style={{ color: "red" }}>
                        <ErrorMessage name="name" />
                      </span>
                                        }
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

                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: "20px"
                                    }}
                                >
                                    <Box
                                        sx={
                                            {
                                                // width: "100%"
                                            }
                                        }
                                    >
                                        <FormControl>
                                            <FormLabel
                                                id="demo-radio-buttons-group-label"
                                                sx={{
                                                    fontWeight: "700",
                                                    color: "darkblue"
                                                }}
                                            >
                                                Is the best selling category?
                                            </FormLabel>
                                            <RadioGroup
                                                aria-labelledby="demo-radio-buttons-group-label"
                                                defaultValue={queryId ? getCatData?.bestseller : "No"}
                                                name="bestSelling"
                                                value={values.bestSelling}
                                                onChange={handleChange}
                                            >
                                                <FormControlLabel
                                                    value="Yes"
                                                    control={<Radio checked={values.bestSelling === "Yes"} />}
                                                    label="Yes"
                                                />
                                                <FormControlLabel
                                                    value="No"
                                                    control={<Radio checked={values.bestSelling === "No"} />}
                                                    label="No"
                                                />
                                            </RadioGroup>
                                        </FormControl>
                                    </Box>
                                </Box>

                                <TextField
                                    fullWidth
                                    value={fileName}
                                    sx={{
                                        "& .MuiInputBase-root": {
                                            height: "40px"
                                        }
                                    }}
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
                                                    handleImageSelect(event);
                                                    handleImageChange(event);
                                                    setFieldValue("file", event.currentTarget.files[0]);
                                                }}
                                            />
                                        ),
                                        readOnly: true
                                    }}
                                    placeholder="Select file"
                                    onClick={() => document.getElementById("file-input").click()}
                                />

                                {(imagePreview || getCatData.image) && (
                                    <img
                                        style={{ margin: "16px 0" }}
                                        src={imagePreview ? imagePreview : getCatData.image}
                                        width={200}
                                        alt="Category"
                                    />
                                )}

                                <TextField
                                    fullWidth
                                    value={topRatedImg?.name}
                                    sx={{
                                        "& .MuiInputBase-root": {
                                            height: "40px",
                                            mb: 2,
                                            mt: 2
                                        }
                                    }}
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
                                                id="file-input1"
                                                onChange={(event) => {
                                                    // handleImageSelect(event);
                                                    handleImageChange(event, "topRated");
                                                    // setFieldValue("file", event.currentTarget.files[0]);
                                                }}
                                            />
                                        ),
                                        readOnly: true
                                    }}
                                    placeholder="Select top rated file"
                                    onClick={() => document.getElementById("file-input1").click()}
                                />

                                {topRatedUrl && (
                                    <img style={{ marginBottom: "16px" }} src={topRatedUrl} width={200} alt="" />
                                )}

                                {/* Variants Autocomplete */}
                                <Autocomplete
                                    multiple
                                    limitTags={4}
                                    id="multiple-limit-tags-variants"
                                    options={varintList}
                                    getOptionLabel={(option) => option.variant_name}
                                    renderInput={(params) => {
                                        return (
                                            <TextField
                                                {...params}
                                                label="Variant"
                                                placeholder="Select Variant"
                                                sx={{
                                                    "& .MuiInputBase-root": {
                                                        height: "auto"
                                                    },
                                                    "& .MuiFormLabel-root": {
                                                        top: "-7px"
                                                    }
                                                }}
                                            />
                                        );
                                    }}
                                    sx={{ width: "100%", mb: 2 }}
                                    onChange={(event, value) => setSelectedEditVariant(value)}
                                    value={SelectedEditVariant}
                                    isOptionEqualToValue={(option, value) => option?._id === value?._id}
                                />

                                {/* Attributes Autocomplete */}
                                <Autocomplete
                                    multiple
                                    limitTags={4}
                                    id="multiple-limit-tags-attributes"
                                    options={attributeList}
                                    getOptionLabel={(option) => option.name}
                                    renderInput={(params) => {
                                        return (
                                            <TextField
                                                {...params}
                                                label="Attributes"
                                                placeholder="Select Attributes"
                                                sx={{
                                                    "& .MuiInputBase-root": {
                                                        height: "auto"
                                                    },
                                                    "& .MuiFormLabel-root": {
                                                        top: "-7px"
                                                    }
                                                }}
                                            />
                                        );
                                    }}
                                    sx={{ width: "100%", mb: 2 }}
                                    onChange={(event, value) => setSelectedEditAttribute(value)}
                                    value={SelectedEditAttribute}
                                    isOptionEqualToValue={(option, value) => option?._id === value?._id}
                                />

                                <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                    <Grid item xs={12} sm={4}>
                                        <FormControl fullWidth>
                                            <TextField
                                                helperText={
                                                    <span style={{ color: "red" }}>
                            <ErrorMessage name="productsMatch" />
                          </span>
                                                }
                                                select
                                                sx={{
                                                    "& .MuiInputBase-root": { height: "40px" },
                                                    "& .MuiFormLabel-root": { top: "-7px" },
                                                }}
                                                label="Products must match"
                                                labelId="pib"
                                                id="pibb"
                                                value={values?.productsMatch}
                                                name="productsMatch"
                                                onChange={handleChange}
                                                InputProps={{
                                                    endAdornment: values?.productsMatch ? (
                                                        <InputAdornment position="end" sx={{ mr: 3 }}>
                                                            <IconButton
                                                                onClick={() => {
                                                                    handleChange({
                                                                        target: { name: "productsMatch", value: "" },
                                                                    });
                                                                }}
                                                                edge="end"
                                                            >
                                                                <ClearIcon />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ) : null,
                                                }}
                                            >
                                                <MenuItem value="Product Title">Product Title</MenuItem>
                                                <MenuItem value="Product Tag">Product Tag</MenuItem>
                                            </TextField>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <FormControl fullWidth>
                                            <TextField
                                                helperText={
                                                    <span style={{ color: "red" }}>
                            <ErrorMessage name="equalTo" />
                          </span>
                                                }
                                                select
                                                sx={{
                                                    "& .MuiInputBase-root": { height: "40px" },
                                                    "& .MuiFormLabel-root": { top: "-7px" },
                                                }}
                                                label="Equal To"
                                                labelId="equalTo"
                                                id="equalTo"
                                                value={values?.equalTo}
                                                name="equalTo"
                                                onChange={handleChange}
                                                InputProps={{
                                                    endAdornment: values?.equalTo ? (
                                                        <InputAdornment position="end" sx={{ mr: 3 }}>
                                                            <IconButton
                                                                onClick={() => {
                                                                    handleChange({
                                                                        target: { name: "equalTo", value: "" },
                                                                    });
                                                                }}
                                                                edge="end"
                                                            >
                                                                <ClearIcon />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ) : null,
                                                }}
                                            >
                                                <MenuItem value="is equal to">is equal to</MenuItem>
                                                <MenuItem value="is not equal to">is not equal to</MenuItem>
                                            </TextField>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Field
                                            as={TextField}
                                            type="text"
                                            variant="outlined"
                                            color="primary"
                                            label={queryId ? "" : "Value"}
                                            fullWidth
                                            name="value"
                                            placeholder={queryId ? "Value" : ""}
                                            helperText={
                                                <span style={{ color: "red" }}>
                          <ErrorMessage name="value" />
                        </span>
                                            }
                                            sx={{
                                                "& .MuiInputBase-root": { height: "40px" },
                                                "& .MuiFormLabel-root": { top: "-7px" },
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        marginBottom: "20px",
                                        gap: "20px",
                                    }}
                                >
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
                                            />
                                        )}
                                        sx={{ width: "100%" }}
                                        onChange={handleTagHandler}
                                        value={values.tags || []}
                                        isOptionEqualToValue={(option, value) => option === value}
                                    />
                                </Box>
                                <Field
                                    as={TextField}
                                    label={queryId ? "" : "Description"}
                                    multiline
                                    rows={2}
                                    variant="outlined"
                                    fullWidth
                                    sx={{ mb: 2 }}
                                    placeholder={queryId ? "Description" : ""}
                                    name="description"
                                    helperText={
                                        <span style={{ color: "red" }}>
                      <ErrorMessage name="description" />
                    </span>
                                    }
                                />

                                <Field
                                    as={TextField}
                                    type="text"
                                    variant="outlined"
                                    color="primary"
                                    label={queryId ? "" : "Meta title"}
                                    fullWidth
                                    sx={{
                                        mb: 2,
                                        "& .MuiInputBase-root": {
                                            height: "40px"
                                        },
                                        "& .MuiFormLabel-root": {
                                            top: "-7px"
                                        }
                                    }}
                                    placeholder={queryId ? "Meta Title" : ""}
                                    name="metaTitle"
                                    helperText={
                                        <span style={{ color: "red" }}>
                      <ErrorMessage name="metaTitle" />
                    </span>
                                    }
                                />

                                <Field
                                    as={TextField}
                                    label={queryId ? "" : "Meta KeyWords"}
                                    multiline
                                    rows={2}
                                    sx={{ mb: 2 }}
                                    variant="outlined"
                                    fullWidth
                                    placeholder={queryId ? "Meta KeyWords" : ""}
                                    name="metaKeywords"
                                    helperText={
                                        <span style={{ color: "red" }}>
                      <ErrorMessage name="metaKeywords" />{" "}
                    </span>
                                    }
                                />

                                <Field
                                    as={TextField}
                                    label={queryId ? "" : "Meta Description"}
                                    multiline
                                    placeholder={queryId ? "Meta Description" : ""}
                                    rows={2}
                                    variant="outlined"
                                    fullWidth
                                    sx={{ mb: 2 }}
                                    name="metaDescription"
                                    helperText={
                                        <span style={{ color: "red" }}>
                      <ErrorMessage name="metaDescription" />
                    </span>
                                    }
                                />

                                <Button
                                    endIcon={loading ? <CircularProgress size={15} /> : ""}
                                    disabled={loading ? true : false}
                                    sx={{ mr: "16px" }}
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                >
                                    Submit
                                </Button>
                                {!queryId && (
                                    <Button
                                        onClick={() => {
                                            handleReset();
                                            resetForm();
                                        }}
                                        variant="contained"
                                        color="error"
                                        type="reset"
                                    >
                                        Reset
                                    </Button>
                                )}
                            </Form>
                        }}
                    </Formik>
                </StyledContainer>
            </MuiContainer>
            <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
        </ThemeProvider>
    );
};

export default Add;
