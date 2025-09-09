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
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
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
  "Customer ID No.",
  "Customer Name",
  "Address",
  "City",
  "State",
  "Pincode",
  "Country",
  "Phone No.",
  "Email ID",
  "No. Of Orders",
  "Total Amount Of Orders",
  "Total Amount Of Refunds"
];

const label = { inputProps: { "aria-label": "Switch demo" } };

const CustomerReport = () => {
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
    JSON.parse(localStorage.getItem(localStorageKey.CustomerReportTable)) || []
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
    localStorage.setItem(localStorageKey.CustomerReportTable, JSON.stringify(setPerson));
    if (setPerson.length <= 0) {
      localStorage.removeItem(localStorageKey.CustomerReportTable);
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
        `${apiEndpoints.getCustomerReport}?startDate=${date.from}&endDate=${date.to}&wiseType=${date?.groupBy}`,
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
            "Date":e?.date,
            "Customer ID No.": e?.customer_id,
            "Customer Name": e?.customer_name,
            "Address":e?.address,
            "City":e?.cityname,
            "State":e?.statename,
            "Pincode":e?.pincode,
            "Country":e?.countryname,
            "Phone No.":e?.phone,
            "Email ID":e?.email,
            "No. Of Orders":e?.totalOrders,
            "Total Amount Of Orders":e?.totalOrderAmount,
            "Total Amount Of Refunds":e?.totalRefundAmount
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
          routeSegments={[{ name: "Business Report", path: "" }, { name: "Customer Report" }]}
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
                {!personName?.includes("Customer ID No.") && (
                  <TableCell sortDirection={orderBy === "customerId" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "customerId"}
                      direction={orderBy === "customerId" ? order : "asc"}
                      onClick={() => handleRequestSort("customerId")}
                    >
                      Customer ID No.
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Customer Name") && (
                  <TableCell sortDirection={orderBy === "customer_name" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "customer_name"}
                      direction={orderBy === "customer_name" ? order : "asc"}
                      onClick={() => handleRequestSort("customer_name")}
                    >
                      Customer Name
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Address") && (
                  <TableCell sortDirection={orderBy === "address" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "address"}
                      direction={orderBy === "address" ? order : "asc"}
                      onClick={() => handleRequestSort("address")}
                    >
                      Address
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("City") && (
                  <TableCell sortDirection={orderBy === "cityname" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "cityname"}
                      direction={orderBy === "cityname" ? order : "asc"}
                      onClick={() => handleRequestSort("cityname")}
                    >
                      City
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("State") && (
                  <TableCell sortDirection={orderBy === "statename" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "statename"}
                      direction={orderBy === "statename" ? order : "asc"}
                      onClick={() => handleRequestSort("statename")}
                    >
                      State
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Pincode") && (
                  <TableCell sortDirection={orderBy === "pincode" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "pincode"}
                      direction={orderBy === "pincode" ? order : "asc"}
                      onClick={() => handleRequestSort("pincode")}
                    >
                      Pincode
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Country") && (
                  <TableCell sortDirection={orderBy === "countryname" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "countryname"}
                      direction={orderBy === "countryname" ? order : "asc"}
                      onClick={() => handleRequestSort("countryname")}
                    >
                      Country
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Phone No.") && (
                  <TableCell sortDirection={orderBy === "phone" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "phone"}
                      direction={orderBy === "phone" ? order : "asc"}
                      onClick={() => handleRequestSort("phone")}
                    >
                      Phone No.
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Email ID") && (
                  <TableCell sortDirection={orderBy === "email" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "email"}
                      direction={orderBy === "email" ? order : "asc"}
                      onClick={() => handleRequestSort("email")}
                    >
                      Email ID
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("No. Of Orders") && (
                  <TableCell sortDirection={orderBy === "totalOrders" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "totalOrders"}
                      direction={orderBy === "totalOrders" ? order : "asc"}
                      onClick={() => handleRequestSort("totalOrders")}
                    >
                      No. Of Orders
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Total Amount Of Orders") && (
                  <TableCell sortDirection={orderBy === "totalOrderAmount" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "totalOrderAmount"}
                      direction={orderBy === "totalOrderAmount" ? order : "asc"}
                      onClick={() => handleRequestSort("totalOrderAmount")}
                    >
                      Total Amount Of Orders
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Total Amount Of Refunds") && (
                  <TableCell sortDirection={orderBy === "totalRefundAmount" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "totalRefundAmount"}
                      direction={orderBy === "totalRefundAmount" ? order : "asc"}
                      onClick={() => handleRequestSort("totalRefundAmount")}
                    >
                      Total Amount Of Refunds
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
                      {!personName?.includes("Customer ID No.") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>{row.customerId}</TableCell>
                      )}
                      {!personName?.includes("Customer Name") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>{row.customer_name}</TableCell>
                      )}
                      {!personName?.includes("Address") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>{row.address}</TableCell>
                      )}
                      {!personName?.includes("City") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>{row.cityname}</TableCell>
                      )}
                      {!personName?.includes("State") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>{row.statename}</TableCell>
                      )}
                      {!personName?.includes("Pincode") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>{row.pincode}</TableCell>
                      )}
                      {!personName?.includes("Country") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>{row.countryname}</TableCell>
                      )}
                      {!personName?.includes("Phone No.") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>{row.phone}</TableCell>
                      )}
                      {!personName?.includes("Email ID") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>{row.email}</TableCell>
                      )}
                      {!personName?.includes("No. Of Orders") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>{row.totalOrders}</TableCell>
                      )}
                      {!personName?.includes("Total Amount Of Orders") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>{row?.totalOrderAmount?.toFixed(2)}</TableCell>
                      )}
                      {!personName?.includes("Total Amount Of Refunds") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>{row?.totalRefundAmount?.toFixed(2)}</TableCell>
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

export default CustomerReport;
