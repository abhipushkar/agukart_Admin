import React, { useState, useEffect, useCallback } from "react";
import {
    Modal,
    Box,
    Typography,
    Button,
    TextField,
    FormControl,
    MenuItem,
    Switch,
    Card,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Autocomplete,
    Chip,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import BeenhereIcon from "@mui/icons-material/Beenhere";
import WarningIcon from "@mui/icons-material/Warning";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { useProductFormStore } from "../../../../../states/useAddProducts";

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    maxWidth: '100%',
    width: '600px',
    bgcolor: "#fff",
    boxShadow: 24,
    p: 3,
    borderRadius: '8px',
    maxHeight: '80vh',
    overflowY: 'auto'
};

const VariantModal = ({ show, handleCloseVariant }) => {
    const {
        formData,
        variationsData,
        setVariationsData,
        selectedVariations,
        setSelectedVariations,
        combinations,
        setCombinations,
        product_variants,
        setProductVariants,
        initializeProductVariants,
        setFormData,
        formValues,
        setFormValues,
        varientName,
        parentProductData
    } = useProductFormStore();

    const [selectedVariant, setSelectedVariant] = useState("");
    const [attrValues, setAttrValues] = useState({ name: "", values: [] });
    const [isEdit, setIsEdit] = useState(false);
    const [attrOptions, setAttrOptions] = useState([]);
    const [nameCombinations, setNameCombinations] = useState([]);
    const [showVariantList, setShowVariantList] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);

    // Custom variant states
    const [customVariantDialogOpen, setCustomVariantDialogOpen] = useState(false);
    const [customVariantName, setCustomVariantName] = useState("");
    const [customVariantOptions, setCustomVariantOptions] = useState([""]);
    const [customVariants, setCustomVariants] = useState([]);
    const [editingCustomVariant, setEditingCustomVariant] = useState(null);

    // Warning dialog state
    const [deleteWarningDialogOpen, setDeleteWarningDialogOpen] = useState(false);
    const [variantToDelete, setVariantToDelete] = useState(null);
    const [affectedPrice, setAffectedPrice] = useState(false);
    const [affectedQuantity, setAffectedQuantity] = useState(false);

    const auth_key = localStorage.getItem(localStorageKey.auth_key);

    // Combine predefined variants with custom variants
    const allVariants = [...varientName, ...customVariants];

    // Check if there are any combined variants
    const hasCombinedVariants = useCallback(() => {
        return combinations?.some(comb => comb.isCombined) || false;
    }, [combinations]);

    // Drag and drop handlers
    const handleDragStart = (e, index) => {
        if (hasCombinedVariants()) return; // Disable drag if combined variants exist
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (hasCombinedVariants()) return; // Disable drag if combined variants exist
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        if (hasCombinedVariants() || draggedIndex === null) return; // Disable drag if combined variants exist

        const currentData = [...variationsData];
        const draggedItem = currentData[draggedIndex];

        // Remove dragged item
        currentData.splice(draggedIndex, 1);
        // Insert at target position
        currentData.splice(targetIndex, 0, draggedItem);

        setVariationsData(currentData);
        setDraggedIndex(null);

        // Also reorder product_variants and combinations to maintain consistency
        reorderAssociatedData(draggedIndex, targetIndex);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    // Reorder product_variants and combinations when variations are reordered
    const reorderAssociatedData = (fromIndex, toIndex) => {
        // Reorder product_variants
        if (product_variants && product_variants.length > 0) {
            const reorderedProductVariants = [...product_variants];
            const draggedVariant = reorderedProductVariants[fromIndex];
            reorderedProductVariants.splice(fromIndex, 1);
            reorderedProductVariants.splice(toIndex, 0, draggedVariant);
            setProductVariants(reorderedProductVariants);
        }

        // Reorder combinations
        if (combinations && combinations.length > 0) {
            const reorderedCombinations = [...combinations];
            const draggedCombination = reorderedCombinations[fromIndex];
            reorderedCombinations.splice(fromIndex, 1);
            reorderedCombinations.splice(toIndex, 0, draggedCombination);
            setCombinations(reorderedCombinations);
        }
    };

    // Function to get disabled variants including parent product variants
    const getDisabledVariants = useCallback(() => {
        const disabledVariants = new Set();

        // Ensure selectedVariations is always an array
        const safeSelectedVariations = Array.isArray(selectedVariations) ? selectedVariations : [];

        // Add already selected variations
        safeSelectedVariations.forEach(variant => {
            if (variant && typeof variant === 'string') {
                disabledVariants.add(variant);
            }
        });

        // Add parent product variants that have SKUs assigned
        if (parentProductData?.variant_id) {
            parentProductData.variant_id.forEach(variant => {
                if (variant?.variant_name) {
                    disabledVariants.add(variant.variant_name);
                }
            });
        }

        return disabledVariants;
    }, [selectedVariations, parentProductData]);

    // Generate name combinations for price/quantity selection
    const generateNameCombinations = useCallback(() => {
        const currentData = variationsData || [];
        const names = currentData.map(item => item.name);
        const combinations = [...names];
        for (let i = 0; i < names.length; i++) {
            for (let j = i + 1; j < names.length; j++) {
                combinations.push(`${names[i]} and ${names[j]}`);
            }
        }
        return combinations;
    }, [variationsData]);

    // Update name combinations when variations data changes
    useEffect(() => {
        const currentData = variationsData || [];
        if (currentData.length > 1) {
            const newCombinations = generateNameCombinations();
            setNameCombinations(newCombinations);

            // Set initial form values only if they're empty
            if (!formValues?.prices && !formValues?.quantities && newCombinations.length > 0) {
                setFormValues({
                    prices: newCombinations[0],
                    quantities: newCombinations[0]
                });
            }
        } else {
            setNameCombinations([]);
        }
    }, [variationsData, generateNameCombinations, formValues?.prices, formValues?.quantities]);

    // ========== FIXED: SIMPLE COMBINATION GENERATION ==========
    const generateCombinations = (data) => {
        if (!data || data.length === 0) return [];

        const allCombinations = data.reduce((acc, variation, index) => {
            const { name, values } = variation;
            const safeValues = Array.isArray(values) ? values : values ? [values] : [];

            if (acc.length === 0) {
                return safeValues?.map((value) => {
                    return {
                        [`value${index + 1}`]: value,
                        [`name${index + 1}`]: name,
                        price: "",
                        qty: "",
                        isVisible: true,
                        priceInput: formValues?.prices,
                        quantityInput: formValues?.quantities,
                        isCheckedPrice: formValues?.isCheckedPrice,
                        isCheckedQuantity: formValues?.isCheckedQuantity,
                    };
                });
            }

            return acc.flatMap((combination) =>
                safeValues?.map((value) => {
                    return {
                        ...combination,
                        [`value${index + 1}`]: value,
                        [`name${index + 1}`]: name,
                        price: "",
                        qty: "",
                        isVisible: true,
                        priceInput: formValues?.prices,
                        quantityInput: formValues?.quantities,
                        isCheckedPrice: formValues?.isCheckedPrice,
                        isCheckedQuantity: formValues?.isCheckedQuantity,
                    };
                })
            );
        }, []);

        return allCombinations || [];
    };

    // ========== FIXED: Handle combined variants generation ==========
    const handleCombinedVariants = (variantNames, currentData) => {
        // Fix: Trim and normalize variant names for comparison
        const normalizedVariantNames = variantNames.map(name => name.trim());

        const selectedVariationData = currentData.filter(variation =>
            normalizedVariantNames.includes(variation.name.trim())
        );

        if (selectedVariationData.length === 0) return [];

        // Generate proper combinations for multiple variants
        let combinedResult = generateCombinations(selectedVariationData);

        return [{
            variant_name: normalizedVariantNames.join(" and "),
            combinations: combinedResult,
            isCombined: true,
            componentVariants: normalizedVariantNames
        }];
    };

    // ========== FIXED: Function to mark price/quantity variations in combinations ==========
    const markPriceQuantityVariations = (combinationsData, formValues) => {
        if (!formValues?.isCheckedPrice && !formValues?.isCheckedQuantity) {
            return combinationsData;
        }

        return combinationsData.map(variantGroup => {
            const { variant_name, combinations, isCombined, componentVariants } = variantGroup;

            const updatedCombinations = combinations.map(combination => {
                // For combined variants, check if any component variant matches
                let isPriceVariation = false;
                let isQuantityVariation = false;

                if (formValues?.isCheckedPrice && formValues?.prices) {
                    if (isCombined && componentVariants) {
                        // For combined variant, check if the price selection matches this combined variant
                        isPriceVariation = formValues?.prices === variant_name;
                    } else {
                        // For single variant
                        isPriceVariation = formValues?.prices === variant_name;
                    }
                }

                if (formValues?.isCheckedQuantity && formValues?.quantities) {
                    if (isCombined && componentVariants) {
                        // For combined variant, check if the quantity selection matches this combined variant
                        isQuantityVariation = formValues?.quantities === variant_name;
                    } else {
                        // For single variant
                        isQuantityVariation = formValues?.quantities === variant_name;
                    }
                }

                return {
                    ...combination,
                    isPriceVariation: isPriceVariation,
                    isQuantityVariation: isQuantityVariation
                };
            });

            return {
                ...variantGroup,
                combinations: updatedCombinations
            };
        });
    };

    // ========== NEW: Check if variant is used in price/quantity variations ==========
    const checkVariantUsage = (variantName) => {
        const isPriceUsed = formValues?.isCheckedPrice &&
            (formValues?.prices === variantName ||
                (formValues?.prices?.includes("and") && formValues.prices.includes(variantName)));

        const isQuantityUsed = formValues?.isCheckedQuantity &&
            (formValues?.quantities === variantName ||
                (formValues?.quantities?.includes("and") && formValues.quantities.includes(variantName)));

        return {
            isUsed: isPriceUsed || isQuantityUsed,
            affectsPrice: isPriceUsed,
            affectsQuantity: isQuantityUsed
        };
    };

    // ========== NEW: Handle variant deletion with warning ==========
    const handleDeleteVariationWithWarning = (selectedVariantName) => {
        const usage = checkVariantUsage(selectedVariantName);

        if (usage.isUsed) {
            // Show warning dialog
            setVariantToDelete(selectedVariantName);
            setAffectedPrice(usage.affectsPrice);
            setAffectedQuantity(usage.affectsQuantity);
            setDeleteWarningDialogOpen(true);
        } else {
            // Delete directly if not used in price/quantity
            handleDeleteVariation(selectedVariantName);
        }
    };

    // ========== NEW: Confirm deletion and turn off affected switches ==========
    const handleConfirmDelete = () => {
        if (variantToDelete) {
            // Turn off the affected switches
            const updatedFormValues = { ...formValues };

            if (affectedPrice) {
                updatedFormValues.isCheckedPrice = false;
                updatedFormValues.prices = "";
            }

            if (affectedQuantity) {
                updatedFormValues.isCheckedQuantity = false;
                updatedFormValues.quantities = "";
            }

            setFormValues(updatedFormValues);

            // Now delete the variant
            handleDeleteVariation(variantToDelete);

            // Close warning dialog
            setDeleteWarningDialogOpen(false);
            setVariantToDelete(null);
            setAffectedPrice(false);
            setAffectedQuantity(false);
        }
    };

    // ========== NEW: Cancel deletion ==========
    const handleCancelDelete = () => {
        setDeleteWarningDialogOpen(false);
        setVariantToDelete(null);
        setAffectedPrice(false);
        setAffectedQuantity(false);
    };

    // ========== FIXED: Helper function to preserve combination data ==========
    const preserveCombinationData = (newCombinations, existingCombinations) => {
        if (!existingCombinations || existingCombinations.length === 0) {
            return newCombinations;
        }

        const existingCombinationsMap = new Map();

        // Create a map of existing combinations for quick lookup
        existingCombinations.forEach(combGroup => {
            existingCombinationsMap.set(combGroup.variant_name, combGroup);
        });

        // Merge new combinations with existing data
        return newCombinations.map(newCombGroup => {
            const existingCombGroup = existingCombinationsMap.get(newCombGroup.variant_name);

            if (existingCombGroup && newCombGroup.combinations && existingCombGroup.combinations) {
                // Create a map of existing combinations by their values
                const existingCombMap = new Map();
                existingCombGroup.combinations.forEach(comb => {
                    // Create a unique key based on all variant values
                    const keyParts = [];
                    for (let i = 1; i <= 3; i++) {
                        const valueKey = `value${i}`;
                        const nameKey = `name${i}`;
                        if (comb[valueKey] && comb[nameKey]) {
                            keyParts.push(`${comb[nameKey]}:${comb[valueKey]}`);
                        }
                    }
                    const key = keyParts.join('|');
                    if (key) {
                        existingCombMap.set(key, comb);
                    }
                });

                // Merge combinations while preserving price/quantity data
                const mergedCombinations = newCombGroup.combinations.map(newComb => {
                    // Create the same key for the new combination
                    const keyParts = [];
                    for (let i = 1; i <= 3; i++) {
                        const valueKey = `value${i}`;
                        const nameKey = `name${i}`;
                        if (newComb[valueKey] && newComb[nameKey]) {
                            keyParts.push(`${newComb[nameKey]}:${newComb[valueKey]}`);
                        }
                    }
                    const key = keyParts.join('|');

                    const existingComb = existingCombMap.get(key);

                    if (existingComb) {
                        // Preserve existing price, quantity, and visibility data
                        return {
                            ...newComb,
                            price: existingComb.price || newComb.price,
                            qty: existingComb.qty || newComb.qty,
                            isVisible: existingComb.hasOwnProperty('isVisible') ? existingComb.isVisible : newComb.isVisible,
                        };
                    }

                    return newComb;
                });

                return {
                    ...newCombGroup,
                    combinations: mergedCombinations
                };
            }

            return newCombGroup;
        });
    };

    // ========== FIXED: handleGenerate with proper combined variant handling ==========
    const handleGenerate = async () => {
        const currentData = variationsData || [];

        let data = [];
        const processedVariants = new Set();

        // Initialize product_variants FIRST - this creates SEPARATE variants only
        initializeProductVariants(currentData, allVariants);

        // Separate arrays for single variants and combined variants
        let singleVariantsData = [];
        let combinedVariantsData = [];

        // Handle the case when price/quantity variations are enabled
        if ((formValues?.isCheckedPrice || formValues?.isCheckedQuantity) && (formValues?.prices || formValues?.quantities)) {

            // Check if we have combined variants
            const isPriceCombined = formValues?.prices?.includes(" and ");
            const isQuantityCombined = formValues?.quantities?.includes(" and ");

            // Process PRICE combinations (combined or single)
            if (formValues?.isCheckedPrice && formValues?.prices) {
                if (isPriceCombined) {
                    // Combined price variant - FIXED: Trim variant names
                    const priceVariantNames = formValues?.prices.split(" and ").map(v => v.trim());
                    const priceCombinedData = handleCombinedVariants(priceVariantNames, currentData);

                    // FIXED: Only add if we have valid combinations
                    if (priceCombinedData.length > 0 && priceCombinedData[0].combinations.length > 0) {
                        // Push combined variants to separate array
                        combinedVariantsData.push(...priceCombinedData);
                        priceVariantNames.forEach(v => processedVariants.add(v.trim()));
                    }
                } else {
                    // Single price variant - maintain original order
                    const priceVariantName = formValues?.prices?.trim();
                    const priceVariationData = currentData.filter((item) => item.name.trim() === priceVariantName);

                    if (priceVariationData.length > 0) {
                        let priceResult = generateCombinations(priceVariationData);
                        // Find the original index to maintain order
                        const originalIndex = currentData.findIndex(item => item.name.trim() === priceVariantName);
                        singleVariantsData.push({
                            variant_name: priceVariantName,
                            combinations: priceResult,
                            isCombined: false,
                            originalIndex: originalIndex // Store original position
                        });
                        processedVariants.add(priceVariantName);
                    }
                }
            }

            // Process QUANTITY combinations (combined or single)
            if (formValues?.isCheckedQuantity && formValues?.quantities) {
                if (isQuantityCombined) {
                    // Combined quantity variant - FIXED: Trim variant names
                    const quantityVariantNames = formValues?.quantities.split(" and ").map(v => v.trim());

                    // Check if this combined variant already exists in data
                    const existingCombinedIndex = combinedVariantsData.findIndex(d =>
                        d.isCombined && d.variant_name === formValues?.quantities
                    );

                    if (existingCombinedIndex === -1) {
                        const quantityCombinedData = handleCombinedVariants(quantityVariantNames, currentData);

                        // FIXED: Only add if we have valid combinations
                        if (quantityCombinedData.length > 0 && quantityCombinedData[0].combinations.length > 0) {
                            // Push combined variants to separate array
                            combinedVariantsData.push(...quantityCombinedData);
                        }
                    }
                    quantityVariantNames.forEach(v => processedVariants.add(v.trim()));
                } else {
                    // Single quantity variant - maintain original order
                    const quantityVariantName = formValues?.quantities?.trim();

                    // Check if this single variant already exists in data
                    const existingSingleIndex = singleVariantsData.findIndex(d =>
                        !d.isCombined && d.variant_name === quantityVariantName
                    );

                    if (existingSingleIndex === -1) {
                        const quantityVariationData = currentData.filter((item) => item.name.trim() === quantityVariantName);

                        if (quantityVariationData.length > 0) {
                            let quantityResult = generateCombinations(quantityVariationData);
                            // Find the original index to maintain order
                            const originalIndex = currentData.findIndex(item => item.name.trim() === quantityVariantName);
                            singleVariantsData.push({
                                variant_name: quantityVariantName,
                                combinations: quantityResult,
                                isCombined: false,
                                originalIndex: originalIndex // Store original position
                            });
                        }
                    }
                    processedVariants.add(quantityVariantName);
                }
            }

            // FIXED: Handle individual variations that are not part of any price/quantity variation
            // Maintain original order for all single variants
            const individualVariations = currentData.filter(item =>
                !processedVariants.has(item.name.trim())
            );

            for (const item of individualVariations) {
                let result = generateCombinations([item]);
                // Find the original index to maintain order
                const originalIndex = currentData.findIndex(variation => variation.name.trim() === item.name.trim());
                singleVariantsData.push({
                    variant_name: item?.name,
                    combinations: result,
                    isCombined: false,
                    originalIndex: originalIndex // Store original position
                });
            }
        } else {
            // No price/quantity variations enabled - generate all variations normally, maintaining original order
            for (const item of currentData) {
                let result = generateCombinations([item]);
                // Find the original index to maintain order
                const originalIndex = currentData.findIndex(variation => variation.name === item.name);
                singleVariantsData.push({
                    variant_name: item?.name,
                    combinations: result,
                    isCombined: false,
                    originalIndex: originalIndex // Store original position
                });
            }
        }

        // FIXED: Sort single variants by original position to maintain order
        singleVariantsData.sort((a, b) => a.originalIndex - b.originalIndex);

        // FIXED: Combine data with combined variants at the end
        data = [...singleVariantsData, ...combinedVariantsData];

        // Remove the originalIndex property before setting state (clean up)
        const cleanedData = data.map(({ originalIndex, ...item }) => item);

        console.log("Generated combinations before marking:", cleanedData);

        // Mark price/quantity variations properly
        const finalCombinationsData = markPriceQuantityVariations(cleanedData, formValues);
        console.log("Final combinations after marking:", finalCombinationsData);

        // PRESERVE EXISTING COMBINATION DATA (price/quantity values)
        const preservedCombinations = preserveCombinationData(finalCombinationsData, combinations);

        setCombinations(preservedCombinations);

        // Update form data with selected variations
        const parentMainIds = currentData
            .map(variation => {
                const variant = allVariants.find((item) => item.variant_name === variation.name);
                return variant?.id && !variant.isCustom ? variant.id : null;
            })
            .filter(Boolean);

        const allIds = currentData
            .flatMap((variation) => {
                const variant = allVariants.find((item) => item.variant_name === variation.name);
                const safeValues = Array.isArray(variation.values) ? variation.values : [];

                return safeValues.map((value) => {
                    const attributeData = variant?.variant_attribute?.find((attr) => attr.attribute_value === value);
                    return attributeData?._id && !variant.isCustom ? attributeData._id : null;
                });
            })
            .filter(Boolean);

        setFormData({
            ParentMainId: Array.from(new Set([...(formData.ParentMainId || []), ...parentMainIds])),
            varientName: Array.from(new Set([...(formData.varientName || []), ...allIds]))
        });

        handleCloseVariant();
    };

    // Custom Variant Dialog Functions
    const handleOpenCustomVariantDialog = (variantToEdit = null) => {
        setEditingCustomVariant(variantToEdit);
        if (variantToEdit) {
            // Editing existing custom variant
            setCustomVariantName(variantToEdit.variant_name);
            setCustomVariantOptions(variantToEdit.variant_attribute.map(attr => attr.attribute_value));
        } else {
            // Creating new custom variant
            setCustomVariantName("");
            setCustomVariantOptions([""]);
        }
        setCustomVariantDialogOpen(true);
    };

    const handleCloseCustomVariantDialog = () => {
        setCustomVariantDialogOpen(false);
        setCustomVariantName("");
        setCustomVariantOptions([""]);
        setEditingCustomVariant(null);
    };

    const handleAddOption = () => {
        setCustomVariantOptions([...customVariantOptions, ""]);
    };

    const handleRemoveOption = (index) => {
        if (customVariantOptions.length > 1) {
            const newOptions = customVariantOptions.filter((_, i) => i !== index);
            setCustomVariantOptions(newOptions);
        }
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...customVariantOptions];
        newOptions[index] = value;
        setCustomVariantOptions(newOptions);
    };

    const handleSaveCustomVariant = () => {
        if (!customVariantName.trim()) {
            alert("Please enter a variant name");
            return;
        }

        const validOptions = customVariantOptions.filter(opt => opt.trim() !== "");
        if (validOptions.length < 2) {
            alert("Please add at least 2 options");
            return;
        }

        // Create custom variant object
        const newCustomVariant = {
            variant_name: customVariantName.trim(),
            variant_attribute: validOptions.map((option) => ({
                attribute_value: option.trim(),
                main_images: [null, null, null],
                preview_image: null,
                thumbnail: null
            })),
            isCustom: true
        };

        if (editingCustomVariant) {
            // Update existing custom variant
            setCustomVariants(prev =>
                prev.map(variant =>
                    variant.variant_name === editingCustomVariant.variant_name
                        ? newCustomVariant
                        : variant
                )
            );

            // Update variationsData if this variant is currently being used
            const currentData = variationsData || [];
            const updatedVariationsData = currentData.map(variation =>
                variation.name === editingCustomVariant.variant_name
                    ? { name: newCustomVariant.variant_name, values: validOptions }
                    : variation
            );
            setVariationsData(updatedVariationsData);

            // Update selectedVariations if name changed
            if (editingCustomVariant.variant_name !== newCustomVariant.variant_name) {
                // Ensure selectedVariations is always treated as an array
                const safeSelectedVariations = Array.isArray(selectedVariations) ? selectedVariations : [];
                setSelectedVariations(
                    safeSelectedVariations.map(variant =>
                        variant === editingCustomVariant.variant_name
                            ? newCustomVariant.variant_name
                            : variant
                    )
                );
            }
        } else {
            // Add new custom variant
            setCustomVariants(prev => [...prev, newCustomVariant]);
        }

        // Close dialog and reset
        handleCloseCustomVariantDialog();

        if (!editingCustomVariant) {
            // Auto-select the newly created variant only for new variants
            // Ensure selectedVariations is always treated as an array
            const safeSelectedVariations = Array.isArray(selectedVariations) ? selectedVariations : [];
            setSelectedVariations([...safeSelectedVariations, newCustomVariant.variant_name]);
            setSelectedVariant(newCustomVariant.variant_name);

            // Set attribute options for the new variant
            setAttrOptions(validOptions);
            setAttrValues({
                name: newCustomVariant.variant_name,
                values: [],
            });
        }
    };

    // Function to handle editing custom variant options
    const handleEditCustomVariantOptions = (variantName) => {
        const customVariant = customVariants.find(v => v.variant_name === variantName);
        if (customVariant) {
            handleOpenCustomVariantDialog(customVariant);
        }
    };

    const handleTagHandler = (event, newValue) => {
        if (newValue.some(value => value === `Add All Options (${attrOptions?.length})`)) {
            setAttrValues((prev) => ({
                ...prev,
                values: [...attrOptions],
                name: selectedVariant,
            }));
        } else {
            const uniqueTags = newValue.filter(
                (newTag) => !attrValues.values.includes(newTag)
            );
            setAttrValues((prev) => ({
                ...prev,
                values: [...prev.values, ...uniqueTags],
                name: selectedVariant,
            }));
        }
    };

    const handleCancel = () => {
        setShowVariantList(false);
        setSelectedVariant("");
        setAttrValues({ name: "", values: [] });
        setIsEdit(false);
    };

    const handleApplyCancel = () => {
        handleCloseVariant();
        setShowVariantList(false);
        setSelectedVariant("");
        setAttrValues({ name: "", values: [] });
        setIsEdit(false);
    };

    const handleTagDelete = (option) => {
        setAttrValues((prv) => ({ ...prv, values: prv.values.filter((item) => item !== option) }));
    };

    const handleDone = () => {
        if (!attrValues.name || attrValues.values.length === 0) {
            return;
        }

        const normalizedAttrValues = {
            name: attrValues.name,
            values: attrValues.values
        };

        // Use the raw variationsData from store instead of normalized version
        const currentData = variationsData || [];

        if (isEdit) {
            const updatedData = currentData.map((item) =>
                item.name === attrValues.name ? normalizedAttrValues : item
            );
            setVariationsData(updatedData);
        } else {
            const newData = [...currentData, normalizedAttrValues];
            setVariationsData(newData);
        }

        setShowVariantList(false);
        setSelectedVariant("");
        setAttrValues({ name: "", values: [] });
        setAttrOptions([]);
        setIsEdit(false);
    };

    // ========== UPDATED: Handle delete variation with warning ==========
    const handleDeleteVariation = (selectedVariantName) => {
        const currentData = variationsData || [];
        const updatedData = currentData.filter(variation => variation.name !== selectedVariantName);
        setVariationsData(updatedData);

        // Remove from custom variants if it's a custom variant
        const isCustomVariant = customVariants.some(v => v.variant_name === selectedVariantName);
        if (isCustomVariant) {
            setCustomVariants(prev => prev.filter(v => v.variant_name !== selectedVariantName));
        }

        const variant = allVariants.find((item) => item.variant_name === selectedVariantName);
        const parentMainName = variant?.variant_name;
        const allAttributeValues = variant?.variant_attribute?.map((attr) => attr.attribute_value) || [];
        const allIds = variant?.variant_attribute?.map((attr) => attr._id) || [];

        setFormData({
            ParentMainId: formData.ParentMainId.filter((id) => id !== variant?._id),
            varientName: formData.varientName.filter((id) => !allIds.includes(id)),
        });

        // Ensure selectedVariations is always treated as an array
        const safeSelectedVariations = Array.isArray(selectedVariations) ? selectedVariations : [];
        setSelectedVariations(
            safeSelectedVariations.filter(variation => variation !== selectedVariantName)
        );

        setSelectedVariant("");
        setAttrValues({ name: "", values: [] });
        setIsEdit(false);
        setShowVariantList(false);
    };

    // ========== CLEANED UP: handleChange - Image Source Logic Removed ==========
    const handleChange = (e) => {
        const { name, value, checked } = e.target;

        if (name === "isCheckedPrice" || name === "isCheckedQuantity") {
            setFormValues({ [name]: checked });

            // Clear the corresponding form data when toggled on
            if (checked) {
                if (name === "isCheckedPrice") {
                    setFormData(prev => ({ ...prev, salePrice: "" }));
                } else if (name === "isCheckedQuantity") {
                    setFormData(prev => ({ ...prev, quantity: "" }));
                }
            }
        } else {
            // Direct update for prices and quantities - no image source logic
            setFormValues({ [name]: value });
        }
    };

    useEffect(() => {
        if (selectedVariant) {
            const data = allVariants.filter((item) => item?.variant_name === selectedVariant);
            const options = data[0]?.variant_attribute?.map((item) => item?.attribute_value) || [];
            setAttrOptions(options);
        }
    }, [selectedVariant, allVariants]);

    const handleEditVariation = (item) => {
        setSelectedVariant(item?.name);
        setAttrValues({ name: item?.name, values: item?.values || [] });
        setIsEdit(true);
        setShowVariantList(true);
    };

    const handleVariantSelect = (variantName) => {
        // Ensure selectedVariations is always treated as an array
        const safeSelectedVariations = Array.isArray(selectedVariations) ? selectedVariations : [];
        setSelectedVariations(Array.from(new Set([...safeSelectedVariations, variantName])));
        setSelectedVariant(variantName);
        setAttrValues(prev => ({ ...prev, name: variantName, values: [] }));
    };

    // Get disabled variants
    const disabledVariants = getDisabledVariants();

    return (
        <>
            <Modal
                open={show}
                onClose={(e, reason) => {
                    if (reason !== "backdropClick") {
                        handleCloseVariant();
                    }
                }}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={modalStyle} onClick={(e) => e.stopPropagation()}>
                    {!showVariantList ? (
                        <>
                            <Typography id="modal-modal-title" fontWeight={500} variant="h5" mb={2}>
                                Manage Variations
                            </Typography>

                            <>
                                {variationsData && variationsData.length > 0 ? (
                                    <Box>
                                        {(variationsData || []).map((item, i) => {
                                            const isDraggable = !hasCombinedVariants();
                                            return (
                                                <Card
                                                    key={i}
                                                    sx={{
                                                        marginBottom: '16px',
                                                        border: '1px solid #e0e0e0',
                                                        padding: '16px',
                                                        cursor: isDraggable ? 'grab' : 'default',
                                                        opacity: draggedIndex === i ? 0.5 : 1,
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            boxShadow: isDraggable ? 2 : 0,
                                                            borderColor: isDraggable ? '#1976d2' : '#e0e0e0'
                                                        },
                                                        '&:active': {
                                                            cursor: isDraggable ? 'grabbing' : 'default'
                                                        }
                                                    }}
                                                    draggable={isDraggable}
                                                    onDragStart={(e) => handleDragStart(e, i)}
                                                    onDragOver={(e) => handleDragOver(e, i)}
                                                    onDrop={(e) => handleDrop(e, i)}
                                                    onDragEnd={handleDragEnd}
                                                >
                                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                                        <Box display="flex" alignItems="center">
                                                            {isDraggable && (
                                                                <DragIndicatorIcon
                                                                    sx={{
                                                                        mr: 1,
                                                                        color: 'text.secondary',
                                                                        cursor: 'grab'
                                                                    }}
                                                                />
                                                            )}
                                                            <Typography fontWeight={500}>{item?.name}</Typography>
                                                        </Box>
                                                        {customVariants.some(v => v.variant_name === item.name) && (
                                                            <Chip
                                                                label="Custom"
                                                                size="small"
                                                                color="primary"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </Box>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {item?.values?.length || 0} options
                                                    </Typography>
                                                    <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
                                                        <Box>
                                                            {Array.isArray(item?.values) && item.values.map((data, valueIndex) => (
                                                                <Chip
                                                                    key={valueIndex}
                                                                    label={data}
                                                                    size="small"
                                                                    sx={{ m: 0.5 }}
                                                                />
                                                            ))}
                                                        </Box>
                                                        <Box display="flex">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleEditVariation(item)}
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDeleteVariationWithWarning(item?.name)}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Box>
                                                    </Box>
                                                    {hasCombinedVariants() && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                            Drag & drop disabled when combined variants exist
                                                        </Typography>
                                                    )}
                                                </Card>
                                            );
                                        })}
                                    </Box>
                                ) : (
                                    <Box textAlign={"center"} py={3}>
                                        <BeenhereIcon sx={{ fontSize: '55px', color: 'text.secondary', mb: 2 }} />
                                        <Typography variant="h6" fontWeight={500} textAlign="center" gutterBottom>
                                            You don't have any variations
                                        </Typography>
                                        <Typography textAlign="center" color="textSecondary">
                                            Use variations if your item is offered in different <br /> colours, size,
                                            materials, etc.
                                        </Typography>
                                    </Box>
                                )}

                                {(variationsData || []).length < 3 && (
                                    <Button
                                        variant="outlined"
                                        startIcon={<AddIcon />}
                                        onClick={() => setShowVariantList(true)}
                                        sx={{ mt: 2 }}
                                    >
                                        Add a Variation
                                    </Button>
                                )}

                                {(variationsData || []).length > 0 && (
                                    <Box py={2} sx={{ borderTop: '1px solid #e0e0e0', mt: 2 }}>
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <Switch
                                                name="isCheckedPrice"
                                                checked={formValues?.isCheckedPrice || false}
                                                onChange={handleChange}
                                            />
                                            <Typography>Prices vary for each</Typography>
                                        </Box>
                                        {formValues?.isCheckedPrice && (variationsData || []).length > 1 && (
                                            <FormControl fullWidth sx={{ mb: 2 }}>
                                                <TextField
                                                    select
                                                    label="Select Variation for Prices"
                                                    value={formValues?.prices || ""}
                                                    name="prices"
                                                    onChange={handleChange}
                                                    size="small"
                                                >
                                                    {nameCombinations?.map((item, index) => (
                                                        <MenuItem key={index} value={item}>
                                                            {item}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </FormControl>
                                        )}

                                        <Box display="flex" alignItems="center" mb={2}>
                                            <Switch
                                                name="isCheckedQuantity"
                                                checked={formValues?.isCheckedQuantity || false}
                                                onChange={handleChange}
                                            />
                                            <Typography>Quantities vary</Typography>
                                        </Box>
                                        {formValues?.isCheckedQuantity && (variationsData || []).length > 1 && (
                                            <FormControl fullWidth>
                                                <TextField
                                                    select
                                                    label="Select Variation for Quantities"
                                                    value={formValues?.quantities || ""}
                                                    name="quantities"
                                                    onChange={handleChange}
                                                    size="small"
                                                >
                                                    {nameCombinations?.map((item, index) => (
                                                        <MenuItem key={index} value={item}>
                                                            {item}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </FormControl>
                                        )}
                                    </Box>
                                )}

                                <Box display="flex" justifyContent="space-between" mt={4}>
                                    <Button onClick={handleApplyCancel} variant="outlined">
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleGenerate}
                                    >
                                        Apply
                                    </Button>
                                </Box>
                            </>

                        </>
                    ) : (
                        <>
                            {!selectedVariant ? (
                                <>
                                    <Typography variant="h5" gutterBottom>
                                        What type of variation is it?
                                    </Typography>
                                    <Typography color="textSecondary" mb={3}>
                                        You can add up to 3 variations. Use the variation types listed here for peak
                                        discoverability.
                                    </Typography>
                                    <Box my={2}>
                                        {allVariants?.map((item, index) => {
                                            const isDisabled = disabledVariants.has(item?.variant_name);
                                            // Ensure selectedVariations is always treated as an array
                                            const safeSelectedVariations = Array.isArray(selectedVariations) ? selectedVariations : [];
                                            const isSelected = safeSelectedVariations.includes(item?.variant_name);
                                            const isCustom = item.isCustom;
                                            return (
                                                <Box key={index} sx={{ display: 'inline-block', m: 0.5, position: 'relative' }}>
                                                    <Button
                                                        variant="outlined"
                                                        sx={{
                                                            borderRadius: '20px',
                                                            textTransform: 'none',
                                                            // Different styling for parent-disabled variants
                                                            ...(isDisabled && !isSelected && {
                                                                borderColor: '#ccc',
                                                                color: '#999',
                                                                backgroundColor: '#f5f5f5',
                                                                '&:hover': {
                                                                    backgroundColor: '#f5f5f5',
                                                                    borderColor: '#ccc'
                                                                }
                                                            })
                                                        }}
                                                        onClick={() => handleVariantSelect(item?.variant_name)}
                                                        disabled={isDisabled}
                                                        startIcon={isDisabled ? <CheckIcon /> : null}
                                                    >
                                                        {item?.variant_name}
                                                        {isCustom && " (Custom)"}
                                                        {isDisabled && !isSelected && " (Used in Parent)"}
                                                    </Button>
                                                    {isCustom && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditCustomVariantOptions(item.variant_name);
                                                            }}
                                                            sx={{
                                                                position: 'absolute',
                                                                top: -8,
                                                                right: -8,
                                                                backgroundColor: 'white',
                                                                border: '1px solid #ccc',
                                                                width: 24,
                                                                height: 24,
                                                                '&:hover': {
                                                                    backgroundColor: '#f5f5f5'
                                                                }
                                                            }}
                                                            title="Edit custom variant options"
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                    <Box my={2}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => handleOpenCustomVariantDialog()}
                                            sx={{
                                                borderColor: '#1976d2',
                                                color: '#1976d2',
                                                '&:hover': {
                                                    borderColor: '#1565c0',
                                                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                                }
                                            }}
                                        >
                                            <AddIcon sx={{ mr: 1 }} />
                                            Add Custom Variant
                                        </Button>
                                    </Box>
                                    <Button onClick={handleCancel} sx={{ mt: 2 }}>
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Typography variant="h5" gutterBottom>
                                        {selectedVariant}
                                        {customVariants.some(v => v.variant_name === selectedVariant) && (
                                            <Chip
                                                label="Custom"
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{ ml: 1 }}
                                            />
                                        )}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" mb={2}>
                                        Variation
                                    </Typography>
                                    <Typography variant="h6" mb={1}>
                                        Options {(attrValues?.values || []).length}
                                    </Typography>
                                    <Typography color="textSecondary" mb={3}>
                                        Buyers can choose from the following options.
                                    </Typography>

                                    {/* Edit Custom Variant Options Button */}
                                    {customVariants.some(v => v.variant_name === selectedVariant) && (
                                        <Box mb={2}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={() => {
                                                    const customVariant = customVariants.find(v => v.variant_name === selectedVariant);
                                                    if (customVariant) {
                                                        handleOpenCustomVariantDialog(customVariant);
                                                    }
                                                }}
                                            >
                                                Edit Variant Options
                                            </Button>
                                        </Box>
                                    )}

                                    <Autocomplete
                                        multiple
                                        id="dropdown-with-list"
                                        disableCloseOnSelect
                                        options={[...(attrOptions || []), `Add All Options (${attrOptions?.length || 0})`]}
                                        getOptionLabel={(option) => option}
                                        value={attrValues.values || []}
                                        onChange={handleTagHandler}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Enter an option..."
                                                placeholder="Enter an option..."
                                            />
                                        )}
                                        renderOption={(props, option) => {
                                            const isSelected = attrValues.values.includes(option);
                                            return (
                                                <ListItem
                                                    {...props}
                                                    sx={{
                                                        backgroundColor: isSelected ? "rgba(0, 123, 255, 0.2)" : "inherit",
                                                        "&:hover": {
                                                            backgroundColor: "rgba(0, 123, 255, 0.1)",
                                                        },
                                                    }}
                                                >
                                                    <ListItemText primary={option} />
                                                </ListItem>
                                            );
                                        }}
                                        sx={{ mb: 2 }}
                                    />

                                    <List>
                                        {(attrValues?.values || []).map((option, index) => (
                                            <ListItem
                                                key={index}
                                                sx={{
                                                    border: "1px solid #e0e0e0",
                                                    borderRadius: "4px",
                                                    marginBottom: "8px",
                                                }}
                                                secondaryAction={
                                                    <IconButton
                                                        edge="end"
                                                        onClick={() => handleTagDelete(option)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                }
                                            >
                                                <ListItemText primary={option} />
                                            </ListItem>
                                        ))}
                                    </List>

                                    <Box display="flex" justifyContent="space-between" mt={4}>
                                        <Button
                                            onClick={() => handleDeleteVariationWithWarning(selectedVariant)}
                                            color="error"
                                        >
                                            Delete
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={handleDone}
                                            disabled={!attrValues?.values || attrValues.values.length === 0}
                                        >
                                            Done
                                        </Button>
                                    </Box>
                                </>
                            )}
                        </>
                    )}
                </Box>
            </Modal>

            {/* Custom Variant Dialog */}
            <Dialog open={customVariantDialogOpen} onClose={handleCloseCustomVariantDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingCustomVariant ? 'Edit Custom Variant' : 'Add Custom Variant'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Variant Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={customVariantName}
                        onChange={(e) => setCustomVariantName(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Typography variant="subtitle1" gutterBottom>
                        Options (at least 2 required):
                    </Typography>
                    {customVariantOptions.map((option, index) => (
                        <Box key={index} display="flex" alignItems="center" mb={1}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder={`Option ${index + 1}`}
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                sx={{ mr: 1 }}
                            />
                            {customVariantOptions.length > 1 && (
                                <IconButton onClick={() => handleRemoveOption(index)} color="error">
                                    <DeleteIcon />
                                </IconButton>
                            )}
                        </Box>
                    ))}
                    <Button onClick={handleAddOption} startIcon={<AddIcon />} sx={{ mt: 1 }}>
                        Add Option
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCustomVariantDialog}>Cancel</Button>
                    <Button onClick={handleSaveCustomVariant} variant="contained">
                        {editingCustomVariant ? 'Update Variant' : 'Save Variant'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Warning Dialog */}
            <Dialog open={deleteWarningDialogOpen} onClose={handleCancelDelete} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon color="warning" />
                    <Typography variant="h6">Delete Variant</Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        You are about to delete the variant "<strong>{variantToDelete}</strong>".
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        This variant is currently being used in:
                    </Typography>
                    <Box sx={{ ml: 2, mt: 1 }}>
                        {affectedPrice && (
                            <Typography variant="body2" color="warning.main">
                                • Price variations
                            </Typography>
                        )}
                        {affectedQuantity && (
                            <Typography variant="body2" color="warning.main">
                                • Quantity variations
                            </Typography>
                        )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        To delete this variant, the affected variation settings will be turned off.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete}>Cancel</Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                    >
                        Delete Anyway
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default VariantModal;
