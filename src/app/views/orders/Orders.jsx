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
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useCallback } from "react";
import { localStorageKey } from "app/constant/localStorageKey";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { useNavigate } from "react-router-dom";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { useEffect } from "react";
import { dateRange, completedStatus, newest } from "app/data/Index";
import ConfirmModal from "app/components/ConfirmModal";
import { CircularProgress, FormControl, InputLabel, Menu, Pagination, Select } from "@mui/material";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Dialog from "@mui/material/Dialog";
import { toast } from "react-toastify";
import OrderItem from "./OrderItem";
import { REACT_APP_WEB_URL } from "config";

const Search = styled("span")(({ theme }) => ({
  position: "relative",
  borderRadius: "4px 0px 0 4px",
  border: "1px solid #000",
  height: "35px",
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto"
  }
}));

const Orders = () => {
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [orders, setOrders] = useState([]);
  const [baseUrl, setBaseUrl] = useState("");
  const [date, setDate] = useState({
    range: "",
    from: "",
    to: ""
  });
  const [sortBy, setSortBy] = useState("newest");
  const [completeStatus, setCompleteStatus] = useState("all");
  const [orderIds, setOrderIds] = useState([]);
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [tab, setTab] = useState("new");
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [openMenuIndex1, setOpenMenuIndex1] = useState(null);
  const [openMenuIndex2, setOpenMenuIndex2] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorEl1, setAnchorEl1] = useState(null);
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [anchorEl3, setAnchorEl3] = useState(null);
  const [openPop, setOpenPop] = useState(false);
  const [productData, setProductData] = useState({});
  const [stock, setStock] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search,setSearch] = useState("");
  console.log(stock,search, "-----------stock");
  console.log(productData, "--------------productdata");
  const openOption1 = Boolean(anchorEl1);
  const openOption2 = Boolean(anchorEl2);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize,setPageSize] = useState(25);

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

  const handleCloseOption = () => {
    setAnchorEl(null);
    setOpenMenuIndex(null);
  };

  const handleCloseOption1 = () => {
    setAnchorEl3(null);
    setOpenMenuIndex2(null);
  };

  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };
  const navigate = useNavigate();

  // const handleOpen = () => setOpen(true);

  console.log({ orders });
  console.log({ date });
  console.log({ orderIds });

  const handleChange = (event, newValue) => {
    setTab(newValue);
    setOrderIds([]);
    setIsAllChecked(false);
    setAnchorEl2(null);
  };

  const getOrderList = useCallback(async () => {
    try {
      setLoading(true);
      setOrders([]);
      const res = await ApiService.get(
        `${apiEndpoints.getOrders}/${tab}?startDate=${date?.from === undefined ? "" : date?.from
        }&endDate=${date?.to === undefined ? "" : date?.to}&search=${search}&sort=${sortBy}${tab === "completed" ? `&delivery=${completeStatus}` : ""
        }&page=${page}&limit=${pageSize}`,
        auth_key
      );
      if (res?.status == 200) {
        setLoading(false);
        setBaseUrl(res?.data?.base_url);
        setOrders(res?.data?.sales);
        setTotalPages(res?.data?.pagination?.totalPages || 1)
      }
    } catch (error) {
      setLoading(false);
      handleOpen("error", error);
    }
  }, [auth_key, tab, date, sortBy, completeStatus,search,page,pageSize]);

  useEffect(() => {
    getOrderList();
  }, [tab, date, sortBy, completeStatus,page,pageSize]);

  const updateOrder = async (id, orderStatus) => {
    try {
      const payload = {
        _id: id === "action" ? orderIds : [id],
        order_status: orderStatus
      };
      console.log({ payload });
      const res = await ApiService.post(apiEndpoints.updateOrder, payload, auth_key);
      if (res?.status === 200) {
        console.log("res------", res);
        getOrderList();
        setOrderIds([]);
        setIsAllChecked(false);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  const handleDateRange = (option) => {
    const today = new Date();
    let fromDate = new Date();

    const returnDate = (dayAgo) => {
      fromDate.setDate(today.getDate() - dayAgo);
      return setDate({
        from: fromDate.toISOString().split("T")[0],
        to: today.toISOString().split("T")[0]
      });
    };

    if (option === "Today") {
      returnDate(0);
    } else if (option === "Last day") {
      returnDate(1);
    } else if (option === "Last 3 days") {
      returnDate(3);
    } else if (option === "Last 7 days") {
      returnDate(7);
    } else if (option === "Last 14 days") {
      returnDate(14);
    } else if (option === "Last 30 days") {
      returnDate(30);
    } else if (option === "Last 90 days") {
      returnDate(90);
    } else if (option === "Last 180 days") {
      returnDate(180);
    } else if (option === "Last 365 days") {
      returnDate(365);
    } else {
      setDate((prev) => ({
        range: option
      }));
    }
  };

  const handleMasterCheckboxChange = () => {
    setIsAllChecked(!isAllChecked);
    if (!isAllChecked) {
      const allIds = orders?.flatMap((items) => items?.sales?.map((item) => item._id));
      setOrderIds(allIds);
    } else {
      setOrderIds([]);
    }
  };

  const orderLength = orders?.reduce((total, order) => {
    return total + (order?.sales?.length || 0);
  }, 0);

  const handleOrderSlip = async () => {
    if (orderIds.length > 0) {
      const queryParams = orderIds.map(id => `id=${id}`).join('&');
      const url = `${ROUTE_CONSTANT.orders.orderSlip}?${queryParams}`;
      window.open(url, '_blank');
    }
  };

  const popClose = () => {
    setOpenPop(false);
  };

  const updateQty = async () => {
    try {
      const payload = {
        _id: productData?.productMain?._id,
        qty: stock,
        isCombination: productData?.isCombination,
        combinationData: productData?.variant_attribute_id
      };
      const res = await ApiService.post(apiEndpoints.updateProductQuantity, payload, auth_key);
      if (res?.status === 200) {
        popClose();
        getOrderList();
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  console.log(orders, "hhlsoolgllfl");
  return (
    <>
      <Box sx={{ padding: "30px", background: "#fff" }}>
        <Grid container width={"100%"} m={0} spacing={2} alignItems={"center"}>
          <Grid lg={6} md={6} xs={6}>
            <Typography variant="h5" fontWeight={600}>
              Orders
            </Typography>
          </Grid>
          <Grid lg={6} md={6} xs={6}>
            <Box sx={{ display: "flex", alignItems: "centre", justifyContent: "end" }}>
              <Search>
                <InputBase
                  placeholder="Search all orders..."
                  inputProps={{ "aria-label": "search" }}
                  value={search}
                  onChange = {(e)=>{setSearch(e.target.value)}}
                  sx={{
                    paddingLeft: "15px",
                    height: "35px",
                    border: "none",
                    "& input": {
                      height: "35px"
                    }
                  }}
                />
              </Search>
              <Typography component="span">
                <Button
                  variant="contained"
                  sx={{
                    whiteSpace: "nowrap",
                    borderRadius: "0 4px 4px 0",
                    background: "#000",
                    color: "#fff",
                    height: "35px",
                    "&:hover": {
                      background: "#363636"
                    }
                  }}
                  onClick={getOrderList}
                >
                  {" "}
                  <SearchIcon />
                </Button>
              </Typography>
            </Box>
          </Grid>
        </Grid>
        <Grid container width={"100%"} m={0} pt={4} spacing={2}>
          <Grid lg={12} md={12} xs={12}>
            <Box>
              <TabContext value={tab}>
                <Box>
                  <TabList
                    onChange={handleChange}
                    aria-label="lab API tabs example"
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab label={`Pending ${tab === "new" ? orderLength : ""}`} value="new" />
                    <Tab
                      label={`Unshipped ${tab === "unshipped" ? orderLength : ""}`}
                      value="unshipped"
                    />
                    <Tab
                      label={`In Progress ${tab === "in-progress" ? orderLength : ""}`}
                      value="in-progress"
                    />
                    <Tab
                      label={`Completed ${tab === "completed" ? orderLength : ""}`}
                      value="completed"
                    />
                    <Tab
                      label={`Hold for Cancel ${tab === "cancelled" ? orderLength : ""}`}
                      value="cancelled"
                    />
                  </TabList>
                </Box>
                <TabPanel value={tab} sx={{ padding: "24px 0" }}>
                  <Box>
                    <List
                      sx={{
                        padding: "0",
                        display: {
                          lg: "flex",
                          md: "flex",
                          xs: "block"
                        },
                        alignItems: "center",
                        justifyContent: "end"
                      }}
                    >
                      {date.range === "Custom Date Range" && (
                        <ListItem sx={{ paddingLeft: "0", width: "auto" }}>
                          <Typography
                            component="div"
                            sx={{
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            <Typography
                              component="div"
                              mr={2}
                              sx={{
                                display: {
                                  lg: "flex",
                                  md: "flex",
                                  xs: "block"
                                },
                                alignItems: "center"
                              }}
                            >
                              <Typography pr={1}>From:</Typography>
                              <TextField
                                type="date"
                                onChange={(e) =>
                                  setDate((prev) => ({ ...prev, from: e.target.value }))
                                }
                                sx={{
                                  ".MuiInputBase-root": {
                                    height: "36px"
                                  }
                                }}
                              />
                            </Typography>
                            <Typography
                              component="div"
                              mr={2}
                              sx={{
                                display: {
                                  lg: "flex",
                                  md: "flex",
                                  xs: "block"
                                },
                                alignItems: "center"
                              }}
                            >
                              <Typography pr={1}>To:</Typography>
                              <TextField
                                type="date"
                                onChange={(e) =>
                                  setDate((prev) => ({ ...prev, to: e.target.value }))
                                }
                                sx={{
                                  ".MuiInputBase-root": {
                                    height: "36px"
                                  }
                                }}
                              />
                            </Typography>
                          </Typography>
                        </ListItem>
                      )}
                      <ListItem sx={{ paddingLeft: "0", width: "auto" }}>
                        <Typography component="div">
                          <TextField
                            select
                            defaultValue="Select Date Range"
                            sx={{
                              ".MuiInputBase-root": {
                                height: "36px"
                              }
                            }}
                          >
                            {dateRange.map((option) => (
                              <MenuItem
                                key={option.value}
                                value={option.value}
                                // onClick={() => setDate((prev) => ({ ...prev, range: option.value }))}
                                onClick={() => handleDateRange(option.value)}
                              >
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Typography>
                      </ListItem>
                    </List>
                    <Grid container width={"100%"} m={0} spacing={2} alignItems={"center"}>
                      <Grid lg={8} md={6} xs={12}>
                        <Box>
                          <List>
                            <ListItem
                              sx={{ width: "auto", paddingLeft: "0", display: "inline-block" }}
                            >
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
                                  <Checkbox
                                    checked={isAllChecked}
                                    onChange={handleMasterCheckboxChange}
                                  />
                                </Typography>
                                <Typography pr={1}>{orderIds?.length}</Typography>

                                <Typography component="div" textAlign={"start"}>
                                  {/* <TextField
                                    select
                                    defaultValue="Action"
                                    sx={{
                                      ".MuiSelect-select": { padding: "0" },
                                      ".MuiInputBase-root": { height: "0" },
                                      ".MuiOutlinedInput-notchedOutline": { border: "none" }
                                    }}
                                  >
                                    {action.map((option) => (
                                      <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                      </MenuItem>
                                    ))}
                                  </TextField> */}
                                  <Button
                                    sx={{ color: "#000" }}
                                    id={`basic-button`}
                                    aria-controls={openOption2 ? `basic-menu` : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={openOption2 ? "true" : undefined}
                                    onClick={handleClick2}
                                  >
                                    Action <ArrowDropDownIcon />
                                  </Button>
                                  {(tab === "unshipped" || tab === "in-progress" || tab === "cancelled") && (
                                    <Menu
                                      id={`basic-menu`}
                                      anchorEl={anchorEl2}
                                      open={openOption2}
                                      onClose={() => setAnchorEl2(null)}
                                      MenuListProps={{
                                        "aria-labelledby": `basic-button`
                                      }}
                                    >
                                      {(tab === "unshipped" || tab === "cancelled") && (
                                        <MenuItem
                                          onClick={() => {
                                            updateOrder("action", "in-progress");
                                            setAnchorEl2(null);
                                          }}
                                        >
                                          <HourglassEmptyIcon
                                            fontSize="small"
                                            style={{ marginRight: 8 }}
                                          />
                                          In Progress
                                        </MenuItem>
                                      )}
                                      {(tab === "unshipped" || tab === "in-progress") && (
                                        <MenuItem
                                          onClick={() => {
                                            updateOrder("action", "cancelled");
                                            setAnchorEl2(null);
                                          }}
                                        >
                                          <CloseIcon fontSize="small" style={{ marginRight: 8 }} />
                                          Hold
                                        </MenuItem>
                                      )}
                                      {(tab === "cancelled") && (
                                        <MenuItem
                                          onClick={() => {
                                            updateOrder("action", "unshipped");
                                            setAnchorEl2(null);
                                          }}
                                        >
                                          Unshipped
                                        </MenuItem>
                                      )}
                                      {(tab === "in-progress" || tab === "unshipped" || tab === "cancelled") && (
                                        <MenuItem
                                          onClick={() => {
                                            updateOrder("action", "completed");
                                            setAnchorEl2(null);
                                          }}
                                        >
                                          Complete Order
                                        </MenuItem>
                                      )}
                                    </Menu>
                                  )}
                                </Typography>
                              </Box>
                            </ListItem>
                            {tab !== "new" && (
                              <ListItem
                                sx={{ width: "auto", paddingLeft: "0", display: "inline-block" }}
                              >
                                <Button
                                  // component="a"
                                  // href={`/adminpanel${ROUTE_CONSTANT.orders.orderSlip}`}
                                  // target="_blank"
                                  // rel="noopener noreferrer"
                                  onClick={handleOrderSlip}
                                  sx={{
                                    color: "#000",
                                    border: "1px solid #c8c8c8",
                                    borderRadius: "8px",
                                    padding: "4px 16px",
                                    background: "#fff",
                                    textDecoration: "none"
                                  }}
                                >
                                  Print Order Slip
                                </Button>
                              </ListItem>
                            )}
                            <ListItem
                              sx={{ width: "auto", paddingLeft: "0", display: "inline-block" }}
                            >
                              <Button
                                sx={{
                                  color: "#000",
                                  border: "1px solid #c8c8c8",
                                  borderRadius: "8px",
                                  padding: "4px 16px",
                                  background: "#fff"
                                }}
                                onClick={() => handleOpen("order")}
                              >
                                Product Detail Slip
                              </Button>
                            </ListItem>
                          </List>
                        </Box>
                      </Grid>
                      <Grid lg={4} md={6} xs={12}>
                        <Box>
                          <List
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: { lg: "end", md: "end", xs: "start" }
                            }}
                          >
                            <ListItem
                              sx={{ width: "auto", paddingLeft: "0", display: "inline-block" }}
                            >
                              <Typography component="div">
                                <TextField
                                  select
                                  defaultValue="newest"
                                  sx={{
                                    ".MuiInputBase-root": { height: "36px" },
                                    ".MuiOutlinedInput-notchedOutline": { borderRadius: "8px" }
                                  }}
                                  onChange={(e) => setSortBy(e.target.value)}
                                >
                                  {newest.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Typography>
                            </ListItem>
                            {tab === "completed" && (
                              <ListItem
                                sx={{ width: "auto", paddingLeft: "0", display: "inline-block" }}
                              >
                                <Typography component="div">
                                  <TextField
                                    select
                                    defaultValue={completeStatus}
                                    sx={{
                                      ".MuiInputBase-root": { height: "36px" },
                                      ".MuiOutlinedInput-notchedOutline": { borderRadius: "8px" }
                                    }}
                                    onChange={(e) => setCompleteStatus(e.target.value)}
                                  >
                                    {completedStatus.map((option) => (
                                      <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                </Typography>
                              </ListItem>
                            )}
                          </List>
                        </Box>
                      </Grid>
                    </Grid>
                    {
                      loading ? (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                flexDirection: "column",
                                padding: "48px",
                                height: "100vh",
                            }}
                          >
                          <CircularProgress size={20} />
                        </Box>
                      ):(
                        <>
                          {orders.length > 0 ? (
                            orders.map((items, i) => (
                              <OrderItem
                                key={i}
                                items={items}
                                getOrderList={getOrderList}
                                setProductData={setProductData}
                                setOpenPop={setOpenPop}
                                tab={tab}
                                openMenuIndex2={openMenuIndex2}
                                setOpenMenuIndex2={setOpenMenuIndex2}
                                setOrderIds={setOrderIds}
                                handleOpen={handleOpen}
                                anchorEl={anchorEl}
                                setAnchorEl={setAnchorEl}
                                anchorEl1={anchorEl1}
                                setAnchorEl1={setAnchorEl1}
                                anchorEl3={anchorEl3}
                                setAnchorEl3={setAnchorEl3}
                                openMenuIndex={openMenuIndex}
                                setOpenMenuIndex={setOpenMenuIndex}
                                openMenuIndex1={openMenuIndex1}
                                setOpenMenuIndex1={setOpenMenuIndex1}
                                baseUrl={baseUrl}
                                orderIds={orderIds}
                                handleCloseOption={handleCloseOption}
                                handleCloseOption1={handleCloseOption1}
                                updateOrder={updateOrder}
                              />
                            ))
                          ) : (
                            <Typography variant="h6" textAlign="center" my="3">
                              No orders
                            </Typography>
                          )}
                        </>
                      )
                    }
                    <Box mt={4} display="flex" justifyContent="center" alignItems="center" position="relative">
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        variant="outlined"
                        shape="rounded"
                      />
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        position="absolute"
                        right={0}
                      >
                        <Typography variant="body2">Rows per page:</Typography>
                        <Select
                          value={pageSize}
                          size="small"
                          onChange={(e) => setPageSize(Number(e.target.value))}
                          sx={{ minWidth: 60 }}
                        >
                          {[25, 50, 75, 100].map((size) => (
                            <MenuItem key={size} value={size}>
                              {size}
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>
                    </Box>

                  </Box>
                </TabPanel>
              </TabContext>
            </Box>
          </Grid>
          {/* <Grid lg={2} md={2} xs={12}>
            <Typography component="div" sx={{ display: 'flex', justifyContent: 'end' }}>
              <Button sx={{ border: '2px solid gray', color: '#000', borderRadius: '30px', padding: '5px 18px' }}>Upload Tracking</Button>
            </Typography>
          </Grid> */}
        </Grid>
      </Box>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />

      {/* review popup */}
      <Dialog open={openPop} onClose={popClose} sx={{ "& .MuiPaper-root": { maxWidth: "750px" } }}>
        {productData?.productMain && (
          <Box p={2} sx={{ position: "relative" }}>
            <Typography variant="h4">You are about to Update 1 Listing</Typography>
            <Box mt={2} sx={{ display: { lg: "flex", md: "flex", xs: "block" } }}>
              {productData?.productMain?.image?.length > 0 && (
                <Typography component="div">
                  <img
                    src={`${REACT_APP_WEB_URL}/backend/uploads/product/${productData?.productMain?.image[0]}`}
                    style={{
                      height: "200px",
                      width: "200px",
                      objectFit: "cover",
                      aspectRatio: "1/1"
                    }}
                    alt="Product"
                  />
                </Typography>
              )}
              <Typography component="div" sx={{ paddingLeft: { lg: 2, md: 2, xs: 0 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: "3",
                    WebkitBoxOrient: "vertical",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    fontWeight: "500",
                    fontSize: "17px",
                    maxWidth: { xs: "100%", md: "400px" }
                  }}
                >
                  {productData?.productMain?.product_title?.replace(/<\/?[^>]+(>|$)/g, "")}
                </Typography>
                <Typography fontSize={16} sx={{ color: "#000" }}>
                  Quantity:{" "}
                  {/* <Typography component="span">
                  {saleData?.qty}
                </Typography> */}
                </Typography>
                <Typography fontSize={16} sx={{ color: "#000" }}>
                  SKU: <Typography component="span">4 inch Red 6 Kon</Typography>
                </Typography>
                <Typography fontSize={16} sx={{ color: "#000" }}>
                  Style: <Typography component="span">Chillum with stopper</Typography>
                </Typography>
                {productData?.isCombination === true &&
                  productData?.variantData?.map((variantItem, variantIndex) => (
                    <Typography fontSize={16} sx={{ color: "#000" }} key={variantIndex}>
                      {variantItem?.variant_name}:{" "}
                      <Typography component="span">
                        {productData?.variantAttributeData[variantIndex]?.attribute_value}
                      </Typography>
                    </Typography>
                  ))}
                <Typography fontSize={16} sx={{ color: "#000" }}>
                  Personalization:{" "}
                  <Typography component="span">Not requested on this item</Typography>
                </Typography>
                <Box mt={2}>
                  <Typography component="div" sx={{ display: "flex", alignItems: "center" }}>
                    <Typography component="span" fontSize={14} fontWeight={500} pr={2}>
                      Stock:
                    </Typography>
                    <TextField
                      type="number"
                      value={stock}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value >= 0) {
                          setStock(value);
                        }
                      }}
                    />
                  </Typography>
                </Box>
                <Typography
                  mt={2}
                  component="div"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%"
                  }}
                >
                  <Button
                    sx={{ color: "#000", borderRadius: "30px", padding: "4px 30px" }}
                    onClick={popClose}
                  >
                    Update later
                  </Button>
                  <Button
                    sx={{
                      background: "#000",
                      color: "#fff",
                      borderRadius: "30px",
                      padding: "4px 30px",
                      "&:hover": { background: "#2e2e2e" }
                    }}
                    onClick={updateQty}
                  >
                    Update
                  </Button>
                </Typography>
              </Typography>
            </Box>
            <Button
              onClick={popClose}
              sx={{
                padding: "0px",
                minWidth: "auto",
                background: "none !important",
                color: "#000",
                border: "none",
                position: "absolute",
                top: "10px",
                right: "10px"
              }}
            >
              <CloseIcon />
            </Button>
          </Box>
        )}
      </Dialog>
    </>
  );
};

export default Orders;
