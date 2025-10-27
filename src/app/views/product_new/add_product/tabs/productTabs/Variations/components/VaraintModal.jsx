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
import {useProductFormStore} from "../../../../../states/useAddProducts";

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
        setFormData,
        formValues,
        setFormValues
    } = useProductFormStore();

    const [selectedVariant, setSelectedVariant] = useState("");
    const [attrValues, setAttrValues] = useState({ name: "", values: [] });
    const [isEdit, setIsEdit] = useState(false);
    const [attrOptions, setAttrOptions] = useState([]);
    const [nameCombinations, setNameCombinations] = useState([]);
    const [showVariantList, setShowVariantList] = useState(false);
    const [varientName, setVarientName] = useState([]);
    const [loading, setLoading] = useState(false);

    // Custom variant states
    const [customVariantDialogOpen, setCustomVariantDialogOpen] = useState(false);
    const [customVariantName, setCustomVariantName] = useState("");
    const [customVariantOptions, setCustomVariantOptions] = useState([""]);
    const [customVariants, setCustomVariants] = useState([]);

    const auth_key = localStorage.getItem(localStorageKey.auth_key);

    // Combine predefined variants with custom variants
    const allVariants = [...varientName, ...customVariants];

    // Fetch variations when category changes
    const getCategoryData = async () => {
        if (formData?.subCategory) {
            try {
                setLoading(true);
                const res = await ApiService.get(`${apiEndpoints.GetVariantCategories}/${formData?.subCategory}`, auth_key);
                if (res.status === 200) {
                    setVarientName(res?.data?.parent || []);
                }
            } catch (error) {
                console.error("Error fetching variants:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (show) {
            getCategoryData();
        }
    }, [show, formData?.subCategory]);

    // Fixed generateNameCombinations without setState calls
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

    // Update name combinations only when variations data changes
    useEffect(() => {
        const currentData = variationsData || [];
        if (currentData.length > 1) {
            const newCombinations = generateNameCombinations();
            setNameCombinations(newCombinations);

            // Set initial form values only if they're empty
            if (!formValues?.prices && !formValues?.quantities && newCombinations.length > 0) {
                setFormValues(prev => ({
                    ...prev,
                    prices: newCombinations[0],
                    quantities: newCombinations[0]
                }));
            }
        } else {
            setNameCombinations([]);
        }
    }, [variationsData, generateNameCombinations, formValues?.prices, formValues?.quantities]);

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
        console.log(newValue[0], newValue.some(value => value === `Add All Options (${attrOptions?.length})`), [`Add All Options (${attrOptions?.length})`])
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
        setSelectedVariations(
            (selectedVariations || []).filter(variation => variation !== selectedVariantName)
        );

        setSelectedVariant("");
        setAttrValues({ name: "", values: [] });
        setIsEdit(false);
        setShowVariantList(false);
    };

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        if (name === "isCheckedPrice" || name === "isCheckedQuantity") {
            setFormValues((prev) => ({ ...prev, [name]: checked }));
        } else {
            setFormValues((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Enhanced combination generation with proper image handling
    const generateCombinations = (data, variantData) => {
        if (!data || data.length === 0) return [];

        const allCombinations = data.reduce((acc, variation, index) => {
            const { name, values } = variation;
            const safeValues = Array.isArray(values) ? values : [];

            if (acc.length === 0) {
                return safeValues?.map((value) => {
                    const variantInfo = variantData.find((variant) => variant.variant_name === name);
                    const attributeData = variantInfo?.variant_attribute?.find((attr) => attr.attribute_value === value);

                    return {
                        [`value${index + 1}`]: value,
                        [`name${index + 1}`]: name,
                        combValues: [value],
                        price: "",
                        qty: "",
                        isVisible: true,
                        priceInput: formValues?.prices,
                        quantityInput: formValues?.quantities,
                        isCheckedPrice: formValues?.isCheckedPrice,
                        isCheckedQuantity: formValues?.isCheckedQuantity,
                        main_images: attributeData?.main_images || [null, null, null],
                        preview_image: attributeData?.preview_image || null,
                        thumbnail: attributeData?.thumbnail || null
                    };
                });
            }

            return acc.flatMap((combination) =>
                safeValues?.map((value) => {
                    const variantInfo = variantData.find((variant) => variant.variant_name === name);
                    const attributeData = variantInfo?.variant_attribute?.find((attr) => attr.attribute_value === value);

                    return {
                        ...combination,
                        [`value${index + 1}`]: value,
                        [`name${index + 1}`]: name,
                        combValues: [...(combination.combValues || []), value],
                        price: "",
                        qty: "",
                        isVisible: true,
                        priceInput: formValues?.prices,
                        quantityInput: formValues?.quantities,
                        isCheckedPrice: formValues?.isCheckedPrice,
                        isCheckedQuantity: formValues?.isCheckedQuantity,
                        main_images: attributeData?.main_images || [null, null, null],
                        preview_image: attributeData?.preview_image || null,
                        thumbnail: attributeData?.thumbnail || null
                    };
                })
            );
        }, []);

        return allCombinations;
    };

    const handleGenerate = async () => {
        const currentData = variationsData || [];

        if (currentData.length === 0) {
            console.log("No variations data to generate");
            return;
        }

        let data = [];

        // Handle single variation
        if (currentData.length === 1) {
            const result = generateCombinations(currentData, allVariants);
            data.push({
                variant_name: currentData[0]?.name,
                combinations: result,
            });
        }
        // Handle multiple variations with price/quantity settings
        else {
            const existsPrice = currentData.find(variation => variation.name === formValues?.prices);
            const existsQuantity = currentData.find(variation => variation.name === formValues?.quantities);

            if ((formValues?.isCheckedPrice || formValues?.isCheckedQuantity) && (formValues?.prices || formValues?.quantities)) {
                if (existsPrice && existsQuantity) {
                    // Both price and quantity variations exist
                    if (formValues?.prices === formValues?.quantities) {
                        // Same variation for both price and quantity
                        const variationData = currentData.filter((item) => item.name === formValues?.prices);
                        let result = generateCombinations(variationData, allVariants);
                        data.push({
                            variant_name: formValues?.prices,
                            combinations: result
                        });
                    } else {
                        // Different variations for price and quantity
                        if (formValues?.isCheckedPrice) {
                            const priceVariation = currentData.filter((item) => item.name === formValues?.prices);
                            let result = generateCombinations(priceVariation, allVariants);
                            data.push({
                                variant_name: formValues?.prices,
                                combinations: result
                            });
                        }
                        if (formValues?.isCheckedQuantity) {
                            const quantityVariation = currentData.filter((item) => item.name === formValues?.quantities);
                            let result = generateCombinations(quantityVariation, allVariants);
                            data.push({
                                variant_name: formValues?.quantities,
                                combinations: result
                            });
                        }
                    }
                }
            } else {
                // No specific price/quantity settings, generate all variations
                for (const item of currentData) {
                    let result = generateCombinations([item], allVariants);
                    data.push({
                        variant_name: item?.name,
                        combinations: result,
                    });
                }
            }
        }

        console.log("Generated combinations:", data);
        setCombinations(data);

        // Update form data with selected variations - Only include predefined variants
        const parentMainIds = currentData
            .map(variation => {
                const variant = allVariants.find((item) => item.variant_name === variation.name);
                // Only include predefined variants (those with IDs), exclude custom variants
                return variant?.id && !variant.isCustom ? variant.id : null;
            })
            .filter(Boolean);

        const allIds = currentData
            .flatMap((variation) => {
                const variant = allVariants.find((item) => item.variant_name === variation.name);
                const safeValues = Array.isArray(variation.values) ? variation.values : [];

                return safeValues.map((value) => {
                    const attributeData = variant?.variant_attribute?.find((attr) => attr.attribute_value === value);
                    // Only include predefined attributes (those with _id), exclude custom attributes
                    return attributeData?._id && !variant.isCustom ? attributeData._id : null;
                });
            })
            .filter(Boolean);

        setFormData((prev) => ({
            ...prev,
            ParentMainId: Array.from(new Set([...(prev.ParentMainId || []), ...parentMainIds])),
            varientName: Array.from(new Set([...(prev.varientName || []), ...allIds]))
        }));

        handleCloseVariant();
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

                            {loading ? (
                                <Box display="flex" justifyContent="center" py={4}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <>
                                    {variationsData && variationsData.length > 0 ? (
                                        <Box>
                                            {(variationsData || []).map((item, i) => (
                                                <Card key={i} sx={{ marginBottom: '16px', border: '1px solid #e0e0e0', padding: '16px' }}>
                                                    <Typography fontWeight={500}>{item?.name}</Typography>
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
                                                Use variations if your item is offered in different <br /> colours, size, materials, etc.
                                            </Typography>
                                        </Box>
                                    )}

                                    {(variationsData || []).length < 2 && (
                                        <Button
                                            variant="outlined"
                                            startIcon={<AddIcon />}
                                            onClick={() => setShowVariantList(true)}
                                            sx={{ mt: 2 }}
                                            disabled={!allVariants || allVariants.length === 0}
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
                                            disabled={(variationsData || []).length === 0}
                                        >
                                            Apply
                                        </Button>
                                    </Box>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            {!selectedVariant ? (
                                <>
                                    <Typography variant="h5" gutterBottom>
                                        What type of variation is it?
                                    </Typography>
                                    <Typography color="textSecondary" mb={3}>
                                        You can add up to 2 variations. Use the variation types listed here for peak discoverability.
                                    </Typography>
                                    <Box my={2}>
                                        {allVariants?.map((item, index) => (
                                            <Button
                                                key={index}
                                                variant="outlined"
                                                sx={{
                                                    m: 0.5,
                                                    borderRadius: '20px',
                                                    textTransform: 'none'
                                                }}
                                                onClick={() => handleVariantSelect(item?.variant_name)}
                                                disabled={(selectedVariations || []).includes(item?.variant_name)}
                                                startIcon={(selectedVariations || []).includes(item?.variant_name) ? <CheckIcon /> : null}
                                            >
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
