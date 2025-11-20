import React, { useState } from "react";
import {
    Box,
    Typography,
    Button,
    TextField
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useProductFormStore } from "../../../../states/useAddProducts";
import VariantModal from "./components/VaraintModal";
import VariationsTable from "./components/VariationsTable";
import CombinationsTable from "./components/CombinationTable";
import EmptyVariationsState from "./components/EmptyVariationsState";
import FormControl from "@mui/material/FormControl";

const ProductVariations = () => {
    const {
        variationsData,
        combinations,
        product_variants, // NEW: For images table
        formValues,
        setCombinationError,
        setShowAll,
        parentProductData,
        draftLoading
    } = useProductFormStore();

    const [showVariantModal, setShowVariantModal] = useState(false);

    // Check if tables should be synced (no combined variants)
    const shouldSyncTables = () => {
        if (!formValues?.isCheckedPrice && !formValues?.isCheckedQuantity) {
            return true; // No price/quantity variations, tables are in sync
        }

        // Check if any combined variants exist
        const hasCombinedVariants = combinations.some(comb =>
            comb.variant_name.includes(" and ")
        );

        return !hasCombinedVariants;
    };

    const isSynced = shouldSyncTables();

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
                maxWidth: "100%", // Increased for two tables
                mx: "auto"
            }}
        >
            {/* Parent Product Info*/}
            {parentProductData && (<Box sx={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                width: "100%",
                mx: "auto"
            }}>
                {/* Parent Title Field */}
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
                        Parent ID:
                    </Box>
                    <Box sx={{ width: "100%" }}>
                        <Typography>
                            {parentProductData._id}
                        </Typography>
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
                            width: "11%",
                            minWidth: "120px"
                        }}
                    >
                        Parent SKU:
                    </Box>
                    <Box sx={{ width: "50%" }}>
                        <Typography>
                            {parentProductData.seller_sku}
                        </Typography>
                    </Box>
                </Box>
            </Box>)}

            {/* Add Variations Button */}
            <Box sx={{ mt: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleOpenVariant}
                    sx={{ minWidth: '160px' }}
                >
                    Add Variations ({variationsData?.length || 0}/3)
                </Button>
                {variationsData?.length >= 3 && (
                    <Typography variant="caption" color="textSecondary" sx={{ ml: 2 }}>
                        Maximum 3 variation types allowed
                    </Typography>
                )}
            </Box>

            {/* Two Tables Layout */}
            <Box
                sx={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "flex-start"
                }}
            >
                {/* Variations Table (Images) */}
                <Box sx={{ flex: 1.5 }}>
                    <Typography
                        variant="h6"
                        sx={{ mb: 2, color: 'primary.main' }}
                    >
                        Product Variants
                    </Typography>

                    {product_variants?.length > 0 ? (
                        <VariationsTable
                            setShowVariantModal={setShowVariantModal}
                            isSynced={isSynced}
                        />
                    ) : (
                        <EmptyVariationsState onAddVariation={handleOpenVariant} />
                    )}
                </Box>

                {/* Combinations Table (Price/Quantity) */}
                <Box sx={{ flex: 1 }}>
                    <Typography
                        variant="h6"
                        sx={{ mb: 2, color: 'primary.main' }}
                    >
                        Price & Quantity
                        {/* {!isSynced && (
                            <Typography variant="caption" color="warning.main" sx={{ ml: 1 }}>
                                (Independent - Combined variants active)
                            </Typography>
                        )} */}
                    </Typography>

                    {combinations?.length > 0 ? (
                        <CombinationsTable isSynced={isSynced} />
                    ) : (
                        <Box sx={{
                            p: 4,
                            textAlign: 'center',
                            border: '1px dashed #e0e0e0',
                            borderRadius: 1
                        }}>
                            <Typography color="textSecondary">
                                Price and quantity settings will appear here after generating variations
                            </Typography>
                        </Box>
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
