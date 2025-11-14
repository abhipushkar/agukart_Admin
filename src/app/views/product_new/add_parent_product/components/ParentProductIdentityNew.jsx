// components/ParentProduct/ParentProductIdentityNew.jsx
import React, { useEffect } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import TextFormField from './FormFields/TextFormField';
import SelectFormField from './FormFields/SelectFormField';
import ConfirmModal from 'app/components/ConfirmModal';
import { useParentProductStore } from "../../states/parentProductStore";
import ImageUploadSection from "./Image/ImageUploadSection";
import VariationsSection from "./Variations/VariationsSection";
import ProductParentTable from "./Variations/ProductParentTable";

const ParentProductIdentityNew = ({ productId }) => {
    const {
        formData,
        allCategory,
        inputErrors,
        images,
        variantArrValues,
        sellerSky,
        skuErrors,
        loadingSkus,
        issubmitLoader,
        isCoponentLoader,
        modalState,
        setFormData,
        setInputErrors,
        initializeData,
        parentsubmitHandle,
        generateCombinations,
        handleClose,
        trimValue,
        varintList,
        varintHandler,
        InnervariationsHandle
    } = useParentProductStore();

    useEffect(() => {
        initializeData(productId);
    }, [productId]);

    const formDataHandler = (e) => {
        const trimmedValue = trimValue(e.target.value);
        setFormData({ [e.target.name]: trimmedValue });
        setInputErrors({ [e.target.name]: "" });
    };

    const validateField = (fieldName) => {
        if (!trimValue(formData[fieldName])) {
            setInputErrors({ [fieldName]: `${fieldName.replace(/([A-Z])/g, ' $1')} Required` });
        }
    };

    const currentCombinations = generateCombinations(formData.Innervariations);

    if (isCoponentLoader) {
        return (
            <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <CircularProgress size="3rem" />
            </Box>
        );
    }

    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <TextFormField
                    label="Product Title"
                    name="productTitle"
                    value={formData.productTitle}
                    onChange={formDataHandler}
                    onBlur={() => validateField('productTitle')}
                    error={inputErrors.productTitle}
                    helperText={inputErrors.productTitle}
                    required
                />

                <TextFormField
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={formDataHandler}
                    onBlur={() => validateField('description')}
                    error={inputErrors.description}
                    helperText={inputErrors.description}
                    required
                    multiline
                    rows={2}
                />

                <SelectFormField
                    label="Sub category"
                    value={formData.subCategory}
                    onChange={(e) => {
                        setInputErrors({ subCategory: "" });
                        setFormData({ subCategory: e.target.value });
                    }}
                    options={allCategory}
                    error={inputErrors.subCategory}
                    helperText={inputErrors.subCategory}
                />

                <TextFormField
                    label="Seller Sku"
                    name="sellerSku"
                    value={formData.sellerSku}
                    onChange={formDataHandler}
                    onBlur={() => validateField('sellerSku')}
                    error={inputErrors.sellerSku}
                    helperText={inputErrors.sellerSku}
                    required
                />

                <ImageUploadSection />

                <VariationsSection
                    formData={formData}
                    varintList={varintList}
                    varintHandler={varintHandler}
                    InnervariationsHandle={InnervariationsHandle}
                    inputErrors={inputErrors}
                />

                {Object.keys(formData?.Innervariations).length > 0 && (
                    <ProductParentTable
                        variantArrValues={variantArrValues}
                        setVariantArrValue={useParentProductStore.getState().setVariantArrValue}
                        combinations={currentCombinations}
                        formdataaaaa={formData.variant_name}
                        sellerSky={sellerSky}
                        setSellerSku={useParentProductStore.getState().setSellerSku}
                        setIsconponentLoader={useParentProductStore.getState().setIsComponentLoader}
                        skuErrors={skuErrors}
                        setSkuErrors={useParentProductStore.getState().setSkuErrors}
                        loadingSkus={loadingSkus}
                        setLoadingSkus={useParentProductStore.getState().setLoadingSkus}
                        parentVariants={formData.variantData}
                        checkForDuplicateSkus={useParentProductStore.getState().checkForDuplicateSkus}
                    />
                )}

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", gap: "5px" }}>
                        <Button
                            disabled={issubmitLoader}
                            variant="contained"
                            onClick={() => parentsubmitHandle(productId)}
                            startIcon={issubmitLoader ? <CircularProgress size={20} /> : null}
                        >
                            {issubmitLoader ? "Submitting..." : "Submit"}
                        </Button>
                    </Box>
                </Box>
            </Box>

            <ConfirmModal
                open={modalState.open}
                handleClose={handleClose}
                type={modalState.type}
                msg={modalState.msg}
            />
        </>
    );
};

export default ParentProductIdentityNew;
