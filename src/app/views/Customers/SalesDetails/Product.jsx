import { Box, Dialog, Typography } from '@mui/material';
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
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { REACT_APP_WEB_URL } from 'config';

const Product = ({ saleData, baseUrl, getOrderList, handleOpen }) => {
    const navigate = useNavigate();
    const auth_key = localStorage.getItem(localStorageKey.auth_key);
    const [stock, setStock] = useState(0);
    const [openPop, setOpenPop] = useState(false);
    const popClose = () => {
        setOpenPop(false);
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

    useEffect(() => {
        if (saleData?.isCombination) {
            const variantCombinations = getCombinations(saleData?.variant_attribute_id);
            const mergedCombinations = saleData?.productMain?.combinationData?.map((item) => item.combinations).flat();
            const data = mergedCombinations?.filter((item) =>
                variantCombinations?.some((combination) =>
                    Array.isArray(item?.combIds) && Array.isArray(combination) &&
                    JSON.stringify(item?.combIds) === JSON.stringify(combination)
                )
            );
            if (data.length <= 1) {
                if (data[0]?.isVisible && +data[0]?.qty > 0) {
                    setStock(+data[0]?.qty);
                } else {
                    setStock(+saleData?.productMain?.qty);
                }
            } else {
                data.forEach((item) => {
                    if (item.isVisible) {
                        if (+item.qty > 0) {
                            setStock(+item.qty);
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
                        height: "120px"
                    }}
                    onClick={() => {
                        navigate(
                            `${ROUTE_CONSTANT.orders.orderHistory}?id=${saleData?._id}`
                        );
                    }}
                    component="div"
                    textAlign={"start"}
                    mt={2}
                    marginRight={2}
                >
                    <a
                        href={`${REACT_APP_WEB_URL}/products?id=${saleData?.product_id}`}
                        target="_blank"
                    >
                        <img
                            src={`${baseUrl}/${saleData?.productData?.image[0]}`}
                            alt=""
                            style={{
                                height: "100%",
                                width: "120px",
                                objectFit: "cover",
                                aspectRatio: "1/1",
                                borderRadius: "4px"
                            }}
                        />
                    </a>
                    {stock > 0 ? (
                        <Typography
                            component="span"
                            sx={{
                                position: "absolute",
                                bottom: "-10px",
                                left: "-13px",
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
                                bottom: "63px",
                                left: "-13px",
                                background: "red",
                                color: "#fff",
                                padding: "3px 9px",
                                borderRadius: "5px",
                                fontSize: "10px"
                            }}
                        >
                            Sold Out
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
                        {saleData?.productData?.product_title?.replace(
                            /<\/?[^>]+(>|$)/g,
                            ""
                        )}
                    </Typography>

                    <Typography fontSize={14} sx={{ color: "#000" }}>
                        Quantity:{" "}
                        <Typography component="span">
                            {saleData?.qty}
                        </Typography>
                    </Typography>
                    <Typography fontSize={14} sx={{ color: "#000" }}>
                        SKU:{" "}
                        <Typography component="span">
                            4 inch Red 6 Kon
                        </Typography>
                    </Typography>
                    <Typography fontSize={14} sx={{ color: "#000" }}>
                        Style:{" "}
                        <Typography component="span">
                            Chillum with stopper
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
                    <Typography fontSize={14} sx={{ color: "#000" }}>
                        Personalization:{" "}
                        <Typography component="span">
                            Not requested on this item
                        </Typography>
                    </Typography>
                </Box>
            </Box>
        </>
    )
}

export default Product
