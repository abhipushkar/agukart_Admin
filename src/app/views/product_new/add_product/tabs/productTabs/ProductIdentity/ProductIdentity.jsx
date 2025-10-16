// ProductIdentity/ProductIdentity.jsx
import * as React from "react";
import FormControl from "@mui/material/FormControl";
import {
    Autocomplete,
    Box,
    TextField,
    Typography,
    Button,
    IconButton,
    Grid
} from "@mui/material";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { useEffect, useState } from "react";
import { useProductFormStore } from "../../../../states/useAddProducts";
import ProductTitleEditor from "./components/ProductTitleEditor";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import ImageGrid from "./components/images/ImageGrid";

const ProductIdentity = ({ store, currentTab, tabIndex }) => {
    const {
        formData,
        setFormData,
        inputErrors,
        setInputErrors,
        altText,
        setAltText,
        transformData,
        setTransformData
    } = useProductFormStore();

    const [brandlist, setBrandList] = useState([]);
    const [allCategory, setAllCategory] = useState([]);
    const [allVendors, setAllVendors] = useState([]);
    const [openEdit, setOpenEdit] = useState(false);
    const inputFileRef = React.useRef(null);

    const auth_key = localStorage.getItem(localStorageKey.auth_key);
    const designation_id = localStorage.getItem(localStorageKey.designation_id);

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await Promise.all([
                    getBrandList(),
                    getChildCategory(),
                    designation_id === "2" ? getVendorList() : Promise.resolve()
                ]);
            } catch (error) {
                console.error("Error fetching initial data:", error);
            }
        };

        fetchInitialData();
    }, [designation_id]);

    const getBrandList = async () => {
        try {
            const res = await ApiService.get(apiEndpoints.getBrand, auth_key);
            if (res.status === 200) {
                setBrandList(res?.data?.brand);
            }
        } catch (error) {
            console.error("Error fetching brands:", error);
        }
    };

    const getVendorList = async () => {
        try {
            const res = await ApiService.get(apiEndpoints.getVendorsList, auth_key);
            if (res?.status === 200) {
                setAllVendors(res?.data?.data);
            }
        } catch (error) {
            console.error("Error fetching vendors:", error);
        }
    };

    const getChildCategory = async () => {
        try {
            const res = await ApiService.get(apiEndpoints.getChildCategory, auth_key);
            if (res.status === 200) {
                setAllCategory(res?.data?.data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

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
    const handleButtonClick = () => {
        inputFileRef.current.click();
    };

    const handleEditPopup = () => {
        setOpenEdit(true);
    };

    const handleEditClose = () => {
        setOpenEdit(false);
    };

    const handleOpen = (type, message) => {
        // You can integrate with your notification system here
        console.log(`${type}: ${message}`);
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
                            options={brandlist}
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
                            value={brandlist.find((item) => item._id === formData.brandName) || null}
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
                <Box sx={{ width: "50%" }}>
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
                            <div onClick={handleButtonClick}>
                                <ControlPointIcon />
                            </div>
                            <div onClick={handleButtonClick}>Upload Multiple Files</div>
                            <input
                                multiple
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    // This will be handled by the ImageGrid component
                                }}
                                ref={inputFileRef}
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
                        >
                            Edit
                        </Button>
                    </Box>

                    {/* Image Grid Preview */}
                    <ImageGrid
                        images={formData.images}
                        setImages={(newImages) => setFormData({ images: newImages })}
                        altText={altText}
                        setAltText={setAltText}
                    />

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

             {/*Crop Image Modal*/}
            {/*<CropImage*/}
            {/*    openEdit={openEdit}*/}
            {/*    handleEditClose={handleEditClose}*/}
            {/*    imgs={formData.images}*/}
            {/*    setImgs={(newImages) => setFormData({ images: newImages })}*/}
            {/*    setFormData={setFormData}*/}
            {/*    formData={formData}*/}
            {/*    alts={altText}*/}
            {/*    setAlts={setAltText}*/}
            {/*    handleOpen={handleOpen}*/}
            {/*    transformData={transformData}*/}
            {/*    setTransformData={setTransformData}*/}
            {/*/>*/}
        </Box>
    );
};

export default ProductIdentity;
