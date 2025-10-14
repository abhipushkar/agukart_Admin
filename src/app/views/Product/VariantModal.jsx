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
    DialogActions
} from "@mui/material";
import { useEffect } from "react";
import Card from "@mui/material/Card";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import Switch from "@mui/material/Switch";

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
    const [customVariantOptions, setCustomVariantOptions] = useState([""]);
    const [customVariants, setCustomVariants] = useState([]);

    // Function to open custom variant dialog
    const handleOpenCustomVariantDialog = () => {
        setCustomVariantDialogOpen(true);
        setCustomVariantName("");
        setCustomVariantOptions([""]);
    };

    // Function to close custom variant dialog
    // Function to close custom variant dialog
    const handleCloseCustomVariantDialog = () => {
        setCustomVariantDialogOpen(false);
        setCustomVariantName("");
        setCustomVariantOptions([""]);
    };

    // Function to add new option field
    const handleAddOption = () => {
        setCustomVariantOptions([...customVariantOptions, ""]);
    };

    // Function to remove option field
    const handleRemoveOption = (index) => {
        if (customVariantOptions.length > 1) {
            const newOptions = customVariantOptions.filter((_, i) => i !== index);
            setCustomVariantOptions(newOptions);
        }
    };

    // Function to update option value
    const handleOptionChange = (index, value) => {
        const newOptions = [...customVariantOptions];
        newOptions[index] = value;
        setCustomVariantOptions(newOptions);
    };

    // Function to save custom variant - UPDATED: No ID generation for custom variants
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

        // Create custom variant object - NO IDs for custom variants
        const newCustomVariant = {
            variant_name: customVariantName.trim(),
            variant_attribute: validOptions.map((option) => ({
                // No _id for custom attributes - backend will handle this
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
            // Remove variantId - we'll use name as identifier until backend provides IDs
        });
    };

    // Combine predefined variants with custom variants
    const allVariants = [...varientName, ...customVariants];

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
        // handleCloseVariant();
        setShowVariantList(false);
    };

    const handleApplyCancel = () => {
        handleCloseVariant();

        // Use variant names as identifiers since we don't have backend IDs yet
        const parentMainNames = variationsData.map(variation => variation.name).filter(Boolean);

        const allAttributeValues = variationsData
            .flatMap((variation) => {
                const variant = allVariants.find((item) => item.variant_name === variation.name);
                return variation?.values?.map(
                    (value) => variant?.variant_attribute.find((attr) => attr.attribute_value === value)?.attribute_value
                );
            })
            .filter(Boolean);

        setFormData((prev) => ({
            ...prev,
            // Filter by name instead of ID since we don't have backend IDs for custom variants
            ParentMainId: prev.ParentMainId.filter((id) => !parentMainNames.includes(id)),
            varientName: prev.varientName.filter((name) => !allAttributeValues.includes(name)),
        }));

        setShowVariantList(false);
        // setSelectedVariant('');
        // setSelectedVariations([]);
        // setVariationsData([]);
        // setCombinations([]);
        // setFormValues({ prices: "", quantities: "", isCheckedPrice: false, isCheckedQuantity: false });
    };

    useEffect(() => {
        if (selectedVariant) {
            const data = allVariants.filter((item) => item?.variant_name === selectedVariant);
            const options = data[0]?.variant_attribute.map((item) => item?.attribute_value);
            setAttrOptions(options);
        }
    }, [selectedVariant]);

    const handleDeleteVariation = (selectedVariantName) => {
        const variant = allVariants.find((item) => item.variant_name === selectedVariantName);
        const parentMainName = variant.variant_name;
        const allAttributeValues = variant?.variant_attribute.map((attr) => attr.attribute_value);

        setFormData((prev) => ({
            ...prev,
            // Use name as identifier for custom variants
            ParentMainId: prev.ParentMainId.filter((id) => id !== parentMainName),
            varientName: prev.varientName.filter((name) => !allAttributeValues.includes(name)),
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
        // setAttrOptions([]);
        // setCombinations([]);
        setShowVariantList(false);
    };

    // In handleDone function - updated to use name as identifier
    const handleDone = () => {
        if (isEdit) {
            setVariationsData((prv) =>
                prv.map((item, i) => (item?.name === attrValues.name ? attrValues : item))
            );
        } else {
            setVariationsData((prv) => [...prv, {
                ...attrValues,
                name: selectedVariant
            }]);
        }
        setShowVariantList(false);
        setSelectedVariant("");
        setAttrValues({
            name: "",
            values: []
        });
        setAttrOptions([]);
        setIsEdit(false);
    };

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

    // UPDATED: generateCombinations function to work with names instead of IDs
    const generateCombinations = (data, variantName) => {
        const allCombinations = data.reduce((acc, variation, index) => {
            const { name, values } = variation;
            const safeValues = Array.isArray(values) ? values : values ? [values] : []

            if (acc.length === 0) {
                return safeValues?.map((value) => {
                    const variantData = variantName.find((variant) => variant.variant_name === name);
                    const attributeData = variantData?.variant_attribute.find((attr) => attr.attribute_value === value);

                    // Get images from the attribute data or fallback to null values
                    const main_images = attributeData?.main_images || [null, null, null];
                    const preview_image = attributeData?.preview_image || null;
                    const thumbnail = attributeData?.thumbnail || null;

                    return {
                        [`value${index + 1}`]: value,
                        [`name${index + 1}`]: name,
                        // Store attribute value instead of ID for custom variants
                        combValues: [value],
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
                    const variantData = variantName.find((variant) => variant.variant_name === name);
                    const attributeData = variantData?.variant_attribute.find((attr) => attr.attribute_value === value);

                    // Get images from the attribute data or fallback to null values
                    const main_images = attributeData?.main_images || [null, null, null];
                    const preview_image = attributeData?.preview_image || null;
                    const thumbnail = attributeData?.thumbnail || null;

                    return {
                        ...combination,
                        [`value${index + 1}`]: value,
                        [`name${index + 1}`]: name,
                        // Store attribute value instead of ID
                        combValues: [...(combination.combValues || []), value],
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

    // UPDATED: handleGenerate function - EXCLUDE custom variants from FormData
    const handleGenerate = async () => {
        let data = [];
        let index = 0;
        const existsPrice = variationsData.find(variation => variation.name == formValues?.prices)
        const existsQuantity = variationsData.find(variation => variation.name == formValues?.quantities)
        if ((formValues?.isCheckedPrice || formValues?.isCheckedQuantity) && (formValues?.prices || formValues?.quantities)) {
            if (existsPrice && existsQuantity) {
                for (const item of variationsData) {
                    let result = await generateCombinations([item], allVariants);
                    data.push({
                        variant_name: item?.name,
                        combinations: result,
                        main_images: item?.main_images,
                        preview_image: item?.preview_image,
                        thumbnail: item?.thumbnail
                    });
                }
            } else {
                if (formValues?.prices == formValues?.quantities && formValues.isCheckedPrice && formValues.isCheckedQuantity) {
                    const variants = formValues?.prices.split("and").map(price => price.trim());
                    const variationData = variationsData.filter((item) => variants.includes(item.name));
                    let result = await generateCombinations(variationData, allVariants);
                    data.push({
                        variant_name: formValues?.prices || formValues?.quantities,
                        combinations: result
                    });
                    if (variationsData.length > 2) {
                        let variationData = variationsData.filter((item) => !variants.includes(item.name));
                        let result = await generateCombinations(variationData, allVariants);
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
                            let result = await generateCombinations(variationData, allVariants);
                            data.push({
                                variant_name: formValues?.prices,
                                combinations: result
                            });
                        }
                        if (formValues.isCheckedQuantity) {
                            const variants = formValues?.quantities.split("and").map(qty => qty.trim());
                            let variationData = variationsData.filter((item) => variants.includes(item.name));
                            let result = await generateCombinations(variationData, allVariants);
                            data.push({
                                variant_name: formValues?.quantities,
                                combinations: result
                            });
                            if (!formValues.isCheckedPrice && variationsData.length > 2) {
                                let variationData = variationsData.filter((item) => !variants.includes(item.name));
                                console.log(variationData, "variationData");
                                let result = await generateCombinations(variationData, allVariants);
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
                                let result = await generateCombinations(variationData, allVariants);
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
                            let result = await generateCombinations(variationData, allVariants);
                            data.push({
                                variant_name: formValues?.prices,
                                combinations: result
                            });
                        }
                        if (formValues.isCheckedQuantity) {
                            const variants2 = formValues?.quantities.split("and").map(qty => qty.trim());
                            let variationData = variationsData.filter((item) => variants2.includes(item.name));
                            let result = await generateCombinations(variationData, allVariants);
                            data.push({
                                variant_name: formValues?.quantities,
                                combinations: result
                            });
                        }
                    } else {
                        if (formValues.isCheckedPrice) {
                            const variants = formValues?.prices.split("and").map(price => price.trim());
                            let variationData = variationsData.filter((item) => variants.includes(item.name));
                            let result = await generateCombinations(variationData, allVariants);
                            data.push({
                                variant_name: formValues?.prices,
                                combinations: result
                            });
                            if (!formValues.isCheckedQuantity && variationsData.length > 2) {
                                let variationData = variationsData.filter((item) => !variants.includes(item.name));
                                console.log(variationData, "variationData");
                                let result = await generateCombinations(variationData, allVariants);
                                data.push({
                                    variant_name: variationData[0].name,
                                    combinations: result
                                });
                            }
                        }
                        if (formValues.isCheckedQuantity) {
                            let variationData = variationsData.filter((item) => item.name == formValues?.quantities);
                            let result = await generateCombinations(variationData, allVariants);
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
                                let result = await generateCombinations(variationData, allVariants);
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
                let result = await generateCombinations([item], allVariants);
                data.push({
                    variant_name: item?.name,
                    combinations: result,
                    main_images: item?.main_images,
                    preview_image: item?.preview_image,
                    thumbnail: item?.thumbnail
                });
            }
        }
        setCombinations(data);

        // UPDATED: Only include predefined variants in FormData - EXCLUDE custom variants
        const parentMainIds = variationsData
            .map(variation => {
                const variant = allVariants.find((item) => item.variant_name === variation.name);
                // Only include predefined variants (those with IDs), exclude custom variants
                return variant?.id && !variant.isCustom ? variant.id : null;
            })
            .filter(Boolean);

        const allIds = variationsData
            .flatMap((variation) => {
                const variant = allVariants.find((item) => item.variant_name === variation.name);
                const safeValues = normalizeValues(variation.values);

                return safeValues.map((value) => {
                    const attributeData = variant?.variant_attribute.find((attr) => attr.attribute_value === value);
                    // Only include predefined attributes (those with _id), exclude custom attributes
                    return attributeData?._id && !variant.isCustom ? attributeData._id : null;
                });
            })
            .filter(Boolean);

        setFormData((prev) => ({
            ...prev,
            // Only include IDs for predefined variants, exclude custom variants
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

    // UPDATED: transformCombinations function
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

        const result = Object.entries(nameValueMap).map(([name, values]) => {
            const matchingCombination = combinations.find(comb =>
                comb.name1 === name || comb.name2 === name
            );

            return {
                name,
                values: Array.from(values),
                main_images: matchingCombination?.main_images,
                preview_image: matchingCombination?.preview_image,
                thumbnail: matchingCombination?.thumbnail
            };
        });

        return result;
    };

    // UPDATED: handleDeleteVariant function to use names
    const handleDeleteVariant = (variantName, index) => {
        const variant = allVariants.find((item) => item.variant_name === variantName);
        const parentMainName = variant?.variant_name;
        const allAttributeValues = variant?.variant_attribute?.map((attr) => attr.attribute_value) || [];

        console.log({ parentMainName, allAttributeValues });
        setFormData((prev) => ({
            ...prev,
            ParentMainId: prev.ParentMainId.filter((id) => id !== parentMainName),
            varientName: prev.varientName.filter((name) => !allAttributeValues.includes(name)),
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
        setAttrValues((prv) => ({ ...prv, name: item?.name, values: item?.values }));
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
                                                    onClick={() => handleDeleteVariant(item?.name, i)} // Use name instead of variantId
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
                            <Button variant="outlined" sx={{ fontSize: '13px', fontWeight: 500, borderRadius: '30px', color: '#000', borderColor: '#000' }} onClick={() => setShowVariantList(true)}>
                                <AddIcon sx={{ fontSize: '21px' }} />Add a Variation
                            </Button>
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
                                <Box my={4}>
                                    {allVariants?.map((item, index) => (
                                        <Button
                                            key={index}
                                            mt={2}
                                            variant="contained"
                                            sx={{
                                                backgroundColor: "lightgrey",
                                                color: "black",
                                                borderRadius: "50px",
                                                marginRight: "10px",
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
                                                            backgroundColor: "rgba(0, 123, 255, 0.1)",
                                                        },
                                                    }}
                                                    secondaryAction={
                                                        <IconButton edge="end" size="small">
                                                            <AddIcon />
                                                        </IconButton>
                                                    }
                                                >
                                                    <ListItemText primary={option} />
                                                </ListItem>
                                            );
                                        }}
                                        sx={{ width: "100%" }}
                                    />

                                    <List>
                                        {attrValues?.values?.map((option, index) => (
                                            <ListItem
                                                key={index}
                                                sx={{
                                                    border: "1px solid #ccc",
                                                    borderRadius: "4px",
                                                    marginTop: "8px",
                                                    padding: "8px 16px",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <ListItemText primary={option} />
                                                <ListItemSecondaryAction>
                                                    <IconButton
                                                        edge="end"
                                                        aria-label="delete"
                                                        onClick={() => handleTagDelete(option)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                                <Box display="flex" justifyContent="space-between" mt={4}>
                                    <Button sx={buttonStyle} onClick={() => handleDeleteVariation(selectedVariant)}>
                                        Delete
                                    </Button>
                                    <Button
                                        variant="contained"
                                        sx={{ ...buttonStyle, ...{ background: '#000', color: '#fff' } }}
                                        onClick={handleDone}
                                        disabled={attrValues?.values?.length <= 0}
                                    >
                                        Done
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Box>
                )}
            </Modal>

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
        </div>
    );
};

export default VariantModal;
