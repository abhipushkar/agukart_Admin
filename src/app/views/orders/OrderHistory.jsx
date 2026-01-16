import React, { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import TextField from "@mui/material/TextField";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
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
  const [order, setOrder] = useState({ saleDetaildata: [] });
  const [expandedRows, setExpandedRows] = useState({});
  const [baseUrl, setBaseUrl] = useState("");
  const [query] = useSearchParams();
  const sales_id = query.get("sales_id");
  const sub_order_id = query.get("sub_order_id");
  const navigate = useNavigate();
  const [sellerNote, setSellerNote] = useState("");

  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);

  // Helper function to get display value or "..."
  const getDisplayValue = (value, fallback = "...") => {
    if (value === null || value === undefined || value === "") {
      return fallback;
    }
    return value;
  };

  // Toggle row expansion
  const toggleRowExpansion = (itemId) => {
    setExpandedRows(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Calculate derived data once to avoid repeated calculations
  const orderTotals = useMemo(() => {
    const vendorItems = order?.saleDetaildata?.[0]?.items || [];

    if (!vendorItems.length) {
      return {
        subTotal: 0,
        shippingTotal: 0,
        itemTotal: 0,
        grandTotal: 0,
        paypalAmount: 0
      };
    }

    const subTotal = vendorItems.reduce(
      (a, b) => a + ((b.sub_total || 0) - (b?.couponDiscountAmount || 0)),
      0
    );

    // ✅ FIXED
    const shippingTotal = vendorItems[0]?.subOrderShippingTotal || 0;

    const itemTotal =
      subTotal + shippingTotal;

    const grandTotal =
      itemTotal - (order?.voucher_dicount || 0);

    const paypalAmount =
      grandTotal - (order?.wallet_used || 0);

    return {
      subTotal: subTotal.toFixed(2),
      shippingTotal: shippingTotal.toFixed(2),
      itemTotal: itemTotal.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      paypalAmount: paypalAmount > 0 ? paypalAmount.toFixed(2) : "0.00"
    };
  }, [order]);


  // Get shipping name from the specific vendor's sub-order
  const shippingName = useMemo(() => {
    if (!order?.saleDetaildata?.[0]?.shippingName) return "...";
    const name = order.saleDetaildata[0].shippingName;
    switch (name) {
      case "standardShipping": return "Standard Delivery";
      case "expedited": return "Express Delivery";
      case "twoDays": return "Two days";
      case "oneDay": return "One day";
      default: return getDisplayValue(name);
    }
  }, [order]);

  // Get delivery dates from the specific vendor's deliveryData
  const deliveryDates = useMemo(() => {
    if (!order?.saleDetaildata?.[0]?.deliveryData?.minDate || !order?.saleDetaildata?.[0]?.deliveryData?.maxDate) {
      return {
        minDate: "...",
        maxDate: "..."
      };
    }

    const formatDeliveryDate = (dateString) => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric"
        });
      } catch (error) {
        return "...";
      }
    };

    return {
      minDate: formatDeliveryDate(order.saleDetaildata[0].deliveryData.minDate),
      maxDate: formatDeliveryDate(order.saleDetaildata[0].deliveryData.maxDate)
    };
  }, [order]);

  const logOut = () => {
    localStorage.removeItem(localStorageKey.auth_key);
    localStorage.removeItem(localStorageKey.designation_id);
    localStorage.removeItem(localStorageKey.vendorId);
    setRoute(ROUTE_CONSTANT.login);
  };

  const handleOpen = useCallback((type, msg) => {
    setMsg(msg?.message);
    setOpen(true);
    setType(type);
    if (msg?.response?.status === 401) {
      logOut();
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    if (route !== null) {
      navigate(route);
    }
    setRoute(null);
    setMsg(null);
  };

  const getOrder = useCallback(async () => {
    try {
      const payload = {
        sales_id: sales_id,
        sub_order_id: sub_order_id
      };

      // Only send payload if we have at least one ID
      if (!sales_id && !sub_order_id) {
        console.error("No order IDs provided");
        return;
      }

      const res = await ApiService.post(apiEndpoints.getOrderHistory, payload, auth_key);
      if (res?.status === 200) {
        // The backend should return only the specific vendor's data
        setOrder(res?.data?.orderHistory || { saleDetaildata: [] });

        // Get seller note from the specific vendor's items
        const vendorSubOrder = res?.data?.orderHistory?.saleDetaildata?.[0];
        const firstItem = vendorSubOrder?.items?.[0];
        setSellerNote(firstItem?.seller_note || "");
        setBaseUrl(res?.data?.base_url || "");
      }
    } catch (error) {
      handleOpen("error", error);
    }
  }, [auth_key, handleOpen, sales_id, sub_order_id]);

  useEffect(() => {
    if (sales_id || sub_order_id) {
      getOrder();
    }
  }, [getOrder, sales_id, sub_order_id]);

  const formatDate = (timestamp) => {
    if (!timestamp) {
      return "...";
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
      return "...";
    }

    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "America/Los_Angeles"
    };

    try {
      const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);
      return formattedDate;
    } catch (error) {
      return "...";
    }
  };

  const handleSellerSaveNote = async () => {
    if (!sellerNote.trim()) {
      const data = {
        message: "Please Enter Seller Note"
      }
      return handleOpen("error", data);
    }
    try {
      // Get vendor ID from the specific sub-order (not all vendors)
      const vendorSubOrder = order?.saleDetaildata?.[0];
      const vendor_id = vendorSubOrder?.vendor_id;

      if (!vendor_id) {
        handleOpen("error", { message: "Vendor ID not found" });
        return;
      }

      const payload = {
        order_id: order?.order_id,
        sub_order_id: sub_order_id,
        vendor_id: [vendor_id],
        seller_note: sellerNote
      };

      const res = await ApiService.post(apiEndpoints.saveSellerNote, payload, auth_key);
      if (res?.status === 200) {
        handleOpen("success", res?.data);
        getOrder(); // Refresh to get updated note
      }
    } catch (error) {
      handleOpen("error", error);
    }
  }

  const capitalizeFirstWord = (str) => {
    if (!str) return "...";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Helper to safely strip HTML tags
  const stripHtmlTags = (html) => {
    if (!html) return "...";
    return html.replace(/<\/?[^>]+(>|$)/g, "");
  };

  // Helper to check if item has any variants to show
  const hasVariantsToShow = (item) => {
    return (
      (item?.variantData && item.variantData.length > 0) ||
      (item?.variants && item.variants.length > 0) ||
      (item?.variant_id && item.variant_id.length > 0) ||
      (item?.variant_attribute_id && item.variant_attribute_id.length > 0)
    );
  };

  // Helper to get buyer/seller note from sub-order items
  const getNoteFromItems = (itemsArray = [], noteType) => {
    if (!itemsArray || !itemsArray.length) return null;
    // Check first item for note
    const firstItem = itemsArray.find(item => item[noteType]);

    if (firstItem && firstItem[noteType]) {
      return firstItem[noteType];
    }
    return null;
  };

  // Get shipping display name
  // const getShippingDisplayName = (shippingName) => {
  //   if (!shippingName) return "Standard Delivery";
  //   switch (shippingName) {
  //     case "standardShipping": return "Standard Delivery";
  //     case "expedited": return "Express Delivery";
  //     case "twoDays": return "Two days";
  //     case "oneDay": return "One day";
  //     default: return shippingName;
  //   }
  // };

  // Get the vendor sub-order
  const vendorSubOrder = order?.saleDetaildata?.[0];

  return (
    <>
      <Box sx={{ padding: "30px", background: "#fff" }}>
        <Box sx={{ display: { lg: "flex", md: "flex", xs: "block" }, alignItems: "center" }}>
          <Typography variant="h4" sx={{
            textWrap: "nowrap"
          }} mr={2}>
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
                # {getDisplayValue(order?.order_id)}
              </Typography>
            </Typography>
            <Box sx={{ marginLeft: { lg: "10px", md: "10px", xs: "0" } }}>
              <Box
                component="span"
                sx={{ background: "red", padding: "4px 8px", color: "#fff", borderRadius: "4px" }}
              >
                Custom order
              </Box>
            </Box>
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
              #{sub_order_id || "..."}
            </Typography>
          </Typography>
        </Box>

        <Grid container width={"100%"} m={0} pt={2} spacing={2} alignItems={"center"}>
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
                      const url = `${ROUTE_CONSTANT.orders.orderSlip}?sales_id=${sales_id}&sub_order_id=${sub_order_id}`;
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
                {order?.redStar && (
                  <ListItem sx={{ paddingLeft: "0", width: "auto", display: "inline-block" }}>
                    <StarIcon sx={{ color: "red" }} />
                  </ListItem>
                )}
                {order?.greenStar && (
                  <ListItem sx={{ paddingLeft: "0", width: "auto", display: "inline-block" }}>
                    <StarIcon sx={{ color: "green" }} />
                  </ListItem>
                )}
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
                          {deliveryDates.minDate} to {deliveryDates.maxDate}
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
                          {deliveryDates.minDate} to {deliveryDates.maxDate}
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
                          {vendorSubOrder?.items?.[0]?.delivered_date ? formatDate(vendorSubOrder.items[0].delivered_date) : "..."}
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
                        {shippingName}
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
                      <Typography fontSize={14} sx={{ color: "#000", mt: 1, width: "50%" }}>
                        Store:{" "}
                        <Box component="strong" sx={{ width: "50%" }}>
                          {vendorSubOrder?.shop_name || "..."}
                        </Box>
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
                    <Typography fontSize={15}>{getDisplayValue(order?.userName)}</Typography>
                    <Typography>
                      {capitalizeFirstWord(order?.address_line1)}
                    </Typography>
                    <Typography>
                      {capitalizeFirstWord(order?.address_line2)}
                    </Typography>
                    <Typography>
                      {getDisplayValue(order?.city)}, {getDisplayValue(order?.state)} {getDisplayValue(order?.pincode)}
                    </Typography>
                    <Typography>
                      {getDisplayValue(order?.country)}
                    </Typography>
                    <Typography fontSize={15} fontWeight={500} sx
                    >
                      Mob. No.: {`${getDisplayValue(order?.phone_code)} ${getDisplayValue(order?.mobile)}`}
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
                        {getDisplayValue(order?.userName)}
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
                        {getDisplayValue(order?.id_number)}
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
                        {getDisplayValue(order?.userEmail)}
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
                  borderRadius: "6px",
                  overflowX: "auto",
                  maxWidth: "100%"
                }}
              >
                <Table
                  sx={{
                    minWidth: 800,
                    tableLayout: 'fixed',
                    ".MuiTableCell-root": {
                      padding: "20px",
                      wordBreak: "break-word"
                    }
                  }}
                  aria-label="simple table"
                >
                  <TableHead sx={{ background: "#ebebeb" }}>
                    <TableRow>
                      <TableCell align="center" sx={{ fontSize: "16px", whiteSpace: "nowrap", width: "120px" }}>
                        Status
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "16px", whiteSpace: "nowrap", width: "100px" }}>
                        Image
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "16px", whiteSpace: "nowrap", width: "250px", minWidth: "200px" }}>
                        Product name
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "16px", whiteSpace: "nowrap", width: "150px" }}>
                        More information
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "16px", whiteSpace: "nowrap", width: "80px" }}>
                        Quantity
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "16px", whiteSpace: "nowrap", width: "100px" }}>
                        Unit price
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "16px", whiteSpace: "nowrap", width: "180px", minWidth: "150px" }}>
                        Proceeds
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Show only items from the specific vendor's sub-order */}
                    {vendorSubOrder?.items?.map((item, itemIndex) => {
                      const productData = item?.productData || {};
                      const productTitle = stripHtmlTags(productData.product_title || "");
                      const productImage = productData.image?.[0] || "";
                      const variantData = item?.variantData || [];
                      const variantAttributeData = item?.variantAttributeData || [];
                      const skuCode = getDisplayValue(productData.sku_code);
                      const isExpanded = expandedRows[item._id];
                      const hasVariants = hasVariantsToShow(item);
                      const variantIds = item?.variant_id || [];
                      const variantAttributeIds = item?.variant_attribute_id || [];
                      const internalVariants = item?.variants || [];

                      return (
                        <React.Fragment key={`${vendorSubOrder._id}-${item._id}`}>
                          <TableRow
                            sx={{
                              verticalAlign: "top",
                              "&:last-child td, &:last-child th": { border: 0 }
                            }}
                          >
                            <TableCell align="start">
                              <Box
                                sx={{
                                  background: item?.order_status === "new" ? "#f0ad4e" :
                                    item?.order_status === "completed" ? "#5cb85c" :
                                      item?.order_status === "cancelled" ? "#d9534f" : "#5bc0de",
                                  color: "#fff",
                                  padding: "8px 16px",
                                  borderRadius: "4px",
                                  whiteSpace: "nowrap",
                                  textAlign: "center"
                                }}
                              >
                                {item?.order_status === "new" ? "No Tracking" : getDisplayValue(item?.order_status)}
                              </Box>
                            </TableCell>
                            <TableCell align="start">
                              <Box>
                                {productImage ? (
                                  <img
                                    src={`${baseUrl}${productImage}`}
                                    alt={productTitle}
                                    style={{
                                      height: "80px",
                                      width: "80px",
                                      objectFit: "contain",
                                      aspectRatio: "1/1",
                                      borderRadius: "4px"
                                    }}
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      height: "80px",
                                      width: "80px",
                                      bgcolor: "#f5f5f5",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      borderRadius: "4px"
                                    }}
                                  >
                                    <Typography color="text.secondary">No image</Typography>
                                  </Box>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="start" sx={{ width: "250px" }}>
                              <Box>
                                <Typography
                                  fontSize={16}
                                  color={"green"}
                                  sx={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"
                                  }}
                                >
                                  {productTitle}
                                </Typography>
                                <Typography fontSize={14} sx={{ color: "#000", mt: 1 }}>
                                  SKU:{" "}
                                  <Box component="span" fontWeight={500}>
                                    {skuCode}
                                  </Box>
                                </Typography>

                                {/* Show first variant if exists */}
                                {(variantData.length > 0 || internalVariants.length > 0) && (
                                  <Box sx={{ mt: 1 }}>
                                    {/* Show first variantData if available */}
                                    {variantData.length > 0 && variantData[0] && variantAttributeData[0] && (
                                      <Typography fontSize={14} sx={{ color: "#000" }}>
                                        {getDisplayValue(variantData[0]?.variant_name)}:{" "}
                                        <Box component="span">
                                          {getDisplayValue(variantAttributeData[0]?.attribute_value)}
                                        </Box>
                                      </Typography>
                                    )}

                                    {/* Show first internal variant if available */}
                                    {internalVariants.length > 0 && !variantData[0] && (
                                      <Typography fontSize={14} sx={{ color: "#000" }}>
                                        {getDisplayValue(internalVariants[0]?.variantName)}:{" "}
                                        <Box component="span">
                                          {getDisplayValue(internalVariants[0]?.attributeName)}
                                        </Box>
                                      </Typography>
                                    )}

                                    {/* Show More button if there are more variants to show */}
                                    {hasVariants && (variantData.length > 1 || internalVariants.length > 1 || variantIds.length > 0) && (
                                      <Button
                                        sx={{
                                          background: "none",
                                          border: "none",
                                          boxShadow: "none",
                                          color: "green",
                                          padding: "0",
                                          mt: 1,
                                          fontSize: "14px",
                                          textTransform: "none"
                                        }}
                                        onClick={() => toggleRowExpansion(item._id)}
                                      >
                                        {isExpanded ? (
                                          <>
                                            <KeyboardArrowUpIcon sx={{ fontSize: "16px", mr: 0.5 }} />
                                            Show less
                                          </>
                                        ) : (
                                          <>
                                            <KeyboardArrowDownIcon sx={{ fontSize: "16px", mr: 0.5 }} />
                                            Show more
                                          </>
                                        )}
                                      </Button>
                                    )}
                                  </Box>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="start">
                              <Box>
                                <Typography fontSize={16}>
                                  Order item ID:{" "}
                                  <Box fontSize={16} component="span">
                                    {getDisplayValue(item?._id)}
                                  </Box>
                                </Typography>

                                {sub_order_id && (
                                  <Typography fontSize={12} sx={{ color: "#666", mt: 0.5 }}>
                                    Transaction Id: {item.item_id}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="start">
                              <Typography fontSize={16}>{getDisplayValue(item?.qty)}</Typography>
                            </TableCell>
                            <TableCell align="start">
                              <Typography fontSize={16}>${getDisplayValue(item?.original_price, "0.00")}</Typography>
                            </TableCell>
                            <TableCell
                              align="start"
                              sx={{ width: "180px" }}
                            >
                              <Box>
                                <List>
                                  <ListItem sx={{ padding: "0" }}>
                                    <Box
                                      pb={1}
                                      sx={{ width: "100%", borderBottom: "2px solid #d9d9d9" }}
                                    >
                                      <Box
                                        sx={{
                                          paddingLeft: "0",
                                          display: "flex",
                                          alignItems: "center",
                                          width: "100%",
                                          justifyContent: "space-between"
                                        }}
                                      >
                                        <Typography color={"#000"} fontSize={15}>
                                          Item subtotal:
                                        </Typography>
                                        <Box pl={2} color={"#000"} fontSize={15}>
                                          ${((item?.original_price || 0) * (item?.qty || 0)).toFixed(2)}
                                        </Box>
                                      </Box>
                                      {item?.promotional_discount > 0 && (
                                        <Box
                                          sx={{
                                            paddingLeft: "0",
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
                                            {`Today Sale ${item?.promotionalOfferData?.offer_type === "percentage" ?
                                              getDisplayValue(item?.promotionalOfferData?.discount_amount) + "%" :
                                              "$" + getDisplayValue(item?.promotionalOfferData?.discount_amount)}  off`}:
                                          </Typography>
                                          <Box pl={2} color={"red"} fontSize={13}>
                                            - ${((item?.promotional_discount || 0) * (item?.qty || 0)).toFixed(2)}
                                          </Box>
                                        </Box>
                                      )}
                                      {item?.couponDiscountAmount > 0 && (
                                        <Box
                                          pt={1}
                                          sx={{
                                            paddingLeft: "0",
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
                                            Shop Coupon({getDisplayValue(item?.couponData?.coupon_data?.coupon_code)})
                                          </Typography>
                                          <Box pl={2} color={"red"} fontSize={13}>
                                            - ${(item?.couponDiscountAmount || 0).toFixed(2)}
                                          </Box>
                                        </Box>
                                      )}
                                    </Box>
                                  </ListItem>
                                  <ListItem sx={{ padding: "0", marginTop: "10px" }}>
                                    <Box
                                      pb={1}
                                      sx={{ width: "100%", borderBottom: "2px solid #d9d9d9" }}
                                    >
                                      <Box
                                        sx={{
                                          paddingLeft: "0",
                                          display: "flex",
                                          alignItems: "center",
                                          width: "100%",
                                          justifyContent: "space-between"
                                        }}
                                      >
                                        <Typography color={"#000"} fontSize={15}>
                                          Sub Total:
                                        </Typography>
                                        <Box pl={2} color={"#000"} fontSize={15}>
                                          ${((item?.sub_total || 0) - (item?.couponDiscountAmount || 0)).toFixed(2)}
                                        </Box>
                                      </Box>
                                      <Box
                                        pt={1}
                                        sx={{
                                          paddingLeft: "0",
                                          display: "flex",
                                          alignItems: "center",
                                          width: "100%",
                                          justifyContent: "space-between"
                                        }}
                                      >
                                        <Typography color={"#000"} fontSize={15}>
                                          Shipping Total:
                                        </Typography>
                                        <Box pl={2} color={"#000"} fontSize={15}>
                                          ${(item?.shippingAmount || 0).toFixed(2)}
                                        </Box>
                                      </Box>
                                      <Box
                                        pt={1}
                                        sx={{
                                          paddingLeft: "0",
                                          display: "flex",
                                          alignItems: "center",
                                          width: "100%",
                                          justifyContent: "space-between"
                                        }}
                                      >
                                        <Typography color={"#000"} fontSize={15}>
                                          Tax:
                                        </Typography>
                                        <Box pl={2} color={"#000"} fontSize={15}>
                                          $0
                                        </Box>
                                      </Box>
                                    </Box>
                                  </ListItem>
                                  <ListItem sx={{ padding: "0", marginTop: "10px" }}>
                                    <Box
                                      sx={{
                                        paddingLeft: "0",
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%",
                                        justifyContent: "space-between"
                                      }}
                                    >
                                      <Typography color={"#000"} fontSize={15} fontWeight={600}>
                                        Item Total:
                                      </Typography>
                                      <Box pl={2} color={"#000"} fontSize={15} fontWeight={600}>
                                        ${((item?.amount || 0) + (item?.shippingAmount || 0) - (item?.couponDiscountAmount || 0)).toFixed(2)}
                                      </Box>
                                    </Box>
                                  </ListItem>
                                </List>
                              </Box>
                            </TableCell>
                          </TableRow>

                          {isExpanded && (
                            <TableRow>
                              <TableCell colSpan={7} sx={{ backgroundColor: "#f9f9f9", borderTop: "1px solid #e0e0e0" }}>
                                <Box sx={{ p: 2 }}>
                                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                    Additional Details
                                  </Typography>
                                  <Grid container spacing={3}>
                                    {/* Variant Data (Amazon-style) */}
                                    {(variantData.length > 0 || variantIds.length > 0) && (
                                      <Grid item xs={12} md={6}>
                                        <Box>
                                          <Typography fontWeight={600} gutterBottom>
                                            Product Variants:
                                          </Typography>
                                          {variantData.length > 0 ? (
                                            variantData.map((variantItem, idx) => (
                                              <Box key={idx} sx={{ mb: 1 }}>
                                                <Typography fontSize={14} fontWeight={500}>
                                                  {getDisplayValue(variantItem?.variant_name)}:
                                                </Typography>
                                                <Typography fontSize={14}>
                                                  {getDisplayValue(variantAttributeData[idx]?.attribute_value)}
                                                </Typography>
                                              </Box>
                                            ))
                                          ) : variantIds.length > 0 ? (
                                            <Box>
                                              <Typography fontSize={14} fontWeight={500}>
                                                Variant IDs:
                                              </Typography>
                                              <Typography fontSize={14}>
                                                {variantIds.join(", ")}
                                              </Typography>
                                              {variantAttributeIds.length > 0 && (
                                                <>
                                                  <Typography fontSize={14} fontWeight={500} sx={{ mt: 1 }}>
                                                    Variant Attribute IDs:
                                                  </Typography>
                                                  <Typography fontSize={14}>
                                                    {variantAttributeIds.join(", ")}
                                                  </Typography>
                                                </>
                                              )}
                                            </Box>
                                          ) : null}
                                        </Box>
                                      </Grid>
                                    )}

                                    {/* Internal Variants (Etsy-style) */}
                                    {internalVariants.length > 0 && (
                                      <Grid item xs={12} md={6}>
                                        <Box>
                                          <Typography fontWeight={600} gutterBottom>
                                            Internal Variants:
                                          </Typography>
                                          {internalVariants.map((variant, idx) => (
                                            <Box key={variant._id || idx} sx={{ mb: 1 }}>
                                              <Typography fontSize={14} fontWeight={500}>
                                                {getDisplayValue(variant.variantName)}:
                                              </Typography>
                                              <Typography fontSize={14}>
                                                {getDisplayValue(variant.attributeName)}
                                              </Typography>
                                            </Box>
                                          ))}
                                        </Box>
                                      </Grid>
                                    )}

                                    {/* Customizations */}
                                    {item?.customize === "Yes" && item?.customizationData?.length > 0 && (
                                      <Grid item xs={12} md={6}>
                                        <Box>
                                          <Typography fontWeight={600} gutterBottom>
                                            Customizations:
                                          </Typography>
                                          {item.customizationData.map((item, idx) => (
                                            <Box key={idx} sx={{ mb: 2, p: 1, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                                              {Object.entries(item).map(([key, value]) => (
                                                <Box key={key} sx={{ mb: 0.5 }}>
                                                  <Typography fontSize={14} fontWeight={500}>
                                                    {getDisplayValue(key)}:
                                                  </Typography>
                                                  <Typography fontSize={14}>
                                                    {typeof value === "object" ?
                                                      `${getDisplayValue(value?.value)} ($ ${getDisplayValue(value?.price)})` :
                                                      getDisplayValue(value)}
                                                  </Typography>
                                                </Box>
                                              ))}
                                            </Box>
                                          ))}
                                        </Box>
                                      </Grid>
                                    )}

                                    {/* Product Info */}
                                    <Grid item xs={12} md={6}>
                                      <Box>
                                        <Typography fontWeight={600} gutterBottom>
                                          Product Information:
                                        </Typography>
                                        <Typography fontSize={14}>
                                          <Box component="span" fontWeight={500}>Product ID:</Box> {getDisplayValue(item?.product_id)}
                                        </Typography>
                                        <Typography fontSize={14}>
                                          <Box component="span" fontWeight={500}>Vendor ID:</Box> {getDisplayValue(vendorSubOrder?.vendor_id || item?.vendor_id)}
                                        </Typography>
                                        <Typography fontSize={14}>
                                          <Box component="span" fontWeight={500}>Order Status:</Box> {getDisplayValue(item?.order_status)}
                                        </Typography>
                                        <Typography fontSize={14}>
                                          <Box component="span" fontWeight={500}>Combination:</Box> {item?.isCombination ? "Yes" : "No"}
                                        </Typography>
                                        <Typography fontSize={14}>
                                          <Box component="span" fontWeight={500}>Customization:</Box> {item?.customize || "No"}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  </Grid>
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid py={2} lg={3} md={4} xs={12} sx={{ paddingLeft: { lg: "20px", md: "20px" } }}>
              <Box p={2} border={"1px solid #000"}>
                <Typography variant="h6" fontWeight={600}>
                  Sales Proceeds
                </Typography>
                <Typography color={"#000"}>Billing country/region: {getDisplayValue(order?.country, "US")}</Typography>
                <Typography color={"#000"}>Payment methods: {getDisplayValue(order?.payment_method, "Standard")}</Typography>

                <Box mt={2}>
                  <List>
                    <ListItem sx={{ padding: "0", marginTop: "10px" }}>
                      <Box pb={1} sx={{ width: "100%", borderBottom: "2px solid #d9d9d9" }}>
                        <Box
                          sx={{
                            paddingLeft: "0",
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            justifyContent: "space-between"
                          }}
                        >
                          <Typography color={"#000"} fontSize={15}>
                            Sub Total:
                          </Typography>
                          <Box pl={2} color={"#000"} fontSize={15}>
                            ${orderTotals.subTotal}
                          </Box>
                        </Box>
                        <Box
                          pt={1}
                          sx={{
                            paddingLeft: "0",
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            justifyContent: "space-between"
                          }}
                        >
                          <Typography color={"#000"} fontSize={15}>
                            Shipping Total:
                          </Typography>
                          <Box pl={2} color={"#000"} fontSize={15}>
                            ${orderTotals.shippingTotal}
                          </Box>
                        </Box>
                        {order?.voucher_dicount > 0 && (
                          <Box
                            pt={1}
                            sx={{
                              paddingLeft: "0",
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                              justifyContent: "space-between"
                            }}
                          >
                            <Typography color={"#000"} fontSize={15}>
                              Voucher Discount:
                            </Typography>
                            <Box pl={2} color={"#000"} fontSize={15}>
                              - ${(order?.voucher_dicount || 0).toFixed(2)}
                            </Box>
                          </Box>
                        )}
                        <Box
                          pt={1}
                          sx={{
                            paddingLeft: "0",
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            justifyContent: "space-between"
                          }}
                        >
                          <Typography color={"#000"} fontSize={15}>
                            Tax:
                          </Typography>
                          <Box pl={2} color={"#000"} fontSize={15}>
                            $0
                          </Box>
                        </Box>
                      </Box>
                    </ListItem>
                    <ListItem sx={{ padding: "0", marginTop: "10px" }}>
                      <Box
                        sx={{
                          paddingLeft: "0",
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          justifyContent: "space-between"
                        }}
                      >
                        <Typography color={"#000"} fontSize={15} fontWeight={600}>
                          Grand Total:
                        </Typography>
                        <Box pl={2} color={"#000"} fontSize={15} fontWeight={600}>
                          ${orderTotals.grandTotal}
                        </Box>
                      </Box>
                    </ListItem>
                    <ListItem sx={{ padding: "0", marginTop: "10px" }}>
                      <Box pb={1} sx={{ width: "100%" }}>
                        <Box
                          sx={{
                            paddingLeft: "0",
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            justifyContent: "space-between"
                          }}
                        >
                          <Typography color={"#000"} fontSize={15}>
                            Used Gift Card:
                          </Typography>
                          <Box pl={2} color={"#000"} fontSize={15}>
                            ${(order?.wallet_used || 0).toFixed(2)}
                          </Box>
                        </Box>
                        <Box
                          pt={1}
                          sx={{
                            paddingLeft: "0",
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            justifyContent: "space-between"
                          }}
                        >
                          <Typography color={"#000"} fontSize={15}>
                            Pay By PayPal:
                          </Typography>
                          <Box pl={2} color={"#000"} fontSize={15}>
                            ${orderTotals.paypalAmount}
                          </Box>
                        </Box>
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
                <Typography variant="h6">Package 1 {vendorSubOrder?.vendor_name && `- ${vendorSubOrder.vendor_name}`}</Typography>
                <Box sx={{ border: "1px solid #777777", overflow: "hidden", borderRadius: "6px" }}>
                  <Box p={2} sx={{ background: "#ebebeb" }}>
                    <Box
                      sx={{
                        display: { lg: "flex", md: "flex", xs: "block" },
                        alignItems: "center"
                      }}
                    >
                      <Typography>Action on package 1</Typography>
                      <Box
                        sx={{
                          paddingLeft: { lg: "16px", md: "16px", xs: "0" },
                          display: "flex",
                          whiteSpace: "nowrap",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "8px"
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
                            padding: "4px 16px",
                            background: "#fff",
                            color: "#000",
                            borderRadius: "30px",
                            border: "1px solid #000"
                          }}
                          onClick={() => {
                            const url = `${ROUTE_CONSTANT.orders.orderSlip}?sales_id=${sales_id}&sub_order_id=${sub_order_id}`;
                            window.open(url, '_blank');
                          }}
                        >
                          Print packing slip
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                  <Box p={2}>
                    <Grid container width={"100%"} m={0} alignItems={"center"} spacing={2}>
                      <Grid item lg={6} md={6} xs={12}>
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
                              {vendorSubOrder?.items?.[0]?.shipped_date ? formatDate(vendorSubOrder.items[0].shipped_date) : "..."}
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
                              {getDisplayValue(vendorSubOrder?.items?.[0]?.shipping_couriername)}
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
                              {shippingName}
                            </Typography>
                          </ListItem>

                        </List>
                      </Grid>
                      <Grid item lg={6} md={6} xs={12}>
                        <Box>
                          <Typography color={"#000"} fontWeight={600}>
                            Tracking Id:{" "}
                            <Box component="span" pl={1} fontWeight={400}>
                              {getDisplayValue(vendorSubOrder?.items?.[0]?.shipping_couriernumber, "101237862352673")}
                            </Box>
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Box>

              <Box mt={3}>
                <Typography variant="h6">Buyer Notes</Typography>
                <TextField
                  id="outlined-multiline"
                  multiline
                  rows={4}
                  variant="outlined"
                  value={getNoteFromItems(vendorSubOrder?.items, 'buyer_note') || "No buyer notes"}
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
                  placeholder="Enter seller notes here..."
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
                <Box pb={1} sx={{ borderBottom: "1px solid #ebebeb" }}>
                  <Typography variant="h6" fontWeight={600}>
                    Manage Feedback
                  </Typography>
                </Box>
                <Box pt={1}>
                  <Box display={"flex"} alignItems={"center"}>
                    <Typography fontSize={17}>Rating:</Typography>
                    <Box pl={1} sx={{ display: "flex" }}>
                      <StarIcon sx={{ color: "#eb9a4c" }} />
                      <StarIcon sx={{ color: "#eb9a4c" }} />
                      <StarIcon sx={{ color: "#eb9a4c" }} />
                      <StarIcon sx={{ color: "#eb9a4c" }} />
                    </Box>
                  </Box>
                  <Typography fontSize={17}>
                    Comments: {getDisplayValue(order?.feedback_comment, '"Beautiful ring! Great craftsmanship and fits very comfortably. I\'m wearing it on a finger. Looks very elegant. Going to buy a few more in diff colors!"')}
                  </Typography>
                  <Typography pt={1} fontSize={17}>
                    Date: {order?.feedback_date ? formatDate(order.feedback_date) : "Mon, Jul 10, 2023"}
                  </Typography>
                  {order?.feedback_image && (
                    <Box mt={2}>
                      <img
                        src={order.feedback_image}
                        style={{ width: "100%", height: "200px", objectFit: "cover" }}
                        alt="Feedback"
                      />
                    </Box>
                  )}
                </Box>
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
