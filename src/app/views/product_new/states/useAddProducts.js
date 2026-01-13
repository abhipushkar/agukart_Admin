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

            // ========== NEW: PRODUCT VARIANTS ACTIONS ==========
            setProductVariants: (product_variants) => set({ product_variants }),

            // Initialize product_variants from selected variations - UPDATED FOR DATA PRESERVATION
            initializeProductVariants: (variationsData, allVariants) => {
                const newProductVariants = [];
                const existingVariantsMap = new Map();

                // Create a map of existing product_variants for quick lookup
                get().product_variants.forEach(variant => {
                    existingVariantsMap.set(variant.variant_name, variant);
                });

                variationsData.forEach((variation) => {
                    const variantData = allVariants.find(v => v.variant_name === variation.name);
                    if (variantData) {
                        const existingVariant = existingVariantsMap.get(variation.name);

                        if (existingVariant) {
                            // Preserve existing variant, but update attributes if needed
                            const updatedAttributes = variation.values.map(value => {
                                const existingAttribute = existingVariant.variant_attributes.find(attr =>
                                    attr.attribute === value
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

                            newProductVariants.push({
                                variant_name: variation.name,
                                variant_attributes: updatedAttributes
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

                            newProductVariants.push({
                                variant_name: variation.name,
                                variant_attributes: variantAttributes
                            });
                        }
                    }
                });

                set({ product_variants: newProductVariants });
            },

            // ========== KEEP: COMBINATIONS ACTIONS (price/quantity only) ==========
            setCombinations: (combinations) => set({ combinations }),

            setInputErrors: (updates) => set((state) => ({
                inputErrors: { ...state.inputErrors, ...updates }
            })),

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

            handleGuideRemove: (variantIndex) => {
                const state = get();
                const updatedProductVariants = [...state.product_variants];

                const newProductVariants = updatedProductVariants.map((variant, vIndex) => {
                    if (vIndex === variantIndex) {
                        return {
                            ...variant,
                            guide: [] // Clear guide array
                        };
                    }
                    return variant;
                });

                set({ product_variants: newProductVariants });
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
                                mainImages[imgIndex] = "";
                                updatedAttribute.main_images = mainImages;
                            }
                        } else {
                            updatedAttribute[imageKey] = "";
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
                customizationData: state.customizationData,
                product_variants: state.product_variants, // NEW: Include in persistence
                combinations: state.combinations
            })
        }
    )
);
