// hooks/useProductAPI.js
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import {useProductFormStore} from "./useAddProducts";

export const useProductAPI = () => {
    const [loading, setLoading] = useState(false);
    const [draftLoading, setDraftLoading] = useState(false);
    const navigate = useNavigate();

    const auth_key = localStorage.getItem(localStorageKey.auth_key);
    const designation_id = localStorage.getItem(localStorageKey.designation_id);
    const vendorId = localStorage.getItem(localStorageKey.vendorId);

    // ---------------- helper to build FormData ----------------
    const buildProductFormData = (payload, combinations, customizationData) => {
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
            console.log("Edited Data", variant);
            // Skip empty variants
            if (!variant || !variant.combinations || variant.combinations.length === 0) {
                return;
            }

            (variant.combinations || []).forEach((comb, cIndex) => {
                console.log("Edited Data", comb);

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

                    console.log("Edited Data", JSON.stringify(fieldVal), fieldKey, fieldKey === "edit_main_image_data",
                        fieldKey === "edit_preview_image_data");

                    if ((fieldKey === "edit_main_image_data" ||
                        fieldKey === "edit_preview_image_data") && fieldVal && fieldKey) {
                        console.log("Edited Data", JSON.stringify(fieldVal), fieldKey);
                        fData.append(
                            `combinationData[${vIndex}][combinations][${cIndex}][${fieldKey}]`,
                            typeof fieldVal === "string" ? fieldVal : JSON.stringify(fieldVal)
                        );
                        return;
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
                        fData.append(
                            `combinationData[${vIndex}][combinations][${cIndex}][main_images][]`,
                            img
                        );
                    }
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

        // 3) Append customization data with images - UPDATED TO MATCH COMBINATIONS STRUCTURE
        if (customizationData && customizationData.customizations && customizationData.customizations.length > 0) {
            // Append basic customization fields
            fData.append(`customizationData[label]`, customizationData.label || '');
            fData.append(`customizationData[instructions]`, customizationData.instructions || '');

            customizationData.customizations.forEach((customization, cIndex) => {
                // Append basic customization fields
                fData.append(`customizationData[customizations][${cIndex}][title]`, customization.title || '');
                fData.append(`customizationData[customizations][${cIndex}][label]`, customization.label || '');
                fData.append(`customizationData[customizations][${cIndex}][instructions]`, customization.instructions || '');
                fData.append(`customizationData[customizations][${cIndex}][isCompulsory]`, customization.isCompulsory ? 'true' : 'false');
                fData.append(`customizationData[customizations][${cIndex}][isVariant]`, customization.isVariant ? 'true' : 'false');

                // Handle text customization specific fields
                if (customization.placeholder !== undefined) {
                    fData.append(`customizationData[customizations][${cIndex}][placeholder]`, customization.placeholder);
                }
                if (customization.price !== undefined) {
                    fData.append(`customizationData[customizations][${cIndex}][price]`, customization.price);
                }
                if (customization.min !== undefined) {
                    fData.append(`customizationData[customizations][${cIndex}][min]`, customization.min);
                }
                if (customization.max !== undefined) {
                    fData.append(`customizationData[customizations][${cIndex}][max]`, customization.max);
                }

                // Handle option list for variant and dropdown customizations
                if (customization.optionList && Array.isArray(customization.optionList)) {
                    customization.optionList.forEach((option, oIndex) => {
                        // Append basic option fields
                        fData.append(`customizationData[customizations][${cIndex}][optionList][${oIndex}][optionName]`, option.optionName || '');
                        fData.append(`customizationData[customizations][${cIndex}][optionList][${oIndex}][priceDifference]`, option.priceDifference || '0');
                        fData.append(`customizationData[customizations][${cIndex}][optionList][${oIndex}][isVisible]`, option.isVisible !== false ? 'true' : 'false');

                        // Handle edit data for images
                        if (option.edit_main_image_data) {
                            fData.append(
                                `customizationData[customizations][${cIndex}][optionList][${oIndex}][edit_main_image_data]`,
                                typeof option.edit_main_image_data === "string" ? option.edit_main_image_data : JSON.stringify(option.edit_main_image_data)
                            );
                        }

                        if (option.edit_preview_image_data) {
                            fData.append(
                                `customizationData[customizations][${cIndex}][optionList][${oIndex}][edit_preview_image_data]`,
                                typeof option.edit_preview_image_data === "string" ? option.edit_preview_image_data : JSON.stringify(option.edit_preview_image_data)
                            );
                        }

                        // Handle main images array
                        if (option.main_images && Array.isArray(option.main_images)) {
                            option.main_images.forEach((image, imgIndex) => {
                                if (image instanceof File) {
                                    fData.append(
                                        `customizationData[customizations][${cIndex}][optionList][${oIndex}][main_images][]`,
                                        image
                                    );
                                } else if (typeof image === "string") {
                                    // Append empty string for removed images
                                    fData.append(
                                        `customizationData[customizations][${cIndex}][optionList][${oIndex}][main_images][]`,
                                        image
                                    );
                                }
                            });
                        }

                        // Handle preview image
                        if (option.preview_image instanceof File) {
                            fData.append(
                                `customizationData[customizations][${cIndex}][optionList][${oIndex}][preview_image]`,
                                option.preview_image
                            );
                        } else if (typeof option.preview_image === "string") {
                            fData.append(
                                `customizationData[customizations][${cIndex}][optionList][${oIndex}][preview_image]`,
                                option.preview_image
                            );
                        }

                        // Handle thumbnail image
                        if (option.thumbnail instanceof File) {
                            fData.append(
                                `customizationData[customizations][${cIndex}][optionList][${oIndex}][thumbnail]`,
                                option.thumbnail
                            );
                        } else if (typeof option.thumbnail === "string") {
                            fData.append(
                                `customizationData[customizations][${cIndex}][optionList][${oIndex}][thumbnail]`,
                                option.thumbnail
                            );
                        }

                        // Handle edited images
                        if (option.edit_main_image instanceof File) {
                            fData.append(
                                `customizationData[customizations][${cIndex}][optionList][${oIndex}][edit_main_image]`,
                                option.edit_main_image
                            );
                        } else if (typeof option.edit_main_image === "string") {
                            fData.append(
                                `customizationData[customizations][${cIndex}][optionList][${oIndex}][edit_main_image]`,
                                option.edit_main_image
                            );
                        }

                        if (option.edit_preview_image instanceof File) {
                            fData.append(
                                `customizationData[customizations][${cIndex}][optionList][${oIndex}][edit_preview_image]`,
                                option.edit_preview_image
                            );
                        } else if (typeof option.edit_preview_image === "string") {
                            fData.append(
                                `customizationData[customizations][${cIndex}][optionList][${oIndex}][edit_preview_image]`,
                                option.edit_preview_image
                            );
                        }
                    });
                }
            });
        }

        return fData;
    };

    // Build payload for product submission
    const buildProductPayload = (isEdit = false, queryId = null) => {
        const state = useProductFormStore.getState();
        const {
            formData,
            formValues,
            variationsData,
            combinations,
            customizationData,
            keys,
        } = state;

        const occassion = formData.productdetailsOccassion?.map((o) => o._id) || [];
        const genderdata = formData.gender?.map((g) => g.label) || [];
        const materialdata = formData.combinedMaterials?.map((m) => m.label) || [];

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
            search_terms: keys,
            launch_date: formData.launchData,
            release_date: formData.releaseDate,
            _id: isEdit ? queryId : "new",
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
            zoom: formData.transformData,
            isCombination: combinations.length > 0
        };

        return payload;
    };

    // Validate combinations
    const validateCombinations = () => {
        const state = useProductFormStore.getState();
        const { variationsData, formValues, combinations } = state;

        const errors = {};
        combinations.forEach((variant) => {
            variant.combinations.forEach((item, index) => {
                const isPriceCheckApplicable =
                    (variationsData.length >= 2 ? formValues?.prices === variant.variant_name : true) &&
                    item?.isCheckedPrice &&
                    item?.isVisible;

                if (isPriceCheckApplicable && (!item?.price)) {
                    errors[`Price-${variant.variant_name}-${index}`] = "Price is required";
                }
                const isQtyCheckApplicable =
                    (variationsData.length >= 2 ? formValues?.quantities === variant.variant_name : true) &&
                    item?.isCheckedQuantity &&
                    item?.isVisible;

                if (isQtyCheckApplicable && (!item?.qty)) {
                    errors[`Quantity-${variant.variant_name}-${index}`] = "Quantity is required";
                }
            });
        });

        return errors;
    };

    // Submit product (add or edit)
    const submitProduct = async (isEdit = false, queryId = null) => {
        try {
            setLoading(true);

            // Validate combinations
            const combinationErrors = validateCombinations();
            // if (Object.keys(combinationErrors).length > 0) {
            //     useProductFormStore.getState().setCombinationError(combinationErrors);
            //     useProductFormStore.getState().setShowAll(true);
            //     throw new Error("Please fix combination errors");
            // }

            // Build payload and form data
            const payload = buildProductPayload(isEdit, queryId);
            const state = useProductFormStore.getState();
            const fData = buildProductFormData(payload, state.combinations, state.customizationData);

            // Make API call
            const endpoint = isEdit ? apiEndpoints.addProduct : apiEndpoints.addProduct;
            const res = await ApiService.postImage(endpoint, fData, auth_key);

            if (res?.status === 200) {
                // Handle image upload for new products
                if (!isEdit) {
                    await handleUploadImage(res?.data?.product?._id);
                } else {
                    await handleUploadImage2(res?.data?.product?._id);
                }

                return res;
            }
        } catch (error) {
            console.error("Error submitting product:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Save as draft
    const saveDraft = async (queryId = null) => {
        try {
            setDraftLoading(true);

            const payload = buildProductPayload(!!queryId, queryId);
            const state = useProductFormStore.getState();
            const fData = buildProductFormData(payload, state.combinations, state.customizationData);

            const res = await ApiService.postImage(apiEndpoints.addDraftProduct, fData, auth_key);

            if (res?.status === 200) {
                if (queryId) {
                    await handleUploadImage2(res?.data?.product?._id);
                } else {
                    await handleUploadImage(res?.data?.product?._id);
                }

                return res;
            }
        } catch (error) {
            console.error("Error saving draft:", error);
            throw error;
        } finally {
            setDraftLoading(false);
        }
    };

    // Image upload handlers
    const handleUploadImage = async (id) => {
        const state = useProductFormStore.getState();
        const imgArr = state.formData.images.map((e) => e.file).filter(Boolean);

        try {
            const fData = new FormData();
            imgArr.forEach((file) => {
                fData.append("images", file);
            });
            fData.append("_id", id);

            const res = await ApiService.postImage(apiEndpoints.addProductImages, fData, auth_key);
            if (res.status === 200) {
                const apiRes = await handleUploadVideo(id);
                if (apiRes) {
                    navigate(ROUTE_CONSTANT.catalog.product.list);
                    return true;
                }
            }
        } catch (error) {
            console.error("Error uploading images:", error);
            throw error;
        }
    };

    const handleUploadImage2 = async (id) => {
        const state = useProductFormStore.getState();
        const { images, deleteIconData, altText } = state.formData;

        const filterImagesData = images.filter((img) => img.file);
        const sortImagesData = images.filter((img) => !img.file);
        const newSortArray = filterImagesData.map((img) => img.file?.sortOrder);
        const sortedArray = sortImagesData.map((img) => ({
            name: img.src.split("product/")[1],
            sortOrder: img.sortOrder,
        }));

        const deleteArr = deleteIconData
            ?.map((item) => {
                if (typeof item === "string") {
                    const arrsplit = item.split("product/");
                    return arrsplit[1];
                }
                return null;
            })
            .filter(Boolean);

        const uniqueSetarr = [...new Set(deleteArr)];

        try {
            const fData = new FormData();

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

            fData.append("_id", id);

            const res = await ApiService.postImage(apiEndpoints.addProductImages, fData, auth_key);
            if (res.status === 200) {
                const apiRes = await editVideoHandler(id);
                if (apiRes) {
                    navigate(ROUTE_CONSTANT.catalog.product.list);
                    return true;
                }
            }
        } catch (error) {
            console.error("Error uploading images for edit:", error);
            throw error;
        }
    };

    const handleUploadVideo = async (id) => {
        const state = useProductFormStore.getState();
        const videoArr = state.formData.videos.map((e) => e.file).filter(Boolean);

        try {
            const fData = new FormData();
            videoArr.forEach((file) => {
                fData.append("videos", file);
            });
            fData.append("id", id);

            const res = await ApiService.postImage(apiEndpoints.uploadProductVideo, fData, auth_key);
            return res.status === 200;
        } catch (error) {
            console.error("Error uploading videos:", error);
            throw error;
        }
    };

    const editVideoHandler = async (id) => {
        const state = useProductFormStore.getState();
        const { videos, deletedVideos } = state.formData;

        const filterVideoData = videos.filter((res) => res.file);
        const videoArr = filterVideoData?.map((e) => e.file);

        const deleteVideoArr = deletedVideos?.map((item) => {
            const arrsplit = item.split("video/");
            return arrsplit[1];
        });

        const uniqueSetVideoarr = [...new Set(deleteVideoArr)];

        try {
            const fData = new FormData();

            videoArr.forEach((file) => {
                if (filterVideoData.length > 0) {
                    fData.append("videos", file);
                }
            });

            fData.append("id", id);

            if (deletedVideos.length > 0) {
                uniqueSetVideoarr.forEach((item) => {
                    fData.append("deleteVidArr[]", item);
                });
            }

            if (filterVideoData.length === 0 && deletedVideos.length == 0) {
                navigate(ROUTE_CONSTANT.catalog.product.list);
                return true;
            } else {
                const res = await ApiService.postImage(apiEndpoints.uploadProductVideo, fData, auth_key);
                return res.status === 200;
            }
        } catch (error) {
            console.error("Error editing videos:", error);
            throw error;
        }
    };

    // Fetch edit product data
    const fetchEditProductData = async (productId) => {
        try {
            const editapiUrl = `${apiEndpoints.EditProduct}/${productId}`;
            const res = await ApiService.get(editapiUrl, auth_key);
            if (res?.status === 200) {
                useProductFormStore.getState().initializeFormWithEditData(res?.data?.productData);
                return res?.data?.productData;
            }
        } catch (error) {
            console.error("Error fetching edit product data:", error);
            throw error;
        }
    };

    return {
        // State
        loading,
        draftLoading,

        // Main actions
        submitProduct,
        saveDraft,
        fetchEditProductData,

        // Validation
        validateCombinations,
        buildProductFormData,
        buildProductPayload,

        // Image handlers
        handleUploadImage,
        handleUploadImage2,
        handleUploadVideo,
        editVideoHandler
    };
};

export default useProductAPI;
