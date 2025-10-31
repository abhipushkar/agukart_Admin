// ProductIdentity/ProductIdentity.jsx
import * as React from "react";
import FormControl from "@mui/material/FormControl";
import {
    Autocomplete,
    Box,
    TextField,
    Typography,
    Button,
    Grid,
    Card, FormLabel, RadioGroup, FormControlLabel, Radio
} from "@mui/material";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { useEffect, useState } from "react";
import { useProductFormStore } from "../../../../states/useAddProducts";
import ProductTitleEditor from "./components/ProductTitleEditor";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import ImageGrid from "./components/images/ImageGrid";
import CropImage from "./components/images/CropImage";
import VideoGrid from "./components/videos/VideoGrid";
import { v4 as uuidv4 } from "uuid";

const ProductIdentity = ({ store, currentTab, tabIndex }) => {
    const {
        formData,
        setFormData,
        inputErrors,
        setInputErrors,
        altText,
        setAltText,
        setVarientName,
        setDynamicField,
        brandList,
        allCategory,
        allVendors,
    } = useProductFormStore();

    const [openEdit, setOpenEdit] = useState(false);
    const imageInputRef = React.useRef(null);
    const videoInputRef = React.useRef(null);

    const auth_key = localStorage.getItem(localStorageKey.auth_key);
    const designation_id = localStorage.getItem(localStorageKey.designation_id);

    // Get primary image
    const primaryImage = formData.images.find(img => img.isPrimary) || formData.images[0];

    const handleFieldChange = (field, value) => {
        setFormData({ [field]: value });

        // Clear error when field is updated
        if (inputErrors[field]) {
            setInputErrors({ [field]: "" });
        }
    };

    const handleVendorChange = (newValue) => {
        handleFieldChange('vendor', newValue ? newValue._id : "");
    };

    const handleCategoryChange = (newValue) => {
        handleFieldChange('subCategory', newValue ? newValue._id : "");
    };

    const handleBrandChange = (newValue) => {
        handleFieldChange('brandName', newValue ? newValue._id : "");
    };

    const handleSKUChange = (event) => {
        const { value } = event.target;
        handleFieldChange('sellerSku', value);
    };

    // Image handling functions
    const handleImageButtonClick = () => {
        imageInputRef.current.click();
    };

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);

        if (formData.images.length + files.length > 15) {
            handleOpen("error", "Maximum 15 images allowed");
            return;
        }

        const newImages = files.map((file, index) => ({
            src: URL.createObjectURL(file),
            file: file,
            _id: uuidv4(),
            isPrimary: formData.images.length === 0 && index === 0,
            sortOrder: formData.images.length + index + 1
        }));

        const updatedImages = [...formData.images, ...newImages];
        const updatedAltText = [...altText, ...new Array(files.length).fill("")];

        // Update sort orders for all images
        updatedImages.forEach((img, idx) => {
            if (img.file) {
                img.file.sortOrder = idx + 1;
            } else {
                img.sortOrder = idx + 1;
            }
            img.isPrimary = idx === 0;
        });

        setFormData({ images: updatedImages });
        setAltText(updatedAltText);

        // Clear the file input
        event.target.value = '';
    };

    // Video handling functions
    const handleVideoButtonClick = () => {
        videoInputRef.current.click();
    };

    const handleVideoUpload = (event) => {
        const files = Array.from(event.target.files);

        if (formData.videos.length + files.length > 2) {
            handleOpen("error", "Maximum 2 videos allowed");
            return;
        }

        const newVideos = files.map((file, index) => ({
            src: URL.createObjectURL(file),
            file: file,
            _id: uuidv4(),
            sortOrder: formData.videos.length + index + 1
        }));

        const updatedVideos = [...formData.videos, ...newVideos];

        // Update sort orders for all videos
        updatedVideos.forEach((video, idx) => {
            if (video.file) {
                video.file.sortOrder = idx + 1;
            } else {
                video.sortOrder = idx + 1;
            }
        });

        setFormData({ videos: updatedVideos });

        // Clear the file input
        event.target.value = '';
    };

    const handleEditPopup = () => {
        if (formData.images.length === 0) {
            handleOpen("error", "Please upload images first");
            return;
        }
        setOpenEdit(true);
    };

    // Fetch variations when category changes
    const getCategoryData = async () => {
        if (formData?.subCategory) {
            try {
                const res = await ApiService.get(`${apiEndpoints.GetVariantCategories}/${formData?.subCategory}`, auth_key);
                if (res.status === 200) {
                    setVarientName(res?.data?.parent || []);
                }
            } catch (error) {
                console.error("Error fetching variants:", error);
            }
        }
    };

    const fetchDynamicFields = async () => {
        try {
            const res = await ApiService.get(`${apiEndpoints.GetAttributesCategories}/${formData?.subCategory}`, auth_key);
            if (res.status === 200) {
                setDynamicField(res?.data?.attributeLists || []);
            } else {
                setDynamicField([]);
            }
        } catch (error) {
            setDynamicField([]);
            console.error("Error fetching dynamic fields:", error);
        }
    };

    useEffect(() => {
            getCategoryData();
            fetchDynamicFields();
    }, [formData?.subCategory]);

    const handleEditClose = () => {
        setOpenEdit(false);
    };

    const handleOpen = (type, message) => {
        // You can integrate with your notification system here
        console.log(`${type}: ${message}`);
        // For now, we'll use alert but you can replace with your toast/notification system
        alert(`${type}: ${message}`);
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
            {/* Shop Name Field (Conditional) */}
            {designation_id === "2" && (
                <Box
                    sx={{
                        display: "flex",
                        gap: "20px",
                        alignItems: "center",
                        justifyContent: "start"
                    }}
                >
                    <Box
                        sx={{
                            fontSize: "14px",
                            fontWeight: 700,
                            width: "12.7%",
                            minWidth: "120px"
                        }}
                    >
                        Shop Name
                        <span style={{ color: "red", marginLeft: "3px" }}>*</span>:
                    </Box>
                    <Box sx={{ width: "50%" }}>
                        <Autocomplete
                            options={allVendors}
                            getOptionLabel={(option) => `${option.shopName || option.name}`}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Shop Name"
                                    placeholder="Select Shop Name"
                                    sx={{
                                        "& .MuiInputBase-root": {
                                            height: "40px"
                                        }
                                    }}
                                    error={!!inputErrors.vendor}
                                    helperText={inputErrors.vendor}
                                />
                            )}
                            value={allVendors.find((item) => item._id === formData.vendor) || null}
                            onChange={(event, newValue) => handleVendorChange(newValue)}
                            onBlur={() => {
                                if (designation_id === "2" && !formData.vendor) {
                                    setInputErrors(prev => ({ ...prev, vendor: "Shop name is Required" }));
                                }
                            }}
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                        />
                    </Box>
                </Box>
            )}

            {/* Product Title Field */}
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
                    Product Title
                    <span style={{ color: "red", marginLeft: "3px" }}>*</span>:
                </Box>
                <Box sx={{ width: "100%" }}>
                    <ProductTitleEditor
                        value={formData.productTitle}
                        onChange={(value) => handleFieldChange('productTitle', value)}
                        error={inputErrors.productTitle}
                    />
                    {inputErrors.productTitle && (
                        <Typography
                            sx={{
                                fontSize: "12px",
                                color: "#FF3D57",
                                mt: 0.5
                            }}
                        >
                            {inputErrors.productTitle}
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Category Field */}
            <Box
                sx={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center"
                }}
            >
                <Box
                    sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        width: "12.7%",
                        minWidth: "120px"
                    }}
                >
                    Sub category
                    <span style={{ color: "red", marginLeft: "3px" }}>*</span>:
                </Box>
                <Box sx={{ width: "50%" }}>
                    <FormControl fullWidth>
                        <Autocomplete
                            options={allCategory}
                            getOptionLabel={(option) => option.title}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Category"
                                    placeholder="Select Category"
                                    sx={{
                                        "& .MuiInputBase-root": {
                                            height: "40px"
                                        }
                                    }}
                                    error={!!inputErrors.subCategory}
                                    helperText={inputErrors.subCategory}
                                />
                            )}
                            value={allCategory.find((item) => item._id === formData.subCategory) || null}
                            onChange={(event, newValue) => handleCategoryChange(newValue)}
                            onBlur={() => {
                                if (!formData.subCategory) {
                                    setInputErrors(prev => ({ ...prev, subCategory: "Category is Required" }));
                                }
                            }}
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                        />
                    </FormControl>
                </Box>
            </Box>

            {/* Brand Name Field */}
            <Box
                sx={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center"
                }}
            >
                <Box
                    sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        width: "12.7%",
                        minWidth: "120px"
                    }}
                >
                    Brand Name:
                </Box>
                <Box sx={{ width: "50%" }}>
                    <FormControl fullWidth>
                        <Autocomplete
                            options={brandList}
                            getOptionLabel={(option) => option.title}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Select Brand"
                                    sx={{
                                        "& .MuiInputBase-root": {
                                            height: "40px"
                                        }
                                    }}
                                />
                            )}
                            value={brandList.find((item) => item._id === formData.brandName) || null}
                            onChange={(event, newValue) => handleBrandChange(newValue)}
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                        />
                    </FormControl>
                </Box>
            </Box>

            {/* SKU Field */}
            <Box
                sx={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center"
                }}
            >
                <Box
                    sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        width: "12.7%",
                        minWidth: "120px"
                    }}
                >
                    SKU:
                    <span style={{color: "red", fontSize: "15px", margin: "0 3px"}}>*</span>:
                </Box>
                <Box sx={{ width: "50%" }}>
                    <FormControl fullWidth>
                        <TextField
                            error={!!inputErrors.sellerSku}
                            value={formData.sellerSku}
                            helperText={inputErrors.sellerSku}
                            onBlur={() => {
                                if (!formData.sellerSku) {
                                    setInputErrors(prev => ({ ...prev, sellerSku: "Seller Sku is Required" }));
                                }
                            }}
                            onChange={handleSKUChange}
                            fullWidth
                            label="Seller Sku"
                            name="sellerSku"
                            id="seller-sku"
                            sx={{
                                "& .MuiInputBase-root": {
                                    height: "40px"
                                }
                            }}
                        />
                    </FormControl>
                </Box>
            </Box>

            {/* Images Section */}
            <Box
                sx={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "flex-start",
                    mt: 3
                }}
            >
                <Box
                    sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        width: "12.7%",
                        minWidth: "120px",
                        mt: 1
                    }}
                >
                    Images
                    <span style={{ color: "red", marginLeft: "3px" }}>*</span>:
                </Box>
                <Box sx={{ width: "100%" }}>
                    {/* Image Upload Controls */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        <Typography
                            component="div"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                                gap: "5px"
                            }}
                        >
                            <div onClick={handleImageButtonClick}>
                                <ControlPointIcon />
                            </div>
                            <div onClick={handleImageButtonClick}>Upload Multiple Files</div>
                            <input
                                multiple
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                ref={imageInputRef}
                                style={{ display: "none" }}
                            />
                        </Typography>
                        <Button
                            onClick={handleEditPopup}
                            sx={{
                                background: "#cacaca",
                                borderRadius: "4px",
                                padding: "4px 15px",
                                color: "#000",
                                '&:hover': {
                                    background: "#b0b0b0",
                                }
                            }}
                            disabled={formData.images.length === 0}
                        >
                            Edit
                        </Button>
                    </Box>

                    {/* Image Count and Status */}
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {formData.images.length} / 15 images uploaded
                        {formData.images.length > 0 && ` • First image is primary`}
                    </Typography>

                    {/* Primary Image Preview and Image Grid in same row */}
                    {formData.images.length > 0 && (
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            {/* Image Grid - Left Side */}
                            <Grid item xs={12} md={8}>
                                <ImageGrid
                                    images={formData.images}
                                    setImages={(newImages) => setFormData({ images: newImages })}
                                    altText={altText}
                                    setAltText={setAltText}
                                />
                            </Grid>

                            {/* Primary Image Preview - Right Side */}
                            <Grid item xs={12} md={4}>
                                <Card
                                    sx={{
                                        p: 2,
                                        border: "2px solid",
                                        borderColor: "primary.main",
                                        borderRadius: "8px",
                                        height: "fit-content"
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        fontWeight="bold"
                                        color="primary"
                                        sx={{ mb: 1, textAlign: "center" }}
                                    >
                                        Primary Image Preview
                                    </Typography>

                                    {/* Zoomed Preview */}
                                    <Box
                                        sx={{
                                            height: "100%",
                                            aspectRatio: "1/1",
                                            border: "2px solid grey",
                                            borderRadius: "4px",
                                            overflow: "hidden",
                                            bgcolor: "#f5f5f5",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                    >
                                        <img
                                            src={primaryImage?.src}
                                            alt="Primary preview"
                                            style={{
                                                transform: `translate3d(${formData.transformData?.x || 0}px, ${formData.transformData?.y || 0}px, 0) scale(${formData.transformData?.scale || 1})`,
                                                transformOrigin: 'center center',
                                                maxWidth: '100%',
                                                maxHeight: '100%',
                                                aspectRatio: "1/1",
                                                objectFit: 'contain'
                                            }}
                                        />
                                    </Box>

                                    {/* Transform Data Info */}
                                    <Box sx={{ mt: 1, textAlign: "center" }}>
                                        <Typography variant="caption" color="textSecondary">
                                            Scale: {(formData.transformData?.scale || 1).toFixed(1)}x
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary" display="block">
                                            Position: X:{formData.transformData?.x || 0}, Y:{formData.transformData?.y || 0}
                                        </Typography>
                                    </Box>
                                </Card>
                            </Grid>
                        </Grid>
                    )}

                    {/* Show ImageGrid alone when no images */}
                    {formData.images.length === 0 && (
                        <ImageGrid
                            images={formData.images}
                            setImages={(newImages) => setFormData({ images: newImages })}
                            altText={altText}
                            setAltText={setAltText}
                        />
                    )}

                    {inputErrors.images && (
                        <Typography
                            sx={{
                                fontSize: "12px",
                                color: "#FF3D57",
                                mt: 0.5
                            }}
                        >
                            {inputErrors.images}
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Videos Section */}
            <Box
                sx={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "flex-start",
                    mt: 3
                }}
            >
                <Box
                    sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                        width: "12.7%",
                        minWidth: "120px",
                        mt: 1
                    }}
                >
                    Videos:
                </Box>
                <Box sx={{ width: "50%" }}>
                    {/* Video Upload Controls */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        <Typography
                            component="div"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                                gap: "5px"
                            }}
                        >
                            <div onClick={handleVideoButtonClick}>
                                <ControlPointIcon />
                            </div>
                            <div onClick={handleVideoButtonClick}>Upload Video Files</div>
                            <input
                                multiple
                                type="file"
                                accept="video/*"
                                onChange={handleVideoUpload}
                                ref={videoInputRef}
                                style={{ display: "none" }}
                            />
                        </Typography>
                    </Box>

                    {/* Video Count and Status */}
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {formData.videos.length} / 2 videos uploaded
                    </Typography>

                    {/* Video Grid Preview */}
                    <VideoGrid
                        videos={formData.videos}
                        setVideos={(newVideos) => setFormData({ videos: newVideos })}
                    />
                </Box>
            </Box>

            {/* Crop Image Modal */}
            <CropImage
                openEdit={openEdit}
                handleEditClose={handleEditClose}
                handleOpen={handleOpen}
            />
        </Box>
    );
};

export default ProductIdentity;
