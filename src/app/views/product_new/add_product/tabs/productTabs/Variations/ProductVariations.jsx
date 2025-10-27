import React, { useState } from "react";
import {
    Box,
    Typography,
    Button
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useProductFormStore } from "../../../../states/useAddProducts";
import VariantModal from "./components/VaraintModal";
import VariationsTable from "./components/VariationsTable";
import EmptyVariationsState from "./components/EmptyVariationsState";

const ProductVariations = () => {
    const {
        variationsData,
        combinations,
        formValues,
        setCombinationError,
        setShowAll,
        draftLoading
    } = useProductFormStore();

    const [showVariantModal, setShowVariantModal] = useState(false);

    // Handle opening variant modal
    const handleOpenVariant = () => {
        setShowVariantModal(true);
    };

    // Handle closing variant modal
    const handleCloseVariant = () => {
        setShowVariantModal(false);
    };

    // Handle validation and next step
    const handleNext = () => {
        const errors = {};
        combinations.forEach((variant) => {
            variant.combinations.forEach((item, index) => {
                const isPriceCheckApplicable = (variationsData.length >= 2 ? formValues?.prices === variant.variant_name : true) && item?.isCheckedPrice && item?.isVisible;

                if (isPriceCheckApplicable && (!item?.price)) {
                    errors[`Price-${variant.variant_name}-${index}`] = "Price is required";
                }
                const isQtyCheckApplicable = (variationsData.length >= 2 ? formValues?.quantities === variant.variant_name : true) && item?.isCheckedQuantity && item?.isVisible;

                if (isQtyCheckApplicable && (!item?.qty)) {
                    errors[`Quantity-${variant.variant_name}-${index}`] = "Quantity is required";
                }
            });
        });

        if (Object.keys(errors).length > 0) {
            setCombinationError(errors);
            setShowAll(true);
        } else {
            setCombinationError({});
            // Handle next tab navigation here
            console.log("Validation passed, proceed to next tab");
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
            {/* Variations Section Header */}
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
                    Product Variations
                    <span style={{ color: "red", marginLeft: "3px" }}>*</span>:
                </Box>
                <Box sx={{ width: "100%" }}>
                    <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 2 }}
                    >
                        Manage product variations like sizes, colors, materials, etc. Add up to 2 variation types.
                    </Typography>

                    {/* Add Variations Button */}
                    <Box sx={{ mb: 3 }}>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={handleOpenVariant}
                            disabled={variationsData?.length >= 2}
                            sx={{ minWidth: '160px' }}
                        >
                            Add Variations ({variationsData?.length || 0}/2)
                        </Button>
                        {variationsData?.length >= 2 && (
                            <Typography variant="caption" color="textSecondary" sx={{ ml: 2 }}>
                                Maximum 2 variation types allowed
                            </Typography>
                        )}
                    </Box>

                    {/* Variations Content */}
                    {combinations?.length > 0 ? (
                        <VariationsTable setShowVariantModal={setShowVariantModal} />
                    ) : (
                        <EmptyVariationsState onAddVariation={handleOpenVariant} />
                    )}
                </Box>
            </Box>

            {/* Variant Modal */}
            <VariantModal
                show={showVariantModal}
                handleCloseVariant={handleCloseVariant}
            />
        </Box>
    );
};

export default ProductVariations;
