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
    CircularProgress
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

    const auth_key = localStorage.getItem(localStorageKey.auth_key);

    // Normalize variations data to handle both API formats
    const normalizeVariationsData = useCallback((data) => {
        if (!data) return [];

        return data.map(item => ({
            name: item.name,
            values: Array.isArray(item.values) ? item.values : []
        }));
    }, []);

    // Get current normalized variations data
    const currentVariationsData = normalizeVariationsData(variationsData);

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
        const names = currentVariationsData.map(item => item.name);
        const combinations = [...names];
        for (let i = 0; i < names.length; i++) {
            for (let j = i + 1; j < names.length; j++) {
                combinations.push(`${names[i]} and ${names[j]}`);
            }
        }
        return combinations;
    }, [currentVariationsData]);

    // Update name combinations only when variations data changes
    useEffect(() => {
        if (currentVariationsData.length > 1) {
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
    }, [currentVariationsData, generateNameCombinations, formValues?.prices, formValues?.quantities]);

    const handleTagHandler = (event, newValue) => {
        if (newValue === `Add All Options (${attrOptions?.length})`) {
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

        if (isEdit) {
            const updatedData = currentVariationsData.map((item) =>
                item.name === attrValues.name ? normalizedAttrValues : item
            );
            setVariationsData(updatedData);
        } else {
            const newData = [...currentVariationsData, normalizedAttrValues];
            setVariationsData(newData);
        }

        setShowVariantList(false);
        setSelectedVariant("");
        setAttrValues({ name: "", values: [] });
        setAttrOptions([]);
        setIsEdit(false);
    };

    const handleDeleteVariation = (selectedVariantName) => {
        const updatedData = currentVariationsData.filter(variation => variation.name !== selectedVariantName);
        setVariationsData(updatedData);

        setSelectedVariations(prevSelectedVariations =>
            (prevSelectedVariations || []).filter(variation => variation !== selectedVariantName)
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
        if (currentVariationsData.length === 0) {
            console.log("No variations data to generate");
            return;
        }

        let data = [];

        // Handle single variation
        if (currentVariationsData.length === 1) {
            const result = generateCombinations(currentVariationsData, varientName);
            data.push({
                variant_name: currentVariationsData[0]?.name,
                combinations: result,
            });
        }
        // Handle multiple variations with price/quantity settings
        else {
            const existsPrice = currentVariationsData.find(variation => variation.name === formValues?.prices);
            const existsQuantity = currentVariationsData.find(variation => variation.name === formValues?.quantities);

            if ((formValues?.isCheckedPrice || formValues?.isCheckedQuantity) && (formValues?.prices || formValues?.quantities)) {
                if (existsPrice && existsQuantity) {
                    // Both price and quantity variations exist
                    if (formValues?.prices === formValues?.quantities) {
                        // Same variation for both price and quantity
                        const variationData = currentVariationsData.filter((item) => item.name === formValues?.prices);
                        let result = generateCombinations(variationData, varientName);
                        data.push({
                            variant_name: formValues?.prices,
                            combinations: result
                        });
                    } else {
                        // Different variations for price and quantity
                        if (formValues?.isCheckedPrice) {
                            const priceVariation = currentVariationsData.filter((item) => item.name === formValues?.prices);
                            let result = generateCombinations(priceVariation, varientName);
                            data.push({
                                variant_name: formValues?.prices,
                                combinations: result
                            });
                        }
                        if (formValues?.isCheckedQuantity) {
                            const quantityVariation = currentVariationsData.filter((item) => item.name === formValues?.quantities);
                            let result = generateCombinations(quantityVariation, varientName);
                            data.push({
                                variant_name: formValues?.quantities,
                                combinations: result
                            });
                        }
                    }
                }
            } else {
                // No specific price/quantity settings, generate all variations
                for (const item of currentVariationsData) {
                    let result = generateCombinations([item], varientName);
                    data.push({
                        variant_name: item?.name,
                        combinations: result,
                    });
                }
            }
        }

        console.log("Generated combinations:", data);
        setCombinations(data);

        // Update form data with selected variations
        const parentMainIds = currentVariationsData
            .map(variation => {
                const variant = varientName.find((item) => item.variant_name === variation.name);
                return variant?.id;
            })
            .filter(Boolean);

        const allIds = currentVariationsData
            .flatMap((variation) => {
                const variant = varientName.find((item) => item.variant_name === variation.name);
                const safeValues = Array.isArray(variation.values) ? variation.values : [];

                return safeValues.map((value) => {
                    const attributeData = variant?.variant_attribute?.find((attr) => attr.attribute_value === value);
                    return attributeData?._id;
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
            const data = varientName.filter((item) => item?.variant_name === selectedVariant);
            const options = data[0]?.variant_attribute?.map((item) => item?.attribute_value) || [];
            setAttrOptions(options);
        }
    }, [selectedVariant, varientName]);

    const handleEditVariation = (item) => {
        setSelectedVariant(item?.name);
        setAttrValues({ name: item?.name, values: item?.values || [] });
        setIsEdit(true);
        setShowVariantList(true);
    };

    const handleVariantSelect = (variantName) => {
        setSelectedVariations(prev => Array.from(new Set([...(prev || []), variantName])));
        setSelectedVariant(variantName);
        setAttrValues(prev => ({ ...prev, name: variantName, values: [] }));
    };

    return (
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
                                {currentVariationsData.length > 0 ? (
                                    <Box>
                                        {currentVariationsData.map((item, i) => (
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

                                {currentVariationsData.length < 2 && (
                                    <Button
                                        variant="outlined"
                                        startIcon={<AddIcon />}
                                        onClick={() => setShowVariantList(true)}
                                        sx={{ mt: 2 }}
                                        disabled={!varientName || varientName.length === 0}
                                    >
                                        Add a Variation
                                    </Button>
                                )}

                                {currentVariationsData.length > 0 && (
                                    <Box py={2} sx={{ borderTop: '1px solid #e0e0e0', mt: 2 }}>
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <Switch
                                                name="isCheckedPrice"
                                                checked={formValues?.isCheckedPrice || false}
                                                onChange={handleChange}
                                            />
                                            <Typography>Prices vary for each</Typography>
                                        </Box>
                                        {formValues?.isCheckedPrice && currentVariationsData.length > 1 && (
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
                                        {formValues?.isCheckedQuantity && currentVariationsData.length > 1 && (
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
                                        disabled={currentVariationsData.length === 0}
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
                                    {varientName?.map((item, index) => (
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
                                    options={[...(attrOptions || []), `Add All Options (${attrOptions?.length || 0})`]}
                                    getOptionLabel={(option) => option}
                                    value={[]}
                                    onChange={handleTagHandler}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Enter an option..."
                                            placeholder="Enter an option..."
                                        />
                                    )}
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
    );
};

export default VariantModal;
