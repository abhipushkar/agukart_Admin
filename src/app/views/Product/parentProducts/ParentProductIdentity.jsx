import * as React from "react";
import ReactDOM from "react-dom";
import FormControl from "@mui/material/FormControl";
import {
    Autocomplete,
    Box,
    Button,
    MenuItem,
    Stack,
    Tab,
    Tabs,
    Typography
} from "@mui/material";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import MyImageGrid from "../Demo";
import { toast } from "react-toastify";
import { TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { v4 as uuidv4 } from "uuid";
import CircularProgress from "@mui/material/CircularProgress";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ProductParentTable from "app/components/ProductListTable/ProductParentTable";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { useEffect, useMemo, useState, useCallback } from "react";
import dayjs from "dayjs";
import ConfirmModal from "app/components/ConfirmModal";
import ProductVariationsTable from "./ProductVariationTable";
import { TabContext, TabPanel } from "@mui/lab";
import {
    normalizeVariantList,
    expandInnervariations,
    compressInnervariations,
    getAttributesByIds,
    generateCombinationKey
} from "./normalizeVariantAttributes";
import { useRef } from "react";

const ParentProductIdentity = ({ productId }) => {
    const [formData, setFormData] = React.useState({
        productTitle: "",
        description: "",
        subCategory: "",
        sellerSku: "",
        zoom: { scale: 1, x: 0, y: 0 },
        Innervariations: {},
        variantData: [],
        variant_id: [],
        variant_name: [],
        images: [],
        vendor: null,
    });

    const [inputFields, setInputFields] = React.useState([
        { id: 1, attributeValue: "", sortOrder: "", status: false }
    ]);
    const [value, setValue] = React.useState("female");
    const [selectedBrand, setSelectedBand] = React.useState("");
    const [brandlist, setBrandList] = React.useState([]);
    const [allCategory, setAllCategory] = React.useState([]);
    const [selectedCatLable, setSelectedCatLable] = React.useState("Select Category");
    const [showVariant, setShowVariant] = React.useState(false);
    const [rawVariantList, setRawVariantList] = React.useState([]);
    const [normalizedVariantList, setNormalizedVariantList] = React.useState([]);
    const [varientAttribute, setVarientAttribute] = React.useState([]);
    const [images, setImages] = React.useState(formData.images);
    const [isCoponentLoader, setIsconponentLoader] = useState(false);
    const [issubmitLoader, setIsSubmitLoader] = useState(false);

    const [variantArrValues, setVariantArrValue] = useState([]);
    const [skuErrors, setSkuErrors] = useState({});
    const [loadingSkus, setLoadingSkus] = useState({});
    const [sellerSky, setSellerSku] = React.useState([]);

    const [combinationMap, setCombinationMap] = useState(new Map());
    const [usedSkus, setUsedSkus] = useState(new Set());

    const [inputErrors, setInputErrors] = React.useState({
        productTitle: "",
        variations: "",
        brandname: "",
        subCategory: "",
        description: "",
        sellerSku: "",
        innervariation: "",
        parentImage: "",
        vendor: ""
    });

    const [vendors, setVendors] = React.useState([]);
    const [vendorLoading, setVendorLoading] = React.useState(false);

    // State for product variations
    const [productVariations, setProductVariations] = useState([]);

    const auth_key = localStorage.getItem(localStorageKey.auth_key);

    const [open, setOpen] = React.useState(false);
    const [type, setType] = useState("");
    const [route, setRoute] = useState(null);
    const [msg, setMsg] = useState(null);
    const [currentTab, setCurrentTab] = useState("combination");

    // FIX: Client-side hydration check
    const [isClient, setIsClient] = useState(false);

    function handleTabChanges(event, newValue) {
        setCurrentTab(newValue);
    }

    const logOut = () => {
        localStorage.removeItem(localStorageKey.auth_key);
        localStorage.removeItem(localStorageKey.designation_id);
        localStorage.removeItem(localStorageKey.vendorId);
        setRoute(ROUTE_CONSTANT.login)
    };

    const handleOpen = useCallback((type, msg) => {
        setMsg(msg?.message || msg);
        setOpen(true);
        setType(type);
        if (msg?.response?.status === 401) {
            logOut()
        }
    }, []);

    const handleClose = () => {
        setOpen(false);
        if (route !== null) {
            navigate(route);
        }
        setRoute(null);
        setMsg(null);
    };

    const handleApiError = useCallback((error, customMessage = null) => {
        console.error("API Error:", error);

        if (error?.response?.status === 401) {
            handleOpen("error", { message: "Session expired. Please login again.", response: { status: 401 } });
        } else if (error?.response?.data?.message) {
            handleOpen("error", error.response.data);
        } else {
            handleOpen("error", { message: customMessage || "Something went wrong. Please try again." });
        }
    }, [handleOpen]);

    const getBrandList = async () => {
        try {
            const res = await ApiService.get(apiEndpoints.getBrand, auth_key);
            if (res.status === 200) {
                setBrandList(res?.data?.brand);
            }
        } catch (error) {
            handleApiError(error, "Failed to load brands");
        }
    };

    const getVendors = async () => {
        try {
            setVendorLoading(true);
            const res = await ApiService.get(apiEndpoints.getVendorsList, auth_key);
            if (res.status === 200) {
                setVendors(res?.data?.data || []);
            }
        } catch (error) {
            handleApiError(error, "Failed to load vendors");
        } finally {
            setVendorLoading(false);
        }
    };

    const trimValue = (value) => {
        if (typeof value === 'string') {
            return value.trim();
        }
        return value;
    };

    const formDataHandler = (e) => {
        const trimmedValue = trimValue(e.target.value);
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: trimmedValue
        }));
    };

    const handleVendorChange = (event, newValue) => {
        setFormData((prev) => ({
            ...prev,
            vendor: newValue
        }));
        setInputErrors((prev) => ({ ...prev, vendor: "" }));
        setSkuErrors({});
        setVariantArrValue(prev => prev.map(item => ({
            ...item,
            isExistingProduct: false
        })));
    };

    const getVaraintList = async () => {
        try {
            const typeParam = "type=Product";
            const urlWithParam = `${apiEndpoints.getAllActiveVarient}?${typeParam}`;
            const res = await ApiService.get(urlWithParam, auth_key);
            if (res.status === 200) {
                setRawVariantList(res?.data?.parent || []);
                // Normalize variant list to remove duplicates
                const normalized = normalizeVariantList(res?.data?.parent);
                setNormalizedVariantList(normalized);
            }
        } catch (error) {
            handleApiError(error, "Failed to load variants");
        }
    };

    React.useEffect(() => {
        setIsClient(true);
        getBrandList();
        getVaraintList();
        getChildCategory();
        getVendors();
    }, []);

    React.useEffect(() => {
        if (Object.keys(formData.Innervariations).length > 0) {
            let arr = [];
            for (let i = 0; i < formData.variant_name.length; i++) {
                const variantName = formData.variant_name[i];
                const attributeIds = formData.Innervariations[variantName];
                if (attributeIds && Array.isArray(attributeIds)) {
                    arr.push(...attributeIds);
                }
            }
            setVarientAttribute(arr);
        }
    }, [formData.variant_name, formData.Innervariations]);

    const varintHandler = (event, value) => {
        const previousVariantNames = formData.variant_name;
        const newVariantNames = value.map((option) => option.variant_name);

        setFormData((prev) => ({
            ...prev,
            variantData: value,
            variant_id: value.map((option) => option.id),
            variant_name: newVariantNames
        }));

        // Remove product variations for deselected variants
        const removedVariants = previousVariantNames.filter(name => !newVariantNames.includes(name));
        if (removedVariants.length > 0) {
            const updatedProductVariations = productVariations.filter(
                variation => !removedVariants.includes(variation.variant_name)
            );
            setProductVariations(updatedProductVariations);
        }

        setInputErrors((prev) => ({ ...prev, variations: "" }));
    };

    const deterministicSort = (a, b) => {
        if (a.sort_order !== b.sort_order) {
            return a.sort_order - b.sort_order;
        }
        return a._id.localeCompare(b._id);
    };

    const generateCombinations = (expandedInnervariations) => {
        let combinations = [];
        const variationKeys = Object.keys(expandedInnervariations);

        // Apply deterministic sorting
        const variations = variationKeys.map((key) => {
            return [...expandedInnervariations[key]].sort(deterministicSort);
        });

        function combine(attributes, index, currentCombination) {
            if (index === attributes.length) {
                combinations.push({ ...currentCombination });
                return;
            }

            // Attributes are already sorted deterministically
            attributes[index].forEach((attribute) => {
                const key = `key${index + 1}`;
                currentCombination[key] = {
                    value: attribute.attribute_value,
                    _id: attribute._id,
                    variant_name: variationKeys[index]
                };
                combine(attributes, index + 1, currentCombination);
            });
        }

        combine(variations, 0, {});
        return combinations;
    };

    const preserveCombinationData = (newCombinations, currentVariantData, currentSellerSky, currentSkuErrors, oldCombinations) => {
        const preservedVariantData = [];
        const preservedSellerSky = [];

        // Generate keys for new and old combinations
        const newCombinationKeys = newCombinations.map(comb => generateCombinationKey(comb));
        const oldCombinationKeys = oldCombinations.map(comb => generateCombinationKey(comb));

        // Clean up SKU errors for removed combinations
        const cleanedSkuErrors = {};

        Object.entries(currentSkuErrors).forEach(([key, error]) => {
            // Handle numeric index-based keys
            if (!isNaN(key)) {
                const index = parseInt(key);
                if (index < oldCombinationKeys.length) {
                    const oldCombKey = oldCombinationKeys[index];
                    if (oldCombKey && newCombinationKeys.includes(oldCombKey)) {
                        // Find new index for this combination
                        const newIndex = newCombinationKeys.indexOf(oldCombKey);
                        cleanedSkuErrors[newIndex] = error;
                    }
                }
            } else if (newCombinationKeys.includes(key)) {
                // Key is already a combination key and still exists
                const newIndex = newCombinationKeys.indexOf(key);
                cleanedSkuErrors[newIndex] = error;
            }
            // Errors for removed combinations are automatically filtered out
        });

        newCombinations.forEach((newComb, newIndex) => {
            const combKey = generateCombinationKey(newComb);

            // Try to find matching combination in old data using the key
            const oldIndex = oldCombinationKeys.indexOf(combKey);

            if (oldIndex !== -1 && currentVariantData[oldIndex]) {
                // Preserve data for matching combination
                preservedVariantData[newIndex] = { ...currentVariantData[oldIndex] };
                preservedSellerSky[newIndex] = currentSellerSky[oldIndex] || "";

                // Also preserve SKU error if it exists (already handled in cleanedSkuErrors)
            } else {
                // New combination - initialize empty
                preservedVariantData[newIndex] = {
                    _id: "",
                    product_id: "",
                    sale_price: "",
                    price: "",
                    sale_start_date: "",
                    sale_end_date: "",
                    qty: "",
                    isExistingProduct: false
                };
                preservedSellerSky[newIndex] = "";
            }
        });

        return {
            preservedVariantData,
            preservedSellerSky,
            preservedSkuErrors: cleanedSkuErrors
        };
    };

    const updateCombinationMap = (combinations) => {
        const newMap = new Map();
        combinations.forEach((comb, index) => {
            const key = generateCombinationKey(comb);
            newMap.set(key, index);
        });
        setCombinationMap(newMap);
    };

    // Get expanded innervariations for UI display
    const getExpandedInnervariations = useCallback(() => {
        return expandInnervariations(formData.Innervariations, normalizedVariantList);
    }, [formData.Innervariations, normalizedVariantList]);

    // FIXED: Memoized filtered data using IDs only
    const filteredData = useMemo(() => {
        if (!varientAttribute || !formData?.variantData || formData.variantData.length === 0) {
            return {};
        }

        const variantMap = new Map(normalizedVariantList.map(v => [v.variant_name, v]));

        return formData.variantData.reduce((acc, item) => {
            const variant = variantMap.get(item.variant_name);
            if (variant?.variant_attribute) {
                // Get attribute IDs for this variant from varientAttribute
                const attributeIdsForVariant = variant.variant_attribute
                    .filter(attr => varientAttribute.includes(attr._id))
                    .map(attr => attr._id);

                if (attributeIdsForVariant.length > 0) {
                    acc[item.variant_name] = attributeIdsForVariant;
                }
            }
            return acc;
        }, {});
    }, [varientAttribute, formData?.variantData, normalizedVariantList]);

    const InnervariationsHandle = (variantName) => (event, newValue) => {
        // Store only IDs in state
        const attributeIds = newValue.map(attr => attr._id);

        const updatedInnervariations = {
            ...formData.Innervariations,
            [variantName]: attributeIds
        };

        // Expand for combination generation
        const expandedInnervariations = expandInnervariations(updatedInnervariations, normalizedVariantList);
        const newCombinations = generateCombinations(expandedInnervariations);

        // Get current combinations BEFORE updating state
        const currentCombinations = getCurrentCombinations();

        // Preserve data for unchanged combinations
        const { preservedVariantData, preservedSellerSky, preservedSkuErrors } = preserveCombinationData(
            newCombinations,
            variantArrValues,
            sellerSky,
            skuErrors,
            currentCombinations
        );

        // Update combination map with new indices
        const newMap = new Map();
        newCombinations.forEach((comb, index) => {
            const key = generateCombinationKey(comb);
            newMap.set(key, index);
        });
        setCombinationMap(newMap);

        // FIX: Use batching for all state updates
        ReactDOM.unstable_batchedUpdates(() => {
            setFormData((prev) => ({
                ...prev,
                Innervariations: updatedInnervariations
            }));

            setVariantArrValue(preservedVariantData);
            setSellerSku(preservedSellerSky);
            setSkuErrors(preservedSkuErrors); // Update SKU errors too
        });

        // Get previous attribute IDs for product variations sync
        const previousAttributeIds = formData.Innervariations[variantName] || [];
        const removedAttributeIds = previousAttributeIds.filter(id => !attributeIds.includes(id));

        // Sync product variations
        const updatedProductVariations = formData.variantData.map(variant => {
            if (variant.variant_name !== variantName) {
                // Find existing variant data
                const existingVariant = productVariations.find(pv => pv.variant_name === variant.variant_name);
                return existingVariant || {
                    _id: variant.id,
                    variant_name: variant.variant_name,
                    variant_attributes: [],
                    guide: []
                };
            }

            // For the changed variant
            const existingVariant = productVariations.find(pv => pv.variant_name === variantName);
            const variantObj = normalizedVariantList.find(v => v.variant_name === variantName);

            let updatedAttributes = [];

            if (existingVariant) {
                // Remove attributes that are no longer selected
                updatedAttributes = existingVariant.variant_attributes.filter(
                    attr => !removedAttributeIds.includes(attr._id)
                );

                // Add new attributes that don't exist yet
                attributeIds.forEach(attributeId => {
                    if (!updatedAttributes.some(attr => attr._id === attributeId)) {
                        const attribute = variantObj?.variant_attribute?.find(a => a._id === attributeId);
                        if (attribute) {
                            updatedAttributes.push({
                                _id: attribute._id,
                                attribute: attribute.attribute_value,
                                main_images: [null, null, null],
                                preview_image: attribute.preview_image || "",
                                thumbnail: attribute.thumbnail || "",
                                edit_main_image: null,
                                edit_preview_image: attribute.edit_preview_image || "",
                                edit_main_image_data: attribute.edit_main_image_data || {},
                                edit_preview_image_data: attribute.edit_preview_image_data || {},
                            });
                        }
                    }
                });
            } else {
                // Create new variant with attributes
                updatedAttributes = attributeIds.map(attributeId => {
                    const attribute = variantObj?.variant_attribute?.find(a => a._id === attributeId);
                    return attribute ? {
                        _id: attribute._id,
                        attribute: attribute.attribute_value,
                        main_images: [null, null, null],
                        preview_image: attribute.preview_image || "",
                        thumbnail: attribute.thumbnail || "",
                        edit_main_image: null,
                        edit_preview_image: attribute.edit_preview_image || "",
                        edit_main_image_data: attribute.edit_main_image_data || {},
                        edit_preview_image_data: attribute.edit_preview_image_data || {},
                    } : null;
                }).filter(Boolean);
            }

            return {
                _id: variant.id,
                variant_name: variant.variant_name,
                variant_attributes: updatedAttributes,
                guide: existingVariant?.guide || []
            };
        });

        // FIX: Batch this update too
        ReactDOM.unstable_batchedUpdates(() => {
            setProductVariations(updatedProductVariations);
            setInputErrors((prev) => ({ ...prev, innervariation: "" }));
        });
    };

    const getChildCategory = async () => {
        try {
            const res = await ApiService.get(apiEndpoints.getChildCategory, auth_key);
            if (res.status === 200) {
                setAllCategory(res?.data?.data);
            }
        } catch (error) {
            handleApiError(error, "Failed to load categories");
        }
    };

    const navigate = useNavigate();

    const validateChildProductVariants = (childProductData, parentVariants) => {
        if (!childProductData?.variants_used || !parentVariants?.length) return null;

        const parentVariantNames = parentVariants.map(v => v.variant_name);
        const childVariantNames = childProductData.variants_used.map(v => v.variant_name);

        const conflictingVariants = parentVariantNames.filter(parentVariant =>
            childVariantNames.includes(parentVariant)
        );

        if (conflictingVariants.length > 0) {
            return `Child product already uses variants: ${conflictingVariants.join(', ')}. Please select different variants.`;
        }

        return null;
    };

    const checkForDuplicateSkus = (sku, index) => {
        if (!sku) return null;

        const trimmedSku = trimValue(sku);
        const otherSkus = sellerSky.filter((_, i) => i !== index).map(sku => trimValue(sku));

        if (otherSkus.includes(trimmedSku)) {
            return "This SKU is already used in another variant combination";
        }

        return null;
    };

    const validateForm = () => {
        const errors = {};

        if (!trimValue(formData.productTitle)) errors.productTitle = "Product Title is Required";
        if (!trimValue(formData.description)) errors.description = "Description is Required";
        if (!trimValue(formData.sellerSku)) errors.sellerSku = "Seller Sku is Required";
        if (formData.variantData.length === 0) errors.variations = "Please Select At least one Variant";
        if (Object.keys(formData.Innervariations).length === 0) errors.innervariation = "Please Select At least one Innervariations Variant";
        if (images.length === 0) errors.parentImage = "Images Is Required";
        if (!formData.vendor) errors.vendor = "Vendor is Required";

        const hasSkuErrors = Object.values(skuErrors).some(error => error);
        if (hasSkuErrors) {
            toast.error("Please fix SKU validation errors before submitting");
            return false;
        }

        setInputErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const getCurrentCombinations = () => {
        const expandedInnervariations = getExpandedInnervariations();
        return generateCombinations(expandedInnervariations);
    };

    const trimObjectValues = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;

        const trimmedObj = {};
        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'string') {
                trimmedObj[key] = obj[key].trim();
            } else {
                trimmedObj[key] = obj[key];
            }
        });
        return trimmedObj;
    };

    const trimArrayValues = (array) => {
        if (!Array.isArray(array)) return array;

        return array.map(item => {
            if (typeof item === 'string') {
                return item.trim();
            } else if (typeof item === 'object' && item !== null) {
                return trimObjectValues(item);
            }
            return item;
        });
    };

    // Function to convert product variations to FormData
    const prepareProductVariationsFormData = () => {
        const formDataObj = new FormData();

        productVariations.forEach((variant, variantIndex) => {
            // Include variant ID
            if (variant._id) {
                formDataObj.append(`product_variation[${variantIndex}][_id]`, variant._id);
            }
            formDataObj.append(`product_variation[${variantIndex}][variant_name]`, variant.variant_name);

            // Handle guide data
            let guideData = variant.guide;
            if (guideData) {
                // If guide is an object, convert to array
                if (!Array.isArray(guideData)) {
                    guideData = [guideData];
                }

                if (guideData.length > 0) {
                    const guide = guideData[0];
                    formDataObj.append(`product_variation[${variantIndex}][guide][guide_name]`, guide.guide_name || "");
                    formDataObj.append(`product_variation[${variantIndex}][guide][guide_description]`, guide.guide_description || "");
                    formDataObj.append(`product_variation[${variantIndex}][guide][guide_type]`, guide.guide_type || "");

                    if (guide.guide_file && guide.guide_file instanceof File) {
                        formDataObj.append(`product_variation[${variantIndex}][guide][guide_file]`, guide.guide_file);
                    } else if (guide.guide_file && typeof guide.guide_file === 'string') {
                        formDataObj.append(`product_variation[${variantIndex}][guide][guide_file]`, guide.guide_file);
                    }
                }
            }

            variant.variant_attributes.forEach((attribute, attrIndex) => {
                // Include attribute ID
                if (attribute._id) {
                    formDataObj.append(`product_variation[${variantIndex}][variant_attributes][${attrIndex}][_id]`, attribute._id);
                }
                formDataObj.append(`product_variation[${variantIndex}][variant_attributes][${attrIndex}][attribute]`, attribute.attribute);

                // Handle main images
                if (attribute.main_images) {
                    attribute.main_images.forEach((image, imgIndex) => {
                        if (image && image instanceof File) {
                            formDataObj.append(`product_variation[${variantIndex}][variant_attributes][${attrIndex}][main_images][${imgIndex}]`, image);
                        } else if (image && typeof image === 'string') {
                            formDataObj.append(`product_variation[${variantIndex}][variant_attributes][${attrIndex}][main_images][${imgIndex}]`, image);
                        }
                    });
                }

                // Handle preview image
                if (attribute.preview_image && attribute.preview_image instanceof File) {
                    formDataObj.append(`product_variation[${variantIndex}][variant_attributes][${attrIndex}][preview_image]`, attribute.preview_image);
                } else if (attribute.preview_image && typeof attribute.preview_image === 'string') {
                    formDataObj.append(`product_variation[${variantIndex}][variant_attributes][${attrIndex}][preview_image]`, attribute.preview_image);
                }

                // Handle thumbnail
                if (attribute.thumbnail && attribute.thumbnail instanceof File) {
                    formDataObj.append(`product_variation[${variantIndex}][variant_attributes][${attrIndex}][thumbnail]`, attribute.thumbnail);
                } else if (attribute.thumbnail && typeof attribute.thumbnail === 'string') {
                    formDataObj.append(`product_variation[${variantIndex}][variant_attributes][${attrIndex}][thumbnail]`, attribute.thumbnail);
                }

                // Handle edited images
                if (attribute.edit_main_image && attribute.edit_main_image instanceof File) {
                    formDataObj.append(`product_variation[${variantIndex}][variant_attributes][${attrIndex}][edit_main_image]`, attribute.edit_main_image);
                }

                if (attribute.edit_preview_image && attribute.edit_preview_image instanceof File) {
                    formDataObj.append(`product_variation[${variantIndex}][variant_attributes][${attrIndex}][edit_preview_image]`, attribute.edit_preview_image);
                }

                // Handle edit data
                if (attribute.edit_main_image_data) {
                    formDataObj.append(`product_variation[${variantIndex}][variant_attributes][${attrIndex}][edit_main_image_data]`,
                        typeof attribute.edit_main_image_data === "string" ? attribute.edit_main_image_data : JSON.stringify(attribute.edit_main_image_data));
                }

                if (attribute.edit_preview_image_data) {
                    formDataObj.append(`product_variation[${variantIndex}][variant_attributes][${attrIndex}][edit_preview_image_data]`,
                        typeof attribute.edit_preview_image_data === "string" ? attribute.edit_preview_image_data : JSON.stringify(attribute.edit_preview_image_data));
                }
            });
        });

        return formDataObj;
    };

    const parentsubmitHandle = async () => {
        if (!validateForm()) {
            toast.error("Please fill all required fields");
            return;
        }

        const currentCombinations = getCurrentCombinations();

        const combine = currentCombinations.map((combination, index) => {
            const comb = Object.keys(combination)
                .map((key) => combination[key]._id)
                .join(",");

            const variantData = variantArrValues[index] || {};

            return {
                ...variantData,
                comb: comb,
                sku_code: sellerSky[index] ? trimValue(sellerSky[index]) : ""
            };
        });

        function validateProductArray(combine) {
            return combine.every((product, index) => {
                const isExistingProduct = product.product_id && product.product_id !== "";
                const isValid = isExistingProduct
                    ? product.sku_code
                    : product.sale_price && product.qty && product.comb && product.sku_code;

                if (!isValid) {
                    const message = isExistingProduct
                        ? `SKU is mandatory for variant combination ${index + 1}`
                        : `All fields are mandatory for variant combination ${index + 1}`;
                    toast.error(message);
                }
                return isValid;
            });
        }

        const check = validateProductArray(combine);
        if (!check) return;

        try {
            setIsSubmitLoader(true);

            // Create FormData for the main product data
            const formDataObj = new FormData();

            // Append all product data
            formDataObj.append("_id", productId ? productId : "new");
            formDataObj.append("product_title", trimValue(formData.productTitle));
            formDataObj.append("description", trimValue(formData.description));
            formDataObj.append("seller_sku", trimValue(formData.sellerSku));
            formDataObj.append("sub_category", formData?.subCategory || "");
            formDataObj.append("vendor_id", formData.vendor?._id || "");
            formDataObj.append("zoom", JSON.stringify(formData.zoom));

            // Append arrays as JSON strings
            formDataObj.append("variant_id", JSON.stringify(formData.variant_id));
            formDataObj.append("variant_attribute_id", JSON.stringify(varientAttribute));
            formDataObj.append("combinations", JSON.stringify(trimArrayValues(combine)));
            formDataObj.append("sku", JSON.stringify(trimArrayValues(sellerSky)));

            // Append product variations data
            const variationsFormData = prepareProductVariationsFormData();
            for (let [key, value] of variationsFormData.entries()) {
                formDataObj.append(key, value);
            }

            // Submit main product data with variations using postImage
            const urlWithParam = `${apiEndpoints.AddParentProduct}`;
            const res = await ApiService.postImage(urlWithParam, formDataObj, auth_key);

            if (res.status === 200) {
                // Handle parent product image separately if it exists
                if (images?.[0]?.file) {
                    const imageFormData = new FormData();
                    imageFormData.append("_id", parentId ? parentId : res?.data?.parent_product._id);
                    imageFormData.append(
                        "file",
                        productId
                            ? images?.[0]?.file
                                ? images?.[0]?.file
                                : images?.[0]?.src
                            : images?.[0]?.file
                    );
                    const ImagesurlWithParam = `${apiEndpoints.ParentImagesAddParentProduct}`;
                    await ApiService.postImage(ImagesurlWithParam, imageFormData, auth_key);
                }

                setFormData({
                    productTitle: "",
                    description: "",
                    subCategory: "",
                    sellerSku: "",
                    zoom: { scale: 1, x: 0, y: 0 },
                    Innervariations: {},
                    variantData: [],
                    variant_id: [],
                    variant_name: [],
                    images: [],
                    vendor: null,
                });

                setProductVariations([]);

                setRoute(ROUTE_CONSTANT.catalog.product.list);
                handleOpen("success", res?.data);
            }
        } catch (error) {
            handleApiError(error, "Failed to save product");
        } finally {
            setIsSubmitLoader(false);
        }
    };

    const handleProductVariationGuideUpdate = (variantIndex, guideData) => {
        const updatedProductVariations = [...productVariations];
        const variant = { ...updatedProductVariations[variantIndex] };

        variant.guide = [guideData];
        updatedProductVariations[variantIndex] = variant;

        setProductVariations(updatedProductVariations);
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

    const [parentId, setParentId] = useState("");
    const [imgName, setImgName] = useState();

    // Product Variation Handlers
    const handleProductVariationImageUpload = (variantIndex, attributeIndex, imageKey, event) => {
        const file = event.target.files[0];
        if (!file) return;

        const updatedProductVariations = [...productVariations];
        const variant = { ...updatedProductVariations[variantIndex] };
        const attributes = [...variant.variant_attributes];
        const attribute = { ...attributes[attributeIndex] };

        if (imageKey.startsWith('main_images')) {
            const imgIndex = parseInt(imageKey.match(/\[(\d+)\]/)[1]);
            const mainImages = [...(attribute.main_images || [])];
            while (mainImages.length <= imgIndex) {
                mainImages.push(null);
            }
            mainImages[imgIndex] = file;
            attribute.main_images = mainImages;
        } else {
            attribute[imageKey] = file;
        }

        attributes[attributeIndex] = attribute;
        variant.variant_attributes = attributes;
        updatedProductVariations[variantIndex] = variant;

        setProductVariations(updatedProductVariations);
    };

    const handleProductVariationImageRemove = (variantIndex, attributeIndex, imageKey) => {
        const updatedProductVariations = [...productVariations];
        const variant = { ...updatedProductVariations[variantIndex] };
        const attributes = [...variant.variant_attributes];
        const attribute = { ...attributes[attributeIndex] };

        if (imageKey.startsWith('main_images')) {
            const imgIndex = parseInt(imageKey.match(/\[(\d+)\]/)[1]);
            const mainImages = [...(attribute.main_images || [])];
            if (mainImages[imgIndex]) {
                mainImages[imgIndex] = "";
                attribute.main_images = mainImages;
            }
        } else {
            attribute[imageKey] = "";
        }

        // Remove edit data
        if (imageKey === 'main_images[0]') {
            attribute.edit_main_image = "";
            attribute.edit_main_image_data = "";
        } else if (imageKey === 'preview_image') {
            attribute.edit_preview_image = "";
            attribute.edit_preview_image_data = "";
        }

        attributes[attributeIndex] = attribute;
        variant.variant_attributes = attributes;
        updatedProductVariations[variantIndex] = variant;

        setProductVariations(updatedProductVariations);
    };

    const handleProductVariationImageEdit = (variantIndex, attributeIndex, imageType, editedImage, imageIndex, editData) => {
        const updatedProductVariations = [...productVariations];
        const variant = { ...updatedProductVariations[variantIndex] };
        const attributes = [...variant.variant_attributes];
        const attribute = { ...attributes[attributeIndex] };

        if (imageType === 'main_images' && imageIndex === 0) {
            attribute.edit_main_image = editedImage;
            attribute.edit_main_image_data = editData;
        } else if (imageType === 'preview_image') {
            attribute.edit_preview_image = editedImage;
            attribute.edit_preview_image_data = editData;
        }

        attributes[attributeIndex] = attribute;
        variant.variant_attributes = attributes;
        updatedProductVariations[variantIndex] = variant;

        setProductVariations(updatedProductVariations);
    };

    const handleProductVariationReorder = (variantIndex, sourceIndex, targetIndex) => {
        const updatedProductVariations = [...productVariations];
        const variant = { ...updatedProductVariations[variantIndex] };
        const attributes = [...variant.variant_attributes];

        // Validate indices
        if (sourceIndex >= attributes.length || targetIndex >= attributes.length) {
            console.error('Invalid source or target index');
            return;
        }

        const [movedAttribute] = attributes.splice(sourceIndex, 1);
        attributes.splice(targetIndex, 0, movedAttribute);

        variant.variant_attributes = attributes;
        updatedProductVariations[variantIndex] = variant;

        setProductVariations(updatedProductVariations);
    };

    // FIXED: Get attribute objects for a specific variant
    const getAttributesForVariant = (variantName) => {
        const variant = normalizedVariantList.find(v => v.variant_name === variantName);
        if (!variant || !variant.variant_attribute) return [];
        return variant.variant_attribute;
    };

    // FIXED: Get selected attribute objects for display
    const getSelectedAttributesForVariant = (variantName) => {
        const attributeIds = formData.Innervariations[variantName];
        if (!Array.isArray(attributeIds)) return [];

        const variant = normalizedVariantList.find(v => v.variant_name === variantName);
        if (!variant || !variant.variant_attribute) return [];

        return getAttributesByIds(variant, attributeIds);
    };

    const getParentProductDetail = useCallback(async () => {
        try {
            const res = await ApiService.get(
                `${apiEndpoints.getParentProductDetail}/${productId}`,
                auth_key
            );
            if (res?.status === 200) {
                const resData = res?.data?.data;
                setImgName(resData?.image);

                const vendor = resData?.vendor_id ? vendors.find(v => v._id === resData.vendor_id) : null;

                // FIX: Build innervariations from variant_attribute_id grouped by variant
                let innervariations = {};
                if (resData?.variant_attribute_id && Array.isArray(resData.variant_attribute_id)) {
                    // Group attribute IDs by variant
                    resData.variant_attribute_id.forEach(attr => {
                        // Find which variant this attribute belongs to
                        const variant = resData.variant_id?.find(v => v._id === attr.variant);
                        if (variant && variant.variant_name) {
                            if (!innervariations[variant.variant_name]) {
                                innervariations[variant.variant_name] = [];
                            }
                            if (!innervariations[variant.variant_name].includes(attr._id)) {
                                innervariations[variant.variant_name].push(attr._id);
                            }
                        }
                    });
                }

                // FIX: Prepare all updates first, then batch them
                const formDataUpdates = {
                    productTitle: resData?.product_title || "",
                    description: resData?.description || "",
                    sellerSku: resData?.seller_sku || "",
                    images: [{ src: `${res?.data?.base_url}${resData?.image}` }],
                    zoom: resData?.zoom || { scale: 1, x: 0, y: 0 },
                    variant_id: resData?.variant_id?.map((option) => option?._id) || [],
                    variant_name: resData?.variant_id?.map((option) => option?.variant_name) || [],
                    subCategory: resData?.sub_category || "",
                    vendor: vendor || null,
                    Innervariations: innervariations
                };

                // FIX: Build product variations from variant attributes
                let productVariations = [];

                if (resData?.variant_id && Array.isArray(resData.variant_id)) {
                    productVariations = resData.variant_id.map(variant => {
                        // Get attribute IDs for this variant
                        const variantAttributeIds = innervariations[variant.variant_name] || [];

                        // Build variant attributes
                        const variantAttributes = variantAttributeIds.map(attributeId => {
                            const attribute = resData.variant_attribute_id?.find(a => a._id === attributeId);
                            return attribute ? {
                                _id: attribute._id,
                                attribute: attribute.attribute_value,
                                main_images: [null, null, null],
                                preview_image: attribute.preview_image || "",
                                thumbnail: attribute.thumbnail || "",
                                edit_main_image: null,
                                edit_preview_image: attribute.edit_preview_image || "",
                                edit_main_image_data: attribute.edit_main_image_data || {},
                                edit_preview_image_data: attribute.edit_preview_image_data || {},
                            } : null;
                        }).filter(Boolean);

                        return {
                            _id: variant._id,
                            variant_name: variant.variant_name,
                            variant_attributes: variantAttributes,
                            guide: variant.guide_name ? [{
                                guide_name: variant.guide_name,
                                guide_file: variant.guide_file,
                                guide_description: variant.guide_description,
                                guide_type: variant.guide_type
                            }] : []
                        };
                    });
                }

                // FIX: Handle existing product_variants if they exist (from API response)
                const fixedProductVariants = resData?.product_variants?.map(variant => {
                    if (variant.guide && !Array.isArray(variant.guide)) {
                        return {
                            ...variant,
                            guide: [variant.guide]
                        };
                    }
                    return variant;
                }) || [];

                // Use existing product_variants if available, otherwise use our built productVariations
                const finalProductVariations = fixedProductVariants.length > 0 ? fixedProductVariants : productVariations;

                // FIX: Batch ALL state updates together
                ReactDOM.unstable_batchedUpdates(() => {
                    setFormData((prev) => ({
                        ...prev,
                        ...formDataUpdates
                    }));

                    setParentId(resData?._id);
                    setVarientAttribute(resData?.variant_attribute_id?.map((option) => option._id) || []);
                    setProductVariations(finalProductVariations);
                });

                // ADD CACHING FOR SKU VALIDATION
                const skuCache = new Map();
                let shouldFetchSkus = true;

                // Check if we already have the SKU data loaded
                if (sellerSky.length > 0 && variantArrValues.length > 0) {
                    console.log('SKUs already loaded, skipping re-fetch');
                    shouldFetchSkus = false;
                }

                // KEEP ALL EXISTING SKU LOADING CODE BELOW - DO NOT MODIFY
                if (shouldFetchSkus && resData?.sku && resData?.sku.length > 0) {
                    console.log('Loading SKU data...');
                    const arr = resData.sku.map(async (sku, i) => {
                        // Check cache first
                        if (skuCache.has(sku)) {
                            return skuCache.get(sku);
                        }

                        if (!sku) {
                            const emptyResult = {
                                _id: "",
                                product_id: "",
                                sale_price: "",
                                price: "",
                                sale_start_date: "",
                                sale_end_date: "",
                                qty: ""
                            };
                            skuCache.set(sku, emptyResult);
                            return emptyResult;
                        }

                        let url = apiEndpoints.getProductBySku + `/${sku}`;
                        const res = await ApiService.get(url, auth_key);

                        if (res.status === 200) {
                            let obj = res.data.data;
                            let sale_start_date = obj.sale_start_date ? dayjs(obj.sale_start_date) : "";
                            let sale_end_date = obj.sale_end_date ? dayjs(obj.sale_end_date) : "";

                            const variantError = validateChildProductVariants(obj, resData?.variant_id);

                            if (variantError) {
                                setSkuErrors(prev => ({
                                    ...prev,
                                    [i]: variantError
                                }));
                            }

                            const result = {
                                ...obj,
                                _id: obj.product_id,
                                product_id: obj.product_id,
                                sale_end_date,
                                sale_start_date,
                                price: obj.price || "",
                                sale_price: obj.sale_price || "",
                                qty: obj.qty || "",
                                isExistingProduct: true
                            };

                            skuCache.set(sku, result);
                            return result;
                        }

                        const errorResult = {
                            _id: "",
                            product_id: "",
                            sale_price: "",
                            price: "",
                            sale_start_date: "",
                            sale_end_date: "",
                            qty: ""
                        };
                        skuCache.set(sku, errorResult);
                        return errorResult;
                    });

                    Promise.all(arr).then((results) => {
                        // FIX: Batch these updates too
                        ReactDOM.unstable_batchedUpdates(() => {
                            setVariantArrValue(results);
                            setSellerSku(resData.sku);
                        });

                        if (resData?.combinations) {
                            const initialMap = new Map();
                            resData.combinations.forEach((comb, index) => {
                                if (comb.comb) {
                                    initialMap.set(comb.comb.replace(/,/g, '_'), index);
                                }
                            });
                            setCombinationMap(initialMap);
                        }
                    }).catch(error => {
                        console.error('Error loading SKU data:', error);
                        handleApiError(error, "Failed to load SKU data");
                    });
                }
            }
        } catch (error) {
            handleApiError(error, "Failed to load product details");
        }
    }, [auth_key, handleApiError, productId, vendors, sellerSky, variantArrValues]); // Added sellerSky and variantArrValues to dependencies

    useEffect(() => {
        if (productId) {
            setImages(formData?.images);
        }
    }, [formData?.images, productId]);

    useEffect(() => {
        if (formData?.variant_id && normalizedVariantList.length > 0) {
            const filteredVariantData = normalizedVariantList.filter((variant) =>
                formData.variant_id.includes(variant.id)
            );

            setFormData((prev) => ({
                ...prev,
                variantData: filteredVariantData
            }));
        }
    }, [formData?.variant_id, normalizedVariantList]);

    // FIXED: Initialize innervariations when variant data changes
    useEffect(() => {
        if (formData.variantData.length > 0 && Object.keys(formData.Innervariations).length === 0) {
            // Initialize with empty arrays for each variant
            const initialInnervariations = {};
            formData.variantData.forEach(variant => {
                initialInnervariations[variant.variant_name] = [];
            });

            setFormData(prev => ({
                ...prev,
                Innervariations: initialInnervariations
            }));
        }
    }, [formData.Innervariations, formData.variantData]);

    // FIXED: Initialize product variations when variants are selected
    useEffect(() => {
        if (formData.variantData.length > 0 && productVariations.length === 0) {
            const initialProductVariations = formData.variantData.map(variant => ({
                _id: variant.id,
                variant_name: variant.variant_name,
                variant_attributes: [],
                guide: []
            }));

            ReactDOM.unstable_batchedUpdates(() => {
                setProductVariations(initialProductVariations);
            });
        }
    }, [formData.variantData, productVariations.length]);

    const hasLoadedProductData = useRef(false);

    useEffect(() => {
        if (productId && vendors.length > 0 && !hasLoadedProductData.current) {
            getParentProductDetail();
            hasLoadedProductData.current = true;
        }
    }, [getParentProductDetail, productId, vendors]);

    // Also add cleanup to reset the flag when component unmounts
    useEffect(() => {
        return () => {
            hasLoadedProductData.current = false;
        };
    }, []);

    const currentCombinations = getCurrentCombinations();

    // FIX: Prevent hydration mismatch
    if (!isClient) {
        return null;
    }

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
                        {/* Vendor Selection Field */}
                        {localStorage.getItem(localStorageKey.designation_id) === "2" && (<Box
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
                                    options={vendors}
                                    getOptionLabel={(option) => option?.shopName || ""}
                                    value={formData.vendor}
                                    onChange={handleVendorChange}
                                    loading={vendorLoading}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Vendor"
                                            error={!!inputErrors.vendor}
                                            helperText={inputErrors.vendor}
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
                                                if (!formData.vendor) {
                                                    setInputErrors((prv) => ({
                                                        ...prv,
                                                        vendor: "Vendor is Required"
                                                    }));
                                                }
                                            }}
                                        />
                                    )}
                                    isOptionEqualToValue={(option, value) => option._id === value._id}
                                />
                            </Box>
                        </Box>)}

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
                                        if (!trimValue(formData.productTitle)) {
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
                                        if (!trimValue(formData.description)) {
                                            setInputErrors((prv) => ({ ...prv, description: "Description Required" }));
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
                                        if (!trimValue(formData.sellerSku)) {
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
                                <MyImageGrid images={images} setImages={setImages} setFormData={setFormData} formData={formData} />
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
                                    options={normalizedVariantList}
                                    getOptionLabel={(option) => option?.variant_name}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Variant"
                                            placeholder="Select Variant"
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
                                    onChange={varintHandler}
                                    name="variantData"
                                    value={
                                        formData.variantData.length > 0
                                            ? formData.variantData
                                            : formData.variant_id
                                                ? normalizedVariantList.filter((variant) => formData.variant_id.includes(variant.id))
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
                                            options={getAttributesForVariant(inputField?.variant_name)}
                                            getOptionLabel={(option) => option.attribute_value}
                                            renderInput={(params) => {
                                                return (
                                                    <TextField
                                                        {...params}
                                                        label={inputField?.variant_name}
                                                        placeholder={`select ${inputField?.variant_name}`}
                                                        sx={{
                                                            "& .MuiInputBase-root": {
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
                                            value={getSelectedAttributesForVariant(inputField?.variant_name)}
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
                        <Tabs value={currentTab} onChange={handleTabChanges}>
                            <Tab key={"Variant Combinations"} label={"Variant Combinations"} value={"combination"} />
                            <Tab key={"Product Variants"} label={"Product Variants"} value={"variants"} />
                        </Tabs>
                        <TabContext value={currentTab} key={currentTab}>
                            <TabPanel key={"Variant Combinations"} value={"combination"}>
                                {Object.keys(formData?.Innervariations).length > 0 && (
                                    <>
                                        <ProductParentTable
                                            variantArrValues={variantArrValues}
                                            setVariantArrValue={setVariantArrValue}
                                            combinations={currentCombinations}
                                            formdataaaaa={formData.variant_name}
                                            sellerSky={sellerSky}
                                            setSellerSku={setSellerSku}
                                            setIsconponentLoader={setIsconponentLoader}
                                            skuErrors={skuErrors}
                                            setSkuErrors={setSkuErrors}
                                            loadingSkus={loadingSkus}
                                            setLoadingSkus={setLoadingSkus}
                                            parentVariants={formData.variantData}
                                            checkForDuplicateSkus={checkForDuplicateSkus}
                                            selectedVendor={formData.vendor}
                                            combinationKeys={currentCombinations.map(comb => generateCombinationKey(comb))}
                                        />
                                    </>
                                )}
                            </TabPanel>
                            <TabPanel key={"Product Variants"} value={"variants"}>
                                {/* Product Variations Table */}
                                {productVariations.length > 0 && (
                                    <Box sx={{ mt: 4 }}>
                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "primary.main" }}>
                                            Product Variations
                                        </Typography>
                                        <ProductVariationsTable
                                            productVariations={productVariations}
                                            onImageUpload={handleProductVariationImageUpload}
                                            onImageRemove={handleProductVariationImageRemove}
                                            onImageEdit={handleProductVariationImageEdit}
                                            onRowReorder={handleProductVariationReorder}
                                            onGuideUpdate={handleProductVariationGuideUpdate}
                                        />
                                    </Box>
                                )}
                            </TabPanel>
                        </TabContext>

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
                                <Button
                                    disabled={issubmitLoader ? true : false}
                                    variant="contained"
                                    onClick={parentsubmitHandle}
                                    startIcon={issubmitLoader ? <CircularProgress size={20} /> : null}
                                >
                                    {issubmitLoader ? "Submitting..." : "Submit"}
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
