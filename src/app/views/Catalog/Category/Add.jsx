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
    // Card,
    // CardContent
} from "@mui/material";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import AttachFileIcon from "@mui/icons-material/AttachFile";
// import { toast } from "react-toastify";
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
// import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

// import { autocompleteClasses } from "@mui/material/Autocomplete";

import Autocomplete from "@mui/material/Autocomplete";
// import { TextRotateVerticalRounded } from "@mui/icons-material";
import ConfirmModal from "app/components/ConfirmModal";
import { useCallback } from "react";
import { useRef } from "react";

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

// const ITEM_HEIGHT = 48;
// const ITEM_PADDING_TOP = 8;

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
    const [query] = useSearchParams();
    const [allActiveCategory, setAllActiveCategory] = useState([]);
    const [selectedCatLable, setSelectedCatLable] = useState("Select Category");
    const [selectedCatId, setSelectedCatId] = useState("");
    console.log({ selectedCatId })
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    // const [render, setRander] = useState(true);
    const [varintList, setVariantList] = useState([]);
    const [attributeList, setAttributeList] = useState([]);
    // const [editCatLable, setEditCatLable] = useState("");
    // const [selectdVariantLable, setSelectedVarintLabel] = useState([]);
    // const [endCatName, setEndCatName] = useState("");
    const [topRatedImg, setTopRatedImg] = useState(null);
    const [topRatedUrl, setTopRatedUrl] = useState(null);
    console.log("selectedCatLable------", selectedCatLable);

    // State for dynamic dropdown data
    const [parentCategories, setParentCategories] = useState([]);
    const [isParentCategoriesLoaded, setIsParentCategoriesLoaded] = useState(false);

    // New states for conditions
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [categoryScope, setCategoryScope] = useState("all"); // "all" or "specific"
    const [isAutomatic, setIsAutomatic] = useState(false);
    const [filteredVariants, setFilteredVariants] = useState([]);
    const [filteredAttributes, setFilteredAttributes] = useState([]);

    // State to track parent category data
    // const [parentCategoryData, setParentCategoryData] = useState(null);

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Name is required"),
        description: Yup.string().required("Description is required"),
        metaTitle: Yup.string().required("Meta Title is required"),
        metaKeywords: Yup.string().required("Meta Keywords is required"),
        metaDescription: Yup.string().required("Meta Description is required"),
    });

    // const [selectedVariant, setSelectedVariant] = useState([]);
    const [selectedVariantIds, setSelectedVariantIds] = useState([]);
    const [SelectedEditVariant, setSelectedEditVariant] = useState([]);
    const [SelectedEditAttribute, setSelectedEditAttribute] = useState([]);

    // const [search, setSearch] = useState("");
    // const [SearchList, setSearchList] = useState([]);

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

    const handleOpen = useCallback((type, msg) => {
        setMsg(msg?.message);
        setOpen(true);
        setType(type);
        if (msg?.response?.status === 401) {
            logOut();
        }
    }, [])

    const handleClose = () => {
        setOpen(false);
        if (route !== null) {
            navigate(route);
        }
        setRoute(null);
        setMsg(null);
    };

    // const handleChange = (event, value) => {
    //     setSelectedVariantIds(value.map((option) => option._id));
    //     setSelectedEditVariant(value);
    // };

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
        // If isAutomatic is false, don't send any conditions
        if (!isAutomatic) {
            return [];
        }

        // Filter out empty conditions and convert valid ones
        const validConditions = conditions
            .filter(condition => {
                // Check if condition has all required fields and values
                return condition.field && condition.operator && condition.value;
            })
            .map(condition => ({
                field: condition.field,
                operator: condition.operator,
                value: extractValueIds(condition.value, condition.field)
            }));

        return validConditions;
    };

    // Improved findObjectsByIds function with better error handling
    const findObjectsByIds = (ids, options) => {
        if (!ids || !Array.isArray(ids) || !options || !Array.isArray(options)) return [];

        console.log("Finding objects by IDs:", { ids, optionsLength: options.length });

        return ids.map(id => {
            if (typeof id === 'object') return id; // Already an object

            // Find the object with matching _id
            const found = options.find(option => {
                // Handle both _id and id properties
                const optionId = option._id || option.id;
                return optionId === id;
            });

            if (found) {
                console.log("Found object for ID:", id, found.title);
                return found;
            } else {
                console.warn("No object found for ID:", id);
                return null;
            }
        }).filter(Boolean); // Remove null values
    };

    // Improved processInitialConditions function
    const processInitialConditions = (conditions) => {
        if (!conditions || !Array.isArray(conditions)) return [{ field: "", operator: "", value: "" }];

        return conditions.map(condition => {
            let value = condition.value;

            // If value contains IDs, convert them to objects for display
            if (condition.value && Array.isArray(condition.value)) {
                const options = getValueOptions(condition.field);
                console.log("Processing condition value:", {
                    field: condition.field,
                    value: condition.value,
                    optionsLength: options?.length
                });
                value = findObjectsByIds(condition.value, options);
            }

            return {
                field: condition.field || "",
                operator: condition.operator || "",
                value: value || ""
            };
        });
    };

    // Get parent category data when selectedCatId changes
    const getParentCategoryData = useCallback(async (parentId) => {
        if (!parentId) return;

        try {
            const res = await ApiService.get(`${apiEndpoints.editCategory}/${parentId}`, auth_key);
            if (res.status === 200) {
                // setParentCategoryData(res?.data?.data);

                // Auto-populate variants and attributes if current selection is empty
                if (SelectedEditVariant.length === 0 && res?.data?.data?.variant_data?.length > 0) {
                    setSelectedEditVariant(res?.data?.data?.variant_data || []);
                }

                if (SelectedEditAttribute.length === 0 && res?.data?.data?.attributeList_data?.length > 0) {
                    setSelectedEditAttribute(res?.data?.data?.attributeList_data || []);
                }
            }
        } catch (error) {
            console.error("Error fetching parent category data:", error);
        }
    }, [auth_key])

    // Get filtered variants and attributes based on selected categories
    const getFilteredVariantsAndAttributes = useCallback(async (categoryIds) => {
        if (categoryIds.length === 0 || categoryScope === "all") {
            setFilteredVariants(varintList);
            setFilteredAttributes(attributeList);
            return;
        }

        try {
            const res = await ApiService.post(`${apiEndpoints.getCategoryFullDetails}`, { categoryIds }, auth_key);

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
    }, [attributeList, auth_key, categoryScope, varintList]);

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
            conditionType: values.conditionType,
            bestseller: values.bestSelling,
            restricted_keywords: values.tags,
            isAutomatic: isAutomatic,
            categoryScope: categoryScope,
            selectedCategories: selectedCategories.map(cat => cat._id)
        };

        if (isAutomatic) {
            payload.conditions = processedConditions;
        }

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
                        await handleUploadImage(getCatData._id, res?.data);
                    } else {
                        await handleUploadImage(res?.data?.data?._id, res?.data);
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
            image && formData.append("file", image);
            topRatedImg && formData.append("image", topRatedImg);
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

    // Get parent categories for dropdown
    const getParentCategories = useCallback(async () => {
        try {
            console.log("Fetching parent categories...");
            const res = await ApiService.get(apiEndpoints.getParentCatgory, auth_key);
            if (res.status === 200) {
                const categories = res?.data?.data || [];
                console.log("Loaded parent categories:", categories.length, categories);
                setParentCategories(categories);
                setIsParentCategoriesLoaded(true);

                // If we have selected categories from getCatData but they're not loaded yet, set them now
                if (queryId && getCatData?.selectedCategories) {
                    console.log("Setting selected categories after parentCategories load");
                    const selectedCats = findObjectsByIds(getCatData.selectedCategories, categories);
                    console.log("Found selected categories:", selectedCats);
                    setSelectedCategories(selectedCats);
                }
            }
        } catch (error) {
            console.error("Error fetching parent categories:", error);
            setParentCategories([]);
            setIsParentCategoriesLoaded(true);
        }
    }, [auth_key, getCatData.selectedCategories, queryId])


    const catData = useCallback(async (id) => {
        try {
            const res = await ApiService.get(`${apiEndpoints.editCategory}/${id}`, auth_key);
            if (res.status === 200) {
                // setSelectedCatLable(res?.data?.data?.title);
            }
        } catch (error) {
            handleOpen("error", error?.response?.data || error);
        }
    }, [auth_key, handleOpen])

    const getCategoryData = async () => {
        if (queryId) {
            try {
                console.log("Getting category data for:", queryId);
                const res = await ApiService.get(`${apiEndpoints.editCategory}/${queryId}`, auth_key);
                if (res.status === 200) {
                    console.log("Category data received:", res?.data?.data);
                    setTopRatedUrl(res?.data?.data?.topRatedImage);
                    setCatData(res?.data?.data);
                    setSelectedCatId(res?.data?.data?.parent_id);

                    if (res?.data?.data?.parent_id) {
                        catData(res?.data?.data?.parent_id);
                        // Get parent category data for auto-population
                        getParentCategoryData(res?.data?.data?.parent_id);
                    } else {
                        setSelectedCatLable("Select Category");
                    }

                    setSelectedEditVariant(res?.data?.data?.variant_data || []);
                    setSelectedEditAttribute(res?.data?.data?.attributeList_data || []);

                    // Set initial conditions data
                    if (res?.data?.data?.isAutomatic) {
                        setIsAutomatic(true);
                    }
                    if (res?.data?.data?.categoryScope) {
                        setCategoryScope(res?.data?.data?.categoryScope);
                    }

                    // Don't set selectedCategories here - let the useEffect handle it
                    // when parentCategories are loaded

                    // Just store the data, the useEffect will handle it
                    setCatData(res?.data?.data);
                }
            } catch (error) {
                handleOpen("error", error?.response?.data || error);
            }
        }
    };

    const getCateLabel = useCallback(async () => {
        try {
            if (getCatData?.parent_id) {
                const res = await ApiService.get(apiEndpoints.getParentCatgory, auth_key);

                if (res.status === 200) {
                    const find = res?.data?.data.find((item) => item._id === getCatData?.parent_id);
                    setSelectedCatLable(find.title);
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
    }, [auth_key, getCatData?.parent_id, handleOpen]);


    const getAllActiveCategory = useCallback(async () => {
        try {
            const res = await ApiService.get(apiEndpoints.getAllActiveCategory, auth_key);
            if (res?.status === 200) {
                setAllActiveCategory([{ subs: res?.data?.subCatgory }]);
                // setRander(false);
            }
        } catch (error) {
            handleOpen("error", error?.response?.data || error);
        }
    }, [auth_key, handleOpen]);

    const getVaraintList = useCallback(async () => {
        const typeParam = "type=Category";
        const urlWithParam = `${apiEndpoints.getVariant}?${typeParam}&fulldata=true`;
        try {
            const res = await ApiService.get(urlWithParam, auth_key);
            console.log("resresres", res);
            if (res.status === 200) {
                setVariantList(res?.data?.data || []);
                // setSearchList(res?.data?.data || []);
                setFilteredVariants(res?.data?.data || []);
            }
        } catch (error) {
            handleOpen("error", error?.response?.data || error);
            setVariantList([]);
            // setSearchList([]);
            setFilteredVariants([]);
        }
    }, [auth_key, handleOpen]);

    const getAttributeList = useCallback(async () => {
        try {
            const res = await ApiService.get("get-attribute-list?fulldata=true", auth_key);
            if (res?.data?.success) {
                setAttributeList(res?.data?.data || []);
                setFilteredAttributes(res?.data?.data || []);
            }
        } catch (error) {
            handleOpen("error", error?.response?.data || error);
            setAttributeList([]);
            setFilteredAttributes([]);
        }
    }, [auth_key, handleOpen]);

    // Load all initial data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                await Promise.all([
                    getAllActiveCategory(),
                    getVaraintList(),
                    getAttributeList(),
                    getParentCategories() // Ensure parent categories are loaded first
                ]);
            } catch (error) {
                console.error("Error loading initial data:", error);
            }
        };

        loadInitialData();
    }, [getAllActiveCategory, getAttributeList, getParentCategories, getVaraintList]);

    // Load category data when queryId changes and parent categories are loaded
    useEffect(() => {
        if (queryId && isParentCategoriesLoaded) {
            getCategoryData();
        }
    }, [queryId, isParentCategoriesLoaded]);

    // Fix 1: Use a ref to track if we've already processed the initial data
    const hasProcessedInitialData = useRef(false);

    // Fix 2: Update the problematic useEffect
    useEffect(() => {
        if (queryId &&
            getCatData?.selectedCategories &&
            isParentCategoriesLoaded &&
            parentCategories.length > 0 &&
            !hasProcessedInitialData.current) {

            console.log("Re-setting selected categories with loaded parentCategories");
            const selectedCats = findObjectsByIds(getCatData.selectedCategories, parentCategories);
            console.log("Final selected categories:", selectedCats);
            setSelectedCategories(selectedCats);

            // Mark as processed to prevent infinite loop
            hasProcessedInitialData.current = true;
        }
    }, [parentCategories, isParentCategoriesLoaded, queryId]); // Remove getCatData from dependencies

    // Fix 3: Reset the ref when queryId changes
    useEffect(() => {
        hasProcessedInitialData.current = false;
    }, [queryId]);

    useEffect(() => {
        if (getCatData?.parent_id) {
            getCateLabel();
        }
    }, [getCatData?.parent_id, getCateLabel]);

    // Replace the problematic useEffect with this:
    useEffect(() => {
        // Only run this once when parent categories are loaded
        if (queryId && isParentCategoriesLoaded && parentCategories.length > 0) {
            const shouldSetSelectedCategories =
                getCatData?.selectedCategories &&
                selectedCategories.length === 0; // Only set if not already set

            if (shouldSetSelectedCategories) {
                console.log("Setting selected categories from API");
                const selectedCats = findObjectsByIds(getCatData.selectedCategories, parentCategories);
                console.log("Found selected categories:", selectedCats);
                setSelectedCategories(selectedCats);
            }
        }
    }, [isParentCategoriesLoaded, queryId, parentCategories]); // Remove getCatData

    // Effect to get parent category data when selectedCatId changes
    useEffect(() => {
        if (selectedCatId) {
            getParentCategoryData(selectedCatId);
        }
    }, [getParentCategoryData, selectedCatId]);

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
                            // setSelectedVarintLabel([]);
                            // setSelectedVariant([]);
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
        setIsAutomatic(false);
        setCategoryScope("all");
        setSelectedCategories([]);
        // setParentCategoryData(null);
    };

    const findObjectByTitle = useCallback((data, title) => {
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
    }, [])

    useEffect(() => {
        findObjectByTitle(allActiveCategory, selectedCatLable);
    }, [allActiveCategory, findObjectByTitle, selectedCatLable]);

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

    // Enhanced renderValueInput function with compound attribute support
    const renderValueInput = (condition, index, setFieldValue) => {
        const field = condition.field;

        if (field === "Product Title" || field === "Product Tag") {
            return (
                <TextField
                    fullWidth
                    value={condition.value || ""}
                    onChange={(e) => setFieldValue(`conditions.${index}.value`, e.target.value)}
                    placeholder="Enter value"
                    sx={{
                        "& .MuiInputBase-root": { height: "40px" },
                        "& .MuiFormLabel-root": { top: "-7px" },
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {/* Attribute Selection */}
                        <FormControl fullWidth>
                            <TextField
                                select
                                sx={{
                                    "& .MuiInputBase-root": { height: "40px" }
                                }}
                                value={condition.value?.attributeId || ""}
                                onChange={(e) => {
                                    // const newAttribute = filteredAttributes.find(attr => attr._id === e.target.value);
                                    const newValue = {
                                        attributeId: e.target.value,
                                        subAttributeId: "",
                                        value: ""
                                    };
                                    setFieldValue(`conditions.${index}.value`, newValue);
                                }}
                                label="Select Attribute"
                            >
                                {filteredAttributes.map((attribute) => (
                                    <MenuItem key={attribute._id} value={attribute._id}>
                                        {attribute.name} {attribute.type === "Compound" ? "(Compound)" : ""}
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
                                        "& .MuiInputBase-root": { height: "40px" }
                                    }}
                                    value={condition.value?.subAttributeId || ""}
                                    onChange={(e) => {
                                        const newValue = {
                                            ...condition.value,
                                            subAttributeId: e.target.value,
                                            value: ""
                                        };
                                        setFieldValue(`conditions.${index}.value`, newValue);
                                    }}
                                    label="Select Sub-Attribute"
                                >
                                    {subAttributes.map((subAttr) => (
                                        <MenuItem key={subAttr._id} value={subAttr._id}>
                                            {subAttr.name} ({subAttr.type})
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </FormControl>
                        )}

                        {/* Value Input based on selected sub-attribute type */}
                        {selectedSubAttribute && (
                            <FormControl fullWidth>
                                {renderSubAttributeValueInput(selectedSubAttribute, condition, index, setFieldValue)}
                            </FormControl>
                        )}
                    </Box>
                );
            }

            // Handle regular attributes (Dropdown, Yes/No, Text)
            // const attributeValues = selectedAttribute?.values || [];
            const selectedValuesCount = condition.value?.valueIds?.length || 0;

            return (
                <Box sx={{ display: 'flex', flexDirection: selectedValuesCount > 1 ? 'column' : 'row', gap: 1 }}>
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
                                const newValue = {
                                    attributeId: e.target.value,
                                    valueIds: []
                                };
                                setFieldValue(`conditions.${index}.value`, newValue);
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
                        {renderAttributeValueInput(selectedAttribute, condition, index, setFieldValue)}
                    </FormControl>
                </Box>
            );
        }

        if (field === "Variant Tag") {
            const selectedVariantType = filteredVariants.find(variant => variant._id === condition.value?.variantId);
            const variantAttributes = selectedVariantType?.attributes || [];
            const selectedAttributesCount = condition.value?.attributeIds?.length || 0;

            return (
                <Box sx={{ display: 'flex', flexDirection: selectedAttributesCount > 1 ? 'column' : 'row', gap: 1 }}>
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
                                const newValue = {
                                    variantId: e.target.value,
                                    attributeIds: []
                                };
                                setFieldValue(`conditions.${index}.value`, newValue);
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
                            options={variantAttributes}
                            getOptionLabel={(option) => option.attribute_value || ""}
                            value={variantAttributes.filter(attr =>
                                condition.value?.attributeIds?.includes(attr._id)
                            ) || []}
                            onChange={(event, newValue) => {
                                const attributeIds = newValue.map(attr => attr._id);
                                setFieldValue(`conditions.${index}.value`, {
                                    ...condition.value,
                                    attributeIds: attributeIds
                                });
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
                    setFieldValue(`conditions.${index}.value`, newValue);
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
                    getOptionValue(option, field) === getOptionValue(value, field)
                }
            />
        );
    };

    // Helper function to render attribute value input based on attribute type
    const renderAttributeValueInput = (attribute, condition, index, setFieldValue) => {
        if (!attribute) {
            return (
                <TextField
                    label="Select Attribute First"
                    disabled
                    sx={{
                        "& .MuiInputBase-root": { height: "40px" }
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
                            setFieldValue(`conditions.${index}.value`, {
                                ...condition.value,
                                valueIds: valueIds
                            });
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
                    { _id: "yes", value: "Yes" },
                    { _id: "no", value: "No" }
                ];

                return (
                    <TextField
                        select
                        sx={{
                            "& .MuiInputBase-root": { height: "40px" }
                        }}
                        value={condition.value?.valueIds?.[0] || ""}
                        onChange={(e) => {
                            setFieldValue(`conditions.${index}.value`, {
                                ...condition.value,
                                valueIds: [e.target.value]
                            });
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
                            "& .MuiInputBase-root": { height: "40px" }
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
    const renderSubAttributeValueInput = (subAttribute, condition, index, setFieldValue) => {
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
                            setFieldValue(`conditions.${index}.value`, {
                                ...condition.value,
                                valueIds: valueIds
                            });
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
                    { _id: "yes", value: "Yes" },
                    { _id: "no", value: "No" }
                ];

                return (
                    <TextField
                        select
                        sx={{
                            "& .MuiInputBase-root": { height: "40px" }
                        }}
                        value={condition.value?.valueIds?.[0] || ""}
                        onChange={(e) => {
                            setFieldValue(`conditions.${index}.value`, {
                                ...condition.value,
                                valueIds: [e.target.value]
                            });
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
                            "& .MuiInputBase-root": { height: "40px" }
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

    console.log("Current state:", {
        parentCategories: parentCategories.length,
        isParentCategoriesLoaded,
        selectedCategories: selectedCategories.length,
        getCatDataSelected: getCatData?.selectedCategories?.length
    });

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
                                setFieldValue("tags", [...new Set(processedValues)]);
                            };

                            return <Form>
                                {/* Category and Title in row */}
                                <Grid container spacing={2} sx={{ marginBottom: 4 }}>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Typography sx={{ minWidth: '120px', fontWeight: 'bold' }}>
                                                Category:
                                            </Typography>
                                            <Box sx={{ flex: 1 }}>
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
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Typography sx={{ minWidth: '120px', fontWeight: 'bold' }}>
                                                Title:
                                            </Typography>
                                            <Box sx={{ flex: 1 }}>
                                                <Field
                                                    as={TextField}
                                                    type="text"
                                                    variant="outlined"
                                                    color="primary"
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
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>

                                {/* Best Selling Radio Group */}
                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <Typography sx={{ minWidth: '120px', fontWeight: 'bold' }}>
                                            Best Selling:
                                        </Typography>
                                        <FormControl>
                                            <RadioGroup
                                                row
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

                                {/* File Uploads */}
                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                                            <Typography sx={{ minWidth: '120px', fontWeight: 'bold' }}>
                                                Category Image:
                                            </Typography>
                                            <Box sx={{ flex: 1 }}>
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
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                                            <Typography sx={{ minWidth: '120px', fontWeight: 'bold' }}>
                                                Top Rated Image:
                                            </Typography>
                                            <Box sx={{ flex: 1 }}>
                                                <TextField
                                                    fullWidth
                                                    value={topRatedImg?.name}
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
                                                    <img style={{ margin: "16px 0" }} src={topRatedUrl} width={200} alt="" />
                                                )}
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>

                                {/* Variants and Attributes */}
                                <Box spacing={2} sx={{ mb: 3 }}>
                                    <Box sx={{ mb: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Typography sx={{ minWidth: '120px', fontWeight: 'bold' }}>
                                                Variants:
                                            </Typography>
                                            <Box sx={{ flex: 1 }}>
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
                                                                placeholder="Select Variant"
                                                                sx={{
                                                                    "& .MuiInputBase-root": {
                                                                        height: "auto"
                                                                    }
                                                                }}
                                                            />
                                                        );
                                                    }}
                                                    onChange={(event, value) => setSelectedEditVariant(value || [])}
                                                    value={SelectedEditVariant || []}
                                                    isOptionEqualToValue={(option, value) => option?._id === value?._id}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box sx={{ mb: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Typography sx={{ minWidth: '120px', fontWeight: 'bold' }}>
                                                Attributes:
                                            </Typography>
                                            <Box sx={{ flex: 1 }}>
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
                                                                placeholder="Select Attributes"
                                                                sx={{
                                                                    "& .MuiInputBase-root": {
                                                                        height: "auto"
                                                                    }
                                                                }}
                                                            />
                                                        );
                                                    }}
                                                    onChange={(event, value) => setSelectedEditAttribute(value || [])}
                                                    value={SelectedEditAttribute || []}
                                                    isOptionEqualToValue={(option, value) => option?._id === value?._id}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Restricted Keywords */}
                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography sx={{ minWidth: '120px', fontWeight: 'bold' }}>
                                            Restricted Keywords:
                                        </Typography>
                                        <Box sx={{ flex: 1 }}>
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
                                                        placeholder="Enter Restricted Keywords ..."
                                                        sx={{
                                                            "& .MuiInputBase-root": {
                                                                padding: "0 11px",
                                                            }
                                                        }}
                                                    />
                                                )}
                                                onChange={handleTagHandler}
                                                value={values.tags || []}
                                                isOptionEqualToValue={(option, value) => option === value}
                                            />
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Description and Meta Fields */}
                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                            <Typography sx={{ minWidth: '120px', fontWeight: 'bold', pt: 1 }}>
                                                Description:
                                            </Typography>
                                            <Box sx={{ flex: 1 }}>
                                                <Field
                                                    as={TextField}
                                                    multiline
                                                    rows={2}
                                                    variant="outlined"
                                                    fullWidth
                                                    placeholder={queryId ? "Description" : ""}
                                                    name="description"
                                                    helperText={
                                                        <span style={{ color: "red" }}>
                                                            <ErrorMessage name="description" />
                                                        </span>
                                                    }
                                                />
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Typography sx={{ minWidth: '120px', fontWeight: 'bold' }}>
                                                Meta Title:
                                            </Typography>
                                            <Box sx={{ flex: 1 }}>
                                                <Field
                                                    as={TextField}
                                                    type="text"
                                                    variant="outlined"
                                                    color="primary"
                                                    fullWidth
                                                    placeholder={queryId ? "Meta Title" : ""}
                                                    name="metaTitle"
                                                    helperText={
                                                        <span style={{ color: "red" }}>
                                                            <ErrorMessage name="metaTitle" />
                                                        </span>
                                                    }
                                                    sx={{
                                                        "& .MuiInputBase-root": {
                                                            height: "40px"
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                            <Typography sx={{ minWidth: '120px', fontWeight: 'bold', pt: 1 }}>
                                                Meta Keywords:
                                            </Typography>
                                            <Box sx={{ flex: 1 }}>
                                                <Field
                                                    as={TextField}
                                                    multiline
                                                    rows={2}
                                                    variant="outlined"
                                                    fullWidth
                                                    placeholder={queryId ? "Meta KeyWords" : ""}
                                                    name="metaKeywords"
                                                    helperText={
                                                        <span style={{ color: "red" }}>
                                                            <ErrorMessage name="metaKeywords" />
                                                        </span>
                                                    }
                                                />
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                            <Typography sx={{ minWidth: '120px', fontWeight: 'bold', pt: 1 }}>
                                                Meta Description:
                                            </Typography>
                                            <Box sx={{ flex: 1 }}>
                                                <Field
                                                    as={TextField}
                                                    multiline
                                                    placeholder={queryId ? "Meta Description" : ""}
                                                    rows={2}
                                                    variant="outlined"
                                                    fullWidth
                                                    name="metaDescription"
                                                    helperText={
                                                        <span style={{ color: "red" }}>
                                                            <ErrorMessage name="metaDescription" />
                                                        </span>
                                                    }
                                                />
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>

                                {/* AUTOMATION SECTION - Keep original layout */}
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
                                    <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={isAutomatic}
                                                    onChange={(e) => setIsAutomatic(e.target.checked)}
                                                    name="automatic"
                                                />
                                            }
                                            label={
                                                <Box sx={{ width: '100%' }}>
                                                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                                        Automatic
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                                        Products matched with the following conditions will be
                                                        automatically assigned to this category
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </FormControl>

                                    {isAutomatic && (
                                        <Box sx={{ mt: 2, width: '100%' }}>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                                                Conditions
                                            </Typography>

                                            {/* Category Scope */}
                                            <Box sx={{ mb: 3, width: '100%' }}>
                                                <FormLabel component="legend" sx={{ fontWeight: "bold", mb: 1 }}>
                                                    Category
                                                </FormLabel>
                                                <RadioGroup
                                                    row
                                                    value={categoryScope}
                                                    onChange={(e) => setCategoryScope(e.target.value)}
                                                    sx={{ width: '100%' }}
                                                >
                                                    <FormControlLabel
                                                        value="all"
                                                        control={<Radio />}
                                                        label="All Categories"
                                                    />
                                                    <FormControlLabel
                                                        value="specific"
                                                        control={<Radio />}
                                                        label="Specific Categories"
                                                    />
                                                </RadioGroup>

                                                {categoryScope === "specific" && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                                        <Typography sx={{ minWidth: '120px', fontWeight: 'bold' }}>
                                                            Select Categories:
                                                        </Typography>
                                                        <Box sx={{ flex: 1 }}>
                                                            {!isParentCategoriesLoaded ? (
                                                                <TextField
                                                                    value="Loading categories..."
                                                                    disabled
                                                                    sx={{ width: '100%' }}
                                                                />
                                                            ) : (
                                                                <Autocomplete
                                                                    multiple
                                                                    options={parentCategories}
                                                                    getOptionLabel={(option) => option.title || ''}
                                                                    value={selectedCategories}
                                                                    onChange={(event, newValue) => setSelectedCategories(newValue)}
                                                                    renderInput={(params) => (
                                                                        <TextField
                                                                            {...params}
                                                                            placeholder="Choose categories"
                                                                        />
                                                                    )}
                                                                    isOptionEqualToValue={(option, value) => option._id === value._id}
                                                                />
                                                            )}
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Box>

                                            {/* Product Match Logic */}
                                            <Box sx={{ mb: 3, width: '100%' }}>
                                                <FormLabel component="legend" sx={{ fontWeight: "bold", mb: 1 }}>
                                                    Product must match
                                                </FormLabel>
                                                <RadioGroup
                                                    row
                                                    name="conditionType"
                                                    value={values.conditionType}
                                                    onChange={handleChange}
                                                    sx={{ width: '100%' }}
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
                                            </Box>

                                            {/* Dynamic Conditions */}
                                            <FieldArray name="conditions">
                                                {({ push, remove }) => (
                                                    <Box sx={{ width: '100%' }}>
                                                        {values.conditions.map((condition, index) => {
                                                            const fieldOptions = [
                                                                "Product Title",
                                                                "Product Tag",
                                                                "Attributes Tag",
                                                                "Variant Tag"
                                                            ];

                                                            const operatorOptions = getOperatorsForField(condition.field);

                                                            return (
                                                                <Grid container spacing={2} alignItems="center"
                                                                    sx={{ mb: 2 }} key={index}>
                                                                    <Grid item xs={12} sm={3}>
                                                                        <FormControl fullWidth>
                                                                            <TextField
                                                                                select
                                                                                sx={{
                                                                                    "& .MuiInputBase-root": { height: "40px" },
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
                                                                                    <MenuItem key={option}
                                                                                        value={option}>
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
                                                                                    "& .MuiInputBase-root": { height: "40px" },
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
                                                                                    <MenuItem key={option}
                                                                                        value={option}>
                                                                                        {option}
                                                                                    </MenuItem>
                                                                                ))}
                                                                            </TextField>
                                                                        </FormControl>
                                                                    </Grid>

                                                                    <Grid item xs={12} sm={5}>
                                                                        <FormControl fullWidth>
                                                                            {renderValueInput(condition, index, setFieldValue)}
                                                                            {errors.conditions?.[index]?.value && touched.conditions?.[index]?.value && (
                                                                                <span style={{
                                                                                    color: "red",
                                                                                    fontSize: "12px"
                                                                                }}>
                                                                                    {errors.conditions[index].value}
                                                                                </span>
                                                                            )}
                                                                        </FormControl>
                                                                    </Grid>

                                                                    <Grid item xs={12} sm={1}>
                                                                        <IconButton
                                                                            onClick={() => remove(index)}
                                                                            color="error"
                                                                        >
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    </Grid>
                                                                </Grid>
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
                                    )}
                                </Box>

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
