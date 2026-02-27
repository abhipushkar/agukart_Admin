import { Box, Grid, Table, TableBody, TableCell, TableContainer, TableRow, TextField, Typography } from '@mui/material';
import React from 'react'
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import Checkbox from "@mui/material/Checkbox";
import { Menu } from "@mui/material";
import Button from "@mui/material/Button";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useNavigate } from 'react-router-dom';
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Product from './Product';
import StarIcon from "@mui/icons-material/Star";
import CompleteOrder from './CompleteOrder';
import { useState } from 'react';


const OrderItem = ({ items, tab, getOrderList, openMenuIndex2, setOpenMenuIndex2, handleOpen, setOrderIds, anchorEl, setAnchorEl, anchorEl1, setAnchorEl1, anchorEl3, setAnchorEl3, openMenuIndex, setOpenMenuIndex, openMenuIndex1, setOpenMenuIndex1, baseUrl, orderIds, handleCloseOption, handleCloseOption1, updateOrder, onSelectAllForDate, isDateGroupFullySelected, selectedSubOrders, setSelectedSubOrders }) => {

    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [completeOrder, setCompleteOrder] = useState([]);
    // Handle checkbox change for SUB-ORDER IDs
    const handleCheckboxChange = (subOrderId, subOrder) => {
        console.log(subOrder, "here is my sub order");
        setOrderIds((prev) =>
            prev.includes(subOrderId) ? prev.filter((id) => id !== subOrderId) : [...prev, subOrderId]
        );
        setSelectedSubOrders((prev) => {

            const exists = prev.some(
                order =>
                    (order._id || order.sub_order_id) === subOrderId
            );

            if (exists) {
                // deselect
                return prev.filter(
                    order =>
                        (order._id || order.sub_order_id) !== subOrderId
                );
            }

            // select
            return [...prev, subOrder];
        });
    };

    const handleClick = (event, subOrderId) => {
        setAnchorEl(event.currentTarget);
        setOpenMenuIndex(subOrderId);
    };

    const handleClick1 = (event, subOrderId) => {
        setAnchorEl1(event.currentTarget);
        setOpenMenuIndex1(subOrderId);
    };

    const handleClick3 = (event, subOrderId) => {
        setAnchorEl3(event.currentTarget);
        setOpenMenuIndex2(subOrderId);
    };

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

    // Handle "Select all" for this date group
    const handleSelectAllClick = () => {
        if (onSelectAllForDate && items?.date) {
            onSelectAllForDate(items.date);
        }
    };

    // Helper to get shipping display name
    const getShippingDisplayName = (shippingName) => {
        if (!shippingName) return "Standard Delivery";
        switch (shippingName) {
            case "standardShipping": return "Standard Delivery";
            case "expedited": return "Express Delivery";
            case "globalExpress": return "Global Express Shipping";
            case "priorityExpress": return "Priority Express Shipping";
            default: return shippingName;
        }
    };

    // Helper to get shipping name from sub-order
    const getShippingNameFromSubOrder = (subOrder) => {
        return subOrder?.shippingName || "standardShipping";
    };

    // Helper to get display value or fallback
    const getDisplayValue = (value, fallback = "...") => {
        if (value === null || value === undefined || value === "") {
            return fallback;
        }
        return value;
    };

    const handleDialogClose = () => {
        setOpen(false);
        setCompleteOrder([]);
    }

    const handleCompleteOrderDialogOpen = (subOrders) => {
        setCompleteOrder(subOrders);
        setOpen(true);
    }

    // Get all sub-orders from all sales in this date group
    const getAllSubOrders = () => {
        const subOrders = [];

        if (!items?.sales) return subOrders;

        items.sales.forEach(sale => {
            if (sale?.saleDetaildata?.length) {
                sale.saleDetaildata.forEach(subOrder => {
                    subOrders.push({
                        ...subOrder,
                        // Keep parent sale info for reference
                        parentSale: sale,
                        order_id: sale.order_id,
                        sale_id: sale._id,
                    });
                });
            }
        });

        return subOrders;
    };

    // Get sub-order count for display
    const getSubOrderCount = () => {
        return getAllSubOrders().length;
    };

    return (
        <>
            <CompleteOrder
                open={open}
                onClose={handleDialogClose}
                subOrders={completeOrder}
            />
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
                    <Typography mr={2}>{items?.date}</Typography>
                    <Typography mr={2}>{getSubOrderCount()}</Typography>
                    <Typography>
                        <Button
                            onClick={handleSelectAllClick}
                            sx={{
                                textDecoration: "underline",
                                color: "#000",
                                padding: 0,
                                minWidth: "auto",
                                fontSize: "inherit",
                                fontWeight: "inherit",
                                textTransform: "none",
                                '&:hover': {
                                    backgroundColor: 'transparent',
                                    textDecoration: "underline"
                                }
                            }}
                        >
                            Select all
                        </Button>
                    </Typography>
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
                            {/* Render one row per sub-order */}
                            {getAllSubOrders().map((subOrder, index) => {
                                const subOrderId = subOrder._id || subOrder.sub_order_id;
                                const parentSale = subOrder.parentSale;
                                const shopName = subOrder.items?.[0]?.shop_name ||
                                    subOrder?.vendor_name ||
                                    subOrder?.shop_name ||
                                    parentSale?.shop_name ||
                                    "Unknown Shop";

                                return (
                                    <TableRow
                                        key={subOrderId}
                                        sx={{
                                            verticalAlign: "top",
                                            "&:last-child td, &:last-child th": { border: 0 }
                                        }}
                                    >
                                        <TableCell align="center">
                                            <Checkbox
                                                checked={orderIds.includes(subOrderId)}
                                                onClick={() => handleCheckboxChange(subOrderId, subOrder)}
                                            />
                                        </TableCell>
                                        <TableCell align="center" colSpan={3}>
                                            <Box mb={1}>
                                                <Typography
                                                    component="div"
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "start"
                                                    }}
                                                >
                                                    {/* Order ID from parent sale */}
                                                    <Typography
                                                        component="span"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: "#000",
                                                            fontSize: "16px"
                                                        }}
                                                    >
                                                        {parentSale?.order_id}
                                                    </Typography>
                                                    <Typography ml={2} sx={{ color: "#000" }}>
                                                        ${getDisplayValue(parentSale?.subtotal?.toFixed(2))}
                                                    </Typography>
                                                    <Box sx={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: 0.5,
                                                        alignItems: "start"
                                                    }}>
                                                        <Typography
                                                            ml={8}
                                                            sx={{
                                                                display: "-webkit-box",
                                                                WebkitLineClamp: "3",
                                                                WebkitBoxOrient: "vertical",
                                                                textOverflow: "ellipsis",
                                                                overflow: "hidden",
                                                                fontWeight: "400",
                                                                fontSize: "15px",
                                                                maxWidth: { xs: "100%", md: "400px" }
                                                            }}
                                                        >
                                                            Shipping : {getShippingDisplayName(getShippingNameFromSubOrder(subOrder))}
                                                        </Typography>
                                                    </Box>
                                                </Typography>

                                                <Typography
                                                    component="div"
                                                    textAlign={"start"}
                                                    display={"flex"}
                                                    alignItems={"center"}
                                                    mt={1}
                                                >
                                                    {capitalizeFirstWord(parentSale?.userName)}
                                                    <ListItem
                                                        sx={{
                                                            width: "auto",
                                                            display: "block",
                                                            padding: "0",
                                                            margin: "0"
                                                        }}
                                                    >
                                                        <Button
                                                            sx={{
                                                                color: "#000",
                                                                padding: "0",
                                                                margin: "0",
                                                                minWidth: "0",
                                                                width: "auto"
                                                            }}
                                                            id={`basic-button-${subOrderId}`}
                                                            aria-controls={
                                                                openMenuIndex1 === subOrderId
                                                                    ? `basic-menu-${subOrderId}`
                                                                    : undefined
                                                            }
                                                            aria-haspopup="true"
                                                            aria-expanded={
                                                                openMenuIndex1 === subOrderId ? "true" : undefined
                                                            }
                                                            onClick={(e) => handleClick1(e, subOrderId)}
                                                        >
                                                            <ArrowDropDownIcon />
                                                        </Button>
                                                        <Menu
                                                            id={`basic-menu-${subOrderId}`}
                                                            anchorEl={anchorEl1}
                                                            open={openMenuIndex1 === subOrderId}
                                                            onClose={() => {
                                                                setAnchorEl1(null);
                                                                setOpenMenuIndex1(null);
                                                            }}
                                                            MenuListProps={{
                                                                "aria-labelledby": `basic-button-${subOrderId}`
                                                            }}
                                                        >
                                                            <MenuItem
                                                                onClick={() => {
                                                                    setAnchorEl1(null);
                                                                    setOpenMenuIndex1(null);
                                                                }}
                                                            >
                                                                View user profile
                                                            </MenuItem>
                                                            <MenuItem
                                                                onClick={() => {
                                                                    setAnchorEl1(null);
                                                                    setOpenMenuIndex1(null);
                                                                    navigate(`${ROUTE_CONSTANT.orders.orderHistory}?sales_id=${parentSale?._id}&sub_order_id=${subOrderId}`);
                                                                }}
                                                            >
                                                                Order history
                                                            </MenuItem>
                                                            <MenuItem disableRipple>
                                                                <TextField
                                                                    variant="standard"
                                                                    value={parentSale?.userEmail}
                                                                    InputProps={{
                                                                        readOnly: true,
                                                                        disableUnderline: true,
                                                                        sx: { fontSize: "inherit", padding: 0 },
                                                                    }}
                                                                    sx={{
                                                                        width: "100%",
                                                                        userSelect: "text",
                                                                        cursor: "text"
                                                                    }}
                                                                />
                                                            </MenuItem>
                                                        </Menu>

                                                    </ListItem>
                                                    {
                                                        parentSale?.redStar && <Typography sx={{ paddingLeft: "0", width: "auto", display: "inline-block" }}>
                                                            <StarIcon sx={{ color: "red" }} />
                                                        </Typography>
                                                    }
                                                    {
                                                        parentSale?.greenStar && <Typography sx={{ paddingLeft: "0", width: "auto", display: "inline-block" }}>
                                                            <StarIcon sx={{ color: "green" }} />
                                                        </Typography>
                                                    }
                                                </Typography>
                                            </Box>

                                            {/* Sub-order details */}
                                            <Box sx={{ my: 1.5, borderLeft: "2px solid #e0e0e0", pl: 2 }}>
                                                {/* Sub-order ID with navigation link */}
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        color: "#0066cc",
                                                        mb: 1,
                                                        cursor: "pointer",
                                                        textDecoration: "underline",
                                                        '&:hover': {
                                                            textDecoration: "none"
                                                        }
                                                    }}
                                                    onClick={() => {
                                                        navigate(`${ROUTE_CONSTANT.orders.orderHistory}?sales_id=${parentSale?._id}&sub_order_id=${subOrderId}`);
                                                    }}
                                                >
                                                    Reciept Id: {subOrderId || "N/A"}
                                                </Typography>

                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        color: "#666",
                                                        mb: 1,
                                                    }}
                                                >
                                                    Shop: {shopName}
                                                </Typography>

                                                {/* Map through items in this sub-order */}
                                                {subOrder.items?.map((itemData, itemIndex) => (
                                                    <Product
                                                        key={`${shopName}-${itemIndex}`}
                                                        saleData={itemData}
                                                        baseUrl={baseUrl}
                                                        getOrderList={getOrderList}
                                                        handleOpen={handleOpen}
                                                        item={parentSale} // Pass the parent sale object
                                                        shop_name={shopName}
                                                        vendorData={subOrder} // Pass the sub-order data
                                                    />
                                                ))}

                                                {/* Display notes for this sub-order */}
                                                <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start", mt: 2 }}>
                                                    {
                                                        subOrder.items?.find(item => item.buyer_note)?.buyer_note && (
                                                            <Typography fontSize={14} sx={{ color: "#000" }}>
                                                                Buyer Note:{" "}
                                                                <Typography component="span">
                                                                    {subOrder.items.find(item => item.buyer_note)?.buyer_note}
                                                                </Typography>
                                                            </Typography>
                                                        )
                                                    }
                                                    {
                                                        subOrder.items?.find(item => item.seller_note)?.seller_note && (
                                                            <Typography fontSize={14} sx={{ color: "#000" }}>
                                                                Seller Note:{" "}
                                                                <Typography component="span">
                                                                    {subOrder.items.find(item => item.seller_note)?.seller_note}
                                                                </Typography>
                                                            </Typography>
                                                        )
                                                    }
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        <TableCell align="center" colSpan={2}>
                                            <Box textAlign={"start"}>
                                                <Typography variant="h6" fontWeight={500} fontSize={15}>
                                                    {tab === "pending" ? "No Tracking" : tab === "unshipped" ? "Unshipped" : tab === "in-progress" ? "In Progress" : tab === "completed" ? "Completed" : "Cancelled"}
                                                </Typography>
                                                <Typography>Order {formatDate(parentSale?.createdAt)}</Typography>
                                                {tab === "completed" && (
                                                    subOrder.items[0]?.shipments?.map((shipment) => {
                                                        return (
                                                            <Box
                                                                key={shipment._id}
                                                                my={1.5}
                                                                sx={{
                                                                    background: "#ededed",
                                                                    padding: "6px 16px",
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
                                                                        src={`https://api.agukart.com/uploads/delivery/${shipment.service.logo}`}
                                                                        alt=""
                                                                        style={{
                                                                            height: "20px",
                                                                            width: "20px",
                                                                            objectFit: "contain",
                                                                            aspectRatio: "1/1"
                                                                        }}
                                                                    />
                                                                    <Typography component="span" ml={1}
                                                                        display={"flex"}
                                                                        alignItems={"center"}>
                                                                        <Typography mr={1}>
                                                                            ({shipment.courierName})
                                                                        </Typography>
                                                                        <Link
                                                                            href={
                                                                                shipment.service.supportDirectTracking
                                                                                    ? shipment.service.tracking_url.replace('{tracking_id}', shipment.trackingNumber)
                                                                                    : shipment.service.tracking_url
                                                                            }
                                                                            style={{
                                                                                textDecoration: "underline",
                                                                                color: "#000"
                                                                            }}
                                                                        >
                                                                            {shipment.trackingNumber}
                                                                        </Link>
                                                                    </Typography>
                                                                </Typography>
                                                                <Typography>Shipped on {new Date(shipment.shipped_date).toLocaleDateString('en-GB')}</Typography>
                                                            </Box>
                                                        );
                                                    })
                                                )}

                                                <Typography component="div" textAlign={"start"}>
                                                    Ship to
                                                </Typography>
                                                <Typography>
                                                    {capitalizeFirstWord(parentSale?.receiver_name)}
                                                </Typography>
                                                <Typography>
                                                    {capitalizeFirstWord(parentSale?.address_line1)}
                                                </Typography>
                                                <Typography>
                                                    {capitalizeFirstWord(parentSale?.address_line2)}
                                                </Typography>
                                                <Typography>
                                                    {parentSale?.city}, {parentSale?.state} {parentSale?.pincode}
                                                </Typography>
                                                <Typography>
                                                    {parentSale?.country}
                                                </Typography>
                                                <Typography fontSize={15} fontWeight={500} sx={{ textWrap: "nowrap" }}>
                                                    Mob. No.: {`${getDisplayValue(parentSale?.phone_code)} ${getDisplayValue(parentSale?.mobile)}`}
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
                                                            const fullAddress = `${parentSale?.userName}
                                                        ${parentSale?.address_line1}
                                                        ${parentSale?.address_line2 ? ',' + parentSale.address_line2 + ',' : ''}
                                                        ${parentSale?.city}, ${parentSale?.state} ${parentSale?.pincode}
                                                        ${parentSale?.country}
                                                        ${parentSale?.mobile}`;
                                                            navigator.clipboard.writeText(fullAddress);
                                                        }}
                                                    >
                                                        Copy Address
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        <TableCell align="right">
                                            <Box display={"flex"} justifyContent={"end"}>
                                                <List>
                                                    <ListItem sx={{ width: "auto", display: "block" }}>
                                                        <Button
                                                            sx={{
                                                                padding: "4px 16px",
                                                                color: "#000",
                                                                background: "#fff",
                                                                borderRadius: "30px",
                                                                border: "1px solid #000",
                                                                whiteSpace: "nowrap"
                                                            }}
                                                            onClick={() => handleOpen("order")}
                                                        >
                                                            Request a Review
                                                        </Button>
                                                    </ListItem>
                                                    <ListItem sx={{ width: "auto", display: "block" }}>
                                                        <Button
                                                            sx={{ color: "#000" }}
                                                            onClick={() => handleOpen("order")}
                                                        >
                                                            <LocalShippingIcon />
                                                        </Button>
                                                    </ListItem>

                                                    {tab !== "pending" && tab !== "completed" && (
                                                        <ListItem sx={{ width: "auto", display: "block" }}>
                                                            <Button
                                                                sx={{ color: "#000" }}
                                                                id={`basic-button-${subOrderId}`}
                                                                aria-controls={
                                                                    openMenuIndex2 === subOrderId
                                                                        ? `basic-menu-${subOrderId}`
                                                                        : undefined
                                                                }
                                                                aria-haspopup="true"
                                                                aria-expanded={
                                                                    openMenuIndex2 === subOrderId ? "true" : undefined
                                                                }
                                                                onClick={(e) => handleClick3(e, subOrderId)}
                                                            >
                                                                <PublishedWithChangesIcon />
                                                            </Button>
                                                            <Menu
                                                                id={`basic-menu-${subOrderId}`}
                                                                anchorEl={anchorEl3}
                                                                open={openMenuIndex2 === subOrderId}
                                                                onClose={handleCloseOption1}
                                                                MenuListProps={{
                                                                    "aria-labelledby": `basic-button-${subOrderId}`
                                                                }}
                                                            >
                                                                {tab !== "in-progress" && (
                                                                    <MenuItem
                                                                        onClick={() => {
                                                                            updateOrder(subOrderId, "in-progress");
                                                                            handleCloseOption1();
                                                                        }}
                                                                    >
                                                                        In Progress
                                                                    </MenuItem>
                                                                )}
                                                                {tab !== "unshipped" && (
                                                                    <MenuItem
                                                                        onClick={() => {
                                                                            updateOrder(subOrderId, "unshipped");
                                                                            handleCloseOption1();
                                                                        }}
                                                                    >
                                                                        Unshipped
                                                                    </MenuItem>
                                                                )}
                                                                {tab !== "cancelled" && (
                                                                    <MenuItem
                                                                        onClick={() => {
                                                                            updateOrder(subOrderId, "cancelled");
                                                                            handleCloseOption1();
                                                                        }}
                                                                    >
                                                                        Hold
                                                                    </MenuItem>
                                                                )}
                                                                <MenuItem
                                                                    onClick={() => {
                                                                        handleCloseOption1();
                                                                        // navigate(`${ROUTE_CONSTANT.orders.completeOrder}?subOrder=${subOrderId}`, { state: { subOrders: [subOrder] } });
                                                                        handleCompleteOrderDialogOpen([subOrder])
                                                                    }}
                                                                >
                                                                    <Button
                                                                        sx={{ background: "#000" }}
                                                                        variant="contained"
                                                                    >
                                                                        Complete Order
                                                                    </Button>
                                                                </MenuItem>
                                                            </Menu>
                                                        </ListItem>
                                                    )}

                                                    <ListItem sx={{ width: "auto", display: "block" }}>
                                                        <Button
                                                            sx={{ color: "#000" }}
                                                            id={`basic-button-${subOrderId}`}
                                                            aria-controls={
                                                                openMenuIndex === subOrderId
                                                                    ? `basic-menu-${subOrderId}`
                                                                    : undefined
                                                            }
                                                            aria-haspopup="true"
                                                            aria-expanded={
                                                                openMenuIndex === subOrderId ? "true" : undefined
                                                            }
                                                            onClick={(e) => handleClick(e, subOrderId)}
                                                        >
                                                            <MoreVertIcon />
                                                        </Button>
                                                        <Menu
                                                            id={`basic-menu-${subOrderId}`}
                                                            anchorEl={anchorEl}
                                                            open={openMenuIndex === subOrderId}
                                                            onClose={handleCloseOption}
                                                            MenuListProps={{
                                                                "aria-labelledby": `basic-button-${subOrderId}`
                                                            }}
                                                        >
                                                            {tab !== "pending" && (
                                                                <MenuItem
                                                                    onClick={() => {
                                                                        handleCloseOption();
                                                                    }}
                                                                >
                                                                    Print
                                                                </MenuItem>
                                                            )}
                                                            {tab === "completed" && (
                                                                <MenuItem
                                                                    onClick={() => {
                                                                        handleCloseOption();
                                                                    }}
                                                                >
                                                                    Update tracking
                                                                </MenuItem>
                                                            )}
                                                            <MenuItem
                                                                onClick={() => {
                                                                    handleCloseOption();
                                                                    navigate(
                                                                        `${ROUTE_CONSTANT.orders.orderRefund}?subOrder=${subOrderId}&mode=cancel`,
                                                                    );
                                                                }}
                                                            >
                                                                Cancel
                                                            </MenuItem>
                                                            <MenuItem
                                                                onClick={() => {
                                                                    handleCloseOption();
                                                                    navigate(
                                                                        `${ROUTE_CONSTANT.orders.orderRefund}?subOrder=${subOrderId}&mode=refund`,
                                                                    );
                                                                }}
                                                            >
                                                                Refund
                                                            </MenuItem>
                                                        </Menu>
                                                    </ListItem>
                                                </List>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </>
    )
}

export default OrderItem
