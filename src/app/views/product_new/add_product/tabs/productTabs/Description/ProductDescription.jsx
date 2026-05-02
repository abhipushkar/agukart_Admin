// Description/Description.jsx
import React from "react";
import { Box, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { useProductFormStore } from "../../../../states/useAddProducts";
import ReactQuillDescription from "./components/ReactQuillDescription";
import ReactQuillBulletPoints from "./components/ReactQuillBulletPoints";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
const ProductDescription = ({ store, currentTab, tabIndex }) => {
    const {
        formData,
        setFormData,
        inputErrors,
        setInputErrors
    } = useProductFormStore();
    const [aiText, setAiText] = React.useState("");
    const [originalText, setOriginalText] = React.useState("");
    const [openSuggestion, setOpenSuggestion] = React.useState(false);
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
                        width: "15%",
                        minWidth: "120px",
                        mt: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start"
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: "14px",
                            fontWeight: 700,
                            lineHeight: 1.4
                        }}
                    >
                        Product Description
                        <span style={{ color: "red", marginLeft: "3px" }}>*</span>:
                    </Typography>

                    <Box
                        onClick={() => {
                            setOpenSuggestion(true);
                            setOriginalText(formData.productDescription || "");
                        }}
                        sx={{
                            mt: 0.7,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "#1976d2",   // 👈 same color
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            '&:hover': {
                                color: "#1259a7"
                            }
                        }}
                    >
                        <AutoAwesomeIcon sx={{ fontSize: 18, color: "#1976d2" }} />
                        Suggestion
                    </Box>
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
            <Dialog
                open={openSuggestion}
                onClose={() => setOpenSuggestion(false)}
                fullWidth
                maxWidth="lg"
                PaperProps={{
                    sx: {
                        height: "90vh"   // height control by here 
                    }
                }}
            >
                <DialogTitle>
                    Product Description Suggestion
                </DialogTitle>
                <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {/* AI Section */}
                    <Box>
                        <Typography sx={{ fontWeight: 600, mb: 1, color: "#1976d2" }}>
                            AI Suggested Description
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            minRows={8}
                            value={aiText}
                            onChange={(e) => setAiText(e.target.value)}
                            placeholder="Click generate to get AI suggestion..."
                        />
                        <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                            <Button variant="outlined" size="small">
                                <AutoAwesomeIcon sx={{ fontSize: 18, color: "#1976d2" }} />
                                Regenerate
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => setOriginalText(aiText)}
                            >
                                Use AI
                            </Button>
                        </Box>
                    </Box>
                    {/* Original Section */}
                    <Box>
                        <Typography sx={{ fontWeight: 600, mb: 1 }}>
                            Original Description
                        </Typography>
                        <ReactQuillDescription
                            value={originalText}
                            onChange={(value) => setOriginalText(value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSuggestion(false)}>
                        Close
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setFormData({ productDescription: originalText });
                            setOpenSuggestion(false);
                        }}
                    >
                        Add to Form
                    </Button>
                </DialogActions>
            </Dialog>
            {/**!/*/}
        </Box>
    );
};
export default ProductDescription;