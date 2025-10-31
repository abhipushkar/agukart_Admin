// components/TextCustomization.jsx
import React from 'react';
import { Box, TextField, Checkbox } from "@mui/material";
import {useProductFormStore} from "../../../../../states/useAddProducts";

const TextCustomization = ({ index }) => {
    const { customizationData, setCustomizationData } = useProductFormStore();

    const handleTextFormChange = (e) => {
        const { name, value } = e.target;
        if (name === "label" && value.length > 100) return;
        if (name === "instructions" && value.length > 200) return;

        const updatedCustomizations = customizationData.customizations.map((item, idx) =>
            idx === index ? { ...item, [name]: value } : item
        );

        setCustomizationData({
            ...customizationData,
            customizations: updatedCustomizations
        });
    };

    const handleCheckboxChange = (checked) => {
        const updatedCustomizations = customizationData.customizations.map((item, idx) =>
            idx === index ? { ...item, isCompulsory: checked } : item
        );

        setCustomizationData({
            ...customizationData,
            customizations: updatedCustomizations
        });
    };

    const customization = customizationData.customizations[index];

    return (
        <Box>
            <Box sx={{ fontSize: "16px", fontWeight: "600" }}>Text Input</Box>
            <Box sx={{ fontSize: "13px", fontWeight: "600", color: "gray" }}>
                Define the text Input Specifications
            </Box>

            <Box sx={{ display: "flex", marginTop: "20px", justifyContent: "space-between" }}>
                <Box sx={{ width: "100%" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Box sx={{ width: "45%" }}>
                            <Box sx={{ fontSize: "14px", fontWeight: "700", wordBreak: "normal", textWrap: "nowrap", width: "15%" }}>
                                Label :
                            </Box>
                            <Box sx={{ width: "100%", maxWidth: "100%" }}>
                                <TextField
                                    fullWidth
                                    label="Surface 1"
                                    name="label"
                                    value={customization?.label || ""}
                                    onChange={handleTextFormChange}
                                />
                                {`You Have ${100 - (customization?.label?.length || 0)} of 100 characters remaining`}
                            </Box>
                        </Box>
                        <Box sx={{ width: "45%" }}>
                            <Box sx={{ fontSize: "14px", fontWeight: "700", wordBreak: "normal", textWrap: "nowrap", width: "15%" }}>
                                Placeholder :
                            </Box>
                            <Box sx={{ width: "100%", maxWidth: "100%" }}>
                                <TextField
                                    fullWidth
                                    label="Surface 1"
                                    name="placeholder"
                                    value={customization?.placeholder || ""}
                                    onChange={handleTextFormChange}
                                />
                                {`You Have ${100 - (customization?.placeholder?.length || 0)} of 100 characters remaining`}
                            </Box>
                        </Box>
                        <Box sx={{ width: "50%" }}>
                            <Box sx={{ fontSize: "14px", fontWeight: "700", wordBreak: "normal", textWrap: "nowrap" }}>
                                Instructions(Optional) :
                            </Box>
                            <Box sx={{ width: "100%", maxWidth: "100%" }}>
                                <TextField
                                    fullWidth
                                    label="Surface 1"
                                    multiline
                                    name="instructions"
                                    value={customization?.instructions || ""}
                                    onChange={handleTextFormChange}
                                />
                                {`You Have ${200 - (customization?.instructions?.length || 0)} of 200 characters remaining`}
                            </Box>
                        </Box>
                        <Box sx={{ width: "50%" }}>
                            <Box sx={{ fontSize: "14px", fontWeight: "700", wordBreak: "normal", textWrap: "nowrap" }}>
                                Compulsory :
                            </Box>
                            <Box sx={{ width: "100%", maxWidth: "100%" }}>
                                <Checkbox
                                    checked={customization?.isCompulsory || false}
                                    onChange={(e) => handleCheckboxChange(e.target.checked)}
                                    name="isCompulsory"
                                    color="primary"
                                />
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ display: "flex", marginTop: "20px", justifyContent: "space-between" }}>
                <Box>
                    <Box sx={{ fontSize: "14px", fontWeight: "700", wordBreak: "normal", textWrap: "nowrap", width: "15%" }}>
                        Price:
                    </Box>
                    <Box sx={{ width: "100%", maxWidth: "100%" }}>
                        <TextField
                            fullWidth
                            label="Price"
                            name="price"
                            value={customization?.price || ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*\.?\d*$/.test(value)) {
                                    handleTextFormChange(e);
                                }
                            }}
                        />
                    </Box>
                </Box>
                <Box>
                    <Box sx={{ fontSize: "14px", fontWeight: "700", wordBreak: "normal", textWrap: "nowrap", width: "15%" }}>
                        Character Minimum Limit:
                    </Box>
                    <Box sx={{ width: "100%", maxWidth: "100%" }}>
                        <TextField
                            fullWidth
                            label="Min"
                            name="min"
                            value={customization?.min || ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*\.?\d*$/.test(value)) {
                                    handleTextFormChange(e);
                                }
                            }}
                        />
                    </Box>
                </Box>
                <Box>
                    <Box sx={{ fontSize: "14px", fontWeight: "700", wordBreak: "normal", textWrap: "nowrap", width: "15%" }}>
                        Character Maximum Limit:
                    </Box>
                    <Box sx={{ width: "100%", maxWidth: "100%" }}>
                        <TextField
                            fullWidth
                            label="Max"
                            name="max"
                            value={customization?.max || ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*\.?\d*$/.test(value)) {
                                    handleTextFormChange(e);
                                }
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default TextCustomization;
