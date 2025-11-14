// stores/parentProductStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ApiService } from 'app/services/ApiService';
import { apiEndpoints } from 'app/constant/apiEndpoints';
import { localStorageKey } from 'app/constant/localStorageKey';
import { ROUTE_CONSTANT } from 'app/constant/routeContanst';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

const auth_key = localStorage.getItem(localStorageKey.auth_key);

export const useParentProductStore = create(devtools((set, get) => ({
    // Form state
    formData: {
        productTitle: "",
        description: "",
        subCategory: "",
        sellerSku: "",
        Innervariations: {},
        variantData: [],
        variant_id: [],
        variant_name: [],
        images: [],
        transformData: { scale: 1, x: 0, y: 0 },
    },

    // UI state
    inputFields: [{ id: 1, attributeValue: "", sortOrder: "", status: false }],
    selectedBrand: "",
    brandlist: [],
    allCategory: [],
    selectedCatLable: "Select Category",
    showVariant: false,
    varintList: [],
    varientAttribute: [],
    isCoponentLoader: false,
    issubmitLoader: false,
    variantArrValues: [],
    skuErrors: {},
    loadingSkus: {},
    sellerSky: [],
    combinationMap: new Map(),
    usedSkus: new Set(),
    inputErrors: {
        productTitle: "",
        variations: "",
        brandname: "",
        subCategory: "",
        description: "",
        sellerSku: "",
        innervariation: "",
        parentImage: ""
    },
    modalState: {
        open: false,
        type: "",
        route: null,
        msg: null
    },
    parentId: "",
    imgName: "",

    // Actions
    setFormData: (updates) => set((state) => ({
        formData: { ...state.formData, ...updates }
    })),

    setInputErrors: (errors) => set((state) => ({
        inputErrors: { ...state.inputErrors, ...errors }
    })),

    setImages: (images) => set((state) => ({
        formData: { ...state.formData, images },
        images: images
    })),

    setVariantArrValue: (values) => set({ variantArrValues: values }),

    setSellerSku: (skus) => set({ sellerSky: skus }),

    setSkuErrors: (errors) => set((state) => ({
        skuErrors: { ...state.skuErrors, ...errors }
    })),

    setLoadingSkus: (loading) => set((state) => ({
        loadingSkus: { ...state.loadingSkus, ...loading }
    })),

    setCombinationMap: (map) => set({ combinationMap: map }),

    setModalState: (updates) => set((state) => ({
        modalState: { ...state.modalState, ...updates }
    })),

    setVarientAttribute: (attributes) => set({ varientAttribute: attributes }),

    setParentId: (id) => set({ parentId: id }),

    setIsComponentLoader: (loading) => set({ isCoponentLoader: loading }),

    setIsSubmitLoader: (loading) => set({ issubmitLoader: loading }),

    setVarintList: (list) => set({ varintList: list }),

    setAllCategory: (categories) => set({ allCategory: categories }),

    // Helper functions
    trimValue: (value) => {
        if (typeof value === 'string') return value.trim();
        return value;
    },

    trimObjectValues: (obj) => {
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
    },

    trimArrayValues: (array) => {
        if (!Array.isArray(array)) return array;
        return array.map(item => {
            if (typeof item === 'string') {
                return item.trim();
            } else if (typeof item === 'object' && item !== null) {
                return get().trimObjectValues(item);
            }
            return item;
        });
    },

    // Combination functions
    generateCombinationKey: (combination) => {
        return Object.keys(combination)
            .sort()
            .map(key => combination[key]._id)
            .join('_');
    },

    generateCombinations: (innervariations) => {
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
    },

    preserveCombinationData: (newCombinations, currentVariantData, currentSellerSky) => {
        const { combinationMap, generateCombinationKey } = get();
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
                    qty: "",
                    isExistingProduct: false
                };
                preservedSellerSky[newIndex] = "";
            }
        });

        return { preservedVariantData, preservedSellerSky };
    },

    updateCombinationMap: (combinations) => {
        const newMap = new Map();
        combinations.forEach((comb, index) => {
            const key = get().generateCombinationKey(comb);
            newMap.set(key, index);
        });
        set({ combinationMap: newMap });
    },

    // Variation handlers
    varintHandler: (value) => {
        const { setFormData, setInputErrors } = get();
        setFormData({
            variantData: value,
            variant_id: value.map((option) => option.id),
            variant_name: value.map((option) => option.variant_name)
        });
        setInputErrors({ variations: "" });
    },

    InnervariationsHandle: (variantId) => (event, newValue) => {
        const {
            formData,
            combinationMap,
            variantArrValues,
            sellerSky,
            generateCombinations,
            preserveCombinationData,
            updateCombinationMap,
            setFormData,
            setVariantArrValue,
            setSellerSku,
            setInputErrors
        } = get();

        const updatedInnervariations = {
            ...formData.Innervariations,
            [variantId]: newValue
        };

        const newCombinations = generateCombinations(updatedInnervariations);

        const { preservedVariantData, preservedSellerSky } = preserveCombinationData(
            newCombinations,
            variantArrValues,
            sellerSky
        );

        updateCombinationMap(newCombinations);

        setFormData({ Innervariations: updatedInnervariations });
        setVariantArrValue(preservedVariantData);
        setSellerSku(preservedSellerSky);
        setInputErrors({ innervariation: "" });
    },

    // Validation functions
    validateChildProductVariants: (childProductData, parentVariants) => {
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
    },

    checkForDuplicateSkus: (sku, index) => {
        const { sellerSky, trimValue } = get();
        if (!sku) return null;

        const trimmedSku = trimValue(sku);
        const otherSkus = sellerSky.filter((_, i) => i !== index).map(sku => trimValue(sku));

        if (otherSkus.includes(trimmedSku)) {
            return "This SKU is already used in another variant combination";
        }

        return null;
    },

    // API actions
    getBrandList: async () => {
        try {
            const res = await ApiService.get(apiEndpoints.getBrand, auth_key);
            if (res.status === 200) {
                set({ brandlist: res?.data?.brand });
            }
        } catch (error) {
            get().handleApiError(error, "Failed to load brands");
        }
    },

    getVaraintList: async () => {
        try {
            const typeParam = "type=Product";
            const urlWithParam = `${apiEndpoints.getAllActiveVarient}?${typeParam}`;
            const res = await ApiService.get(urlWithParam, auth_key);
            if (res.status === 200) {
                set({ varintList: res?.data?.parent });
            }
        } catch (error) {
            get().handleApiError(error, "Failed to load variants");
        }
    },

    getChildCategory: async () => {
        try {
            const res = await ApiService.get(apiEndpoints.getChildCategory, auth_key);
            if (res.status === 200) {
                set({ allCategory: res?.data?.data });
            }
        } catch (error) {
            get().handleApiError(error, "Failed to load categories");
        }
    },

    getParentProductDetail: async (productId) => {
        const {
            setFormData,
            setParentId,
            setVarientAttribute,
            setVariantArrValue,
            setSellerSku,
            setCombinationMap,
            setSkuErrors,
            validateChildProductVariants,
            handleApiError,
            generateCombinations,
            updateCombinationMap,
            setImages,
            setVarintList
        } = get();

        try {
            get().setIsComponentLoader(true);
            const res = await ApiService.get(
                `${apiEndpoints.getParentProductDetail}/${productId}`,
                auth_key
            );

            if (res?.status === 200) {
                const resData = res?.data?.data;

                // Set basic form data
                setFormData({
                    productTitle: resData?.product_title || "",
                    description: resData?.description || "",
                    sellerSku: resData?.seller_sku || "",
                    variant_id: resData?.variant_id?.map((option) => option?._id) || [],
                    variant_name: resData?.variant_id?.map((option) => option?.variant_name) || [],
                    subCategory: resData?.sub_category || "",
                    transformData: resData?.zppm || { scale: 1, x: 0, y: 0 },
                });

                // Set images
                if (resData?.image) {
                    setImages([{ src: `${res?.data?.base_url}${resData?.image}` }]);
                }

                setParentId(resData?._id);
                setVarientAttribute(resData?.variant_attribute_id?.map((option) => option._id) || []);

                // Handle variant data
                if (resData?.variant_id) {
                    const filteredVariantData = get().varintList.filter((variant) =>
                        resData.variant_id.map(v => v._id).includes(variant.id)
                    );
                    setFormData({ variantData: filteredVariantData });
                }

                // Handle SKU data fetching
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
                                qty: "",
                                isExistingProduct: false
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
                                setSkuErrors({ [i]: variantError });
                            }

                            return {
                                ...obj,
                                _id: obj.product_id,
                                sale_end_date,
                                sale_start_date,
                                price: obj.price || "",
                                sale_price: obj.sale_price || "",
                                qty: obj.qty || "",
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
                            qty: "",
                            isExistingProduct: false
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

                // Generate combinations for existing data
                if (resData?.variant_id && resData?.variant_attribute_id) {
                    const variantData = resData.variant_id.reduce((acc, item) => {
                        if (item?.variant_attribute) {
                            const filteredAttributes = item.variant_attribute.filter((variant) =>
                                resData.variant_attribute_id.some(attr => attr._id === variant._id)
                            );
                            if (filteredAttributes.length > 0) {
                                acc[item.variant_name] = filteredAttributes;
                            }
                        }
                        return acc;
                    }, {});

                    setFormData({ Innervariations: variantData });
                    const initialCombinations = generateCombinations(variantData);
                    updateCombinationMap(initialCombinations);
                }
            }
        } catch (error) {
            handleApiError(error, "Failed to load product details");
        } finally {
            get().setIsComponentLoader(false);
        }
    },

    handleApiError: (error, customMessage = null) => {
        console.error("API Error:", error);

        if (error?.response?.status === 401) {
            get().handleOpen("error", {
                message: "Session expired. Please login again.",
                response: { status: 401 }
            });
        } else if (error?.response?.data?.message) {
            get().handleOpen("error", error.response.data);
        } else {
            get().handleOpen("error", {
                message: customMessage || "Something went wrong. Please try again."
            });
        }
    },

    handleOpen: (type, msg) => {
        const message = msg?.message || msg;
        set({
            modalState: {
                open: true,
                type,
                msg: message,
                route: msg?.response?.status === 401 ? ROUTE_CONSTANT.login : null
            }
        });
    },

    handleClose: () => {
        const { modalState } = get();
        set({ modalState: { ...modalState, open: false } });

        if (modalState.route) {
            window.location.href = modalState.route;
        }
    },

    // Form submission
    parentsubmitHandle: async (productId) => {
        const {
            formData,
            variantArrValues,
            sellerSky,
            skuErrors,
            varientAttribute,
            parentId,
            setInputErrors,
            setIsSubmitLoader,
            handleOpen,
            generateCombinations,
            trimValue,
            trimArrayValues,
            handleApiError,
            images
        } = get();

        // Validation logic
        const errors = {};
        if (!trimValue(formData.productTitle)) errors.productTitle = "Product Title is Required";
        if (!trimValue(formData.description)) errors.description = "Description is Required";
        if (!trimValue(formData.sellerSku)) errors.sellerSku = "Seller Sku is Required";
        if (formData.variantData.length === 0) errors.variations = "Please Select At least one Variant";
        if (Object.keys(formData.Innervariations).length === 0) errors.innervariation = "Please Select At least one Innervariations Variant";
        if (images.length === 0) errors.parentImage = "Images Is Required";

        setInputErrors(errors);

        if (Object.keys(errors).length > 0) {
            toast.error("Please fill all required fields");
            return;
        }

        // SKU validation check
        const hasSkuErrors = Object.values(skuErrors).some(error => error);
        if (hasSkuErrors) {
            toast.error("Please fix SKU validation errors before submitting");
            return;
        }

        const currentCombinations = generateCombinations(formData.Innervariations);

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

        // Validate product array
        const validateProductArray = (combine) => {
            return combine.every((product, index) => {
                const isExistingProduct = product.isExistingProduct;
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
        };

        const check = validateProductArray(combine);
        if (!check) return;

        // API call logic
        const param = {
            _id: productId ? productId : "new",
            product_title: trimValue(formData.productTitle),
            description: trimValue(formData.description),
            seller_sku: trimValue(formData.sellerSku),
            variant_id: formData.variant_id,
            variant_attribute_id: varientAttribute,
            combinations: trimArrayValues(combine),
            sub_category: formData?.subCategory || "",
            sku: trimArrayValues(sellerSky),
            zppm: formData.transformData
        };

        try {
            setIsSubmitLoader(true);
            const urlWithParam = `${apiEndpoints.AddParentProduct}`;
            const ImagesurlWithParam = `${apiEndpoints.ParentImagesAddParentProduct}`;
            const res = await ApiService.post(urlWithParam, param, auth_key);

            if (res.status === 200) {
                // Handle image upload
                if (images?.[0]?.file || images?.[0]?.src) {
                    const imageFormData = new FormData();
                    const productIdToUse = productId ? productId : res?.data?.parent_product._id;
                    imageFormData.append("_id", productIdToUse);

                    if (images[0].file) {
                        imageFormData.append("file", images[0].file);
                    } else if (images[0].src) {
                        // Handle existing image URL
                        const response = await fetch(images[0].src);
                        const blob = await response.blob();
                        imageFormData.append("file", blob, `image_${productIdToUse}.jpg`);
                    }

                    await ApiService.postImage(ImagesurlWithParam, imageFormData, auth_key);
                }

                // Reset form
                set({
                    formData: {
                        productTitle: "",
                        description: "",
                        subCategory: "",
                        sellerSku: "",
                        Innervariations: {},
                        variantData: [],
                        variant_id: [],
                        variant_name: [],
                        images: [],
                        transformData: { scale: 1, x: 0, y: 0 }
                    },
                    images: [],
                    variantArrValues: [],
                    sellerSky: [],
                    modalState: {
                        open: true,
                        type: "success",
                        msg: res?.data,
                        route: ROUTE_CONSTANT.catalog.product.list
                    }
                });
            }
        } catch (error) {
            handleApiError(error, "Failed to save product");
        } finally {
            setIsSubmitLoader(false);
        }
    },

    // Initialize data
    initializeData: async (productId) => {
        const { setIsComponentLoader } = get();
        try {
            setIsComponentLoader(true);
            await Promise.all([
                get().getBrandList(),
                get().getVaraintList(),
                get().getChildCategory()
            ]);

            if (productId) {
                await get().getParentProductDetail(productId);
            }
        } finally {
            setIsComponentLoader(false);
        }
    }
})));
