import React, { useState, useEffect } from "react";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
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
    Typography,
    Card,
    CardContent
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
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

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

// Operator mappings based on field selection
const getOperatorsForField = (field) => {
    const operatorMap = {
        "Product Title": ["is equal to", "is not equal to", "starts with", "ends with"],
        "Product Tag": ["is equal to", "is not equal to", "starts with", "ends with"],
        "Attributes Tag": ["is equal to", "is not equal to", "starts with", "ends with"],
        "Variant Tag": ["is equal to", "is not equal to", "starts with", "ends with"]
    };
    return operatorMap[field] || [];
};

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

    // State for dynamic dropdown data
    const [parentCategories, setParentCategories] = useState([]);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Name is required"),
        description: Yup.string().required("Description is required"),
        metaTitle: Yup.string().required("Meta Title is required"),
        metaKeywords: Yup.string().required("Meta Keywords is required"),
        metaDescription: Yup.string().required("Meta Description is required"),
        conditionType: Yup.string().oneOf(["all", "any"], "Condition type is required"),
        conditions: Yup.array().of(
            Yup.object().shape({
                field: Yup.string().required("Field is required"),
                operator: Yup.string().required("Operator is required"),
                value: Yup.mixed().test('required', 'Value is required', function(value) {
                    const { field } = this.parent;
                    if (field && !value) {
                        return false;
                    }
                    return true;
                })
            })
        ).min(1, "At least one condition is required")
    });

    const [selectedVariant, setSelectedVariant] = useState([]);
    const [selectedVariantIds, setSelectedVariantIds] = useState([]);
    const [SelectedEditVariant, setSelectedEditVariant] = useState([]);
    const [SelectedEditAttribute, setSelectedEditAttribute] = useState([]);

    const [search, setSearch] = useState("");
    const [SearchList, setSearchList] = useState([]);

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

    // Helper function to extract IDs from value objects
    const extractValueIds = (value, field) => {
        if (!value) return [];

        if (Array.isArray(value)) {
            return value.map(item => {
                if (typeof item === 'object' && item !== null) {
                    return item._id || item.id || item;
                }
                return item;
            });
        }

        if (typeof value === 'object' && value !== null) {
            return value._id || value.id || value;
        }

        return value;
    };

    // Process conditions before submitting - extract only IDs
    const processConditionsForSubmit = (conditions) => {
        return conditions.map(condition => ({
            field: condition.field,
            operator: condition.operator,
            value: extractValueIds(condition.value, condition.field)
        }));
    };

    // Helper function to find objects by IDs for initial values
    const findObjectsByIds = (ids, options) => {
        if (!ids || !Array.isArray(ids)) return [];
        return ids.map(id => {
            if (typeof id === 'object') return id; // Already an object
            return options.find(option => option._id === id) || id;
        }).filter(Boolean);
    };

    // Process initial conditions data - convert IDs to objects for display
    const processInitialConditions = (conditions) => {
        if (!conditions || !Array.isArray(conditions)) return [{ field: "", operator: "", value: "" }];

        return conditions.map(condition => {
            let value = condition.value;

            // If value contains IDs, convert them to objects for display
            if (condition.value && Array.isArray(condition.value)) {
                const options = getValueOptions(condition.field);
                value = findObjectsByIds(condition.value, options);
            }

            return {
                field: condition.field || "",
                operator: condition.operator || "",
                value: value || ""
            };
        });
    };

    const handleSubmit = async (values) => {
        console.log("Original values:", values);

        const processedConditions = processConditionsForSubmit(values.conditions);
        console.log("Processed conditions:", processedConditions);

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
            conditions: processedConditions,
            conditionType: values.conditionType,
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
                    setRoute(ROUTE_CONSTANT.catalog.category.list);
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
                    setSelectedEditVariant(res?.data?.data?.variant_data || []);
                    setSelectedEditAttribute(res?.data?.data?.attributeList_data || []);
                }
            } catch (error) {
                handleOpen("error", error?.response?.data || error);
            }
        }
    };

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
        try {
            const res = await ApiService.get(urlWithParam, auth_key);
            console.log("resresres", res);
            if (res.status === 200) {
                setVariantList(res?.data?.data || []);
                setSearchList(res?.data?.data || []);
            }
        } catch (error) {
            handleOpen("error", error?.response?.data || error);
            setVariantList([]);
            setSearchList([]);
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
            setAttributeList([]);
        }
    };

    // Get parent categories for dropdown
    const getParentCategories = async () => {
        try {
            const res = await ApiService.get(apiEndpoints.getParentCatgory, auth_key);
            if (res.status === 200) {
                setParentCategories(res?.data?.data || []);
            }
        } catch (error) {
            console.error("Error fetching parent categories:", error);
            setParentCategories([]);
        }
    };

    useEffect(() => {
        getAllActiveCategory();
        getVaraintList();
        getAttributeList();
        getParentCategories();
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

    // Helper function to get value options based on field selection
    const getValueOptions = (field) => {
        switch (field) {
            case "Product Title":
            case "Product Tag":
                return parentCategories;
            case "Attributes Tag":
                return attributeList;
            case "Variant Tag":
                return varintList;
            default:
                return [];
        }
    };

    // Helper function to get option label based on field
    const getOptionLabel = (option, field) => {
        if (!option) return '';

        switch (field) {
            case "Product Title":
            case "Product Tag":
                return option.title || '';
            case "Attributes Tag":
                return option.name || '';
            case "Variant Tag":
                return option.variant_name || '';
            default:
                return String(option);
        }
    };

    // Helper function to get option value for comparison
    const getOptionValue = (option, field) => {
        if (!option) return '';

        switch (field) {
            case "Product Title":
            case "Product Tag":
                return option._id || '';
            case "Attributes Tag":
                return option._id || '';
            case "Variant Tag":
                return option._id || '';
            default:
                return String(option);
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
                            tags: queryId ? getCatData?.restricted_keywords || [] : [],
                            bestSelling: queryId ? getCatData?.bestseller : "No",
                            conditionType: queryId ? getCatData?.conditionType || "all" : "all",
                            conditions: queryId && getCatData?.conditions?.length > 0
                                ? processInitialConditions(getCatData.conditions)
                                : [{ field: "", operator: "", value: "" }]
                        }}
                        enableReinitialize={true}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ setFieldValue, resetForm, values, handleChange, errors, touched }) => {
                            console.log("values", values);
                            const handleTagHandler = (event, newValue) => {
                                const processedValues = newValue
                                    .flatMap(value =>
                                        typeof value === "string"
                                            ? value.split(/[\s,]+/).map(v => v.trim())
                                            : [value]
                                    )
                                    .filter(v => v);
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

                                {/* DYNAMIC CONDITIONS SECTION - IMPROVED UI */}
                                <Box sx={{ mb: 3, mt: 3 }}>
                                    <FormControl component="fieldset" sx={{ mb: 2 }}>
                                        <FormLabel
                                            component="legend"
                                            sx={{
                                                fontWeight: "700",
                                                color: "darkblue",
                                                mb: 1
                                            }}
                                        >
                                            Products must match:
                                        </FormLabel>
                                        <RadioGroup
                                            row
                                            name="conditionType"
                                            value={values.conditionType}
                                            onChange={handleChange}
                                        >
                                            <FormControlLabel
                                                value="all"
                                                control={<Radio />}
                                                label="All conditions (AND)"
                                            />
                                            <FormControlLabel
                                                value="any"
                                                control={<Radio />}
                                                label="Any conditions (OR)"
                                            />
                                        </RadioGroup>
                                        {errors.conditionType && touched.conditionType && (
                                            <span style={{ color: "red", fontSize: "12px" }}>
                                                {errors.conditionType}
                                            </span>
                                        )}
                                    </FormControl>

                                    <FieldArray name="conditions">
                                        {({ push, remove }) => (
                                            <Box>
                                                {values.conditions.map((condition, index) => {
                                                    const fieldOptions = [
                                                        "Product Title",
                                                        "Product Tag",
                                                        "Attributes Tag",
                                                        "Variant Tag"
                                                    ];

                                                    const operatorOptions = getOperatorsForField(condition.field);
                                                    const valueOptions = getValueOptions(condition.field);

                                                    return (
                                                        <Card key={index} sx={{ mb: 2, p: 2, position: 'relative' }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', position: 'absolute', top: 16, right: 16 }}>
                                                                <IconButton
                                                                    onClick={() => remove(index)}
                                                                    disabled={values.conditions.length === 1}
                                                                    color="error"
                                                                    size="small"
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </Box>

                                                            <Grid container spacing={2} alignItems="flex-start">
                                                                <Grid item xs={12} sm={5}>
                                                                    <FormControl fullWidth>
                                                                        <TextField
                                                                            select
                                                                            sx={{
                                                                                "& .MuiInputBase-root": { height: "40px" },
                                                                                "& .MuiFormLabel-root": { top: "-7px" },
                                                                            }}
                                                                            label="Field"
                                                                            value={condition.field}
                                                                            name={`conditions.${index}.field`}
                                                                            onChange={handleChange}
                                                                            error={errors.conditions?.[index]?.field && touched.conditions?.[index]?.field}
                                                                            helperText={
                                                                                errors.conditions?.[index]?.field && touched.conditions?.[index]?.field ? (
                                                                                    <span style={{ color: "red" }}>
                                                                                        {errors.conditions[index].field}
                                                                                    </span>
                                                                                ) : null
                                                                            }
                                                                        >
                                                                            {fieldOptions.map((option) => (
                                                                                <MenuItem key={option} value={option}>
                                                                                    {option}
                                                                                </MenuItem>
                                                                            ))}
                                                                        </TextField>
                                                                    </FormControl>
                                                                </Grid>

                                                                <Grid item xs={12} sm={5}>
                                                                    <FormControl fullWidth>
                                                                        <TextField
                                                                            select
                                                                            sx={{
                                                                                "& .MuiInputBase-root": { height: "40px" },
                                                                                "& .MuiFormLabel-root": { top: "-7px" },
                                                                            }}
                                                                            label="Operator"
                                                                            value={condition.operator}
                                                                            name={`conditions.${index}.operator`}
                                                                            onChange={handleChange}
                                                                            error={errors.conditions?.[index]?.operator && touched.conditions?.[index]?.operator}
                                                                            helperText={
                                                                                errors.conditions?.[index]?.operator && touched.conditions?.[index]?.operator ? (
                                                                                    <span style={{ color: "red" }}>
                                                                                        {errors.conditions[index].operator}
                                                                                    </span>
                                                                                ) : null
                                                                            }
                                                                        >
                                                                            {operatorOptions.map((option) => (
                                                                                <MenuItem key={option} value={option}>
                                                                                    {option}
                                                                                </MenuItem>
                                                                            ))}
                                                                        </TextField>
                                                                    </FormControl>
                                                                </Grid>

                                                                <Grid item xs={12}>
                                                                    <FormControl fullWidth>
                                                                        <Autocomplete
                                                                            multiple
                                                                            disableCloseOnSelect
                                                                            options={valueOptions}
                                                                            getOptionLabel={(option) => getOptionLabel(option, condition.field)}
                                                                            value={condition.value || []}
                                                                            onChange={(event, newValue) => {
                                                                                setFieldValue(`conditions.${index}.value`, newValue);
                                                                            }}
                                                                            renderInput={(params) => (
                                                                                <TextField
                                                                                    {...params}
                                                                                    label="Value"
                                                                                    error={errors.conditions?.[index]?.value && touched.conditions?.[index]?.value}
                                                                                    helperText={
                                                                                        errors.conditions?.[index]?.value && touched.conditions?.[index]?.value ? (
                                                                                            <span style={{ color: "red" }}>
                                                                                                {errors.conditions[index].value}
                                                                                            </span>
                                                                                        ) : null
                                                                                    }
                                                                                    sx={{
                                                                                        "& .MuiInputBase-root": { height: "auto" },
                                                                                        "& .MuiFormLabel-root": { top: "-7px" },
                                                                                    }}
                                                                                />
                                                                            )}
                                                                            isOptionEqualToValue={(option, value) =>
                                                                                getOptionValue(option, condition.field) === getOptionValue(value, condition.field)
                                                                            }
                                                                        />
                                                                    </FormControl>
                                                                </Grid>
                                                            </Grid>
                                                        </Card>
                                                    );
                                                })}

                                                <Button
                                                    startIcon={<AddIcon />}
                                                    variant="outlined"
                                                    onClick={() => push({ field: "", operator: "", value: "" })}
                                                    sx={{ mt: 1 }}
                                                >
                                                    Add another condition
                                                </Button>
                                            </Box>
                                        )}
                                    </FieldArray>
                                    {errors.conditions && typeof errors.conditions === 'string' && (
                                        <span style={{ color: "red", fontSize: "12px", display: "block", mt: 1 }}>
                                            {errors.conditions}
                                        </span>
                                    )}
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
                                                    handleImageChange(event, "topRated");
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
                                    options={varintList || []}
                                    getOptionLabel={(option) => option?.variant_name || ""}
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
                                    onChange={(event, value) => setSelectedEditVariant(value || [])}
                                    value={SelectedEditVariant || []}
                                    isOptionEqualToValue={(option, value) => option?._id === value?._id}
                                />

                                {/* Attributes Autocomplete */}
                                <Autocomplete
                                    multiple
                                    limitTags={4}
                                    id="multiple-limit-tags-attributes"
                                    options={attributeList || []}
                                    getOptionLabel={(option) => option?.name || ""}
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
                                    onChange={(event, value) => setSelectedEditAttribute(value || [])}
                                    value={SelectedEditAttribute || []}
                                    isOptionEqualToValue={(option, value) => option?._id === value?._id}
                                />

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
                                        getOptionLabel={(option) => option || ""}
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
