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
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { useNavigate } from 'react-router-dom';
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Product from './Product';
import StarIcon from "@mui/icons-material/Star";


const OrderItem = ({ items, tab, getOrderList, openMenuIndex2, setOpenMenuIndex2, handleOpen, setOrderIds, anchorEl, setAnchorEl, anchorEl1, setAnchorEl1, anchorEl3, setAnchorEl3, openMenuIndex, setOpenMenuIndex, openMenuIndex1, setOpenMenuIndex1, baseUrl, orderIds, handleCloseOption, handleCloseOption1, updateOrder }) => {
    console.log({ items }, "rfhrthththt");
    const navigate = useNavigate();

    const handleCheckboxChange = (id) => {
        setOrderIds((prev) =>
            prev.includes(id) ? prev.filter((orderId) => orderId !== id) : [...prev, id]
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
                    <Typography mr={2}>3</Typography>
                    <Typography>
                        <Link href="#" style={{ textDecoration: "underline", color: "#000" }}>
                            Select all{" "}
                        </Link>
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
                            {items?.sales?.map((item, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        verticalAlign: "top",
                                        "&:last-child td, &:last-child th": { border: 0 }
                                    }}
                                >
                                    <TableCell align="center">
                                        <Checkbox
                                            checked={orderIds.includes(item._id)}
                                            onClick={() => handleCheckboxChange(item._id)}
                                        />
                                    </TableCell>
                                    <TableCell align="center" colSpan={3}>
                                        <Box mb={1}>
                                            <Typography
                                                component="div"
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center"
                                                }}
                                            >
                                                <a
                                                    href={`${ROUTE_CONSTANT.orders.orderHistory}?id=${item?._id}`}
                                                    sx={{
                                                        color: "#000",
                                                        textDecoration: "underline",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    {item?.order_id}
                                                </a>
                                                <Typography ml={2} sx={{ color: "#000" }}>
                                                    ${item?.subtotal?.toFixed(2)}
                                                </Typography>
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
                                                    Shipping : {item?.saleDetaildata?.[0]?.shippingName == "standardShipping" ? "Standard Delivery" : item?.saleDetaildata?.[0]?.shippingName == "expedited" ? "Express Delivery" : item?.saleDetaildata?.[0]?.shippingName == "twoDays" ? "Two days" : "One day"}
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
                                                        id={`basic-button-${item?._id}`}
                                                        aria-controls={
                                                            openMenuIndex1 === item?._id
                                                                ? `basic-menu-${item?._id}`
                                                                : undefined
                                                        }
                                                        aria-haspopup="true"
                                                        aria-expanded={
                                                            openMenuIndex1 === item?._id ? "true" : undefined
                                                        }
                                                        onClick={(e) => handleClick1(e, item?._id)}
                                                    >
                                                        <ArrowDropDownIcon />
                                                    </Button>
                                                    <Menu
                                                        id={`basic-menu-${item?._id}`}
                                                        anchorEl={anchorEl1}
                                                        open={openMenuIndex1 === item?._id}
                                                        onClose={() => {
                                                            setAnchorEl1(null);
                                                            setOpenMenuIndex1(null);
                                                        }}
                                                        MenuListProps={{
                                                            "aria-labelledby": `basic-button-${item?._id}`
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
                                                                navigate(`${ROUTE_CONSTANT.orders.orderHistory}?id=${item?._id}`);
                                                            }}
                                                        >
                                                            Order history
                                                        </MenuItem>
                                                        <MenuItem disableRipple>
                                                            <TextField
                                                                variant="standard"
                                                                value={item?.userEmail}
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
                                                    item?.redStar && <Typography sx={{ paddingLeft: "0", width: "auto", display: "inline-block" }}>
                                                        <StarIcon sx={{ color: "red" }} />
                                                    </Typography>
                                                }
                                                {
                                                    item?.greenStar && <Typography sx={{ paddingLeft: "0", width: "auto", display: "inline-block" }}>
                                                        <StarIcon sx={{ color: "green" }} />
                                                    </Typography>
                                                }
                                            </Typography>
                                        </Box>

                                        {item?.saleDetaildata.map((saleData, saleIndex) => (
                                            <Product key={saleIndex} saleData={saleData} baseUrl={baseUrl} getOrderList={getOrderList} handleOpen={handleOpen} item={item} />
                                        ))}
                                        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start" }}>
                                            {
                                                item?.saleDetaildata?.[0]?.buyer_note && <Typography fontSize={14} sx={{ color: "#000" }}>
                                                    Buyer Note:{" "}
                                                    <Typography component="span">
                                                        {item?.saleDetaildata?.[0]?.buyer_note}
                                                    </Typography>
                                                </Typography>
                                            }
                                            {
                                                item?.saleDetaildata?.[0]?.seller_note && <Typography fontSize={14} sx={{ color: "#000" }}>
                                                    Seller Note:{" "}
                                                    <Typography component="span">
                                                        {item?.saleDetaildata?.[0]?.seller_note}
                                                    </Typography>
                                                </Typography>
                                            }
                                        </Box>

                                    </TableCell>

                                    <TableCell align="center" colSpan={2}>
                                        <Box textAlign={"start"}>
                                            <Typography variant="h6" fontWeight={500} fontSize={15}>
                                                {tab == "new" ? "No Tracking" : tab == "unshipped" ? "Unshipped" : tab == "in-progress" ? "In Progress" : tab == "completed" ? "Completed" : "Cancelled"}
                                            </Typography>
                                            <Typography>Order {formatDate(item?.createdAt)}</Typography>
                                            {tab == "completed" && (
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
                                                {capitalizeFirstWord(item?.userName)}
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
                                            <Typography fontSize={15} fontWeight={500}>
                                                Mob. No.: {item?.mobile}
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
                                                        const fullAddress = `${item?.userName}
${item?.address_line1}
${item?.address_line2 ? ',' + item.address_line2 + ',' : ''}
${item?.city}, ${item?.state} ${item?.pincode}
${item?.country}
${item?.mobile}`;

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
                                                {/* <ListItem sx={{ width: "auto", display: "block" }}>
                                                    <Button sx={{ color: "#000" }}>
                                                        <MailOutlineIcon />
                                                    </Button>
                                                </ListItem> */}

                                                {tab !== "new" && tab !== "completed" && (
                                                    <ListItem sx={{ width: "auto", display: "block" }}>
                                                        <Button
                                                            sx={{ color: "#000" }}
                                                            id={`basic-button-${item?._id}`}
                                                            aria-controls={
                                                                openMenuIndex2 === item?._id
                                                                    ? `basic-menu-${item?._id}`
                                                                    : undefined
                                                            }
                                                            aria-haspopup="true"
                                                            aria-expanded={
                                                                openMenuIndex2 === item?._id ? "true" : undefined
                                                            }
                                                            onClick={(e) => handleClick3(e, item?._id)}
                                                        >
                                                            <PublishedWithChangesIcon />
                                                        </Button>
                                                        <Menu
                                                            id={`basic-menu-${item?._id}`}
                                                            anchorEl={anchorEl3}
                                                            open={openMenuIndex2 === item?._id}
                                                            onClose={handleCloseOption1}
                                                            MenuListProps={{
                                                                "aria-labelledby": `basic-button-${item?._id}`
                                                            }}
                                                        >
                                                            {tab !== "in-progress" && (
                                                                <MenuItem
                                                                    onClick={() => {
                                                                        updateOrder(item?._id, "in-progress");
                                                                        handleCloseOption1();
                                                                    }}
                                                                >
                                                                    In Progress
                                                                </MenuItem>
                                                            )}
                                                            {tab !== "unshipped" && (
                                                                <MenuItem
                                                                    onClick={() => {
                                                                        updateOrder(item?._id, "unshipped");
                                                                        handleCloseOption1();
                                                                    }}
                                                                >
                                                                    Unshipped
                                                                </MenuItem>
                                                            )}
                                                            {tab !== "cancelled" && (
                                                                <MenuItem
                                                                    onClick={() => {
                                                                        updateOrder(item?._id, "cancelled");
                                                                        handleCloseOption1();
                                                                    }}
                                                                >
                                                                    Hold
                                                                </MenuItem>
                                                            )}
                                                            <MenuItem
                                                                onClick={() => {
                                                                    updateOrder(item?._id, "completed");
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
                                                        {tab !== "new" && (
                                                            <MenuItem
                                                                onClick={() => {
                                                                    // updateOrder(item?._id, "in-progress");
                                                                    handleCloseOption();
                                                                }}
                                                            >
                                                                Print
                                                            </MenuItem>
                                                        )}
                                                        {tab === "completed" && (
                                                            <MenuItem
                                                                onClick={() => {
                                                                    // updateOrder(item?._id, "in-progress");
                                                                    handleCloseOption();
                                                                }}
                                                            >
                                                                Update tracking
                                                            </MenuItem>
                                                        )}
                                                        <MenuItem
                                                            onClick={() => {
                                                                // updateOrder(item?._id, "in-progress");
                                                                handleCloseOption();
                                                            }}
                                                        >
                                                            Cancel
                                                        </MenuItem>
                                                        <MenuItem
                                                            onClick={() => {
                                                                // updateOrder(item?._id, "in-progress");
                                                                handleCloseOption();
                                                            }}
                                                        >
                                                            Refund
                                                        </MenuItem>
                                                        {/* {tab === "unshipped" && (
                                                <MenuItem
                                                  onClick={() => {
                                                    updateOrder(item?._id, "in-progress");
                                                    handleCloseOption();
                                                  }}
                                                >
                                                  <HourglassEmptyIcon
                                                    fontSize="small"
                                                    style={{ marginRight: 8 }}
                                                  />
                                                  In Progress
                                                </MenuItem>
                                              )}
                                              {tab === "unshipped" && (
                                                <MenuItem
                                                  onClick={() => {
                                                    updateOrder(item?._id, "cancelled");
                                                    handleCloseOption();
                                                  }}
                                                >
                                                  <CloseIcon
                                                    fontSize="small"
                                                    style={{ marginRight: 8 }}
                                                  />
                                                  Cancel
                                                </MenuItem>
                                              )}
                                              {tab === "in-progress" && (
                                                <MenuItem
                                                  onClick={() => {
                                                    updateOrder(item?._id, "completed");
                                                    handleCloseOption();
                                                  }}
                                                >
                                                  Complete Order
                                                </MenuItem>
                                              )} */}
                                                    </Menu>
                                                </ListItem>
                                            </List>
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
