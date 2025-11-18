import React, {useState, useEffect} from "react";
import {ROUTE_CONSTANT} from "app/constant/routeContanst";
import {Formik, Form, Field, ErrorMessage, FieldArray} from "formik";
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
    Divider,
    RadioGroup,
    Radio,
    FormLabel,
    Grid,
    Card
} from "@mui/material";
import Typography from "@mui/material/Typography";
import {ThemeProvider, createTheme} from "@mui/material/styles";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import {toast} from "react-toastify";
import {useNavigate, useSearchParams} from "react-router-dom";
import styled from "@emotion/styled";
import {ApiService} from "app/services/ApiService";
import {apiEndpoints} from "app/constant/apiEndpoints";
import {localStorageKey} from "app/constant/localStorageKey";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {Dropdown, DropdownMenuItem, DropdownNestedMenuItem} from "./DropDown";
import ArrowRight from "@mui/icons-material/ArrowRight";

import PropTypes from "prop-types";
import CloseIcon from "@mui/icons-material/Close";

import {autocompleteClasses} from "@mui/material/Autocomplete";
import {TextRotateVerticalRounded} from "@mui/icons-material";
import {useCallback} from "react";
import ClearIcon from "@mui/icons-material/Clear";
import ConfirmModal from "app/components/ConfirmModal";
import AppsIcon from "@mui/icons-material/Apps";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

function Tag(props) {
    const {label, onDelete, ...other} = props;
    return (
        <div {...other}>
            <span>{label}</span>
            <CloseIcon onClick={onDelete}/>
        </div>
    );
}

Tag.propTypes = {
    label: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired
};

const theme = createTheme();

