// Product.jsx - Complete updated code
import { Box, Card, Dialog, Tooltip, Typography, Grid, Rating, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import React from 'react'
import Button from "@mui/material/Button";
import { useState, useRef } from 'react';
import { ApiService } from "app/services/ApiService";
import CloseIcon from "@mui/icons-material/Close";
import { Update, Collections } from '@mui/icons-material';
import { localStorageKey } from "app/constant/localStorageKey";
import { apiEndpoints } from "app/constant/apiEndpoints";
import TextField from "@mui/material/TextField";
import { useEffect } from 'react';
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { REACT_APP_WEB_URL } from 'config';
import MessagePopup from './MessagePopup';
import { useCallback } from 'react';
import parse from 'html-react-parser'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";


const Product = ({ saleData, baseUrl, getOrderList, handleOpen, item, vendorData }) => {
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
    const [guideOpen, setGuideOpen] = useState(false);
    const [currentGuide, setCurrentGuide] = useState({});
    const transformRef = useRef(null);

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
        if (!combinationsData || combinationsData.length === 0) return null;

        const internalVariants = saleData?.variants || [];
        if (internalVariants.length === 0) return null;

        const allCombinations = combinationsData.flatMap(
            item => item?.combinations || []
        );

        if (allCombinations.length === 0) return null;

        // 🔥 STEP 1: Detect structure
        const isCombined = allCombinations.some(
            comb => (comb?.combValues || []).length > 1
        );

        // ===============================
        // ✅ CASE 1: COMBINED STRUCTURE
        // ===============================
        if (isCombined) {
            const matched = allCombinations.find(combination => {
                const combValues = combination.combValues || [];

                // 🔥 STEP 1: get quantity controlling variants
                const quantityController = saleData?.productMain?.form_values?.quantities || "";

                // "Ring Size and pattern" → ["Ring Size", "pattern"]
                const controllingVariants = quantityController
                    .split(" and ")
                    .map(v => v.trim());

                // 🔥 STEP 2: filter only controlling selections
                const controllingSelections = internalVariants.filter(variant =>
                    controllingVariants.includes(variant.variantName)
                );

                // 🔥 STEP 3: match ONLY controlling variants
                return controllingSelections.every(variant =>
                    combValues.includes(variant.attributeName)
                );
            });

            console.log("Combined match:", matched);
            return matched || null;
        }

        // ===============================
        // ⚠️ CASE 2: SEPARATE STRUCTURE
        // ===============================
        let matchedResults = [];

        internalVariants.forEach((variant) => {
            const group = combinationsData.find(
                item => item.variant_name === variant.variantName
            );

            if (!group) return;

            const match = group.combinations.find(comb =>
                comb.combValues?.includes(variant.attributeName)
            );

            if (match) matchedResults.push(match);
        });

        console.log("Separate matches:", matchedResults);

        // ❗ You cannot return single combination here
        // So return first valid OR handle differently
        return matchedResults.length ? matchedResults[0] : null;

    }, [saleData?.variants, saleData?.productMain]);

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

        } else {
            setStock(0);
            setCombinationStockId([]);
            console.log('No quantity owner (none)');
        }
    }, []);

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

    const handleUpdateInventoryClick = async () => {
        try {
            const res = await ApiService.post(`${apiEndpoints.updateInventory}/${saleData._id}`, {}, auth_key);
            if (res?.status === 200) {
                handleOpen("success", { message: 'Quantity updated successfully' });
                getOrderList();
            }
        } catch (error) {
            handleOpen("error", { message: error.response.data.message });
        }
    }

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

    const getVariantImages = () => {
        let images = [];
        const product = saleData?.productData;
        saleData?.variants.forEach((variant, i) => {
            const currVariant = product.product_variants.find(pv => pv.variant_name.trim().toLowerCase() === variant.variantName.trim().toLowerCase());
            const imageAttr = currVariant.variant_attributes.find(a => a.attribute.trim().toLowerCase() === variant.attributeName.trim().toLowerCase());
            if (imageAttr && (imageAttr.main_images.filter(Boolean).length || imageAttr.preview_image || imageAttr.thumbnail)) {
                const currAttrMainImage = imageAttr.edit_main_image || imageAttr.main_images.filter(Boolean)[0] || imageAttr.preview_image || `${baseUrl}/${product.image[0]}`;
                const variant_attr_name = variant.variantName + ": " + variant.attributeName;
                images.push({ name: variant_attr_name, image: currAttrMainImage, thumbnail: imageAttr.thumbnail });
            }
        });
        return images;
    };

    const getCustomizationImages = () => {
        let images = [];
        const customization = saleData?.customizationData?.[0];
        if (!customization || saleData?.customize !== "Yes") {
            return [];
        }
        Object.entries(customization).forEach(([key, value]) => {
            const mainImage = Array.isArray(value.main_images) ? value.main_images.find(Boolean)
                : null;
            if (mainImage || value.edit_main_image || value.preview_image || value.thumbnail) {
                const custImage = mainImage || value.edit_main_image || value.preview_image || `${baseUrl}/${saleData?.productData.image[0]}`;
                images.push({
                    name: `${key}: ${value.value}`,
                    image: custImage,
                    thumbnail: value.thumbnail
                })
            }
        })
        return images;
    };

    const mainImages =
        saleData?.productData?.image?.map((img) => ({
            name: "main image",
            image: `${baseUrl}/${img}`,
            thumbnail: "",
        })) ?? [];

    const [firstMainImage, ...remainingMainImages] = mainImages;

    const images = [
        ...(firstMainImage ? [firstMainImage] : []),
        ...getVariantImages(),
        ...getCustomizationImages(),
        ...remainingMainImages,
    ];

    const goToNextImage = () => {
        if (images.length > 0) {
            setCurrentImageIndex((prev) =>
                prev === images.length - 1 ? 0 : prev + 1
            );
        }
    };

    const goToPrevImage = () => {
        if (images.length > 0) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? images.length - 1 : prev - 1
            );
        }
    };

    const variantHasGuide = (v) => saleData?.productData.product_variants.find(pv => pv.variant_name === v.variantName).guide || null;
    const handleGuideClick = (variant) => {
        const productVariant = saleData?.productData.product_variants.find(v => v.variant_name === variant.variantName);
        console.log(productVariant, "pv");
        const guide = productVariant.guide[0];
        setCurrentGuide({
            name: guide.guide_name,
            file: guide.guide_file,
            type: guide.guide_type,
            description: guide.guide_description,
        });
        setGuideOpen(true);
    };

    return (
        <>
            <Tooltip
                title={saleData.inventory_note}
                placement='top'
                arrow
                disableHoverListener={saleData.inventory_status !== "out_of_stock"}
            >
                <Box sx={{ display: "flex", flex: 1, my: 1, py: 1, backgroundColor: `${saleData.inventory_status === "out_of_stock" ? "#f8e6e6" : undefined}` }} component={saleData.inventory_status === "out_of_stock" ? Card : undefined}>
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
                        {images.length > 1 && (
                            <Typography
                                component={Card}
                                sx={{
                                    position: "absolute",
                                    bottom: "0px",
                                    right: "0px",
                                    padding: "3px 3px",
                                    borderRadius: "4px",
                                    fontSize: "12px"
                                }}
                                color={"primary.main"}
                            >
                                <Collections fontSize='10px' /> {images.length}
                            </Typography>
                        )}
                    </Box>
                    <Box textAlign={"start"}
                        sx={{
                            flex: 1,
                            minWidth: 0,
                            width: "100%",
                        }}>

                        {/* <Typography
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
                    </Typography> */}
                        <a
                            href={`${REACT_APP_WEB_URL}/product/${saleData?.productMain?.slug}/${saleData?.productMain?.product_code}`}
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
                                    flex: 1,
                                    width: "100%",
                                    maxWidth: "550px",
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

                        <Grid container spacing={1}>
                            <Grid item md={6} lg={6}>

                                <Typography fontSize={14} sx={{ color: "#000" }}>
                                    Product SKU {"   "}:{"   "}
                                    <Box component="span" fontWeight={500}>
                                        {getDisplayValue(saleData?.productData?.sku_code || saleData?.productMain?.sku_code)}
                                    </Box>
                                </Typography>
                                <Typography fontSize={14} sx={{ color: "#000" }}>
                                    Quantity  {"  "}:{"   "}
                                    <Box component="span" fontWeight={500}>
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
                                            {getDisplayValue(variantItem?.variant_name)}{"   "}:{"   "}
                                            <Box component="span" fontWeight={500}>
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
                                            sx={{ color: "#000", pt: 0.5 }}
                                            key={variant._id || index}
                                        >
                                            {getDisplayValue(variant.variantName)}{variantHasGuide(variant) && variantHasGuide(variant)?.[0] && (<Typography component={"span"} color="primary.main" ml={1.5}
                                                onClick={() => handleGuideClick(variant)} sx={{ cursor: "pointer", border: "1px solid rgb(0, 119, 255)", px: 1, borderRadius: 1 }} fontWeight={600}
                                            >G</Typography>)}{"   "}:{"   "}
                                            <Box component="span" ml={1} fontWeight={500}>
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
                                                    <Box key={key} mt={0.5}>
                                                        {typeof value === 'object' ? (
                                                            <Typography fontSize={14} sx={{ color: "#000" }}>
                                                                {getDisplayValue(key)} {"   "} :<strong>{`   ${getDisplayValue(value?.value)}`}</strong>
                                                            </Typography>
                                                        ) : (
                                                            <Typography fontSize={14} sx={{ color: "#000" }}>
                                                                {getDisplayValue(key)}{"   "}: {"   "}<strong>{getDisplayValue(value)}</strong>
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                ))}
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Grid>
                            <Grid item md={6} lg={6}>
                                {saleData?.ratingData && (<Tooltip
                                    title={
                                        <Box display="flex" flexDirection="column" gap={1} p={1} bgcolor={"#fff"} borderRadius={2}>
                                            <Typography variant="caption" color="gray">
                                                {saleData?.ratingData?.additional_comment}
                                            </Typography>
                                        </Box>
                                    }
                                    placement="bottom-start"
                                    arrow
                                    slotProps={{
                                        tooltip: {
                                            sx: {
                                                bgcolor: "#dedede", borderRadius: 2,
                                                p: 0, maxWidth: 300, boxShadow: 2,
                                            },
                                        },
                                        arrow: {
                                            sx: {
                                                color: "#fff", "&::before": {
                                                    boxShadow: "4px 4px 12px rgba(0, 0, 0, 0.26)",
                                                },
                                            }
                                        }
                                    }}
                                >
                                    <span style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", paddingTop: 10 }}>
                                        <Rating value={saleData?.ratingData?.rating} readOnly />
                                        <Typography color="gray" sx={{ ml: 0.5, fontSize: "16px" }}> ⏷ </Typography>
                                    </span>
                                    <br />
                                </Tooltip>)}
                                {(saleData?.refund_status || saleData.latest_refund_reason) && saleData.refunded_cash_amount > 0 && (
                                    <Box pt={1}>
                                        <Typography color="GrayText">
                                            Refund Reason: <strong style={{ color: "red", wordBreak: "keep-all", overflowWrap: "normal", whiteSpace: "normal", }}>{saleData.latest_refund_reason || ""}</strong>
                                        </Typography>
                                    </Box>)}
                            </Grid>
                        </Grid>
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
                            {saleData?.inventory_status === "out_of_stock" && (<Button variant="outlined" color="error" sx={{ color: "red", borderRadius: "30px", }} component={Card} onClick={handleUpdateInventoryClick}>
                                <Update /> Update Inventory
                            </Button>)}
                        </Box>
                    </Box>
                </Box>
            </Tooltip>
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

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: "300px" }}>
                        <Button
                            onClick={goToPrevImage}
                            sx={{ minWidth: 'auto', padding: '8px', fontSize: '25px' }}
                        >
                            ‹
                        </Button>

                        <Box
                            sx={{
                                flex: 1,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                position: "relative",
                            }}
                        >
                            {images[currentImageIndex] && (
                                <>
                                    <img
                                        src={images[currentImageIndex].image}
                                        alt={images[currentImageIndex].image}
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: "500px",
                                            objectFit: "contain",
                                        }}
                                    />

                                    {images[currentImageIndex].thumbnail && (
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                bottom: 12,
                                                right: 12,
                                                width: 64,
                                                height: 64,
                                                borderRadius: 1,
                                                overflow: "hidden",
                                                border: "2px solid #fff",
                                                backgroundColor: "#fff",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                            }}
                                        >
                                            <img
                                                src={images[currentImageIndex].thumbnail}
                                                alt="Thumbnail"
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        </Box>
                                    )}
                                </>
                            )}
                        </Box>

                        <Button
                            onClick={goToNextImage}
                            sx={{ minWidth: 'auto', padding: '8px', fontSize: '25px' }}
                        >
                            ›
                        </Button>
                    </Box>

                    {images.length > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2, gap: 5 }}>
                            <Typography variant="body1" fontWeight={500}>
                                {images[currentImageIndex].name}
                            </Typography>
                            <Typography>
                                Image {currentImageIndex + 1} of {images.length}
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
                                        {/* <Typography fontSize={14} fontWeight="bold">
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
                                        )} */}
                                        <Typography fontSize={14} color="text.secondary" sx={{ mt: 1 }}>
                                            Qunatity Owner: {saleData?.productData?.form_values?.quantities}
                                        </Typography>
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
            {guideOpen && (
                <Dialog open={guideOpen} onClose={() => setGuideOpen(false)} maxWidth="md" fullWidth sx={{ "& .MuiDialog-paper": { maxWidth: "90vw", maxHeight: "95vh" } }}>
                    <DialogTitle sx={{ m: 0, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography>{currentGuide?.name} Guide</Typography>
                        <IconButton onClick={() => setGuideOpen(false)}><CloseIcon /></IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ p: 0, overflow: "visible" }}>
                        {currentGuide?.description && <Box sx={{ p: 3, pb: 0 }}>{parse(currentGuide.description)}</Box>}
                        {currentGuide?.file && currentGuide?.type === "image" && (
                            <Box sx={{ width: "100%", height: "85vh", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                                <TransformWrapper ref={transformRef} initialScale={1} minScale={1} maxScale={5} wheel={{ step: 0.2 }} doubleClick={{ disabled: false }} pinch={{ step: 10 }} bg>
                                    <TransformComponent wrapperStyle={{ display: "inline-block", width: "85vw", height: "fit-content", background: "#f2f2f2", "&:hover": { cursor: "grab" } }} contentStyle={{ display: "inline-block" }}>
                                        <img src={currentGuide.file} alt="guide" style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain", display: "block" }} />
                                    </TransformComponent>
                                </TransformWrapper>
                            </Box>
                        )}
                        {currentGuide?.file && currentGuide?.type === "video" && <Box sx={{ textAlign: "center", mb: 2 }}><video controls style={{ maxWidth: "100%", maxHeight: "60vh", borderRadius: "8px" }}><source src={currentGuide.file} type="video/mp4" /></video></Box>}
                        {currentGuide?.file && currentGuide?.type === "document" && <Box sx={{ textAlign: "center", mb: 2 }}><Button variant="contained" href={currentGuide.file} target="_blank">View Guide</Button></Box>}
                        {!currentGuide?.file && !currentGuide?.description && <Typography color="textSecondary" sx={{ textAlign: "center", py: 4 }}>No guide content available</Typography>}
                    </DialogContent>
                    {currentGuide?.file && currentGuide?.type === "image" && (
                        <DialogActions sx={{ p: 2 }}>
                            <Box sx={{ display: "flex", gap: 1 }}>
                                <Button onClick={() => transformRef.current?.zoomIn()} variant="outlined">Zoom +</Button>
                                <Button onClick={() => transformRef.current?.zoomOut()} variant="outlined">Zoom -</Button>
                                <Button onClick={() => transformRef.current?.resetTransform()} variant="outlined">Reset</Button>
                                <Button onClick={() => setGuideOpen(false)} variant="outlined">Close</Button>
                            </Box>
                        </DialogActions>
                    )}
                </Dialog>
            )}
        </>
    )
}

export default Product
