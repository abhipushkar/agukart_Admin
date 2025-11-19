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

    // Custom variant states
    const [customVariantDialogOpen, setCustomVariantDialogOpen] = useState(false);
    const [customVariantName, setCustomVariantName] = useState("");
    const [customVariantOptions, setCustomVariantOptions] = useState([""]);
    const [customVariants, setCustomVariants] = useState([]);

    const auth_key = localStorage.getItem(localStorageKey.auth_key);

    // Combine predefined variants with custom variants
    const allVariants = [...varientName, ...customVariants];

    // Function to get disabled variants including parent product variants
    const getDisabledVariants = useCallback(() => {
        const disabledVariants = new Set();

        // Add already selected variations
        (selectedVariations || []).forEach(variant => disabledVariants.add(variant));

        // Add parent product variants that have SKUs assigned
        if (parentProductData?.variant_id) {
            parentProductData.variant_id.forEach(variant => {
                disabledVariants.add(variant.variant_name);
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

    // ========== SIMPLE COMBINATION GENERATION (like old code) ==========
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

    // Handle combined variants generation
    const handleCombinedVariants = (variantNames, currentData) => {
        const selectedVariationData = currentData.filter(variation =>
            variantNames.includes(variation.name)
        );

        if (selectedVariationData.length === 0) return [];

        let combinedResult = generateCombinations(selectedVariationData);

        return [{
            variant_name: variantNames.join(" and "),
            combinations: combinedResult
        }];
    };

    // Function to mark price/quantity variations in combinations
    const markPriceQuantityVariations = (combinationsData, formValues) => {
        if (!formValues?.isCheckedPrice && !formValues?.isCheckedQuantity) {
            return combinationsData;
        }

        return combinationsData.map(variantGroup => {
            const { variant_name, combinations } = variantGroup;

            const updatedCombinations = combinations.map(combination => {
                // Check if this combination belongs to a price variation
                const isPriceVariation = formValues?.isCheckedPrice &&
                    (formValues?.prices === variant_name ||
                        (formValues?.prices?.includes("and") && formValues?.prices.split("and").map(p => p.trim()).includes(variant_name)));

                // Check if this combination belongs to a quantity variation
                const isQuantityVariation = formValues?.isCheckedQuantity &&
                    (formValues?.quantities === variant_name ||
                        (formValues?.quantities?.includes("and") && formValues?.quantities.split("and").map(q => q.trim()).includes(variant_name)));

                return {
                    ...combination,
                    isPriceVariation: isPriceVariation || false,
                    isQuantityVariation: isQuantityVariation || false
                };
            });

            return {
                ...variantGroup,
                combinations: updatedCombinations
            };
        });
    };

    // ========== UPDATED: handleGenerate with proper mixed case handling ==========
    const handleGenerate = async () => {
        const currentData = variationsData || [];

        if (currentData.length === 0) {
            console.log("No variations data to generate");
            return;
        }

        let data = [];

        // Initialize product_variants FIRST
        initializeProductVariants(currentData, allVariants);

        // Handle the case when price/quantity variations are enabled
        if ((formValues?.isCheckedPrice || formValues?.isCheckedQuantity) && (formValues?.prices || formValues?.quantities)) {

            // Check if we have combined variants
            const isPriceCombined = formValues?.prices?.includes("and");
            const isQuantityCombined = formValues?.quantities?.includes("and");

            if (isPriceCombined || isQuantityCombined) {
                // Handle combined variants
                const processedVariants = new Set();

                // Process PRICE combinations (combined or single)
                if (formValues?.isCheckedPrice && formValues?.prices) {
                    if (isPriceCombined) {
                        // Combined price variant
                        const priceVariantNames = formValues?.prices.split("and").map(v => v.trim());
                        const priceCombinedData = handleCombinedVariants(priceVariantNames, currentData);
                        data.push(...priceCombinedData);
                        priceVariantNames.forEach(v => processedVariants.add(v));
                    } else {
                        // Single price variant
                        const priceVariantName = formValues?.prices;
                        const priceVariationData = currentData.filter((item) => item.name === priceVariantName);
                        let priceResult = generateCombinations(priceVariationData);
                        data.push({
                            variant_name: priceVariantName,
                            combinations: priceResult,
                        });
                        processedVariants.add(priceVariantName);
                    }
                }

                // Process QUANTITY combinations (combined or single)
                if (formValues?.isCheckedQuantity && formValues?.quantities) {
                    if (isQuantityCombined) {
                        // Combined quantity variant
                        const quantityVariantNames = formValues?.quantities.split("and").map(v => v.trim());

                        // Check if this combined variant already exists in data
                        const existingCombined = data.find(d => d.variant_name === formValues?.quantities);
                        if (!existingCombined) {
                            const quantityCombinedData = handleCombinedVariants(quantityVariantNames, currentData);
                            data.push(...quantityCombinedData);
                        }
                        quantityVariantNames.forEach(v => processedVariants.add(v));
                    } else {
                        // Single quantity variant
                        const quantityVariantName = formValues?.quantities;

                        // Check if this single variant already exists in data
                        const existingSingle = data.find(d => d.variant_name === quantityVariantName);
                        if (!existingSingle) {
                            const quantityVariationData = currentData.filter((item) => item.name === quantityVariantName);
                            let quantityResult = generateCombinations(quantityVariationData);
                            data.push({
                                variant_name: quantityVariantName,
                                combinations: quantityResult,
                            });
                        }
                        processedVariants.add(quantityVariantName);
                    }
                }

                // Handle individual variations that are not part of any price/quantity variation
                const individualVariations = currentData.filter(item => !processedVariants.has(item.name));
                for (const item of individualVariations) {
                    let result = generateCombinations([item]);
                    data.push({
                        variant_name: item?.name,
                        combinations: result,
                    });
                }
            } else {
                // Both are single variants (no "and" in either)
                const priceVariantName = formValues?.prices;
                const quantityVariantName = formValues?.quantities;

                if (priceVariantName === quantityVariantName && formValues.isCheckedPrice && formValues.isCheckedQuantity) {
                    // Same variant for both price and quantity
                    const variationData = currentData.filter((item) => item.name === priceVariantName);
                    let result = generateCombinations(variationData);
                    data.push({
                        variant_name: priceVariantName,
                        combinations: result
                    });

                    // Handle remaining variations
                    const remainingVariations = currentData.filter(item => item.name !== priceVariantName);
                    for (const item of remainingVariations) {
                        let remainingResult = generateCombinations([item]);
                        data.push({
                            variant_name: item?.name,
                            combinations: remainingResult,
                        });
                    }
                } else {
                    // Different variants for price and quantity
                    const processed = new Set();

                    // Add price variant
                    if (formValues.isCheckedPrice && priceVariantName) {
                        const priceData = currentData.filter((item) => item.name === priceVariantName);
                        let priceResult = generateCombinations(priceData);
                        data.push({
                            variant_name: priceVariantName,
                            combinations: priceResult,
                        });
                        processed.add(priceVariantName);
                    }

                    // Add quantity variant (if different from price)
                    if (formValues.isCheckedQuantity && quantityVariantName && !processed.has(quantityVariantName)) {
                        const quantityData = currentData.filter((item) => item.name === quantityVariantName);
                        let quantityResult = generateCombinations(quantityData);
                        data.push({
                            variant_name: quantityVariantName,
                            combinations: quantityResult,
                        });
                        processed.add(quantityVariantName);
                    }

                    // Add remaining variations
                    const remainingVariations = currentData.filter(item => !processed.has(item.name));
                    for (const item of remainingVariations) {
                        let remainingResult = generateCombinations([item]);
                        data.push({
                            variant_name: item?.name,
                            combinations: remainingResult,
                        });
                    }
                }
            }
        } else {
            // No price/quantity variations enabled - generate all variations normally
            for (const item of currentData) {
                let result = generateCombinations([item]);
                data.push({
                    variant_name: item?.name,
                    combinations: result,
                });
            }
        }

        console.log("Generated combinations:", data);

        // Mark price/quantity variations properly
        const finalCombinationsData = markPriceQuantityVariations(data, formValues);
        setCombinations(finalCombinationsData);

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
    const handleOpenCustomVariantDialog = () => {
        setCustomVariantDialogOpen(true);
        setCustomVariantName("");
        setCustomVariantOptions([""]);
    };

    const handleCloseCustomVariantDialog = () => {
        setCustomVariantDialogOpen(false);
        setCustomVariantName("");
        setCustomVariantOptions([""]);
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

        // Add to custom variants list
        setCustomVariants(prev => [...prev, newCustomVariant]);

        // Close dialog and reset
        handleCloseCustomVariantDialog();

        // Auto-select the newly created variant
        setSelectedVariations([...selectedVariations, newCustomVariant.variant_name]);
        setSelectedVariant(newCustomVariant.variant_name);

        // Set attribute options for the new variant
        setAttrOptions(validOptions);
        setAttrValues({
            name: newCustomVariant.variant_name,
            values: [],
        });
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

    const handleDeleteVariation = (selectedVariantName) => {
        const currentData = variationsData || [];
        const updatedData = currentData.filter(variation => variation.name !== selectedVariantName);
        setVariationsData(updatedData);

        const variant = allVariants.find((item) => item.variant_name === selectedVariantName);
        const parentMainName = variant?.variant_name;
        const allAttributeValues = variant?.variant_attribute?.map((attr) => attr.attribute_value) || [];
        const allIds = variant?.variant_attribute.map((attr) => attr._id);

        setFormData({
            ParentMainId: formData.ParentMainId.filter((id) => id !== variant._id),
            varientName: formData.varientName.filter((id) => !allIds.includes(id)),
        });

        setSelectedVariations(
            (selectedVariations || []).filter(variation => variation !== selectedVariantName)
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
        setSelectedVariations(Array.from(new Set([...(selectedVariations || []), variantName])));
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
                                        {(variationsData || []).map((item, i) => (
                                            <Card key={i} sx={{
                                                marginBottom: '16px',
                                                border: '1px solid #e0e0e0',
                                                padding: '16px'
                                            }}>
                                                <Typography fontWeight={500}>{item?.name}</Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    {item?.values?.length || 0} options
                                                </Typography>
                                                <Box mt={1} display="flex" justifyContent="space-between"
                                                    alignItems="center">
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
                                                            onClick={() => handleDeleteVariation(item?.name)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            </Card>
                                        ))}
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
                                            const isSelected = (selectedVariations || []).includes(item?.variant_name);
                                            return (
                                                <Button
                                                    key={index}
                                                    variant="outlined"
                                                    sx={{
                                                        m: 0.5,
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
                                                    {isDisabled && !isSelected && " (Used in Parent)"}
                                                </Button>
                                            );
                                        })}
                                    </Box>
                                    <Box my={2}>
                                        <Button
                                            variant="outlined"
                                            onClick={handleOpenCustomVariantDialog}
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
                                            onClick={() => handleDeleteVariation(selectedVariant)}
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
                <DialogTitle>Add Custom Variant</DialogTitle>
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
                        Save Variant
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default VariantModal;
