// AddProductNew.jsx
import { Box, Button, Divider, Paper, Stack, Typography, CircularProgress } from "@mui/material";
import AppsIcon from "@mui/icons-material/Apps";
import { ROUTE_CONSTANT } from "../../../constant/routeContanst";
import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProductTabs from "./tabs/productTabs";
import tabsList from "./tabs/tabsList";
import tabsComponents from "./tabs/productTabs/tabsComponents";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import ConfirmModal from "app/components/ConfirmModal";
import {useProductFormStore} from "../states/useAddProducts";
import useProductAPI from "../states/useProductApi";

export default function AddProductNew() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryId = searchParams.get("id");
    const copyQueryId = searchParams.get("_id");
    const [currentTab, setCurrentTab] = useState(0);

    const {
        resetForm,
        formData,
        initializeFormWithEditData,
        validateForm,
        setInputErrors,
        setBrandList,
        setAllVendors,
        setAllCategory,
        setExchangePolicy,
        setShippingTemplateData,
        inputErrors,
    } = useProductFormStore();

    const {
        submitProduct,
        saveDraft,
        fetchEditProductData,
        loading,
        draftLoading,
    } = useProductAPI();

    const [open, setOpen] = useState(false);
    const [type, setType] = useState("");
    const [msg, setMsg] = useState(null);

    const auth_key = localStorage.getItem(localStorageKey.auth_key);
    const designation_id = localStorage.getItem(localStorageKey.designation_id);

    useEffect(() => {
        resetForm();
        localStorage.removeItem("product-form-storage");
    }, []);

    // Fetch edit product data if query parameters exist
    useEffect(() => {
        const fetchEditProductData = async () => {
            if (queryId || copyQueryId) {
                try {
                    const editapiUrl = `${apiEndpoints.EditProduct}/${copyQueryId || queryId}`;
                    const res = await ApiService.get(editapiUrl, auth_key);
                    if (res?.status === 200) {
                        initializeFormWithEditData(res?.data?.productData);
                    }
                } catch (error) {
                    handleOpen("error", error);
                    console.log("error", error);
                }
            }
        };

        fetchEditProductData();
    }, [queryId, copyQueryId, auth_key, initializeFormWithEditData]);

    const handleOpen = (type, msg) => {
        setMsg(msg?.message ? msg?.message : msg);
        setOpen(true);
        setType(type);
    };

    const handleClose = () => {
        setOpen(false);
        setMsg(null);
    };

    const handleReset = () => {
        resetForm();
    };

    const handleNext = () => {
        // Validate current tab before proceeding
        const errors = validateCurrentTab();
        if (Object.keys(errors).length === 0) {
            setCurrentTab(prev => Math.min(prev + 1, tabsList.length - 1));
        } else {
            setInputErrors(errors);
        }
    };

    const handlePrevious = () => {
        setCurrentTab(prev => Math.max(prev - 1, 0));
    };

    const validateCurrentTab = () => {
        const errors = {};

        switch (currentTab) {
            case 0: // Product Identity
                if (!formData.productTitle || formData.productTitle === "<p><br></p>") {
                    errors.productTitle = "Product Title is Required";
                }
                if (!formData.subCategory) {
                    errors.subCategory = "Category is Required";
                }
                const designation_id = localStorage.getItem(localStorageKey.designation_id);
                if (designation_id === "2" && !formData.vendor) {
                    errors.vendor = "Shop name is Required";
                }
                break;

            case 1: // Description
                if (!formData.productDescription || formData.productDescription === "<p><br></p>") {
                    errors.des = "Description is Required";
                }
                if (!formData.images || formData.images.length === 0) {
                    errors.images = "Product image is Required";
                }
                break;

            // Add validation for other tabs as needed
            default:
                break;
        }

        return errors;
    };

    const handleSubmit = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setInputErrors(errors);
            handleOpen("error", "Please fix all validation errors before submitting.");
            return;
        }

        try {
            await submitProduct(!!queryId, queryId);
            handleOpen("success", "Product submitted successfully!");
        } catch (error) {
            handleOpen("error", error);
        }
    };

    const handleSaveDraft = async () => {
        try {
            await saveDraft(queryId);
            handleOpen("success", "Product saved as draft successfully!");
        } catch (error) {
            handleOpen("error", error);
        }
    };

    const getVendorList = async () => {
        try {
            const res = await ApiService.get(apiEndpoints.getVendorsList, auth_key);
            if (res?.status === 200) {
                setAllVendors(res?.data?.data);
            }
        } catch (error) {
            console.error("Error fetching vendors:", error);
        }
    };

    const getBrandList = async () => {
        try {
            const res = await ApiService.get(apiEndpoints.getBrand, auth_key);
            if (res.status === 200) {
                setBrandList(res?.data?.brand);
            }
        } catch (error) {
            console.error("Error fetching brands:", error);
        }
    };

    const getChildCategory = async () => {
        try {
            const res = await ApiService.get(apiEndpoints.getChildCategory, auth_key);
            if (res.status === 200) {
                setAllCategory(res?.data?.data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await Promise.all([
                    getBrandList(),
                    getChildCategory(),
                    designation_id === "2" ? getVendorList() : Promise.resolve()
                ]);
            } catch (error) {
                console.error("Error fetching initial data:", error);
            }
        };

        fetchInitialData();
    }, [designation_id]);

    const getAllShippingTemplates = async () => {
        try {
            const res = await ApiService.get(apiEndpoints.getAllShippingTemplates, auth_key);
            if (res.status === 200) {
                setShippingTemplateData(res?.data?.template || []);
            }
        } catch (error) {
            console.log("Error fetching shipping templates:", error);
        }
    };

    const getExchangePolicy = async () => {
        try {
            const payload = {
                vendor_id: formData?.vendor
            };
            const res = await ApiService.post(apiEndpoints.getAllExchangePolicy, payload, auth_key);
            if (res.status === 200) {
                setExchangePolicy(res?.data?.policies || []);
            }
        } catch (error) {
            console.log("Error fetching exchange policies:", error);
        }
    };

    useEffect(() => {
        getAllShippingTemplates();
    }, []);

    useEffect(() => {
        if (formData.vendor) {
            getExchangePolicy();
        }
    }, [formData.vendor]);

    return (
        <Container maxWidth={"100%"} >
            <Box sx={{ py: 2.5, my: 3 }} component={Paper}>
                <Stack sx={{ ml: "16px", mb: "12px" }} gap={1} direction={"row"}>
                    <Box>
                        <AppsIcon />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Go To</Typography>
                    </Box>
                </Stack>
                <Divider />
                <Box sx={{ ml: "16px", mt: "16px" }}>
                    <Button
                        onClick={() => navigate(ROUTE_CONSTANT.catalog.productNew.list)}
                        startIcon={<AppsIcon />}
                        variant="contained"
                    >
                        Product List
                    </Button>
                </Box>
            </Box>
            <Box sx={{ py: 2.5 }} component={Paper}>
                <Stack sx={{ ml: "16px", mb: "12px" }} gap={1} direction={"row"}>
                    <Box>
                        <AppsIcon />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Add Product</Typography>
                    </Box>
                </Stack>
                <Divider />
                <ProductTabs
                    tabsList={tabsList}
                    tabsComponents={tabsComponents}
                    currentTab={currentTab}
                    setCurrentTab={setCurrentTab}
                />
                <Box sx={{ p: 3, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                    {/* Left side - Navigation buttons */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handlePrevious}
                            disabled={currentTab === 0}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleNext}
                            disabled={currentTab === tabsList.length - 1}
                        >
                            Next
                        </Button>
                    </Box>

                    {/* Right side - Action buttons */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            onClick={handleSaveDraft}
                            disabled={draftLoading}
                            startIcon={draftLoading ? <CircularProgress size={16} /> : null}
                        >
                            {draftLoading ? "Saving..." : "Save as Draft"}
                        </Button>
                        {/*<Button*/}
                        {/*    variant="outlined"*/}
                        {/*    onClick={handleReset}*/}
                        {/*    disabled={loading || draftLoading}*/}
                        {/*>*/}
                        {/*    Reset*/}
                        {/*</Button>*/}
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={16} /> : null}
                        >
                            {loading ? "Saving..." : "Save Product"}
                        </Button>
                    </Box>
                </Box>
            </Box>
            <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
        </Container>
    );
}
