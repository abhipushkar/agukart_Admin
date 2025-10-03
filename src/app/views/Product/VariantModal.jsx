import React from "react";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useState } from "react";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import BeenhereIcon from '@mui/icons-material/Beenhere';
import {
    TextField,
    Button,
    Autocomplete,
    Box,
    InputAdornment,
    CircularProgress,
    FormControlLabel,
    Checkbox,
    IconButton,
    FormControl,
    MenuItem,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    List,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip
} from "@mui/material";
import { useEffect } from "react";
import Card from "@mui/material/Card";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import Switch from "@mui/material/Switch";
import { color } from "highcharts";
import { set } from "lodash";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    maxWidth: '100%',
    width: '600px',
    bgcolor: "#fff",
    boxShadow: 24,
    p: 2,
    borderRadius: '6px',
    maxHeight: '500px',
    height: 'auto',
    overflowY: 'auto'
};

const buttonStyle = {
    borderRadius: '30px',
    padding: '5px 18px',
    color: '#000',
    '&:hover': { background: '#2c2c2c', color: '#fff' }
}

const label = { inputProps: { "aria-label": "Switch demo" } };

// Reorder function for drag and drop
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

const VariantModal = ({
                          show,
                          handleCloseVariant,
                          varientName,
                          combinations,
                          setCombinations,
                          setFormData,
                          formValues,
                          setFormValues,
                          variationsData,
                          setVariationsData,
                          selectedVariations,
                          setSelectedVariations,
                          selectedVariant,
                          setSelectedVariant,
                          showVariantList,
                          setShowVariantList,
                          attrValues,
                          setAttrValues,
                          isEdit,
                          setIsEdit,
                          attrOptions,
                          setAttrOptions
                      }) => {
    console.log(showVariantList, "showVariantList")

    const normalizeValues = (val) => {
        if (!val) return [];
        return Array.isArray(val) ? val : [val];
    };

    const [nameCombinations, setNameCombinations] = useState([]);
    const [customVariantDialogOpen, setCustomVariantDialogOpen] = useState(false);
    const [customVariantName, setCustomVariantName] = useState("");
    const [customAttributes, setCustomAttributes] = useState([""]);
    const [customVariants, setCustomVariants] = useState([]);
    const [newAttribute, setNewAttribute] = useState("");

    const handleTagHandler = (event, newValue) => {
        if (newValue == `Add All Options (${attrOptions?.length})`) {
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
        handleCloseVariant();
        setShowVariantList(false);
    };

    const handleApplyCancel = () => {
        handleCloseVariant();

        // Use variantId directly from variationsData instead of looking up by name
        const parentMainIds = variationsData.map(variation => variation.variantId).filter(Boolean);

        const allIds = variationsData
            .flatMap((variation) => {
                const variant = varientName.find((item) => item.id === variation.variantId) ||
                    customVariants.find((item) => item.id === variation.variantId);
                return variation?.values?.map(
                    (value) => variant?.variant_attribute.find((attr) => attr.attribute_value === value)?._id
                );
            })
            .filter(Boolean);

        setFormData((prev) => ({
            ...prev,
            ParentMainId: prev.ParentMainId.filter((id) => !parentMainIds.includes(id)),
            varientName: prev.varientName.filter((id) => !allIds.includes(id)),
        }));

        setShowVariantList(false);
        setSelectedVariant('');
        setSelectedVariations([]);
        setVariationsData([]);
        setCombinations([]);
        setFormValues({ prices: "", quantities: "", isCheckedPrice: false, isCheckedQuantity: false });
    };

    useEffect(() => {
        if (selectedVariant) {
            // Check both predefined variants and custom variants
            const data = varientName.filter((item) => item?.variant_name === selectedVariant);
            const customData = customVariants.filter((item) => item?.variant_name === selectedVariant);

            const allData = [...data, ...customData];
            const options = allData[0]?.variant_attribute.map((item) => item?.attribute_value);
            setAttrOptions(options);
        }
    }, [selectedVariant]);

    const handleDeleteVariation = (selectedVariantName) => {
        // Check both predefined and custom variants
        const variant = varientName.find((item) => item.variant_name === selectedVariantName) ||
            customVariants.find((item) => item.variant_name === selectedVariantName);
        const parentMainId = variant?.id;
        const allIds = variant?.variant_attribute.map((attr) => attr._id);

        setFormData((prev) => ({
            ...prev,
            ParentMainId: prev.ParentMainId.filter((id) => id !== parentMainId),
            varientName: prev.varientName.filter((id) => !allIds.includes(id)),
        }));
        setSelectedVariant("");
        setAttrValues({
            name: "",
            values: []
        });
        setVariationsData(prevVariationsData =>
            prevVariationsData.filter(variation => variation.name !== selectedVariant)
        );
        setSelectedVariations(prevSelectedVariations =>
            prevSelectedVariations.filter(variation => variation !== selectedVariant)
        );
        setFormValues({ prices: "", quantities: "", isCheckedPrice: false, isCheckedQuantity: false });
        setIsEdit(false);
        setAttrOptions([]);
        setCombinations([]);
        setShowVariantList(false);
    };

    // In handleDone function - update to store variantId
    const handleDone = () => {
        if (isEdit) {
            setVariationsData((prv) =>
                prv.map((item, i) => (item?.variantId === attrValues.variantId ? attrValues : item))
            );
        } else {
            // Find the variant in both predefined and custom variants to get its ID
            const variantData = varientName.find(item => item.variant_name === selectedVariant) ||
                customVariants.find(item => item.variant_name === selectedVariant);
            setVariationsData((prv) => [...prv, {
                ...attrValues,
                variantId: variantData?.id, // Store the variant ID
                name: selectedVariant
            }]);
        }
        setShowVariantList(false);
        setSelectedVariant("");
        setAttrValues({
            name: "",
            values: [],
            variantId: null // Initialize with variantId
        });
        setAttrOptions([]);
        setIsEdit(false);
    };

    const handleDeleteVariant = (variantId, index) => {
        // Use variantId directly instead of looking up by name
        const variant = varientName.find((item) => item.id === variantId) ||
            customVariants.find((item) => item.id === variantId);
        const parentMainId = variant?.id;
        const allIds = variant?.variant_attribute?.map((attr) => attr._id) || [];

        console.log({ parentMainId, allIds });
        setFormData((prev) => ({
            ...prev,
            ParentMainId: prev.ParentMainId.filter((id) => id !== parentMainId),
            varientName: prev.varientName.filter((id) => !allIds.includes(id)),
        }));

        const filterData = variationsData.filter((item, i) => i !== index);
        setVariationsData(filterData);
        const filterSelected = selectedVariations.filter((item) => item !== variant?.variant_name);
        setSelectedVariations(filterSelected);
        setFormValues({ prices: "", quantities: "", isCheckedPrice: false, isCheckedQuantity: false });
        setCombinations([]);
    };

    const handleEdit = (item) => {
        setShowVariantList(true);
        setSelectedVariant(item?.name);
        setAttrValues((prv) => ({ ...prv, name: item?.name, values: item?.values, variantId: item?.variantId }));
        setIsEdit(true);
    };

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        if (name === "isCheckedPrice" || name === "isCheckedQuantity") {
            setFormValues((prev) => ({ ...prev, [name]: checked }));
        } else {
            setFormValues((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Custom Variant Functions
    const handleOpenCustomVariantDialog = () => {
        setCustomVariantDialogOpen(true);
        setCustomVariantName("");
        setCustomAttributes([""]);
        setNewAttribute("");
    };

    const handleCloseCustomVariantDialog = () => {
        setCustomVariantDialogOpen(false);
        setCustomVariantName("");
        setCustomAttributes([""]);
        setNewAttribute("");
    };

    const handleAddNewAttribute = () => {
        if (newAttribute.trim()) {
            setCustomAttributes(prev => [...prev, newAttribute.trim()]);
            setNewAttribute("");
        }
    };

    const handleAttributeKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddNewAttribute();
        }
    };

    const handleRemoveAttribute = (index) => {
        setCustomAttributes(prev => prev.filter((_, i) => i !== index));
    };

    const handleMoveAttributeUp = (index) => {
        if (index > 0) {
            const newAttributes = [...customAttributes];
            [newAttributes[index], newAttributes[index - 1]] = [newAttributes[index - 1], newAttributes[index]];
            setCustomAttributes(newAttributes);
        }
    };

    const handleMoveAttributeDown = (index) => {
        if (index < customAttributes.length - 1) {
            const newAttributes = [...customAttributes];
            [newAttributes[index], newAttributes[index + 1]] = [newAttributes[index + 1], newAttributes[index]];
            setCustomAttributes(newAttributes);
        }
    };

    const handleSaveCustomVariant = () => {
        if (!customVariantName.trim()) {
            alert("Please enter a variant name");
            return;
        }

        const filteredAttributes = customAttributes.filter(attr => attr.trim() !== "");
        if (filteredAttributes.length < 2) {
            alert("Please add at least 2 attribute values");
            return;
        }

        // Create custom variant object
        const customVariant = {
            id: `custom-${Date.now()}`,
            variant_name: customVariantName.trim(),
            variant_attribute: filteredAttributes.map((attr, index) => ({
                _id: `custom-attr-${Date.now()}-${index}`,
                attribute_value: attr.trim(),
                main_images: [null, null, null],
                preview_image: null,
                thumbnail: null
            }))
        };

        // Add to custom variants
        setCustomVariants(prev => [...prev, customVariant]);

        // Auto-select this variant and add to selected variations
        setSelectedVariations(prev => [...prev, customVariant.variant_name]);
        setSelectedVariant(customVariant.variant_name);

        // Set attributes for selection
        setAttrValues(prev => ({
            ...prev,
            name: customVariant.variant_name,
            values: filteredAttributes
        }));

        // Close dialog
        handleCloseCustomVariantDialog();
    };

    // Combine predefined and custom variants for display
    const getAllVariants = () => {
        return [...varientName, ...customVariants];
    };

    // Drag and drop handlers
    const onDragEnd = (result, listType) => {
        if (!result.destination) {
            return;
        }

        if (listType === 'attributes') {
            const items = reorder(
                attrValues.values,
                result.source.index,
                result.destination.index
            );
            setAttrValues(prev => ({ ...prev, values: items }));
        } else if (listType === 'customAttributes') {
            const filteredAttributes = customAttributes.filter(attr => attr.trim() !== "");
            const items = reorder(
                filteredAttributes,
                result.source.index,
                result.destination.index
            );
            setCustomAttributes(items);
        }
    };

    // Function to move attribute values up/down in the selected list (fallback)
    const handleMoveValueUp = (index) => {
        if (index > 0) {
            const newValues = [...attrValues.values];
            [newValues[index], newValues[index - 1]] = [newValues[index - 1], newValues[index]];
            setAttrValues(prev => ({ ...prev, values: newValues }));
        }
    };

    const handleMoveValueDown = (index) => {
        if (index < attrValues.values.length - 1) {
            const newValues = [...attrValues.values];
            [newValues[index], newValues[index + 1]] = [newValues[index + 1], newValues[index]];
            setAttrValues(prev => ({ ...prev, values: newValues }));
        }
    };

    // UPDATED: generateCombinations function with image integration
    const generateCombinations = (data, variantName) => {
        const allVariants = getAllVariants();
        const allCombinations = data.reduce((acc, variation, index) => {
            const { name, values } = variation;
            const safeValues = Array.isArray(values) ? values : values ? [values] : []

            if (acc.length === 0) {
                return safeValues?.map((value) => {
                    const variantData = allVariants.find((variant) => variant.variant_name === name);
                    const attributeData = variantData?.variant_attribute.find((attr) => attr.attribute_value === value);

                    // Get images from the attribute data or fallback to null values
                    const main_images = attributeData?.main_images || [null, null, null];
                    const preview_image = attributeData?.preview_image || null;
                    const thumbnail = attributeData?.thumbnail || null;
                    const filteredId = attributeData?._id;

                    return {
                        [`value${index + 1}`]: value,
                        [`name${index + 1}`]: name,
                        combIds: [filteredId],
                        price: "",
                        qty: "",
                        isVisible: true,
                        priceInput: formValues?.prices,
                        quantityInput: formValues?.quantities,
                        isCheckedPrice: formValues?.isCheckedPrice,
                        isCheckedQuantity: formValues?.isCheckedQuantity,
                        main_images,
                        preview_image,
                        thumbnail
                    };
                });
            }

            return acc.flatMap((combination) =>
                values?.map((value) => {
                    const variantData = allVariants.find((variant) => variant.variant_name === name);
                    const attributeData = variantData?.variant_attribute.find((attr) => attr.attribute_value === value);

                    // Get images from the attribute data or fallback to null values
                    const main_images = attributeData?.main_images || [null, null, null];
                    const preview_image = attributeData?.preview_image || null;
                    const thumbnail = attributeData?.thumbnail || null;
                    const filteredId = attributeData?._id;

                    return {
                        ...combination,
                        [`value${index + 1}`]: value,
                        [`name${index + 1}`]: name,
                        combIds: [...(combination.combIds || []), filteredId],
                        price: "",
                        qty: "",
                        isVisible: true,
                        priceInput: formValues?.prices,
                        quantityInput: formValues?.quantities,
                        isCheckedPrice: formValues?.isCheckedPrice,
                        isCheckedQuantity: formValues?.isCheckedQuantity,
                        main_images,
                        preview_image,
                        thumbnail
                    };
                })
            );
        }, []);

        return allCombinations;
    };

    // UPDATED: transformCombinations function to preserve images
    const transformCombinations = (combinations) => {
        const nameValueMap = {};

        combinations.forEach((combination) => {
            Object.entries(combination).forEach(([key, value]) => {
                const nameMatch = key.match(/^name(\d+)$/);
                if (nameMatch) {
                    const valueKey = `value${nameMatch[1]}`;
                    const name = value;
                    const val = combination[valueKey];

                    if (!nameValueMap[name]) {
                        nameValueMap[name] = new Set();
                    }
                    nameValueMap[name].add(val);
                }
            });
        });

        setFormValues((prev) => ({
            ...prev,
            prices: combinations[0]?.priceInput,
            quantities: combinations[0]?.quantityInput,
            isCheckedPrice: combinations[0]?.isCheckedPrice,
            isCheckedQuantity: combinations[0]?.isCheckedQuantity
        }));

        const variationName1 = combinations[0]?.name1 || "";
        const variationName2 = combinations[0]?.name2 || "";

        const selectedVariations =
            variationName2.trim() !== ""
                ? [variationName1, variationName2]
                : [variationName1];

        setSelectedVariations(selectedVariations);

        // Create variations data while preserving images from the first matching combination
        const result = Object.entries(nameValueMap).map(([name, values]) => {
            // Find a combination that has this name to extract images
            const matchingCombination = combinations.find(comb =>
                comb.name1 === name || comb.name2 === name
            );

            return {
                name,
                values: Array.from(values),
                // Preserve image references if available
                main_images: matchingCombination?.main_images,
                preview_image: matchingCombination?.preview_image,
                thumbnail: matchingCombination?.thumbnail
            };
        });

        return result;
    };

    // Add this function to update combination names/attributes
    const updateCombinationNames = (combinations, varientName) => {
        const allVariants = getAllVariants();
        return combinations.map(combinationGroup => {
            // Find the current variant data by ID (more reliable than name)
            const currentVariant = allVariants.find(variant =>
                variant.variant_name === combinationGroup.variant_name ||
                variant.id === combinationGroup.variantId
            );

            if (!currentVariant) return combinationGroup; // Return unchanged if variant not found

            const updatedCombinations = combinationGroup.combinations.map(comb => {
                const updatedComb = { ...comb };

                // Update variant names and attribute values
                Object.keys(comb).forEach(key => {
                    if (key.startsWith('name')) {
                        const index = key.replace('name', '');
                        const valueKey = `value${index}`;

                        // Find the corresponding attribute in current variant data
                        const currentAttribute = currentVariant.variant_attribute.find(attr =>
                            attr.attribute_value === comb[valueKey] ||
                            attr._id === comb.combIds?.[index-1]
                        );

                        if (currentAttribute) {
                            // Update the name to current variant name
                            updatedComb[key] = currentVariant.variant_name;
                            // Update the value to current attribute value
                            updatedComb[valueKey] = currentAttribute.attribute_value;
                        }
                    }
                });

                return updatedComb;
            });

            return {
                ...combinationGroup,
                variant_name: currentVariant.variant_name, // Update the group name
                combinations: updatedCombinations
            };
        });
    };

    // UPDATED: handleGenerate function with image preservation
    const handleGenerate = async () => {
        let data = [];
        let index = 0;
        const existsPrice = variationsData.find(variation => variation.name == formValues?.prices)
        const existsQuantity = variationsData.find(variation => variation.name == formValues?.quantities)
        if ((formValues?.isCheckedPrice || formValues?.isCheckedQuantity) && (formValues?.prices || formValues?.quantities)) {
            if (existsPrice && existsQuantity) {
                for (const item of variationsData) {
                    let result = await generateCombinations([item], varientName);
                    data.push({
                        variant_name: item?.name,
                        combinations: result,
                        // Pass through any existing images from the variation data
                        main_images: item?.main_images,
                        preview_image: item?.preview_image,
                        thumbnail: item?.thumbnail
                    });
                }
            } else {
                if (formValues?.prices == formValues?.quantities && formValues.isCheckedPrice && formValues.isCheckedQuantity) {
                    const variants = formValues?.prices.split("and").map(price => price.trim());
                    const variationData = variationsData.filter((item) => variants.includes(item.name));
                    let result = await generateCombinations(variationData, varientName);
                    data.push({
                        variant_name: formValues?.prices || formValues?.quantities,
                        combinations: result
                    });
                    if (variationsData.length > 2) {
                        let variationData = variationsData.filter((item) => !variants.includes(item.name));
                        let result = await generateCombinations(variationData, varientName);
                        data.push({
                            variant_name: variationData[0].name,
                            combinations: result
                        });
                    }
                }
                else {
                    if (formValues?.prices == existsPrice?.name) {
                        if (formValues.isCheckedPrice) {
                            let variationData = variationsData.filter((item) => item.name == formValues?.prices);
                            let result = await generateCombinations(variationData, varientName);
                            data.push({
                                variant_name: formValues?.prices,
                                combinations: result
                            });
                        }
                        if (formValues.isCheckedQuantity) {
                            const variants = formValues?.quantities.split("and").map(qty => qty.trim());
                            let variationData = variationsData.filter((item) => variants.includes(item.name));
                            let result = await generateCombinations(variationData, varientName);
                            data.push({
                                variant_name: formValues?.quantities,
                                combinations: result
                            });
                            if (!formValues.isCheckedPrice && variationsData.length > 2) {
                                let variationData = variationsData.filter((item) => !variants.includes(item.name));
                                console.log(variationData, "variationData");
                                let result = await generateCombinations(variationData, varientName);
                                data.push({
                                    variant_name: variationData[0].name,
                                    combinations: result
                                });
                            }
                        }
                        if (formValues.isCheckedPrice && formValues.isCheckedQuantity && variationsData.length > 2) {
                            const variants = formValues?.quantities.split("and").map(qty => qty.trim());
                            variants.push(formValues?.prices);
                            let variationData = variationsData.filter((item) => !variants.includes(item.name));
                            if (variationData.length > 0) {
                                let result = await generateCombinations(variationData, varientName);
                                data.push({
                                    variant_name: variationData[0].name,
                                    combinations: result
                                });
                            }
                        }
                    } else if (formValues?.prices.includes("and") && formValues?.quantities.includes("and")) {
                        if (formValues.isCheckedPrice) {
                            const variants = formValues?.prices.split("and").map(price => price.trim());
                            let variationData = variationsData.filter((item) => variants.includes(item.name));
                            let result = await generateCombinations(variationData, varientName);
                            data.push({
                                variant_name: formValues?.prices,
                                combinations: result
                            });
                        }
                        if (formValues.isCheckedQuantity) {
                            const variants2 = formValues?.quantities.split("and").map(qty => qty.trim());
                            let variationData = variationsData.filter((item) => variants2.includes(item.name));
                            let result = await generateCombinations(variationData, varientName);
                            data.push({
                                variant_name: formValues?.quantities,
                                combinations: result
                            });
                        }
                    } else {
                        if (formValues.isCheckedPrice) {
                            const variants = formValues?.prices.split("and").map(price => price.trim());
                            let variationData = variationsData.filter((item) => variants.includes(item.name));
                            let result = await generateCombinations(variationData, varientName);
                            data.push({
                                variant_name: formValues?.prices,
                                combinations: result
                            });
                            if (!formValues.isCheckedQuantity && variationsData.length > 2) {
                                let variationData = variationsData.filter((item) => !variants.includes(item.name));
                                console.log(variationData, "variationData");
                                let result = await generateCombinations(variationData, varientName);
                                data.push({
                                    variant_name: variationData[0].name,
                                    combinations: result
                                });
                            }
                        }
                        if (formValues.isCheckedQuantity) {
                            let variationData = variationsData.filter((item) => item.name == formValues?.quantities);
                            let result = await generateCombinations(variationData, varientName);
                            data.push({
                                variant_name: formValues?.quantities,
                                combinations: result
                            });
                        }
                        if (formValues.isCheckedPrice && formValues.isCheckedQuantity && variationsData.length > 2) {
                            const variants = formValues?.prices?.split("and").map(price => price.trim());
                            variants.push(formValues?.quantities);
                            let variationData = variationsData.filter((item) => !variants.includes(item.name));
                            if (variationData.length > 0) {
                                let result = await generateCombinations(variationData, varientName);
                                data.push({
                                    variant_name: variationData[0].name,
                                    combinations: result
                                });
                            }
                        }
                    }
                }
            }
        } else {
            for (const item of variationsData) {
                let result = await generateCombinations([item], varientName);
                data.push({
                    variant_name: item?.name,
                    combinations: result,
                    // Pass through any existing images from the variation data
                    main_images: item?.main_images,
                    preview_image: item?.preview_image,
                    thumbnail: item?.thumbnail
                });
            }
        }
        setCombinations(data);

        const allVariants = getAllVariants();
        const parentMainIds = variationsData.map(variation => variation.variantId).filter(Boolean);

        const allIds = variationsData
            .flatMap((variation) => {
                const variant = allVariants.find((item) => item.id === variation.variantId);
                const safeValues = normalizeValues(variation.values);

                return safeValues.map(
                    (value) => variant?.variant_attribute.find((attr) => attr.attribute_value === value)?._id
                );
            })
            .filter(Boolean);

        setFormData((prev) => ({
            ...prev,
            ParentMainId: Array.from(new Set([...prev.ParentMainId, ...parentMainIds])),
            varientName: Array.from(new Set([...prev.varientName, ...allIds]))
        }));

        handleCloseVariant();
    };

    useEffect(() => {
        if (combinations?.length > 0 && variationsData?.length <= 0) {
            const result = transformCombinations(combinations);
            setVariationsData(result);
        }
    }, [combinations]);

    const handleTagDelete = (option) => {
        setAttrValues((prv) => ({ ...prv, values: prv.values.filter((item) => item !== option) }));
    }

    const generateNameCombinations = () => {
        const names = variationsData.map(item => item.name);
        const combinations = [...names];
        for (let i = 0; i < names.length; i++) {
            for (let j = i + 1; j < names.length; j++) {
                combinations.push(`${names[i]} and ${names[j]}`);
            }
        }
        setNameCombinations(combinations);
        if (!formValues?.prices && !formValues?.quantities) {
            setFormValues((prv) => ({
                ...prv,
                prices: combinations[0],
                quantities: combinations[0]
            }));
        }
    };
    useEffect(() => {
        if (variationsData?.length > 1) {
            generateNameCombinations();
        }
    }, [variationsData]);

    return (
        <div>
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
                {!showVariantList ? (
                    <Box sx={style} onClick={(e) => e.stopPropagation()}>
                        <Typography id="modal-modal-title" fontWeight={500} variant="h5" mb={2}>
                            Manage Variations
                        </Typography>
                        {variationsData?.length > 0 && (
                            <Box>
                                {variationsData?.map((item, i) => (
                                    <Card key={i} sx={{ marginBottom: '16px', border: '1px solid #9f9f9f', boxShadow: '0 0 3px #d3d3d3', padding: '20px' }}>
                                        <Typography fontWeight={500}>{item?.name}</Typography>
                                        <Typography>{item?.values?.length}</Typography>
                                        <Box mt={1} display={{ lg: 'flex', md: 'flex', xs: 'block' }} justifyContent="space-between" alignItems={"center"}>
                                            <Box>
                                                {Array.isArray(item?.values) ? item.values?.map((data, valueIndex) => (
                                                    <Typography
                                                        display={"inline-block"}
                                                        m={1}
                                                        sx={{ padding: '2px 12px', border: '1px solid #c2c2c2', borderRadius: '8px' }}
                                                        key={valueIndex}
                                                    >
                                                        {data}
                                                    </Typography>
                                                )) : null}
                                            </Box>
                                            <Box display="flex" alignContent="center" justifyContent={"end"} mt={{ lg: 0, md: 0, xs: 2 }}>
                                                <Button
                                                    sx={{ ...buttonStyle, ...{ backgroundColor: "lightgrey", marginRight: '4px', borderRadius: '50%', minWidth: 'auto', width: '40px', height: '40px' } }}
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    <ModeEditIcon />
                                                </Button>
                                                <Button
                                                    sx={{ ...buttonStyle, ...{ backgroundColor: "lightgrey", borderRadius: '50%', minWidth: 'auto', width: '40px', height: '40px' } }}
                                                    onClick={() => handleDeleteVariant(item?.variantId, i)} // Pass variantId instead of name
                                                >
                                                    <DeleteIcon />
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Card>
                                ))}
                            </Box>
                        )}
                        {variationsData?.length < 3 && (
                            <Box display="flex" gap={1} flexDirection="column">
                                <Button variant="outlined" sx={{ fontSize: '13px', fontWeight: 500, borderRadius: '30px', color: '#000', borderColor: '#000' }} onClick={() => setShowVariantList(true)}>
                                    <AddIcon sx={{ fontSize: '21px' }} />Add a Predefined Variation
                                </Button>
                                <Button variant="outlined" sx={{ fontSize: '13px', fontWeight: 500, borderRadius: '30px', color: '#000', borderColor: '#000' }} onClick={handleOpenCustomVariantDialog}>
                                    <AddIcon sx={{ fontSize: '21px' }} />Add a Custom Variation
                                </Button>
                            </Box>
                        )}
                        {variationsData?.length > 0 && (
                            <Box py={1} sx={{ borderTop: '1px solid #e0e0e0', marginTop: '18px' }}>
                                <Box>
                                    <Switch
                                        {...label}
                                        name="isCheckedPrice"
                                        checked={formValues?.isCheckedPrice}
                                        onChange={handleChange}
                                    />{" "}
                                    Prices vary for each
                                    {formValues?.isCheckedPrice && variationsData?.length > 1 && (
                                        <FormControl fullWidth sx={{ margin: '12px 0' }}>
                                            <TextField
                                                select
                                                sx={{
                                                    "& .MuiInputBase-root": {
                                                        height: "40px"
                                                    },
                                                    "& .MuiFormLabel-root": {
                                                        top: "-7px"
                                                    }
                                                }}
                                                label="Select Category"
                                                labelId="pib"
                                                id="pibb"
                                                value={formValues?.prices}
                                                defaultValue={formValues?.prices}
                                                name="prices"
                                                onChange={handleChange}
                                            >
                                                {
                                                    nameCombinations?.map((item, index) => (
                                                        <MenuItem
                                                            key={index}
                                                            value={item}
                                                        >
                                                            {item}
                                                        </MenuItem>
                                                    ))
                                                }
                                            </TextField>
                                        </FormControl>
                                    )}
                                </Box>
                                <Box>
                                    <Switch
                                        {...label}
                                        name="isCheckedQuantity"
                                        checked={formValues?.isCheckedQuantity}
                                        onChange={handleChange}
                                    />{" "}
                                    Quantities vary
                                    {formValues?.isCheckedQuantity && variationsData?.length > 1 && (
                                        <FormControl fullWidth sx={{ margin: '12px 0' }}>
                                            <TextField
                                                select
                                                sx={{
                                                    "& .MuiInputBase-root": {
                                                        height: "40px"
                                                    },
                                                    "& .MuiFormLabel-root": {
                                                        top: "-7px"
                                                    }
                                                }}
                                                label="Select Category"
                                                labelId="pib"
                                                id="pibb"
                                                value={formValues?.quantities}
                                                defaultValue={formValues?.quantities}
                                                name="quantities"
                                                onChange={handleChange}
                                            >
                                                {
                                                    nameCombinations?.map((item, index) => (
                                                        <MenuItem
                                                            key={index}
                                                            value={item}
                                                        >
                                                            {item}
                                                        </MenuItem>
                                                    ))
                                                }
                                            </TextField>
                                        </FormControl>
                                    )}
                                </Box>
                            </Box>
                        )}
                        <Box textAlign={"center"} py={3}>
                            {variationsData?.length <= 0 && <BeenhereIcon sx={{ fontSize: '55px' }} />}
                            {variationsData?.length <= 0 && (
                                <Typography
                                    id="modal-modal-description"
                                    variant="h6"
                                    fontWeight={500}
                                    textAlign="center"
                                >
                                    You don't have any variations
                                </Typography>
                            )}
                            {variationsData?.length <= 0 && (
                                <Typography textAlign="center">
                                    Use variations if your item is offered in different <br /> colours, size, materials, etc.
                                </Typography>
                            )}
                        </Box>
                        <Box display="flex" justifyContent="space-between" mt={4}>
                            <Button sx={buttonStyle} onClick={() => handleApplyCancel()}>Cancel</Button>
                            <Button variant="contained" sx={{ ...buttonStyle, ...{ background: '#000', color: '#fff' } }} onClick={handleGenerate}>
                                Apply
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={style} onClick={(e) => e.stopPropagation()}>
                        {!selectedVariant ? (
                            <>
                                <Typography id="modal-modal-title" variant="h5">
                                    What type of variation is it?
                                </Typography>
                                <Typography mt={1}>
                                    You can add upto 2 variations. Use the variation types listed here for peak
                                    discoverability.
                                </Typography>

                                {/* Predefined Variants Section */}
                                {varientName.length > 0 && (
                                    <Box mt={3}>
                                        <Typography variant="h6" gutterBottom>
                                            Predefined Variants
                                        </Typography>
                                        <Box my={2}>
                                            {varientName.map((item, index) => (
                                                <Button
                                                    key={index}
                                                    variant="contained"
                                                    sx={{
                                                        backgroundColor: "lightgrey",
                                                        color: "black",
                                                        borderRadius: "50px",
                                                        marginRight: "10px",
                                                        marginBottom: "10px",
                                                        '&:hover': { background: '#000', color: '#fff' }
                                                    }}
                                                    onClick={() => {
                                                        setSelectedVariations([...selectedVariations, item?.variant_name]);
                                                        setSelectedVariant(item?.variant_name);
                                                    }}
                                                    disabled={selectedVariations.includes(item?.variant_name)}
                                                >
                                                    {selectedVariations.includes(item?.variant_name) && <CheckIcon />}{" "}
                                                    {item?.variant_name}
                                                </Button>
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                {/* Custom Variants Section */}
                                {customVariants.length > 0 && (
                                    <Box mt={3}>
                                        <Typography variant="h6" gutterBottom>
                                            Custom Variants
                                        </Typography>
                                        <Box my={2}>
                                            {customVariants.map((item, index) => (
                                                <Button
                                                    key={index}
                                                    variant="contained"
                                                    sx={{
                                                        backgroundColor: "#e3f2fd",
                                                        color: "black",
                                                        borderRadius: "50px",
                                                        marginRight: "10px",
                                                        marginBottom: "10px",
                                                        border: "1px solid #2196f3",
                                                        '&:hover': { background: '#1976d2', color: '#fff' }
                                                    }}
                                                    onClick={() => {
                                                        setSelectedVariations([...selectedVariations, item?.variant_name]);
                                                        setSelectedVariant(item?.variant_name);
                                                    }}
                                                    disabled={selectedVariations.includes(item?.variant_name)}
                                                >
                                                    {selectedVariations.includes(item?.variant_name) && <CheckIcon />}{" "}
                                                    {item?.variant_name}
                                                </Button>
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                <Button
                                    variant="outlined"
                                    sx={{
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        borderRadius: '30px',
                                        color: '#000',
                                        borderColor: '#000',
                                        mb: 2,
                                        mt: 2
                                    }}
                                    onClick={handleOpenCustomVariantDialog}
                                >
                                    <AddIcon sx={{ fontSize: '21px' }} />Add Custom Variation
                                </Button>
                                <br />
                                <Button mt={2} sx={buttonStyle} onClick={handleCancel}>
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <>
                                <Typography id="modal-modal-title" fontWeight={500} variant="h5">
                                    {selectedVariant}
                                </Typography>
                                <Typography fontSize={11}>Variation</Typography>
                                <Typography id="modal-modal-title" variant="h6" mt={2}>
                                    Options {attrValues?.values?.length}
                                </Typography>
                                <Typography>
                                    Buyers can choose from the following options. Use the options listed here for peak
                                    discoverability. Buyers won't see custom options in filters.
                                </Typography>
                                <Box my={3}>
                                    {/* Dropdown Component for predefined variants */}
                                    {varientName.find(item => item.variant_name === selectedVariant) ? (
                                        <Autocomplete
                                            multiple
                                            id="dropdown-with-list"
                                            true
                                            disableCloseOnSelect
                                            options={[...attrOptions, `Add All Options (${attrOptions?.length})`]}
                                            getOptionLabel={(option) => option}
                                            value={[]}
                                            onChange={(event, newValue) => {
                                                handleTagHandler(event, newValue);
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Enter an option..."
                                                    placeholder="Enter an option..."
                                                    sx={{
                                                        "& .MuiInputBase-root": {
                                                            padding: "0 11px",
                                                        },
                                                        "& .MuiFormLabel-root": {
                                                            top: "-7px",
                                                        },
                                                    }}
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
                                                                backgroundColor: isSelected
                                                                    ? "rgba(0, 123, 255, 0.3)"
                                                                    : "rgba(0, 0, 0, 0.04)",
                                                            },
                                                        }}
                                                    >
                                                        <ListItemText primary={option} />
                                                        {isSelected && <CheckIcon color="primary" />}
                                                    </ListItem>
                                                );
                                            }}
                                        />
                                    ) : (
                                        /* Text input for custom variants */
                                        <Box>
                                            <TextField
                                                fullWidth
                                                label="Add new attribute"
                                                value={newAttribute}
                                                onChange={(e) => setNewAttribute(e.target.value)}
                                                onKeyPress={handleAttributeKeyPress}
                                                placeholder="Enter attribute value and press Enter"
                                                sx={{
                                                    "& .MuiInputBase-root": {
                                                        padding: "0 11px",
                                                    },
                                                    "& .MuiFormLabel-root": {
                                                        top: "-7px",
                                                    },
                                                }}
                                            />
                                            <Button
                                                onClick={handleAddNewAttribute}
                                                sx={{ mt: 1 }}
                                                disabled={!newAttribute.trim()}
                                            >
                                                Add Attribute
                                            </Button>
                                        </Box>
                                    )}

                                    {/* Selected Attributes List with Drag and Drop */}
                                    {attrValues.values.length > 0 && (
                                        <Box mt={3}>
                                            <Typography variant="subtitle1" gutterBottom>
                                                Selected Attributes (Drag to reorder):
                                            </Typography>
                                            <DragDropContext onDragEnd={(result) => onDragEnd(result, 'attributes')}>
                                                <Droppable droppableId="attributes">
                                                    {(provided) => (
                                                        <List {...provided.droppableProps} ref={provided.innerRef}>
                                                            {attrValues.values.map((option, index) => (
                                                                <Draggable key={option} draggableId={option} index={index}>
                                                                    {(provided, snapshot) => (
                                                                        <ListItem
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            sx={{
                                                                                border: "1px solid #e0e0e0",
                                                                                borderRadius: "8px",
                                                                                marginBottom: "8px",
                                                                                padding: "8px 16px",
                                                                                backgroundColor: snapshot.isDragging ? "#e3f2fd" : "#fafafa",
                                                                                transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                                                                                transition: 'all 0.2s ease',
                                                                                boxShadow: snapshot.isDragging ? '0 4px 8px rgba(0,0,0,0.2)' : 'none'
                                                                            }}
                                                                            secondaryAction={
                                                                                <Box display="flex" gap={1}>
                                                                                    <IconButton
                                                                                        size="small"
                                                                                        onClick={() => handleTagDelete(option)}
                                                                                        color="error"
                                                                                    >
                                                                                        <DeleteIcon fontSize="small" />
                                                                                    </IconButton>
                                                                                </Box>
                                                                            }
                                                                        >
                                                                            <div {...provided.dragHandleProps}>
                                                                                <DragHandleIcon sx={{ mr: 2, color: 'gray', cursor: 'grab' }} />
                                                                            </div>
                                                                            <ListItemText
                                                                                primary={
                                                                                    <Typography>
                                                                                        {option}
                                                                                    </Typography>
                                                                                }
                                                                            />
                                                                        </ListItem>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}
                                                        </List>
                                                    )}
                                                </Droppable>
                                            </DragDropContext>
                                        </Box>
                                    )}
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Button sx={buttonStyle} onClick={() => {
                                        setSelectedVariant('');
                                        setAttrValues({
                                            name: "",
                                            values: []
                                        });
                                        setAttrOptions([]);
                                        setNewAttribute("");
                                    }}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="contained"
                                        sx={{ ...buttonStyle, ...{ background: '#000', color: '#fff' } }}
                                        onClick={handleDone}
                                        disabled={attrValues.values.length < 2}
                                    >
                                        Done
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Box>
                )}
            </Modal>

            {/* Custom Variant Dialog */}
            <Dialog open={customVariantDialogOpen} onClose={handleCloseCustomVariantDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Add Custom Variation</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Variation Name"
                        value={customVariantName}
                        onChange={(e) => setCustomVariantName(e.target.value)}
                        margin="normal"
                        placeholder="e.g., Style, Pattern, Finish, etc."
                    />
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                        Add Attribute Values (Minimum 2 required)
                    </Typography>

                    {/* Text input for adding new attributes */}
                    <Box display="flex" gap={1} mb={2}>
                        <TextField
                            fullWidth
                            label="Add attribute value"
                            value={newAttribute}
                            onChange={(e) => setNewAttribute(e.target.value)}
                            onKeyPress={handleAttributeKeyPress}
                            placeholder="Enter attribute value and press Enter"
                        />
                        <Button
                            onClick={handleAddNewAttribute}
                            disabled={!newAttribute.trim()}
                            variant="outlined"
                            sx={{ minWidth: 'auto' }}
                        >
                            <AddIcon />
                        </Button>
                    </Box>

                    {/* List of added attributes with Drag and Drop */}
                    {customAttributes.filter(attr => attr.trim() !== "").length > 0 && (
                        <Box mt={2}>
                            <Typography variant="subtitle2" gutterBottom>
                                Added Attributes (Drag to reorder):
                            </Typography>
                            <DragDropContext onDragEnd={(result) => onDragEnd(result, 'customAttributes')}>
                                <Droppable droppableId="customAttributes">
                                    {(provided) => (
                                        <List {...provided.droppableProps} ref={provided.innerRef}>
                                            {customAttributes.filter(attr => attr.trim() !== "").map((attribute, index) => (
                                                <Draggable key={attribute} draggableId={attribute} index={index}>
                                                    {(provided, snapshot) => (
                                                        <ListItem
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            sx={{
                                                                border: "1px solid #e0e0e0",
                                                                borderRadius: "8px",
                                                                marginBottom: "8px",
                                                                padding: "8px 16px",
                                                                backgroundColor: snapshot.isDragging ? "#e3f2fd" : "#fafafa",
                                                                transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                                                                transition: 'all 0.2s ease',
                                                                boxShadow: snapshot.isDragging ? '0 4px 8px rgba(0,0,0,0.2)' : 'none'
                                                            }}
                                                            secondaryAction={
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleRemoveAttribute(index)}
                                                                    color="error"
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            }
                                                        >
                                                            <div {...provided.dragHandleProps}>
                                                                <DragHandleIcon sx={{ mr: 2, color: 'gray', cursor: 'grab' }} />
                                                            </div>
                                                            <ListItemText primary={attribute} />
                                                        </ListItem>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </List>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCustomVariantDialog}>Cancel</Button>
                    <Button
                        onClick={handleSaveCustomVariant}
                        variant="contained"
                        disabled={!customVariantName.trim() || customAttributes.filter(attr => attr.trim() !== "").length < 2}
                    >
                        Save Variation
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default VariantModal;
