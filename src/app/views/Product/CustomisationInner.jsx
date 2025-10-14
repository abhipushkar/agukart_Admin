// CustomisationInner.jsx (Updated - Only drag functionality)
import * as React from "react";
import {
    Box,
    CircularProgress,
    Stack,
    TextField,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useState, useEffect } from "react";
import TextCustomisation from "./edit-customisation/TextCustomisation";
import OptionDropdown from "./edit-customisation/OptionDropdown";
import VariantCustomizationTable from "./varaintCustomisationTable";
import { useLocation } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import DraggableCustomizationItem from "./draggable_component";

const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1
});

const CustomisationInner = ({
                                customizationData,
                                setCustomizationData,
                                loading,
                                draftLoading,
                                EditProducthandler,
                                handleDraftProduct,
                                variants = [],
                                customVariants = [],
                                categoryId
                            }) => {
    const { state } = useLocation();
    const [open, setOpen] = React.useState(false);
    const [activeBox, setActiveBox] = React.useState("Text");
    const [selectedVariant, setSelectedVariant] = React.useState(null);
    const [variantAttributes, setVariantAttributes] = React.useState([]);
    const [selectedAttributes, setSelectedAttributes] = React.useState([]);
    const [modalStep, setModalStep] = React.useState(1);
    const [allVariants, setAllVariants] = useState([]);
    const [apiVariants, setApiVariants] = useState([]);
    const [loadingVariants, setLoadingVariants] = useState(false);
    const [titleModalOpen, setTitleModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [newTitle, setNewTitle] = useState("");
    const auth_key = localStorage.getItem(localStorageKey.auth_key);

    // Fetch variants from API when categoryId changes
    const getCategoryVariants = async () => {
        if (categoryId) {
            setLoadingVariants(true);
            try {
                const res = await ApiService.get(`${apiEndpoints.GetVariantCategories}/${categoryId}`, auth_key);
                if (res.status === 200) {
                    setApiVariants(res?.data?.parent || []);
                }
            } catch (error) {
                console.error("Error fetching variants:", error);
            } finally {
                setLoadingVariants(false);
            }
        }
    };

    useEffect(() => {
        getCategoryVariants();
    }, [categoryId]);

    // Combine predefined variants with custom variants and API variants
    useEffect(() => {
        const combined = [...apiVariants];
        setAllVariants(combined);
    }, [variants, customVariants, apiVariants]);

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
            setCustomizationData((prev) => ({
                ...prev,
                customizations: [
                    ...(prev?.customizations || []),
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
            }));
        }
        else if (activeBox === "Option Dropdown") {
            const title = "Option Dropdown";
            setCustomizationData((prev) => ({
                ...prev,
                customizations: [
                    ...(prev?.customizations || []),
                    {
                        title: title,
                        label: "",
                        instructions: "",
                        isCompulsory: false,
                        optionList: [
                            {
                                optionName: "",
                                priceDifference: ""
                            }
                        ]
                    }
                ]
            }));
        }
        else if (activeBox === "Variant" && selectedVariant) {
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
                instructions: `Choose ${selectedVariant.variant_name || selectedVariant.name}`,
                isCompulsory: false,
                optionList: optionList,
                isVariant: true,
                variantId: selectedVariant.id || selectedVariant._id
            };

            setCustomizationData((prev) => ({
                ...prev,
                customizations: [
                    ...(prev?.customizations || []),
                    newVariantCustomization
                ]
            }));
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

    const moveCustomizationItem = (fromIndex, toIndex) => {
        const updatedCustomizations = [...customizationData.customizations];
        const [movedItem] = updatedCustomizations.splice(fromIndex, 1);
        updatedCustomizations.splice(toIndex, 0, movedItem);

        setCustomizationData((prev) => ({
            ...prev,
            customizations: updatedCustomizations,
        }));
    };

    const handleCustomizationDelete = (index) => {
        setCustomizationData((prev) => ({
            ...prev,
            customizations: prev.customizations.filter((_, i) => i !== index)
        }));
    };

    const handleTitleEdit = (index) => {
        setEditingIndex(index);
        setNewTitle(customizationData.customizations[index]?.title || "");
        setTitleModalOpen(true);
    };

    const handleTitleChange = () => {
        if (editingIndex === null) return;

        setCustomizationData((prev) => ({
            ...prev,
            customizations: prev.customizations.map((item, idx) =>
                idx === editingIndex ? { ...item, title: newTitle } : item
            )
        }));
        setTitleModalOpen(false);
        setEditingIndex(null);
        setNewTitle("");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "label" && value.length > 100) {
            return;
        }
        if (name === "instructions" && value.length > 200) {
            return;
        }
        setCustomizationData((prev) => ({ ...prev, [name]: value }));
    }

    const renderModalContent = () => {
        if (modalStep === 1) {
            return (
                <>
                    <Typography variant="h6" component="h2" gutterBottom>
                        Add Customisation
                    </Typography>
                    <Box
                        sx={{
                            mt: 2,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "10px"
                        }}
                    >
                        {["Text", "Option Dropdown"].map((title, index) => {
                            const isSelected = title === "Text" ? hasTextCustomization : hasOptionDropdown;
                            return (
                                <Box
                                    key={`standard-${index}`}
                                    className={activeBox === title ? "active" : ""}
                                    sx={{
                                        border: isSelected ? "2px solid green" :
                                            activeBox === title ? "2px solid #1976d2" : "2px solid #eee",
                                        width: "30%",
                                        height: "180px",
                                        cursor: "pointer",
                                        backgroundColor: activeBox === title ? "#fff" : "inherit",
                                        position: "relative",
                                        borderRadius: 1,
                                        overflow: 'hidden'
                                    }}
                                    onClick={() => handleBoxClick(title)}
                                >
                                    {isSelected && (
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                top: -5,
                                                right: -5,
                                                width: 20,
                                                height: 20,
                                                backgroundColor: "green",
                                                borderRadius: "50%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "white",
                                                fontSize: "12px",
                                                fontWeight: "bold"
                                            }}
                                        >
                                            ✓
                                        </Box>
                                    )}
                                    <Box
                                        sx={{
                                            fontWeight: "500",
                                            padding: "8px",
                                            fontSize: "13px",
                                            borderBottom: "1px solid gray",
                                            backgroundColor: activeBox === title ? "#1976d2" : "#fff",
                                            color: activeBox === title ? "#fff" : "#000"
                                        }}
                                    >
                                        {title}
                                        {isSelected && (
                                            <Typography variant="caption" display="block" sx={{ fontStyle: 'italic' }}>
                                                (Already added)
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box
                                        sx={{
                                            padding: "5px"
                                        }}
                                    >
                                        {title === "Text" &&
                                            "Allow buyers to add their personalized text on your product. Ideal for names printed on a surface."}
                                        {title === "Option Dropdown" &&
                                            "Allow buyers to choose from different sets of options that you offer. Ideal for products with different variations."}
                                    </Box>
                                </Box>
                            );
                        })}

                        {loadingVariants ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 2 }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : (
                            allVariants.map((variant, index) => {
                                const isSelected = isVariantSelected(variant.variant_name || variant.name);
                                return (
                                    <Box
                                        key={`variant-${index}`}
                                        className={activeBox === (variant.variant_name || variant.name) ? "active" : ""}
                                        sx={{
                                            border: isSelected ? "2px solid green" :
                                                activeBox === (variant.variant_name || variant.name) ? "2px solid #1976d2" : "2px solid #eee",
                                            width: "30%",
                                            height: "180px",
                                            cursor: "pointer",
                                            backgroundColor: activeBox === (variant.variant_name || variant.name) ? "#fff" : "inherit",
                                            position: "relative",
                                            borderRadius: 1,
                                            overflow: 'hidden'
                                        }}
                                        onClick={() => handleVariantSelect(variant)}
                                    >
                                        {isSelected && (
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    top: -5,
                                                    right: -5,
                                                    width: 20,
                                                    height: 20,
                                                    backgroundColor: "green",
                                                    borderRadius: "50%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "white",
                                                    fontSize: "12px",
                                                    fontWeight: "bold"
                                                }}
                                            >
                                                ✓
                                            </Box>
                                        )}
                                        <Box
                                            sx={{
                                                fontWeight: "500",
                                                padding: "8px",
                                                fontSize: "13px",
                                                borderBottom: "1px solid gray",
                                                backgroundColor: activeBox === (variant.variant_name || variant.name) ? "#1976d2" : "#fff",
                                                color: activeBox === (variant.variant_name || variant.name) ? "#fff" : "#000"
                                            }}
                                        >
                                            {variant.variant_name || variant.name}
                                            {isSelected && (
                                                <Typography variant="caption" display="block" sx={{ fontStyle: 'italic' }}>
                                                    (Already added)
                                                </Typography>
                                            )}
                                        </Box>
                                        <Box
                                            sx={{
                                                padding: "5px"
                                            }}
                                        >
                                            {`Allow buyers to choose from ${variant.variant_attribute?.length || variant.values?.length || 0} ${variant.variant_name || variant.name} options.`}
                                        </Box>
                                    </Box>
                                );
                            })
                        )}
                    </Box>
                </>
            );
        }

        if (modalStep === 2 && selectedVariant) {
            return (
                <>
                    <Typography variant="h6" component="h2" gutterBottom>
                        Select {selectedVariant.variant_name || selectedVariant.name} Options
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            mt: 2
                        }}
                    >
                        Choose which options to include in this customization:
                    </Typography>

                    <Box sx={{ mt: 2, mb: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleSelectAllAttributes}
                            sx={{ mb: 2 }}
                        >
                            {selectedAttributes.length === variantAttributes.length ? "Deselect All" : "Select All"}
                        </Button>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            {variantAttributes.map((attribute, index) => {
                                const attributeValue = attribute.value || attribute;
                                const hasImages = attribute.main_images || attribute.preview_image || attribute.thumbnail;

                                return (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            padding: "8px",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            backgroundColor: selectedAttributes.includes(attribute) ? "#e3f2fd" : "transparent"
                                        }}
                                        onClick={() => handleAttributeToggle(attribute)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedAttributes.includes(attribute)}
                                            onChange={() => handleAttributeToggle(attribute)}
                                            style={{ marginRight: "8px" }}
                                        />
                                        <Typography sx={{ flex: 1 }}>{attributeValue}</Typography>
                                        {hasImages && (
                                            <Box sx={{
                                                ml: 2,
                                                display: 'flex',
                                                gap: 0.5,
                                                opacity: 0.7
                                            }}>
                                                {attribute.preview_image && (
                                                    <Box sx={{
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: '2px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <img
                                                            src={attribute.preview_image}
                                                            alt="Preview"
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    </Box>
                                                )}
                                                {attribute.thumbnail && (
                                                    <Box sx={{
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: '2px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <img
                                                            src={attribute.thumbnail}
                                                            alt="Thumbnail"
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    </Box>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                </>
            );
        }
    };

    const renderDialogActions = () => {
        if (modalStep === 1) {
            return (
                <Button
                    variant="contained"
                    onClick={addCustomizationHandler}
                    disabled={activeBox === "Variant"}
                >
                    Add Customisation
                </Button>
            );
        }

        if (modalStep === 2) {
            return (
                <>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setModalStep(1);
                            setSelectedVariant(null);
                            setSelectedAttributes([]);
                            setActiveBox("Text");
                        }}
                    >
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        onClick={addCustomizationHandler}
                        disabled={selectedAttributes.length === 0}
                    >
                        Add Customisation
                    </Button>
                </>
            );
        }
    };

    const renderCustomizationContent = (item, index) => {
        if (item?.isVariant) {
            return (
                <VariantCustomizationTable
                    customizationData={customizationData}
                    setCustomizationData={setCustomizationData}
                    index={index}
                    variants={allVariants}
                    customVariants={customVariants}
                />
            );
        } else if (!item?.optionList) {
            return (
                <TextCustomisation
                    customizationData={customizationData}
                    setCustomizationData={setCustomizationData}
                    index={index}
                />
            );
        } else {
            return (
                <OptionDropdown
                    optionDropDownForm={customizationData?.customizations[index]}
                    customizationData={customizationData}
                    setCustomizationData={setCustomizationData}
                    index={index}
                />
            );
        }
    };

    return (
        <>
            <Box>
                <Box
                    sx={{
                        fontSize: "35px",
                        fontWeight: "500"
                    }}
                >
                    Edit Customisations
                </Box>
                <Box
                    sx={{
                        fontSize: "20px",
                        fontWeight: "500"
                    }}
                >
                    Manage your surfaces and customizations
                </Box>
                <Box>A product can have up to five surfaces with ten customizations each</Box>
                <Box>
                    <div>
                        <Accordion defaultExpanded>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1-content"
                                id="panel1-header"
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        borderBottom: "1px solid black",
                                        justifyContent: "space-between",
                                        width: "100%"
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center"
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                fontSize: "24px",
                                                fontWeight: "700",
                                                borderRight: "1px solid black",
                                                paddingRight: "10px"
                                            }}
                                        >
                                            1
                                        </Box>
                                        <Box
                                            sx={{
                                                marginLeft: "10px"
                                            }}
                                        >
                                            <CreateIcon
                                                sx={{
                                                    color: "gray"
                                                }}
                                            />
                                        </Box>
                                        <Box
                                            sx={{
                                                fontWeight: "700",
                                                marginLeft: "10px"
                                            }}
                                        >
                                            Surface 1
                                        </Box>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center"
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                fontSize: "15px",
                                                fontWeight: "600",
                                                paddingInline: "10px"
                                            }}
                                        >
                                            Change Order
                                        </Box>
                                        <Box
                                            sx={{
                                                borderLeft: "1px solid black",
                                                borderRight: "1px solid black",
                                                paddingInline: "10px"
                                            }}
                                        >
                                            <DeleteIcon />
                                        </Box>
                                    </Box>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box>
                                    <Box
                                        sx={{
                                            fontSize: "16px",
                                            fontWeight: "600"
                                        }}
                                    >
                                        Preview Image
                                    </Box>
                                    <Box
                                        sx={{
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            color: "gray"
                                        }}
                                    >
                                        Add a preview image for this surface
                                    </Box>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            marginTop: "20px",
                                            justifyContent: "space-between"
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: "30%"
                                            }}
                                        >
                                            <Box>
                                                <Box
                                                    sx={{
                                                        fontSize: "14px",
                                                        fontWeight: "700",
                                                        wordBreak: "normal",
                                                        textWrap: "nowrap",
                                                        width: "15%"
                                                    }}
                                                >
                                                    Label :
                                                </Box>
                                                <Box
                                                    sx={{
                                                        width: "100%",
                                                        maxWidth: "100%"
                                                    }}
                                                >
                                                    <TextField fullWidth placeholder="Surface 1" id="fullWidth" name="label" value={customizationData?.label} onChange={handleChange} />
                                                    {`You Have ${100 - customizationData?.label?.length
                                                    } of 100 characters remaining`}
                                                </Box>
                                            </Box>

                                            <Box
                                                sx={{
                                                    marginTop: "20px"
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        fontSize: "14px",
                                                        fontWeight: "700",
                                                        wordBreak: "normal",
                                                        textWrap: "nowrap",
                                                        width: "15%"
                                                    }}
                                                >
                                                    Instructions(Optional) :
                                                </Box>
                                                <Box
                                                    sx={{
                                                        width: "100%",
                                                        maxWidth: "100%"
                                                    }}
                                                >
                                                    <TextField
                                                        fullWidth
                                                        placeholder="Surface 1"
                                                        id="fullWidth"
                                                        multiline
                                                        rows={3}
                                                        sx={{
                                                            width: "100%"
                                                        }}
                                                        name="instructions"
                                                        value={customizationData?.instructions}
                                                        onChange={handleChange}
                                                    />
                                                    {`You Have ${200 - customizationData?.instructions?.length
                                                    } of 200 characters remaining`}
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box
                                            sx={{
                                                width: "30%"
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    fontSize: "14px",
                                                    fontWeight: "600"
                                                }}
                                            >
                                                Preview Image*
                                            </Box>
                                            <Box>
                                                <Button
                                                    component="label"
                                                    role={undefined}
                                                    variant="contained"
                                                    tabIndex={-1}
                                                    startIcon={
                                                        <CloudUploadIcon
                                                            sx={{
                                                                fontSize: "40px"
                                                            }}
                                                        />
                                                    }
                                                    sx={{
                                                        marginTop: "20px",
                                                        backgroundColor: "transparent",
                                                        border: "1px solid gray",
                                                        boxShadow: "none",
                                                        color: "black",
                                                        flexDirection: "column",
                                                        gap: "10px",
                                                        transition: "all .3s easeInOut",
                                                        "&:hover": {
                                                            color: "white"
                                                        }
                                                    }}
                                                >
                                                    <>
                                                        `Drag Or upload a Square Image`
                                                        <Box>Min: 400*400</Box>
                                                        <Box>JPEG Or PNG</Box>
                                                        <Box>Max Size: 12MB</Box>
                                                    </>
                                                    <VisuallyHiddenInput type="file" />
                                                </Button>
                                            </Box>
                                        </Box>
                                        <Box
                                            sx={{
                                                width: "30%"
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    fontSize: "14px",
                                                    fontWeight: "600"
                                                }}
                                            >
                                                Clipping Mask*
                                            </Box>
                                            <Box>
                                                <Button
                                                    component="label"
                                                    role={undefined}
                                                    variant="contained"
                                                    tabIndex={-1}
                                                    sx={{
                                                        marginTop: "20px",
                                                        backgroundColor: "transparent",
                                                        border: "1px solid gray",
                                                        boxShadow: "none",
                                                        color: "black",
                                                        padding: "10px",
                                                        flexDirection: "column",
                                                        gap: "10px",
                                                        fontSize: "12px",
                                                        "&:hover": {
                                                            color: "white"
                                                        }
                                                    }}
                                                >
                                                    Clipping masks allow you to define areas of your preview that should not
                                                    be covered by buyer uploaded images. For example, if you sell a onone case
                                                    and vou masked coin thei background and camera hole, a buyer uploaded
                                                    image would appear as if it was pertectly cut in the shape of the case,
                                                    leaving the background and Camera nole intacu
                                                    <Box
                                                        sx={{
                                                            border: "1px solid gray",
                                                            padding: "5px",
                                                            borderRadius: "8px",
                                                            backgroundColor: "#1976d2",
                                                            color: "white",
                                                            fontWeight: "600"
                                                        }}
                                                    >
                                                        Upload mask
                                                    </Box>
                                                    <VisuallyHiddenInput type="file" />
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Stack gap={2} mt={2}>
                                        <DndProvider backend={HTML5Backend}>
                                            {customizationData?.customizations?.length > 0 &&
                                                customizationData?.customizations?.map((item, i) => (
                                                    <DraggableCustomizationItem
                                                        key={i}
                                                        id={i}
                                                        index={i}
                                                        moveItem={moveCustomizationItem}
                                                        title={item.title}
                                                        onTitleEdit={() => handleTitleEdit(i)}
                                                        onDelete={() => handleCustomizationDelete(i)}
                                                    >
                                                        {renderCustomizationContent(item, i)}
                                                    </DraggableCustomizationItem>
                                                ))}
                                        </DndProvider>
                                    </Stack>
                                    <Box
                                        sx={{
                                            marginTop: "20px"
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                fontSize: "14px",
                                                fontWeight: "700",
                                                wordBreak: "normal",
                                                textWrap: "nowrap",
                                                width: "15%"
                                            }}
                                        >
                                            Instructions(Optional) :
                                        </Box>
                                        <Box
                                            sx={{
                                                width: "100%",
                                                maxWidth: "100%",
                                                border: "1px dotted gray",
                                                padding: "20px",
                                                height: "150px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}
                                        >
                                            <div>
                                                <Button
                                                    onClick={handleOpen}
                                                    sx={{
                                                        backgroundColor: "#1976d2",
                                                        color: "white",
                                                        "&:hover": {
                                                            backgroundColor: "blue"
                                                        }
                                                    }}
                                                >
                                                    Add Customisation
                                                </Button>
                                                <Dialog
                                                    open={open}
                                                    onClose={handleClose}
                                                    maxWidth="lg"
                                                    fullWidth
                                                    PaperProps={{
                                                        sx: {
                                                            minHeight: '500px'
                                                        }
                                                    }}
                                                >
                                                    <DialogTitle>
                                                        {modalStep === 1 ? "Add Customisation" : `Select ${selectedVariant?.variant_name || selectedVariant?.name} Options`}
                                                    </DialogTitle>
                                                    <DialogContent>
                                                        {renderModalContent()}
                                                    </DialogContent>
                                                    <DialogActions>
                                                        {modalStep === 1 ? (
                                                            <Button onClick={handleClose}>Cancel</Button>
                                                        ) : null}
                                                        {renderDialogActions()}
                                                    </DialogActions>
                                                </Dialog>
                                            </div>
                                        </Box>
                                    </Box>
                                </Box>
                            </AccordionDetails>
                        </Accordion>

                        <Box
                            sx={{
                                marginTop: "20px"
                            }}
                        >
                            <Box
                                sx={{
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    wordBreak: "normal",
                                    textWrap: "nowrap",
                                    width: "15%"
                                }}
                            ></Box>
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                marginTop: "20px"
                            }}
                        >
                            <Button
                                endIcon={draftLoading ? <CircularProgress size={15} /> : ""}
                                disabled={draftLoading}
                                onClick={handleDraftProduct}
                                variant="contained"
                            >
                                Save As Draft
                            </Button>
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: "5px"
                                }}
                            >
                                <Button
                                    endIcon={loading ? <CircularProgress size={15} /> : ""}
                                    disabled={loading}
                                    onClick={EditProducthandler}
                                    variant="contained"
                                >
                                    Submit
                                </Button>
                            </Box>
                        </Box>
                    </div>
                </Box>
            </Box>

            {/* Title Edit Modal */}
            <Dialog
                open={titleModalOpen}
                onClose={() => setTitleModalOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Change Title</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="New Title"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTitleModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleTitleChange} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CustomisationInner;
