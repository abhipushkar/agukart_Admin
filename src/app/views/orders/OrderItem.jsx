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


const OrderItem = ({ items, tab, getOrderList, openMenuIndex2, setOpenMenuIndex2, handleOpen, setOrderIds, anchorEl, setAnchorEl, anchorEl1, setAnchorEl1, anchorEl3, setAnchorEl3, openMenuIndex, setOpenMenuIndex, openMenuIndex1, setOpenMenuIndex1, baseUrl, orderIds, handleCloseOption, handleCloseOption1, updateOrder, onSelectAllForDate, isDateGroupFullySelected }) => {
    console.log({ items }, "rfhrthththt");
    const navigate = useNavigate();

    const handleCheckboxChange = (saleId) => {
        setOrderIds((prev) =>
            prev.includes(saleId) ? prev.filter((id) => id !== saleId) : [...prev, saleId]
        );
    };


    const handleClick = (event, index) => {
        setAnchorEl(event.currentTarget);
        setOpenMenuIndex(index);
    };

    const handleClick1 = (event, index) => {
        setAnchorEl1(event.currentTarget);
        setOpenMenuIndex1(index);
    };

    const handleClick3 = (event, index) => {
        setAnchorEl3(event.currentTarget);
        setOpenMenuIndex2(index);
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
            case "twoDays": return "Two days";
            case "oneDay": return "One day";
            default: return shippingName;
        }
    };

    // Helper to get buyer/seller note from items
    // const getNoteFromItems = (itemsArray, noteType) => {
    //     if (!itemsArray || !itemsArray.length) return null;
    //     // Check first item for note
    //     const firstItem = itemsArray[0];
    //     if (firstItem && firstItem[noteType]) {
    //         return firstItem[noteType];
    //     }
    //     return null;
    // };

    // Helper to get shipping name from the first sub-order
    const getShippingNameFromOrder = (sale) => {
        if (!sale?.saleDetaildata?.length) return "standardShipping";
        return sale.saleDetaildata[0]?.shippingName || "standardShipping";
    };

    // Helper to get display value or fallback
    const getDisplayValue = (value, fallback = "...") => {
        if (value === null || value === undefined || value === "") {
            return fallback;
        }
        return value;
    };

    // Group sub-orders by shop/vendor within a sale
    const getSubOrdersByShop = (sale) => {
        const subOrdersByShop = {};

        if (!sale?.saleDetaildata?.length) return [];

        sale.saleDetaildata.forEach(subOrder => {
            const shopName = subOrder.items[0]?.shop_name || subOrder?.vendor_name || subOrder?.shop_name || sale?.shop_name;
            const subOrderId = subOrder._id || subOrder.sub_order_id;

            if (!subOrdersByShop[shopName]) {
                subOrdersByShop[shopName] = {
                    shopName: shopName,
                    subOrderId: subOrderId,
                    vendor_id: subOrder?.vendor_id,
                    items: []
                };
            }

            if (subOrder?.items?.length) {
                subOrder.items.forEach(item => {
                    subOrdersByShop[shopName].items.push({
                        ...item,
                        subOrderData: subOrder,
                        shopName: shopName,
                        subOrderId: subOrderId
                    });
                });
            }
        });

        return Object.values(subOrdersByShop);
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
                    <Typography mr={2}>{items?.date}</Typography>
                    <Typography mr={2}>{items?.sales?.length || 0}</Typography>
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
                            {/* Render one row per sale (order_id) */}
                            {items?.sales?.map((sale, index) => {
                                const subOrdersByShop = getSubOrdersByShop(sale);
                                // const shopNames = getAllShopNames(sale);

                                return (
                                    <TableRow
                                        key={sale._id} // Use sale_id as unique key
                                        sx={{
                                            verticalAlign: "top",
                                            "&:last-child td, &:last-child th": { border: 0 }
                                        }}
                                    >
                                        <TableCell align="center">
                                            <Checkbox
                                                checked={orderIds.includes(sale._id)} // Check by sale ID
                                                onClick={() => handleCheckboxChange(sale._id)} // Pass sale ID
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
                                                    {/* Order ID - plain text */}
                                                    <Typography
                                                        component="span"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: "#000",
                                                            fontSize: "16px"
                                                        }}
                                                    >
                                                        {sale?.order_id}
                                                    </Typography>
                                                    <Typography ml={2} sx={{ color: "#000" }}>
                                                        ${getDisplayValue(sale?.subtotal?.toFixed(2))}
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
                                                            Shipping : {getShippingDisplayName(getShippingNameFromOrder(sale))}
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
                                                    {capitalizeFirstWord(sale?.userName)}
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
                                                            id={`basic-button-${sale?._id}`}
                                                            aria-controls={
                                                                openMenuIndex1 === sale?._id
                                                                    ? `basic-menu-${sale?._id}`
                                                                    : undefined
                                                            }
                                                            aria-haspopup="true"
                                                            aria-expanded={
                                                                openMenuIndex1 === sale?._id ? "true" : undefined
                                                            }
                                                            onClick={(e) => handleClick1(e, sale?._id)}
                                                        >
                                                            <ArrowDropDownIcon />
                                                        </Button>
                                                        <Menu
                                                            id={`basic-menu-${sale?._id}`}
                                                            anchorEl={anchorEl1}
                                                            open={openMenuIndex1 === sale?._id}
                                                            onClose={() => {
                                                                setAnchorEl1(null);
                                                                setOpenMenuIndex1(null);
                                                            }}
                                                            MenuListProps={{
                                                                "aria-labelledby": `basic-button-${sale?._id}`
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
                                                            {/* Navigate to main order history */}
                                                            <MenuItem
                                                                onClick={() => {
                                                                    setAnchorEl1(null);
                                                                    setOpenMenuIndex1(null);
                                                                    navigate(`${ROUTE_CONSTANT.orders.orderHistory}?sales_id=${sale?._id}&sub_order_id=${sale?.saleDetaildata?.[0]?._id}`);
                                                                }}
                                                            >
                                                                Order history
                                                            </MenuItem>
                                                            <MenuItem disableRipple>
                                                                <TextField
                                                                    variant="standard"
                                                                    value={sale?.userEmail}
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
                                                        sale?.redStar && <Typography sx={{ paddingLeft: "0", width: "auto", display: "inline-block" }}>
                                                            <StarIcon sx={{ color: "red" }} />
                                                        </Typography>
                                                    }
                                                    {
                                                        sale?.greenStar && <Typography sx={{ paddingLeft: "0", width: "auto", display: "inline-block" }}>
                                                            <StarIcon sx={{ color: "green" }} />
                                                        </Typography>
                                                    }
                                                </Typography>
                                            </Box>

                                            {/* Render products grouped by shop */}
                                            {subOrdersByShop.map((shopGroup, shopIndex) => (
                                                <Box key={shopIndex} sx={{ mb: 3, borderLeft: "2px solid #e0e0e0", pl: 2 }}>
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
                                                            // Navigate using both sales_id and sub_order_id
                                                            navigate(`${ROUTE_CONSTANT.orders.orderHistory}?sales_id=${sale?._id}&sub_order_id=${shopGroup.subOrderId}`);
                                                        }}
                                                    >
                                                        Transaction Id: {shopGroup.subOrderId?.slice(-8) || "N/A"}
                                                    </Typography>

                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{
                                                            color: "#666",
                                                            mb: 1,
                                                        }}
                                                    >
                                                        Shop: {shopGroup.shopName}
                                                    </Typography>

                                                    {/* Map through items in this shop group */}
                                                    {shopGroup.items.map((itemData, itemIndex) => (
                                                        <Product
                                                            key={`${shopGroup.shopName}-${itemIndex}`}
                                                            saleData={itemData}
                                                            baseUrl={baseUrl}
                                                            getOrderList={getOrderList}
                                                            handleOpen={handleOpen}
                                                            item={sale} // Pass the sale object
                                                            shop_name={shopGroup.shopName} // Use shop name from group
                                                            vendorData={itemData.subOrderData} // Pass the sub-order data
                                                        />
                                                    ))}
                                                    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start", mt: 2 }}>
                                                        {
                                                            shopGroup.items.find(item => item.buyer_note)?.buyer_note && (
                                                                <Typography fontSize={14} sx={{ color: "#000" }}>
                                                                    Buyer Note:{" "}
                                                                    <Typography component="span">
                                                                        {shopGroup.items.find(item => item.buyer_note)?.buyer_note}
                                                                    </Typography>
                                                                </Typography>
                                                            )
                                                        }
                                                        {
                                                            shopGroup.items.find(item => item.seller_note)?.seller_note && (
                                                                <Typography fontSize={14} sx={{ color: "#000" }}>
                                                                    Seller Note:{" "}
                                                                    <Typography component="span">
                                                                        {shopGroup.items.find(item => item.seller_note)?.seller_note}
                                                                    </Typography>
                                                                </Typography>
                                                            )
                                                        }
                                                    </Box>
                                                </Box>
                                            ))}



                                        </TableCell>

                                        <TableCell align="center" colSpan={2}>
                                            <Box textAlign={"start"}>
                                                <Typography variant="h6" fontWeight={500} fontSize={15}>
                                                    {tab === "pending" ? "No Tracking" : tab === "unshipped" ? "Unshipped" : tab === "in-progress" ? "In Progress" : tab === "completed" ? "Completed" : "Cancelled"}
                                                </Typography>
                                                <Typography>Order {formatDate(sale?.createdAt)}</Typography>
                                                {tab === "completed" && (
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
                                                    {capitalizeFirstWord(sale?.userName)}
                                                </Typography>
                                                <Typography>
                                                    {capitalizeFirstWord(sale?.address_line1)}
                                                </Typography>
                                                <Typography>
                                                    {capitalizeFirstWord(sale?.address_line2)}
                                                </Typography>
                                                <Typography>
                                                    {sale?.city}, {sale?.state} {sale?.pincode}
                                                </Typography>
                                                <Typography>
                                                    {sale?.country}
                                                </Typography>
                                                <Typography fontSize={15} fontWeight={500}>
                                                    Mob. No.: {sale?.mobile}
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
                                                            const fullAddress = `${sale?.userName}
                                                        ${sale?.address_line1}
                                                        ${sale?.address_line2 ? ',' + sale.address_line2 + ',' : ''}
                                                        ${sale?.city}, ${sale?.state} ${sale?.pincode}
                                                        ${sale?.country}
                                                        ${sale?.mobile}`;
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
                                                                id={`basic-button-${sale?._id}`}
                                                                aria-controls={
                                                                    openMenuIndex2 === sale?._id
                                                                        ? `basic-menu-${sale?._id}`
                                                                        : undefined
                                                                }
                                                                aria-haspopup="true"
                                                                aria-expanded={
                                                                    openMenuIndex2 === sale?._id ? "true" : undefined
                                                                }
                                                                onClick={(e) => handleClick3(e, sale?._id)}
                                                            >
                                                                <PublishedWithChangesIcon />
                                                            </Button>
                                                            <Menu
                                                                id={`basic-menu-${sale?._id}`}
                                                                anchorEl={anchorEl3}
                                                                open={openMenuIndex2 === sale?._id}
                                                                onClose={handleCloseOption1}
                                                                MenuListProps={{
                                                                    "aria-labelledby": `basic-button-${sale?._id}`
                                                                }}
                                                            >
                                                                {tab !== "in-progress" && (
                                                                    <MenuItem
                                                                        onClick={() => {
                                                                            // Update using sub-order IDs from all sub-orders
                                                                            const subOrderIds = sale?.saleDetaildata?.map(sub => sub._id) || [];
                                                                            subOrderIds.forEach(subOrderId => {
                                                                                updateOrder(subOrderId, "in-progress");
                                                                            });
                                                                            handleCloseOption1();
                                                                        }}
                                                                    >
                                                                        In Progress
                                                                    </MenuItem>
                                                                )}
                                                                {tab !== "unshipped" && (
                                                                    <MenuItem
                                                                        onClick={() => {
                                                                            const subOrderIds = sale?.saleDetaildata?.map(sub => sub._id) || [];
                                                                            subOrderIds.forEach(subOrderId => {
                                                                                updateOrder(subOrderId, "unshipped");
                                                                            });
                                                                            handleCloseOption1();
                                                                        }}
                                                                    >
                                                                        Unshipped
                                                                    </MenuItem>
                                                                )}
                                                                {tab !== "cancelled" && (
                                                                    <MenuItem
                                                                        onClick={() => {
                                                                            const subOrderIds = sale?.saleDetaildata?.map(sub => sub._id) || [];
                                                                            subOrderIds.forEach(subOrderId => {
                                                                                updateOrder(subOrderId, "cancelled");
                                                                            });
                                                                            handleCloseOption1();
                                                                        }}
                                                                    >
                                                                        Hold
                                                                    </MenuItem>
                                                                )}
                                                                <MenuItem
                                                                    onClick={() => {
                                                                        const subOrderIds = sale?.saleDetaildata?.map(sub => sub._id) || [];
                                                                        subOrderIds.forEach(subOrderId => {
                                                                            updateOrder(subOrderId, "completed");
                                                                        });
                                                                        handleCloseOption1();
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
                                                            id={`basic-button-${index}`}
                                                            aria-controls={
                                                                openMenuIndex === index
                                                                    ? `basic-menu-${index}`
                                                                    : undefined
                                                            }
                                                            aria-haspopup="true"
                                                            aria-expanded={
                                                                openMenuIndex === index ? "true" : undefined
                                                            }
                                                            onClick={(e) => handleClick(e, index)}
                                                        >
                                                            <MoreVertIcon />
                                                        </Button>
                                                        <Menu
                                                            id={`basic-menu-${index}`}
                                                            anchorEl={anchorEl}
                                                            open={openMenuIndex === index}
                                                            onClose={handleCloseOption}
                                                            MenuListProps={{
                                                                "aria-labelledby": `basic-button-${index}`
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
                                                                }}
                                                            >
                                                                Cancel
                                                            </MenuItem>
                                                            <MenuItem
                                                                onClick={() => {
                                                                    handleCloseOption();
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
