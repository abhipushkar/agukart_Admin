// components/AddCustomizationModal.jsx
import React, {useState, useEffect} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    CircularProgress
} from "@mui/material";
import CustomizationTypeSelector from './CustomizationTypeSelector';
import VariantOptionsSelector from './VariantOptionsSelector';
import {useProductFormStore} from "../../../../../states/useAddProducts";

const AddCustomizationModal = () => {
    const {customizationData, setCustomizationData, varientName} = useProductFormStore();

    const [open, setOpen] = useState(false);
    const [activeBox, setActiveBox] = useState("Text");
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [variantAttributes, setVariantAttributes] = useState([]);
    const [selectedAttributes, setSelectedAttributes] = useState([]);
    const [modalStep, setModalStep] = useState(1);
    const [allVariants, setAllVariants] = useState([]);
    const [loadingVariants, setLoadingVariants] = useState(false);

    useEffect(() => {
        // Combine predefined variants with custom variants
        const combined = [...varientName];
        setAllVariants(combined);
    }, [varientName]);

    const handleOpen = () => {
        setOpen(true);
        setModalStep(1);
        setActiveBox("Text");
        setSelectedVariant(null);
        setSelectedAttributes([]);
    };

    const handleClose = () => {
        setOpen(false);
        setModalStep(1);
        setSelectedVariant(null);
        setSelectedAttributes([]);
    };

    const handleBoxClick = (boxId) => {
        setActiveBox(boxId);
        if (boxId !== "Variant") {
            setModalStep(1);
            setSelectedVariant(null);
            setSelectedAttributes([]);
        }
    };

    const handleVariantSelect = (variant) => {
        setSelectedVariant(variant);
        setActiveBox("Variant");
        const attributes = variant.variant_attribute?.map(attr => ({
            value: attr.attribute_value,
            main_images: attr.main_images || [null, null, null],
            preview_image: attr.preview_image || null,
            thumbnail: attr.thumbnail || null,
            attributeId: attr._id
        })) || variant.values || [];

        setVariantAttributes(attributes);
        setSelectedAttributes([]);
        setModalStep(2);
    };

    const handleAttributeToggle = (attribute) => {
        setSelectedAttributes(prev => {
            if (prev.includes(attribute)) {
                return prev.filter(a => a !== attribute);
            } else {
                return [...prev, attribute];
            }
        });
    };

    const handleSelectAllAttributes = () => {
        if (selectedAttributes.length === variantAttributes.length) {
            setSelectedAttributes([]);
        } else {
            setSelectedAttributes([...variantAttributes]);
        }
    };

    const addCustomizationHandler = () => {
        if (activeBox === "Text") {
            const title = "Text Customization";
            setCustomizationData({
                ...customizationData,
                customizations: [
                    ...(customizationData?.customizations || []),
                    {
                        title: title,
                        placeholder: "",
                        label: "",
                        instructions: "",
                        price: "",
                        min: "",
                        max: "",
                        isCompulsory: false
                    }
                ]
            });
        } else if (activeBox === "Option Dropdown") {
            const title = "Option Dropdown";
            setCustomizationData({
                ...customizationData,
                customizations: [
                    ...(customizationData?.customizations || []),
                    {
                        title: title,
                        label: "",
                        instructions: "",
                        isCompulsory: false,
                        isVariant: false,
                        guide: {
                        },
                        optionList: [
                            {
                                optionName: "",
                                priceDifference: ""
                            }
                        ]
                    }
                ]
            });
        } else if (activeBox === "Variant" && selectedVariant) {
            const selectedVariantData = allVariants.find(v =>
                v.variant_name === selectedVariant.variant_name
            );

            const optionList = selectedAttributes.map(attribute => {
                const attributeData = selectedVariantData?.variant_attribute?.find(
                    attr => attr.attribute_value === attribute.value || attr.attribute_value === attribute
                );

                return {
                    optionName: attribute.value || attribute,
                    priceDifference: "0",
                    main_images: attributeData?.main_images || [null, null, null],
                    preview_image: attributeData?.preview_image || null,
                    thumbnail: attributeData?.thumbnail || null,
                    isVisible: true
                };
            });

            const newVariantCustomization = {
                title: selectedVariant.variant_name || selectedVariant.name,
                label: selectedVariant.variant_name || selectedVariant.name,
                guide: {
                    guide_name: selectedVariant.guide_name || "",
                    guide_file: selectedVariant.guide_file || null,
                    guide_description: selectedVariant.guide_description || "",
                    guide_type: selectedVariant.guide_type || "",
                },
                instructions: `Choose ${selectedVariant.variant_name || selectedVariant.name}`,
                isCompulsory: false,
                optionList: optionList || [],
                isVariant: true,
                variantId: selectedVariant.id || selectedVariant._id
            };

            setCustomizationData({
                ...customizationData,
                customizations: [
                    ...(customizationData?.customizations || []),
                    newVariantCustomization
                ]
            });
        }
        handleClose();
    };

    const isVariantSelected = (variantName) => {
        return customizationData?.customizations?.some(
            customization => customization.isVariant && customization.title === variantName
        );
    };

    const hasTextCustomization = customizationData?.customizations?.some(
        customization => !customization.optionList && !customization.isVariant
    );

    const hasOptionDropdown = customizationData?.customizations?.some(
        customization => customization.optionList && !customization.isVariant
    );

    const renderModalContent = () => {
        if (modalStep === 1) {
            return (
                <CustomizationTypeSelector
                    activeBox={activeBox}
                    onBoxClick={handleBoxClick}
                    allVariants={allVariants}
                    loadingVariants={loadingVariants}
                    onVariantSelect={handleVariantSelect}
                    isVariantSelected={isVariantSelected}
                    hasTextCustomization={hasTextCustomization}
                    hasOptionDropdown={hasOptionDropdown}
                />
            );
        }

        if (modalStep === 2 && selectedVariant) {
            return (
                <VariantOptionsSelector
                    selectedVariant={selectedVariant}
                    variantAttributes={variantAttributes}
                    selectedAttributes={selectedAttributes}
                    onAttributeToggle={handleAttributeToggle}
                    onSelectAll={handleSelectAllAttributes}
                />
            );
        }
    };

    const renderDialogActions = () => {
        if (modalStep === 1) {
            return (
                <Button variant="contained" onClick={addCustomizationHandler} disabled={activeBox === "Variant"}>
                    Add Customisation
                </Button>
            );
        }

        if (modalStep === 2) {
            return (
                <>
                    <Button variant="outlined" onClick={() => setModalStep(1)}>
                        Back
                    </Button>
                    <Button variant="contained" onClick={addCustomizationHandler}
                            disabled={selectedAttributes.length === 0}>
                        Add Customisation
                    </Button>
                </>
            );
        }
    };

    return (
        <>
            <Button
                onClick={handleOpen}
                sx={{
                    backgroundColor: "#1976d2",
                    color: "white",
                    "&:hover": {backgroundColor: "blue"}
                }}
            >
                Add Customisation
            </Button>

            <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth PaperProps={{sx: {minHeight: '500px'}}}>
                <DialogTitle>
                    {modalStep === 1 ? "Add Customisation" : `Select ${selectedVariant?.variant_name || selectedVariant?.name} Options`}
                </DialogTitle>
                <DialogContent>
                    {renderModalContent()}
                </DialogContent>
                <DialogActions>
                    {modalStep === 1 && <Button onClick={handleClose}>Cancel</Button>}
                    {renderDialogActions()}
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AddCustomizationModal;
