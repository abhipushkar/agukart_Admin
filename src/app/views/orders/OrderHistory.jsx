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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
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
import { Close as CloseIcon } from "@mui/icons-material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ConfirmModal from "app/components/ConfirmModal";
import CompleteOrder from "./CompleteOrder";
import OrderFeedbackcard from "./OrderFeedbackcard";
import { Dialog, DialogTitle, IconButton, DialogActions } from "@mui/material";
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from "@mui/icons-material";

// ─── Dummy feedback data — remove when backend sends real feedbackData ────────
const DUMMY_FEEDBACK_LIST = [
  {
    rating: 5,
    comment: "Beautiful ring! Great craftsmanship and fits very comfortably. I'm wearing it on a finger. Looks very elegant. Going to buy a few more in diff colors!",
    date: "2023-07-10T00:00:00.000Z",
    images: [
      "https://picsum.photos/seed/r1/52/52",
      "https://picsum.photos/seed/r2/52/52",
      "https://picsum.photos/seed/r3/52/52",
      "https://picsum.photos/seed/r4/52/52",
    ],
    vendor_response: "Thank you so much! So happy you loved it.",
    vendor_response_date: "2023-11-24T00:00:00.000Z",
  },
  {
    rating: 4,
    comment: "Great quality product. Very happy with my purchase. Would definitely recommend!",
    date: "2023-08-15T00:00:00.000Z",
    images: [
      "https://picsum.photos/seed/r5/52/52",
      "https://picsum.photos/seed/r6/52/52",
    ],
    vendor_response: "",
    vendor_response_date: "",
  },
];
// ─────────────────────────────────────────────────────────────────────────────

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
  const [subOrder, setSubOrder] = useState({});
  const [shipments, setShipments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [editId, setEditId] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [dialogImages, setDialogImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);


  const handleClick = (event, index) => {
    setAnchorEl(event.currentTarget);
    setOpenMenuIndex(index);
  };

  const handleCloseOption = () => {
    setAnchorEl(null);
    setOpenMenuIndex(null);
  };

  const getDisplayValue = (value, fallback = "...") => {
    if (value === null || value === undefined || value === "") return fallback;
    return value;
  };

  const toggleRowExpansion = (itemId) => {
    setExpandedRows(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const vendorSubOrder = order?.saleDetaildata?.[0];

  const itemsWithReviews = useMemo(() => {
    const items = vendorSubOrder?.items || [];
    return items.map((item, idx) => {
      if (item?.reviewData && item?.is_reviewed === true) return item;
      else return null;
    }).filter(Boolean);
  }, [vendorSubOrder]);

  const itemShippingMap = useMemo(() => {
    const items = vendorSubOrder?.items || [];
    const map = {};
    const groups = {};
    items.forEach(item => {
      const d = item.deliveryData;
      if (!d?.shippingId) return;
      if (!groups[d.shippingId]) {
        groups[d.shippingId] = { perOrder: Number(d.perOrder || 0), perItem: Number(d.perItem || 0), totalQty: 0, items: [] };
      }
      groups[d.shippingId].totalQty += Number(item.qty || 0);
      groups[d.shippingId].items.push(item);
    });
    Object.values(groups).forEach(group => {
      const groupShipping = group.perOrder + (group.totalQty > 1 ? (group.totalQty - 1) * group.perItem : 0);
      group.items.forEach(item => { map[item._id] = groupShipping * (item.qty / group.totalQty); });
    });
    console.log("itemShippingMap:", map);
    return map;
  }, [vendorSubOrder]);

  const orderTotals = useMemo(() => {
    const vendorItems = order?.saleDetaildata?.[0]?.items || [];
    if (!vendorItems.length) return { subTotal: 0, shippingTotal: 0, itemTotal: 0, grandTotal: 0, paypalAmount: 0 };
    const subTotal = vendorItems.reduce((a, b) => a + (b.sub_total || 0), 0);
    const promotionalDiscount = vendorItems.reduce((a, b) => a + (b.promotional_discount || 0) * (b.qty || 0), 0);
    const couponDiscount = vendorItems[0]?.couponDiscountAmount || 0;
    const shippingTotal = order?.saleDetaildata?.[0]?.shippingAmount || 0;
    const itemTotal = vendorItems.reduce((a, b) => a + (b.amount || 0), 0) + shippingTotal - couponDiscount;
    const grandTotal = itemTotal;
    // const paypalAmount = grandTotal - (order?.wallet_used || 0);
    return {
      subTotal: subTotal.toFixed(2),
      shippingTotal: shippingTotal.toFixed(2),
      itemTotal: itemTotal.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      promotionalDiscount: promotionalDiscount.toFixed(2),
      couponDiscount: couponDiscount.toFixed(2)
    };
  }, [order]);

  const shippingName = useMemo(() => {
    if (!order?.saleDetaildata?.[0]?.shippingName) return "...";
    const name = order.saleDetaildata[0].shippingName;
    switch (name) {
      case "standardShipping": return "Standard Delivery";
      case "expedited": return "Express Delivery";
      case "globalExpress": return "Global Express Shipping";
      case "priorityExpress": return "Priority Express Shipping";
      default: return getDisplayValue(name);
    }
  }, [order]);

  const deliveryDates = useMemo(() => {
    if (!order?.saleDetaildata?.[0]?.deliveryData?.minDate || !order?.saleDetaildata?.[0]?.deliveryData?.maxDate) {
      return { minDate: "...", maxDate: "..." };
    }
    const formatDeliveryDate = (dateString) => {
      try {
        return new Date(dateString).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
      } catch { return "..."; }
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
    if (msg?.response?.status === 401) logOut();
  }, []);

  const handleClose = () => {
    setOpen(false);
    if (route !== null) navigate(route);
    setRoute(null);
    setMsg(null);
  };

  const getOrder = useCallback(async () => {
    try {
      const payload = { sales_id, sub_order_id };
      if (!sales_id && !sub_order_id) { console.error("No order IDs provided"); return; }
      const res = await ApiService.post(apiEndpoints.getOrderHistory, payload, auth_key);
      if (res?.status === 200) {
        setOrder(res?.data?.orderHistory || { saleDetaildata: [] });
        const subOrderData = res?.data?.orderHistory?.saleDetaildata[0];
        setSubOrder({ ...subOrderData, parentSale: res?.data?.orderHistory });
        if (subOrderData.items[0]?.shipments) setShipments(subOrderData.items[0]?.shipments);
        const vendorSubOrder = res?.data?.orderHistory?.saleDetaildata?.[0];
        const firstItem = vendorSubOrder?.items?.[0];
        setSellerNote(firstItem?.seller_note || "");
        setBaseUrl(res?.data?.base_url || "");
      }
    } catch (error) { handleOpen("error", error); }
  }, [auth_key, handleOpen, sales_id, sub_order_id]);

  useEffect(() => {
    if (sales_id || sub_order_id) getOrder();
  }, [getOrder, sales_id, sub_order_id]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "...";
    let date;
    if (typeof timestamp === "number" || !isNaN(Number(timestamp))) {
      if (timestamp.toString().length === 10) timestamp = timestamp * 1000;
      date = new Date(Number(timestamp));
    } else { date = new Date(timestamp); }
    if (isNaN(date.getTime())) return "...";
    try {
      return new Intl.DateTimeFormat("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric", timeZone: "America/Los_Angeles" }).format(date);
    } catch { return "..."; }
  };

  const handleSellerSaveNote = async () => {
    if (!sellerNote.trim()) return handleOpen("error", { message: "Please Enter Seller Note" });
    try {
      const vendorSubOrder = order?.saleDetaildata?.[0];
      const vendor_id = vendorSubOrder?.vendor_id;
      if (!vendor_id) { handleOpen("error", { message: "Vendor ID not found" }); return; }
      const payload = { order_id: order?.order_id, sub_order_id, vendor_id: [vendor_id], seller_note: sellerNote };
      const res = await ApiService.post(apiEndpoints.saveSellerNote, payload, auth_key);
      if (res?.status === 200) { handleOpen("success", res?.data); getOrder(); }
    } catch (error) { handleOpen("error", error); }
  };

  const capitalizeFirstWord = (str) => {
    if (!str) return "...";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const stripHtmlTags = (html) => {
    if (!html) return "...";
    return html.replace(/<\/?[^>]+(>|$)/g, "");
  };

  const hasVariantsToShow = (item) => (
    (item?.variantData && item.variantData.length > 0) ||
    (item?.variants && item.variants.length > 0) ||
    (item?.variant_id && item.variant_id.length > 0) ||
    (item?.variant_attribute_id && item.variant_attribute_id.length > 0)
  );

  const getNoteFromItems = (itemsArray = [], noteType) => {
    if (!itemsArray || !itemsArray.length) return null;
    const firstItem = itemsArray.find(item => item[noteType]);
    return firstItem ? firstItem[noteType] : null;
  };

  const handleDialogClose = () => { setOpenDialog(false); setEditId(null); };
  const handleCompleteOrderDialogOpen = () => setOpenDialog(true);
  const handleEditTracking = (id) => { setEditId(id); setOpenDialog(true); };

  const handleImageDialogOpen = (images, index = 0) => {
    setDialogImages(images);
    setActiveImageIndex(index);
    setReviewOpen(true);
  };

  const handleImageDialogClose = () => {
    setReviewOpen(false);
    setDialogImages([]);
  }

  return (
    <>
      <CompleteOrder open={openDialog} onClose={handleDialogClose} subOrders={[subOrder]} shipmentId={editId} />
      <Box sx={{ padding: "30px", background: "#fff" }}>

        {/* ── Header ── */}
        <Box sx={{ display: { lg: "flex", md: "flex", xs: "block" }, alignItems: "center" }}>
          <Typography variant="h4" sx={{ textWrap: "nowrap" }} mr={2}>Order details</Typography>
          <Box sx={{ display: { lg: "flex", md: "flex", xs: "block" }, alignItems: "center" }} pr={2}>
            <Typography fontSize={17} fontWeight={500} sx={{ marginBottom: { lg: "0", md: "0", xs: "10px" } }}>
              Order ID:{" "}
              <Typography fontSize={17} component="span" fontWeight={600}># {getDisplayValue(order?.order_id)}</Typography>
            </Typography>
            <Box sx={{ marginLeft: { lg: "10px", md: "10px", xs: "0" } }}>
              <Box component="span" sx={{ background: "red", padding: "4px 8px", color: "#fff", borderRadius: "4px" }}>Custom order</Box>
            </Box>
          </Box>
          <Typography fontSize={17} fontWeight={500} sx={{ marginTop: { lg: "0", md: "0", xs: "10px" }, paddingLeft: { lg: "15px", md: "15px", xs: "0" }, borderLeft: { lg: "1px solid #e3e3e3", md: "1px solid #e3e3e3" } }}>
            Your Seller Order ID:{" "}
            <Typography fontSize={17} component="span" fontWeight={600} color={"green"}>#{sub_order_id || "..."}</Typography>
          </Typography>
        </Box>

        {/* ── Action Buttons ── */}
        <Grid container width={"100%"} m={0} pt={2} spacing={2} alignItems={"center"}>
          <Grid lg={12} md={12} xs={12}>
            <Box sx={{ display: { lg: "flex", md: "flex", xs: "block" }, justifyContent: "end" }}>
              <List sx={{ display: { lg: "flex", md: "flex", xs: "block" }, alignItems: "center" }}>
                {["Print packing slip", "Refund Order", "Request a Review", "Message to buyer"].map((label) => (
                  <ListItem key={label} sx={{ paddingLeft: "0", width: "auto", display: "inline-block" }}>
                    <Button
                      sx={{ fontWeight: "600", background: "#fff", border: "1px solid #000", borderRadius: "30px", padding: "5px 16px", color: "#000", fontSize: "11px" }}
                      onClick={label === "Print packing slip" ? () => window.open(`${ROUTE_CONSTANT.orders.orderSlip}?sales_id=${sales_id}&sub_order_id=${sub_order_id}`, '_blank') : undefined}
                    >
                      {label}
                    </Button>
                  </ListItem>
                ))}
                {order?.redStar && <ListItem sx={{ paddingLeft: "0", width: "auto", display: "inline-block" }}><StarIcon sx={{ color: "red" }} /></ListItem>}
                {order?.greenStar && <ListItem sx={{ paddingLeft: "0", width: "auto", display: "inline-block" }}><StarIcon sx={{ color: "green" }} /></ListItem>}
              </List>
            </Box>
          </Grid>
        </Grid>

        {/* ── Order Summary + Ship To ── */}
        <Grid container width={"100%"} m={0} pb={2} spacing={2}>
          <Grid py={2} lg={7} md={6} xs={12}>
            <Box p={3} sx={{ boxShadow: "0 0 3px #8b8b8b", background: "#fff", borderRadius: "6px" }}>
              <Typography variant="h5" fontWeight={600}>Order summary</Typography>
              <Grid container width={"100%"} m={0} spacing={2}>
                <Grid lg={7} md={7} xs={12}>
                  <List>
                    <ListItem sx={{ paddingLeft: "0", width: "auto", display: "flex", alignItems: "center" }}>
                      <Typography fontWeight={500} sx={{ width: "30%" }}>Purchase date:</Typography>
                      <Typography fontWeight={600} pl={2} sx={{ width: "70%" }}>{formatDate(order?.createdAt)}</Typography>
                    </ListItem>
                    <ListItem sx={{ paddingLeft: "0", width: "auto", display: "flex", alignItems: "center" }}>
                      <Typography fontWeight={500} sx={{ width: "30%" }}>Ship by:</Typography>
                      <Typography fontWeight={600} color={"#e2912c"} pl={2} sx={{ width: "70%" }}>{deliveryDates.minDate} to {deliveryDates.maxDate}</Typography>
                    </ListItem>
                    <ListItem sx={{ paddingLeft: "0", width: "auto", display: "flex", alignItems: "center" }}>
                      <Typography fontWeight={500} sx={{ width: "30%" }}>Deliver by:</Typography>
                      <Typography fontWeight={600} sx={{ width: "70%" }} pl={2}>{deliveryDates.minDate} to {deliveryDates.maxDate}</Typography>
                    </ListItem>
                    <ListItem sx={{ paddingLeft: "0", width: "auto", display: "flex", alignItems: "center" }}>
                      <Typography fontWeight={500} sx={{ width: "30%" }}>Delivered date:</Typography>
                      <Typography fontWeight={600} sx={{ width: "70%" }} pl={2}>
                        {vendorSubOrder?.items?.[0]?.delivered_date ? formatDate(vendorSubOrder.items[0].delivered_date) : "..."}
                      </Typography>
                    </ListItem>
                  </List>
                </Grid>
                <Grid lg={5} md={5} xs={12}>
                  <List>
                    <ListItem sx={{ paddingLeft: "0", width: "auto", display: "flex", alignItems: "center" }}>
                      <Typography fontWeight={500} sx={{ width: "50%" }}>Shipping services:</Typography>
                      <Typography fontWeight={600} pl={2} sx={{ width: "50%" }}>{shippingName}</Typography>
                    </ListItem>
                    <ListItem sx={{ paddingLeft: "0", width: "auto", display: "flex", alignItems: "center" }}>
                      <Typography fontSize={14} sx={{ color: "#000", mt: 1, width: "50%" }}>
                        Store: <Box component="strong">{vendorSubOrder?.shop_name || "..."}</Box>
                      </Typography>
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          <Grid py={2} lg={5} md={6} xs={12} sx={{ paddingLeft: { lg: "20px", md: "20px" } }}>
            <Box p={3} sx={{ boxShadow: "0 0 3px #8b8b8b", background: "#fff", borderRadius: "6px" }}>
              <Typography variant="h5" fontWeight={600}>Ship to</Typography>
              <Grid container width={"100%"} m={0} spacing={2}>
                <Grid lg={6} md={4} xs={12}>
                  <Box mt={2}>
                    <Typography fontSize={15}>{getDisplayValue(order?.receiver_name)}</Typography>
                    <Typography>{capitalizeFirstWord(order?.address_line1)}</Typography>
                    <Typography>{capitalizeFirstWord(order?.address_line2)}</Typography>
                    <Typography>{getDisplayValue(order?.city)}, {getDisplayValue(order?.state)} {getDisplayValue(order?.pincode)}</Typography>
                    <Typography>{getDisplayValue(order?.country)}</Typography>
                    <Typography fontSize={15} fontWeight={500}>Mob. No.: {`${getDisplayValue(order?.phone_code)} ${getDisplayValue(order?.mobile)}`}</Typography>
                  </Box>
                </Grid>
                <Grid lg={6} md={8} xs={12}>
                  <List>
                    <ListItem sx={{ paddingLeft: "0", width: "auto", display: "flex", alignItems: "center", whiteSpace: "normal", paddingBottom: "0" }}>
                      <Typography fontWeight={501}>Buyer Name:</Typography>
                      <Typography fontWeight={500} pl={1} color={"green"}>{getDisplayValue(order?.userName)}</Typography>
                    </ListItem>
                    <ListItem sx={{ paddingLeft: "0", width: "auto", display: "flex", alignItems: "center", whiteSpace: "normal", paddingBottom: "0" }}>
                      <Typography fontWeight={501}>Buyer Id No.:</Typography>
                      <Typography fontWeight={500} pl={1}>{getDisplayValue(order?.id_number)}</Typography>
                    </ListItem>
                    <ListItem sx={{ paddingLeft: "0", width: "auto", display: "flex", alignItems: "center", whiteSpace: "normal", paddingBottom: "0" }}>
                      <Typography fontWeight={501}>Buyer Email Id:</Typography>
                      <Typography fontWeight={500} pl={1}>{getDisplayValue(order?.userEmail)}</Typography>
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>

        {/* ── Items Table + Sales Proceeds ── */}
        <Box mt={3}>
          <Grid container width={"100%"} m={0} pb={2} spacing={2}>
            <Grid py={2} lg={9} md={8} xs={12}>
              <TableContainer component={Paper} sx={{ boxShadow: "0 0 3px #dbdbdb", borderRadius: "6px", overflowX: "auto", maxWidth: "100%" }}>
                <Table sx={{ minWidth: 800, tableLayout: 'fixed', ".MuiTableCell-root": { padding: "10px 10px 0 0", wordBreak: "break-word" } }} aria-label="simple table">
                  <TableHead sx={{ background: "#ebebeb" }}>
                    <TableRow>
                      <TableCell align="center" sx={{ fontSize: "16px", whiteSpace: "nowrap", width: "120px", pl: 2 }}>Status</TableCell>
                      <TableCell align="center" sx={{ fontSize: "16px", whiteSpace: "nowrap", width: "100px" }}>Image</TableCell>
                      <TableCell align="center" sx={{ fontSize: "16px", whiteSpace: "nowrap", width: "250px", minWidth: "200px" }}>Product name</TableCell>
                      <TableCell align="center" sx={{ fontSize: "16px", whiteSpace: "nowrap", width: "150px" }}>More information</TableCell>
                      <TableCell align="center" sx={{ fontSize: "16px", whiteSpace: "nowrap", width: "80px" }}>Quantity</TableCell>
                      <TableCell align="center" sx={{ fontSize: "16px", whiteSpace: "nowrap", width: "100px" }}>Unit price</TableCell>
                      <TableCell align="center" sx={{ fontSize: "16px", whiteSpace: "nowrap", width: "180px", minWidth: "150px" }}>Proceeds</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
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
                          <TableRow sx={{ verticalAlign: "top", "&:last-child td, &:last-child th": { border: 0 } }}>
                            <TableCell align="start">
                              <Box sx={{
                                background: item?.order_status === "new" ? "#f0ad4e" : item?.order_status === "completed" ? "#5cb85c" : item?.order_status === "cancelled" ? "#d9534f" : "#5bc0de",
                                color: "#fff", padding: "8px 16px", borderRadius: "4px", whiteSpace: "nowrap", textAlign: "center"
                              }}>
                                {item?.order_status === "new" ? "No Tracking" : getDisplayValue(item?.order_status)}
                              </Box>
                            </TableCell>
                            <TableCell align="start">
                              {productImage ? (
                                <img src={`${baseUrl}${productImage}`} alt={productTitle} style={{ height: "80px", width: "80px", objectFit: "contain", aspectRatio: "1/1", borderRadius: "4px" }} />
                              ) : (
                                <Box sx={{ height: "80px", width: "80px", bgcolor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px" }}>
                                  <Typography color="text.secondary">No image</Typography>
                                </Box>
                              )}
                            </TableCell>
                            <TableCell align="start" sx={{ width: "250px" }}>
                              <Box>
                                <Typography fontSize={16} color={"green"} sx={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {productTitle}
                                </Typography>
                                <Typography fontSize={14} sx={{ color: "#000", mt: 1 }}>SKU: <Box component="span" fontWeight={500}>{skuCode}</Box></Typography>
                                {(variantData.length > 0 || internalVariants.length > 0) && (
                                  <Box sx={{ mt: 1 }}>
                                    {variantData.length > 0 && variantData[0] && variantAttributeData[0] && (
                                      <Typography fontSize={14} sx={{ color: "#000" }}>
                                        {getDisplayValue(variantData[0]?.variant_name)}: <Box component="span">{getDisplayValue(variantAttributeData[0]?.attribute_value)}</Box>
                                      </Typography>
                                    )}
                                    {internalVariants.length > 0 && !variantData[0] && (
                                      <Typography fontSize={14} sx={{ color: "#000" }}>
                                        {getDisplayValue(internalVariants[0]?.variantName)}: <Box component="span">{getDisplayValue(internalVariants[0]?.attributeName)}</Box>
                                      </Typography>
                                    )}
                                    {hasVariants && (variantData.length > 1 || internalVariants.length > 1 || variantIds.length > 0) && (
                                      <Button sx={{ background: "none", border: "none", boxShadow: "none", color: "green", padding: "0", mt: 1, fontSize: "14px", textTransform: "none" }} onClick={() => toggleRowExpansion(item._id)}>
                                        {isExpanded ? <><KeyboardArrowUpIcon sx={{ fontSize: "16px", mr: 0.5 }} />Show less</> : <><KeyboardArrowDownIcon sx={{ fontSize: "16px", mr: 0.5 }} />Show more</>}
                                      </Button>
                                    )}
                                  </Box>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="start">
                              <Box>
                                <Typography fontSize={16}>Order item ID: <Box fontSize={12} component="span">{getDisplayValue(item?._id)}</Box></Typography>
                                <Typography fontSize={12}>Product Code: <Box fontSize={12} fontWeight={500} component="span">{getDisplayValue(item?.productData.product_code)}</Box></Typography>
                                {sub_order_id && <Typography fontSize={12} sx={{ color: "#666", mt: 0.5 }}>Transaction Id: {item.item_id}</Typography>}
                              </Box>
                            </TableCell>
                            <TableCell align="center"><Typography fontSize={16}>{getDisplayValue(item?.qty)}</Typography></TableCell>
                            <TableCell align="center"><Typography fontSize={16}>${getDisplayValue(item?.original_price, "0.00")}</Typography></TableCell>
                            <TableCell align="start" sx={{ width: "180px" }}>
                              <List>
                                <ListItem sx={{ padding: "0" }}>
                                  <Box pb={1} sx={{ width: "100%", borderBottom: "2px solid #d9d9d9" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                                      <Typography color={"#000"} fontSize={15}>Item subtotal:</Typography>
                                      <Box pl={2} color={"#000"} fontSize={15}>${((item?.original_price || 0) * (item?.qty || 0)).toFixed(2)}</Box>
                                    </Box>
                                    {item?.promotional_discount > 0 && (
                                      <Box sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                                        <Typography color={"#32be19"} fontSize={13} sx={{ display: "flex", alignItems: "center" }}>
                                          <LocalOfferIcon sx={{ marginRight: "4px", fontSize: "18px", transform: "rotate(115deg)" }} />
                                          {`${item?.promotionData?.promotional_title} (${item?.promotionData?.offer_type === "percentage" ? getDisplayValue(item?.promotionData?.discount_amount) + "%" : "$" + getDisplayValue(item?.promotionData?.discount_amount)} off)`}:
                                        </Typography>
                                        <Box pl={2} color={"red"} fontSize={13}>- ${((item?.promotional_discount || 0) * (item?.qty || 0)).toFixed(2)}</Box>
                                      </Box>
                                    )}
                                    {/* {item?.couponDiscountAmount > 0 && (
                                      <Box pt={1} sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                                        <Typography color={"#a1a1a1"} fontSize={13} sx={{ display: "flex", alignItems: "center" }}>
                                          <LocalOfferIcon sx={{ marginRight: "4px", fontSize: "18px", transform: "rotate(115deg)" }} />
                                          Shop Coupon({getDisplayValue(item?.couponData?.coupon_data?.coupon_code)})
                                        </Typography>
                                        <Box pl={2} color={"red"} fontSize={13}>- ${(item?.couponDiscountAmount || 0).toFixed(2)}</Box>
                                      </Box>
                                    )} */}
                                  </Box>
                                </ListItem>
                                <ListItem sx={{ padding: "0", marginTop: "10px" }}>
                                  <Box pb={1} sx={{ width: "100%", borderBottom: "2px solid #d9d9d9" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                                      <Typography color={"#000"} fontSize={15}>Sub Total:</Typography>
                                      <Box pl={2} color={"#000"} fontSize={15}>${((item?.amount || 0)).toFixed(2)}</Box>
                                    </Box>
                                    <Box pt={1} sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                                      <Typography color={"#000"} fontSize={15}>Shipping Total:</Typography>
                                      <Box pl={2} color={"#000"} fontSize={15}>${(itemShippingMap[item._id] || 0).toFixed(2)}</Box>
                                    </Box>
                                    <Box pt={1} sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                                      <Typography color={"#000"} fontSize={15}>Tax:</Typography>
                                      <Box pl={2} color={"#000"} fontSize={15}>$0</Box>
                                    </Box>
                                  </Box>
                                </ListItem>
                                <ListItem sx={{ padding: "0", marginTop: "10px" }}>
                                  <Box sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                                    <Typography color={"#000"} fontSize={15} fontWeight={600}>Item Total:</Typography>
                                    <Box pl={2} color={"#000"} fontSize={15} fontWeight={600}>${((item?.amount || 0) + (itemShippingMap[item._id] || 0)).toFixed(2)}</Box>
                                  </Box>
                                </ListItem>
                              </List>
                            </TableCell>
                          </TableRow>

                          {isExpanded && (
                            <TableRow>
                              <TableCell colSpan={7} sx={{ backgroundColor: "#f9f9f9", borderTop: "1px solid #e0e0e0" }}>
                                <Box sx={{ p: 2 }}>
                                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>Additional Details</Typography>
                                  <Grid container spacing={3}>
                                    {(variantData.length > 0 || variantIds.length > 0) && (
                                      <Grid item xs={12} md={6}>
                                        <Typography fontWeight={600} gutterBottom>Product Variants:</Typography>
                                        {variantData.length > 0 ? variantData.map((variantItem, idx) => (
                                          <Box key={idx} sx={{ mb: 1, display: "flex", flexDirection: "row", gap: 1, alignItems: "center" }}>
                                            <Typography fontSize={14} fontWeight={500}>{getDisplayValue(variantItem?.variant_name)}:</Typography>
                                            <Typography fontSize={14}>{getDisplayValue(variantAttributeData[idx]?.attribute_value)}</Typography>
                                          </Box>
                                        )) : (
                                          <Box>
                                            <Typography fontSize={14} fontWeight={500}>Variant IDs:</Typography>
                                            <Typography fontSize={14}>{variantIds.join(", ")}</Typography>
                                            {variantAttributeIds.length > 0 && <>
                                              <Typography fontSize={14} fontWeight={500} sx={{ mt: 1 }}>Variant Attribute IDs:</Typography>
                                              <Typography fontSize={14}>{variantAttributeIds.join(", ")}</Typography>
                                            </>}
                                          </Box>
                                        )}
                                      </Grid>
                                    )}
                                    {internalVariants.length > 0 && (
                                      <Grid item xs={12} md={6}>
                                        <Typography fontWeight={600} gutterBottom>Internal Variants:</Typography>
                                        {internalVariants.map((variant, idx) => (
                                          <Box key={variant._id || idx} sx={{ mb: 1, display: "flex", flexDirection: "row", gap: 1, }}>
                                            <Typography fontSize={14} fontWeight={500}>{getDisplayValue(variant.variantName)}:</Typography>
                                            <Typography fontSize={14}>{getDisplayValue(variant.attributeName)}</Typography>
                                          </Box>
                                        ))}
                                      </Grid>
                                    )}
                                    {item?.customize === "Yes" && item?.customizationData?.length > 0 && (
                                      <Grid item xs={12} md={6}>
                                        <Typography fontWeight={600} gutterBottom>Customizations:</Typography>
                                        {item.customizationData.map((customItem, idx) => (
                                          <Box key={idx} sx={{ mb: 2, p: 1, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                                            {Object.entries(customItem).map(([key, value]) => (
                                              <Box key={key} sx={{ mb: 0.5, display: "flex", flexDirection: "row", gap: 1, }}>
                                                <Typography fontSize={14} fontWeight={500}>{getDisplayValue(key)}:</Typography>
                                                <Typography fontSize={14}>{typeof value === "object" ? `${getDisplayValue(value?.value)} ($ ${getDisplayValue(value?.price)})` : getDisplayValue(value)}</Typography>
                                              </Box>
                                            ))}
                                          </Box>
                                        ))}
                                      </Grid>
                                    )}
                                    <Grid item xs={12} md={6}>
                                      <Typography fontWeight={600} gutterBottom>Product Information:</Typography>
                                      <Typography fontSize={14}><Box component="span" fontWeight={500}>Product ID:</Box> {getDisplayValue(item?.product_id)}</Typography>
                                      <Typography fontSize={14}><Box component="span" fontWeight={500}>Vendor ID:</Box> {getDisplayValue(vendorSubOrder?.vendor_id || item?.vendor_id)}</Typography>
                                      <Typography fontSize={14}><Box component="span" fontWeight={500}>Order Status:</Box> {getDisplayValue(item?.order_status)}</Typography>
                                      <Typography fontSize={14}><Box component="span" fontWeight={500}>Combination:</Box> {item?.isCombination ? "Yes" : "No"}</Typography>
                                      <Typography fontSize={14}><Box component="span" fontWeight={500}>Customization:</Box> {item?.customize || "No"}</Typography>
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

            {/* Sales Proceeds */}
            <Grid py={2} lg={3} md={4} xs={12} sx={{ paddingLeft: { lg: "20px", md: "20px" } }}>
              <Box p={2} border={"1px solid #000"}>
                <Typography variant="h6" fontWeight={600}>Sales Proceeds</Typography>
                <Typography color={"#000"}>Billing country/region: {getDisplayValue(order?.country, "US")}</Typography>
                <Typography color={"#000"}>Payment methods: {getDisplayValue(order?.payment_method, "Standard")}</Typography>
                <Box mt={2}>
                  <List>
                    <ListItem sx={{ padding: "0", marginTop: "10px" }}>
                      <Box pb={1} sx={{ width: "100%", borderBottom: "2px solid #d9d9d9" }}>
                        <Box sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                          <Typography color={"#000"} fontSize={15}>Sub Total:</Typography>
                          <Box pl={2} color={"#000"} fontSize={15}>${orderTotals.subTotal}</Box>
                        </Box>
                        {orderTotals.promotionalDiscount > 0 && (<Box pt={1} sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                          <Typography color={"#000"} fontSize={15}>Promotional Discount:</Typography>
                          <Box pl={2} color={"#000"} fontSize={15}>- ${orderTotals.promotionalDiscount}</Box>
                        </Box>
                        )}
                        {orderTotals.couponDiscount > 0 && (<Box pt={1} sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                          <Typography color={"#000"} fontSize={15}>Coupon Discount:</Typography>
                          <Box pl={2} color={"#000"} fontSize={15}>- ${orderTotals.couponDiscount}</Box>
                        </Box>
                        )}
                        <Box pt={1} sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                          <Typography color={"#000"} fontSize={15}>Shipping Total:</Typography>
                          <Box pl={2} color={"#000"} fontSize={15}>${order.saleDetaildata?.[0]?.shippingAmount}</Box>
                        </Box>
                        {/* {order?.voucher_dicount > 0 && (
                          <Box pt={1} sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                            <Typography color={"#000"} fontSize={15}>Voucher Discount:</Typography>
                            <Box pl={2} color={"#000"} fontSize={15}>- ${(order?.voucher_dicount || 0).toFixed(2)}</Box>
                          </Box>
                        )} */}
                        <Box pt={1} sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                          <Typography color={"#000"} fontSize={15}>Tax:</Typography>
                          <Box pl={2} color={"#000"} fontSize={15}>$0</Box>
                        </Box>
                      </Box>
                    </ListItem>
                    <ListItem sx={{ padding: "0", marginTop: "10px" }}>
                      <Box sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                        <Typography color={"#000"} fontSize={15} fontWeight={600}>Grand Total:</Typography>
                        <Box pl={2} color={"#000"} fontSize={15} fontWeight={600}>${orderTotals.grandTotal}</Box>
                      </Box>
                    </ListItem>
                    {/* <ListItem sx={{ padding: "0", marginTop: "10px" }}>
                      <Box pb={1} sx={{ width: "100%" }}>
                        <Box sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                          <Typography color={"#000"} fontSize={15}>Used Gift Card:</Typography>
                          <Box pl={2} color={"#000"} fontSize={15}>${(order?.wallet_used || 0).toFixed(2)}</Box>
                        </Box>
                        <Box pt={1} sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                          <Typography color={"#000"} fontSize={15}>Pay By PayPal:</Typography>
                          <Box pl={2} color={"#000"} fontSize={15}>${orderTotals.paypalAmount}</Box>
                        </Box>
                      </Box>
                    </ListItem> */}
                  </List>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* ── Package + Shipments + Notes + Feedback ── */}
        <Box mt={3}>
          <Grid container width={"100%"} m={0} pb={2} spacing={2}>
            <Grid py={2} lg={9} md={8} xs={12}>
              <Box>
                <Typography variant="h6">Package 1 {vendorSubOrder?.vendor_name && `- ${vendorSubOrder.vendor_name}`}</Typography>
                <Box sx={{ border: "1px solid #777777", overflow: "hidden", borderRadius: "6px" }}>
                  <Box p={2} sx={{ background: "#ebebeb" }}>
                    <Box sx={{ display: { lg: "flex", md: "flex", xs: "block" }, alignItems: "center" }}>
                      <Typography>Action on package 1</Typography>
                      <Box sx={{ paddingLeft: { lg: "16px", md: "16px", xs: "0" }, display: "flex", whiteSpace: "nowrap", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                        <Button sx={{ padding: "4px 16px", background: "#fff", color: "#000", borderRadius: "30px", border: "1px solid #000" }} onClick={handleCompleteOrderDialogOpen}>Add shipment</Button>
                        <Button sx={{ padding: "4px 16px", background: "#fff", color: "#000", borderRadius: "30px", border: "1px solid #000" }} onClick={() => window.open(`${ROUTE_CONSTANT.orders.orderSlip}?sales_id=${sales_id}&sub_order_id=${sub_order_id}`, '_blank')}>Print packing slip</Button>
                      </Box>
                    </Box>
                  </Box>

                  {shipments?.length > 0 ? (
                    shipments.map((shipment, index) => (
                      <Box key={shipment._id || index} sx={{ borderTop: "1px solid" }}>
                        <Grid container width={"100%"} m={0} alignItems={"center"} spacing={2}>
                          <Grid item lg={6} md={6} xs={12}>
                            <List>
                              <ListItem sx={{ paddingLeft: "0", width: "auto", display: "flex", alignItems: "center" }}>
                                <Typography fontWeight={600} sx={{ width: "50%" }}>Ship date :</Typography>
                                <Typography fontWeight={500} pl={2} sx={{ width: "50%" }}>{shipment.shipped_date ? formatDate(shipment.shipped_date) : "..."}</Typography>
                              </ListItem>
                              <ListItem sx={{ paddingLeft: "0", width: "auto", display: "flex", alignItems: "center" }}>
                                <Typography fontWeight={600} sx={{ width: "50%" }}>Carrier :</Typography>
                                <Typography fontWeight={500} pl={2} sx={{ width: "50%" }}>{getDisplayValue(shipment.courierName)}</Typography>
                              </ListItem>
                              <ListItem sx={{ paddingLeft: "0", width: "auto", display: "flex", alignItems: "center" }}>
                                <Typography fontWeight={600} sx={{ width: "50%" }}>Shipping :</Typography>
                                <Typography fontWeight={500} pl={2} sx={{ width: "50%" }}>{shippingName}</Typography>
                              </ListItem>
                            </List>
                          </Grid>
                          <Grid item lg={6} md={6} xs={12}>
                            <Box sx={{ position: 'relative', height: '100%' }}>
                              <Box sx={{ position: 'absolute', top: -30, right: -1 }}>
                                <Button sx={{ color: "#161616", minWidth: 'auto' }} id={`basic-button-${index}`} aria-controls={openMenuIndex === index ? `basic-menu-${index}` : undefined} aria-haspopup="true" aria-expanded={openMenuIndex === index ? "true" : undefined} onClick={(e) => handleClick(e, index)}>
                                  <MoreVertIcon />
                                </Button>
                                <Menu anchorEl={anchorEl} open={openMenuIndex === index} onClose={handleCloseOption} MenuListProps={{ "aria-labelledby": `basic-button-${index}` }}>
                                  <MenuItem onClick={() => { handleCloseOption(); handleEditTracking(shipment._id); }}>Edit</MenuItem>
                                </Menu>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '60px' }}>
                                <Typography color={"#0f0f0f"} fontWeight={600}>
                                  Tracking Number : <Box component="span" pl={1} fontWeight={400}>{getDisplayValue(shipment.trackingNumber)}</Box>
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    ))
                  ) : (
                    <Box p={2} sx={{ borderTop: "1px solid" }}>
                      <Grid container width={"100%"} m={0} alignItems={"center"} spacing={2}>
                        <Grid item lg={6} md={6} xs={12}>
                          <List>
                            <ListItem sx={{ paddingLeft: "0", width: "auto", display: "flex", alignItems: "center" }}>
                              <Typography fontWeight={600} sx={{ width: "50%" }}>Ship date:</Typography>
                              <Typography fontWeight={500} pl={2} sx={{ width: "50%" }}>{vendorSubOrder?.items?.[0]?.shipped_date ? formatDate(vendorSubOrder.items[0].shipped_date) : "..."}</Typography>
                            </ListItem>
                            <ListItem sx={{ paddingLeft: "0", width: "auto", display: "flex", alignItems: "center" }}>
                              <Typography fontWeight={600} sx={{ width: "50%" }}>Carrier:</Typography>
                              <Typography fontWeight={500} pl={2} sx={{ width: "50%" }}>{getDisplayValue(vendorSubOrder?.items?.[0]?.shipping_couriername)}</Typography>
                            </ListItem>
                            <ListItem sx={{ paddingLeft: "0", width: "auto", display: "flex", alignItems: "center" }}>
                              <Typography fontWeight={600} sx={{ width: "50%" }}>Shipping :</Typography>
                              <Typography fontWeight={500} pl={2} sx={{ width: "50%" }}>{shippingName}</Typography>
                            </ListItem>
                          </List>
                        </Grid>
                        <Grid item lg={6} md={6} xs={12}>
                          <Typography color={"#000"} fontWeight={600}>
                            Tracking Number : <Box component="span" pl={1} fontWeight={400}>...</Box>
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Box>
              </Box>

              <Box mt={3}>
                <Typography variant="h6">Buyer Notes</Typography>
                <TextField id="outlined-multiline" multiline rows={4} variant="outlined" value={getNoteFromItems(vendorSubOrder?.items, 'buyer_note') || "No buyer notes"} fullWidth disabled />
              </Box>

              <Box mt={3}>
                <Typography variant="h6">Seller Notes</Typography>
                <TextField id="outlined-multiline" multiline rows={4} variant="outlined" fullWidth value={sellerNote} onChange={(e) => setSellerNote(e.target.value)} sx={{ mt: 1 }} placeholder="Enter seller notes here..." />
                <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSellerSaveNote}>Save</Button>
              </Box>
            </Grid>

            {/* ── Manage Feedback — per item cards ── */}
            <Grid py={2} lg={3} md={3} xs={12} sx={{ paddingLeft: { lg: "20px", md: "20px" } }}>
              <Box pb={1} mb={2} sx={{ borderBottom: "1px solid #ebebeb" }}>
                <Typography variant="h6" fontWeight={600}>Manage Feedback</Typography>
              </Box>

              {itemsWithReviews.length > 0 ? (
                itemsWithReviews.map((item) => (
                  <OrderFeedbackcard
                    key={item._id}
                    item={item}
                    baseUrl={baseUrl}
                    shopName={vendorSubOrder?.shop_name}
                    open={reviewOpen}
                    imageDialogOpen={handleImageDialogOpen}
                    imageDialogClose={handleImageDialogClose}
                    setActiveImageIndex={setActiveImageIndex}
                    activeImageIndex={activeImageIndex}
                    dialogImages={dialogImages}
                  />
                ))
              ) : (
                <Typography fontSize={13} color="text.secondary">No items with Reviews</Typography>
              )}
            </Grid>

          </Grid>
        </Box>
      </Box>

      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </>
  );
};

export default OrderHistory;