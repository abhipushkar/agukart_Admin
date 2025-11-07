import * as React from "react";
import {
    Box,
    Button,
    Stack,
} from "@mui/material";
import { toast } from "react-toastify";
import { TextField } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { v4 as uuidv4 } from "uuid";
import CircularProgress from "@mui/material/CircularProgress";
import ProductParentTable from "app/components/ProductListTable/ProductParentTable";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { useEffect } from "react";
import { useState } from "react";
import dayjs from "dayjs";
import ConfirmModal from "app/components/ConfirmModal";
import {useParentProductStore} from "../../states/parentProductStore";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const ParentProductIdentityNew = ({ productId }) => {
    const navigate = useNavigate();

    // Zustand store
    const {
        formData,
        varintList,
        varientAttribute,
        images,
        isCoponentLoader,
        issubmitLoader,
        variantArrValues,
        skuErrors,
        loadingSkus,
        sellerSky,
        inputErrors,
        modal,

        // Actions
        updateFormData,
        setVarientAttribute,
        setImages,
        setIsComponentLoader,
        setSubmitLoader,
        setVariantArrValue,
        setSkuErrors,
        setLoadingSkus,
        setSellerSku,
        setCombinationMap,
        setInputErrors,
        updateInputErrors,
        openModal,
        closeModal,

        // Helper functions
        trimValue,
        formDataHandler,

        // API functions
        getBrandList,
        getVaraintList,
        getChildCategory,
        handleApiError,

        // Variation handlers
        generateCombinations,
        generateCombinationKey,

        // Reset
        resetStore
    } = useParentProductStore();

    const auth_key = localStorage.getItem(localStorageKey.auth_key);
    const [parentId, setParentId] = useState("");
    const inputFileRef = React.useRef(null);

    const logOut = () => {
        localStorage.removeItem(localStorageKey.auth_key);
        localStorage.removeItem(localStorageKey.designation_id);
        localStorage.removeItem(localStorageKey.vendorId);
        navigate(ROUTE_CONSTANT.login);
    };

    React.useEffect(() => {
        getBrandList();
        getVaraintList();
        getChildCategory();
    }, []);

    React.useEffect(() => {
        if (Object.keys(formData.Innervariations).length > 0) {
            let arr = [];
            for (let i = 0; i < formData.variant_name.length; i++) {
                let data = formData.Innervariations[formData.variant_name[i]];
                const newarrrr = formData.Innervariations[formData.variant_name[i]]?.map((item) => {
                    return item._id;
                });

                if (!newarrrr) {
                    return;
                }
                arr.push(newarrrr);
            }

            const myarr = arr.flat();
            setVarientAttribute(myarr);
        }
    }, [formData.variant_name, formData.Innervariations]);

    const validateChildProductVariants = (childProductData, parentVariants) => {
        if (!childProductData?.variants_used || !parentVariants?.length) return null;

        const parentVariantNames = parentVariants.map(v => v.variant_name);
        const childVariantNames = childProductData.variants_used.map(v => v.variant_name);

        const conflictingVariants = parentVariantNames.filter(parentVariant =>
            childVariantNames.includes(parentVariant)
        );

        if (conflictingVariants.length > 0) {
            return `Child product already uses variants: ${conflictingVariants.join(', ')}. Please select different variants.`;
        }

        return null;
    };

    const checkForDuplicateSkus = (sku, index) => {
        if (!sku) return null;

        const trimmedSku = trimValue(sku);
        const otherSkus = sellerSky.filter((_, i) => i !== index).map(sku => trimValue(sku));

        if (otherSkus.includes(trimmedSku)) {
            return "This SKU is already used in another variant combination";
        }

        return null;
    };

    const validateForm = () => {
        const errors = {};

        if (!trimValue(formData.productTitle)) errors.productTitle = "Product Title is Required";
        if (!trimValue(formData.description)) errors.description = "Description is Required";
        if (!trimValue(formData.sellerSku)) errors.sellerSku = "Seller Sku is Required";
        if (formData.variantData.length === 0) errors.variations = "Please Select At least one Variant";
        if (Object.keys(formData.Innervariations).length === 0) errors.innervariation = "Please Select At least one Innervariations Variant";
        if (images.length === 0) errors.parentImage = "Images Is Required";

        // Check for SKU errors
        const hasSkuErrors = Object.values(skuErrors).some(error => error);
        if (hasSkuErrors) {
            toast.error("Please fix SKU validation errors before submitting");
            return false;
        }

        setInputErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const getCurrentCombinations = () => {
        return generateCombinations(formData.Innervariations);
    };

    const trimObjectValues = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;

        const trimmedObj = {};
        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'string') {
                trimmedObj[key] = obj[key].trim();
            } else {
                trimmedObj[key] = obj[key];
            }
        });
        return trimmedObj;
    };

    const trimArrayValues = (array) => {
        if (!Array.isArray(array)) return array;

        return array.map(item => {
            if (typeof item === 'string') {
                return item.trim();
            } else if (typeof item === 'object' && item !== null) {
                return trimObjectValues(item);
            }
            return item;
        });
    };

    const parentsubmitHandle = async () => {
        if (!validateForm()) {
            toast.error("Please fill all required fields");
            return;
        }

        const currentCombinations = getCurrentCombinations();

        const combine = currentCombinations.map((combination, index) => {
            const comb = Object.keys(combination)
                .map((key) => combination[key]._id)
                .join(",");

            const variantData = variantArrValues[index] || {};

            return {
                ...variantData,
                comb: comb,
                sku_code: sellerSky[index] ? trimValue(sellerSky[index]) : ""
            };
        });

        function validateProductArray(combine) {
            return combine.every((product, index) => {
                const isExistingProduct = product.product_id && product.product_id !== "";
                const isValid = isExistingProduct
                    ? product.sku_code
                    : product.sale_price && product.qty && product.comb && product.sku_code;

                if (!isValid) {
                    const message = isExistingProduct
                        ? `SKU is mandatory for variant combination ${index + 1}`
                        : `All fields are mandatory for variant combination ${index + 1}`;
                    toast.error(message);
                }
                return isValid;
            });
        }

        const check = validateProductArray(combine);
        if (!check) return;

        const param = {
            _id: productId ? productId : "new",
            product_title: trimValue(formData.productTitle),
            description: trimValue(formData.description),
            seller_sku: trimValue(formData.sellerSku),
            variant_id: formData.variant_id,
            variant_attribute_id: varientAttribute,
            combinations: trimArrayValues(combine),
            sub_category: formData?.subCategory || "",
            sku: trimArrayValues(sellerSky)
        };

        try {
            setSubmitLoader(true);
            const urlWithParam = `${apiEndpoints.AddParentProduct}`;
            const ImagesurlWithParam = `${apiEndpoints.ParentImagesAddParentProduct}`;
            const res = await ApiService.post(urlWithParam, param, auth_key);
            if (res.status === 200) {
                if (images?.[0]?.file) {
                    const formData = new FormData();
                    formData.append("_id", parentId ? parentId : res?.data?.parent_product._id);
                    formData.append(
                        "file",
                        productId
                            ? images?.[0]?.file
                                ? images?.[0]?.file
                                : images?.[0]?.src
                            : images?.[0]?.file
                    );
                    await ApiService.postImage(ImagesurlWithParam, formData, auth_key);
                }

                resetStore();
                navigate(ROUTE_CONSTANT.catalog.product.list);
                openModal("success", res?.data);
            }
        } catch (error) {
            handleApiError(error, "Failed to save product");
        } finally {
            setSubmitLoader(false);
        }
    };

    const handleButtonClick = () => {
        inputFileRef.current.click();
    };

    const handleImageChange = (e) => {
        const fileList = Array.from(e.target.files);

        if (fileList.length + images.length > 1) {
            toast.error("Only one image can be uploaded");
            return;
        }

        const imageUrls = fileList.map((file) => ({
            src: URL.createObjectURL(file),
            id: images.length,
            file: file,
            _id: uuidv4()
        }));

        setImages(imageUrls);
    };

    const [imgName, setImgName] = useState();

    const getParentProductDetail = async () => {
        try {
            const res = await ApiService.get(
                `${apiEndpoints.getParentProductDetail}/${productId}`,
                auth_key
            );
            if (res?.status === 200) {
                const resData = res?.data?.data;
                setImgName(resData?.image);

                updateFormData({
                    productTitle: resData?.product_title || "",
                    description: resData?.description || "",
                    sellerSku: resData?.seller_sku || "",
                    images: [{ src: `${res?.data?.base_url}${resData?.image}` }],
                    variant_id: resData?.variant_id?.map((option) => option?._id) || [],
                    variant_name: resData?.variant_id?.map((option) => option?.variant_name) || [],
                    subCategory: resData?.sub_category || ""
                });

                setParentId(resData?._id);
                setVarientAttribute(resData?.variant_attribute_id.map((option) => option._id) || []);

                if (resData?.sku && resData?.sku.length > 0) {
                    const arr = resData.sku.map(async (sku, i) => {
                        if (!sku) {
                            return {
                                _id: "",
                                product_id: "",
                                sale_price: "",
                                price: "",
                                sale_start_date: "",
                                sale_end_date: "",
                                qty: ""
                            };
                        }

                        let url = apiEndpoints.getProductBySku + `/${sku}`;
                        const res = await ApiService.get(url, auth_key);

                        if (res.status === 200) {
                            let obj = res.data.data;
                            let sale_start_date = obj.sale_start_date ? dayjs(obj.sale_start_date) : "";
                            let sale_end_date = obj.sale_end_date ? dayjs(obj.sale_end_date) : "";

                            const variantError = validateChildProductVariants(obj, resData?.variant_id);

                            if (variantError) {
                                setSkuErrors(prev => ({
                                    ...prev,
                                    [i]: variantError
                                }));
                            }

                            return {
                                ...obj,
                                _id: obj.product_id,
                                sale_end_date,
                                sale_start_date,
                                price: obj.price || "",
                                sale_price: obj.sale_price || "",
                                qty: obj.qty || "",
                                isExistingProduct: true
                            };
                        }
                        return {
                            _id: "",
                            product_id: "",
                            sale_price: "",
                            price: "",
                            sale_start_date: "",
                            sale_end_date: "",
                            qty: ""
                        };
                    });

                    Promise.all(arr).then((results) => {
                        setVariantArrValue(results);
                        setSellerSku(resData.sku);

                        if (resData?.combinations) {
                            const initialMap = new Map();
                            resData.combinations.forEach((comb, index) => {
                                if (comb.comb) {
                                    initialMap.set(comb.comb.replace(/,/g, '_'), index);
                                }
                            });
                            setCombinationMap(initialMap);
                        }
                    });
                }
            }
        } catch (error) {
            handleApiError(error, "Failed to load product details");
        }
    };

    useEffect(() => {
        if (productId) {
            setImages(formData?.images);
        }
    }, [formData?.images]);

    useEffect(() => {
        if (formData?.variant_id && varintList) {
            const filteredVariantData = varintList.filter((variant) =>
                formData.variant_id.includes(variant.id)
            );

            updateFormData({
                variantData: filteredVariantData
            });
        }
    }, [formData?.variant_id, varintList]);

    useEffect(() => {
        if (varientAttribute && formData?.variantData) {
            const filteredData = formData.variantData.reduce((acc, item) => {
                if (item?.variant_attribute) {
                    const filteredAttributes = item.variant_attribute.filter((variant) =>
                        varientAttribute.includes(variant._id)
                    );

                    if (filteredAttributes.length > 0) {
                        acc[item.variant_name] = filteredAttributes;
                    }
                }
                return acc;
            }, {});

            updateFormData({ Innervariations: filteredData });

            if (Object.keys(filteredData).length > 0) {
                const initialCombinations = generateCombinations(filteredData);
                const newMap = new Map();
                initialCombinations.forEach((comb, index) => {
                    const key = generateCombinationKey(comb); // This was causing the error
                    newMap.set(key, index);
                });
                setCombinationMap(newMap);

                if (variantArrValues.length === 0) {
                    const initialVariantData = initialCombinations.map(() => ({
                        _id: "",
                        product_id: "",
                        sale_price: "",
                        price: "",
                        sale_start_date: "",
                        sale_end_date: "",
                        qty: ""
                    }));
                    setVariantArrValue(initialVariantData);
                    setSellerSku(Array(initialCombinations.length).fill(""));
                }
            }
        }
    }, [formData?.variantData]);

    useEffect(() => {
        if (productId) {
            getParentProductDetail();
        }
    }, []);

    const currentCombinations = getCurrentCombinations();

    return (
        <>
            {isCoponentLoader ? (
                <Box
                    sx={{
                        height: "100vh",
                        display: "flex",
                        justifyContent: "center"
                    }}
                >
                    <Stack spacing={2} direction="row" alignItems="center">
                        <CircularProgress size="3rem" />
                    </Stack>
                </Box>
            ) : (
                <>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px"
                        }}
                    >
                        {/* ALL YOUR EXISTING UI CODE REMAINS EXACTLY THE SAME */}
                        {/* ... (All the JSX from your original component) ... */}

                        <Box
                            sx={{
                                display: "flex",
                                gap: "20px"
                            }}
                        >
                            <Box
                                sx={{
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    wordBreak: "normal",
                                    width: "15%",
                                    textOverflow: "ellipsis",
                                    display: "flex",
                                    textWrap: "wrap"
                                }}
                            >
                                Product Title
                                <span
                                    style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}
                                >
                  {" "}
                                    *
                </span>
                                :
                            </Box>
                            <Box
                                sx={{
                                    width: "100%"
                                }}
                            >
                                <TextField
                                    error={inputErrors.productTitle && true}
                                    helperText={inputErrors.productTitle}
                                    sx={{
                                        mb: 2,
                                        "& .MuiInputBase-root": {
                                            height: "40px"
                                        },
                                        "& .MuiFormLabel-root": {
                                            top: "-7px"
                                        }
                                    }}
                                    onBlur={() => {
                                        if (!trimValue(formData.productTitle)) {
                                            updateInputErrors({ productTitle: "Product Title Required" });
                                        }
                                    }}
                                    value={formData.productTitle}
                                    name="productTitle"
                                    onChange={(e) => {
                                        formDataHandler(e);
                                        updateInputErrors({ productTitle: "" });
                                    }}
                                    fullWidth
                                    label="Product Title"
                                    id="fullWidth"
                                />
                            </Box>
                        </Box>

                        {/* ... Rest of your UI components ... */}

                        {Object.keys(formData?.Innervariations).length > 0 ? (
                            <ProductParentTable
                                variantArrValues={variantArrValues}
                                setVariantArrValue={setVariantArrValue}
                                combinations={currentCombinations}
                                formdataaaaa={formData.variant_name}
                                sellerSky={sellerSky}
                                setSellerSku={setSellerSku}
                                setIsconponentLoader={setIsComponentLoader}
                                skuErrors={skuErrors}
                                setSkuErrors={setSkuErrors}
                                loadingSkus={loadingSkus}
                                setLoadingSkus={setLoadingSkus}
                                parentVariants={formData.variantData}
                                checkForDuplicateSkus={checkForDuplicateSkus}
                            />
                        ) : (
                            <></>
                        )}

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between"
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: "5px"
                                }}
                            >
                                <Button
                                    disabled={issubmitLoader ? true : false}
                                    variant="contained"
                                    onClick={parentsubmitHandle}
                                    startIcon={issubmitLoader ? <CircularProgress size={20} /> : null}
                                >
                                    {issubmitLoader ? "Submitting..." : "Submit"}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </>
            )}
            <ConfirmModal
                open={modal.open}
                handleClose={closeModal}
                type={modal.type}
                msg={modal.msg}
            />
        </>
    );
};

export default ParentProductIdentityNew;
