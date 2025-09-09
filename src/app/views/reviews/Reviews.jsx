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
import SearchIcon from "@mui/icons-material/Search";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { useState } from "react";
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

  const [openModal, setModalOpen] = useState(false);

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
  const [tab, setTab] = useState("pending");
  const [open1, setOpen1] = React.useState(false);
  const [reviews, setReviews] = useState([]);
  const [productList, setProductList] = useState([]);
  const [reviewIds, setReviewIds] = useState([]);
  const [isAllChecked, setIsAllChecked] = useState(false);
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

  // const getReviewList = useCallback(async () => {
  const getReviewList = async () => {
    try {
      console.log({ filters });
      const res = await ApiService.get(
        `${apiEndpoints.getRatingByType}/${tab}?startDate=${date.from}&endDate=${date.to}&delivery_rating=${filters.deliveryStar}&item_rating=${filters.itemStar}&product_id=${filters.productId}`,
        auth_key
      );
      if (res?.status === 200) {
        console.log("res----", res);
        setReviews(res?.data?.ratingData);
      }
    } catch (error) {
      handleOpen("error", error);
    }
    // }, [auth_key, tab]);
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

  const approveReviewStatus = async (status,id) => {
    try {
      const payload = {
        status: status,
        id: reviewIds.length > 0  ? reviewIds : [id]
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

  function removeHTMLTags(str) {
    return str.replace(/<\/?[^>]+(>|$)/g, ""); 
  }

  return (
    <>
      <Box sx={{ padding: "30px", background: "#fff" }}>
        <Grid container width={"100%"} m={0} spacing={2} alignItems={"center"}>
          <Grid lg={6} md={6} xs={6}>
            <Typography variant="h5" fontWeight={600}>
              Reviews
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2} my={2} px={2}>
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
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
        <Grid container width={"100%"} m={0} pt={4} spacing={2}>
          <Grid lg={12} md={12} xs={12}>
            <Box>
              <TabContext value={tab}>
                <Box>
                  <TabList
                    onChange={handleTabChange}
                    aria-label="lab API tabs example"
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab label="Pending" value="pending" />
                    <Tab label="Approved" value="approved" />
                    <Tab label="Rejected" value="rejected" />
                  </TabList>
                </Box>
                <TabPanel value={tab} sx={{ padding: "24px 0" }}></TabPanel>
              </TabContext>
            </Box>
          </Grid>
        </Grid>
        <Grid container width={"100%"} m={0} spacing={2} alignItems={"center"}>
          <Grid lg={6} md={6} xs={12}>
            <Box>
              {(tab === "pending") && (
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
              )} 
            </Box>
          </Grid>
          <Grid lg={6} md={6} xs={12}>
            <Typography variant="h6" textAlign={"end"}>
              Total Reviews: {reviews?.length}
            </Typography>
          </Grid>
        </Grid>
        <Box>
          <TableContainer sx={{ paddingLeft: 2, paddingRight: 2 }} component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>S.No</TableCell>
                  {
                    designation_id == "2" && (
                      <TableCell>Shop Name</TableCell>
                    )
                  }
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Order No.</TableCell>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Product SKU</TableCell>
                  <TableCell>User Name</TableCell>
                  <TableCell>Delivery Rating</TableCell>
                  <TableCell>Item Rating</TableCell>
                  <TableCell>Feedback</TableCell>
                  {tab === "approved" && <TableCell>Approval Date</TableCell>}
                  {tab === "rejected" && <TableCell>Approval Date</TableCell>}
                  {tab === "pending" && <TableCell sx={{ textAlign: "center" }}>Action</TableCell>}
                </TableRow>
              </TableHead>
              {reviews?.length > 0 ? (
                <TableBody>
                  {reviews.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {(tab === "pending") ? (
                          <Checkbox
                            checked={reviewIds.includes(item._id)}
                            onClick={() => handleCheckboxChange(item._id)}
                          />
                        ) : (
                          index + 1
                        )}
                      </TableCell>
                      {
                        designation_id == "2" && (
                          <TableCell>
                            {item?.shopName}
                          </TableCell>
                        )
                      }
                      <TableCell>
                        {formatDate(item?.createdAt)} {formatTime(item?.createdAt)}
                      </TableCell>
                      <TableCell>{item?.orderId}</TableCell>
                      <TableCell>{removeHTMLTags(item?.product_name || "")}</TableCell>
                      <TableCell>{item?.productSku}</TableCell>
                      <TableCell>{item?.user_name}</TableCell>
                      <TableCell>
                        <Rating
                          name="read-only"
                          value={item?.delivery_rating}
                          precision={0.5}
                          readOnly
                        />
                      </TableCell>
                      <TableCell>
                        <Rating
                          name="read-only"
                          value={item?.item_rating}
                          precision={0.5}
                          readOnly
                        />
                      </TableCell>
                      <TableCell>
                        <Button onClick={handleModalOpen} size="small" color="primary" variant="outlined">
                          Feedback
                        </Button>
                      </TableCell>
                      <Dialog open={openModal} onClose={handleModalClose} maxWidth="sm" fullWidth>
                        <DialogTitle>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            Feedback
                            <IconButton onClick={handleModalClose} size="small">
                              <CloseIcon />
                            </IconButton>
                          </Box>
                        </DialogTitle>
                        <DialogContent>
                          {item?.additional_comment || "No comment provided."}
                        </DialogContent>
                      </Dialog>
                      {tab === "approved" && (
                        <TableCell>
                          {formatDate(item?.approved_date)} {formatTime(item?.approved_date)}
                        </TableCell>
                      )}
                      {tab === "rejected" && (
                        <TableCell>
                          {formatDate(item?.rejected_date)} {formatTime(item?.rejected_date)}
                        </TableCell>
                      )}
                      {tab === "pending" && (
                        <TableCell>
                          <Box
                            display={"flex"}
                            alignItems={"center"}
                            justifyContent={"space-evenly"}
                            width={"250px"}
                          >
                            <Button
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleIcon />}
                              // onClick={() => changeReviewStatus("approved", item?._id)}
                              onClick={() =>
                                {
                                  setId(item?._id)
                                  approveReviewStatus("approved", item?._id)
                                }
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              startIcon={<CancelIcon />}
                              // onClick={() => changeReviewStatus("rejected", item?._id)}
                              onClick={() =>
                                handleOpen1("rejected", item?._id, item?.additional_comment)
                              }
                              style={{ marginLeft: "10px" }}
                            >
                              Reject
                            </Button>
                          </Box>
                        </TableCell>
                      )}
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
      </Box>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </>
  );
};

export default Reviews;
