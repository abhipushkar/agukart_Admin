import { Box, Dialog, Typography } from '@mui/material';
import React from 'react'
import Button from "@mui/material/Button";
import { useState } from 'react';
import { ApiService } from "app/services/ApiService";
import CloseIcon from "@mui/icons-material/Close";
import { localStorageKey } from "app/constant/localStorageKey";
import { apiEndpoints } from "app/constant/apiEndpoints";
import TextField from "@mui/material/TextField";
import { useEffect } from 'react';
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { REACT_APP_WEB_URL } from 'config';
import MessagePopup from './MessagePopup';

const Product = ({ saleData, baseUrl, getOrderList, handleOpen, item, vendorData }) => {
    console.log({ saleData, item, vendorData }, "trhththtt")
    const [openPopup, SetOpenPopup] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);  // For image preview modal
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const auth_key = localStorage.getItem(localStorageKey.auth_key);
    const [stock, setStock] = useState(0);
    const [combinationStockId, setCombinationStockId] = useState([]);
    const [openPop, setOpenPop] = useState(false);

    const popClose = () => {
        setOpenPop(false);
    };

    const handleClickPopup = () => {
        SetOpenPopup(true);
    };

    const handleClosePopup = () => {
        SetOpenPopup(false);
    };

    // Handle image click for preview
    const handleImageClick = () => {
        setImageModalOpen(true);
    };

    const closeImageModal = () => {
        setImageModalOpen(false);
        setCurrentImageIndex(0);
    };

    const goToNextImage = () => {
        if (saleData?.productData?.image && saleData.productData.image.length > 0) {
            setCurrentImageIndex((prev) =>
                prev === saleData.productData.image.length - 1 ? 0 : prev + 1
            );
        }
    };

    const goToPrevImage = () => {
        if (saleData?.productData?.image && saleData.productData.image.length > 0) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? saleData.productData.image.length - 1 : prev - 1
            );
        }
    };

    const updateQty = async () => {
        try {
            const payload = {
                _id: saleData?.productMain?._id,
                qty: stock,
                isCombination: saleData?.isCombination,
                combinationData: combinationStockId
            };
            const res = await ApiService.post(apiEndpoints.updateProductQuantity, payload, auth_key);
            if (res?.status === 200) {
                popClose();
                getOrderList();
            }
        } catch (error) {
            handleOpen("error", error);
        }
    };

    const getCombinations = (arr) => {
        let combinations = arr.map(item =>
            [item]
        );
        if (arr.length > 1) {
            for (let i = 0; i < arr.length; i++) {
                for (let j = i + 1; j < arr.length; j++) {
                    combinations.push([arr[i], arr[j]]);
                }
            }
        }
        return combinations;
    };

    const handleClickOpen = () => {
        setOpenPop(true);
    };

    useEffect(() => {
        if (saleData?.isCombination && saleData?.productMain?.form_values?.isCheckedQuantity) {
            const variantCombinations = getCombinations(saleData?.variant_attribute_id);
            const mergedCombinations = saleData?.productMain?.combinationData?.map((item) => item.combinations).flat();
            const data = mergedCombinations?.filter((item) =>
                variantCombinations?.some((combination) =>
                    Array.isArray(item?.combIds) && Array.isArray(combination) &&
                    JSON.stringify(item?.combIds) === JSON.stringify(combination)
                )
            );
            if (data.length <= 1) {
                if (data[0]?.isVisible && +data[0]?.qty > 0 && data[0]?.isCheckedQuantity) {
                    setStock(+data[0]?.qty);
                    setCombinationStockId(data[0]?.combIds);
                } else {
                    setStock(+saleData?.productMain?.qty);
                }
            } else {
                console.log(data, "Rthryhryhrt")
                data.forEach((item) => {
                    if (item.isVisible && item?.isCheckedQuantity) {
                        if (+item.qty > 0) {
                            setStock(+item.qty);
                            setCombinationStockId(item?.combIds);
                        }
                    }
                });
                if (!data.some((item) => +item.qty > 0 && item.isVisible)) {
                    setStock(+saleData?.productMain?.qty);
                }
            }
        } else {
            setStock(+saleData?.productMain?.qty);
        }
    }, [saleData])

    // Helper function to get display value or fallback
    const getDisplayValue = (value, fallback = "...") => {
        if (value === null || value === undefined || value === "") {
            return fallback;
        }
        return value;
    };

    return (
        <>
            <Box sx={{ display: "flex" }}>
                <Box
                    sx={{
                        cursor: "pointer",
                        position: "relative",
                        width: 150, height: 150, borderRadius: 2, overflow: "hidden"
                    }}
                    textAlign={"start"}
                    marginRight={2}
                >
                    {/* Image click now opens preview modal instead of navigating */}
                    <div onClick={handleImageClick} style={{ cursor: 'pointer' }}>
                        <img
                            src={
                                saleData?.productData?.image?.[0]
                                    ? `${baseUrl}/${saleData.productData.image[0]}`
                                    : saleData?.productMain?.image?.[0]
                                        ? `${baseUrl}/${saleData.productMain.image[0]}`
                                        : ''
                            }
                            style={{ width: "100%", height: "100%", borderRadius: 2, objectFit: "cover" }}
                            alt="product"
                        />
                    </div>

                    {stock > 0 ? (
                        <Box
                            component="span"
                            sx={{
                                position: "absolute",
                                bottom: "0px",
                                left: "0px",
                                background: "#000",
                                color: "#fff",
                                padding: "3px 9px",
                                borderRadius: "5px",
                                fontSize: "10px"
                            }}
                        >
                            Left {stock}
                        </Box>
                    ) : (
                        <Box
                            component="span"
                            sx={{
                                position: "absolute",
                                bottom: "0px",
                                left: "0px",
                                background: "red",
                                color: "#fff",
                                padding: "3px 9px",
                                borderRadius: "5px",
                                fontSize: "10px"
                            }}
                        >
                            Sold
                        </Box>
                    )}
                </Box>
                <Box textAlign={"start"}>
                    {/* Product title - click navigates to product page */}
                    <a
                        href={`${REACT_APP_WEB_URL}/products/${saleData?.productData?._id}`}
                        target="_blank"
                        style={{
                            textDecoration: 'none',
                            color: 'inherit',
                            cursor: 'pointer'
                        }} rel="noreferrer"
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: "3",
                                WebkitBoxOrient: "vertical",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                fontWeight: "500",
                                fontSize: "15px",
                                maxWidth: { xs: "100%", md: "400px" },
                                '&:hover': {
                                    textDecoration: 'underline'
                                }
                            }}
                        >
                            {saleData?.productData?.product_title
                                ? saleData.productData.product_title.replace(/<\/?[^>]+(>|$)/g, "")
                                : saleData?.productMain?.product_title?.replace(/<\/?[^>]+(>|$)/g, "")
                            }
                        </Typography>
                    </a>

                    <Typography fontSize={14} sx={{ color: "#000" }}>
                        Product SKU:{" "}
                        <Box component="span">
                            {getDisplayValue(saleData?.productData?.sku_code || saleData?.productMain?.sku_code)}
                        </Box>
                    </Typography>
                    <Typography fontSize={14} sx={{ color: "#000" }}>
                        Quantity:{" "}
                        <Box component="span">
                            {getDisplayValue(saleData?.qty)}
                        </Box>
                    </Typography>

                    {/* Display Amazon-style variants (variantData and variantAttributeData) */}
                    {saleData?.isCombination === true && saleData?.variantData && saleData.variantData.length > 0 && (
                        saleData.variantData.map((variantItem, variantIndex) => (
                            <Typography
                                fontSize={14}
                                sx={{ color: "#000" }}
                                key={variantIndex}
                            >
                                {getDisplayValue(variantItem?.variant_name)}:{" "}
                                <Box component="span">
                                    {getDisplayValue(saleData?.variantAttributeData[variantIndex]?.attribute_value)}
                                </Box>
                            </Typography>
                        ))
                    )}

                    {/* Display Etsy-style internal variants (variants array) */}
                    {saleData?.variants && saleData.variants.length > 0 && (
                        saleData.variants.map((variant, index) => (
                            <Typography
                                fontSize={14}
                                sx={{ color: "#000" }}
                                key={variant._id || index}
                            >
                                {getDisplayValue(variant.variantName)}:{" "}
                                <Box component="span">
                                    {getDisplayValue(variant.attributeName)}
                                </Box>
                            </Typography>
                        ))
                    )}

                    {/* Display variant IDs if no structured variant data is available */}
                    {(saleData?.variant_id && saleData.variant_id.length > 0) &&
                        (!saleData?.variantData || saleData.variantData.length === 0) &&
                        (!saleData?.variants || saleData.variants.length === 0) && (
                            <Box>
                                <Typography fontSize={14} sx={{ color: "#000" }}>
                                    Variant IDs:{" "}
                                    <Box component="span">
                                        {saleData.variant_id.join(", ")}
                                    </Box>
                                </Typography>
                                {saleData?.variant_attribute_id && saleData.variant_attribute_id.length > 0 && (
                                    <Typography fontSize={14} sx={{ color: "#000" }}>
                                        Variant Attribute IDs:{" "}
                                        <Box component="span">
                                            {saleData.variant_attribute_id.join(", ")}
                                        </Box>
                                    </Typography>
                                )}
                            </Box>
                        )}

                    {/* Display customization data */}
                    {saleData?.customize === "Yes" && saleData?.customizationData && saleData.customizationData.length > 0 && (
                        <Box>
                            {saleData.customizationData.map((item, index) => (
                                <Box key={index}>
                                    {Object.entries(item).map(([key, value]) => (
                                        <Box key={key}>
                                            {typeof value === 'object' ? (
                                                <Typography fontSize={14} sx={{ color: "#000" }}>
                                                    {getDisplayValue(key)}:{` ${getDisplayValue(value?.value)} ($ ${getDisplayValue(value?.price)})`}
                                                </Typography>
                                            ) : (
                                                <Typography fontSize={14} sx={{ color: "#000" }}>
                                                    {getDisplayValue(key)}: {getDisplayValue(value)}
                                                </Typography>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            ))}
                        </Box>
                    )}

                    <Box mt={2}>
                        <Button
                            onClick={() => {
                                handleClickOpen(saleData);
                            }}
                            sx={{
                                padding: "4px 16px",
                                color: "#000",
                                background: "#fff",
                                borderRadius: "30px",
                                border: "1px solid #000"
                            }}
                        >
                            Update quantity
                        </Button>
                        <Button sx={{ color: "#000" }} onClick={handleClickPopup}>
                            <MailOutlineIcon />
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* Image Preview Modal */}
            <Dialog
                open={imageModalOpen}
                onClose={closeImageModal}
                maxWidth="md"
                fullWidth
            >
                <Box sx={{ position: 'relative', padding: 2 }}>
                    <Button
                        onClick={closeImageModal}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 1,
                            minWidth: 'auto',
                            padding: '4px'
                        }}
                    >
                        <CloseIcon />
                    </Button>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Button
                            onClick={goToPrevImage}
                            sx={{ minWidth: 'auto', padding: '8px' }}
                        >
                            ‹
                        </Button>

                        <Box sx={{ flex: 1, textAlign: 'center' }}>
                            {saleData?.productData?.image?.[currentImageIndex] && (
                                <img
                                    src={`${baseUrl}/${saleData.productData.image[currentImageIndex]}`}
                                    alt={`Product ${currentImageIndex + 1}`}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '500px',
                                        objectFit: 'contain'
                                    }}
                                />
                            )}
                        </Box>

                        <Button
                            onClick={goToNextImage}
                            sx={{ minWidth: 'auto', padding: '8px' }}
                        >
                            ›
                        </Button>
                    </Box>

                    {saleData?.productData?.image && saleData.productData.image.length > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                            <Typography>
                                Image {currentImageIndex + 1} of {saleData.productData.image.length}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Dialog>

            <Dialog open={openPop} onClose={popClose} sx={{ "& .MuiPaper-root": { maxWidth: "750px" } }}>
                {saleData?.productMain && (
                    <Box p={2} sx={{ position: "relative" }}>
                        <Typography variant="h4">You are about to Update 1 Listing</Typography>
                        <Box mt={2} sx={{ display: { lg: "flex", md: "flex", xs: "block" } }}>
                            {saleData?.productData?.image?.[0] ? (
                                <Box>
                                    <img
                                        src={`${baseUrl}/${saleData.productData.image[0]}`}
                                        style={{
                                            height: "200px",
                                            width: "200px",
                                            objectFit: "cover",
                                            aspectRatio: "1/1"
                                        }}
                                        alt="Product"
                                    />
                                </Box>
                            ) : saleData?.productMain?.image?.[0] && (
                                <Box>
                                    <img
                                        src={`${baseUrl}/${saleData.productMain.image[0]}`}
                                        style={{
                                            height: "200px",
                                            width: "200px",
                                            objectFit: "cover",
                                            aspectRatio: "1/1"
                                        }}
                                        alt="Product"
                                    />
                                </Box>
                            )}
                            <Box sx={{ paddingLeft: { lg: 2, md: 2, xs: 0 } }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        display: "-webkit-box",
                                        WebkitLineClamp: "3",
                                        WebkitBoxOrient: "vertical",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                        fontWeight: "500",
                                        fontSize: "17px",
                                        maxWidth: { xs: "100%", md: "400px" }
                                    }}
                                >
                                    {saleData?.productData?.product_title
                                        ? saleData.productData.product_title.replace(/<\/?[^>]+(>|$)/g, "")
                                        : saleData?.productMain?.product_title?.replace(/<\/?[^>]+(>|$)/g, "")
                                    }
                                </Typography>
                                <Typography fontSize={16} sx={{ color: "#000" }}>
                                    Quantity:{" "}
                                    <Box component="span">
                                        {getDisplayValue(saleData?.qty)}
                                    </Box>
                                </Typography>
                                <Typography fontSize={16} sx={{ color: "#000" }}>
                                    SKU: <Box component="span">
                                        {getDisplayValue(saleData?.productData?.sku_code || saleData?.productMain?.sku_code, "N/A")}
                                    </Box>
                                </Typography>

                                {/* Display variants in the popup dialog too */}
                                {/* Amazon-style variants */}
                                {saleData?.isCombination === true && saleData?.variantData && saleData.variantData.length > 0 && (
                                    saleData.variantData.map((variantItem, variantIndex) => (
                                        <Typography fontSize={16} sx={{ color: "#000" }} key={variantIndex}>
                                            {getDisplayValue(variantItem?.variant_name)}:{" "}
                                            <Box component="span">
                                                {getDisplayValue(saleData?.variantAttributeData[variantIndex]?.attribute_value)}
                                            </Box>
                                        </Typography>
                                    ))
                                )}

                                {/* Etsy-style internal variants */}
                                {saleData?.variants && saleData.variants.length > 0 && (
                                    saleData.variants.map((variant, index) => (
                                        <Typography fontSize={16} sx={{ color: "#000" }} key={variant._id || index}>
                                            {getDisplayValue(variant.variantName)}:{" "}
                                            <Box component="span">
                                                {getDisplayValue(variant.attributeName)}
                                            </Box>
                                        </Typography>
                                    ))
                                )}

                                <Typography fontSize={16} sx={{ color: "#000" }}>
                                    Personalization:{" "}
                                    <Box component="span">Not requested on this item</Box>
                                </Typography>
                                <Box mt={2}>
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <Box component="span" fontSize={14} fontWeight={500} pr={2}>
                                            Stock:
                                        </Box>
                                        <TextField
                                            type="number"
                                            value={stock}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value >= 0) {
                                                    setStock(value);
                                                }
                                            }}
                                        />
                                    </Box>
                                </Box>
                                <Box
                                    mt={2}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        width: "100%"
                                    }}
                                >
                                    <Button
                                        sx={{ color: "#000", borderRadius: "30px", padding: "4px 30px" }}
                                        onClick={popClose}
                                    >
                                        Update later
                                    </Button>
                                    <Button
                                        sx={{
                                            background: "#000",
                                            color: "#fff",
                                            borderRadius: "30px",
                                            padding: "4px 30px",
                                            "&:hover": { background: "#2e2e2e" }
                                        }}
                                        onClick={updateQty}
                                    >
                                        Update
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                        <Button
                            onClick={popClose}
                            sx={{
                                padding: "0px",
                                minWidth: "auto",
                                background: "none !important",
                                color: "#000",
                                border: "none",
                                position: "absolute",
                                top: "10px",
                                right: "10px"
                            }}
                        >
                            <CloseIcon />
                        </Button>
                    </Box>
                )}
            </Dialog>
            {
                openPopup && <MessagePopup
                    openPopup={openPopup}
                    vendorID={vendorData?.vendor_id || saleData?.vendor_id}
                    orderId={item?.order_id}
                    product_image={saleData?.productData?.image?.[0]
                        ? `${baseUrl}/${saleData.productData.image[0]}`
                        : `${baseUrl}/${saleData?.productMain?.image[0]}`
                    }
                    productData={saleData}
                    userName={item?.userName}
                    vendorName={vendorData?.vendor_name || saleData?.vendor_name}
                    userId={item?.user_idnumer}
                    userImage={item?.user_image}
                    handleClosePopup={handleClosePopup}
                />
            }
        </>
    )
}

export default Product
