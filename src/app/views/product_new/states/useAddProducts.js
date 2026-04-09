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
            setBrandList: (brandList => set((state) => ({ brandList }))),

            allCategory: [],
            setAllCategory: (allCategory) => set((state) => ({ allCategory })),

            allVendors: [],
            setAllVendors: (allVendors) => set((state) => ({ allVendors })),

            varientName: [],
            setVarientName: (varientName) => set((state) => ({
                varientName: varientName
            })),

            shippingTemplateData: [],
            setShippingTemplateData: (shippingTemplateData) => set((state) => ({ shippingTemplateData })),

            exchangePolicy: [],
            setExchangePolicy: (exchangePolicy) => set((state) => ({ exchangePolicy })),

            // NEW: Parent product data
            parentProductData: null,
            setParentProductData: (parentProductData) => set({ parentProductData }),

            deletedVariantImages: {},
            setDeletedVariantImages: (deletedVariantImages) => set({ deletedVariantImages }),

            deletedCustomizationImages: {},
            setDeletedCustomizationImages: (deletedCustomizationImages) => set({ deletedCustomizationImages }),

            // ========== CUSTOMIZATION DELETE TRACKING ==========
            trackCustomizationImageDelete: (customizationIndex, optionIndex, imageIndex) => {
                const state = get();
                const deletedCustomizationImages = { ...state.deletedCustomizationImages };

                const deleteKey = `${customizationIndex}-${optionIndex}`;
                if (!deletedCustomizationImages[deleteKey]) {
                    deletedCustomizationImages[deleteKey] = [];
                }
                if (!deletedCustomizationImages[deleteKey].includes(imageIndex)) {
                    deletedCustomizationImages[deleteKey].push(imageIndex);
                }

                set({ deletedCustomizationImages });
            },

            clearCustomizationImageDelete: (customizationIndex, optionIndex, imageIndex) => {
                const state = get();
                const deletedCustomizationImages = { ...state.deletedCustomizationImages };

                const deleteKey = `${customizationIndex}-${optionIndex}`;
                if (deletedCustomizationImages[deleteKey]) {
                    deletedCustomizationImages[deleteKey] = deletedCustomizationImages[deleteKey].filter(idx => idx !== imageIndex);
                    if (deletedCustomizationImages[deleteKey].length === 0) {
                        delete deletedCustomizationImages[deleteKey];
                    }
                }

                set({ deletedCustomizationImages });
            },

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
                { dynamicFields: dynamicFields }
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

            // ========== NEW: PRODUCT VARIANTS (for images) ==========
            product_variants: [], // NEW: Separate array for variant images

            // ========== KEEP: COMBINATIONS (for price/quantity only) ==========
            combinations: [], // Now only contains price/quantity data

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

            // ========== ACTIONS ==========

            setFormData: (updates) => set((state) => ({
                formData: { ...state.formData, ...updates }
            })),

            // NEW: Safe setter with copy mode protection
            safeSetFormData: (updates, isCopyMode = false) => set((state) => {
                // If in copy mode, ensure parentProduct is null
                const safeUpdates = isCopyMode ? {
                    ...updates,
                    parentProduct: null
                } : updates;

                return {
                    formData: { ...state.formData, ...safeUpdates }
                };
            }),

            setFormValues: (updates) => set((state) => ({
                formValues: { ...state.formValues, ...updates }
            })),

            setVariationsData: (variationsData) => set({ variationsData }),

            setSelectedVariations: (selectedVariations) => set({ selectedVariations }),

            setCustomizationData: (customizationData) => set({ customizationData }),

            setVariantViewAll: (variantIndex, value) => {
                const variants = get().product_variants || [];
                const updated = [...variants];
                if (updated[variantIndex]) {
                    updated[variantIndex] = {
                        ...updated[variantIndex],
                        viewAll: value
                    };
                }
                set({ product_variants: updated });
            },

            // ========== NEW: PRODUCT VARIANTS ACTIONS ==========
            setProductVariants: (product_variants) => set({ product_variants }),

            // Initialize product_variants from selected variations - UPDATED FOR DATA PRESERVATION
            initializeProductVariants: (variationsData, allVariants) => {
                const newProductVariants = [];
                const existingVariantsMap = new Map();
                const removedGuideMap = get().isGuideRemovedMap || {};

                // Create a map of existing product_variants for quick lookup
                get().product_variants.forEach(variant => {
                    const normalize = (str) => (str || "").trim().toLowerCase();

                    existingVariantsMap.set(normalize(variant.variant_name), variant);
                });

                variationsData.forEach((variation) => {
                    const normalize = (str) => (str || "").trim().toLowerCase();

                    const variantData = allVariants.find(
                        v => normalize(v.variant_name) === normalize(variation.name)
                    );

                    if (!variantData) {
                        console.warn("Variant not found:", variation.name);
                        return; // skip instead of breaking
                    }
                    if (variantData) {
                        const existingVariant = existingVariantsMap.get(normalize(variation.name));

                        // ========== ADDED: Extract guide data from API response ==========
                        // Check if variantData has guide properties from API
                        const hasApiGuideData = variantData.guide_name || variantData.guide_file || variantData.guide_description;
                        const apiGuide = hasApiGuideData ? {
                            guide_name: variantData.guide_name || "",
                            guide_file: variantData.guide_file || null,
                            guide_description: variantData.guide_description || "",
                            guide_type: variantData.guide_type || (variantData.guide_file ? "image" : "")
                        } : null;

                        if (existingVariant) {
                            // Preserve existing variant, but update attributes if needed
                            const updatedAttributes = variation.values.map(value => {
                                const existingAttribute = existingVariant.variant_attributes.find(
                                    attr => normalize(attr.attribute) === normalize(value)
                                );

                                if (existingAttribute) {
                                    // Preserve all existing image data
                                    return existingAttribute;
                                } else {
                                    // New attribute - create with default images
                                    const attributeData = variantData.variant_attribute.find(attr =>
                                        attr.attribute_value === value
                                    );

                                    return {
                                        attribute: value,
                                        main_images: attributeData?.main_images || [null, null, null],
                                        preview_image: attributeData?.preview_image || null,
                                        thumbnail: attributeData?.thumbnail || null,
                                        edit_preview_image: attributeData?.edit_preview_image || null,
                                        edit_main_image: attributeData?.edit_main_image || null,
                                        edit_main_image_data: attributeData?.edit_main_image_data || {},
                                        edit_preview_image_data: attributeData?.edit_preview_image_data || {},
                                    };
                                }
                            });
                            const isRemoved = removedGuideMap[variation.name] === true;

                            newProductVariants.push({
                                variant_name: variation.name,
                                variant_attributes: updatedAttributes,
                                // ========== ADDED: Preserve existing guide or use API guide ==========
                                guide: isRemoved
                                    ? [] : (
                                        existingVariant?.guide?.length > 0
                                            ? existingVariant.guide
                                            : (apiGuide ? [apiGuide] : [])
                                    ),
                                viewAll: existingVariant?.viewAll ?? false
                            });
                        } else {
                            // Create new variant with default images
                            const variantAttributes = variation.values.map(value => {
                                const attributeData = variantData.variant_attribute.find(attr =>
                                    attr.attribute_value === value
                                );

                                return {
                                    attribute: value,
                                    main_images: attributeData?.main_images || [null, null, null],
                                    preview_image: attributeData?.preview_image || null,
                                    thumbnail: attributeData?.thumbnail || null,
                                    edit_preview_image: attributeData?.edit_preview_image || null,
                                    edit_main_image: attributeData?.edit_main_image || null,
                                    edit_main_image_data: attributeData?.edit_main_image_data || {},
                                    edit_preview_image_data: attributeData?.edit_preview_image_data || {},
                                };
                            });
                            const isRemoved = removedGuideMap[variation.name] === true;
                            newProductVariants.push({
                                variant_name: variation.name,
                                variant_attributes: variantAttributes,
                                // ========== ADDED: Set guide data from API if available ==========
                                guide: isRemoved
                                    ? []
                                    : (apiGuide ? [apiGuide] : []),
                                viewAll: existingVariant?.viewAll ?? false
                            });
                        }
                    }
                });

                const existingVariants = get().product_variants || [];

                const normalize = (str) => (str || "").trim().toLowerCase();

                // 👉 STEP 0: valid variant names (current truth)
                const validVariantNames = new Set(
                    variationsData.map(v => normalize(v.name))
                );

                const mergedMap = new Map();

                // 👉 STEP 1: keep ONLY valid old variants
                existingVariants.forEach(v => {
                    const key = normalize(v.variant_name);

                    if (validVariantNames.has(key)) {
                        mergedMap.set(key, v);
                    }
                });

                // 👉 STEP 2: override/add new variants
                newProductVariants.forEach(v => {
                    const key = normalize(v.variant_name);
                    mergedMap.set(key, v);
                });

                // 👉 STEP 3: set final
                set({ product_variants: Array.from(mergedMap.values()) });
            },

            // ========== KEEP: COMBINATIONS ACTIONS (price/quantity only) ==========
            setCombinations: (combinations) => set({ combinations }),

            setInputErrors: (updates) => set((state) => ({
                inputErrors: { ...state.inputErrors, ...updates }
            })),

            clearCombinationErrors: (type) =>
                set((state) => {
                    const updatedErrors = { ...state.inputErrors };

                    Object.keys(updatedErrors).forEach((key) => {
                        if (type === "price" && key.startsWith("Price-")) {
                            delete updatedErrors[key];
                        }
                        if (type === "quantity" && key.startsWith("Quantity-")) {
                            delete updatedErrors[key];
                        }
                    });

                    return { inputErrors: updatedErrors };
                }),

            setCombinationError: (combinationError) => set({ combinationError }),

            setShowAll: (showAll) => set({ showAll }),

            setTransformData: (transformData) => set((state) => ({
                formData: { ...state.formData, transformData }
            })),

            setAltText: (altText) => set({ altText }),

            setKeys: (keys) => set({ keys }),

            // ========== GUIDE HANDLERS (for variant guides) ==========
            handleGuideUpdate: (variantIndex, guideData) => {
                const state = get();
                const updatedProductVariants = [...state.product_variants];

                const newProductVariants = updatedProductVariants.map((variant, vIndex) => {
                    if (vIndex === variantIndex) {
                        return {
                            ...variant,
                            guide: guideData ? [guideData] : [] // Store guide as an array
                        };
                    }
                    return variant;
                });

                set({ product_variants: newProductVariants });
            },

            isGuideRemovedMap: {},

            setIsGuideRemoved: (variantName, value) =>
                set((state) => ({
                    isGuideRemovedMap: {
                        ...state.isGuideRemovedMap,
                        [variantName]: value
                    }
                })),

            setGuideRemovedMap: (map) => set({ isGuideRemovedMap: map }),

            handleGuideRemove: (variantIndex) => {
                const state = get();
                const variant = state.product_variants[variantIndex];

                if (!variant) return;

                const variantName = variant.variant_name;

                state.setIsGuideRemoved(variantName, true);

                const updated = state.product_variants.map((v, i) =>
                    i === variantIndex ? { ...v, guide: [] } : v
                );

                set({ product_variants: updated });
            },

            // ========== IMAGE HANDLERS (now work with product_variants) ==========
            handleImageUpload: (variantIndex, attributeIndex, imageKey, event) => {
                const file = event.target.files[0];
                if (!file) return;

                const state = get();
                const updatedProductVariants = [...state.product_variants];
                const deletedVariantImages = { ...state.deletedVariantImages };

                const newProductVariants = updatedProductVariants.map((variant, vIndex) => {
                    if (vIndex === variantIndex) {
                        const updatedAttributes = [...variant.variant_attributes];
                        const updatedAttribute = { ...updatedAttributes[attributeIndex] };

                        if (imageKey.startsWith('main_images')) {
                            const imgIndex = parseInt(imageKey.match(/\[(\d+)\]/)[1]);
                            const mainImages = [...(updatedAttribute.main_images || [])];
                            while (mainImages.length <= imgIndex) {
                                mainImages.push(null);
                            }
                            mainImages[imgIndex] = file;
                            updatedAttribute.main_images = mainImages;

                            // If user uploads to a previously deleted index, remove it from delete tracking
                            const deleteKey = `${variantIndex}-${attributeIndex}`;
                            if (deletedVariantImages[deleteKey] && deletedVariantImages[deleteKey].includes(imgIndex)) {
                                deletedVariantImages[deleteKey] = deletedVariantImages[deleteKey].filter(idx => idx !== imgIndex);
                                if (deletedVariantImages[deleteKey].length === 0) {
                                    delete deletedVariantImages[deleteKey];
                                }
                            }
                        } else {
                            updatedAttribute[imageKey] = file;
                        }

                        updatedAttributes[attributeIndex] = updatedAttribute;
                        return {
                            ...variant,
                            variant_attributes: updatedAttributes
                        };
                    }
                    return variant;
                });

                set({
                    product_variants: newProductVariants,
                    deletedVariantImages
                });
            },

            handleImageRemove: (variantIndex, attributeIndex, imageKey) => {
                const state = get();
                const updatedProductVariants = [...state.product_variants];
                const deletedVariantImages = { ...state.deletedVariantImages };

                const newProductVariants = updatedProductVariants.map((variant, vIndex) => {
                    if (vIndex === variantIndex) {
                        const updatedAttributes = [...variant.variant_attributes];
                        const updatedAttribute = { ...updatedAttributes[attributeIndex] };

                        if (imageKey.startsWith('main_images')) {
                            const imgIndex = parseInt(imageKey.match(/\[(\d+)\]/)[1]);
                            const mainImages = [...(updatedAttribute.main_images || [])];

                            if (mainImages[imgIndex]) {
                                // Track the deleted index
                                const deleteKey = `${variantIndex}-${attributeIndex}`;
                                if (!deletedVariantImages[deleteKey]) {
                                    deletedVariantImages[deleteKey] = [];
                                }
                                if (!deletedVariantImages[deleteKey].includes(imgIndex)) {
                                    deletedVariantImages[deleteKey].push(imgIndex);
                                }

                                // Clear the image
                                mainImages[imgIndex] = "__DELETE__";
                                updatedAttribute.main_images = mainImages;
                            }
                        } else {
                            updatedAttribute[imageKey] = "__DELETE__";
                        }

                        // Also remove any edit data for this image
                        if (imageKey === 'main_images[0]') {
                            updatedAttribute.edit_main_image = "";
                            updatedAttribute.edit_main_image_data = "";
                        } else if (imageKey === 'preview_image') {
                            updatedAttribute.edit_preview_image = "";
                            updatedAttribute.edit_preview_image_data = "";
                        }

                        updatedAttributes[attributeIndex] = updatedAttribute;
                        return {
                            ...variant,
                            variant_attributes: updatedAttributes
                        };
                    }
                    return variant;
                });

                set({
                    product_variants: newProductVariants,
                    deletedVariantImages
                });
            },

            handleEditImage: (variantIndex, attributeIndex, imageType, editedImage, imageIndex, editData) => {
                const state = get();
                const updatedProductVariants = [...state.product_variants];

                const newProductVariants = updatedProductVariants.map((variant, vIndex) => {
                    if (vIndex === variantIndex) {
                        const updatedAttributes = [...variant.variant_attributes];
                        const updatedAttribute = { ...updatedAttributes[attributeIndex] };

                        if (imageType === 'main_images' && imageIndex === 0) {
                            updatedAttribute.edit_main_image = editedImage;
                            updatedAttribute.edit_main_image_data = editData;
                        } else if (imageType === 'preview_image') {
                            updatedAttribute.edit_preview_image = editedImage;
                            updatedAttribute.edit_preview_image_data = editData;
                        }

                        updatedAttributes[attributeIndex] = updatedAttribute;
                        return {
                            ...variant,
                            variant_attributes: updatedAttributes
                        };
                    }
                    return variant;
                });

                set({ product_variants: newProductVariants });
            },

            // ========== COMBINATION HANDLERS (price/quantity only) ==========
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

            // ========== SYNC FUNCTIONS: Reorder product_variants and sync to combinations ==========
            handleProductVariantReorder: (variantIndex, sourceIndex, targetIndex) => {
                const state = get();
                const { product_variants, combinations } = state;

                console.log(`Reordering: variantIndex=${variantIndex}, sourceIndex=${sourceIndex}, targetIndex=${targetIndex}`);

                // Reorder product_variants (images table)
                const updatedProductVariants = [...product_variants];

                // Check if variantIndex is valid
                if (variantIndex >= updatedProductVariants.length) {
                    console.error('Invalid variantIndex:', variantIndex);
                    return;
                }

                const variantGroup = { ...updatedProductVariants[variantIndex] };
                const updatedAttributes = [...variantGroup.variant_attributes];

                // Validate source and target indices
                if (sourceIndex >= updatedAttributes.length || targetIndex >= updatedAttributes.length) {
                    console.error('Invalid source or target index:', { sourceIndex, targetIndex, attributesLength: updatedAttributes.length });
                    return;
                }

                // Remove the item from source index and insert at target index
                const [movedAttribute] = updatedAttributes.splice(sourceIndex, 1);
                updatedAttributes.splice(targetIndex, 0, movedAttribute);

                variantGroup.variant_attributes = updatedAttributes;
                updatedProductVariants[variantIndex] = variantGroup;

                // Now sync the same reordering to combinations (price/quantity table)
                const updatedCombinations = [...combinations];
                if (updatedCombinations[variantIndex]) {
                    const combGroup = { ...updatedCombinations[variantIndex] };
                    const updatedCombArray = [...combGroup.combinations];

                    // Apply the same reordering to combinations
                    const [movedComb] = updatedCombArray.splice(sourceIndex, 1);
                    updatedCombArray.splice(targetIndex, 0, movedComb);

                    combGroup.combinations = updatedCombArray;
                    updatedCombinations[variantIndex] = combGroup;
                }

                set({
                    product_variants: updatedProductVariants,
                    combinations: updatedCombinations
                });
            },

            // For reordering entire variant groups (if needed)
            handleVariantGroupReorder: (sourceIndex, targetIndex) => {
                const state = get();
                const { product_variants } = state;

                // Reorder product_variants groups
                const updatedProductVariants = [...product_variants];
                const [movedVariant] = updatedProductVariants.splice(sourceIndex, 1);
                updatedProductVariants.splice(targetIndex, 0, movedVariant);

                set({
                    product_variants: updatedProductVariants
                });
            },

            handleCombinationGroupReorder: (sourceIndex, targetIndex) => {
                const state = get();
                const { combinations } = state;

                // Reorder combinations groups independently
                const updatedCombinations = [...combinations];
                const [movedCombGroup] = updatedCombinations.splice(sourceIndex, 1);
                updatedCombinations.splice(targetIndex, 0, movedCombGroup);

                set({
                    combinations: updatedCombinations
                });
            },

            // ========== INITIALIZE FORM WITH EDIT DATA ==========
            initializeFormWithEditData: (editData, isCopied = false) => {
                console.log("IS COPIED:", isCopied, editData?.sellerSku, editData?.seller_sku);

                // Clean parent-related fields for copy mode
                const cleanedEditData = isCopied ? {
                    ...editData,
                    parent_id: null,
                    parent_product: null,
                    isChild: false
                } : editData;

                const imageObjects = isCopied ? [] : cleanedEditData?.image?.map((image) => ({
                    src: `${cleanedEditData.imageBaseUrl}${image}`
                })) || [];

                const videoObjects = isCopied ? [] : cleanedEditData?.videos?.map((video) => ({
                    src: `${cleanedEditData.videoBaseUrl}${video}`
                })) || [];

                const variationsData = cleanedEditData?.variations_data || [];
                const formValues = cleanedEditData?.form_values || {
                    prices: "",
                    quantities: "",
                    isCheckedPrice: false,
                    isCheckedQuantity: false
                };

                // Initialize product_variants from edit data if available
                const product_variants = cleanedEditData?.product_variants || [];

                set({
                    formData: {
                        productTitle: cleanedEditData?.product_title || "",
                        productType: cleanedEditData?.product_type || "productType",
                        subCategory: cleanedEditData?.category || "",
                        // CRITICAL: Set parentProduct to null for copied products
                        parentProduct: isCopied ? null : cleanedEditData?.parent_id || null,
                        deletedVariantImages: {},
                        variations: cleanedEditData?.variant_attribute_id || [],
                        brandName: cleanedEditData?.brand_id || "",
                        productDescription: cleanedEditData?.description || "",
                        bulletPoints: cleanedEditData?.bullet_points || "",
                        customization: cleanedEditData?.customize || "No",
                        popularGifts: cleanedEditData?.popular_gifts || "No",
                        bestSelling: cleanedEditData?.bestseller || "No",
                        stylesKeyWords: [{ value: cleanedEditData?.style_name || "" }],
                        searchTerms: cleanedEditData?.size || "",
                        serchTemsKeyArray: cleanedEditData?.search_terms || [],
                        StyleName: cleanedEditData?.style_name || "",
                        Shopingsweight: cleanedEditData?.shipping_weight || "",
                        DisplayDimenssionlength: cleanedEditData?.display_dimension_length || "",
                        DisplayDimenssionwidth: cleanedEditData?.display_dimension_width || "",
                        DisplayDimenssionheight: cleanedEditData?.display_dimension_height || "",
                        PackageDimenssionheight: cleanedEditData?.package_dimension_height || "",
                        PackageDimenssionlength: cleanedEditData?.package_dimension_length || "",
                        PackageDimenssionwidth: cleanedEditData?.package_dimension_width || "",
                        PackageDimenssionUnit: cleanedEditData?.package_dimension_unit || "",
                        productcateUnitCount: cleanedEditData?.unit_count || "",
                        productcateUnitCounttypeee: cleanedEditData?.unit_count_type || "",
                        HowAreYouProuduct: cleanedEditData?.how_product_made || "",
                        productdetailsOccassion: [],
                        productdetailsDesign: cleanedEditData?.design || "",
                        packageWidth: cleanedEditData?.package_weight || "",
                        launchData: cleanedEditData?.launch_date ? dayjs(cleanedEditData.launch_date) : null,
                        releaseDate: cleanedEditData?.release_date ? dayjs(cleanedEditData.release_date) : null,
                        taxRatio: cleanedEditData?.tax_ratio || "6",
                        images: imageObjects,
                        videos: videoObjects,
                        productsize: "",
                        varientName: cleanedEditData?.variant_attribute_id || [],
                        ParentMainId: cleanedEditData?.variant_id || [],
                        productsizeMap: cleanedEditData?.size_map || "",
                        productcolor: cleanedEditData?.color_textarea || "",
                        colorMap: cleanedEditData?.color_map || "",
                        productweight: cleanedEditData?.shipping_weight_unit || "",
                        packageweight: cleanedEditData?.package_weight_unit || "",
                        productunitValue: cleanedEditData?.display_dimension_unit || "",
                        sellerSku: isCopied ? "" : cleanedEditData?.seller_sku || cleanedEditData?.sku_code || "",
                        ProductTaxCode: cleanedEditData?.tax_code || "",
                        shipingTemplates: cleanedEditData?.shipping_templates || "",
                        yourPrice: cleanedEditData?.price || "",
                        salePrice: cleanedEditData?.sale_price || "",
                        saleStartDate: cleanedEditData?.sale_start_date ? dayjs(cleanedEditData.sale_start_date) : null,
                        saleEndDate: cleanedEditData?.sale_end_date ? dayjs(cleanedEditData.sale_end_date) : null,
                        quantity: cleanedEditData?.qty || "",
                        maxOrderQuantity: cleanedEditData?.max_order_qty || "",
                        color: cleanedEditData?.color || "",
                        offeringCanBe: cleanedEditData?.can_offer || "",
                        isGiftWrap: cleanedEditData?.gift_wrap || "",
                        transformData: cleanedEditData?.zoom || { scale: 1, x: 0, y: 0 },
                        reStockDate: cleanedEditData?.restock_date ? dayjs(cleanedEditData.restock_date) : null,
                        productionTime: cleanedEditData?.production_time || "",
                        vendor: cleanedEditData?.vendor_id || "",
                        isCombination: cleanedEditData?.isCombination?.toString() || "false",
                        tabs: cleanedEditData?.tabs || [],
                        exchangePolicy: cleanedEditData?.exchangePolicy || "",
                        dynamicFields: cleanedEditData?.dynamicFields || {},
                    },
                    formValues,
                    variationsData,
                    selectedVariations: variationsData?.map((item) => item?.name) || [],
                    customizationData: cleanedEditData?.customizationData || { label: "", instructions: "", customizations: [] },
                    combinations: cleanedEditData?.combinationData || [],
                    product_variants: product_variants, // NEW: Initialize product_variants
                    keys: cleanedEditData?.search_terms || [],
                    altText: cleanedEditData?.altText || []
                });

                const guideRemovedMap = {};
                product_variants.forEach(v => {
                    const hasGuide = Array.isArray(v.guide) && v.guide.length > 0;
                    guideRemovedMap[v.variant_name] = !hasGuide;
                });
                set({
                    isGuideRemovedMap: guideRemovedMap
                });
            },

            // ========== RESET FORM ==========
            resetForm: () => set({
                formData: {
                    productTitle: "",
                    productType: "productType",
                    subCategory: "",
                    variations: [],
                    deletedVariantImages: {},
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
                    transformData: { scale: 1, x: 0, y: 0 },
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
                product_variants: [], // NEW: Reset product_variants
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
                keys: [],
                parentProductData: null
            }),

            // ========== VALIDATION HELPER ==========
            validateForm: () => {
                const state = get();
                const errors = {};

                if (!state.formData.sellerSku) errors.sellerSku = "Seller Sku is Required";
                if (!state.formData.shipingTemplates) errors.shipingTemplates = "Shipping Template is Required";
                if (!state.formData.vendor) errors.vendor = "Shop name is Required";
                if (!state.formData.productTitle) errors.productTitle = "Product Title is Required";
                if (!state.formData.productDescription) errors.productDescription = "Product description is Required";
                if (!state.formData.images || state.formData.images.length === 0) errors.images = "Product image is Required";
                if (!state.formValues?.isCheckedPrice && (!state.formData.salePrice || state.formData.salePrice === "0")) errors.salePrice = "Sale Price is Required";
                if (!state.formValues?.isCheckedQuantity && !state.formData.quantity) errors.quantity = "Quantity is Required";
                if (!state.formData.exchangePolicy) errors.exchangePolicy = "Return and exchange policy is required";

                const isTrue = (val) => val === true || val === "true";
                const isEmpty = (val) =>
                    val === "" || val === null || val === undefined;
                const isSameVariant = (a, b) =>
                    (a || "").toString().trim() === (b || "").toString().trim();

                // ========== COMBINATION PRICE / QUANTITY VALIDATION ==========
                if (isTrue(state.formData.isCombination) || (state.combinations || []).length > 0) {
                    const {
                        isCheckedPrice,
                        isCheckedQuantity,
                        prices: priceControllerVariant,
                        quantities: qtyControllerVariant,
                    } = state.formValues;

                    const priceToggle = isTrue(isCheckedPrice);
                    const qtyToggle = isTrue(isCheckedQuantity);

                    const combinations = state.combinations || [];

                    combinations.forEach((group) => {
                        const showsPriceByController =
                            priceToggle &&
                            ((state.variationsData || []).length >= 2
                                ? isSameVariant(group.variant_name, priceControllerVariant)
                                : true);

                        const showsQtyByController =
                            qtyToggle &&
                            ((state.variationsData || []).length >= 2
                                ? isSameVariant(group.variant_name, qtyControllerVariant)
                                : true);

                        group.combinations?.forEach((combo, index) => {
                            const isVisible =
                                combo.isVisible === true || combo.isVisible === "true";
                            if (!isVisible) return;

                            // ✅ PRICE VALIDATION (ONLY if toggle ON AND controller)
                            const rowPriceVariation =
                                combo.isPriceVariation === true || combo.isPriceVariation === "true";
                            const rowQtyVariation =
                                combo.isQuantityVariation === true || combo.isQuantityVariation === "true";
                            const rowPriceInputMatch =
                                isSameVariant(combo.priceInput, group.variant_name);
                            const rowQtyInputMatch =
                                isSameVariant(combo.quantityInput, group.variant_name);
                            const shouldValidatePrice =
                                priceToggle && (showsPriceByController || rowPriceVariation || rowPriceInputMatch);
                            const shouldValidateQty =
                                qtyToggle && (showsQtyByController || rowQtyVariation || rowQtyInputMatch);
                            if (shouldValidatePrice) {
                                if (isEmpty(combo.price)) {
                                    errors[`Price-${group.variant_name}-${index}`] =
                                        "Price is required";
                                }
                            }

                            // ✅ QUANTITY VALIDATION (ONLY if toggle ON AND controller)
                            if (shouldValidateQty) {
                                if (isEmpty(combo.qty)) {
                                    errors[`Quantity-${group.variant_name}-${index}`] =
                                        "Quantity is required";
                                }
                            }
                        });
                    });
                }

                console.log("[validateForm] summary", {
                    isCombination: state.formData.isCombination,
                    combinationsCount: (state.combinations || []).length,
                    combination: state.combinations || [],
                    isCheckedPrice: state.formValues?.isCheckedPrice,
                    pricesController: state.formValues?.prices,
                    isCheckedQuantity: state.formValues?.isCheckedQuantity,
                    quantitiesController: state.formValues?.quantities,
                    errorCount: Object.keys(errors).length,
                    errors
                });
                return errors;
            }
        }),
        {
            name: 'product-form-storage',
            partialize: (state) => ({
                formData: state.formData,
                formValues: state.formValues,
                variationsData: state.variationsData,
                customizationData: state.customizationData,
                product_variants: state.product_variants, // NEW: Include in persistence
                combinations: state.combinations
            })
        }
    )
);
