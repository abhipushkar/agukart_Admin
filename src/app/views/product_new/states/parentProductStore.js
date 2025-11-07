// stores/parentProductStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import {ROUTE_CONSTANT} from "../../../constant/routeContanst";

export const useParentProductStore = create(
    persist(
        (set, get) => ({
            // Form Data
            formData: {
                productTitle: "",
                description: "",
                subCategory: "",
                sellerSku: "",
                Innervariations: {},
                variantData: [],
                variant_id: [],
                variant_name: [],
                images: []
            },

            // State variables
            inputFields: [{ id: 1, attributeValue: "", sortOrder: "", status: false }],
            selectedBrand: "",
            brandlist: [],
            allCategory: [],
            selectedCatLable: "Select Category",
            showVariant: false,
            varintList: [],
            varientAttribute: [],
            images: [],
            isCoponentLoader: false,
            issubmitLoader: false,
            variantArrValues: [],
            skuErrors: {},
            loadingSkus: {},
            sellerSky: [],
            combinationMap: new Map(),
            usedSkus: new Set(),

            // Input Errors
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

            // Modal state
            modal: {
                open: false,
                type: "",
                route: null,
                msg: null
            },

            // Actions
            setFormData: (newFormData) => set({ formData: newFormData }),
            updateFormData: (updates) => set(state => ({
                formData: { ...state.formData, ...updates }
            })),

            setInputFields: (inputFields) => set({ inputFields }),
            setSelectedBrand: (selectedBrand) => set({ selectedBrand }),
            setBrandList: (brandlist) => set({ brandlist }),
            setAllCategory: (allCategory) => set({ allCategory }),
            setSelectedCatLable: (selectedCatLable) => set({ selectedCatLable }),
            setShowVariant: (showVariant) => set({ showVariant }),
            setVariantList: (varintList) => set({ varintList }),
            setVarientAttribute: (varientAttribute) => set({ varientAttribute }),
            setImages: (images) => set({ images }),
            setIsComponentLoader: (isCoponentLoader) => set({ isCoponentLoader }),
            setSubmitLoader: (issubmitLoader) => set({ issubmitLoader }),
            setVariantArrValue: (variantArrValues) => set({ variantArrValues }),
            setSkuErrors: (skuErrors) => set({ skuErrors }),
            setLoadingSkus: (loadingSkus) => set({ loadingSkus }),
            setSellerSku: (sellerSky) => set({ sellerSky }),
            setCombinationMap: (combinationMap) => set({ combinationMap }),
            setUsedSkus: (usedSkus) => set({ usedSkus }),

            setInputErrors: (inputErrors) => set({ inputErrors }),
            updateInputErrors: (updates) => set(state => ({
                inputErrors: { ...state.inputErrors, ...updates }
            })),

            // Modal actions
            setModal: (modal) => set({ modal }),
            openModal: (type, msg) => set({
                modal: {
                    open: true,
                    type,
                    msg: msg?.message || msg,
                    route: msg?.response?.status === 401 ? ROUTE_CONSTANT.login : null
                }
            }),
            closeModal: () => set(state => ({
                modal: { ...state.modal, open: false }
            })),

            // Helper functions
            trimValue: (value) => {
                if (typeof value === 'string') {
                    return value.trim();
                }
                return value;
            },

            formDataHandler: (e) => {
                const trimmedValue = get().trimValue(e.target.value);
                get().updateFormData({ [e.target.name]: trimmedValue });
            },

            // API Actions
            getBrandList: async () => {
                const auth_key = localStorage.getItem(localStorageKey.auth_key);
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
                const auth_key = localStorage.getItem(localStorageKey.auth_key);
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
                const auth_key = localStorage.getItem(localStorageKey.auth_key);
                try {
                    const res = await ApiService.get(apiEndpoints.getChildCategory, auth_key);
                    if (res.status === 200) {
                        set({ allCategory: res?.data?.data });
                    }
                } catch (error) {
                    get().handleApiError(error, "Failed to load categories");
                }
            },

            handleApiError: (error, customMessage = null) => {
                console.error("API Error:", error);

                if (error?.response?.status === 401) {
                    get().openModal("error", {
                        message: "Session expired. Please login again.",
                        response: { status: 401 }
                    });
                } else if (error?.response?.data?.message) {
                    get().openModal("error", error.response.data);
                } else {
                    get().openModal("error", {
                        message: customMessage || "Something went wrong. Please try again."
                    });
                }
            },

            // Variation handlers
            varintHandler: (event, value) => {
                const variant_id = value.map((option) => option.id);
                const variant_name = value.map((option) => option.variant_name);

                set(state => ({
                    formData: {
                        ...state.formData,
                        variantData: value,
                        variant_id,
                        variant_name
                    },
                    inputErrors: { ...state.inputErrors, variations: "" }
                }));
            },

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

            InnervariationsHandle: (variantId) => (event, newValue) => {
                const state = get();
                const updatedInnervariations = {
                    ...state.formData.Innervariations,
                    [variantId]: newValue
                };

                const newCombinations = state.generateCombinations(updatedInnervariations);

                const { preservedVariantData, preservedSellerSky } = state.preserveCombinationData(
                    newCombinations,
                    state.combinationMap,
                    state.variantArrValues,
                    state.sellerSky
                );

                const newMap = new Map();
                newCombinations.forEach((comb, index) => {
                    const key = state.generateCombinationKey(comb);
                    newMap.set(key, index);
                });

                set({
                    formData: { ...state.formData, Innervariations: updatedInnervariations },
                    variantArrValues: preservedVariantData,
                    sellerSky: preservedSellerSky,
                    combinationMap: newMap,
                    inputErrors: { ...state.inputErrors, innervariation: "" }
                });
            },

            preserveCombinationData: (newCombinations, combinationMap, currentVariantData, currentSellerSky) => {
                const preservedVariantData = [];
                const preservedSellerSky = [];

                newCombinations.forEach((newComb, newIndex) => {
                    const combKey = get().generateCombinationKey(newComb);
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
            },

            // Reset store
            resetStore: () => set({
                formData: {
                    productTitle: "",
                    description: "",
                    subCategory: "",
                    sellerSku: "",
                    Innervariations: {},
                    variantData: [],
                    variant_id: [],
                    variant_name: [],
                    images: []
                },
                images: [],
                variantArrValues: [],
                sellerSky: [],
                combinationMap: new Map(),
                inputErrors: {
                    productTitle: "",
                    variations: "",
                    brandname: "",
                    subCategory: "",
                    description: "",
                    sellerSku: "",
                    innervariation: "",
                    parentImage: ""
                }
            })
        }),
        {
            name: 'parent-product-store',
            partialize: (state) => ({
                // Only persist what's necessary
                formData: state.formData,
                images: state.images
            })
        }
    )
);
