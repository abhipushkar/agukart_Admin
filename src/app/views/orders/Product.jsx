// Product.jsx - Complete updated code
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
import { useCallback } from 'react';

const Product = ({ saleData, baseUrl, getOrderList, handleOpen, item, vendorData }) => {
    console.log({ saleData, item, vendorData }, "trhththtt")
    const [openPopup, SetOpenPopup] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const auth_key = localStorage.getItem(localStorageKey.auth_key);
    const [stock, setStock] = useState(0);
    const [newStock, setNewStock] = useState(null);
    const [quantityOwner, setQuantityOwner] = useState(null);
    const [matchedCombination, setMatchedCombination] = useState(null);
    const [combinationStockId, setCombinationStockId] = useState([]);
    const [openPop, setOpenPop] = useState(false);

    const popClose = () => {
        setOpenPop(false);
        setNewStock(stock);
    };

    const handleClickPopup = () => {
        SetOpenPopup(true);
    };

    const handleClosePopup = () => {
        SetOpenPopup(false);
    };

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

    // 1️⃣ SINGLE quantity owner resolver
    const determineQuantityOwner = useCallback(() => {
        const product = saleData?.productMain;
        const productQty = Number(product?.qty || 0);

        if (product.form_values?.isCheckedQuantity === false) {
            return {
                owner: 'product',
                quantity: productQty,
                source: product
            };
        }

        if (product?.form_values?.isCheckedQuantity === true) {
            return {
                owner: 'combination',
                quantity: 0, // Will be set after matching
                source: product?.combinationData || []
            };
        }

        return {
            owner: 'none',
            quantity: 0,
            source: null
        };
    }, [saleData?.productMain]);

    // 4️⃣ Matching combination rule - Only match Etsy-style internal variants
    const findMatchedCombination = useCallback((combinationsData) => {
        if (!combinationsData || combinationsData.length === 0) {
            return null;
        }

        // Get Etsy-style variants (internal variants like Ring Size)
        const internalVariants = saleData?.variants || [];

        if (internalVariants.length === 0) {
            return null;
        }

        // Extract all combinations from combinationData
        const allCombinations = combinationsData.flatMap(item => item?.combinations || []);

        // Find combination that matches ALL internal variants
        const matchedCombination = allCombinations.find(combination => {
            const combValues = combination.combValues || [];

            // Every internal variant must be found in combValues
            return internalVariants.every(internalVariant => {
                if (!internalVariant.variantName || !internalVariant.attributeName) {
                    return false;
                }

                // Create search pattern: "variantName: attributeName"
                const searchPattern = `${internalVariant.variantName}: ${internalVariant.attributeName}`;

                // Also check for variant name and attribute separately
                return combValues.some(combValue => {
                    if (!combValue) return false;

                    // Exact match with pattern
                    if (combValue === searchPattern) {
                        return true;
                    }

                    // Contains both variant name and attribute name
                    if (combValue.includes(internalVariant.variantName) &&
                        combValue.includes(internalVariant.attributeName)) {
                        return true;
                    }

                    // For simple combValues that are just the attribute value
                    if (combValue === internalVariant.attributeName) {
                        return true;
                    }

                    return false;
                });
            });
        });

        return matchedCombination;
    }, [saleData?.variants]);

    useEffect(() => {
        // Determine quantity owner once
        const ownerInfo = determineQuantityOwner();
        setQuantityOwner(ownerInfo.owner);

        if (ownerInfo.owner === 'combination') {
            // Find the matching combination for internal variants only
            const matched = findMatchedCombination(ownerInfo.source);

            setMatchedCombination(matched);

            if (matched?.isVisible && matched?.isCheckedQuantity) {
                const matchedQty = Number(matched.qty || 0);
                setStock(matchedQty);

                // Set the combination IDs from the matched combination
                setCombinationStockId(matched.combIds || []);

                console.log('Matched combination:', matched);
                console.log('Combination IDs:', combinationStockId);
                console.log('Order Data Quantity:', matchedQty);
            } else {
                // No valid combination found or combination not visible/checked
                setStock(0);
                setCombinationStockId([]);
                setQuantityOwner('none');
                console.log('No valid combination found');
            }
        } else if (ownerInfo.owner === 'product') {
            const productQty = Number(saleData?.productMain?.qty || 0);
            setStock(productQty);
            setCombinationStockId([]);

            console.log('Product quantity:', productQty);
        } else {
            setStock(0);
            setCombinationStockId([]);
            console.log('No quantity owner (none)');
        }
    }, [combinationStockId, determineQuantityOwner, findMatchedCombination, saleData]);

    const updateQty = async () => {
        try {
            let payload = {};

            if (quantityOwner === 'product') {
                // Update product quantity
                payload = {
                    _id: saleData?.productMain?._id,
                    qty: newStock,
                    isCombination: false
                };
            } else if (quantityOwner === 'combination' && matchedCombination) {
                // Get the correct combination IDs from matched combination
                // const combinationIds = matchedCombination.combIds || [];

                // Update combination quantity
                payload = {
                    _id: saleData?.productMain?._id,
                    qty: newStock,
                    isCombination: true,
                    combinationData: combinationStockId, // Send the specific combination IDs
                    combinationQty: stock
                };

                console.log('Updating combination with IDs:', combinationStockId);
                console.log('New quantity:', stock);
            } else {
                console.error('Cannot update quantity: No valid quantity owner');
                handleOpen("error", { message: 'Cannot update quantity - No valid inventory source' });
                return;
            }

            console.log('Update payload:', payload);

            const res = await ApiService.post(apiEndpoints.updateProductQuantity, payload, auth_key);
            if (res?.status === 200) {
                handleOpen("success", { message: 'Quantity updated successfully' });
                popClose();
                getOrderList();
            }
        } catch (error) {
            handleOpen("error", error.response.message);
        }
    };

    const handleClickOpen = () => {
        setOpenPop(true);
    };

    // 2️⃣ Sold / Left badge logic
    const getStockBadge = () => {
        if (quantityOwner === 'none' || stock <= 0) {
            return {
                text: 'Sold',
                bgColor: 'red',
                show: true
            };
        }

        return {
            text: `Left ${stock}`,
            bgColor: '#000',
            show: true
        };
    };

    const stockBadge = getStockBadge();

    // Helper function to get display value or fallback
    const getDisplayValue = (value, fallback = "...") => {
        if (value === null || value === undefined || value === "") {
            return fallback;
        }
        return value;
    };

    return (
        <>
            <Box sx={{ display: "flex", my: 3 }}>
                <Box
                    sx={{
                        cursor: "pointer",
                        position: "relative",
                        width: 150, height: 150, borderRadius: 2, overflow: "hidden"
                    }}
                    textAlign={"start"}
                    marginRight={2}
                >
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

                    {stockBadge.show && (
                        <Box
                            component="span"
                            sx={{
                                position: "absolute",
                                bottom: "0px",
                                left: "0px",
                                background: stockBadge.bgColor,
                                color: "#fff",
                                padding: "3px 9px",
                                borderRadius: "5px",
                                fontSize: "10px"
                            }}
                        >
                            {stockBadge.text}
                        </Box>
                    )}
                </Box>
                <Box textAlign={"start"}>

                    <Typography
                        variant="subtitle2"
                        sx={{
                            color: "secondary.main",
                            // mb: 1,
                            // cursor: "pointer",
                            // textDecoration: "underline",
                            '&:hover': {
                                textDecoration: "none"
                            }
                        }}
                    >
                        Transaction Id: {saleData.item_id || "N/A"}
                    </Typography>
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

                    {/* Display Amazon-style variants (parent variants) */}
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

                    {/* Display Etsy-style internal variants (these have combination quantities) */}
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

                    {/* Display variant IDs if no structured variant data */}
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

                    <Box mt={1}>
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
                            disabled={quantityOwner === 'none'}
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

            {/* Update Quantity Modal */}
            <Dialog open={openPop} onClose={popClose} sx={{ "& .MuiPaper-root": { maxWidth: "750px" } }}>
                {saleData?.productMain && (
                    <Box p={2} sx={{ position: "relative" }}>
                        <Typography variant="h4">Update Quantity</Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                            Quantity Owner: {quantityOwner === 'product' ? 'Product' : quantityOwner === 'combination' ? 'Variant Combination' : 'None'}
                        </Typography>

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

                                {/* Show current stock status */}
                                <Typography fontSize={16} sx={{ color: "#000", mt: 1 }}>
                                    Current Stock:{" "}
                                    <Box component="span" fontWeight="bold">
                                        {stockBadge.text}
                                    </Box>
                                </Typography>

                                {/* Show which variant is being tracked */}
                                {quantityOwner === 'combination' && matchedCombination && (
                                    <Box sx={{ mt: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                        <Typography fontSize={14} fontWeight="bold">
                                            Tracking Inventory For:
                                        </Typography>
                                        {saleData?.variants?.map((variant, index) => (
                                            <Typography key={index} fontSize={14}>
                                                {variant.variantName}: {variant.attributeName}
                                            </Typography>
                                        ))}
                                        {matchedCombination.combValues?.map((value, idx) => (
                                            <Typography key={idx} fontSize={14} color="text.secondary">
                                                Combination: {value}
                                            </Typography>
                                        ))}
                                        {matchedCombination.combIds?.length > 0 && (
                                            <Typography fontSize={12} color="text.secondary" sx={{ mt: 1 }}>
                                                Combination IDs: {matchedCombination.combIds.join(', ')}
                                            </Typography>
                                        )}
                                    </Box>
                                )}

                                {/* 3️⃣ Update Quantity input */}
                                <Box mt={2}>
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <Typography component="span" fontSize={14} fontWeight={500} pr={2}>
                                            New Quantity:
                                        </Typography>
                                        <TextField
                                            type="number"
                                            value={newStock}
                                            placeholder={stock}
                                            onChange={(e) => setNewStock(Number(e.target.value))
                                            }
                                            disabled={quantityOwner === 'none'}
                                            helperText={quantityOwner === 'none' ? 'Cannot update - No inventory source' : ''}
                                        />
                                    </Box>
                                    {quantityOwner === 'product' && (
                                        <Typography variant="caption" color="text.secondary">
                                            Updating product-level inventory for this variant
                                        </Typography>
                                    )}
                                    {quantityOwner === 'combination' && (
                                        <Typography variant="caption" color="text.secondary">
                                            Updating specific variant inventory
                                        </Typography>
                                    )}
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
                                        Cancel
                                    </Button>
                                    <Button
                                        sx={{
                                            background: "#000",
                                            color: "#fff",
                                            borderRadius: "30px",
                                            padding: "4px 30px",
                                            "&:hover": { background: "#2e2e2e" },
                                            "&.Mui-disabled": {
                                                background: "#ccc"
                                            }
                                        }}
                                        onClick={updateQty}
                                        disabled={quantityOwner === 'none'}
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
