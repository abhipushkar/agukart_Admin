import { Avatar, Box, Dialog, ListItem, Typography } from '@mui/material';
import React from 'react'
import Button from "@mui/material/Button";
import { useState } from 'react';
import { ApiService } from "app/services/ApiService";
import CloseIcon from "@mui/icons-material/Close";
import { localStorageKey } from "app/constant/localStorageKey";
import { apiEndpoints } from "app/constant/apiEndpoints";
import TextField from "@mui/material/TextField";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { REACT_APP_WEB_URL } from 'config';
import MessagePopup from './MessagePopup';

const Product = ({ saleData, baseUrl, getOrderList, handleOpen, item }) => {
    console.log({ saleData, item }, "trhththtt")
    const [openPopup, SetOpenPopup] = useState(false);
    const navigate = useNavigate();
    const auth_key = localStorage.getItem(localStorageKey.auth_key);
    const [stock, setStock] = useState(0);
    const [combinationStockId,setCombinationStockId] = useState([]);
    const [openPop, setOpenPop] = useState(false);
    const popClose = () => {
        setOpenPop(false);
    };
    const handleClickPopup = () => {
        SetOpenPopup(true);
    };

    const handleClosePopup = () => {
        SetOpenPopup(false);
    };
    const updateQty = async () => {
        try {
            const payload = {
                _id: saleData?.productMain?._id,
                qty: stock,
                isCombination: saleData?.isCombination,
                combinationData: combinationStockId
            };
            const res = await ApiService.post(apiEndpoints.updateProductQuantity, payload, auth_key);
            if (res?.status === 200) {
                popClose();
                getOrderList();
            }
        } catch (error) {
            handleOpen("error", error);
        }
    };
    const getCombinations = (arr) => {
        let combinations = arr.map(item =>
            [item]
        );
        if (arr.length > 1) {
            for (let i = 0; i < arr.length; i++) {
                for (let j = i + 1; j < arr.length; j++) {
                    combinations.push([arr[i], arr[j]]);
                }
            }
        }
        return combinations;
    };
    const handleClickOpen = () => {
        setOpenPop(true);
    };

    useEffect(() => {
        if (saleData?.isCombination && saleData?.productMain?.form_values?.isCheckedQuantity) {
            const variantCombinations = getCombinations(saleData?.variant_attribute_id);
            const mergedCombinations = saleData?.productMain?.combinationData?.map((item) => item.combinations).flat();
            const data = mergedCombinations?.filter((item) =>
                variantCombinations?.some((combination) =>
                    Array.isArray(item?.combIds) && Array.isArray(combination) &&
                    JSON.stringify(item?.combIds) === JSON.stringify(combination)
                )
            );
            if (data.length <= 1) {
                if (data[0]?.isVisible && +data[0]?.qty > 0 && data[0]?.isCheckedQuantity) {
                    setStock(+data[0]?.qty);
                    setCombinationStockId(data[0]?.combIds);
                } else {
                    setStock(+saleData?.productMain?.qty);
                }
            } else {
                console.log(data,"Rthryhryhrt")
                data.forEach((item) => {
                    if (item.isVisible && item?.isCheckedQuantity) {
                        if (+item.qty > 0) {
                            setStock(+item.qty);
                            setCombinationStockId(item?.combIds);
                        }
                    }
                });
                if (!data.some((item) => +item.qty > 0 && item.isVisible)) {
                    setStock(+saleData?.productMain?.qty);
                }
            }
        } else {
            setStock(+saleData?.productMain?.qty);
        }
    }, [saleData])

    return (
        <>
            <Box sx={{ display: "flex" }}>
                <Typography
                    sx={{
                        cursor: "pointer",
                        position: "relative",
                        width: 150, height: 150, borderRadius: 2, overflow: "hidden"
                    }}
                    component="div"
                    textAlign={"start"}
                    marginRight={2}
                >
                    <a
                        href={`${REACT_APP_WEB_URL}/products?id=${saleData?.product_id}`}
                        target="_blank"

                    >
                        <img
                            alt="image"
                            src={`${baseUrl}/${saleData?.productMain?.image[0]}`}
                            style={{ width: "100%", height: "100%", borderRadius: 2, objectFit: "cover" }}



                        />
                        {stock > 0 ? (
                            <Typography
                                component="span"
                                sx={{
                                    position: "absolute",
                                    bottom: "0px",
                                    left: "0px",
                                    background: "#000",
                                    color: "#fff",
                                    padding: "3px 9px",
                                    borderRadius: "5px",
                                    fontSize: "10px"
                                }}
                            >
                                Left {stock}
                            </Typography>
                        ) : (
                            <Typography
                                component="span"
                                sx={{
                                    position: "absolute",
                                    bottom: "0px",
                                    left: "0px",
                                    background: "red",
                                    color: "#fff",
                                    padding: "3px 9px",
                                    borderRadius: "5px",
                                    fontSize: "10px"
                                }}
                            >
                                Sold
                            </Typography>
                        )}

                    </a>
                    {stock > 0 ? (
                        <Typography
                            component="span"
                            sx={{
                                position: "absolute",
                                bottom: "0px",
                                left: "0px",
                                background: "#000",
                                color: "#fff",
                                padding: "3px 9px",
                                borderRadius: "5px",
                                fontSize: "10px"
                            }}
                        >
                            Left {stock}
                        </Typography>
                    ) : (
                        <Typography
                            component="span"
                            sx={{
                                position: "absolute",
                                bottom: "0px",
                                left: "0px",
                                background: "red",
                                color: "#fff",
                                padding: "3px 9px",
                                borderRadius: "5px",
                                fontSize: "10px"
                            }}
                        >
                            Sold
                        </Typography>
                    )}
                </Typography>
                <Box textAlign={"start"}>
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
                            maxWidth: { xs: "100%", md: "400px" }
                        }}
                    >
                        {saleData?.productMain?.product_title?.replace(
                            /<\/?[^>]+(>|$)/g,
                            ""
                        )}
                    </Typography>
                    <Typography fontSize={14} sx={{ color: "#000" }}>
                        Product SKU:{" "}
                        <Typography component="span">
                            {saleData?.productMain?.sku_code}
                        </Typography>
                    </Typography>
                    <Typography fontSize={14} sx={{ color: "#000" }}>
                        Quantity:{" "}
                        <Typography component="span">
                            {saleData?.qty}
                        </Typography>
                    </Typography>
                    {saleData?.isCombination === true &&
                        saleData?.variantData?.map(
                            (variantItem, variantIndex) => (
                                <Typography
                                    fontSize={14}
                                    sx={{ color: "#000" }}
                                    key={variantIndex}
                                >
                                    {variantItem?.variant_name}:{" "}
                                    <Typography component="span">
                                        {
                                            saleData?.variantAttributeData[variantIndex]
                                                ?.attribute_value
                                        }
                                    </Typography>
                                </Typography>
                            )
                        )
                    }
                    {
                        saleData?.customize == "Yes" && (
                            <>
                                {
                                    saleData?.customizationData?.map((item, index) => (
                                        <div key={index}>
                                            {Object.entries(item).map(([key, value]) => (
                                                <div key={key}>
                                                    {typeof value === 'object' ? (
                                                        <div>
                                                            {key}:{`${value?.value} ($ ${value?.price})`}
                                                        </div>
                                                    ) : (
                                                        <div>{key}: {value}</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ))
                                }
                            </>
                        )
                    }
                    {/* <Typography fontSize={14} sx={{ color: "#000" }}>
                        Personalization:{" "}
                        <Typography component="span">
                            Not requested on this item
                        </Typography>
                    </Typography> */}
                    <Typography component="div" mt={2}>
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
                        >
                            Update quantity
                        </Button>
                        <Button sx={{ color: "#000" }} onClick={handleClickPopup}>
                            <MailOutlineIcon />
                        </Button>
                    </Typography>
                </Box>
            </Box>
            <Dialog open={openPop} onClose={popClose} sx={{ "& .MuiPaper-root": { maxWidth: "750px" } }}>
                {saleData?.productMain && (
                    <Box p={2} sx={{ position: "relative" }}>
                        <Typography variant="h4">You are about to Update 1 Listing</Typography>
                        <Box mt={2} sx={{ display: { lg: "flex", md: "flex", xs: "block" } }}>
                            {saleData?.productMain?.image?.length > 0 && (
                                <Typography component="div">
                                    <img
                                        src={`${baseUrl}/${saleData?.productMain?.image[0]}`}
                                        style={{
                                            height: "200px",
                                            width: "200px",
                                            objectFit: "cover",
                                            aspectRatio: "1/1"
                                        }}
                                        alt="Product"
                                    />
                                </Typography>
                            )}
                            <Typography component="div" sx={{ paddingLeft: { lg: 2, md: 2, xs: 0 } }}>
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
                                    {saleData?.productMain?.product_title?.replace(/<\/?[^>]+(>|$)/g, "")}
                                </Typography>
                                <Typography fontSize={16} sx={{ color: "#000" }}>
                                    Quantity:{" "}
                                    <Typography component="span">
                                        {saleData?.qty}
                                    </Typography>
                                </Typography>
                                <Typography fontSize={16} sx={{ color: "#000" }}>
                                    SKU: <Typography component="span">4 inch Red 6 Kon</Typography>
                                </Typography>
                                <Typography fontSize={16} sx={{ color: "#000" }}>
                                    Style: <Typography component="span">Chillum with stopper</Typography>
                                </Typography>
                                {saleData?.isCombination === true &&
                                    saleData?.variantData?.map((variantItem, variantIndex) => (
                                        <Typography fontSize={16} sx={{ color: "#000" }} key={variantIndex}>
                                            {variantItem?.variant_name}:{" "}
                                            <Typography component="span">
                                                {saleData?.variantAttributeData[variantIndex]?.attribute_value}
                                            </Typography>
                                        </Typography>
                                    ))}
                                <Typography fontSize={16} sx={{ color: "#000" }}>
                                    Personalization:{" "}
                                    <Typography component="span">Not requested on this item</Typography>
                                </Typography>
                                <Box mt={2}>
                                    <Typography component="div" sx={{ display: "flex", alignItems: "center" }}>
                                        <Typography component="span" fontSize={14} fontWeight={500} pr={2}>
                                            Stock:
                                        </Typography>
                                        <TextField
                                            type="number"
                                            value={stock}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value >= 0) {
                                                    setStock(value);
                                                }
                                            }}
                                        />
                                    </Typography>
                                </Box>
                                <Typography
                                    mt={2}
                                    component="div"
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
                                        Update later
                                    </Button>
                                    <Button
                                        sx={{
                                            background: "#000",
                                            color: "#fff",
                                            borderRadius: "30px",
                                            padding: "4px 30px",
                                            "&:hover": { background: "#2e2e2e" }
                                        }}
                                        onClick={updateQty}
                                    >
                                        Update
                                    </Button>
                                </Typography>
                            </Typography>
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
                    vendorID={saleData?.vendor_id}
                    orderId={item?.order_id}
                    product_image={`${baseUrl}/${saleData?.productMain?.image[0]}`}
                    productData={saleData}
                    userName={item?.userName}
                    vendorName={saleData?.vendor_name}
                    shopName={item?.shop_name}
                    userId={item?.user_idnumer}
                    userImage={item?.user_image}
                    handleClosePopup={handleClosePopup}
                />
            }
        </>
    )
}

export default Product
