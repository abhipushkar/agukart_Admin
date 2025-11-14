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
        sellerSku: "",
        Innervariations: {},
        variantData: [],
        variant_id: [],
        variant_name: [],
        images: [],
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
    const [varintList, setVariantList] = React.useState([]);
    const [varientAttribute, setVarientAttribute] = React.useState([]);
    const [images, setImages] = React.useState(formData.images);
    const [isCoponentLoader, setIsconponentLoader] = useState(false);
    const [issubmitLoader, setIsSubmitLoader] = useState(false);

    const [variantArrValues, setVariantArrValue] = useState([]);
    const [skuErrors, setSkuErrors] = useState({});
    const [loadingSkus, setLoadingSkus] = useState({});
    const [sellerSky, setSellerSku] = React.useState([]);

    const [combinationMap, setCombinationMap] = useState(new Map());
    const [usedSkus, setUsedSkus] = useState(new Set()); // Track used SKUs

    const [inputErrors, setInputErrors] = React.useState({
        productTitle: "",
        variations: "",
        brandname: "",
        subCategory: "",
        description: "",
        sellerSku: "",
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
        setMsg(msg?.message || msg);
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

    const handleApiError = (error, customMessage = null) => {
        console.error("API Error:", error);

        if (error?.response?.status === 401) {
            handleOpen("error", { message: "Session expired. Please login again.", response: { status: 401 } });
        } else if (error?.response?.data?.message) {
            handleOpen("error", error.response.data);
        } else {
            handleOpen("error", { message: customMessage || "Something went wrong. Please try again." });
        }
    };

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

    // Helper function to trim string values
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

    const getVaraintList = async () => {
        try {
            const typeParam = "type=Product";
            const urlWithParam = `${apiEndpoints.getAllActiveVarient}?${typeParam}`;
            const res = await ApiService.get(urlWithParam, auth_key);
            if (res.status === 200) {
                setVariantList(res?.data?.parent);
            }
        } catch (error) {
            handleApiError(error, "Failed to load variants");
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
                let data = formData.Innervariations[formData.variant_name[i]];
                const newarrrr = formData.Innervariations[formData.variant_name[i]]?.map((item) => {
                    return item._id;
                });

                if (!newarrrr) {
                    return;
                }
                arr.push(newarrrr);
            }

            const myarr = arr.flat();
            setVarientAttribute(myarr);
        }
    }, [formData.variant_name, formData.Innervariations]);

    const varintHandler = (event, value) => {
        setFormData((prev) => ({
            ...prev,
            variantData: value,
            variant_id: value.map((option) => option.id),
            variant_name: value.map((option) => option.variant_name)
        }));
        setInputErrors((prev) => ({ ...prev, variations: "" }));
    };

    const generateCombinationKey = (combination) => {
        return Object.keys(combination)
            .sort()
            .map(key => combination[key]._id)
            .join('_');
    };

    const generateCombinations = (innervariations) => {
        let combinations = [];
        const variationKeys = Object.keys(innervariations);
        const variations = variationKeys.map((key) => innervariations[key]);

        function combine(attributes, index, currentCombination) {
            if (index === attributes.length) {
                combinations.push({ ...currentCombination });
                return;
            }

            const sortedAttributes = [...attributes[index]].sort((a, b) =>
                a.attribute_value.localeCompare(b.attribute_value)
            );

            sortedAttributes.forEach((attribute) => {
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

    const preserveCombinationData = (newCombinations, combinationMap, currentVariantData, currentSellerSky) => {
        const preservedVariantData = [];
        const preservedSellerSky = [];

        newCombinations.forEach((newComb, newIndex) => {
            const combKey = generateCombinationKey(newComb);

            const existingIndex = combinationMap.get(combKey);

            if (existingIndex !== undefined && currentVariantData[existingIndex]) {
                preservedVariantData[newIndex] = { ...currentVariantData[existingIndex] };
                preservedSellerSky[newIndex] = currentSellerSky[existingIndex] || "";
            } else {
                preservedVariantData[newIndex] = {
                    _id: "",
                    product_id: "",
                    sale_price: "",
                    price: "",
                    sale_start_date: "",
                    sale_end_date: "",
                    qty: ""
                };
                preservedSellerSky[newIndex] = "";
            }
        });

        return { preservedVariantData, preservedSellerSky };
    };

    const updateCombinationMap = (combinations) => {
        const newMap = new Map();
        combinations.forEach((comb, index) => {
            const key = generateCombinationKey(comb);
            newMap.set(key, index);
        });
        setCombinationMap(newMap);
    };

    const InnervariationsHandle = (variantId) => (event, newValue) => {
        const updatedInnervariations = {
            ...formData.Innervariations,
            [variantId]: newValue
        };

        const newCombinations = generateCombinations(updatedInnervariations);

        const { preservedVariantData, preservedSellerSky } = preserveCombinationData(
            newCombinations,
            combinationMap,
            variantArrValues,
            sellerSky
        );

        updateCombinationMap(newCombinations);

        setFormData((prev) => ({
            ...prev,
            Innervariations: updatedInnervariations
        }));

        setVariantArrValue(preservedVariantData);
        setSellerSku(preservedSellerSky);

        setInputErrors((prev) => ({ ...prev, innervariation: "" }));
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

    // NEW: Check for duplicate SKUs
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

        // Check for SKU errors
        const hasSkuErrors = Object.values(skuErrors).some(error => error);
        if (hasSkuErrors) {
            toast.error("Please fix SKU validation errors before submitting");
            return false;
        }

        setInputErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const getCurrentCombinations = () => {
        return generateCombinations(formData.Innervariations);
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
                // For existing products (with product_id), only SKU is required
                // For new products, all fields are required
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

        const param = {
            _id: productId ? productId : "new",
            product_title: trimValue(formData.productTitle),
            description: trimValue(formData.description),
            seller_sku: trimValue(formData.sellerSku),
            variant_id: formData.variant_id,
            variant_attribute_id: varientAttribute,
            combinations: trimArrayValues(combine),
            sub_category: formData?.subCategory || "",
            sku: trimArrayValues(sellerSky)
        };

        try {
            setIsSubmitLoader(true);
            const urlWithParam = `${apiEndpoints.AddParentProduct}`;
            const ImagesurlWithParam = `${apiEndpoints.ParentImagesAddParentProduct}`;
            const res = await ApiService.post(urlWithParam, param, auth_key);
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
                    await ApiService.postImage(ImagesurlWithParam, formData, auth_key);
                }

                setFormData({
                    productTitle: "",
                    description: "",
                    subCategory: "",
                    sellerSku: "",
                    Innervariations: {},
                    variantData: [],
                    variant_id: [],
                    variant_name: [],
                    images: []
                });

                setRoute(ROUTE_CONSTANT.catalog.product.list);
                handleOpen("success", res?.data);
            }
        } catch (error) {
            handleApiError(error, "Failed to save product");
        } finally {
            setIsSubmitLoader(false);
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

    const [parentId, setParentId] = useState("");
    const [imgName, setImgName] = useState();

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
                    productTitle: resData?.product_title || "",
                    description: resData?.description || "",
                    sellerSku: resData?.seller_sku || "",
                    images: [{ src: `${res?.data?.base_url}${resData?.image}` }],
                    variant_id: resData?.variant_id?.map((option) => option?._id) || [],
                    variant_name: resData?.variant_id?.map((option) => option?.variant_name) || [],
                    subCategory: resData?.sub_category || ""
                }));

                setParentId(resData?._id);
                setVarientAttribute(resData?.variant_attribute_id.map((option) => option._id) || []);

                if (resData?.sku && resData?.sku.length > 0) {
                    const arr = resData.sku.map(async (sku, i) => {
                        if (!sku) {
                            return {
                                _id: "",
                                product_id: "",
                                sale_price: "",
                                price: "",
                                sale_start_date: "",
                                sale_end_date: "",
                                qty: ""
                            };
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

                            return {
                                ...obj,
                                _id: obj.product_id,
                                sale_end_date,
                                sale_start_date,
                                price: obj.price || "",
                                sale_price: obj.sale_price || "",
                                qty: obj.qty || "",
                                // Add flag to indicate if this is an existing product
                                isExistingProduct: true
                            };
                        }
                        return {
                            _id: "",
                            product_id: "",
                            sale_price: "",
                            price: "",
                            sale_start_date: "",
                            sale_end_date: "",
                            qty: ""
                        };
                    });

                    Promise.all(arr).then((results) => {
                        setVariantArrValue(results);
                        setSellerSku(resData.sku);

                        if (resData?.combinations) {
                            const initialMap = new Map();
                            resData.combinations.forEach((comb, index) => {
                                if (comb.comb) {
                                    initialMap.set(comb.comb.replace(/,/g, '_'), index);
                                }
                            });
                            setCombinationMap(initialMap);
                        }
                    });
                }
            }
        } catch (error) {
            handleApiError(error, "Failed to load product details");
        }
    };

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
            const filteredData = formData.variantData.reduce((acc, item) => {
                if (item?.variant_attribute) {
                    const filteredAttributes = item.variant_attribute.filter((variant) =>
                        varientAttribute.includes(variant._id)
                    );

                    if (filteredAttributes.length > 0) {
                        acc[item.variant_name] = filteredAttributes;
                    }
                }
                return acc;
            }, {});

            setFormData((prev) => ({ ...prev, Innervariations: filteredData }));

            if (Object.keys(filteredData).length > 0) {
                const initialCombinations = generateCombinations(filteredData);
                updateCombinationMap(initialCombinations);

                if (variantArrValues.length === 0) {
                    const initialVariantData = initialCombinations.map(() => ({
                        _id: "",
                        product_id: "",
                        sale_price: "",
                        price: "",
                        sale_start_date: "",
                        sale_end_date: "",
                        qty: ""
                    }));
                    setVariantArrValue(initialVariantData);
                    setSellerSku(Array(initialCombinations.length).fill(""));
                }
            }
        }
    }, [formData?.variantData]);

    useEffect(() => {
        if (productId) {
            getParentProductDetail();
        }
    }, []);

    const currentCombinations = getCurrentCombinations();

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
                                            value={
                                                formData?.Innervariations[inputField?.variant_name] || []
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