const StyledContainer = styled("div")(({theme}) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: {margin: "16px"},
    "& .breadcrumb": {
        marginBottom: "30px",
        [theme.breakpoints.down("sm")]: {marginBottom: "16px"}
    }
}));

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
        restrictedTags: [],
        catName: "",
        catId: "",
        productsMatch: "",
        equalTo: "",
        value: "",
        // New fields for conditions
        isAutomatic: false,
        categoryScope: "all",
        selectedCategories: [],
        conditionType: "all",
        conditions: [{field: "", operator: "", value: ""}]
    });

    console.log({formValues}, "fghntntntjnt");

    const [errors, setErrors] = useState({
        title: "",
        images: "",
        tags: "",
        restrictedTags: "",
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
    console.log({getActiveAdminCategory});
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
    console.log({selectedCatLable});
    const [parentId, setParentId] = useState(null);
    console.log({parentId});

    // New states for conditions
    const [parentCategories, setParentCategories] = useState([]);
    const [parentMainCategories, setParentMainCategories] = useState([]);

    const [filteredVariants, setFilteredVariants] = useState([]);
    const [filteredAttributes, setFilteredAttributes] = useState([]);
    const [attributeList, setAttributeList] = useState([]);

    const logOut = () => {
        localStorage.removeItem(localStorageKey.auth_key);
        localStorage.removeItem(localStorageKey.designation_id);
        localStorage.removeItem(localStorageKey.vendorId);
        setRoute(ROUTE_CONSTANT.login);
    };

    console.log({formValues});
    console.log({image});
    console.log({imgUrl});
    console.log({formValues});
    console.log({allActiveCat});
    console.log("queryIdqueryId", queryId);

    const getAllActiveCategory = async () => {
        try {
            const res = await ApiService.get(apiEndpoints.getActiveAdminCategory, auth_key);
            if (res?.status === 200) {
                setAllActiveCategory([{subs: res?.data?.data}]);
                setRander(false);
            }
        } catch (error) {
            handleOpen("error", error);
        }
    };

    const getVaraintList = async () => {
        const typeParam = "type=Category";
        const urlWithParam = `${apiEndpoints.getVariant}?${typeParam}&fulldata=true`;
        try {
            const res = await ApiService.get(urlWithParam, auth_key);
            console.log("resresres", res);
            if (res.status === 200) {
                setVariantList(res?.data?.data || []);
                setSearchList(res?.data?.data || []);
                setFilteredVariants(res?.data?.data || []);
            }
        } catch (error) {
            handleOpen("error", error);
        }
    };

    const getAttributeList = async () => {
        try {
            const res = await ApiService.get("get-attribute-list?fulldata=true", auth_key);
            if (res?.data?.success) {
                setAttributeList(res?.data?.data || []);
                setFilteredAttributes(res?.data?.data || []);
            }
        } catch (error) {
            console.error("Error fetching attributes:", error);
            setAttributeList([]);
            setFilteredAttributes([]);
        }
    };

    // Get parent categories for dropdown
    const getParentCategories = async () => {
        try {
            const res = await ApiService.get(apiEndpoints.getParentAdminCatgory, auth_key);
            if (res.status === 200) {
                setParentCategories(res?.data?.data || []);
            }
        } catch (error) {
            console.error("Error fetching parent categories:", error);
            setParentCategories([]);
        }
    };

    // Get filtered variants and attributes based on selected categories
    const getFilteredVariantsAndAttributes = async (categoryIds) => {
        if (categoryIds.length === 0 || formValues.categoryScope == "all") {
            setFilteredVariants(varintList);
            setFilteredAttributes(attributeList);
            return;
        }

        try {
            const res = await ApiService.post(`${apiEndpoints.getCategoryFullDetails}`, {categoryIds}, auth_key);

            if (res.data?.success && res.data?.data) {
                const categoriesData = res.data.data;

                // Use Sets to avoid duplicates
                const variantIds = new Set();
                const attributeIds = new Set();

                // Recursive function to collect variant and attribute IDs from categories and subcategories
                const collectIdsFromCategories = (categories) => {
                    categories.forEach(category => {
                        // Collect variant IDs from variants array
                        if (category.variants && Array.isArray(category.variants)) {
                            category.variants.forEach(variant => {
                                if (variant.id) variantIds.add(variant.id);
                            });
                        }

                        // Collect attribute IDs from attributeList
                        if (category.attributeList && Array.isArray(category.attributeList)) {
                            category.attributeList.forEach(attribute => {
                                if (attribute.id) attributeIds.add(attribute.id);
                            });
                        }

                        // Process subcategories recursively
                        if (category.subs && Array.isArray(category.subs)) {
                            collectIdsFromCategories(category.subs);
                        }
                    });
                };

                collectIdsFromCategories(categoriesData);

                // Convert Sets to Arrays
                const variantIdArray = Array.from(variantIds);
                const attributeIdArray = Array.from(attributeIds);

                console.log("Filtered Variant IDs:", variantIdArray);
                console.log("Filtered Attribute IDs:", attributeIdArray);

                // Filter variants based on collected IDs
                const filteredVariantData = varintList.filter(variant =>
                    variantIdArray.includes(variant._id) || variantIdArray.includes(variant.id)
                );

                // Filter attributes based on collected IDs
                const filteredAttributeData = attributeList.filter(attribute =>
                    attributeIdArray.includes(attribute._id) || attributeIdArray.includes(attribute.id)
                );

                console.log("Filtered Variants:", filteredVariantData);
                console.log("Filtered Attributes:", filteredAttributeData);

                setFilteredVariants(filteredVariantData);
                setFilteredAttributes(filteredAttributeData);

            } else {
                // If API response structure is different, fallback to all
                console.log("API response structure unexpected, using all variants and attributes");
                setFilteredVariants(varintList);
                setFilteredAttributes(attributeList);
            }
        } catch (error) {
            console.error("Error fetching filtered data:", error);
            // On error, show all available variants and attributes
            setFilteredVariants(varintList);
            setFilteredAttributes(attributeList);
        }
    };

    useEffect(() => {
        getAllActiveCategory();
        getVaraintList();
        getAttributeList();
        getParentCategories();
        getParentMainCategories();
    }, []);

    // Update filtered variants and attributes when selected categories change
    useEffect(() => {
        if (formValues.selectedCategories && formValues.selectedCategories.length > 0) {
            const categoryIds = formValues.selectedCategories.map(cat => cat._id || cat.id).filter(id => id);
            getFilteredVariantsAndAttributes(categoryIds);
        } else {
            setFilteredVariants(varintList);
            setFilteredAttributes(attributeList);
        }
    }, [formValues.selectedCategories, formValues.categoryScope]);

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
                        rightIcon={<ArrowRight/>}
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
                console.log({findSubCatgory}, "hello");
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
        const {name, value} = e.target;
        setFormValues((prev) => ({...prev, [name]: value}));
        setErrors((prv) => ({...prv, [name]: ""}));
    };

    const handleTagHandler = (event, value) => {
        setFormValues((prv) => ({...prv, tags_id: value.map((option) => option?._id)}));
        setFormValues((prv) => ({...prv, tags: value}));
        setErrors((prv) => ({...prv, tags: ""}));
    };

    const handleCatChange = (event, value) => {
        if (value?.length <= 1) {
            setFormValues((prv) => ({...prv, catId: value?.map((option) => option?._id)}));
            setFormValues((prv) => ({...prv, catName: value}));
            setErrors((prv) => ({...prv, catName: ""}));
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

    const handleSubmit = async () => {
        const newErrors = {};
        if (!formValues.title) newErrors.title = "Title is required";
        if (!imgUrl) newErrors.images = "Image is required";
        if (formValues.tags?.length <= 0) newErrors.tags = "Tags is required";

        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            try {
                setLoading(true);

                // Process conditions for payload
                const processedConditions = processConditionsForSubmit(formValues.conditions);

                const payload = {
                    _id: queryId ? queryId : "new",
                    title: formValues?.title,
                    tag: formValues?.tags,
                    parent_id: parentId,
                    restricted_keywords: formValues?.restrictedTags || [],
                    // New conditions data
                    isAutomatic: formValues.isAutomatic,
                    categoryScope: formValues.categoryScope,
                    selectedCategories: formValues.selectedCategories.map(cat => cat._id),
                    conditionType: formValues.conditionType,
                    conditions: processedConditions
                };

                const res = await ApiService.post(apiEndpoints.addAdminCategory, payload, auth_key);
                console.log(res);
                if (res.status === 200) {
                    if (image) {
                        await handleUploadImg(res?.data?.adminCategory?._id);
                    }
                    setRoute(ROUTE_CONSTANT.catalog.adminCategory.list);
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
                setAllTags(res?.data?.data);
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
                    return {"S.No": i + 1, ...e};
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
                if (res?.data?.data?.parent_id?._id) {
                    setParentId(res.data.data.parent_id._id);
                }
                const resData = res?.data?.data;
                console.log({resData});

                // Process conditions data if exists
                let conditions = [{field: "", operator: "", value: ""}];
                if (resData?.conditions && resData.conditions.length > 0) {
                    conditions = resData.conditions;
                }

                setFormValues((prev) => ({
                    ...prev,
                    title: resData?.title,
                    tags: resData?.tag,
                    restrictedTags: resData?.restricted_keywords || [],
                    catName: resData?.parent_id?._id,
                    catId: resData?._id,
                    parent_id: resData?.parent_id?._id,
                    // New conditions data
                    isAutomatic: resData?.isAutomatic || false,
                    categoryScope: resData?.categoryScope || "all",
                    selectedCategories: resData?.selectedCategories || [],
                    conditionType: resData?.conditionType || "all",
                    conditions: conditions
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
                restrictedTags: [],
                catName: "",
                catId: "",
                productsMatch: "",
                equalTo: "",
                value: "",
                parent_id: "",
                // New fields
                isAutomatic: false,
                categoryScope: "all",
                selectedCategories: [],
                conditionType: "all",
                conditions: [{field: "", operator: "", value: ""}]
            });
            setImage(null);
            setImgUrl(null);
        }
    }, [queryId]);

    useEffect(() => {
        if (parentId) {
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
                console.log({res}, "fidsjkkl");

                if (res.status === 200) {
                    const find = res?.data?.data.find((item) => item._id === parentId);
                    console.log({find}, "fdjskfjdkljfsdljfkljsdkljflksdjlfkjsdl");
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
        const processedValues = newValue
            .flatMap(value =>
                typeof value === "string"
                    ? value.split(/[\s,]+/).map(v => v.trim())
                    : [value]
            )
            .filter(v => v);

        setFormValues((prev) => ({
            ...prev,
            restrictedTags: [...new Set(processedValues)],
        }));
    };

    // Helper function to get value options based on field selection
    const getValueOptions = (field) => {
        switch (field) {
            case "Product Title":
            case "Product Tag":
                return parentCategories;
            case "Attributes Tag":
                return filteredAttributes;
            case "Variant Tag":
                return filteredVariants;
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

    // Enhanced renderValueInput function with compound attribute support
    const renderValueInput = (condition, index) => {
        const field = condition.field;

        if (field === "Product Title" || field === "Product Tag") {
            return (
                <TextField
                    fullWidth
                    value={condition.value || ""}
                    onChange={(e) => {
                        const newConditions = [...formValues.conditions];
                        newConditions[index].value = e.target.value;
                        setFormValues(prev => ({...prev, conditions: newConditions}));
                    }}
                    placeholder="Enter value"
                    sx={{
                        "& .MuiInputBase-root": {height: "40px"}
                    }}
                />
            );
        }

        if (field === "Attributes Tag") {
            const selectedAttribute = filteredAttributes.find(attr => attr._id === condition.value?.attributeId);

            // Handle compound attributes with sub-attributes
            if (selectedAttribute?.type === "Compound") {
                const subAttributes = selectedAttribute?.subAttributes || [];
                const selectedSubAttribute = subAttributes.find(sub => sub._id === condition.value?.subAttributeId);

                return (
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                        {/* Attribute Selection */}
                        <FormControl fullWidth>
                            <TextField
                                select
                                sx={{
                                    "& .MuiInputBase-root": {height: "40px"}
                                }}
                                value={condition.value?.attributeId || ""}
                                onChange={(e) => {
                                    const newAttribute = filteredAttributes.find(attr => attr._id === e.target.value);
                                    const newConditions = [...formValues.conditions];
                                    newConditions[index].value = {
                                        attributeId: e.target.value,
                                        subAttributeId: "",
                                        value: ""
                                    };
                                    setFormValues(prev => ({...prev, conditions: newConditions}));
                                }}
                                label="Select Attribute"
                            >
                                {filteredAttributes.map((attribute) => (
                                    <MenuItem key={attribute._id} value={attribute._id}>
                                        {attribute.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </FormControl>

                        {/* Sub-attribute Selection for Compound types */}
                        {selectedAttribute?.type === "Compound" && (
                            <FormControl fullWidth>
                                <TextField
                                    select
                                    sx={{
                                        "& .MuiInputBase-root": {height: "40px"}
                                    }}
                                    value={condition.value?.subAttributeId || ""}
                                    onChange={(e) => {
                                        const newConditions = [...formValues.conditions];
                                        newConditions[index].value = {
                                            ...condition.value,
                                            subAttributeId: e.target.value,
                                            value: ""
                                        };
                                        setFormValues(prev => ({...prev, conditions: newConditions}));
                                    }}
                                    label="Select Sub-Attribute"
                                >
                                    {subAttributes.map((subAttr) => (
                                        <MenuItem key={subAttr._id} value={subAttr._id}>
                                            {subAttr.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>
                        )}

                        {/* Value Input based on selected sub-attribute type */}
                        {selectedSubAttribute && (
                            <FormControl fullWidth>
                                {renderSubAttributeValueInput(selectedSubAttribute, condition, index)}
                            </FormControl>
                        )}
                    </Box>
                );
            }

            // Handle regular attributes (Dropdown, Yes/No, Text)
            const attributeValues = selectedAttribute?.values || [];
            const selectedValuesCount = condition.value?.valueIds?.length || 0;

            return (
                <Box sx={{display: 'flex', flexDirection: selectedValuesCount > 1 ? 'column' : 'row', gap: 1}}>
                    <FormControl fullWidth>
                        <TextField
                            select
                            sx={{
                                "& .MuiInputBase-root": {
                                    height: selectedValuesCount > 1 ? "auto" : "40px"
                                }
                            }}
                            value={condition.value?.attributeId || ""}
                            onChange={(e) => {
                                const newConditions = [...formValues.conditions];
                                newConditions[index].value = {
                                    attributeId: e.target.value,
                                    valueIds: []
                                };
                                setFormValues(prev => ({...prev, conditions: newConditions}));
                            }}
                            label="Select Attribute"
                        >
                            {filteredAttributes.map((attribute) => (
                                <MenuItem key={attribute._id} value={attribute._id}>
                                    {attribute.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </FormControl>

                    <FormControl fullWidth>
                        {renderAttributeValueInput(selectedAttribute, condition, index)}
                    </FormControl>
                </Box>
            );
        }

        if (field === "Variant Tag") {
            const selectedVariantType = filteredVariants.find(variant => variant._id === condition.value?.variantId);
            const variantAttributes = selectedVariantType?.attributes || [];
            const selectedAttributesCount = condition.value?.attributeIds?.length || 0;

            return (
                <Box sx={{display: 'flex', flexDirection: selectedAttributesCount > 1 ? 'column' : 'row', gap: 1}}>
                    <FormControl fullWidth>
                        <TextField
                            select
                            sx={{
                                "& .MuiInputBase-root": {
                                    height: selectedAttributesCount > 1 ? "auto" : "40px"
                                }
                            }}
                            value={condition.value?.variantId || ""}
                            onChange={(e) => {
                                const newConditions = [...formValues.conditions];
                                newConditions[index].value = {
                                    variantId: e.target.value,
                                    attributeIds: []
                                };
                                setFormValues(prev => ({...prev, conditions: newConditions}));
                            }}
                            label="Select Variant"
                        >
                            {filteredVariants.map((variant) => (
                                <MenuItem key={variant._id} value={variant._id}>
                                    {variant.variant_name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </FormControl>

                    <FormControl fullWidth>
                        <Autocomplete
                            multiple
                            disableCloseOnSelect
                            options={variantAttributes}
                            getOptionLabel={(option) => option.attribute_value || ""}
                            value={variantAttributes.filter(attr =>
                                condition.value?.attributeIds?.includes(attr._id)
                            ) || []}
                            onChange={(event, newValue) => {
                                const attributeIds = newValue.map(attr => attr._id);
                                const newConditions = [...formValues.conditions];
                                newConditions[index].value = {
                                    ...condition.value,
                                    attributeIds: attributeIds
                                };
                                setFormValues(prev => ({...prev, conditions: newConditions}));
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Attributes"
                                    sx={{
                                        "& .MuiInputBase-root": {
                                            height: selectedAttributesCount > 1 ? "auto" : "40px",
                                            minHeight: "40px"
                                        }
                                    }}
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                        />
                    </FormControl>
                </Box>
            );
        }

        // Default autocomplete for other fields
        return (
            <Autocomplete
                multiple
                options={getValueOptions(field)}
                getOptionLabel={(option) => getOptionLabel(option, field)}
                value={condition.value || []}
                onChange={(event, newValue) => {
                    const newConditions = [...formValues.conditions];
                    newConditions[index].value = newValue;
                    setFormValues(prev => ({...prev, conditions: newConditions}));
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select values"
                        sx={{
                            "& .MuiInputBase-root": {
                                height: "40px",
                                minHeight: "40px"
                            }
                        }}
                    />
                )}
                isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                }
            />
        );
    };

    // Helper function to render attribute value input based on attribute type
    const renderAttributeValueInput = (attribute, condition, index) => {
        if (!attribute) {
            return (
                <TextField
                    label="Select Attribute First"
                    disabled
                    sx={{
                        "& .MuiInputBase-root": {height: "40px"}
                    }}
                />
            );
        }

        const attributeValues = attribute.values || [];
        const selectedValuesCount = condition.value?.valueIds?.length || 0;

        switch (attribute.type) {
            case "Dropdown":
                return (
                    <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={attributeValues}
                        getOptionLabel={(option) => option.value || ""}
                        value={attributeValues.filter(val =>
                            condition.value?.valueIds?.includes(val._id)
                        )}
                        onChange={(event, newValue) => {
                            const valueIds = newValue.map(val => val._id);
                            const newConditions = [...formValues.conditions];
                            newConditions[index].value = {
                                ...condition.value,
                                valueIds: valueIds
                            };
                            setFormValues(prev => ({...prev, conditions: newConditions}));
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={`Select ${attribute.multiSelect ? 'Values' : 'Value'}`}
                                sx={{
                                    "& .MuiInputBase-root": {
                                        height: selectedValuesCount > 1 ? "auto" : "40px",
                                        minHeight: "40px"
                                    }
                                }}
                            />
                        )}
                        isOptionEqualToValue={(option, value) => option._id === value._id}
                    />
                );

            case "Yes/No":
                const yesNoOptions = [
                    {_id: "yes", value: "Yes"},
                    {_id: "no", value: "No"}
                ];

                return (
                    <TextField
                        select
                        sx={{
                            "& .MuiInputBase-root": {height: "40px"}
                        }}
                        value={condition.value?.valueIds?.[0] || ""}
                        onChange={(e) => {
                            const newConditions = [...formValues.conditions];
                            newConditions[index].value = {
                                ...condition.value,
                                valueIds: [e.target.value]
                            };
                            setFormValues(prev => ({...prev, conditions: newConditions}));
                        }}
                        label="Select Value"
                    >
                        {yesNoOptions.map((option) => (
                            <MenuItem key={option._id} value={option._id}>
                                {option.value}
                            </MenuItem>
                        ))}
                    </TextField>
                );

            default:
                return (
                    <TextField
                        select
                        sx={{
                            "& .MuiInputBase-root": {height: "40px"}
                        }}
                        value={""}
                        onChange={(e) => {

                        }}
                        disabled
                        label="Select Value"
                    >
                        <MenuItem value={""}>
                            No Option
                        </MenuItem>
                    </TextField>
                );
        }
    };

    // Helper function to render sub-attribute value input
    const renderSubAttributeValueInput = (subAttribute, condition, index) => {
        const subAttributeValues = subAttribute.values || [];

        switch (subAttribute.type) {
            case "Dropdown":
                return (
                    <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={subAttributeValues}
                        getOptionLabel={(option) => option.value || ""}
                        value={subAttributeValues.filter(val =>
                            condition.value?.valueIds?.includes(val._id)
                        )}
                        onChange={(event, newValue) => {
                            const valueIds = newValue.map(val => val._id);
                            const newConditions = [...formValues.conditions];
                            newConditions[index].value = {
                                ...condition.value,
                                valueIds: valueIds
                            };
                            setFormValues(prev => ({...prev, conditions: newConditions}));
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={`Select ${subAttribute.multiSelect ? 'Values' : 'Value'}`}
                                sx={{
                                    "& .MuiInputBase-root": {
                                        height: "auto",
                                        minHeight: "40px"
                                    }
                                }}
                            />
                        )}
                        isOptionEqualToValue={(option, value) => option._id === value._id}
                    />
                );

            case "Yes/No":
                const yesNoOptions = [
                    {_id: "yes", value: "Yes"},
                    {_id: "no", value: "No"}
                ];

                return (
                    <TextField
                        select
                        sx={{
                            "& .MuiInputBase-root": {height: "40px"}
                        }}
                        value={condition.value?.valueIds?.[0] || ""}
                        onChange={(e) => {
                            const newConditions = [...formValues.conditions];
                            newConditions[index].value = {
                                ...condition.value,
                                valueIds: [e.target.value]
                            };
                            setFormValues(prev => ({...prev, conditions: newConditions}));
                        }}
                        label="Select Value"
                    >
                        {yesNoOptions.map((option) => (
                            <MenuItem key={option._id} value={option._id}>
                                {option.value}
                            </MenuItem>
                        ))}
                    </TextField>
                );

            default:
                return (
                    <TextField
                        select
                        sx={{
                            "& .MuiInputBase-root": {height: "40px"}
                        }}
                        value={""}
                        onChange={(e) => {

                        }}
                        disabled
                        label="Select Value"
                    >
                        <MenuItem value={""}>
                            No Option
                        </MenuItem>
                    </TextField>
                );
        }
    };

    // Add new condition
    const addCondition = () => {
        setFormValues(prev => ({
            ...prev,
            conditions: [...prev.conditions, {field: "", operator: "", value: ""}]
        }));
    };

    // Get parent categories for dropdown
    const getParentMainCategories = async () => {
        try {
            const res = await ApiService.get(apiEndpoints.getParentCatgory, auth_key);
            if (res.status === 200) {
                setParentMainCategories(res?.data?.data || []);
            }
        } catch (error) {
            console.error("Error fetching parent categories:", error);
            setParentMainCategories([]);
        }
    };

    // Remove condition
    const removeCondition = (index) => {
        const newConditions = formValues.conditions.filter((_, i) => i !== index);
        setFormValues(prev => ({...prev, conditions: newConditions}));
    };

    // Update condition field
    const updateConditionField = (index, field, value) => {
        const newConditions = [...formValues.conditions];
        newConditions[index][field] = value;

        // Reset value when field changes
        if (field === 'field') {
            newConditions[index].value = "";
            newConditions[index].operator = "";
        }

        setFormValues(prev => ({...prev, conditions: newConditions}));
    };

    return (
        <ThemeProvider theme={theme}>
            <MuiContainer>
                <StyledContainer>
                    <Box sx={{py: "16px", marginBottom: "20px"}} component={Paper}>
                        <Stack sx={{ml: "24px", mb: "12px"}} gap={1} direction={"row"}>
                            <Box>
                                <AppsIcon/>
                            </Box>
                            <Box>
                                <Typography sx={{fontWeight: "600", fontSize: "18px"}}>Go To</Typography>
                            </Box>
                        </Stack>
                        <Divider/>
                        <Box sx={{ml: "24px", mt: "16px"}}>
                            <Button
                                onClick={() => navigate(ROUTE_CONSTANT.catalog.adminCategory.list)}
                                startIcon={<AppsIcon/>}
                                variant="contained"
                            >
                                Admin Category List
                            </Button>
                        </Box>
                    </Box>
                    <h2>{queryId ? "Edit Admin Category" : "Add Admin Category"}</h2>
                    <form>
                        {/* Category and Title in row */}
                        <Grid container spacing={2} sx={{marginBottom: 4}}>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                    <Typography sx={{minWidth: '120px', fontWeight: 'bold'}}>
                                        Category:
                                    </Typography>
                                    <Box sx={{flex: 1}}>
                                        {getActiveAdminCategory.length === 0 ? (
                                            <Stack sx={{position: "relative"}}>
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
                                                            <Stack sx={{position: "relative"}}>
                                                                <TextField
                                                                    sx={{
                                                                        bgcolor: "#F0F0F0",
                                                                        cursor: "pointer",
                                                                        height: "40px",
                                                                        outline: "none",
                                                                        "& .MuiInputBase-root": {height: "40px"}
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
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                    <Typography sx={{minWidth: '120px', fontWeight: 'bold'}}>
                                        Title:
                                    </Typography>
                                    <Box sx={{flex: 1}}>
                                        <TextField
                                            error={errors.title && true}
                                            helperText={errors.title}
                                            onBlur={() => {
                                                if (!formValues.title) {
                                                    setErrors((prv) => ({...prv, title: "Title is Required"}));
                                                }
                                            }}
                                            type="text"
                                            variant="outlined"
                                            color="primary"
                                            fullWidth
                                            name="title"
                                            placeholder="Title"
                                            onChange={handleChange}
                                            value={formValues?.title}
                                            sx={{
                                                "& .MuiInputBase-root": {
                                                    height: "40px"
                                                }
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>

                        {/* Tags and Restricted Keywords */}
                        <Box>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                <Typography sx={{minWidth: '120px', fontWeight: 'bold'}}>
                                    Restricted Keywords:
                                </Typography>
                                <Box sx={{flex: 1}}>
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
                                                placeholder="Enter Restricted Keywords ..."
                                                sx={{
                                                    "& .MuiInputBase-root": {
                                                        padding: "0 11px",
                                                    }
                                                }}
                                            />
                                        )}
                                        onChange={handleRestritedTagHandler}
                                        value={formValues.restrictedTags}
                                        isOptionEqualToValue={(option, value) => option === value}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        {/* Image Upload */}
                        <Box sx={{mb: 3}}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                <Typography sx={{minWidth: '120px', fontWeight: 'bold'}}>
                                    Category Image:
                                </Typography>
                                <Box sx={{flex: 1}}>
                                    <TextField
                                        sx={{
                                            "& .MuiInputBase-root": {
                                                height: "40px"
                                            }
                                        }}
                                        fullWidth
                                        value={image?.name}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <AttachFileIcon/>
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    style={{display: "none"}}
                                                    id="file-input"
                                                    onChange={(event) => {
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
                            </Box>
                            {imgUrl && <img style={{margin: "16px 0"}} src={imgUrl} width={200} alt=""/>}
                        </Box>

                        {/* AUTOMATION SECTION - Updated with Label: Input layout */}
                        <Box sx={{
                            mb: 3,
                            mt: 3,
                            p: 3,
                            border: '1px solid #e0e0e0',
                            borderRadius: 2,
                            width: '100%',
                            maxWidth: '100%',
                            boxSizing: 'border-box'
                        }}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                <Typography sx={{minWidth: '120px', fontWeight: 'bold'}}>
                                    Automatic:
                                </Typography>
                                <FormControl component="fieldset">
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={formValues.isAutomatic}
                                                onChange={(e) => setFormValues(prev => ({
                                                    ...prev,
                                                    isAutomatic: e.target.checked
                                                }))}
                                                name="automatic"
                                            />
                                        }
                                        label="Enable automatic category assignment"
                                    />
                                </FormControl>
                            </Box>

                            {formValues.isAutomatic && (
                                <Box sx={{mt: 2, width: '100%'}}>
                                    <Typography variant="h6" sx={{mb: 2, fontWeight: "bold"}}>
                                        Conditions
                                    </Typography>

                                    {/* Category Scope */}
                                    <Box sx={{mb: 3}}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 1}}>
                                            <Typography sx={{minWidth: '120px', fontWeight: 'bold'}}>
                                                Category Scope:
                                            </Typography>
                                            <RadioGroup
                                                row
                                                value={formValues.categoryScope}
                                                onChange={(e) => setFormValues(prev => ({
                                                    ...prev,
                                                    categoryScope: e.target.value
                                                }))}
                                            >
                                                <FormControlLabel
                                                    value="all"
                                                    control={<Radio/>}
                                                    label="All Categories"
                                                />
                                                <FormControlLabel
                                                    value="specific"
                                                    control={<Radio/>}
                                                    label="Specific Categories"
                                                />
                                            </RadioGroup>
                                        </Box>

                                        {formValues.categoryScope === "specific" && (
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                <Typography sx={{minWidth: '120px', fontWeight: 'bold'}}>
                                                    Select Categories:
                                                </Typography>
                                                <Box sx={{flex: 1}}>
                                                    <Autocomplete
                                                        multiple
                                                        options={parentMainCategories}
                                                        getOptionLabel={(option) => option.title || ''}
                                                        value={formValues.selectedCategories}
                                                        onChange={(event, newValue) => setFormValues(prev => ({
                                                            ...prev,
                                                            selectedCategories: newValue
                                                        }))}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                placeholder="Choose categories"
                                                            />
                                                        )}
                                                        isOptionEqualToValue={(option, value) => option._id === value._id}
                                                    />
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Product Match Logic */}
                                    <Box sx={{mb: 3}}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 1}}>
                                            <Typography sx={{minWidth: '120px', fontWeight: 'bold'}}>
                                                Match Logic:
                                            </Typography>
                                            <RadioGroup
                                                row
                                                name="conditionType"
                                                value={formValues.conditionType}
                                                onChange={(e) => setFormValues(prev => ({
                                                    ...prev,
                                                    conditionType: e.target.value
                                                }))}
                                            >
                                                <FormControlLabel
                                                    value="all"
                                                    control={<Radio/>}
                                                    label="All conditions (AND)"
                                                />
                                                <FormControlLabel
                                                    value="any"
                                                    control={<Radio/>}
                                                    label="Any conditions (OR)"
                                                />
                                            </RadioGroup>
                                        </Box>
                                    </Box>

                                    {/* Dynamic Conditions */}
                                    <Box>
                                        {formValues.conditions.map((condition, index) => {
                                            const fieldOptions = [
                                                "Product Title",
                                                "Product Tag",
                                                "Attributes Tag",
                                                "Variant Tag"
                                            ];

                                            const operatorOptions = getOperatorsForField(condition.field);

                                            return (
                                                <Grid container spacing={2} alignItems="center" sx={{mb: 2}}
                                                      key={index}>
                                                    <Grid item xs={12} sm={3}>
                                                        <FormControl fullWidth>
                                                            <TextField
                                                                select
                                                                sx={{
                                                                    "& .MuiInputBase-root": {height: "40px"},
                                                                }}
                                                                label="Field"
                                                                value={condition.field}
                                                                onChange={(e) => updateConditionField(index, 'field', e.target.value)}
                                                            >
                                                                {fieldOptions.map((option) => (
                                                                    <MenuItem key={option} value={option}>
                                                                        {option}
                                                                    </MenuItem>
                                                                ))}
                                                            </TextField>
                                                        </FormControl>
                                                    </Grid>

                                                    <Grid item xs={12} sm={3}>
                                                        <FormControl fullWidth>
                                                            <TextField
                                                                select
                                                                sx={{
                                                                    "& .MuiInputBase-root": {height: "40px"},
                                                                }}
                                                                label="Operator"
                                                                value={condition.operator}
                                                                onChange={(e) => updateConditionField(index, 'operator', e.target.value)}
                                                            >
                                                                {operatorOptions.map((option) => (
                                                                    <MenuItem key={option} value={option}>
                                                                        {option}
                                                                    </MenuItem>
                                                                ))}
                                                            </TextField>
                                                        </FormControl>
                                                    </Grid>

                                                    <Grid item xs={12} sm={5}>
                                                        <FormControl fullWidth>
                                                            {renderValueInput(condition, index)}
                                                        </FormControl>
                                                    </Grid>

                                                    <Grid item xs={12} sm={1}>
                                                        <IconButton
                                                            onClick={() => removeCondition(index)}
                                                            color="error"
                                                        >
                                                            <DeleteIcon/>
                                                        </IconButton>
                                                    </Grid>
                                                </Grid>
                                            );
                                        })}

                                        <Button
                                            startIcon={<AddIcon/>}
                                            variant="outlined"
                                            onClick={addCondition}
                                            sx={{mt: 1}}
                                        >
                                            Add another condition
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        <Button
                            endIcon={loading ? <CircularProgress size={15}/> : ""}
                            disabled={loading ? true : false}
                            sx={{mr: "16px"}}
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                        >
                            Submit
                        </Button>
                    </form>
                </StyledContainer>
            </MuiContainer>
            <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg}/>
        </ThemeProvider>
    );
};

export default Add;
