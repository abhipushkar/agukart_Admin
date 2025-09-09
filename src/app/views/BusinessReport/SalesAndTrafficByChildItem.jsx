import { useCallback, useMemo, useState, useEffect } from "react";

// import { matchSorter } from "match-sorter";
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Paper,
  TableSortLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormLabel,
  FormControlLabel,
  Radio,
  Avatar
} from "@mui/material";
import { Icon } from "@mui/material";
import Switch from "@mui/material/Switch";
import { useNavigate } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { ApiService } from "app/services/ApiService";
import { localStorageKey } from "app/constant/localStorageKey";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { exportToExcel } from "app/utils/excelExport";
import { Breadcrumb } from "app/components";
import styled from "@emotion/styled";
import ConfirmModal from "app/components/ConfirmModal";
import OutlinedInput from "@mui/material/OutlinedInput";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import { toast } from "react-toastify";
import { dashboardDateRange } from "app/data/Index";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

const names = [
  "Date",
  "Parent SKU",
  "Child Id",
  "Child SKU",
  "Image",
  "Title",
  "Total View Items",
  "Total Order Items",
  "Units Ordered",
  "Ordered Products Sales",
  "Amount Refunded",
  "No. Of Cancel",
  "Conversation Rate"
];

const label = { inputProps: { "aria-label": "Switch demo" } };

