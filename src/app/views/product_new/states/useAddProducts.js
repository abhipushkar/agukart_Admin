import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import dayjs from 'dayjs';

export const useProductFormStore = create(
    persist(
        (set, get) => ({
            loading: false,
            draftLoading: false,

            loadingProductData: false,

            setLoading: (loading) => set({ loading }),
            setDraftLoading: (draftLoading) => set({ draftLoading }),
            setLoadingProductData: (loadingProductData) => set({ loadingProductData }),

            brandList: [],
            setBrandList: (brandList => set((state) => ({brandList}))),

            allCategory: [],
            setAllCategory: (allCategory) => set((state) => ({allCategory})),

            allVendors: [],
            setAllVendors: (allVendors) => set((state) => ({allVendors})),

            varientName: [],

            setVarientName: (varientName) => set((state) => ({
                varientName: varientName
            })),

            shippingTemplateData: [],
            setShippingTemplateData: (shippingTemplateData) => set((state) => ({shippingTemplateData})),

            exchangePolicy: [],
            setExchangePolicy: (exchangePolicy) => set((state) => ({exchangePolicy})),

            // Form Data (main state)
            formData: {
                productTitle: "",
                productType: "productType",
                subCategory: "",
                variations: [],
                parentProduct: null,
                brandName: "",
                productDescription: "",
                bulletPoints: "",
                customization: "No",
                popularGifts: "No",
                bestSelling: "No",
                stylesKeyWords: [{ value: "" }],
                searchTerms: "",
                serchTemsKeyArray: [],
                StyleName: "",
                Shopingsweight: "",
                DisplayDimenssionlength: "",
                DisplayDimenssionwidth: "",
                DisplayDimenssionheight: "",
                PackageDimenssionheight: "",
                PackageDimenssionlength: "",
                PackageDimenssionwidth: "",
                PackageDimenssionUnit: "",
                productcateUnitCount: "",
                productcateUnitCounttypeee: "",
                HowAreYouProuduct: "",
                productdetailsOccassion: [],
                productdetailsDesign: "",
                packageWidth: "",
                launchData: null,
                releaseDate: null,
                brandId: "brandId",
                taxRatio: "6",
                images: [],
                videos: [],
                deletedVideos: [],
                variantData: [],
                gender: [],
                combinedMaterials: [],
                deleteIconData: [],
                sortImg: [],
                productsize: "",
                varientName: [],
                ParentMainId: [],
                productsizeMap: "",
                productcolor: "",
                colorMap: "",
                productweight: "",
                packageweight: "",
                productunitValue: "",
                catLable: "Select Category",
                sellerSku: "",
                ProductTaxCode: "",
                shipingTemplates: "",
                yourPrice: "",
                salePrice: "",
                saleStartDate: null,
                saleEndDate: null,
                quantity: "",
                maxOrderQuantity: "",
                color: "",
                offeringCanBe: "",
                isGiftWrap: "",
                reStockDate: null,
                transformData: { scale: 1, x: 0, y: 0 },
                fullfillmentChannel: "",
                productionTime: "",
                vendor: "",
                isCombination: "false",
                tabs: [],
                exchangePolicy: "",
                dynamicFields: {},
            },

            dynamicFields: [],

            setDynamicField: (dynamicFields) => set((state) => (
                {dynamicFields: dynamicFields}
            )),

            // Form Values for variations
            formValues: {
                prices: "",
                quantities: "",
                isCheckedPrice: false,
                isCheckedQuantity: false
            },

            // Variations Data
            variationsData: [],

            // Selected Variations
            selectedVariations: [],

            // Customization Data
            customizationData: {
                label: "",
                instructions: "",
                isExpanded: false,
                customizations: []
            },

            // Combinations
            combinations: [],

            // Errors
            inputErrors: {
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
                productionTime: "",
                exchangePolicy: ""
            },

            combinationError: {},

            // UI State
            showAll: false,
            altText: [],
            keys: [],

            // Actions
            setFormData: (updates) => set((state) => ({
                formData: { ...state.formData, ...updates }
            })),

            setFormValues: (updates) => set((state) => ({
                formValues: { ...state.formValues, ...updates }
            })),

            setVariationsData: (variationsData) => set({ variationsData }),

            setSelectedVariations: (selectedVariations) => set({ selectedVariations }),

            setCustomizationData: (customizationData) => set({ customizationData }),

            setCombinations: (combinations) => set({ combinations }),

            setInputErrors: (updates) => set((state) => ({
                inputErrors: { ...state.inputErrors, ...updates }
            })),

            setCombinationError: (combinationError) => set({ combinationError }),

            setShowAll: (showAll) => set({ showAll }),

            setTransformData: (transformData) => set((state) => ({ formData: {...state.formData, transformData}})),

            setAltText: (altText) => set({ altText }),

            setKeys: (keys) => set({ keys }),

            handleToggle: (combindex, index) => {
                const state = get();
                const updatedCombinations = [...state.combinations];

                const newCombinations = updatedCombinations.map((item, i) => {
                    if (i === combindex) {
                        const updatedCombos = [...item.combinations];
                        const updatedCombo = { ...updatedCombos[index] };
                        updatedCombo.isVisible = !updatedCombo.isVisible;
                        updatedCombos[index] = updatedCombo;

                        return {
                            ...item,
                            combinations: updatedCombos
                        };
                    }
                    return item;
                });

                set({ combinations: newCombinations });
            },

            handleCombChange: (e, combindex, index) => {
                const { name, value } = e.target;
                if (/^\d*$/.test(value) && value.length <= 7) {
                    const state = get();
                    const updatedCombinations = [...state.combinations];

                    const newCombinations = updatedCombinations.map((item, i) => {
                        if (i === combindex) {
                            const updatedCombos = [...item.combinations];
                            const updatedCombo = { ...updatedCombos[index] };
                            updatedCombo[name] = value;
                            updatedCombos[index] = updatedCombo;

                            return {
                                ...item,
                                combinations: updatedCombos
                            };
                        }
                        return item;
                    });

                    set({ combinations: newCombinations });
                }
            },

            handleRowReorder: (combindex, sourceIndex, targetIndex) => {
                const state = get();
                const updatedCombinations = [...state.combinations];

                const newCombinations = updatedCombinations.map((comb, i) => {
                    if (i === combindex) {
                        const updatedCombinations = [...comb.combinations];
                        const [movedItem] = updatedCombinations.splice(sourceIndex, 1);
                        updatedCombinations.splice(targetIndex, 0, movedItem);
                        return { ...comb, combinations: updatedCombinations };
                    }
                    return comb;
                });

                set({ combinations: newCombinations });
            },

            // Image Handling Functions
            handleImageUpload: (combindex, rowIndex, imageKey, event) => {
                const file = event.target.files[0];
                if (!file) return;

                const state = get();
                const updatedCombinations = [...state.combinations];

                const newCombinations = updatedCombinations.map((comb, i) => {
                    if (i === combindex) {
                        const updatedRowCombinations = [...comb.combinations];
                        const updatedRow = { ...updatedRowCombinations[rowIndex] };

                        if (imageKey.startsWith('main_images')) {
                            const index = parseInt(imageKey.match(/\[(\d+)\]/)[1]);
                            const mainImages = [...(updatedRow.main_images || [])];
                            while (mainImages.length <= index) {
                                mainImages.push(null);
                            }
                            mainImages[index] = file;
                            updatedRow.main_images = mainImages;
                        } else {
                            updatedRow[imageKey] = file;
                        }

                        updatedRowCombinations[rowIndex] = updatedRow;
                        return {
                            ...comb,
                            combinations: updatedRowCombinations
                        };
                    }
                    return comb;
                });

                set({ combinations: newCombinations });
            },

            handleImageRemove: (combindex, rowIndex, imageKey) => {
                const state = get();
                const updatedCombinations = [...state.combinations];

                const newCombinations = updatedCombinations.map((comb, i) => {
                    if (i === combindex) {
                        const updatedRowCombinations = [...comb.combinations];
                        const updatedRow = { ...updatedRowCombinations[rowIndex] };

                        if (imageKey.startsWith('main_images')) {
                            const index = parseInt(imageKey.match(/\[(\d+)\]/)[1]);
                            const mainImages = [...(updatedRow.main_images || [])];
                            if (mainImages[index]) {
                                mainImages[index] = "";
                                updatedRow.main_images = mainImages;
                            }
                        } else {
                            updatedRow[imageKey] = "";
                        }

                        // Also remove any edit data for this image
                        if (imageKey === 'main_images[0]') {
                            updatedRow.edit_main_image = "";
                            updatedRow.edit_main_image_data = "";
                        } else if (imageKey === 'preview_image') {
                            updatedRow.edit_preview_image = "";
                            updatedRow.edit_preview_image_data = "";
                        }

                        updatedRowCombinations[rowIndex] = updatedRow;
                        return {
                            ...comb,
                            combinations: updatedRowCombinations
                        };
                    }
                    return comb;
                });

                set({ combinations: newCombinations });
            },

            handleEditImage: (combindex, rowIndex, imageType, editedImage, imageIndex, editData) => {
                const state = get();
                const updatedCombinations = [...state.combinations];

                const newCombinations = updatedCombinations.map((comb, i) => {
                    if (i === combindex) {
                        const updatedRowCombinations = [...comb.combinations];
                        const updatedRow = { ...updatedRowCombinations[rowIndex] };

                        if (imageType === 'main_images' && imageIndex === 0) {
                            updatedRow.edit_main_image = editedImage;
                            updatedRow.edit_main_image_data = editData;
                        } else if (imageType === 'preview_image') {
                            updatedRow.edit_preview_image = editedImage;
                            updatedRow.edit_preview_image_data = editData;
                        }

                        updatedRowCombinations[rowIndex] = updatedRow;
                        return {
                            ...comb,
                            combinations: updatedRowCombinations
                        };
                    }
                    return comb;
                });

                set({ combinations: newCombinations });
            },

            // Initialize form with edit data
            initializeFormWithEditData: (editData, isCopied = false) => {
                console.log("IS COPIED:", editData.sellerSku, editData.seller_sku);

                const imageObjects = isCopied ? [] : editData?.image?.map((image) => ({
                    src: `${editData.imageBaseUrl}${image}`
                })) || [];

                const videoObjects = isCopied ? [] : editData?.videos?.map((video) => ({
                    src: `${editData.videoBaseUrl}${video}`
                })) || [];

                const variationsData = editData?.variations_data || [];
                const formValues = editData?.form_values || {
                    prices: "",
                    quantities: "",
                    isCheckedPrice: false,
                    isCheckedQuantity: false
                };

                set({
                    formData: {
                        productTitle: editData?.product_title || "",
                        productType: editData?.product_type || "productType",
                        subCategory: editData?.category || "",
                        parentProduct: editData.parent_id,
                        variations: editData?.variant_attribute_id || [],
                        brandName: editData?.brand_id || "",
                        productDescription: editData?.description || "",
                        bulletPoints: editData?.bullet_points || "",
                        customization: editData?.customize || "No",
                        popularGifts: editData?.popular_gifts || "No",
                        bestSelling: editData?.bestseller || "No",
                        stylesKeyWords: [{ value: editData?.style_name || "" }],
                        searchTerms: "",
                        serchTemsKeyArray: editData?.size || [],
                        StyleName: editData?.style_name || "",
                        Shopingsweight: editData?.shipping_weight || "",
                        DisplayDimenssionlength: editData?.display_dimension_length || "",
                        DisplayDimenssionwidth: editData?.display_dimension_width || "",
                        DisplayDimenssionheight: editData?.display_dimension_height || "",
                        PackageDimenssionheight: editData?.package_dimension_height || "",
                        PackageDimenssionlength: editData?.package_dimension_length || "",
                        PackageDimenssionwidth: editData?.package_dimension_width || "",
                        PackageDimenssionUnit: editData?.package_dimension_unit || "",
                        productcateUnitCount: editData?.unit_count || "",
                        productcateUnitCounttypeee: editData?.unit_count_type || "",
                        HowAreYouProuduct: editData?.how_product_made || "",
                        productdetailsOccassion: [],
                        productdetailsDesign: editData?.design || "",
                        packageWidth: editData?.package_weight || "",
                        launchData: editData?.launch_date ? dayjs(editData.launch_date) : null,
                        releaseDate: editData?.release_date ? dayjs(editData.release_date) : null,
                        taxRatio: editData?.tax_ratio || "6",
                        images: imageObjects,
                        videos: videoObjects,
                        productsize: "",
                        varientName: editData?.variant_attribute_id || [],
                        ParentMainId: editData?.variant_id || [],
                        productsizeMap: editData?.size_map || "",
                        productcolor: editData?.color_textarea || "",
                        colorMap: editData?.color_map || "",
                        productweight: editData?.shipping_weight_unit || "",
                        packageweight: editData?.package_weight_unit || "",
                        productunitValue: editData?.display_dimension_unit || "",
                        sellerSku: isCopied ? "" : editData?.seller_sku || editData?.sku_code || "",
                        ProductTaxCode: editData?.tax_code || "",
                        shipingTemplates: editData?.shipping_templates || "",
                        yourPrice: editData?.price || "",
                        salePrice: editData?.sale_price || "",
                        saleStartDate: editData?.sale_start_date ? dayjs(editData.sale_start_date) : null,
                        saleEndDate: editData?.sale_end_date ? dayjs(editData.sale_end_date) : null,
                        quantity: editData?.qty || "",
                        maxOrderQuantity: editData?.max_order_qty || "",
                        color: editData?.color || "",
                        offeringCanBe: editData?.can_offer || "",
                        isGiftWrap: editData?.gift_wrap || "",
                        transformData: editData?.zoom || {scale: 1, x: 0, y: 0},
                        reStockDate: editData?.restock_date ? dayjs(editData.restock_date) : null,
                        productionTime: editData?.production_time || "",
                        vendor: editData?.vendor_id || "",
                        isCombination: editData?.isCombination?.toString() || "false",
                        tabs: editData?.tabs || [],
                        exchangePolicy: editData?.exchangePolicy || "",
                        dynamicFields: editData?.dynamicFields || {},
                    },
                    formValues,
                    variationsData,
                    selectedVariations: variationsData?.map((item) => item?.name) || [],
                    customizationData: editData?.customizationData || { label: "", instructions: "", customizations: [] },
                    combinations: editData?.combinationData || [],
                    keys: editData?.search_terms || [],
                    altText: editData?.altText || []
                });
            },

            // Reset form to initial state
            resetForm: () => set({
                formData: {
                    productTitle: "",
                    productType: "productType",
                    subCategory: "",
                    variations: [],
                    brandName: "",
                    productDescription: "",
                    bulletPoints: "",
                    customization: "No",
                    popularGifts: "No",
                    bestSelling: "No",
                    stylesKeyWords: [{ value: "" }],
                    searchTerms: "",
                    serchTemsKeyArray: [],
                    StyleName: "",
                    Shopingsweight: "",
                    DisplayDimenssionlength: "",
                    DisplayDimenssionwidth: "",
                    DisplayDimenssionheight: "",
                    PackageDimenssionheight: "",
                    PackageDimenssionlength: "",
                    PackageDimenssionwidth: "",
                    PackageDimenssionUnit: "",
                    productcateUnitCount: "",
                    productcateUnitCounttypeee: "",
                    HowAreYouProuduct: "",
                    productdetailsOccassion: [],
                    productdetailsDesign: "",
                    packageWidth: "",
                    launchData: null,
                    releaseDate: null,
                    transformData: {scale: 1, x: 0, y: 0},
                    brandId: "brandId",
                    taxRatio: "6",
                    images: [],
                    videos: [],
                    deletedVideos: [],
                    variantData: [],
                    gender: [],
                    combinedMaterials: [],
                    deleteIconData: [],
                    sortImg: [],
                    productsize: "",
                    varientName: [],
                    ParentMainId: [],
                    productsizeMap: "",
                    productcolor: "",
                    colorMap: "",
                    productweight: "",
                    packageweight: "",
                    productunitValue: "",
                    catLable: "Select Category",
                    sellerSku: "",
                    ProductTaxCode: "",
                    shipingTemplates: "",
                    yourPrice: "",
                    salePrice: "",
                    saleStartDate: null,
                    saleEndDate: null,
                    quantity: "",
                    maxOrderQuantity: "",
                    color: "",
                    offeringCanBe: "",
                    isGiftWrap: "",
                    reStockDate: null,
                    fullfillmentChannel: "",
                    productionTime: "",
                    vendor: "",
                    isCombination: "false",
                    tabs: [],
                    exchangePolicy: ""
                },
                formValues: {
                    prices: "",
                    quantities: "",
                    isCheckedPrice: false,
                    isCheckedQuantity: false
                },
                variationsData: [],
                selectedVariations: [],
                customizationData: { label: "", instructions: "", customizations: [] },
                combinations: [],
                inputErrors: {
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
                    productionTime: "",
                    exchangePolicy: ""
                },
                combinationError: {},
                showAll: false,
                altText: [],
                keys: []
            }),

            // Validation helper
            validateForm: () => {
                const state = get();
                const errors = {};

                if (!state.formData.sellerSku) errors.sellerSku = "Seller Sku is Required";
                if (!state.formData.shipingTemplates) errors.shipingTemplates = "Shipping Template is Required";
                if (!state.formData.vendor) errors.vendor = "Shop name is Required";
                if (!state.formData.productTitle) errors.productTitle = "Product Title is Required";
                if (!state.formData.productDescription) errors.productDescription = "Product description is Required";
                if (!state.formData.images || state.formData.images.length === 0) errors.images = "Product image is Required";
                if (!state.formValues?.isCheckedPrice && !state.formData.salePrice) errors.salePrice = "Sale Price is Required";
                if (!state.formValues?.isCheckedQuantity && !state.formData.quantity) errors.quantity = "Quantity is Required";
                if (!state.formData.exchangePolicy) errors.exchangePolicy = "Return and exchange policy is required";

                return errors;
            }
        }),
        {
            name: 'product-form-storage',
            partialize: (state) => ({
                formData: state.formData,
                formValues: state.formValues,
                variationsData: state.variationsData,
                customizationData: state.customizationData
            })
        }
    )
);
