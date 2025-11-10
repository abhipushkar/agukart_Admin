// components/ParentProduct/VariationsSection.jsx
import React from 'react';
import { Box, Autocomplete, TextField, Typography, Stack } from '@mui/material';
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {useParentProductStore} from "../../../states/parentProductStore";

const VariationsSection = () => {
    const {
        formData,
        varintList,
        inputErrors,
        setFormData,
        setInputErrors,
        generateCombinations,
        updateCombinationMap,
        combinationMap,
        variantArrValues,
        setVariantArrValue,
        sellerSky,
        setSellerSku,
        preserveCombinationData
    } = useParentProductStore();

    const varintHandler = (event, value) => {
        setFormData({
            variantData: value,
            variant_id: value.map((option) => option.id),
            variant_name: value.map((option) => option.variant_name)
        });
        setInputErrors({ variations: "" });
    };

    const InnervariationsHandle = (variantId) => (event, newValue) => {
        const updatedInnervariations = {
            ...formData.Innervariations,
            [variantId]: newValue
        };

        const newCombinations = generateCombinations(updatedInnervariations);

        const { preservedVariantData, preservedSellerSky } = preserveCombinationData(
            newCombinations,
            variantArrValues,
            sellerSky
        );

        updateCombinationMap(newCombinations);

        setFormData({ Innervariations: updatedInnervariations });
        setVariantArrValue(preservedVariantData);
        setSellerSku(preservedSellerSky);
        setInputErrors({ innervariation: "" });
    };

    return (
        <>
            <Box sx={{ marginTop: "22px", display: "flex", gap: "20px" }}>
                <Box sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    wordBreak: "normal",
                    width: "15%",
                    textOverflow: "ellipsis",
                    display: "flex",
                    textWrap: "wrap"
                }}>
                    Variations
                    <span style={{ color: "red", fontSize: "15px", margin: "0 3px" }}>*</span>:
                </Box>
                <Box width={"100%"}>
                    <Autocomplete
                        multiple
                        limitTags={4}
                        onBlur={() => {
                            if (formData?.variantData?.length === 0) {
                                setInputErrors({ variations: "Please Select Variation" });
                            }
                        }}
                        id="multiple-limit-tags"
                        options={varintList}
                        getOptionLabel={(option) => option?.variant_name}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Variant"
                                placeholder="Select Variant"
                                sx={{
                                    "& .MuiInputBase-root": {
                                        padding: "0 11px"
                                    },
                                    "& .MuiFormLabel-root": {
                                        top: "-7px"
                                    }
                                }}
                            />
                        )}
                        sx={{ width: "100%" }}
                        onChange={varintHandler}
                        name="variantData"
                        value={formData.variantData}
                        isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    />
                    {inputErrors.variations && (
                        <Typography sx={{
                            fontSize: "12px",
                            color: "#FF3D57",
                            marginLeft: "14px",
                            marginRight: "14px",
                            marginTop: "3px"
                        }}>
                            {inputErrors.variations}
                        </Typography>
                    )}
                </Box>
            </Box>

            <Stack gap={"16px"} sx={{ pb: 0 }}>
                {formData?.variantData?.map((inputField, index) => (
                    <Stack key={inputField._id} alignItems={"center"} direction={"row"}>
                        <Box sx={{
                            fontSize: "14px",
                            fontWeight: 700,
                            wordBreak: "normal",
                            width: "15%",
                            textOverflow: "ellipsis",
                            display: "flex",
                            textWrap: "wrap",
                            textAlign: "center",
                            gap: "3px"
                        }}>
                            {inputField?.variant_name} <HelpOutlineIcon sx={{ width: "15px" }} />:
                        </Box>

                        <Box width={"100%"} my={2} ml={3}>
                            <Autocomplete
                                multiple
                                limitTags={4}
                                onBlur={() => {
                                    if (Object.keys(formData.Innervariations).length == 0) {
                                        setInputErrors({ innervariation: "Please Select Ineer Variation Fields" });
                                    }
                                }}
                                id="multiple-limit-tags"
                                options={inputField?.variant_attribute || []}
                                getOptionLabel={(option) => option.attribute_value}
                                renderInput={(params) => {
                                    return (
                                        <TextField
                                            {...params}
                                            label={inputField?.variant_name}
                                            placeholder={`select ${inputField?.variant_name}`}
                                            sx={{
                                                "& .MuiInputBase-root": {
                                                    padding: "0 11px"
                                                },
                                                "& .MuiFormLabel-root": {
                                                    top: "-7px"
                                                }
                                            }}
                                        />
                                    );
                                }}
                                sx={{ width: "100%" }}
                                onChange={InnervariationsHandle(inputField?.variant_name)}
                                value={formData?.Innervariations[inputField?.variant_name] || []}
                                isOptionEqualToValue={(option, value) => option._id === value._id}
                            />
                            {inputErrors.innervariation && (
                                <Typography sx={{
                                    fontSize: "12px",
                                    color: "#FF3D57",
                                    marginLeft: "14px",
                                    marginRight: "14px",
                                    marginTop: "3px"
                                }}>
                                    {inputErrors.innervariation}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                ))}
            </Stack>
        </>
    );
};

export default VariationsSection;
