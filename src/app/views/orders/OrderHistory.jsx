import { useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import { styled, alpha } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import Button from "@mui/material/Button";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useNavigate, useSearchParams } from "react-router-dom";
import { localStorageKey } from "app/constant/localStorageKey";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { useEffect } from "react";
import { useCallback } from "react";
import StarIcon from "@mui/icons-material/Star";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ConfirmModal from "app/components/ConfirmModal";

const OrderHistory = () => {
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [order, setOrder] = useState([]);
  console.log(order,"rfhbrhrhrhrh")
  const [baseUrl, setBaseUrl] = useState("");
  const [query, setQuery] = useSearchParams();
  const queryId = query.get("id");
  const navigate = useNavigate();
  const [sellerNote,setSellerNote] = useState("");

  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);

  const logOut = () => {
    localStorage.removeItem(localStorageKey.auth_key);
    localStorage.removeItem(localStorageKey.designation_id);
    localStorage.removeItem(localStorageKey.vendorId);
    setRoute(ROUTE_CONSTANT.login);
  };

  const handleOpen = (type, msg) => {
    setMsg(msg?.message);
    setOpen(true);
    setType(type);
    if (msg?.response?.status === 401) {
      logOut();
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (route !== null) {
      navigate(route);
    }
    setRoute(null);
    setMsg(null);
  };

  const getOrder = useCallback(async () => {
    console.log("djhfsjkhfshdjkfhjksd");
    try {
      console.log("hfsjdfs");
      const payload = {
        sales_id: queryId
      };
      const res = await ApiService.post(apiEndpoints.getOrderHistory, payload, auth_key);
      if (res?.status == "200") {
        setOrder(res?.data?.sales?.[0]);
        setSellerNote(res?.data?.sales?.[0]?.saleDetaildata?.[0]?.seller_note || "");
        setBaseUrl(res?.data?.base_url);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  }, [auth_key, queryId]);

  useEffect(() => {
    if (queryId) {
      getOrder();
    }
  }, [queryId]);

  const formatDate = (timestamp) => {
    if (!timestamp) {
      timestamp = Date.now();
    }

    let date;
    if (typeof timestamp === "number" || !isNaN(Number(timestamp))) {
      if (timestamp.toString().length === 10) {
        timestamp = timestamp * 1000;
      }
      date = new Date(Number(timestamp));
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) {
      throw new Error("Invalid date value");
    }

    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "America/Los_Angeles"
    };

    const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);

    // const timezone = "PST";
    return `${formattedDate}`;
  };

  const handleSellerSaveNote = async()=>{
    if(!sellerNote){
      const data = {
        message: "Please Enter Seller Note"
      }
      return handleOpen("error", data);
    } 
    try {
      const vendor_ids = [
        ...new Set(
          (order?.saleDetaildata || [])
            .map(item => item.vendor_id)
            .filter(Boolean)
        )
      ];

      const payload = {
        order_id: order?.order_id,
        vendor_id:vendor_ids,
        seller_note:sellerNote
      };
      const res = await ApiService.post(apiEndpoints.saveSellerNote,payload,auth_key);
      if (res?.status == "200") {
        handleOpen("success", res?.data);
        getOrder();
      }
    } catch (error) {
      handleOpen("error", error);
    }
  }

    const capitalizeFirstWord = (str) => {
      if (!str) return "";
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

  return (
    <>
      <Box sx={{ padding: "30px", background: "#fff" }}>
        <Box sx={{ display: { lg: "flex", md: "flex", xs: "block" }, alignItems: "center" }}>
          <Typography variant="h4" mr={2}>
            Order details
          </Typography>
          <Box
            sx={{ display: { lg: "flex", md: "flex", xs: "block" }, alignItems: "center" }}
            pr={2}
          >
            <Typography
              fontSize={17}
              fontWeight={500}
              sx={{ marginBottom: { lg: "0", md: "0", xs: "10px" } }}
            >
              Order ID:{" "}
              <Typography fontSize={17} component="span" fontWeight={600}>
                # {order?.order_id}
              </Typography>
            </Typography>
            <Typography sx={{ marginLeft: { lg: "10px", md: "10px", xs: "0" } }}>
              <Typography
                component="span"
                sx={{ background: "red", padding: "4px 8px", color: "#fff", borderRadius: "4px" }}
              >
                Custom order
              </Typography>
            </Typography>
          </Box>
          <Typography
            fontSize={17}
            fontWeight={500}
            sx={{
              marginTop: { lg: "0", md: "0", xs: "10px" },
              paddingLeft: { lg: "15px", md: "15px", xs: "0" },
              borderLeft: { lg: "1px solid #e3e3e3", md: "1px solid #e3e3e3" }
            }}
          >
            Your Seller Order ID:{" "}
            <Typography fontSize={17} component="span" fontWeight={600} color={"green"}>
              # Edit
            </Typography>
          </Typography>
        </Box>
        <Grid container width={"100%"} m={0} pt={2} spacing={2} alignItems={"center"}>
          {/* <Grid lg={6} md={6} xs={12}>
            <Box>
              <Button
                sx={{
                  fontWeight: "600",
                  background: "#000",
                  borderRadius: "30px",
                  padding: "5px 16px",
                  color: "#fff",
                  "&:hover": { background: "#494949" }
                }}
                onClick={() => navigate(ROUTE_CONSTANT.orders.orderPage)}
              >
                Go back to order list
              </Button>
            </Box>
          </Grid> */}
          <Grid lg={12} md={12} xs={12}>
            <Box sx={{ display: { lg: "flex", md: "flex", xs: "block" }, justifyContent: "end" }}>
              <List sx={{ display: { lg: "flex", md: "flex", xs: "block" }, alignItems: "center" }}>
                <ListItem sx={{ paddingLeft: "0", width: "auto", display: "inline-block" }}>
                  <Button
                    sx={{
                      fontWeight: "600",
                      background: "#fff",
                      border: "1px solid #000",
                      borderRadius: "30px",
                      padding: "5px 16px",
                      color: "#000",
                      fontSize: "11px"
                    }}
                    onClick={() => {
                      const url = `${ROUTE_CONSTANT.orders.orderSlip}?id=${order?._id}`;
                      window.open(url, '_blank');
                    }}
                  >
                    Print packing slip
                  </Button>
                </ListItem>
                <ListItem sx={{ paddingLeft: "0", width: "auto", display: "inline-block" }}>
                  <Button
                    sx={{
                      fontWeight: "600",
                      background: "#fff",
                      border: "1px solid #000",
                      borderRadius: "30px",
                      padding: "5px 16px",
                      color: "#000",
                      fontSize: "11px"
                    }}
                  >
                    Refund Order
                  </Button>
                </ListItem>
                <ListItem sx={{ paddingLeft: "0", width: "auto", display: "inline-block" }}>
                  <Button
                    sx={{
                      fontWeight: "600",
                      background: "#fff",
                      border: "1px solid #000",
                      borderRadius: "30px",
                      padding: "5px 16px",
                      color: "#000",
                      fontSize: "11px"
                    }}
                  >
                    Request a Review
                  </Button>
                </ListItem>
                <ListItem sx={{ paddingLeft: "0", width: "auto", display: "inline-block" }}>
                  <Button
                    sx={{
                      fontWeight: "600",
                      background: "#fff",
                      border: "1px solid #000",
                      borderRadius: "30px",
                      padding: "5px 16px",
                      color: "#000",
                      fontSize: "11px"
                    }}
                  >
                    Message to buyer
                  </Button>
                </ListItem>
                {
                  order?.redStar && <ListItem sx={{ paddingLeft: "0", width: "auto", display: "inline-block" }}>
                    <StarIcon sx={{ color: "red" }} />
                  </ListItem>
                }
                {
                  order?.greenStar && <ListItem sx={{ paddingLeft: "0", width: "auto", display: "inline-block" }}>
                    <StarIcon sx={{ color: "green" }} />
                  </ListItem>
                }
              </List>
            </Box>
          </Grid>
        </Grid>
        <Grid container width={"100%"} m={0} pb={2} spacing={2}>
          <Grid py={2} lg={7} md={6} xs={12}>
            <Box
              p={3}
              sx={{ boxShadow: "0 0 3px #8b8b8b", background: "#fff", borderRadius: "6px" }}
            >
              <Typography variant="h5" fontWeight={600}>
                Order summary
              </Typography>
              <Grid container width={"100%"} m={0} spacing={2}>
                <Grid lg={7} md={7} xs={12}>
                  <Box>
                    <List>
                      <ListItem
                        sx={{
                          paddingLeft: "0",
                          width: "auto",
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        <Typography fontWeight={500} sx={{ width: "30%" }}>
                          Purchase date:
                        </Typography>
                        <Typography fontWeight={600} pl={2} sx={{ width: "70%" }}>
                          {formatDate(order?.createdAt)}
                        </Typography>
                      </ListItem>
                      <ListItem
                        sx={{
                          paddingLeft: "0",
                          width: "auto",
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        <Typography fontWeight={500} sx={{ width: "30%" }}>
                          Ship by:
                        </Typography>
                        <Typography fontWeight={600} color={"#e2912c"} pl={2} sx={{ width: "70%" }}>
                          Web, Feb 1, 2023 PST to Thu, Feb 2, 2023 PST
                        </Typography>
                      </ListItem>
                      <ListItem
                        sx={{
                          paddingLeft: "0",
                          width: "auto",
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        <Typography fontWeight={500} sx={{ width: "30%" }}>
                          Deliver by:
                        </Typography>
                        <Typography fontWeight={600} sx={{ width: "70%" }} pl={2}>
                          Web, Feb 1, 2023 PST to Thu, Feb 2, 2023 PST
                        </Typography>
                      </ListItem>
                      <ListItem
                        sx={{
                          paddingLeft: "0",
                          width: "auto",
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        <Typography fontWeight={500} sx={{ width: "30%" }}>
                          Delivered date:
                        </Typography>
                        <Typography fontWeight={600} sx={{ width: "70%" }} pl={2}>
                          Web, Feb 1, 2023 PST to Thu, Feb 2, 2023 PST
                        </Typography>
                      </ListItem>
                    </List>
                  </Box>
                </Grid>
                <Grid lg={5} md={5} xs={12}>
                  <List>
                    <ListItem
                      sx={{
                        paddingLeft: "0",
                        width: "auto",
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      <Typography fontWeight={500} sx={{ width: "50%" }}>
                        Shipping services:
                      </Typography>
                      <Typography fontWeight={600} pl={2} sx={{ width: "50%" }}>
                        {order?.saleDetaildata?.[0]?.shippingName == "standardShipping" ? "Standard Delivery" : order?.saleDetaildata?.[0]?.shippingName == "expedited" ? "Express Delivery" : order?.saleDetaildata?.[0]?.shippingName == "twoDays" ? "Two days" : "One day"}
                      </Typography>
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Box>
          </Grid>
          <Grid py={2} lg={5} md={6} xs={12} sx={{ paddingLeft: { lg: "20px", md: "20px" } }}>
            <Box
              p={3}
              sx={{ boxShadow: "0 0 3px #8b8b8b", background: "#fff", borderRadius: "6px" }}
            >
              <Typography variant="h5" fontWeight={600}>
                Ship to
              </Typography>
              <Grid container width={"100%"} m={0} spacing={2}>
                <Grid lg={6} md={4} xs={12}>
                  <Box mt={2}>
                    <Typography fontSize={15}>{order?.userName}</Typography>
                    <Typography>
                        {capitalizeFirstWord(order?.address_line1)}
                    </Typography>
                    <Typography>
                        {capitalizeFirstWord(order?.address_line2)}
                    </Typography>
                    <Typography>
                        {order?.city}, {order?.state} {order?.pincode}
                    </Typography>
                    <Typography>
                        {order?.country}
                    </Typography>
                    <Typography fontSize={15} fontWeight={500}>
                      Mob. No.: {order?.mobile}
                    </Typography>
                  </Box>
                </Grid>
                <Grid lg={6} md={8} xs={12}>
                  <List>
                    <ListItem
                      sx={{
                        paddingLeft: "0",
                        width: "auto",
                        display: "flex",
                        alignItems: "center",
                        whiteSpace: "normal",
                        paddingBottom: "0"
                      }}
                    >
                      <Typography fontWeight={501}>Buyer Name:</Typography>
                      <Typography fontWeight={500} pl={1} color={"green"}>
                        {order?.userName}
                      </Typography>
                    </ListItem>
                    <ListItem
                      sx={{
                        paddingLeft: "0",
                        width: "auto",
                        display: "flex",
                        alignItems: "center",
                        whiteSpace: "normal",
                        paddingBottom: "0"
                      }}
                    >
                      <Typography fontWeight={501}>Buyer Id No.:</Typography>
                      <Typography fontWeight={500} pl={1}>
                        {order?.id_number}
                      </Typography>
                    </ListItem>
                    <ListItem
                      sx={{
                        paddingLeft: "0",
                        width: "auto",
                        display: "flex",
                        alignItems: "center",
                        whiteSpace: "normal",
                        paddingBottom: "0"
                      }}
                    >
                      <Typography fontWeight={501}>Buyer Email Id:</Typography>
                      <Typography fontWeight={500} pl={1}>
                        {order?.userEmail}
                      </Typography>
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
        <Box mt={3}>
          <Grid container width={"100%"} m={0} pb={2} spacing={2}>
            <Grid py={2} lg={9} md={8} xs={12}>
              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: "0 0 3px #dbdbdb",
                  borderRadius: "6px"
                }}
              >
                <Table
                  sx={{
                    minWidth: "100%",
                    maxWidth: "100%",
                    width: "max-content",
                    ".MuiTableCell-root": { padding: "20px" }
                  }}
                  aria-label="simple table"
                >
                  <TableHead sx={{ background: "#ebebeb" }}>
                    <TableRow>
                      <TableCell align="center" sx={{ fontSize: "16px", whiteSpace: "nowrap" }}>
                        Status
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "16px", whiteSpace: "nowrap" }}>
                        Image
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "16px", whiteSpace: "nowrap" }}>
                        Product name
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "16px", whiteSpace: "nowrap" }}>
                        More information
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "16px", whiteSpace: "nowrap" }}>
                        Quantity
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "16px", whiteSpace: "nowrap" }}>
                        Unit price
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "16px", whiteSpace: "nowrap" }}>
                        Proceeds
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order?.saleDetaildata?.map((items, index) => (
                      <TableRow
                        sx={{
                          verticalAlign: "top",
                          "&:last-child td, &:last-child th": { border: 0 }
                        }}
                        key={index}
                      >
                        <TableCell align="start">
                          <Typography
                            component="div"
                            sx={{
                              background: "green",
                              color: "#fff",
                              padding: "8px 16px",
                              borderRadius: "4px",
                              whiteSpace: "nowrap"
                            }}
                          >
                            {items?.order_status == "new" ? "No Tracking" : items?.order_status}
                          </Typography>
                        </TableCell>
                        <TableCell align="start">
                          <Box>
                            <img
                              src={`${items?.productData?.image?.[0]}`}
                              alt=""
                              style={{
                                height: "80px",
                                width: "80px",
                                objectFit: "contain",
                                aspectRatio: "1/1",
                                borderRadius: "4px"
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="start" sx={{ width: "300px", minWidth: "100%" }}>
                          <Box>
                            <Typography fontSize={16} color={"green"}>
                              {items?.productData?.product_title?.replace(/<\/?[^>]+(>|$)/g, "")}
                            </Typography>
                            {items?.isCombination === true &&
                              items?.variantData?.map((variantItem, variantIndex) => (
                                <Typography fontSize={14} sx={{ color: "#000" }} key={variantIndex}>
                                  {variantItem?.variant_name}:{" "}
                                  <Typography component="span">
                                    {items?.variantAttributeData[variantIndex]?.attribute_value}
                                  </Typography>
                                </Typography>
                              ))}
                            {items?.customize == "Yes" && (
                              <>
                                {items?.customizationData?.map((item, index) => (
                                  <div key={index}>
                                    {Object.entries(item).map(([key, value]) => (
                                      <div key={key}>
                                        {typeof value === "object" ? (
                                          <div>
                                            {key}:{`${value?.value} ($ ${value?.price})`}
                                          </div>
                                        ) : (
                                          <div>
                                            {key}: {value}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </>
                            )}
                            <Typography mt={1}>
                              <Button
                                sx={{
                                  background: "none",
                                  border: "none",
                                  boxShadow: "none",
                                  color: "green",
                                  padding: "0"
                                }}
                              >
                                <KeyboardArrowDownIcon mr={1} />
                                Show more
                              </Button>
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="start">
                          <Box>
                            <Typography fontSize={16}>
                              Order item ID:{" "}
                              <Typography fontSize={16} component="span">
                                {items?._id}
                              </Typography>
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="start">
                          <Typography fontSize={16}>{items?.qty}</Typography>
                        </TableCell>
                        <TableCell align="start">
                          <Typography fontSize={16}>${items?.original_price}</Typography>
                        </TableCell>
                        <TableCell
                          align="start"
                          sx={{ width: "300px", minWidth: "100%", whiteSpace: "nowrap" }}
                        >
                          <Box>
                            <List>
                              <ListItem sx={{ padding: "0" }}>
                                <Box
                                  pb={1}
                                  sx={{ width: "100%", borderBottom: "2px solid #d9d9d9" }}
                                >
                                  <Typography
                                    component="div"
                                    sx={{
                                      paddingLeft: "0",
                                      width: "auto",
                                      display: "flex",
                                      alignItems: "center",
                                      width: "100%",
                                      justifyContent: "space-between"
                                    }}
                                  >
                                    <Typography color={"#000"} fontSize={15}>
                                      Item subtotal:
                                    </Typography>
                                    <Typography pl={2} color={"#000"} fontSize={15}>
                                      ${items?.original_price * items?.qty}
                                    </Typography>
                                  </Typography>
                                  {
                                    items?.promotional_discount > 0 && (
                                      <Typography
                                        component="div"
                                        sx={{
                                          paddingLeft: "0",
                                          width: "auto",
                                          display: "flex",
                                          alignItems: "center",
                                          width: "100%",
                                          justifyContent: "space-between"
                                        }}
                                      >
                                        <Typography
                                          color={"#a1a1a1"}
                                          fontSize={13}
                                          sx={{ display: "flex", alignItems: "center" }}
                                        >
                                          <LocalOfferIcon
                                            sx={{
                                              marginRight: "4px",
                                              fontSize: "18px",
                                              transform: "rotate(115deg)"
                                            }}
                                          />{" "}
                                          {`Today Sale ${items?.promotionalOfferData?.offer_type == "percentage" ? items?.promotionalOfferData?.discount_amount + "%": "$" + items?.promotionalOfferData?.discount_amount}  off`}:
                                        </Typography>
                                        <Typography pl={2} color={"red"} fontSize={13}>
                                          - ${(items?.promotional_discount * items?.qty).toFixed(2)}
                                        </Typography>
                                      </Typography>
                                    )
                                  }
                                  {
                                    items?.couponDiscountAmount > 0 && 
                                    <Typography
                                      component="div"
                                      pt={1}
                                      sx={{
                                        paddingLeft: "0",
                                        width: "auto",
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%",
                                        justifyContent: "space-between"
                                      }}
                                    >
                                      <Typography
                                        color={"#a1a1a1"}
                                        fontSize={13}
                                        sx={{ display: "flex", alignItems: "center" }}
                                      >
                                        <LocalOfferIcon
                                          sx={{
                                            marginRight: "4px",
                                            fontSize: "18px",
                                            transform: "rotate(115deg)"
                                          }}
                                        />{" "}
                                        Shop Coupon({items?.couponData?.coupon_data?.coupon_code})
                                      </Typography>
                                      <Typography pl={2} color={"red"} fontSize={13}>
                                        - ${(items?.couponDiscountAmount).toFixed(2)}
                                      </Typography>
                                    </Typography>
                                  }
                                </Box>
                              </ListItem>
                              <ListItem sx={{ padding: "0", marginTop: "10px" }}>
                                <Box
                                  pb={1}
                                  sx={{ width: "100%", borderBottom: "2px solid #d9d9d9" }}
                                >
                                  <Typography
                                    component="div"
                                    sx={{
                                      paddingLeft: "0",
                                      width: "auto",
                                      display: "flex",
                                      alignItems: "center",
                                      width: "100%",
                                      justifyContent: "space-between"
                                    }}
                                  >
                                    <Typography color={"#000"} fontSize={15}>
                                      Sub Total:
                                    </Typography>
                                    <Typography pl={2} color={"#000"} fontSize={15}>
                                      ${(items?.sub_total - items?.couponDiscountAmount).toFixed(2)}
                                    </Typography>
                                  </Typography>
                                  <Typography
                                    component="div"
                                    pt={1}
                                    sx={{
                                      paddingLeft: "0",
                                      width: "auto",
                                      display: "flex",
                                      alignItems: "center",
                                      width: "100%",
                                      justifyContent: "space-between"
                                    }}
                                  >
                                    <Typography color={"#000"} fontSize={15}>
                                      Shipping Total:
                                    </Typography>
                                    <Typography pl={2} color={"#000"} fontSize={15}>
                                      ${items?.shippingAmount?.toFixed(2)}
                                    </Typography>
                                  </Typography>
                                  <Typography
                                    component="div"
                                    pt={1}
                                    sx={{
                                      paddingLeft: "0",
                                      width: "auto",
                                      display: "flex",
                                      alignItems: "center",
                                      width: "100%",
                                      justifyContent: "space-between"
                                    }}
                                  >
                                    <Typography color={"#000"} fontSize={15}>
                                      Tax:
                                    </Typography>
                                    <Typography pl={2} color={"#000"} fontSize={15}>
                                      $0
                                    </Typography>
                                  </Typography>
                                </Box>
                              </ListItem>
                              <ListItem sx={{ padding: "0", marginTop: "10px" }}>
                                <Typography
                                  component="div"
                                  sx={{
                                    paddingLeft: "0",
                                    width: "auto",
                                    display: "flex",
                                    alignItems: "center",
                                    width: "100%",
                                    justifyContent: "space-between"
                                  }}
                                >
                                  <Typography color={"#000"} fontSize={15} fontWeight={600}>
                                    Item Total:
                                  </Typography>
                                  <Typography pl={2} color={"#000"} fontSize={15} fontWeight={600}>
                                    ${(items?.amount + items?.shippingAmount - items?.couponDiscountAmount).toFixed(2)}
                                  </Typography>
                                </Typography>
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
            <Grid py={2} lg={3} md={4} xs={12} sx={{ paddingLeft: { lg: "20px", md: "20px" } }}>
              <Box p={2} border={"1px solid #000"}>
                <Typography variant="h6" fontWeight={600}>
                  Sales Proceeds
                </Typography>
                <Typography color={"#000"}>Billing country/region: US</Typography>
                <Typography color={"#000"}>Payment methods: Standard</Typography>

                <Box mt={2}>
                  <List>
                    {/* <ListItem sx={{ padding: "0" }}>
                      <Box pb={1} sx={{ width: "100%", borderBottom: "2px solid #d9d9d9" }}>
                        <Typography
                          component="div"
                          sx={{
                            paddingLeft: "0",
                            width: "auto",
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            justifyContent: "space-between"
                          }}
                        >
                          <Typography color={"#000"} fontSize={15}>
                            Item subtotal:
                          </Typography>
                          <Typography pl={2} color={"#000"} fontSize={15}>
                            ${order?.subtotal}
                          </Typography>
                        </Typography>
                        <Typography
                          component="div"
                          sx={{
                            paddingLeft: "0",
                            width: "auto",
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            justifyContent: "space-between"
                          }}
                        >
                          <Typography
                            color={"#a1a1a1"}
                            fontSize={13}
                            sx={{ display: "flex", alignItems: "center" }}
                          >
                            <LocalOfferIcon
                              sx={{
                                marginRight: "4px",
                                fontSize: "18px",
                                transform: "rotate(115deg)"
                              }}
                            />{" "}
                            Today Sale 15% off:
                          </Typography>
                          <Typography pl={2} color={"red"} fontSize={13}>
                            $0
                          </Typography>
                        </Typography>
                        <Typography
                          component="div"
                          pt={1}
                          sx={{
                            paddingLeft: "0",
                            width: "auto",
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            justifyContent: "space-between"
                          }}
                        >
                          <Typography
                            color={"#a1a1a1"}
                            fontSize={13}
                            sx={{ display: "flex", alignItems: "center" }}
                          >
                            <LocalOfferIcon
                              sx={{
                                marginRight: "4px",
                                fontSize: "18px",
                                transform: "rotate(115deg)"
                              }}
                            />{" "}
                            Shop Coupon($2)
                          </Typography>
                          <Typography pl={2} color={"red"} fontSize={13}>
                            $0
                          </Typography>
                        </Typography>
                      </Box>
                    </ListItem> */}
                    <ListItem sx={{ padding: "0", marginTop: "10px" }}>
                      <Box pb={1} sx={{ width: "100%", borderBottom: "2px solid #d9d9d9" }}>
                        <Typography
                          component="div"
                          sx={{
                            paddingLeft: "0",
                            width: "auto",
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            justifyContent: "space-between"
                          }}
                        >
                          <Typography color={"#000"} fontSize={15}>
                            Sub Total:
                          </Typography>
                          <Typography pl={2} color={"#000"} fontSize={15}>
                            ${order?.saleDetaildata?.reduce((a, b) => a + ((b.sub_total - b?.couponDiscountAmount)), 0).toFixed(2)}
                          </Typography>
                        </Typography>
                        <Typography
                          component="div"
                          pt={1}
                          sx={{
                            paddingLeft: "0",
                            width: "auto",
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            justifyContent: "space-between"
                          }}
                        >
                          <Typography color={"#000"} fontSize={15}>
                            Shipping Total:
                          </Typography>
                          <Typography pl={2} color={"#000"} fontSize={15}>
                            ${order?.saleDetaildata?.reduce((a, b) => a + b.shippingAmount, 0).toFixed(2)}
                          </Typography>
                        </Typography>
                        {
                          order?.voucher_dicount > 0 && 
                          <Typography
                            component="div"
                            pt={1}
                            sx={{
                              paddingLeft: "0",
                              width: "auto",
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                              justifyContent: "space-between"
                            }}
                          >
                            <Typography color={"#000"} fontSize={15}>
                              Voucher Discount:
                            </Typography>
                            <Typography pl={2} color={"#000"} fontSize={15}>
                              - ${order?.voucher_dicount}
                            </Typography>
                          </Typography>
                        }
                        <Typography
                          component="div"
                          pt={1}
                          sx={{
                            paddingLeft: "0",
                            width: "auto",
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            justifyContent: "space-between"
                          }}
                        >
                          <Typography color={"#000"} fontSize={15}>
                            Tax:
                          </Typography>
                          <Typography pl={2} color={"#000"} fontSize={15}>
                            $0
                          </Typography>
                        </Typography>
                      </Box>
                    </ListItem>
                    <ListItem sx={{ padding: "0", marginTop: "10px" }}>
                      <Typography
                        component="div"
                        sx={{
                          paddingLeft: "0",
                          width: "auto",
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          justifyContent: "space-between"
                        }}
                      >
                        <Typography color={"#000"} fontSize={15} fontWeight={600}>
                          Grand Total:
                        </Typography>
                        <Typography pl={2} color={"#000"} fontSize={15} fontWeight={600}>
                          ${(order?.saleDetaildata?.reduce((a, b) => a + (b?.amount + b?.shippingAmount - b?.couponDiscountAmount), 0) - order?.voucher_dicount).toFixed(2)}
                        </Typography>
                      </Typography>
                    </ListItem>
                    <ListItem sx={{ padding: "0", marginTop: "10px" }}>
                      <Box pb={1} sx={{ width: "100%" }}>
                        <Typography
                          component="div"
                          sx={{
                            paddingLeft: "0",
                            width: "auto",
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            justifyContent: "space-between"
                          }}
                        >
                          <Typography color={"#000"} fontSize={15}>
                            Used Gift Card:
                          </Typography>
                          <Typography pl={2} color={"#000"} fontSize={15}>
                            ${order?.wallet_used?.toFixed(2)}
                          </Typography>
                        </Typography>
                        <Typography
                          component="div"
                          pt={1}
                          sx={{
                            paddingLeft: "0",
                            width: "auto",
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            justifyContent: "space-between"
                          }}
                        >
                          <Typography color={"#000"} fontSize={15}>
                            Pay By PayPal:
                          </Typography>
                          <Typography pl={2} color={"#000"} fontSize={15}>
                            ${(order?.saleDetaildata?.reduce((a, b) => a + (b?.amount + b?.shippingAmount - b?.couponDiscountAmount), 0) - order?.voucher_dicount - order?.wallet_used).toFixed(2)}
                          </Typography>
                        </Typography>
                      </Box>
                    </ListItem>
                  </List>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box mt={3}>
          <Grid container width={"100%"} m={0} pb={2} spacing={2}>
            <Grid py={2} lg={9} md={8} xs={12}>
              <Box>
                <Typography variant="h6">Package 1</Typography>
                <Box sx={{ border: "1px solid #777777", overflow: "hidden", borderRadius: "6px" }}>
                  <Typography p={2} component="div" sx={{ background: "#ebebeb" }}>
                    <Box
                      sx={{
                        display: { lg: "flex", md: "flex", xs: "block" },
                        alignItems: "center"
                      }}
                    >
                      <Typography>Action on package 1</Typography>
                      <Typography
                        component="div"
                        sx={{
                          paddingLeft: { lg: "16px", md: "16px", xs: "0" },
                          display: "flex",
                          whiteSpace: "nowrap",
                          alignItems: "center"
                        }}
                      >
                        <Button
                          sx={{
                            padding: "4px 16px",
                            background: "#fff",
                            color: "#000",
                            borderRadius: "30px",
                            border: "1px solid #000"
                          }}
                        >
                          Edit shipment
                        </Button>
                        <Button
                          sx={{
                            marginLeft: "8px",
                            padding: "4px 16px",
                            background: "#fff",
                            color: "#000",
                            borderRadius: "30px",
                            border: "1px solid #000"
                          }}
                        >
                          Print packing slip
                        </Button>
                      </Typography>
                    </Box>
                  </Typography>
                  <Typography component="div" p={2}>
                    <Grid container width={"100%"} m={0} alignItems={"center"} spacing={2}>
                      <Grid lg={6} md={6} xs={12}>
                        <List>
                          <ListItem
                            sx={{
                              paddingLeft: "0",
                              width: "auto",
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            <Typography fontWeight={600} sx={{ width: "50%" }}>
                              Ship date:
                            </Typography>
                            <Typography fontWeight={500} pl={2} sx={{ width: "50%" }}>
                              Fri, Nov 4, 2024
                            </Typography>
                          </ListItem>
                          <ListItem
                            sx={{
                              paddingLeft: "0",
                              width: "auto",
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            <Typography fontWeight={600} sx={{ width: "50%" }}>
                              Carrier:
                            </Typography>
                            <Typography fontWeight={500} pl={2} sx={{ width: "50%" }}>
                              USPS
                            </Typography>
                          </ListItem>
                          <ListItem
                            sx={{
                              paddingLeft: "0",
                              width: "auto",
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            <Typography fontWeight={600} sx={{ width: "50%" }}>
                              Shipping services:
                            </Typography>
                            <Typography fontWeight={500} pl={2} sx={{ width: "50%" }}>
                              {order?.saleDetaildata?.[0]?.shippingName == "standardShipping" ? "Standard Delivery" : order?.saleDetaildata?.[0]?.shippingName == "expedited" ? "Express Delivery" : order?.saleDetaildata?.[0]?.shippingName == "twoDays" ? "Two days" : "One day"}
                            </Typography>
                          </ListItem>
                          {/* <ListItem
                            sx={{
                              paddingLeft: "0",
                              width: "auto",
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            <Typography fontWeight={500} sx={{ width: "50%" }}>
                              Fulfillment:
                            </Typography>
                            <Typography fontWeight={600} pl={2} sx={{ width: "50%" }}>
                              Seller
                            </Typography>
                          </ListItem> */}
                          {/* <ListItem
                            sx={{
                              paddingLeft: "0",
                              width: "auto",
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            <Typography fontWeight={500} sx={{ width: "50%" }}>
                              Sales channel:
                            </Typography>
                            <Typography fontWeight={600} pl={2} sx={{ width: "50%" }}>
                              Amazon.com
                            </Typography>
                          </ListItem> */}
                        </List>
                      </Grid>
                      <Grid lg={6} md={6} xs={12}>
                        <Typography component="div">
                          <Typography color={"#000"} fontWeight={600}>
                            Tracking Id:{" "}
                            <Typography component="span" pl={1} fontWeight={400}>
                              101237862352673
                            </Typography>
                          </Typography>
                        </Typography>
                      </Grid>
                    </Grid>
                  </Typography>
                </Box>
              </Box>
              <Box mt={3}>
                <Typography variant="h6">Buyer Notes</Typography>
                <TextField
                  id="outlined-multiline"
                  multiline
                  rows={4}
                  variant="outlined"
                  value={order?.saleDetaildata?.[0]?.buyer_note}
                  fullWidth
                  disabled
                />
              </Box>
             <Box mt={3}>
              <Typography variant="h6">Seller Notes</Typography>
                <TextField
                  id="outlined-multiline"
                  multiline
                  rows={4}
                  variant="outlined"
                  fullWidth
                  value={sellerNote}
                  onChange={(e) => setSellerNote(e.target.value)}
                  sx={{ mt: 1 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={handleSellerSaveNote}
                >
                  Save
                </Button>
            </Box>
            </Grid>
            <Grid py={2} lg={3} md={3} xs={12} sx={{ paddingLeft: { lg: "20px", md: "20px" } }}>
              <Box p={2} sx={{ boxShadow: "0 0 3px #000", borderRadius: "6px" }}>
                <Typography component="div" pb={1} sx={{ borderBottom: "1px solid #ebebeb" }}>
                  <Typography variant="h6" fontWeight={600}>
                    Manage Feedback
                  </Typography>
                </Typography>
                <Typography component="div" pt={1}>
                  <Typography component="div" display={"flex"} alignItems={"center"}>
                    <Typography fontSize={17}>Rating:</Typography>
                    <Typography component="div" pl={1} sx={{ display: "flex" }}>
                      <Typography component="span" lineHeight={0.6}>
                        <StarIcon sx={{ color: "#eb9a4c" }} />
                      </Typography>
                      <Typography component="span" lineHeight={0.6}>
                        <StarIcon sx={{ color: "#eb9a4c" }} />
                      </Typography>
                      <Typography component="span" lineHeight={0.6}>
                        <StarIcon sx={{ color: "#eb9a4c" }} />
                      </Typography>
                      <Typography component="span" lineHeight={0.6}>
                        <StarIcon sx={{ color: "#eb9a4c" }} />
                      </Typography>
                    </Typography>
                  </Typography>
                  <Typography fontSize={17}>
                    Comments: "Beautiful ring! Great craftsmanship and fits very comfortably.
                    I&#39;m wearing it on a finger. Looks very elegant. Going to buy a few more in
                    diff colors!"
                  </Typography>
                  <Typography pt={1} fontSize={17}>
                    Date: Mon, Jul 10, 2023
                  </Typography>
                  <Typography component="div" mt={2}>
                    <img
                      src="https://i.etsystatic.com/9674287/c/2250/2250/324/0/il/c34d73/5776117645/il_300x300.5776117645_nrmo.jpg"
                      style={{ width: "100%", height: "200px", objectFit: "cover" }}
                      alt=""
                    />
                  </Typography>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </>
  );
};

export default OrderHistory;
