import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import LockIcon from "@mui/icons-material/Lock";
import FlagIcon from "@mui/icons-material/Flag";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { Avatar, Card, Rating } from "@mui/material";
import {
    Dialog,
    DialogTitle,
    DialogActions,
    IconButton
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const OrderFeedbackcard = ({ item, baseUrl, shopName, open, imageDialogOpen, imageDialogClose, dialogImages, setActiveImageIndex, activeImageIndex }) => {
    // Use item directly as it already contains all review data
    const review = { ...item, ...item.reviewData };

    // Product details
    const productImage = review?.productData?.edited_image || review?.productData?.image[0] || "";
    const productTitle = review?.product_name?.replace(/<\/?[^>]+(>|$)/g, "") || "Product";
    const productSku = review?.productData?.sku_code || "";
    const productCode = review?.productData?.product_code || "";
    const transactionId = item?.item_id || item?._id || "";

    // Review details
    const rating = review?.rating || 0;
    const comment = review?.additional_comment || "";
    const reviewDate = review?.createdAt || "";
    const isEdited = review?.is_edited || false;
    const editedAt = review?.edited_at || "";
    const status = review?.status || "";
    const isLocked = review?.is_locked || false;
    const isFlagged = review?.is_flagged || false;
    const isHidden = review?.is_hidden || false;

    // Images
    const reviewImages = review?.images || [];

    // Seller reply
    const sellerReply = review?.seller_reply || {};
    const replyMessage = sellerReply?.message || "";
    const replyDate = sellerReply?.replied_at || "";
    const replyShopName = review?.replyShopName || "Agukart";
    const shopIcon = review?.replyShopIcon;

    // buyer note
    const buyerNote = review?.buyer_note || {};
    const note = buyerNote?.note || "";
    const noteDate = buyerNote?.created_at || "";

    // Ratings breakdown
    const itemRating = review?.item_rating || 0;
    const deliveryRating = review?.delivery_rating || 0;
    const customerServiceRating = review?.customer_service_rating || 0;

    // User details
    const userName = review?.user_name || "";
    const userImage = review?.user_image || "";
    const customerId = review?.customer_id || "";

    // Format date
    const formatDate = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case "approved": return "#4caf50";
            case "rejected": return "#f44336";
            case "pending": return "#ff9800";
            default: return "#9e9e9e";
        }
    };

    const handlePrev = () => {
        setActiveImageIndex(prev =>
            prev === 0 ? dialogImages.length - 1 : prev - 1
        );
    };

    const handleNext = () => {
        setActiveImageIndex(prev =>
            prev === dialogImages.length - 1 ? 0 : prev + 1
        );
    };

    return (
        <Box
            p={2}
            sx={{
                border: isFlagged ? "0.5px solid #f52241" : "0.5px solid #e0e0e0",
                borderRadius: "12px",
                background: "#fff",
                mb: 2,
                opacity: isHidden ? 0.85 : 1,
                position: "relative"
            }}
            component={Card}
        >
            {/* Status Badges - Top Right */}
            <Box sx={{
                display: "flex",
                gap: 0.5,
                position: "absolute",
                top: 8,
                right: 8,
                alignItems: "center"
            }}>
                {isLocked && (
                    <LockIcon sx={{ fontSize: 18 }} />
                )}
                {isFlagged && (
                    <FlagIcon sx={{ fontSize: 18, color: "red" }} />
                )}
                {isHidden && (
                    <VisibilityOffIcon color="primary" sx={{ fontSize: 18 }} />
                )}
                {status && (
                    <Box
                        sx={{
                            bgcolor: getStatusColor(status),
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: 600,
                            px: 0.8,
                            py: 0.3,
                            borderRadius: 1,
                            ml: 0.5
                        }}
                    >
                        {status.toUpperCase()}
                    </Box>
                )}
            </Box>

            {/* Product Row */}
            <Box sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
                mb: 1.5,
                pb: 1.5,
                borderBottom: "0.5px solid #e0e0e0"
            }}>
                {productImage ? (
                    <img
                        src={`https://api.agukart.com/uploads/product/${productImage}`}
                        alt={productTitle}
                        style={{
                            width: 48,
                            height: 48,
                            objectFit: "cover",
                            borderRadius: 8,
                            flexShrink: 0
                        }}
                    />
                ) : (
                    <Box sx={{ width: 48, height: 48, bgcolor: "#f5f5f5", borderRadius: 2, flexShrink: 0 }} />
                )}
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                        fontSize={14}
                        fontWeight={500}
                        color="black"
                        sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                        }}
                    >
                        {productTitle}
                    </Typography>
                    <Typography fontSize={12} color="text.secondary">
                        SKU: {productSku || "—"} <br /> Product ID: {productCode || "—"} <br /> Transaction ID: {transactionId}
                    </Typography>
                </Box>
            </Box>

            {/* Stars */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                <Typography fontSize={13} color="text.secondary" mr={0.5}>
                    Review Rating
                </Typography>
                <Rating value={rating} precision={0.5} readOnly />
            </Box>

            {/* Rating Breakdown */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 1 }}>
                {itemRating > 0 && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Typography fontSize={12} color="text.secondary">Item:</Typography>
                        <Rating value={itemRating} precision={0.5} readOnly sx={{ fontSize: 16 }} />
                    </Box>
                )}
                {deliveryRating > 0 && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Typography fontSize={12} color="text.secondary">Delivery:</Typography>
                        <Rating value={deliveryRating} precision={0.5} readOnly sx={{ fontSize: 16 }} />
                    </Box>
                )}
                {customerServiceRating > 0 && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Typography fontSize={12} color="text.secondary">Service:</Typography>
                        <Rating value={customerServiceRating} precision={0.5} readOnly sx={{ fontSize: 16 }} />
                    </Box>
                )}
            </Box>

            {/* Review Images */}
            {reviewImages.length > 0 && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
                    {reviewImages.map((img, idx) => (
                        <img
                            key={idx}
                            src={`https://api.agukart.com/uploads/ratings/${img}`}
                            alt={`Review ${idx + 1}`}
                            style={{
                                width: 70,
                                height: 70,
                                objectFit: "cover",
                                borderRadius: 8,
                                border: "0.5px solid #e0e0e0"
                            }}
                            onClick={() => { setActiveImageIndex(idx); imageDialogOpen(reviewImages); }}
                        />
                    ))}
                </Box>
            )}

            {/* Comment with strikethrough if hidden */}
            {comment && (
                <Typography
                    fontSize={14}
                    color={isHidden ? "text.secondary" : "text.primary"}
                    lineHeight={1.6}
                    mb={0.5}
                    sx={{
                        textDecoration: isHidden ? "line-through" : "none",
                        opacity: isHidden ? 0.7 : 1
                    }}
                >
                    {comment}
                    {isHidden && (
                        <Typography component="span" fontSize={12} color="error" ml={1}>
                            (Hidden)
                        </Typography>
                    )}
                </Typography>
            )}

            {/* Edited indicator */}
            {isEdited && editedAt && (
                <Typography fontSize={11} color="text.secondary" mb={0.5}>
                    <EditIcon sx={{ fontSize: 12, verticalAlign: "middle" }} />
                    Edited on {formatDate(editedAt)} at {formatTime(editedAt)}
                </Typography>
            )}

            {/* Date */}
            {reviewDate && (
                <Typography fontSize={12} color="text.secondary" mb={1.5}>
                    Posted on {formatDate(reviewDate)} at {formatTime(reviewDate)}
                </Typography>
            )}

            {/* Seller Reply */}
            {replyMessage && (
                <Box component={Card} sx={{ background: "#f5f5f5", borderRadius: "8px", p: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Avatar
                            src={`https://api.agukart.com/uploads/shop-icon/${shopIcon}`}
                            sx={{
                                width: 36,
                                height: 36,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px solid #d6d6d6",
                                borderRadius: "100px",
                                backgroundColor: "#ffffff",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
                            }}
                        >
                            <img
                                src="/logo/logo.png"
                                alt="Agukart"
                                style={{
                                    width: 22,
                                    height: 22,
                                    objectFit: "contain",
                                    transform: "scale(1.5)"
                                }}
                            />
                        </Avatar>
                        <Typography fontSize={13} fontWeight={500} color="primary">
                            {replyShopName}
                        </Typography>
                        {replyDate && (
                            <Typography flexWrap fontSize={12} color="text.secondary">
                                {formatDate(replyDate)}
                            </Typography>
                        )}
                    </Box>

                    <Typography fontSize={13} color="text.primary" lineHeight={1.6}>
                        {replyMessage}
                    </Typography>

                </Box>
            )}
            {note && (
                <Box component={Card} sx={{ background: "#fffcd683", borderRadius: "8px", p: 1.5, mt: 0.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px solid #d6d6d6",
                                borderRadius: "100px",
                                backgroundColor: "#ffffff",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
                            }}
                        >
                            <img
                                src="/logo/logo.png"
                                alt="Agukart"
                                style={{
                                    width: 22,
                                    height: 22,
                                    objectFit: "contain",
                                    transform: "scale(1.5)"
                                }}
                            />
                        </Box>
                        <Typography fontSize={13} fontWeight={500} color="inherit">
                            Note to Buyer
                        </Typography>
                        {noteDate && (
                            <Typography flexWrap fontSize={12} color="text.secondary">
                                {formatDate(noteDate)}
                            </Typography>
                        )}
                    </Box>
                    <Typography fontSize={13} color="text.primary" lineHeight={1.6}>
                        {note}
                    </Typography>

                </Box>
            )}
            <Dialog
                open={open}
                onClose={imageDialogClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        width: { xs: "90vw", sm: "80vw", md: "60vw", lg: "50vw" },
                        maxWidth: "900px",
                        height: { xs: "80vh", sm: "85vh", md: "85vh" },
                        maxHeight: "800px",
                        borderRadius: 3,
                        overflow: "hidden",
                        position: "relative",
                        bgcolor: "#f5f0eb",
                        boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
                    },
                }}
            >

                <DialogTitle>
                    {/* Close Button - Top Right */}
                    <IconButton
                        onClick={imageDialogClose}
                        sx={{
                            position: "absolute",
                            top: 20,
                            right: 20,
                            zIndex: 20,
                            color: "rgba(255,255,255,0.8)",
                            bgcolor: "rgba(0,0,0,0.4)",
                            backdropFilter: "blur(8px)",
                            transition: "all 0.2s",
                            width: 38,
                            height: 38,
                            "&:hover": {
                                bgcolor: "rgba(0,0,0,0.7)",
                                color: "#fff",
                                transform: "scale(1.05)",
                            },
                            "& .MuiSvgIcon-root": {
                                fontSize: 20,
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {/* Counter - Top Left */}
                    <Box
                        sx={{
                            position: "absolute",
                            top: 20,
                            left: 24,
                            zIndex: 20,
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: "rgba(255,255,255,0.7)",
                                bgcolor: "rgba(0,0,0,0.4)",
                                backdropFilter: "blur(8px)",
                                px: 2,
                                py: 0.75,
                                borderRadius: 20,
                                letterSpacing: "0.3px",
                            }}
                        >
                            {activeImageIndex + 1} of {dialogImages.length}
                        </Typography>
                    </Box>

                </DialogTitle>

                {/* Navigation Buttons */}
                {dialogImages.length > 1 && (
                    <>
                        {/* Previous Button */}
                        <IconButton
                            onClick={handlePrev}
                            sx={{
                                position: "absolute",
                                left: 24,
                                top: "50%",
                                transform: "translateY(-50%)",
                                zIndex: 20,
                                bgcolor: "rgba(92, 92, 92, 0.18)",
                                backdropFilter: "blur(8px)",
                                color: "#fff",
                                width: {
                                    xs: 40,
                                    sm: 48,
                                    md: 56,
                                },
                                height: {
                                    xs: 40,
                                    sm: 48,
                                    md: 56,
                                },
                                transition: "all 0.25s ease",
                                border: "1px solid rgba(255,255,255,0.15)",
                                "&:hover": {
                                    bgcolor: "rgba(202, 202, 202, 0.25)",
                                    transform: "translateY(-50%) scale(1.08)",
                                    borderColor: "rgba(255,255,255,0.3)",
                                },
                                "&:active": {
                                    transform: "translateY(-50%) scale(0.95)",
                                },
                            }}
                        >
                            <ChevronLeftIcon sx={{ fontSize: { xs: 24, sm: 28, md: 32, } }} />
                        </IconButton>

                        {/* Next Button */}
                        <IconButton
                            onClick={handleNext}
                            sx={{
                                position: "absolute",
                                right: 24,
                                top: "50%",
                                transform: "translateY(-50%)",
                                zIndex: 20,
                                bgcolor: "rgba(92, 92, 92, 0.18)",
                                backdropFilter: "blur(8px)",
                                color: "#fff",
                                width: {
                                    xs: 40,
                                    sm: 48,
                                    md: 56,
                                },
                                height: {
                                    xs: 40,
                                    sm: 48,
                                    md: 56,
                                },
                                transition: "all 0.25s ease",
                                border: "1px solid rgba(255,255,255,0.15)",
                                "&:hover": {
                                    bgcolor: "rgba(202,202,202,0.25)",
                                    transform: "translateY(-50%) scale(1.08)",
                                    borderColor: "rgba(255,255,255,0.3)",
                                },
                                "&:active": {
                                    transform: "translateY(-50%) scale(0.95)",
                                },
                            }}
                        >
                            <ChevronRightIcon sx={{ fontSize: { xs: 24, sm: 28, md: 32, } }} />
                        </IconButton>
                    </>
                )}

                {/* Main Image Area */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "calc(90% - 120px)",
                        px: { xs: 2, sm: 4 },
                        pt: { xs: 4, sm: 5 },
                        pb: 2,
                        position: "relative",
                    }}
                >
                    <Box
                        component="img"
                        src={`https://api.agukart.com/uploads/ratings/${dialogImages[activeImageIndex]}`}
                        alt={`Product image ${activeImageIndex + 1}`}
                        sx={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            width: "auto",
                            height: "auto",
                            objectFit: "contain",
                            borderRadius: 2,
                            boxShadow: "0 4px 30px rgba(0,0,0,0.3)",
                            transition: "all 0.3s ease",
                            userSelect: "none",
                            WebkitUserDrag: "none",
                        }}
                    />
                </Box>

                {/* Thumbnail Strip - Bottom */}
                {dialogImages.length > 1 && (
                    <DialogActions
                        sx={{
                            display: "flex", justifyContent: "center"
                        }}
                    >

                        <Box
                            sx={{
                                display: "flex",
                                gap: 1.5,
                                justifyContent: "center",
                                alignItems: "center",
                                px: { xs: 2, sm: 4 },
                                py: 1,
                                overflowX: "auto",
                                overflowY: "hidden",
                                "&::-webkit-scrollbar": {
                                    height: 4,
                                },
                                "&::-webkit-scrollbar-thumb": {
                                    bgcolor: "rgba(255,255,255,0.2)",
                                    borderRadius: 10,
                                },
                                "&::-webkit-scrollbar-track": {
                                    bgcolor: "transparent",
                                },
                                position: "relative",
                                zIndex: 5,
                            }}
                        >
                            {dialogImages.map((img, index) => (
                                <Box
                                    key={index}
                                    onClick={() => setActiveImageIndex(index)}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        minWidth: 80,
                                        flexShrink: 0,
                                        borderRadius: 2,
                                        overflow: "hidden",
                                        cursor: "pointer",
                                        position: "relative",
                                        border: index === activeImageIndex
                                            ? "3px solid #cb9090"
                                            : "2px solid rgba(255,255,255,0.15)",
                                        opacity: index === activeImageIndex ? 1 : 0.5,
                                        transition: "all 0.1s ease",
                                        transform: index === activeImageIndex
                                            ? "scale(1.02)"
                                            : "scale(1)",
                                        "&:hover": {
                                            opacity: 1,
                                            transform: "scale(1.02)",
                                            borderColor: "rgba(224, 168, 168, 0.4)",
                                        },
                                        "&:active": {
                                            transform: "scale(0.98)",
                                        },
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={`https://api.agukart.com/uploads/ratings/${img}`}
                                        alt={`Thumbnail ${index + 1}`}
                                        sx={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            display: "block",
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    </DialogActions>
                )}

            </Dialog>
        </Box>
    );
};

export default OrderFeedbackcard;