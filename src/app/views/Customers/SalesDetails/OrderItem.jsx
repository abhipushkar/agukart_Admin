import { Box, Grid, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import React from 'react'
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import Button from "@mui/material/Button";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { useNavigate } from 'react-router-dom';
import Product from './Product';


const OrderItem = ({ items, getOrderList, baseUrl }) => {
    const navigate = useNavigate();

    const formatDate = (isoDateString) => {
        const date = new Date(isoDateString);

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };
    const capitalizeFirstWord = (str) => {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };
    return (
        <>
            <Grid
                container
                width={"100%"}
                m={0}
                spacing={5}
                alignItems={"center"}
                mb={3}
            >
                <Box
                    sx={{
                        background: "#fff",
                        width: "100%",
                        display: "flex ",
                        alignItems: "center",
                        borderRadius: "6px 6px 0px 0px",
                        border: "1px solid #000",
                        padding: "12px 12px"
                    }}
                >
                    <Typography mr={2}>Completed {formatDate(items?.date)}</Typography>
                </Box>
                <TableContainer
                    component={Paper}
                    sx={{
                        border: "1px solid #000",
                        boxShadow: "none",
                        borderRadius: "0px 0px 6px 6px"
                    }}
                >
                    <Table
                        sx={{
                            minWidth: "100%",
                            maxWidth: { lg: "100%", md: "auto", xs: "auto" },
                            width: "max-content"
                        }}
                        aria-label="simple table"
                    >
                        <TableBody>
                            {items?.sales?.map((item, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        verticalAlign: "top",
                                        "&:last-child td, &:last-child th": { border: 0 }
                                    }}
                                >
                                    <TableCell align="center" colSpan={3} sx={{
                                        padding: "18px",
                                    }}>
                                        <Box mb={1}>
                                            <Typography
                                                component="div"
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center"
                                                }}
                                            >
                                                <Link
                                                    onClick={() => {
                                                        navigate(
                                                            `${ROUTE_CONSTANT.orders.orderHistory}?id=${item?._id}`
                                                        );
                                                    }}
                                                    sx={{
                                                        color: "#000",
                                                        textDecoration: "underline",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    {item?.order_id}
                                                </Link>
                                                <Typography ml={2} sx={{ color: "#000" }}>
                                                    ${item?.subtotal}
                                                </Typography>
                                            </Typography>

                                            <Typography
                                                component="div"
                                                textAlign={"start"}
                                                display={"flex"}
                                                alignItems={"center"}
                                                mt={1}
                                            >
                                                {capitalizeFirstWord(item?.userName)}
                                            </Typography>
                                        </Box>

                                        {item?.saleDetaildata.map((saleData, saleIndex) => (
                                            <Product key={saleIndex} saleData={saleData} baseUrl={baseUrl} getOrderList={getOrderList} />
                                        ))}
                                    </TableCell>

                                    <TableCell align="center" colSpan={2}>
                                        <Box textAlign={"start"}>
                                            <Typography variant="h6" fontWeight={500} fontSize={15}>
                                                {item?.saleDetaildata[0]?.delivery_status}
                                            </Typography>
                                            <Typography>Order {formatDate(item?.createdAt)}</Typography>
                                            {item?.saleDetaildata[0]?.delivery_status !==
                                                "No tracking" && (
                                                    <Box
                                                        my={2}
                                                        sx={{
                                                            background: "#ededed",
                                                            padding: "12px 12px",
                                                            border: "2px solid #000",
                                                            maxWidth: { xs: "100%", md: "250px" }
                                                        }}
                                                    >
                                                        <Typography
                                                            component="div"
                                                            display={"flex"}
                                                            alignItems={"center"}
                                                        >
                                                            <img
                                                                src="https://i.etsystatic.com/11486790/r/il/09528c/2809353368/il_340x270.2809353368_l0rq.jpg"
                                                                alt=""
                                                                style={{
                                                                    height: "20px",
                                                                    width: "20px",
                                                                    objectFit: "contain",
                                                                    aspectRatio: "1/1"
                                                                }}
                                                            />
                                                            <Typography component="span" ml={1}>
                                                                <Link
                                                                    href="#"
                                                                    style={{
                                                                        textDecoration: "underline",
                                                                        color: "#000"
                                                                    }}
                                                                >
                                                                    4944646465456465465
                                                                </Link>
                                                            </Typography>
                                                        </Typography>
                                                        <Typography>Shipped on Jul 24</Typography>
                                                    </Box>
                                                )}

                                            <Typography component="div" textAlign={"start"}>
                                                Ship to
                                            </Typography>
                                            <Typography>
                                                {capitalizeFirstWord(item?.receiver_name)}
                                            </Typography>
                                            <Typography>
                                                {capitalizeFirstWord(item?.address_line1)}
                                            </Typography>
                                            <Typography>
                                                {capitalizeFirstWord(item?.address_line2)}
                                            </Typography>
                                            <Typography>
                                                {item?.city}, {item?.state} {item?.pincode}
                                            </Typography>
                                            <Typography>
                                                {item?.country}
                                            </Typography>
                                            <Box mt={1}>
                                                <Button
                                                    sx={{
                                                        color: "#000",
                                                        background: "transparent !important",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        textDecoration: "underline !important",
                                                        fontSize: "16px",

                                                        "&:focus": { fontWeight: "bold" }
                                                    }}
                                                    onClick={() => {
                                                        const fullAddress = `${item?.address_line1}, ${item?.address_line2}, ${item?.city}, ${item?.state} ${item?.pincode} ${item?.country}`;
                                                        navigator.clipboard.writeText(fullAddress);
                                                    }}
                                                >
                                                    Copy Address
                                                </Button>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </>
    )
}

export default OrderItem
