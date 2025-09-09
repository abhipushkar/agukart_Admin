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
  MenuItem
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

const names = ["Product Name", "Report Type"];

const label = { inputProps: { "aria-label": "Switch demo" } };

const ProductReport = () => {
  const [reportList, setReportList] = useState([]);
  const [productBaseUrl,setProductBaseUrl] = useState("");
  console.log(productBaseUrl, "productBaseUrl");
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
    JSON.parse(localStorage.getItem(localStorageKey.productReport)) || []
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
    localStorage.setItem(localStorageKey.productReport, JSON.stringify(setPerson));
    if (setPerson.length <= 0) {
      localStorage.removeItem(localStorageKey.productReport);
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
      const res = await ApiService.get(apiEndpoints.getProductsReports, auth_key);

      if (res.status === 200) {
        console.log({ res });
        const myNewList = res?.data?.productReport?.map((e, i) => {
          return { "S.No": i + 1, ...e };
        });
        setProductBaseUrl(res?.data?.productBaseUrl || "");
        const xData = myNewList.map((e, i) => {
          let obj = {
            "S.NO": i + 1,
            "Product Name": e?.productdetails?.product_title,
            "Report Type": e?.type
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
  }, [auth_key]);

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
    const filteredItems = SearchList.filter((item) =>
      item.type.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => {
      const aIndex = Math.min(a.type.toLowerCase().indexOf(search.toLowerCase()));
      const bIndex = Math.min(b.type.toLowerCase().indexOf(search.toLowerCase()));
      return aIndex - bIndex || a.type.localeCompare(b.type);
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

  function removeHTMLTags(str) {
    return str.replace(/<\/?[^>]+(>|$)/g, "");
  }
 function formatDateTimeToDDMMYYYY(dateInput) {
    const date = new Date(dateInput);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = date.getHours() % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
  }
  return (
    <Box sx={{ margin: "30px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 2
        }}
        className="breadcrumb"
      >
        <Breadcrumb routeSegments={[{ name: "Report", path: "" }, { name: "Product Report" }]} />
        <Box display={"flex"} gap={"16px"} alignItems={"center"}>
          <Box>
            <FormControl
              sx={{
                width: 300,
                "& .MuiOutlinedInput-root": {
                  height: "38px"
                },
                "& .MuiFormLabel-root": {
                  top: "-7px"
                }
              }}
            >
              <InputLabel id="demo-multiple-checkbox-label">Preference: Columns hidden</InputLabel>
              <Select
                labelId="demo-multiple-checkbox-label"
                id="demo-multiple-checkbox"
                multiple
                value={personName}
                onChange={handleChange}
                input={<OutlinedInput label="Preference: 8 columns hidden" />}
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
          </Box>
          <Box>
            <TextField
              size="small"
              type="text"
              label="Search By Report Type"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
          </Box>
          <Button
            onClick={() => exportToExcel(excelData)}
            variant="contained"
            sx={{ whiteSpace: "nowrap", width: "180px", minWidth: "120px" }}
          >
            Export Report
          </Button>
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
                {!personName?.includes("Product Name") && (
                  <TableCell sortDirection={orderBy === "product_name" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "product_name"}
                      direction={orderBy === "product_name" ? order : "asc"}
                      onClick={() => handleRequestSort("product_name")}
                    >
                      Product Name
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Shop Name") && (
                  <TableCell sortDirection={orderBy === "shop_name" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "shop_name"}
                      direction={orderBy === "shop_name" ? order : "asc"}
                      onClick={() => handleRequestSort("shop_name")}
                    >
                      Shop Name
                    </TableSortLabel>
                  </TableCell>
                )}
                 {!personName?.includes("Complainant Name") && (
                  <TableCell sortDirection={orderBy === "complainant_name" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "complainant_name"}
                      direction={orderBy === "complainant_name" ? order : "asc"}
                      onClick={() => handleRequestSort("complainant_name")}
                    >
                      Complainant Name
                    </TableSortLabel>
                  </TableCell>
                )}
                 {!personName?.includes("Email Id") && (
                  <TableCell sortDirection={orderBy === "email" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "email"}
                      direction={orderBy === "email" ? order : "asc"}
                      onClick={() => handleRequestSort("email")}
                    >
                      Email Id
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Report Id") && (
                  <TableCell sortDirection={orderBy === "report_id" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "report_id"}
                      direction={orderBy === "report_id" ? order : "asc"}
                      onClick={() => handleRequestSort("report_id")}
                    >
                      Report Id
                    </TableSortLabel>
                  </TableCell>
                )}
                 {!personName?.includes("Date") && (
                  <TableCell sortDirection={orderBy === "date" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "date"}
                      direction={orderBy === "date" ? order : "asc"}
                      onClick={() => handleRequestSort("date")}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Report Type") && (
                  <TableCell sortDirection={orderBy === "type" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "type"}
                      direction={orderBy === "type" ? order : "asc"}
                      onClick={() => handleRequestSort("type")}
                    >
                      Report Type
                    </TableSortLabel>
                  </TableCell>
                )}
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRows.length > 0 ? (
                sortedRows.map((row, i) => {
                  return (
                    <TableRow key={row._id}>
                      <TableCell>{row["S.No"]}</TableCell>
                      {!personName?.includes("Image") && (
                        <TableCell>
                          <img
                            src={`${productBaseUrl}${row?.productdetails?.image?.[0]}`}
                            alt="Product"
                            style={{ width: 60, height: "auto", objectFit: "contain" }}
                          />
                        </TableCell>
                      )}
                      {!personName?.includes("Product Name") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          {removeHTMLTags(row?.productdetails?.product_title || "")}
                        </TableCell>
                      )}
                      {!personName?.includes("Shop Name") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          {row?.vendordata?.shop_name}
                        </TableCell>
                      )}
                      {!personName?.includes("Complainant Name") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          {row?.firstName} {row?.lastName}
                        </TableCell>
                      )}
                      {!personName?.includes("Email Id") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          {row?.email}
                        </TableCell>
                      )}
                       {!personName?.includes("Report Id") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          {row?.report_id}
                        </TableCell>
                      )}
                      {!personName?.includes("Date") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          {formatDateTimeToDDMMYYYY(row?.createdAt || "")}
                        </TableCell>
                      )}
                      {!personName?.includes("Report Type") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          {capitalizeFirstLetter(
                            row?.type == "ip" ? "Intellectual Property" : "Policy"
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        <IconButton
                          onClick={() =>
                            navigate(`${ROUTE_CONSTANT.report.viewProductReport}?id=${row._id}`)
                          }
                        >
                          <Icon>visibility</Icon>
                        </IconButton>
                      </TableCell>
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

export default ProductReport;