const SalesAndTrafficByChildItem = () => {
  const [date, setDate] = useState({
    range: "Today",
    from: new Date().toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
    groupBy: "day"
  });
  const [reportList, setReportList] = useState([]);
  console.log(reportList, "reportList");
  const [excelData, setExcelData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const [SearchList, setSearchList] = useState([]);
  const [statusData, setStatusData] = useState({});
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);
  const [personName, setPersonName] = useState(
    JSON.parse(localStorage.getItem(localStorageKey.SalesAndTrafficByChildItemReportTable)) || []
  );
  const [giftCardId, setGiftCardId] = useState("");

  const navigate = useNavigate();
  const auth_key = localStorage.getItem(localStorageKey.auth_key);

  const handleChange = (event) => {
    const {
      target: { value }
    } = event;
    const setPerson = typeof value === "string" ? value.split(",") : value;
    setPersonName(setPerson);
    localStorage.setItem(
      localStorageKey.SalesAndTrafficByChildItemReportTable,
      JSON.stringify(setPerson)
    );
    if (setPerson.length <= 0) {
      localStorage.removeItem(localStorageKey.SalesAndTrafficByChildItemReportTable);
    }
  };
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

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

  const getreportList = useCallback(async () => {
    try {
      const res = await ApiService.get(
        `${apiEndpoints.getChildItems}?startDate=${date.from}&endDate=${date.to}&wiseType=${date?.groupBy}&type=child`,
        auth_key
      );

      if (res.status === 200) {
        console.log({ res });
        const myNewList = res?.data?.data?.map((e, i) => {
          return { "S.No": i + 1, ...e };
        });

        const xData = myNewList.map((e, i) => {
          let obj = {
            "S.NO": i + 1,
            "Date": e.date,
            "Parent SKU": e.parentSKU,
            "Child Id": e.productId,
            "Child SKU": e.childSKU,
            "Image": e.image,
            "Title": e.title,
            "Total View Items": e.totalViewItems,
            "Total Order Items": e.totalOrderItems,
            "Units Ordered": e.unitsOrdered,
            "Ordered Products Sales": e.orderedProductSales,
            "Amount Refunded": e.refundedAmount,
            "No. Of Cancel": e.cancelledOrders,
            "Conversation Rate": e.conversionRate
          };
          return obj;
        });
        setExcelData(xData);
        setSearchList(myNewList);
        setReportList(myNewList);
      }
    } catch (error) {
      // handleOpen("error", error?.response?.data || error);
      console.log(error);
    }
  }, [auth_key, date]);

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleStatusChange = useCallback(async () => {
    if (statusData) {
      try {
        const payload = statusData;
        const res = await ApiService.post(apiEndpoints.changeStatusGiftCard, payload, auth_key);
        if (res.status === 200) {
          getreportList();
        }
      } catch (error) {
        handleOpen("error", error?.response?.data || error);
      }
    }
  }, [auth_key, getreportList, statusData]);

  const Container = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
      marginBottom: "30px",
      [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
    }
  }));

  const paginatedreportList = useMemo(() => {
    return rowsPerPage > 0
      ? reportList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : reportList;
  }, [reportList, page, rowsPerPage]);
  const filterHandler = () => {
    const filteredItems = SearchList.filter(
      (item) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category_title.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => {
      const aIndex = Math.min(
        a.title.toLowerCase().indexOf(search.toLowerCase()),
        a.category_title.toLowerCase().indexOf(search.toLowerCase())
      );
      const bIndex = Math.min(
        b.title.toLowerCase().indexOf(search.toLowerCase()),
        b.category_title.toLowerCase().indexOf(search.toLowerCase())
      );
      return aIndex - bIndex || a.title.localeCompare(b.title);
    });

    const filteredItemsWithSNo = filteredItems.map((item, index) => {
      return { ...item, "S.No": index + 1 };
    });
    setReportList(filteredItemsWithSNo);
  };

  const asyncFilter = async () => {
    await getreportList();
    await filterHandler();
  };

  useEffect(() => {
    if (search) {
      asyncFilter();
    } else {
      getreportList();
    }
  }, [search]);

  useEffect(() => {
    getreportList();
  }, [date]);

  const [order, setOrder] = useState("none");
  const [orderBy, setOrderBy] = useState(null);

  const handleRequestSort = (property) => {
    let newOrder;
    if (orderBy !== property) {
      newOrder = "asc";
    } else {
      newOrder = order === "asc" ? "desc" : order === "desc" ? "none" : "asc";
    }
    setOrder(newOrder);
    setOrderBy(newOrder === "none" ? null : property);
  };

  const handleDelete = useCallback(async () => {
    if (giftCardId) {
      try {
        const id = giftCardId;
        const res = await ApiService.get(`${apiEndpoints.deleteGiftCard}/${id}`, auth_key);
        if (res.status === 200) {
          getreportList();
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  }, [auth_key, giftCardId, getreportList]);

  const sortComparator = (a, b, orderBy) => {
    if (typeof a[orderBy] === "string" && typeof b[orderBy] === "string") {
      return a[orderBy].localeCompare(b[orderBy]);
    }
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };
  const sortedRows = orderBy
    ? [...paginatedreportList].sort((a, b) =>
        order === "asc"
          ? sortComparator(a, b, orderBy)
          : order === "desc"
          ? sortComparator(b, a, orderBy)
          : 0
      )
    : paginatedreportList;

  const handleDateRange = (option) => {
    const today = new Date();
    let fromDate = new Date();

    const returnDate = (range, dayAgo) => {
      fromDate.setDate(today.getDate() - dayAgo);
      return setDate((prev) => ({
        ...prev,
        range: range,
        from: fromDate.toISOString().split("T")[0],
        to: today.toISOString().split("T")[0]
      }));
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
        ...prev,
        range: option
      }));
    }
  };
  const formatDateCell = (dateStr, groupBy) => {
    if (groupBy === "day") return dateStr;

    if (groupBy === "month") {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric"
      });
    }

    if (groupBy === "week") {
      const [year, weekStr] = dateStr.split("-W"); // "2025-W23" → ["2025", "23"]
      const week = parseInt(weekStr, 10);
      const jan4 = new Date(year, 0, 4);
      const start = new Date(jan4.setDate(jan4.getDate() - jan4.getDay() + 1 + (week - 1) * 7));
      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      return `${start.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short"
      })} – ${end.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })}`;
    }

    return dateStr;
  };
  return (
    <Box sx={{ margin: "30px" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          marginBottom: 2
        }}
        className="breadcrumb"
      >
        <Breadcrumb
          routeSegments={[
            { name: "Business Report", path: "" },
            { name: "Sales And Traffic By Child Item" }
          ]}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              md: "row"
            },
            alignItems: {
              xs: "flex-start",
              md: "center"
            },
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap"
          }}
        >
          {/* Date Range Filters */}
          <Box
            sx={{
              display: "flex",
              flexDirection: {
                xs: "column",
                sm: "row"
              },
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap"
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <FormLabel component="legend">Group By</FormLabel>
              <RadioGroup
                row
                aria-label="group-by"
                name="group-by"
                value={date.groupBy}
                onChange={(e) => setDate((prev) => ({ ...prev, groupBy: e.target.value }))}
              >
                <FormControlLabel value="day" control={<Radio />} label="By Day" />
                <FormControlLabel value="week" control={<Radio />} label="By Week" />
                <FormControlLabel value="month" control={<Radio />} label="By Month" />
              </RadioGroup>
            </Box>
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
          </Box>

          {/* Right-side Actions */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap"
            }}
          >
            {/* Column Preferences */}
            <FormControl
              sx={{
                minWidth: 260,
                "& .MuiOutlinedInput-root": {
                  height: "38px"
                },
                "& .MuiFormLabel-root": {
                  top: "-7px"
                }
              }}
              size="small"
            >
              <InputLabel id="column-pref-label">Preference: Columns hidden</InputLabel>
              <Select
                labelId="column-pref-label"
                id="column-pref"
                multiple
                value={personName}
                onChange={handleChange}
                input={<OutlinedInput label="Preference: Columns hidden" />}
                renderValue={(selected) => selected.join(", ")}
                MenuProps={MenuProps}
              >
                {names.map((name) => (
                  <MenuItem key={name} value={name}>
                    <Checkbox checked={personName.indexOf(name) > -1} />
                    <ListItemText primary={name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Search Field */}
            {/* <TextField
                              size="small"
                              type="text"
                              label="Search by category, title"
                              onChange={(e) => setSearch(e.target.value)}
                              value={search}
                              sx={{ minWidth: 200 }}
                            /> */}

            {/* Export Button */}
            <Button
              onClick={() => exportToExcel(excelData)}
              variant="contained"
              sx={{
                whiteSpace: "nowrap",
                minWidth: 150,
                height: 40
              }}
            >
              Export Report
            </Button>
          </Box>
        </Box>
      </Box>

      <Box>
        <TableContainer sx={{ paddingLeft: 2, paddingRight: 2 }} component={Paper}>
          <Table
            sx={{
              width: "max-content",
              minWidth: "100%",
              ".MuiTableCell-root": {
                padding: "12px 5px"
              }
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sortDirection={orderBy === "S.No" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "S.No"}
                    direction={orderBy === "S.No" ? order : "asc"}
                    onClick={() => handleRequestSort("S.No")}
                  >
                    S.No
                  </TableSortLabel>
                </TableCell>
                {!personName?.includes("Date") && (
                  <TableCell sortDirection={orderBy === "date" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "date"}
                      direction={orderBy === "date" ? order : "asc"}
                      onClick={() => handleRequestSort("date")}
                    >
                      {date.groupBy === "day" ? "Date" : date.groupBy === "week" ? "Week" : "Month"}
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Parent SKU") && (
                  <TableCell sortDirection={orderBy === "parentSKU" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "parentSKU"}
                      direction={orderBy === "parentSKU" ? order : "asc"}
                      onClick={() => handleRequestSort("parentSKU")}
                    >
                      (Parent) SKU
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Child Id") && (
                  <TableCell sortDirection={orderBy === "productId" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "productId"}
                      direction={orderBy === "productId" ? order : "asc"}
                      onClick={() => handleRequestSort("productId")}
                    >
                      (Child) ID
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Child SKU") && (
                    <TableCell sortDirection={orderBy === "childSKU" ? order : false}>
                      <TableSortLabel
                        active={orderBy === "childSKU"}
                        direction={orderBy === "childSKU" ? order : "asc"}
                        onClick={() => handleRequestSort("childSKU")}
                      >
                        (Child) SKU
                      </TableSortLabel>
                    </TableCell>
                )}
                {!personName?.includes("Image") && (
                   <TableCell sortDirection={orderBy === "image" ? order : false}>
                      <TableSortLabel
                        active={orderBy === "image"}
                        direction={orderBy === "image" ? order : "asc"}
                        onClick={() => handleRequestSort("image")}
                      >
                        Image
                      </TableSortLabel>
                    </TableCell>
                )}
                {!personName?.includes("Title") && (
                    <TableCell sortDirection={orderBy === "title" ? order : false}>
                      <TableSortLabel
                        active={orderBy === "title"}
                        direction={orderBy === "title" ? order : "asc"}
                        onClick={() => handleRequestSort("title")}
                      >
                        Title
                      </TableSortLabel>
                    </TableCell>
                )}
                {!personName?.includes("Total View Items") && (
                  <TableCell sortDirection={orderBy === "totalViewItems" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "totalViewItems"}
                      direction={orderBy === "totalViewItems" ? order : "asc"}
                      onClick={() => handleRequestSort("totalViewItems")}
                    >
                      Total View Items
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Total Order Items") && (
                  <TableCell sortDirection={orderBy === "totalOrderItems" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "totalOrderItems"}
                      direction={orderBy === "totalOrderItems" ? order : "asc"}
                      onClick={() => handleRequestSort("totalOrderItems")}
                    >
                      Total Order Items
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Units Ordered") && (
                  <TableCell sortDirection={orderBy === "unitsOrdered" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "unitsOrdered"}
                      direction={orderBy === "unitsOrdered" ? order : "asc"}
                      onClick={() => handleRequestSort("unitsOrdered")}
                    >
                      Units Ordered
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Ordered Products Sales") && (
                  <TableCell sortDirection={orderBy === "orderedProductSales" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "orderedProductSales"}
                      direction={orderBy === "orderedProductSales" ? order : "asc"}
                      onClick={() => handleRequestSort("orderedProductSales")}
                    >
                      Ordered Products Sales
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Amount Refunded") && (
                  <TableCell sortDirection={orderBy === "refundedAmount" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "refundedAmount"}
                      direction={orderBy === "refundedAmount" ? order : "asc"}
                      onClick={() => handleRequestSort("refundedAmount")}
                    >
                      Amount Refunded
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("No. Of Cancel") && (
                  <TableCell sortDirection={orderBy === "cancelledOrders" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "cancelledOrders"}
                      direction={orderBy === "cancelledOrders" ? order : "asc"}
                      onClick={() => handleRequestSort("cancelledOrders")}
                    >
                      No. Of Cancel
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Conversation Rate") && (
                  <TableCell sortDirection={orderBy === "conversionRate" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "conversionRate"}
                      direction={orderBy === "conversionRate" ? order : "asc"}
                      onClick={() => handleRequestSort("conversionRate")}
                    >
                      Conversation Rate
                    </TableSortLabel>
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRows.length > 0 ? (
                sortedRows.map((row, i) => {
                  return (
                    <TableRow key={row._id}>
                      <TableCell>{row["S.No"]}</TableCell>
                      {!personName?.includes("Date") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>{formatDateCell(row?.date, date?.groupBy)}</TableCell>
                      )}
                      {!personName?.includes("Parent SKU") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          {row.parentSKU}
                        </TableCell>
                      )}
                      {!personName?.includes("Child Id") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          {row.productId}
                        </TableCell>
                      )} 
                      {!personName?.includes("Child SKU") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          {row.childSKU}
                        </TableCell>
                      )}
                      {!personName?.includes("Image") && (
                         <TableCell>
                          <Avatar
                            alt="image"
                            src={row.image}
                            sx={{ width: 100, height: 100, borderRadius: 2 }}
                            variant="square"
                          />
                        </TableCell>
                      )}
                      {!personName?.includes("Title") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          {row.title.replace(/<\/?[^>]+(>|$)/g, "")}
                        </TableCell>
                      )}
                      {!personName?.includes("Total Views Items") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          {row.totalViewItems}
                        </TableCell>
                      )}
                      {!personName?.includes("Total Order Items") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          {row.totalOrderItems}
                        </TableCell>
                      )}
                      {!personName?.includes("Units Ordered") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          {row.unitsOrdered}
                        </TableCell>
                      )}
                      {!personName?.includes("Ordered Products Sales") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          {row?.orderedProductSales?.toFixed(2)}
                        </TableCell>
                      )}
                      {!personName?.includes("Amount Refunded") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          {row?.refundedAmount?.toFixed(2)}
                        </TableCell>
                      )}
                      {!personName?.includes("No. Of Cancel") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          {row.cancelledOrders}
                        </TableCell>
                      )}
                      {!personName?.includes("Conversation Rate") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          {row?.conversionRate?.toFixed(2)}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: "center" }}>
                    No data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[25, 50, 75, 100]}
          component="div"
          count={reportList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
      <ConfirmModal
        open={open}
        handleClose={handleClose}
        handleDelete={handleDelete}
        type={type}
        msg={msg}
        handleStatusChange={handleStatusChange}
      />
    </Box>
  );
};

export default SalesAndTrafficByChildItem;
