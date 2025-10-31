// components/VariantOptionsSelector.jsx
import React from 'react';
import { Typography, Box, Button, Checkbox } from "@mui/material";

const VariantOptionsSelector = ({
                                    selectedVariant,
                                    variantAttributes,
                                    selectedAttributes,
                                    onAttributeToggle,
                                    onSelectAll
                                }) => {
    return (
        <>
            <Typography variant="h6" component="h2" gutterBottom>
                Select {selectedVariant.variant_name || selectedVariant.name} Options
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
                Choose which options to include in this customization:
            </Typography>

            <Box sx={{ mt: 2, mb: 2 }}>
                <Button variant="outlined" onClick={onSelectAll} sx={{ mb: 2 }}>
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
                                onClick={() => onAttributeToggle(attribute)}
                            >
                                <Checkbox
                                    checked={selectedAttributes.includes(attribute)}
                                    // onChange={(e) => {
                                    //     e.stopPropagation();
                                    //     onAttributeToggle(attribute)
                                    // }}
                                    style={{ marginRight: "8px" }}
                                />
                                <Typography sx={{ flex: 1 }}>{attributeValue}</Typography>
                                {hasImages && (
                                    <Box sx={{ ml: 2, display: 'flex', gap: 0.5, opacity: 0.7 }}>
                                        {attribute.preview_image && (
                                            <Box sx={{ width: 24, height: 24, borderRadius: '2px', overflow: 'hidden' }}>
                                                <img
                                                    src={attribute.preview_image}
                                                    alt="Preview"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </Box>
                                        )}
                                        {attribute.thumbnail && (
                                            <Box sx={{ width: 24, height: 24, borderRadius: '2px', overflow: 'hidden' }}>
                                                <img
                                                    src={attribute.thumbnail}
                                                    alt="Thumbnail"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
};

export default VariantOptionsSelector;
