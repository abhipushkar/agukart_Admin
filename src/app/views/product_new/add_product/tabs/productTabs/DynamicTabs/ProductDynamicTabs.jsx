// ProductDynamicTabs/ProductDynamicTabs.jsx
import React, { useState } from "react";
import {
    Box,
    Typography,
    Button,
    TextField,
    IconButton,
    Card,
    CardContent,
    Grid,
    Divider
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useProductFormStore } from "../../../../states/useAddProducts";
import TabContentEditor from "./components/TabContentEditor";

const ProductDynamicTabs = () => {
    const {
        formData,
        setFormData,
        inputErrors,
        setInputErrors
    } = useProductFormStore();

    const [isAdding, setIsAdding] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [newTab, setNewTab] = useState({ title: "", description: "" });

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewTab((prev) => ({ ...prev, [name]: value }));

        // Clear error when field is updated
        if (inputErrors[name]) {
            setInputErrors({ [name]: "" });
        }
    };

    // Handle description change from editor
    const handleDescriptionChange = (value) => {
        setNewTab((prev) => ({ ...prev, description: value }));

        // Clear error when content is added
        if (inputErrors.description && value && value !== "<p><br></p>") {
            setInputErrors({ description: "" });
        }
    };

    // Add new tab
    const saveTab = () => {
        if (!newTab.title.trim()) {
            setInputErrors({ title: "Tab title is required" });
            return;
        }

        if (!newTab.description || newTab.description === "<p><br></p>") {
            setInputErrors({ description: "Tab content is required" });
            return;
        }

        const updatedTabs = [...(formData.tabs || []), newTab];
        setFormData({ tabs: updatedTabs });
        setNewTab({ title: "", description: "" });
        setIsAdding(false);
        setInputErrors({ title: "", description: "" });
    };

    // Enable edit mode
    const enableEdit = (index) => {
        setEditIndex(index);
        setNewTab({
            title: formData.tabs[index]?.title || "",
            description: formData.tabs[index]?.description || ""
        });
        setIsAdding(false);
    };

    // Cancel edit
    const cancelEdit = () => {
        setEditIndex(null);
        setNewTab({ title: "", description: "" });
        setInputErrors({ title: "", description: "" });
    };

    // Save edited tab
    const saveEdit = () => {
        if (!newTab.title.trim()) {
            setInputErrors({ title: "Tab title is required" });
            return;
        }

        if (!newTab.description || newTab.description === "<p><br></p>") {
            setInputErrors({ description: "Tab content is required" });
            return;
        }

        const updatedTabs = [...formData.tabs];
        updatedTabs[editIndex] = {
            title: newTab.title,
            description: newTab.description
        };
        setFormData({ tabs: updatedTabs });
        setEditIndex(null);
        setNewTab({ title: "", description: "" });
        setInputErrors({ title: "", description: "" });
    };

    // Delete tab
    const deleteTab = (index) => {
        const updatedTabs = formData.tabs.filter((_, i) => i !== index);
        setFormData({ tabs: updatedTabs });

        if (editIndex === index) {
            setEditIndex(null);
            setNewTab({ title: "", description: "" });
        }
    };

    // Cancel add
    const cancelAdd = () => {
        setIsAdding(false);
        setNewTab({ title: "", description: "" });
        setInputErrors({ title: "", description: "" });
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
            {/* Header Section */}
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
                    Product Tabs
                    <span style={{ color: "red", marginLeft: "3px" }}>*</span>:
                </Box>
                <Box sx={{ width: "100%" }}>
                    <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 2 }}
                    >
                        Add additional information tabs to your product (e.g., Specifications, Care Instructions, etc.)
                    </Typography>

                    {/* Existing Tabs List */}
                    {formData.tabs?.map((tab, index) => (
                        <Card
                            key={index}
                            sx={{
                                mb: 2,
                                border: "1px solid #e0e0e0",
                                position: "relative"
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontSize: "16px",
                                                fontWeight: 600,
                                                mb: 1
                                            }}
                                        >
                                            {tab.title}
                                        </Typography>
                                        <Box
                                            sx={{
                                                "& .ql-editor": {
                                                    padding: 0,
                                                    fontSize: "14px",
                                                    lineHeight: 1.6,
                                                    minHeight: "auto"
                                                },
                                                "& .ql-editor p": {
                                                    marginBottom: "8px"
                                                },
                                                "& .ql-editor ul, & .ql-editor ol": {
                                                    paddingLeft: "20px"
                                                }
                                            }}
                                            dangerouslySetInnerHTML={{ __html: tab.description }}
                                        />
                                    </Box>
                                    <Box sx={{ display: "flex", gap: 1, ml: 2 }}>
                                        <IconButton
                                            onClick={() => enableEdit(index)}
                                            size="small"
                                            color="primary"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => deleteTab(index)}
                                            size="small"
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Add/Edit Form */}
                    {(isAdding || editIndex !== null) && (
                        <Card sx={{ mt: 2, border: "2px solid", borderColor: "primary.main" }}>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontSize: "16px",
                                        fontWeight: 600,
                                        mb: 2,
                                        color: "primary.main"
                                    }}
                                >
                                    {editIndex !== null ? `Edit Tab: ${formData.tabs[editIndex]?.title}` : "Add New Tab"}
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Tab Title"
                                            name="title"
                                            variant="outlined"
                                            size="small"
                                            value={newTab.title}
                                            onChange={handleChange}
                                            error={!!inputErrors.title}
                                            helperText={inputErrors.title}
                                            fullWidth
                                            placeholder="Enter tab title (e.g., Specifications, Care Instructions)"
                                            onBlur={() => {
                                                if (!newTab.title.trim()) {
                                                    setInputErrors(prev => ({ ...prev, title: "Tab title is required" }));
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                mb: 1,
                                                fontWeight: 500
                                            }}
                                        >
                                            Tab Content
                                            <span style={{ color: "red", marginLeft: "3px" }}>*</span>
                                        </Typography>
                                        <Box sx={{
                                            border: inputErrors.description ? "1px solid #d32f2f" : "1px solid #e0e0e0",
                                            borderRadius: "4px",
                                            overflow: "hidden"
                                        }}>
                                            <TabContentEditor
                                                value={newTab.description}
                                                onChange={handleDescriptionChange}
                                                error={inputErrors.description}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            {editIndex !== null ? (
                                                <>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={saveEdit}
                                                        size="small"
                                                    >
                                                        Save Changes
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        onClick={cancelEdit}
                                                        size="small"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        onClick={saveTab}
                                                        size="small"
                                                    >
                                                        Save Tab
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        onClick={cancelAdd}
                                                        size="small"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </>
                                            )}
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    )}

                    {/* Add New Tab Button - Only show when not adding/editing */}
                    {!(!formData.tabs || formData.tabs.length === 0) && !isAdding && editIndex === null && (
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => setIsAdding(true)}
                            sx={{ mt: 1 }}
                        >
                            Add New Tab
                        </Button>
                    )}

                    {/* Empty State */}
                    {(!formData.tabs || formData.tabs.length === 0) && !isAdding && (
                        <Card
                            sx={{
                                textAlign: "center",
                                py: 4,
                                border: "2px dashed #e0e0e0",
                                backgroundColor: "#fafafa"
                            }}
                        >
                            <CardContent>
                                <Typography
                                    variant="body1"
                                    color="textSecondary"
                                    sx={{ mb: 2 }}
                                >
                                    No tabs added yet. Add your first tab to provide additional product information.
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => setIsAdding(true)}
                                >
                                    Add First Tab
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </Box>
            </Box>

            {/* Validation Error */}
            {inputErrors.tabs && (
                <Box
                    sx={{
                        display: "flex",
                        gap: "20px",
                        alignItems: "center"
                    }}
                >
                    <Box sx={{ width: "15%", minWidth: "120px" }}></Box>
                    <Box sx={{ width: "100%" }}>
                        <Typography
                            sx={{
                                fontSize: "12px",
                                color: "#FF3D57",
                                mt: 0.5
                            }}
                        >
                            {inputErrors.tabs}
                        </Typography>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default ProductDynamicTabs;
