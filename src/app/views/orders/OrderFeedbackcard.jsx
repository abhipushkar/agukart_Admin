import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const OrderFeedbackcard = ({ item, baseUrl, shopName }) => {
    const feedback = item?.feedbackData || item?.feedback || {};
    const productData = item?.productData || {};
    const productImage = productData?.image?.[0] || "";
    const productTitle = productData?.product_title?.replace(/<\/?[^>]+(>|$)/g, "") || "Product";
    const transactionId = item?.item_id || item?._id || "";
    const rating = feedback?.rating || 0;
    const comment = feedback?.comment || feedback?.feedback_comment || "";
    const feedbackDate = feedback?.date || feedback?.feedback_date || "";
    const reviewImages = feedback?.images || feedback?.review_images || [];
    const vendorResponse = feedback?.vendor_response || feedback?.seller_response || "";
    const vendorResponseDate = feedback?.vendor_response_date || "";
    const formatDate = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(
            typeof timestamp === "number" && timestamp.toString().length === 10
                ? timestamp * 1000
                : timestamp
        );
        if (isNaN(date.getTime())) return "";
        return date.toLocaleDateString("en-US", {
            weekday: "short", year: "numeric", month: "short", day: "numeric"
        });
    };
    if (!comment && !rating) {
        return (
            <Box
                p={2}
                sx={{
                    border: "0.5px solid #e0e0e0",
                    borderRadius: "12px",
                    background: "#fff",
                    mb: 2
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, pb: 1.5, borderBottom: "0.5px solid #e0e0e0" }}>
                    {productImage ? (
                        <img
                            src={`${baseUrl}${productImage}`}
                            alt={productTitle}
                            style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                        />
                    ) : (
                        <Box sx={{ width: 48, height: 48, bgcolor: "#f5f5f5", borderRadius: 2, flexShrink: 0 }} />
                    )}
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            fontSize={14}
                            fontWeight={500}
                            color="green"
                            sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        >
                            {productTitle}
                        </Typography>
                        <Typography fontSize={12} color="text.secondary">
                            Transaction ID : {transactionId}
                        </Typography>
                    </Box>
                </Box>
                <Typography fontSize={13} color="text.secondary" textAlign="center" py={2}>
                    No feedback yet
                </Typography>
            </Box>
        );
    }
    return (
        <Box
            p={2}
            sx={{
                border: "0.5px solid #e0e0e0",
                borderRadius: "12px",
                background: "#fff",
                mb: 2
            }}
        >
            {/* Product Row */}
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5, pb: 1.5, borderBottom: "0.5px solid #e0e0e0" }}>
                {productImage ? (
                    <img
                        src={`${baseUrl}${productImage}`}
                        alt={productTitle}
                        style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                    />
                ) : (
                    <Box sx={{ width: 48, height: 48, bgcolor: "#f5f5f5", borderRadius: 2, flexShrink: 0 }} />
                )}
                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        fontSize={14}
                        fontWeight={500}
                        color="black"
                        sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                        {productTitle}
                    </Typography>
                    <Typography fontSize={12} color="text.secondary">
                        Transaction ID : {transactionId}
                    </Typography>
                </Box>
            </Box>
            {/* Stars */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                <Typography fontSize={13} color="text.secondary" mr={0.5}>Review</Typography>
                {[1, 2, 3, 4, 5].map((star) =>
                    star <= rating
                        ? <StarIcon key={star} sx={{ color: "#eb9a4c", fontSize: 20 }} />
                        : <StarBorderIcon key={star} sx={{ color: "#ddd", fontSize: 20 }} />
                )}
            </Box>
            {/* Review Images */}
            {reviewImages.length > 0 && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
                    {reviewImages.map((img, idx) => (
                        <img
                            key={idx}
                            src={`${baseUrl}${img}`}
                            alt={`Review ${idx + 1}`}
                            style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, border: "0.5px solid #e0e0e0" }}
                        />
                    ))}
                </Box>
            )}
            {/* Comment */}
            {comment && (
                <Typography fontSize={14} color="text.primary" lineHeight={1.6} mb={0.5}>
                    {comment}
                </Typography>
            )}
            {/* Date */}
            {feedbackDate && (
                <Typography fontSize={12} color="text.secondary" mb={1.5}>
                    Date: {formatDate(feedbackDate)}
                </Typography>
            )}
            {/* Vendor Response */}
            {vendorResponse && (
                <Box sx={{ background: "#f5f5f5", borderRadius: "8px", p: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>

                       
                        <Typography fontSize={13} fontWeight={500} color="primary">
                            {shopName || "Shop"}
                        </Typography>

                        {vendorResponseDate && (
                            <Typography fontSize={12} color="text.secondary">
                                responded on {formatDate(vendorResponseDate)}
                            </Typography>
                        )}
                    </Box>

                    <Typography fontSize={13} color="text.primary" lineHeight={1.6}>
                        {vendorResponse}
                    </Typography>

                    {/* Bottom Icon */}
                    <Box
                        sx={{
                            mt: 1.5,
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
                                objectFit: "contain"
                            }}
                        />
                    </Box>
                </Box>
            )}
        </Box>
    );
};
export default OrderFeedbackcard;