import {
  Box,
  Button,
  FormControl,
  Icon,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  TableSortLabel,
  Grid,
  Typography,
  Autocomplete,
  Checkbox,
  ListItem,
  List,
  Menu,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent
} from "@mui/material";
import React, { useCallback, useEffect } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SearchIcon from "@mui/icons-material/Search";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { useState } from "react";
import ReplyIcon from "@mui/icons-material/Reply";
import EditIcon from "@mui/icons-material/Edit";
import MessageIcon from "@mui/icons-material/Message";
import FlagIcon from "@mui/icons-material/Flag";
import PersonIcon from "@mui/icons-material/Person";
import StoreIcon from "@mui/icons-material/Store";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  ContentPasteTwoTone as ContentPasteIcon,
  EditNote as EditNoteIcon,
  AssignmentOutlined as AssignmentIcon,
  AssignmentIndOutlined as AssignmentIndIcon,
} from "@mui/icons-material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ReviewDialog from "./ReviewModal";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { localStorageKey } from "app/constant/localStorageKey";
import { useNavigate } from "react-router-dom";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import Rating from "@mui/material/Rating";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClearIcon from "@mui/icons-material/Clear";
import ConfirmModal from "app/components/ConfirmModal";
import { dashboardDateRange } from "app/data/Index";
import CloseIcon from "@mui/icons-material/Close";
const Reviews = () => {
  const [date, setDate] = useState({
    range: "Today",
    from: new Date().toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0]
  });
  const [notePopupOpen, setNotePopupOpen] = useState(false);
  const [noteType, setNoteType] = useState("");
  const [noteText, setNoteText] = useState("");
  const [selectedNoteItem, setSelectedNoteItem] = useState(null);
  const [buyerNotes, setBuyerNotes] = useState({});
  const [sellerNotes, setSellerNotes] = useState({});
  const [openModal, setModalOpen] = useState(false);
  const [localReplies, setLocalReplies] = useState({});
  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);
  const handleDateRange = (option) => {
    const today = new Date();
    let fromDate = new Date();
    const returnDate = (range, dayAgo) => {
      fromDate.setDate(today.getDate() - dayAgo);
      return setDate({
        range: range,
        from: fromDate.toISOString().split("T")[0],
        to: today.toISOString().split("T")[0]
      });
    };
    if (option === "Today") {
      returnDate("Today", 0);
    } else if (option === "Last day") {
      returnDate("Last day", 1);
    } else if (option === "Last 3 days") {
      returnDate("Last 3 days", 3);
    } else if (option === "Last 7 days") {
      returnDate("Last 7 days", 7);
    } else if (option === "Last 14 days") {
      returnDate("Last 14 days", 14);
    } else if (option === "Last 30 days") {
      returnDate("Last 30 days", 30);
    } else if (option === "Last 90 days") {
      returnDate("Last 90 days", 90);
    } else if (option === "Last 180 days") {
      returnDate("Last 180 days", 180);
    } else if (option === "Last 365 days") {
      returnDate("Last 365 days", 365);
    } else {
      setDate((prev) => ({
        range: option
      }));
    }
  };
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const designation_id = +localStorage.getItem(localStorageKey.designation_id);
  console.log("designation_id:", designation_id);
  const isAdmin = Number(designation_id) === 2;
  const [localNotes, setLocalNotes] = useState({});
  const [tab, setTab] = useState("new");
  const [open1, setOpen1] = React.useState(false);
  const [reviews, setReviews] = useState([]);
  const [productList, setProductList] = useState([]);
  const [reviewIds, setReviewIds] = useState([]);
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [internalNoteOpen, setInternalNoteOpen] = useState(false);
  const [internalNoteText, setInternalNoteText] = useState("");
  const [selectedNoteReview, setSelectedNoteReview] = useState(null);
  const [filters, setFilters] = useState({
    productId: "",
    deliveryStar: "",
    itemStar: ""
  });
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(0);
  const [rejectRemark, setRejectRemark] = useState("");
  const [type1, setType1] = useState("");
  const [id, setId] = useState("");
  const [addCmnt, setAddCmnt] = useState("");
  const handleOpen1 = (type, id, cmnt) => {
    setOpen1(true);
    setType1(type);
    setId(id);
    setAddCmnt(cmnt);
  };
  const handleClose1 = () => setOpen1(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openOption = Boolean(anchorEl);
  const navigate = useNavigate();
  console.log({ reviewIds });
  const [open, setOpen] = React.useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);
  const logOut = () => {
    localStorage.removeItem(localStorageKey.auth_key);
    localStorage.removeItem(localStorageKey.designation_id);
    localStorage.removeItem(localStorageKey.vendorId);
    setRoute(ROUTE_CONSTANT.login)
  };
  const handleOpen = (type, msg) => {
    setMsg(msg?.message);
    setOpen(true);
    setType(type);
    if (msg?.response?.status === 401) {
      logOut()
    }
  };
  const handleReplyOpen = (item) => {
    setSelectedReview(item);
    setReplyText(localReplies[item._id] || "");
    setReplyOpen(true);
  };
  const handleReplyClose = () => {
    setReplyOpen(false);
    setReplyText("");
    setSelectedReview(null);
  };
  const handleNoteOpen = (item) => {
    setSelectedNoteReview(item);
    setInternalNoteText("");
    setInternalNoteOpen(true);
  };
  const handleNoteClose = () => {
    setInternalNoteOpen(false);
    setInternalNoteText("");
    setSelectedNoteReview(null);
  };
  const handleMessageClick = (item) => {
    const fakeChatId = item._id;
    navigate(`/pages/message?slug=${fakeChatId}`);
  };
  const handleClose = () => {
    setOpen(false);
    if (route !== null) {
      navigate(route);
    }
    setRoute(null);
    setMsg(null);
  };
  const handleClick = (event, index) => {
    setAnchorEl(event.currentTarget);
  };
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setReviewIds([]);
    setIsAllChecked(false);
    setId("");
    setAddCmnt("");
    setType1("");
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleOpenNotePopup = (type, item) => {
    setNoteType(type);
    setSelectedNoteItem(item);
    if (type === "buyer") {
      setNoteText(buyerNotes[item._id] || "");
    } else {
      setNoteText(sellerNotes[item._id] || "");
    }
    setNotePopupOpen(true);
  };
  const handleCloseNotePopup = () => {
    setNotePopupOpen(false);
    setNoteText("");
    setSelectedNoteItem(null);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const getProductList = useCallback(async () => {
    try {
      const res = await ApiService.get(apiEndpoints.getAllVendorProduct, auth_key);
      console.log("product list", res?.data?.data);
      if (res?.status === 200) {
        setProductList(res?.data?.data);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  }, [auth_key]);
  const getReviewList = async () => {
    try {
      console.log({ filters });
      const apiTab = tab === "completed" ? "approved" : tab;
      const res = await ApiService.get(
        `${apiEndpoints.getRatingByType}/${apiTab}?startDate=${date.from}&endDate=${date.to}&delivery_rating=${filters.deliveryStar}&item_rating=${filters.itemStar}&product_id=${filters.productId}`,
        auth_key
      );
      if (res?.status === 200) {
        console.log("res----", res);
        setReviews(res?.data?.ratingData);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };
  useEffect(() => {
    getReviewList();
  }, [tab]);
  useEffect(() => {
    getProductList();
  }, []);
  const changeReviewStatus = async () => {
    try {
      const payload = {
        status: type1,
        reject_remark: rejectRemark,
        id: id ? [id] : reviewIds
      };
      const res = await ApiService.post(apiEndpoints.changeRatingStatus, payload, auth_key);
      if (res?.status === 200) {
        getReviewList();
        handleClose1();
        setIsAllChecked(false);
        setReviewIds([]);
        setRejectRemark("");
        setId("");
        setAddCmnt("");
        setType1("");
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };
  const approveReviewStatus = async (status, id) => {
    console.log("STATUS SENT:", status);
    try {
      const payload = {
        status: status,
        id: reviewIds.length > 0 ? reviewIds : [id]
      };
      const res = await ApiService.post(apiEndpoints.changeRatingStatus, payload, auth_key);
      if (res?.status === 200) {
        getReviewList();
        handleClose1();
        setIsAllChecked(false);
        setReviewIds([]);
        setRejectRemark("");
        setId("");
        setAddCmnt("");
        setType1("");
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };
  function formatDate(isoString) {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
  function formatTime(isoString) {
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  const handleMasterCheckboxChange = () => {
    setIsAllChecked(!isAllChecked);
    if (!isAllChecked) {
      const allIds = reviews?.map((item) => item._id);
      setReviewIds(allIds);
    } else {
      setReviewIds([]);
    }
  };
  const handleCheckboxChange = (id) => {
    setReviewIds((prev) =>
      prev.includes(id) ? prev.filter((reviewId) => reviewId !== id) : [...prev, id]
    );
  };
  const btnStyle = (bg, hover) => ({
    fontSize: 12,
    px: 2,
    py: 0.8,
    borderRadius: "6px",
    textTransform: 'none',
    fontWeight: 600,
    boxShadow: 'none',
    bgcolor: bg,
    '&:hover': { bgcolor: hover, boxShadow: '0px 4px 8px rgba(0,0,0,0.1)' }
  });
  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    if (noteType === "buyer") {
      setBuyerNotes((prev) => ({
        ...prev,
        [selectedNoteItem._id]: noteText
      }));
    } else {
      setSellerNotes((prev) => ({
        ...prev,
        [selectedNoteItem._id]: noteText
      }));
    }
    handleCloseNotePopup();
  };
  function removeHTMLTags(str) {
    return str.replace(/<\/?[^>]+(>|$)/g, "");
  }
  const sendReply = () => {
    if (!replyText.trim()) return;

    setLocalReplies((prev) => ({
      ...prev,
      [selectedReview._id]: replyText
    }));
    handleReplyClose();
  };
  return (
    <>
      <Box
        sx={{
          padding: "30px",
          background: "#fff",
          width: "100%",
          overflowX: "hidden"
        }}
      >
        <Grid container width={"100%"} m={0} spacing={2} alignItems={"center"}>
          <Grid lg={6} md={6} xs={6}>
            <Typography variant="h5" fontWeight={600}>
              Reviews
            </Typography>
          </Grid>
        </Grid>
        {/* <Box
          sx={{
            p: 2,
            border: '1px solid #eee',
            borderRadius: 2,
            bgcolor: '#fafafa',
            mb: 2
          }}
        ></Box> */}
        <Grid container spacing={2} mt={2} px={2}>
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                overflowX: "auto",
                gap: 2,
                alignItems: "center"
              }}
            >
              {/* Product Autocomplete */}
              <Autocomplete
                id="single-select-product"
                options={productList}
                getOptionLabel={(option) =>
                  option.product_title.replace(/<\/?[^>]+(>|$)/g, "")
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Product"
                    placeholder="Select Product"
                    size="small"
                  />
                )}
                sx={{ minWidth: 220 }}
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: "productId",
                      value: newValue ? newValue.product_id : ""
                    }
                  });
                }}
              />
              {/* Date Fields (Only if Custom) */}
              {date.range === "Custom Date Range" && (
                <>
                  <TextField
                    type="date"
                    label="Start Date"
                    value={date.from}
                    onChange={(e) => setDate((prev) => ({ ...prev, from: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                  <TextField
                    type="date"
                    label="End Date"
                    value={date.to}
                    onChange={(e) => setDate((prev) => ({ ...prev, to: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </>
              )}
              {/* Date Range Selector */}
              <TextField
                select
                label="Date Range"
                value={date.range}
                onChange={(e) => handleDateRange(e.target.value)}
                size="small"
                sx={{ minWidth: 180 }}
              >
                {dashboardDateRange.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              {/* Delivery Star Selector */}
              <TextField
                select
                label="Delivery Star"
                name="deliveryStar"
                value={filters.deliveryStar}
                onChange={handleChange}
                size="small"
                sx={{ minWidth: 150 }}
                InputProps={{
                  endAdornment: filters?.deliveryStar && (
                    <InputAdornment position="end" sx={{ mr: 1 }}>
                      <IconButton
                        onClick={() =>
                          handleChange({ target: { name: "deliveryStar", value: "" } })
                        }
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <MenuItem key={num} value={num}>{num}</MenuItem>
                ))}
              </TextField>
              {/* Item Star Selector */}
              <TextField
                select
                label="Item Star"
                name="itemStar"
                value={filters.itemStar}
                onChange={handleChange}
                size="small"
                sx={{ minWidth: 150 }}
                InputProps={{
                  endAdornment: filters?.itemStar && (
                    <InputAdornment position="end" sx={{ mr: 1 }}>
                      <IconButton
                        onClick={() =>
                          handleChange({ target: { name: "itemStar", value: "" } })
                        }
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <MenuItem key={num} value={num}>{num}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Search product by keyword"
                name="keyword"
                value={filters?.keyword || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    keyword: e.target.value,
                  })
                }
                size="small"
                sx={{ minWidth: 250 }}
              />
              {/* Search Button */}
              <Button
                variant="contained"
                size="medium"
                color="primary"
                onClick={getReviewList}
                sx={{ minWidth: 50, height: "40px" }}
              >
                <SearchIcon />
              </Button>
            </Box>
          </Grid>
        </Grid>
        <Grid container width={"100%"} m={0} pt={3} spacing={2}>
          <Grid lg={12} md={12} xs={12}>
            <Box>
              <TabContext value={tab}>
                <Box>
                  <TabList onChange={handleTabChange} aria-label="review tabs" variant="scrollable" scrollButtons="auto">
                    <Tab label={<Box sx={{ textAlign: 'center' }}><Typography fontWeight={700} fontSize={13}>NEW</Typography><Typography fontSize={12}>2</Typography></Box>} value="new" />
                    <Tab label={<Box sx={{ textAlign: 'center' }}><Typography fontWeight={700} fontSize={13}>REPLIED</Typography><Typography fontSize={12}>5</Typography></Box>} value="replied" />
                    <Tab label={<Box sx={{ textAlign: 'center' }}><Typography fontWeight={700} fontSize={13}>FLAGGED</Typography><Typography fontSize={12}>3</Typography></Box>} value="flagged" />
                    <Tab label={<Box sx={{ textAlign: 'center' }}><Typography fontWeight={700} fontSize={13}>ARCHIVAL</Typography><Typography fontSize={12}>15</Typography></Box>} value="archival" />
                    <Tab label={<Box sx={{ textAlign: 'center' }}><Typography fontWeight={700} fontSize={13}>Completed</Typography><Typography fontSize={12}>25</Typography></Box>} value="completed" />
                    <Tab label={<Box sx={{ textAlign: 'center' }}><Typography fontWeight={700} fontSize={13}>All</Typography><Typography fontSize={12}>50</Typography></Box>} value="all" />
                  </TabList>
                </Box>
                {/* <TabPanel value={tab} sx={{ padding: "24px 0" }}></TabPanel> */}
              </TabContext>
            </Box>
          </Grid>
        </Grid>
        <Grid container width={"100%"} m={0} spacing={2} alignItems={"center"}>
          <Grid lg={6} md={6} xs={12}>
            <Box>

              <Box
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  bgcolor: '#fff'
                }}
              >
                <List>
                  <ListItem sx={{ width: "auto", paddingLeft: "0", display: "inline-block" }}>
                    <Box
                      sx={{
                        background: "#fff",
                        height: "36px",
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid #c8c8c8",
                        borderRadius: "8px"
                      }}
                    >
                      <Typography component="div" pr={1}>
                        <Checkbox checked={isAllChecked} onChange={handleMasterCheckboxChange} />
                      </Typography>
                      <Typography pr={1}>{reviewIds?.length}</Typography>

                      <Typography component="div" textAlign={"start"}>
                        <Button
                          sx={{ color: "#000" }}
                          id={`basic-button`}
                          aria-controls={openOption ? `basic-menu` : undefined}
                          aria-haspopup="true"
                          aria-expanded={openOption ? "true" : undefined}
                          onClick={handleClick}
                        >
                          Action <ArrowDropDownIcon />
                        </Button>
                        <Menu
                          id={`basic-menu`}
                          anchorEl={anchorEl}
                          open={openOption}
                          onClose={() => setAnchorEl(null)}
                          MenuListProps={{
                            "aria-labelledby": `basic-button`
                          }}
                        >
                          <MenuItem
                            onClick={() => {
                              reviewIds?.length > 0 && handleOpen1("approved");
                              setAnchorEl(null);
                            }}
                          >
                            Approve
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              reviewIds?.length > 0 && handleOpen1("rejected");
                              setAnchorEl(null);
                            }}
                          >
                            Reject
                          </MenuItem>
                        </Menu>
                      </Typography>
                    </Box>
                  </ListItem>
                </List>
              </Box>
            </Box>
          </Grid>
          <Grid lg={6} md={6} xs={12}>
            <Typography variant="h6" textAlign={"end"}>
              Total Reviews: {reviews?.length}
            </Typography>
          </Grid>
        </Grid>
        <Box>
          <TableContainer
            component={Paper}
            sx={{
              width: "100%",
              overflowX: "auto"
            }}
          >
            <Table sx={{ minWidth: 1250, tableLayout: "fixed" }}>
              <TableHead
                sx={{
                  bgcolor: '#fafafa',
                  borderBottom: '2px solid #eee'
                }}
              >
                <TableRow sx={{
                  '&:hover': { bgcolor: '#fafafa' },
                  verticalAlign: 'top'
                }}>
                  <TableCell sx={{ minWidth: 50, width: 50 }}>S.No</TableCell>
                  <TableCell sx={{ minWidth: 80, width: 80 }}>Date & Time</TableCell>
                  <TableCell sx={{ minWidth: 110, width: 110 }}>User Details</TableCell>
                  <TableCell sx={{ minWidth: 210, width: 210 }}>Item Image, Title, SKU, Product ID, Shop name</TableCell>
                  <TableCell sx={{ minWidth: 180, width: 180 }}>Full Feedback (Full text & Images)</TableCell>
                  <TableCell sx={{ minWidth: 230, width: 230 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              {reviews?.length > 0 ? (
                <TableBody>
                  {reviews.map((item, index) => (
                    <TableRow key={index} sx={{ verticalAlign: 'top', '& .MuiTableCell-root': { py: 1.5 } }}>
                      {/* S.No */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Checkbox
                            checked={reviewIds.includes(item._id)}
                            onClick={() => handleCheckboxChange(item._id)}
                          />
                          {index + 1}
                        </Box>
                      </TableCell>
                      {/* Date & Time */}
                      <TableCell>
                        <Typography fontSize={13}>{formatDate(item?.createdAt)}</Typography>
                        <Typography fontSize={12} color="text.secondary">{formatTime(item?.createdAt)}</Typography>
                      </TableCell>
                      {/* User Details */}
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 150 }}>
                          <Box sx={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: '1px solid #ddd' }}>
                            <img
                              src={item?.userImage || "/placeholder-user.png"}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            // onError={e => e.target.src = "https:via.placeholder.com/44"}
                            />
                          </Box>
                          <Typography fontSize={13} fontWeight={600}>{item?.user_name}</Typography>
                          <Typography fontSize={12} color="text.secondary">User ID : {item?.userId || "—"}</Typography>
                        </Box>
                      </TableCell>
                      {/* Item Image, Title, SKU, Product ID, Shop name */}
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', minWidth: 200 }}>
                          <Box
                            sx={{
                              width: 60,
                              height: 60,
                              overflow: 'hidden',
                              borderRadius: 1,
                              border: '1px solid #ddd',
                              '& img': { transition: '0.3s' },
                              '&:hover img': { transform: 'scale(1.1)' }
                            }}
                          >
                            <img
                              src={item?.productImage || ""}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            // onError={e => e.target.src = "https://via.placeholder.com/60"}
                            />
                          </Box>
                          <Box>
                            <Typography
                              fontSize={14}
                              fontWeight={500}
                              sx={{
                                maxWidth: 210,
                                lineHeight: 1.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {removeHTMLTags(item?.product_name || "")}
                            </Typography>
                            <Typography fontSize={12} color="text.secondary">SKU : {item?.productSku || "—"}</Typography>
                            <Typography fontSize={12} color="text.secondary">Product ID : {item?.product_id || "—"}</Typography>
                            <Typography fontSize={12} color="text.secondary">Shop Name : {item?.shopName || "—"}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      {/* Full Feedback */}
                      <TableCell>
                        <Box sx={{ minWidth: 300 }}>
                          {/* Review Rating */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography fontSize={13} fontWeight={500}>Review Rating</Typography>
                            <Rating value={item?.item_rating} precision={0.5} readOnly size="small" />
                          </Box>
                          {/* 3 Photos */}
                          {item?.images?.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                              {item.images.slice(0, 3).map((img, i) => (
                                <Box key={i} sx={{ width: 60, height: 60, borderRadius: 1, overflow: 'hidden', border: '1px solid #ddd' }}>
                                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>
                              ))}
                            </Box>
                          )}
                          {/* Item Quality, Delivery, Customer Service */}
                          {[
                            { label: 'Item Quality', value: item?.item_rating },
                            { label: 'Delivery', value: item?.delivery_rating },
                            { label: 'Customer Service', value: item?.customer_service_rating },
                          ].map(({ label, value }) => (
                            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.2 }}>
                              <Typography fontSize={11} sx={{ width: 95, flexShrink: 0, color: 'text.secondary' }}>
                                {label}
                              </Typography>
                              <Rating value={value} precision={0.5} readOnly size="small" sx={{ fontSize: 14 }} />
                            </Box>
                          ))}
                          {/* Comment */}
                          <Typography fontSize={12} color="text.secondary" mt={0.5} sx={{ maxWidth: 280 }}>
                            {item?.additional_comment || ""}
                            {isAdmin && localNotes[item._id] && (
                              <Typography fontSize={12} mt={0.5} color="purple">
                                <strong>Internal Note:</strong> {localNotes[item._id]}
                              </Typography>
                            )}
                          </Typography>
                        </Box>
                      </TableCell>
                      {/* Actions */}
                      <TableCell sx={{ alignContent: "center" }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.9, alignItems: "center" }}>
                          {/* Row 1 */}
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<ReplyIcon />}
                              disabled={!!localReplies[item._id]}
                              onClick={() => handleReplyOpen(item)}
                              sx={{
                                bgcolor: "success.light",
                                color: "success.contrastText",
                                "&:hover": {
                                  bgcolor: "success.main",
                                },
                              }}
                            >
                              Reply
                            </Button>

                            <Button
                              size="small"
                              variant="contained"
                              color="info"
                              startIcon={<EditIcon />}
                              disabled={!localReplies[item._id]}
                              onClick={() => handleReplyOpen(item)}
                            >
                              Edit
                            </Button>

                            {isAdmin && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="secondary"
                                startIcon={<EditNoteIcon fontSize="large" />}
                                onClick={() => handleNoteOpen(item)}
                                sx={{
                                  border: "2px solid",
                                  color: "secondary.main",
                                  "&:hover": {
                                    borderWidth: 2
                                  },
                                }}
                              >
                                Internal Note
                              </Button>
                            )}
                          </Box>

                          {/* Row 2 */}
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<MessageIcon />}
                              onClick={() => handleMessageClick(item)}
                              sx={{
                                bgcolor: "info.light",
                                color: "info.contrastText",
                                "&:hover": {
                                  bgcolor: "info.main",
                                },
                              }}
                            >
                              Message
                            </Button>

                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<FlagIcon />}
                              sx={{
                                bgcolor: "rgb(225, 15, 15)",
                                color: "error.contrastText",
                                "&:hover": {
                                  bgcolor: "error.dark",
                                },
                              }}
                            >
                              Flag
                            </Button>

                            <Button
                              size="small"
                              variant="contained"
                              color="secondary"
                              startIcon={<AssignmentIndIcon />}
                              onClick={() => handleOpenNotePopup("buyer", item)}
                            >
                              Note to Buyer
                            </Button>
                          </Box>

                          {/* Row 3 */}
                          <Box sx={{ display: "flex", gap: 1.2, alignItems: "center" }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<VisibilityOffIcon />}
                            >
                              Hide Reviews
                            </Button>

                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<AssignmentIcon />}
                              onClick={() => handleOpenNotePopup("seller", item)}
                              sx={{
                                bgcolor: "primary",
                                color: "info.contrastText",
                                "&:hover": {
                                  bgcolor: "info.main",
                                },
                              }}
                            >
                              Seller Note
                            </Button>

                            <IconButton color="default">
                              <LockOutlinedIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <TableBody scope="row">
                  <TableCell colSpan={7} sx={{ textAlign: "center" }}>
                    No Reviews Found
                  </TableCell>
                </TableBody>
              )}
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[25, 50, 75, 100]}
            component="div"
            count={reviews?.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
        <ReviewDialog
          open1={open1}
          handleOpen1={handleOpen1}
          handleClose1={handleClose1}
          rejectRemark={rejectRemark}
          setRejectRemark={setRejectRemark}
          type1={type1}
          addCmnt={addCmnt}
          changeReviewStatus={changeReviewStatus}
        />
      </Box >
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
      <Dialog open={replyOpen} onClose={handleReplyClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Reply to Review
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {/* Review text show */}
            <Typography fontSize={13} mb={1} color="text.secondary">
              {selectedReview?.additional_comment}
            </Typography>
            {/* Input */}
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Write your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            {/* Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button onClick={handleReplyClose}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={sendReply}
                disabled={!replyText.trim()}
              >
                Send Reply
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog open={internalNoteOpen} onClose={handleNoteClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Internal Note (Admin Only)
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {/* Review text */}
            <Typography fontSize={13} mb={1} color="text.secondary">
              {selectedNoteReview?.additional_comment}
            </Typography>
            {/* Input */}
            <TextField
              fullWidth
              multiline
              rows={6}
              placeholder="Write internal note..."
              value={internalNoteText}
              onChange={(e) => setInternalNoteText(e.target.value)}
            />
            {/* Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button onClick={() => {
                setLocalNotes((prev) => ({
                  ...prev,
                  [selectedNoteReview._id]: internalNoteText
                }));
                handleNoteClose();
              }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setLocalNotes((prev) => ({
                    ...prev,
                    [selectedNoteReview._id]: internalNoteText
                  }));
                  handleNoteClose();
                }}
                disabled={!internalNoteText.trim()}
              >
                Save Note
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog open={notePopupOpen} onClose={handleCloseNotePopup} maxWidth="sm" fullWidth>
        <DialogTitle>
          {noteType === "buyer" ? "Note to Buyer" : "Seller Note"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography fontSize={13} mb={1} color="text.secondary">
              {selectedNoteItem?.additional_comment}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Write your note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button onClick={handleCloseNotePopup}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveNote}
                disabled={!noteText.trim()}
              >
                Save
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default Reviews;