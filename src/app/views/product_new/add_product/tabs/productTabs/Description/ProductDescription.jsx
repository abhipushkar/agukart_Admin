// Description/Description.jsx
import React from "react";
import {Box, Button, Typography} from "@mui/material";
import { useProductFormStore } from "../../../../states/useAddProducts";
import ReactQuillDescription from "./components/ReactQuillDescription";
import ReactQuillBulletPoints from "./components/ReactQuillBulletPoints";


const ProductDescription = ({ store, currentTab, tabIndex }) => {
    const {
        formData,
        setFormData,
        inputErrors,
        setInputErrors
    } = useProductFormStore();

    const handleDescriptionChange = (value) => {
        setFormData({ productDescription: value });

        // Clear error when description is updated
        if (inputErrors.des) {
            setInputErrors({ des: "" });
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                maxWidth: "1200px",
                mx: "auto"
            }}
        >
            {/* Product Description Field */}
            <Box
                sx={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "flex-start"
                }}
            >
                <Box
                    sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        width: "15%",
                        minWidth: "120px",
                        mt: 1
                    }}
                >
                    Product Description
                    <span style={{ color: "red", marginLeft: "3px" }}>*</span>:
                </Box>
                <Box sx={{ width: "100%" }}>
                    <ReactQuillDescription
                        value={formData.productDescription}
                        onChange={handleDescriptionChange}
                        error={inputErrors.des}
                    />
                    {inputErrors.des && (
                        <Typography
                            sx={{
                                fontSize: "12px",
                                color: "#FF3D57",
                                mt: 0.5
                            }}
                        >
                            {inputErrors.des}
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Optional: We can add bullet points here later if needed */}
            {/*/!* */}
            <Button
                sx={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "flex-start",
                }}
                disabled={true}
            >
                <Box
                    sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        width: "15%",
                        minWidth: "120px",
                        mt: 1
                    }}
                >
                    Bullet Points:
                </Box>
                <Box sx={{ width: "100%" }}>
                    <ReactQuillBulletPoints
                        value={formData.bulletPoints}
                        onChange={(value) => setFormData({ bulletPoints: value })}
                    />
                </Box>
            </Button>
            {/**!/*/}
        </Box>
    );
};

export default ProductDescription;
