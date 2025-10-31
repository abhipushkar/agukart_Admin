// components/CustomizationTypeSelector.jsx
import React from 'react';
import { Box, Typography, CircularProgress } from "@mui/material";

const CustomizationTypeSelector = ({
                                       activeBox,
                                       onBoxClick,
                                       allVariants,
                                       loadingVariants,
                                       onVariantSelect,
                                       isVariantSelected,
                                       hasTextCustomization,
                                       hasOptionDropdown
                                   }) => {
    const customizationTypes = [
        {
            id: "Text",
            title: "Text",
            description: "Allow buyers to add their personalized text on your product. Ideal for names printed on a surface."
        },
        {
            id: "Option Dropdown",
            title: "Option Dropdown",
            description: "Allow buyers to choose from different sets of options that you offer. Ideal for products with different variations."
        }
    ];

    return (
        <>
            <Typography variant="h6" component="h2" gutterBottom>
                Add Customisation
            </Typography>
            <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {/* Standard Customization Types */}
                {customizationTypes.map((type, index) => {
                    const isSelected = type.id === "Text" ? hasTextCustomization : hasOptionDropdown;
                    return (
                        <Box
                            key={`standard-${index}`}
                            className={activeBox === type.id ? "active" : ""}
                            sx={{
                                border: isSelected ? "2px solid green" :
                                    activeBox === type.id ? "2px solid #1976d2" : "2px solid #eee",
                                width: "30%",
                                height: "180px",
                                cursor: "pointer",
                                backgroundColor: activeBox === type.id ? "#fff" : "inherit",
                                position: "relative",
                                borderRadius: 1,
                                overflow: 'hidden'
                            }}
                            onClick={() => onBoxClick(type.id)}
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
                                    backgroundColor: activeBox === type.id ? "#1976d2" : "#fff",
                                    color: activeBox === type.id ? "#fff" : "#000"
                                }}
                            >
                                {type.title}
                                {isSelected && (
                                    <Typography variant="caption" display="block" sx={{ fontStyle: 'italic' }}>
                                        (Already added)
                                    </Typography>
                                )}
                            </Box>
                            <Box sx={{ padding: "5px" }}>
                                {type.description}
                            </Box>
                        </Box>
                    );
                })}

                {/* Variants */}
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
                                onClick={() => onVariantSelect(variant)}
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
                                <Box sx={{ padding: "5px" }}>
                                    {`Allow buyers to choose from ${variant.variant_attribute?.length || variant.values?.length || 0} ${variant.variant_name || variant.name} options.`}
                                </Box>
                            </Box>
                        );
                    })
                )}
            </Box>
        </>
    );
};

export default CustomizationTypeSelector;
