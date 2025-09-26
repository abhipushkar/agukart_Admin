import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import ProductIdentity from "./ProductIdentity";
import DescriptionTabs from "./DescriptionTabs";
import CustomisationTabs from "./CustomisationTabs";
import OfferDetails from "./OfferDetails";
import CustomisationInner from "./CustomisationInner";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";
import dayjs from "dayjs";
import {apiEndpoints} from "app/constant/apiEndpoints";
import {ApiService} from "app/services/ApiService";
import {localStorageKey} from "app/constant/localStorageKey";
import moment from "moment";
import {toast} from "react-toastify";
import {ROUTE_CONSTANT} from "app/constant/routeContanst";
import ErrorIcon from "@mui/icons-material/Error";
import {useState} from "react";
import {useEffect} from "react";
import ConfirmModal from "app/components/ConfirmModal";
import DynamicTabs from "./DynamicTabs";

function CustomTabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{p: 3}}>{children}</Box>}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`
    };
}

export default function BasicTabs() {
    const auth_key = localStorage.getItem(localStorageKey.auth_key);
    const designation_id = localStorage.getItem(localStorageKey.designation_id);
    const vendorId = localStorage.getItem(localStorageKey.vendorId);
    const [loading, setLoading] = useState(false);
    const [draftLoading, setDraftLoading] = useState(false);
    const [query, setQuery] = useSearchParams();
    const copyQueryId = query.get("_id");
    const queryId = query.get("id");
    console.log({copyQueryId})
    const [transformData, setTransformData] = useState({
        scale: 1,
        x: 0,
        y: 0
    });
    console.log({transformData}, "rtyhrt5rtyrty")
    const [EdtiFroemData, setEditFormData] = React.useState({});
    console.log(EdtiFroemData, "EdtiFroemData")
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
        setMsg(msg?.message ? msg?.message : msg);
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

    console.log("EdtiFroemDataEdtiFroemData", EdtiFroemData);
    const imageObjects = EdtiFroemData?.image?.map((image) => ({
        src: `${EdtiFroemData.imageBaseUrl}${image}`
    }));
    const videoObjects = EdtiFroemData?.videos?.map((video) => ({
        src: `${EdtiFroemData.videoBaseUrl}${video}`
    }));

    console.log("imageObjectsimageObjects", imageObjects);
    console.log("videoObjurl", videoObjects);
    React.useEffect(() => {
    }, []);

    const getAllEditProducts = async () => {
        try {
            const editapiUrl = `${apiEndpoints.EditProduct}/${copyQueryId || queryId}`;
            const res = await ApiService.get(editapiUrl, auth_key);
            if (res?.status === 200) {
                console.log("fjeditapiUrleditapiUrl", res);
                setEditFormData(res?.data?.productData);

                // Data is now properly formatted, no need for parsing
                const variationsData = res?.data?.productData?.variations_data || [];
                const formValues = res?.data?.productData?.form_values || {
                    prices: "",
                    quantities: "",
                    isCheckedPrice: false,
                    isCheckedQuantity: false
                };
                const tabs = res?.data?.productData?.tabs || [];

                console.log("Setting variationsData in Producttabs from api", variationsData);
                setVariationsData(variationsData);
                setFormValues(formValues);
                setSelectedVariations([...variationsData?.map((item) => item?.name) || []]);
                setCustomizationData(res?.data?.productData?.customizationData);

                // Update formData with tabs
                setFormData(prev => ({
                    ...prev,
                    tabs: tabs
                }));
            }
        } catch (error) {
            // handleOpen("error", error);
            console.log("error", error);
        }
    };

    React.useEffect(() => {
        getAllEditProducts();
    }, [queryId, copyQueryId]);
    console.log("queryId", queryId);

    const [formData, setFormData] = React.useState({
        productTitle: EdtiFroemData?.product_title || "",
        productType: EdtiFroemData?.product_type || "productType",
        subCategory: EdtiFroemData?.category || "",
        variations: EdtiFroemData?.variant_attribute_id || [],
        brandName: EdtiFroemData?.brand_id || "",
        productDescription: EdtiFroemData?.description || "",
        bulletPoints: EdtiFroemData?.bullet_points || "",
        customization: EdtiFroemData?.customize || "No",
        popularGifts: EdtiFroemData?.popular_gifts || "No",
        bestSelling: EdtiFroemData?.bestseller || "No",
        stylesKeyWords: [{value: EdtiFroemData?.style_name || ""}],
        searchTerms: "",
        serchTemsKeyArray: EdtiFroemData?.size || [],
        StyleName: EdtiFroemData?.style_name || "",
        Shopingsweight: EdtiFroemData?.shipping_weight || "",
        DisplayDimenssionlength: EdtiFroemData?.display_dimension_length || "",
        DisplayDimenssionwidth: EdtiFroemData?.display_dimension_width || "",
        DisplayDimenssionheight: EdtiFroemData?.display_dimension_height || "",
        PackageDimenssionheight: EdtiFroemData?.package_dimension_height || "",
        PackageDimenssionlength: EdtiFroemData?.package_dimension_length || "",
        PackageDimenssionwidth: EdtiFroemData?.package_dimension_width || "",
        PackageDimenssionUnit: EdtiFroemData?.package_dimension_unit || "",
        productcateUnitCount: EdtiFroemData?.unit_count || "",
        productcateUnitCounttypeee: EdtiFroemData?.unit_count_type || "",
        HowAreYouProuduct: EdtiFroemData?.how_product_made || "",
        productdetailsOccassion: [],
        productdetailsDesign: EdtiFroemData?.design || "",
        packageWidth: EdtiFroemData?.package_weight || "",
        // launchData: EdtiFroemData?.launch_date || null,
        // launchData: EdtiFroemData?.launch_date ? dayjs(EdtiFroemData?.launch_date) : null,
        launchData: EdtiFroemData?.launch_date
            ? dayjs(moment(EdtiFroemData?.launch_date, "DD-MM-YYYY HH:mm:ss").toISOString())
            : null,
        releaseDate: EdtiFroemData?.release_date ? dayjs(EdtiFroemData?.release_date) : null,
        brandId: "brandId",
        taxRatio: EdtiFroemData?.tax_ratio || "6",
        images: imageObjects || [],
        videos: [],
        deletedVideos: [],
        variantData: [],
        gender: [],
        combinedMaterials: [],
        deleteIconData: [],
        sortImg: [],
        productsize: "",
        varientName: EdtiFroemData?.variant_attribute_id || [],
        ParentMainId: EdtiFroemData?.variant_id || [],
        productsizeMap: EdtiFroemData?.size_map || "",
        productcolor: EdtiFroemData?.color_textarea || "",
        colorMap: EdtiFroemData?.color_map || "",
        productweight: EdtiFroemData?.shipping_weight_unit || "",
        packageweight: EdtiFroemData?.package_weight_unit || "",
        productunitValue: EdtiFroemData?.display_dimension_unit || "",
        catLable: "Select Category",
        sellerSku: EdtiFroemData?.sku_code || "",
        ProductTaxCode: EdtiFroemData?.tax_code || "",
        shipingTemplates: EdtiFroemData?.shipping_templates || "",
        yourPrice: EdtiFroemData?.price || "",
        salePrice: EdtiFroemData?.sale_price || "",
        saleStartDate: EdtiFroemData?.sale_start_date ? dayjs(EdtiFroemData?.sale_start_date) : null,
        saleEndDate: EdtiFroemData?.sale_end_date ? dayjs(EdtiFroemData?.sale_end_date) : null,
        quantity: EdtiFroemData?.qty || "",
        maxOrderQuantity: EdtiFroemData?.max_order_qty || "",
        color: EdtiFroemData?.color || "",
        offeringCanBe: EdtiFroemData?.can_offer || "",
        isGiftWrap: EdtiFroemData?.gift_wrap || "",
        // reStockDate: EdtiFroemData?.restock_date || "",
        reStockDate: EdtiFroemData?.restock_date ? dayjs(EdtiFroemData?.restock_date) : null,
        fullfillmentChannel: "",
        productionTime: EdtiFroemData?.production_time || "",
        vendor: EdtiFroemData?.vendor_id || "",
        isCombination: EdtiFroemData?.isCombination || "false",
        tabs: EdtiFroemData?.tabs || [],
        exchangePolicy: EdtiFroemData?.exchangePolicy || ""
    });
    const [combinations, setCombinations] = useState([]);
    const [formValues, setFormValues] = useState({
        prices: "",
        quantities: "",
        isCheckedPrice: false,
        isCheckedQuantity: false
    });
    console.log({formValues})
    const [variationsData, setVariationsData] = useState([]);
    const [selectedVariations, setSelectedVariations] = useState([]);
    const [customizationData, setCustomizationData] = useState({label: "", instructions: "", customizations: []});
    const [showAll, setShowAll] = useState(false);
    console.log(customizationData, "customizationData")
    const [combinationError, setCombinationError] = useState({});
    console.log("combinationErrorcombinationError", combinationError);

    const deleteVideoArr = formData?.deletedVideos?.map((item) => {
        // const newsplitarr = item.split("product/");
        const arrsplit = item.split("video/");
        return arrsplit[1];
    });
    const uniqueSetVideoarr = [...new Set(deleteVideoArr)];
    const deleteArr = formData?.deleteIconData
        ?.map((item) => {
            if (typeof item === "string") {
                const arrsplit = item.split("product/");
                return arrsplit[1];
            }
            return null; // or an empty string "" if you prefer
        })
        .filter(Boolean);

    const [inputErrors, setInputErrors] = React.useState({
        productTitle: "",
        subCategory: "",
        vendor: "",
        des: "",
        images: "",
        sellerSku: "",
        shipingTemplates: "",
        yourPrice: "",
        salePrice: "",
        quantity: "",
        productionTime: ""
    });
    const [tabsValue, setTabsValue] = React.useState(0);
    const [keys, setKeys] = React.useState(EdtiFroemData?.search_terms || []);
    const [altText, setAltText] = useState(
        formData?.images?.length > 0 ? Array(formData?.images?.length).fill("") : []
    );

    const handleChange = (event, newValue) => {
        setTabsValue(newValue);
    };

    console.log({formData});

    useEffect(() => {
        if (altText.length === 0 && formData?.images?.length > 0) {
            setAltText(Array(formData.images.length).fill(""));
        }
    }, [formData?.images, altText.length]);

    React.useEffect(() => {
        setFormData({
            productTitle: EdtiFroemData?.product_title || "",
            productType: EdtiFroemData?.product_type || "productType",
            subCategory: EdtiFroemData?.category || "",
            variations: EdtiFroemData?.variant_attribute_id || [],
            brandName: EdtiFroemData?.brand_id || "",
            productDescription: EdtiFroemData?.description || "",
            bulletPoints: EdtiFroemData?.bullet_points || "",
            customization: EdtiFroemData?.customize || "No",
            popularGifts: EdtiFroemData?.popular_gifts || "No",
            bestSelling: EdtiFroemData?.bestseller || "No",
            stylesKeyWords: [{value: EdtiFroemData?.style_name || ""}],
            searchTerms: "",
            serchTemsKeyArray: EdtiFroemData?.size || [],
            StyleName: EdtiFroemData?.style_name || "",
            Shopingsweight: EdtiFroemData?.shipping_weight || "",
            DisplayDimenssionlength: EdtiFroemData?.display_dimension_length || "",
            DisplayDimenssionwidth: EdtiFroemData?.display_dimension_width || "",
            DisplayDimenssionheight: EdtiFroemData?.display_dimension_height || "",
            PackageDimenssionheight: EdtiFroemData?.package_dimension_height || "",
            PackageDimenssionlength: EdtiFroemData?.package_dimension_length || "",
            PackageDimenssionwidth: EdtiFroemData?.package_dimension_width || "",
            PackageDimenssionUnit: EdtiFroemData?.package_dimension_unit || "",
            productcateUnitCount: EdtiFroemData?.unit_count || "",
            productcateUnitCounttypeee: EdtiFroemData?.unit_count_type || "",
            HowAreYouProuduct: EdtiFroemData?.how_product_made || "",
            productdetailsOccassion: [],
            productdetailsDesign: EdtiFroemData?.design || "",
            packageWidth: EdtiFroemData?.package_weight || "",
            // launchData: EdtiFroemData?.launch_date || null,
            // launchData: EdtiFroemData?.launch_date ? dayjs(EdtiFroemData?.launch_date) : null,
            launchData: EdtiFroemData?.launch_date
                ? dayjs(moment(EdtiFroemData?.launch_date, "DD-MM-YYYY HH:mm:ss").toISOString())
                : null,
            releaseDate: EdtiFroemData?.release_date
                ? dayjs(moment(EdtiFroemData?.release_date, "DD-MM-YYYY HH:mm:ss").toISOString())
                : null,
            brandId: "brandId",
            taxRatio: EdtiFroemData?.tax_ratio || "6",
            images: [],
            videos: [],
            variantData: [],
            gender: [],
            combinedMaterials: [],
            deletedVideos: [],
            deleteIconData: [],
            sortImg: [],
            productsize: "",
            varientName: EdtiFroemData?.variant_attribute_id || [],
            ParentMainId: EdtiFroemData?.variant_id || [],
            productsizeMap: EdtiFroemData?.size_map || "",
            productcolor: EdtiFroemData?.color_textarea || "",
            colorMap: EdtiFroemData?.color_map || "",
            productweight: EdtiFroemData?.shipping_weight_unit || "",
            packageweight: EdtiFroemData?.package_weight_unit || "",
            productunitValue: EdtiFroemData?.display_dimension_unit || "",
            catLable: "Select Category",
            sellerSku: "",
            ProductTaxCode: EdtiFroemData?.tax_code || "",
            shipingTemplates: EdtiFroemData?.shipping_templates || "",
            yourPrice: EdtiFroemData?.price || "",
            salePrice: EdtiFroemData?.sale_price || "",
            saleStartDate: EdtiFroemData?.sale_start_date
                ? dayjs(moment(EdtiFroemData?.sale_start_date, "DD-MM-YYYY HH:mm:ss").toISOString())
                : null,
            saleEndDate: EdtiFroemData?.sale_end_date
                ? dayjs(moment(EdtiFroemData?.sale_end_date, "DD-MM-YYYY HH:mm:ss").toISOString())
                : null,
            quantity: EdtiFroemData?.qty || "",
            maxOrderQuantity: EdtiFroemData?.max_order_qty || "",
            color: EdtiFroemData?.color || "",
            offeringCanBe: EdtiFroemData?.can_offer || "",
            isGiftWrap: EdtiFroemData?.gift_wrap || "",
            reStockDate: EdtiFroemData?.restock_date
                ? dayjs(moment(EdtiFroemData?.restock_date, "DD-MM-YYYY HH:mm:ss").toISOString())
                : null,
            fullfillmentChannel: "",
            productionTime: EdtiFroemData?.production_time || "",
            vendor: EdtiFroemData?.vendor_id || "",
            isCombination: EdtiFroemData?.isCombination?.toString() || "false",
            tabs: EdtiFroemData?.tabs || [],
            exchangePolicy: EdtiFroemData?.exchangePolicy || ""
        });
        if (!copyQueryId) {
            setFormData((prv) => ({
                ...prv,
                sellerSku: EdtiFroemData?.sku_code,
                images: imageObjects || [],
                videos: videoObjects || [],
            }))
        }
        setKeys(EdtiFroemData?.search_terms || []);
        setAltText(EdtiFroemData?.altText || altText)
        setCombinations(EdtiFroemData?.combinationData || []);
        setTransformData(EdtiFroemData?.zoom || {scale: 1, x: 0, y: 0});
    }, [EdtiFroemData]);

    const uniqueSetarr = [...new Set(deleteArr)];
    console.log("deleteIconData", uniqueSetarr);

// ---------------- helper to build FormData ----------------
    const buildProductFormData = (payload, combinations) => {
        const fData = new FormData();

        // fields that can be null/dates
        const dateKeys = [
            "sale_start_date",
            "sale_end_date",
            "launch_date",
            "release_date",
            "restock_date",
        ];

        Object.keys(payload).forEach((key) => {
            let value = payload[key];

            // skip null-like and empty values
            if (
                value === null ||
                value === undefined ||
                value === "" ||
                value === "null" ||
                value === "undefined" ||
                (Array.isArray(value) && value.length === 0) ||
                (typeof value === "object" && !(value instanceof File) && Object.keys(value).length === 0)
            ) {
                return;
            }

            // Handle date fields safely
            if (dateKeys.includes(key)) {
                let formattedDate = null;

                // Handle Day.js instances
                if (value && typeof value === "object" && typeof value.format === "function") {
                    formattedDate = value.isValid() ? value.format("YYYY-MM-DD") : null;
                }
                // Handle Date objects
                else if (value instanceof Date && !isNaN(value.getTime())) {
                    formattedDate = value.toISOString().split("T")[0];
                }
                // Handle string dates that might be valid
                else if (typeof value === "string" && value !== "Invalid Date") {
                    const parsedDate = new Date(value);
                    if (!isNaN(parsedDate.getTime())) {
                        formattedDate = parsedDate.toISOString().split("T")[0];
                    }
                }

                // Only append if we have a valid formatted date
                if (formattedDate) {
                    fData.append(key, formattedDate);
                }
                return; // Skip further processing for date fields
            }

            // Handle files
            if (value instanceof File) {
                fData.append(key, value);
            }
            // Arrays
            else if (Array.isArray(value)) {
                if (value.length > 0) {
                    if (typeof value[0] === "object") {
                        fData.append(key, JSON.stringify(value));
                    } else {
                        value.forEach((item, idx) => {
                            if (
                                item !== null &&
                                item !== undefined &&
                                item !== "" &&
                                item !== "null" &&
                                item !== "undefined"
                            ) {
                                fData.append(`${key}[${idx}]`, item);
                            }
                        });
                    }
                }
            }
            // Objects
            else if (typeof value === "object") {
                fData.append(key, JSON.stringify(value));
            }
            // Primitives - only append if not empty
            else if (value !== "") {
                fData.append(key, String(value));
            }
        });

        // 2) Append ALL combination data (not just files) - only non-empty values
        combinations.forEach((variant, vIndex) => {
            // Skip empty variants
            if (!variant || !variant.combinations || variant.combinations.length === 0) {
                return;
            }

            // ... existing variant-level data appending ...

            (variant.combinations || []).forEach((comb, cIndex) => {
                // Skip empty combinations
                if (!comb) return;

                Object.keys(comb).forEach((fieldKey) => {
                    const fieldVal = comb[fieldKey];

                    if (
                        fieldVal === null ||
                        fieldVal === undefined ||
                        fieldVal === "" ||
                        fieldVal === "null" ||
                        fieldVal === "undefined" ||
                        fieldKey === "main_images" ||
                        fieldKey === "preview_image" ||
                        fieldKey === "thumbnail" ||
                        fieldKey === "edit_main_image" ||
                        fieldKey === "edit_preview_image"
                    ) {
                        return; // skip nulls and skip file/image fields (they're handled separately below)
                    }

                    if (Array.isArray(fieldVal)) {
                        fieldVal.forEach((item, idx) => {
                            if (item !== null && item !== undefined && item !== "") {
                                fData.append(
                                    `combinationData[${vIndex}][combinations][${cIndex}][${fieldKey}][${idx}]`,
                                    item
                                );
                            }
                        });
                    } else if (typeof fieldVal === "object") {
                        fData.append(
                            `combinationData[${vIndex}][combinations][${cIndex}][${fieldKey}]`,
                            JSON.stringify(fieldVal)
                        );
                    } else {
                        fData.append(
                            `combinationData[${vIndex}][combinations][${cIndex}][${fieldKey}]`,
                            String(fieldVal)
                        );
                    }
                });

                // Handle files - only append if they are File objects or empty strings
                const mainArr = comb?.main_images || [];
                mainArr.forEach((img, imgIndex) => {
                    if (img instanceof File) {
                        fData.append(
                            `combinationData[${vIndex}][combinations][${cIndex}][main_images][]`,
                            img
                        );
                    } else if (typeof img === "string") {
                        // Append empty string for removed images
                        fData.append(
                            `combinationData[${vIndex}][combinations][${cIndex}][main_images][]`,
                            img
                        );
                    }
                    // Note: We don't handle existing image URLs here as they're handled by the backend
                });

                if (comb?.preview_image instanceof File) {
                    fData.append(
                        `combinationData[${vIndex}][combinations][${cIndex}][preview_image]`,
                        comb.preview_image
                    );
                } else if (typeof comb?.preview_image === "string") {
                    // Append empty string for removed preview image
                    fData.append(
                        `combinationData[${vIndex}][combinations][${cIndex}][preview_image]`,
                        comb?.preview_image
                    );
                }

                if (comb?.thumbnail instanceof File) {
                    fData.append(
                        `combinationData[${vIndex}][combinations][${cIndex}][thumbnail]`,
                        comb.thumbnail
                    );
                } else if (typeof comb.thumbnail === "string") {
                    // Append empty string for removed thumbnail
                    fData.append(
                        `combinationData[${vIndex}][combinations][${cIndex}][thumbnail]`,
                        comb.thumbnail
                    );
                }

                if (comb?.edit_main_image instanceof File) {
                    console.log("Sending as binary", comb?.edit_main_image);
                    fData.append(
                        `combinationData[${vIndex}][combinations][${cIndex}][edit_main_image]`,
                        comb.edit_main_image
                    );
                } else if (typeof comb?.edit_main_image === "string") {
                    console.log("Sending as string", comb?.edit_main_image);
                    fData.append(
                        `combinationData[${vIndex}][combinations][${cIndex}][edit_main_image]`,
                        comb?.edit_main_image
                    );
                }

                if (comb?.edit_preview_image instanceof File) {
                    fData.append(
                        `combinationData[${vIndex}][combinations][${cIndex}][edit_preview_image]`,
                        comb.edit_preview_image
                    );
                } else if (typeof comb?.edit_preview_image === "string") {

                    fData.append(
                        `combinationData[${vIndex}][combinations][${cIndex}][edit_preview_image]`,
                        comb.edit_preview_image
                    );
                }
            });
        });

        return fData;
    };

// ----------------------------------------------------------

    const addProducthandler = async () => {
        // keep your existing combination validation logic
        const errors = {};
        // combinations.forEach((variant) => {
        //     variant.combinations.forEach((item, index) => {
        //         const isPriceCheckApplicable =
        //             (variationsData.length >= 2 ? formValues?.prices === variant.variant_name : true) &&
        //             item?.isCheckedPrice &&
        //             item?.isVisible;
        //
        //         if (isPriceCheckApplicable && (!item?.price)) {
        //             errors[`Price-${variant.variant_name}-${index}`] = "Price is required";
        //         }
        //         const isQtyCheckApplicable =
        //             (variationsData.length >= 2 ? formValues?.quantities === variant.variant_name : true) &&
        //             item?.isCheckedQuantity &&
        //             item?.isVisible;
        //
        //         if (isQtyCheckApplicable && (!item?.qty)) {
        //             errors[`Quantity-${variant.variant_name}-${index}`] = "Quantity is required";
        //         }
        //     });
        // });

        if (Object.keys(errors).length > 0) {
            setCombinationError(errors);
            setShowAll(true);
            return;
        }

        setCombinationError({});

        // --- keep all your existing field validations (unchanged) ---
        // (sellerSku, shipingTemplates, vendor, productTitle, subCategory, productDescription, images etc.)
        // If any required field missing setInputErrors and return early (same as original logic)
        if (!formData.sellerSku) {
            setInputErrors((prv) => ({...prv, sellerSku: "Seller Sku is Required"}));
            return;
        }
        if (!formData.shipingTemplates) {
            setInputErrors((prv) => ({...prv, shipingTemplates: "Shiping Temeplate is Required"}));
            return;
        }
        if (!formData.vendor) {
            setInputErrors((prv) => ({...prv, vendor: "Shop name is Required"}));
            return;
        }
        if (!formData.productTitle) {
            setInputErrors((prv) => ({...prv, productTitle: "Product Title is Required"}));
            return;
        }
        if (!formData.productDescription) {
            setInputErrors((prv) => ({...prv, productDescription: "Product description is Required"}));
            return;
        }
        if (!formData.images || formData.images.length === 0) {
            setInputErrors((prv) => ({...prv, images: "Product image is Required"}));
            return;
        }
        if (!formValues?.isCheckedPrice && !formData.salePrice) {
            setInputErrors((prv) => ({...prv, salePrice: "Sale Price is Required"}));
            return;
        }
        if (!formValues?.isCheckedQuantity && !formData.quantity) {
            setInputErrors((prv) => ({...prv, quantity: "Quantity is Required"}));
            return;
        }
        if (!formData.exchangePolicy) {
            setInputErrors((prv) => ({...prv, exchangePolicy: "Return and exchange policy is required"}));
            return;
        }

        // --- payload construction (keep your fields unchanged) ---
        const occassion = formData.productdetailsOccassion.map((o) => o._id);
        const genderdata = formData.gender.map((g) => g.label);
        const materialdata = formData.combinedMaterials.map((m) => m.label);

        let payload = {
            category: formData.subCategory,
            variant_id: formData.ParentMainId,
            variant_attribute_id: formData.varientName,
            product_title: formData.productTitle,
            product_type: formData.productType,
            tax_ratio: formData.taxRatio,
            bullet_points: formData.bulletPoints,
            description: formData.productDescription,
            customize: formData.customization,
            customizationData: customizationData || {},
            search_terms: keys,
            launch_date: formData.launchData,
            release_date: formData.releaseDate,
            _id: "new",
            brand_id: formData.brandName || null,
            production_time: formData.productionTime,
            sku_code: formData.sellerSku,
            tax_code: formData.ProductTaxCode,
            shipping_templates: formData.shipingTemplates,
            price: +formData.yourPrice,
            sale_price: +formData.salePrice,
            sale_start_date: formData.saleStartDate,
            sale_end_date: formData.saleEndDate,
            qty: formData.quantity,
            max_order_qty: formData.maxOrderQuantity,
            color: formData.color,
            can_offer: formData.offeringCanBe,
            gift_wrap: formData.isGiftWrap,
            restock_date: formData.reStockDate,
            gender: genderdata,
            size: formData.searchTerms,
            product_size: formData.productsize,
            size_map: formData.productsizeMap,
            color_textarea: formData.productcolor,
            color_map: formData.colorMap,
            style_name: formData.StyleName,
            shipping_weight: formData.Shopingsweight,
            shipping_weight_unit: formData.productweight,
            display_dimension_length: formData.DisplayDimenssionlength,
            display_dimension_width: formData.DisplayDimenssionwidth,
            display_dimension_height: formData.DisplayDimenssionheight,
            display_dimension_unit: formData.productunitValue,
            package_dimension_height: formData.PackageDimenssionheight,
            package_dimension_length: formData.PackageDimenssionlength,
            package_dimension_width: formData.PackageDimenssionwidth,
            package_weight: formData.packageWidth,
            package_weight_unit: formData.packageweight,
            unit_count: formData.productcateUnitCount,
            unit_count_type: formData.productcateUnitCounttypeee,
            how_product_made: formData.HowAreYouProuduct,
            occasion: occassion,
            design: formData.productdetailsDesign,
            material: materialdata,
            package_dimension_unit: formData.PackageDimenssionUnit,
            bestseller: formData.bestSelling,
            popular_gifts: formData.popularGifts,
            vendor_id: formData.vendor || null,
            form_values: formValues,
            variations_data: variationsData,
            tabs: formData.tabs,
            exchangePolicy: formData.exchangePolicy,
            zoom: transformData,
            isCombination: combinations.length > 0
        };

        try {
            setLoading(true);
            const fData = buildProductFormData(payload, combinations);
            const res = await ApiService.postImage(apiEndpoints.addProduct, fData, auth_key);
            setLoading(false);
            if (res?.status === 200) {
                // use your existing callbacks (keep them unchanged)
                handleUploadImage(res?.data?.product?._id, res?.data?.message);
            }
        } catch (error) {
            setLoading(false);
            handleOpen("error", error?.response?.data || error);
        }
    };

    const handleDraftProduct = async () => {
        const occassion = formData.productdetailsOccassion.map((o) => o._id);
        const genderdata = formData.gender.map((g) => g.label);
        const materialdata = formData.combinedMaterials.map((m) => m.label);

        let payload = {
            _id: queryId ? queryId : "new",
            category: formData.subCategory || null,
            variant_id: formData.ParentMainId || null,
            variant_attribute_id: formData.varientName || null,
            product_title: formData.productTitle,
            product_type: formData.productType,
            tax_ratio: formData.taxRatio,
            bullet_points: formData.bulletPoints,
            description: formData.productDescription,
            customize: formData.customization,
            customizationData: customizationData || {},
            search_terms: keys,
            launch_date: formData.launchData,
            release_date: formData.releaseDate,
            brand_id: formData.brandName || null,
            production_time: formData.productionTime,
            sku_code: formData.sellerSku,
            tax_code: formData.ProductTaxCode,
            shipping_templates: formData.shipingTemplates || null,
            price: +formData.yourPrice,
            sale_price: +formData.salePrice,
            sale_start_date: formData.saleStartDate,
            sale_end_date: formData.saleEndDate,
            qty: formData.quantity,
            max_order_qty: formData.maxOrderQuantity,
            color: formData.color,
            can_offer: formData.offeringCanBe,
            gift_wrap: formData.isGiftWrap,
            restock_date: formData.reStockDate,
            gender: genderdata,
            size: formData.searchTerms,
            product_size: formData.productsize,
            size_map: formData.productsizeMap,
            color_textarea: formData.productcolor,
            color_map: formData.colorMap,
            style_name: formData.StyleName,
            shipping_weight: formData.Shopingsweight,
            shipping_weight_unit: formData.productweight,
            display_dimension_length: formData.DisplayDimenssionlength,
            display_dimension_width: formData.DisplayDimenssionwidth,
            display_dimension_height: formData.DisplayDimenssionheight,
            display_dimension_unit: formData.productunitValue,
            package_dimension_height: formData.PackageDimenssionheight,
            package_dimension_length: formData.PackageDimenssionlength,
            package_dimension_width: formData.PackageDimenssionwidth,
            package_weight: formData.packageWidth,
            package_weight_unit: formData.packageweight,
            unit_count: formData.productcateUnitCount,
            unit_count_type: formData.productcateUnitCounttypeee,
            how_product_made: formData.HowAreYouProuduct,
            occasion: occassion,
            design: formData.productdetailsDesign,
            material: materialdata,
            package_dimension_unit: formData.PackageDimenssionUnit,
            bestseller: formData.bestSelling,
            popular_gifts: formData.popularGifts,
            vendor_id: formData.vendor || null,
            form_values: formValues,
            variations_data: variationsData,
            tabs: formData.tabs,
            exchangePolicy: formData.exchangePolicy || null,
            zoom: transformData,
            isCombination: combinations.length > 0
        };

        try {
            setDraftLoading(true);
            const fData = buildProductFormData(payload, combinations);
            const res = await ApiService.postImage(apiEndpoints.addDraftProduct, fData, auth_key);
            setDraftLoading(false);
            if (res?.status === 200) {
                if (queryId) {
                    handleUploadImage2(res?.data?.product?._id, res?.data?.message);
                } else {
                    handleUploadImage(res?.data?.product?._id, res?.data?.message);
                }
            }
        } catch (error) {
            setDraftLoading(false);
            handleOpen("error", error?.response?.data || error);
        }
    };

    const EditProducthandler = async () => {
        // keep same validation checks as addProducthandler (you already have those)
        const errors = {};
        // combinations.forEach((variant) => {
        //     variant.combinations.forEach((item, index) => {
        //         const isPriceCheckApplicable =
        //             (variationsData.length >= 2 ? formValues?.prices === variant.variant_name : true) &&
        //             item?.isCheckedPrice &&
        //             item?.isVisible;
        //
        //         if (isPriceCheckApplicable && (!item?.price)) {
        //             errors[`Price-${variant.variant_name}-${index}`] = "Price is required";
        //         }
        //         const isQtyCheckApplicable =
        //             (variationsData.length >= 2 ? formValues?.quantities === variant.variant_name : true) &&
        //             item?.isCheckedQuantity &&
        //             item?.isVisible;
        //
        //         if (isQtyCheckApplicable && (!item?.qty)) {
        //             errors[`Quantity-${variant.variant_name}-${index}`] = "Quantity is required";
        //         }
        //     });
        // });
        //
        // if (Object.keys(errors).length > 0) {
        //     setCombinationError(errors);
        //     setShowAll(true);
        //     return;
        // }
        //
        // setCombinationError({});

        // other validations remain same...
        if (!formData.sellerSku) {
            setInputErrors((prv) => ({...prv, sellerSku: "Seller Sku is Required"}));
            return;
        }

        // build payload similar to addProducthandler but _id = queryId
        const occassion = formData.productdetailsOccassion.map((o) => o._id);
        const genderdata = formData.gender.map((g) => g.label);
        const materialdata = formData.combinedMaterials.map((m) => m.label);

        let payload = {
            category: formData.subCategory,
            variant_id: formData.ParentMainId,
            variant_attribute_id: formData.varientName,
            product_title: formData.productTitle,
            product_type: formData.productType,
            tax_ratio: formData.taxRatio,
            bullet_points: formData.bulletPoints,
            description: formData.productDescription,
            customize: formData.customization,
            customizationData: customizationData || {},
            search_terms: keys,
            launch_date: formData.launchData,
            release_date: formData.releaseDate,
            _id: queryId,
            brand_id: formData.brandName || null,
            production_time: formData.productionTime,
            sku_code: formData.sellerSku,
            tax_code: formData.ProductTaxCode,
            shipping_templates: formData.shipingTemplates,
            price: formData.yourPrice,
            sale_price: formData.salePrice,
            sale_start_date: formData.saleStartDate,
            sale_end_date: formData.saleEndDate,
            qty: formData.quantity,
            max_order_qty: formData.maxOrderQuantity,
            color: formData.color,
            can_offer: formData.offeringCanBe,
            gift_wrap: formData.isGiftWrap,
            restock_date: formData.reStockDate,
            gender: genderdata,
            size: formData.searchTerms,
            product_size: formData.productsize,
            size_map: formData.productsizeMap,
            color_textarea: formData.productcolor,
            color_map: formData.colorMap,
            style_name: formData.StyleName,
            shipping_weight: formData.Shopingsweight,
            shipping_weight_unit: formData.productweight,
            display_dimension_length: formData.DisplayDimenssionlength,
            display_dimension_width: formData.DisplayDimenssionwidth,
            display_dimension_height: formData.DisplayDimenssionheight,
            display_dimension_unit: formData.productunitValue,
            package_dimension_height: formData.PackageDimenssionheight,
            package_dimension_length: formData.PackageDimenssionlength,
            package_dimension_width: formData.PackageDimenssionwidth,
            package_weight: formData.packageWidth,
            package_weight_unit: formData.packageweight,
            unit_count: formData.productcateUnitCount,
            unit_count_type: formData.productcateUnitCounttypeee,
            how_product_made: formData.HowAreYouProuduct,
            occasion: occassion,
            design: formData.productdetailsDesign,
            material: materialdata,
            package_dimension_unit: formData.PackageDimenssionUnit,
            bestseller: formData.bestSelling,
            popular_gifts: formData.popularGifts,
            vendor_id: formData.vendor || null,
            form_values: formValues,
            variations_data: variationsData,
            tabs: formData.tabs,
            exchangePolicy: formData.exchangePolicy,
            zoom: transformData,
            isCombination: combinations.length > 0
        };

        try {
            setLoading(true);
            const fData = buildProductFormData(payload, combinations);
            const res = await ApiService.postImage(apiEndpoints.addProduct, fData, auth_key);
            setLoading(false);
            if (res?.status === 200) {
                handleUploadImage2(res?.data?.product?._id, res?.data?.message);
            }
        } catch (error) {
            setLoading(false);
            handleOpen("error", error?.response?.data || error);
        }
    };

    const handleUploadVideo = async (id) => {
        const videoArr = formData.videos.map((e) => e.file);
        console.log({videoArr});
        try {
            const fData = new FormData();
            videoArr.forEach((file) => {
                fData.append("videos", file);
            });
            fData.append("id", id);
            const res = await ApiService.postImage(apiEndpoints.uploadProductVideo, fData, auth_key);
            if (res.status === 200) {
                return true;
            }
        } catch (error) {
            setLoading(false);
            setDraftLoading(false);
            handleOpen("error", error?.response?.data || error);
        }
    };

    const editVideoHandler = async (msg) => {
        const filterVideoData = formData.videos.filter((res) => res.file);
        console.log("filterImagesData", filterVideoData);
        const videoArr = filterVideoData?.map((e) => e.file);
        console.log({videoArr});
        try {
            const fData = new FormData();

            videoArr.forEach((file) => {
                if (filterVideoData.length > 0) {
                    console.log("gggggggggggggggggggggg");
                    fData.append("videos", file);
                }
            });
            fData.append("id", queryId);
            if (formData.deletedVideos.length > 0) {
                uniqueSetVideoarr.forEach((item) => {
                    fData.append("deleteVidArr[]", item);
                });
                // fData.append("deleteImgArr", JSON.stringify(uniqueSetarr));
            }
            console.log("payyloadddddfData", fData);
            if (filterVideoData.length === 0 && formData.deletedVideos.length == 0) {
                setLoading(false);
                setDraftLoading(false);
                // navigate(ROUTE_CONSTANT.catalog.product.list);
                setRoute(ROUTE_CONSTANT.catalog.product.list);
                handleOpen("success", "Product Updated Sucessfully")
            } else {
                const res = await ApiService.postImage(apiEndpoints.uploadProductVideo, fData, auth_key);
                if (res.status === 200) {
                    return true;
                }
            }
        } catch (error) {
            setLoading(false);
            setDraftLoading(false);
            handleOpen("error", error?.response?.data || error);
        }
    };

    const handleUploadImage2 = async (id, msg) => {
        const {images, deleteIconData} = formData;
        const filterImagesData = images.filter((img) => img.file);
        const sortImagesData = images.filter((img) => !img.file);
        const newSortArray = filterImagesData.map((img) => img.file?.sortOrder);
        const sortedArray = sortImagesData.map((img) => ({
            name: img.src.split("product/")[1],
            sortOrder: img.sortOrder,
        }));

        console.log("filterImagesData", filterImagesData);
        console.log("newSortArray", newSortArray);
        console.log("sortedArray", sortedArray);

        const fData = new FormData();
        try {
            const appendArrayToFormData = (key, array) => {
                array.forEach((item) => fData.append(key, JSON.stringify(item)));
            };

            filterImagesData.forEach((img) => fData.append("images", img.file));
            appendArrayToFormData("newImgSortArray[]", newSortArray);
            appendArrayToFormData("existimageSortOrder[]", sortedArray);

            altText.forEach((text) => fData.append("altText", text));

            if (deleteIconData.length > 0) {
                deleteIconData.forEach((item) => fData.append("deleteImgArr[]", item));
            }

            fData.append("_id", queryId);

            console.log("Payload FormData:", fData);
            const res = await ApiService.postImage(apiEndpoints.addProductImages, fData, auth_key);
            if (res.status === 200) {
                const apiRes = await editVideoHandler(queryId);
                if (apiRes) {
                    setLoading(false);
                    setDraftLoading(false);
                    // navigate(ROUTE_CONSTANT.catalog.product.list);
                    setRoute(ROUTE_CONSTANT.catalog.product.list);
                    handleOpen("success", msg);
                }
            }
        } catch (error) {
            setLoading(false);
            setDraftLoading(false);
            handleOpen("error", error?.response?.data || error);
        } finally {
            setLoading(false);
            setDraftLoading(false);
        }
    };

    const handleUploadImage = async (id, msg) => {
        const imgArr = formData.images.map((e) => e.file);
        console.log({imgArr});
        try {
            const fData = new FormData();

            imgArr.forEach((file) => {
                fData.append("images", file);
            });
            fData.append("_id", id);
            const res = await ApiService.postImage(apiEndpoints.addProductImages, fData, auth_key);
            if (res.status === 200) {
                const apiRes = await handleUploadVideo(id);
                console.log({apiRes});
                if (apiRes) {
                    setLoading(false);
                    setDraftLoading(false);
                    // navigate(ROUTE_CONSTANT.catalog.product.list);
                    setRoute(ROUTE_CONSTANT.catalog.product.list);
                    handleOpen("success", msg);
                }
            }
        } catch (error) {
            setLoading(false);
            setDraftLoading(false);
            handleOpen("error", error?.response?.data || error);
        }
    };

    useEffect(() => {
        if (formValues?.isCheckedPrice) {
            setFormData((prev) => ({...prev, salePrice: ""}))
        }
        if (formValues?.isCheckedQuantity) {
            setFormData((prev) => ({...prev, quantity: ""}));
        }
    }, [variationsData.length, formValues.isCheckedPrice, formValues?.isCheckedQuantity])

    useEffect(() => {
        if (designation_id == "3") {
            setFormData((prev) => ({...prev, vendor: vendorId}));
        }
    }, [designation_id]);

    return (
        <Box sx={{width: "100%"}}>
            <Box sx={{borderBottom: 1, borderColor: "divider"}}>
                <Tabs value={tabsValue} onChange={handleChange} aria-label="basic tabs example">
                    <Tab
                        icon={
                            inputErrors.productTitle || inputErrors.subCategory || inputErrors.vendor ? (
                                <ErrorIcon
                                    sx={{
                                        borderRadius: "50%",
                                        color: "red"
                                    }}
                                />
                            ) : (
                                ""
                            )
                        }
                        iconPosition="start"
                        label={`Product Identity`}
                        {...a11yProps(0)}
                    />
                    <Tab
                        icon={
                            inputErrors.des || inputErrors.images ? (
                                <ErrorIcon
                                    sx={{
                                        borderRadius: "50%",
                                        color: "red"
                                    }}
                                />
                            ) : (
                                ""
                            )
                        }
                        iconPosition="start"
                        // disabled={formData.productTitle && formData.subCategory ? false : true}
                        label="Description"
                        {...a11yProps(1)}
                    />
                    <Tab
                        iconPosition="start"
                        // disabled={formData.productTitle && formData.subCategory ? false : true}
                        label="Dynamic Tabs"
                        {...a11yProps(2)}
                    />
                    <Tab
                        // disabled={
                        //   formData.images.length === 0 &&
                        //   (formData.bulletPoints === "<p><br></p>" || !formData.bulletPoints)
                        //     ? true
                        //     : false
                        // }
                        icon={
                            Object.keys(combinationError || {}).length > 0 ? (
                                <ErrorIcon
                                    sx={{
                                        borderRadius: "50%",
                                        color: "red"
                                    }}
                                />
                            ) : (
                                ""
                            )
                        }
                        iconPosition="start"
                        label="Product Details"
                        {...a11yProps(3)}
                    />
                    <Tab
                        icon={
                            inputErrors.sellerSku ||
                            inputErrors.shipingTemplates ||
                            inputErrors.salePrice ||
                            inputErrors.quantity ? (
                                <ErrorIcon
                                    sx={{
                                        borderRadius: "50%",
                                        color: "red"
                                    }}
                                />
                            ) : (
                                ""
                            )
                        }
                        iconPosition="start"
                        // disabled={
                        //   formData.images.length === 0 &&
                        //   (formData.bulletPoints === "<p><br></p>" || !formData.bulletPoints)
                        //     ? true
                        //     : false
                        // }
                        label="Offer"
                        {...a11yProps(4)}
                    />
                    {formData.customization === "Yes" ? (
                        <>
                            <Tab label="Customization" onClick={() => setTabsValue(5)} {...a11yProps(5)} />
                        </>
                    ) : (
                        <></>
                    )}
                </Tabs>
            </Box>
            <CustomTabPanel value={tabsValue} index={0}>
                <ProductIdentity
                    queryId={queryId}
                    EditProducthandler={EditProducthandler}
                    loading={loading}
                    draftLoading={draftLoading}
                    formData={formData}
                    setFormData={setFormData}
                    setTabsValue={setTabsValue}
                    inputErrors={inputErrors}
                    setInputErrors={setInputErrors}
                    handleDraftProduct={handleDraftProduct}
                />
            </CustomTabPanel>
            <CustomTabPanel value={tabsValue} index={1}>
                <DescriptionTabs
                    queryId={queryId}
                    loading={loading}
                    draftLoading={draftLoading}
                    inputErrors={inputErrors}
                    setInputErrors={setInputErrors}
                    formData={formData}
                    EditProducthandler={EditProducthandler}
                    setFormData={setFormData}
                    setTabsValue={setTabsValue}
                    altText={altText}
                    setAltText={setAltText}
                    handleOpen={handleOpen}
                    transformData={transformData}
                    setTransformData={setTransformData}
                    handleDraftProduct={handleDraftProduct}
                />
            </CustomTabPanel>
            <CustomTabPanel value={tabsValue} index={2}>
                <DynamicTabs
                    queryId={queryId}
                    loading={loading}
                    draftLoading={draftLoading}
                    formData={formData}
                    EditProducthandler={EditProducthandler}
                    setFormData={setFormData}
                    setTabsValue={setTabsValue}
                    handleDraftProduct={handleDraftProduct}
                />
            </CustomTabPanel>
            <CustomTabPanel value={tabsValue} index={3}>
                <CustomisationTabs
                    queryId={queryId}
                    loading={loading}
                    draftLoading={draftLoading}
                    formData={formData}
                    setFormData={setFormData}
                    setTabsValue={setTabsValue}
                    EditProducthandler={EditProducthandler}
                    keys={keys}
                    setKeys={setKeys}
                    EdtiFroemData={EdtiFroemData}
                    combinations={combinations}
                    setCombinations={setCombinations}
                    formValues={formValues}
                    setFormValues={setFormValues}
                    variationsData={variationsData}
                    setVariationsData={setVariationsData}
                    selectedVariations={selectedVariations}
                    setSelectedVariations={setSelectedVariations}
                    combinationError={combinationError}
                    setCombinationError={setCombinationError}
                    showAll={showAll}
                    setShowAll={setShowAll}
                    handleDraftProduct={handleDraftProduct}
                />
            </CustomTabPanel>

            <CustomTabPanel value={tabsValue} index={4}>
                <OfferDetails
                    queryId={queryId}
                    inputErrors={inputErrors}
                    setInputErrors={setInputErrors}
                    formData={formData}
                    setFormData={setFormData}
                    setTabsValue={setTabsValue}
                    keys={keys}
                    handleUploadImage={handleUploadImage}
                    handleUploadImage2={handleUploadImage2}
                    editVideoHandler={editVideoHandler}
                    handleUploadVideo={handleUploadVideo}
                    EditProducthandler={EditProducthandler}
                    addProducthandler={addProducthandler}
                    loading={loading}
                    draftLoading={draftLoading}
                    setLoading={setLoading}
                    variationsData={variationsData}
                    formValues={formValues}
                    handleDraftProduct={handleDraftProduct}
                />
            </CustomTabPanel>
            {formData.customization === "Yes" ? (
                <>
                    <CustomTabPanel value={tabsValue} index={5}>
                        <CustomisationInner customizationData={customizationData}
                                            setCustomizationData={setCustomizationData}
                                            EditProducthandler={EditProducthandler} loading={loading}
                                            draftLoading={draftLoading} handleDraftProduct={handleDraftProduct}/>
                    </CustomTabPanel>
                </>
            ) : (
                <></>
            )}
            <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg}/>
        </Box>
    );
}
