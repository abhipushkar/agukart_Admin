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

const names = ["Promotional Title","Offer Type", "Discount Amount","Promotion Type","Qty/Amount", "Start Date", "Expiry Date"];

const label = { inputProps: { "aria-label": "Switch demo" } };

const List = () => {
  const [promotionalOfferList, setPromotionalOfferList] = useState([]);
  console.log(promotionalOfferList, "promotionalOfferList");
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
    JSON.parse(localStorage.getItem(localStorageKey.promotionalOfferTable)) || []
  );
  const [promotionalOfferId, setPromotionalOfferId] = useState("");


  const navigate = useNavigate();
  const auth_key = localStorage.getItem(localStorageKey.auth_key);

  const handleChange = (event) => {
    const {
      target: { value }
    } = event;
    const setPerson = typeof value === "string" ? value.split(",") : value;
    setPersonName(setPerson);
    localStorage.setItem(localStorageKey.promotionalOfferTable, JSON.stringify(setPerson));
    if (setPerson.length <= 0) {
      localStorage.removeItem(localStorageKey.promotionalOfferTable);
    }
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

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

  const getPromotionalOfferList = useCallback(async () => {
    try {
      const res = await ApiService.get(apiEndpoints.getPromotionalOffers, auth_key);

      if (res.status === 200) {
        console.log({ res });
        const myNewList = res?.data?.promotions.map((e, i) => {
          return { "S.No": i + 1, ...e };
        });

        const xData = myNewList.map((e, i) => {
          let obj = {
            "S.NO": i + 1,
            "promotional title": e?.promotional_title,
            "offer type": e?.offer_type,
            "discount amount": e?.discount_amount,
            "promotion type": e?.promotion_type,
            "qty/amount": e?.qty || e?.amount,
            "start date": e?.start_date,
            "expiry date": e?.expiry_date,
            "status": e?.status ? "Active" : "In Active"
          };
          return obj;
        });
        setExcelData(xData);
        setSearchList(myNewList);
        setPromotionalOfferList(myNewList);
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
        const res = await ApiService.post(apiEndpoints.changeStatusPromotionalOffer, payload, auth_key);
        if (res.status === 200) {
          getPromotionalOfferList();
        }
      } catch (error) {
        handleOpen("error", error?.response?.data || error);
      }
    }
  }, [auth_key, getPromotionalOfferList, statusData]);

  const Container = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
      marginBottom: "30px",
      [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
    }
  }));

  const paginatedpromotionalOfferList = useMemo(() => {
    return rowsPerPage > 0
      ? promotionalOfferList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : promotionalOfferList;
  }, [promotionalOfferList, page, rowsPerPage]);

  const filterHandler = () => {
    const filteredItems = SearchList.filter((item) =>
      item.offer_type.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => {
      const aIndex = a.offer_type.toLowerCase().indexOf(search.toLowerCase());
      const bIndex = b.offer_type.toLowerCase().indexOf(search.toLowerCase());
      return aIndex - bIndex || a.offer_type.localeCompare(b.offer_type);
    });
    const filteredItemsWithSNo = filteredItems.map((item, index) => {
      return { ...item, "S.No": index + 1 };
    });
    setPromotionalOfferList(filteredItemsWithSNo);
  };

  const asyncFilter = async () => {
    await getPromotionalOfferList();
    await filterHandler();
  };

  useEffect(() => {
    if (search) {
      asyncFilter();
    } else {
      getPromotionalOfferList();
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
    if (promotionalOfferId) {
      try {
        const id = promotionalOfferId;
        const res = await ApiService.get(`${apiEndpoints.deletePromotionalOffer}/${id}`, auth_key);
        if (res.status === 200) {
          getPromotionalOfferList();
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  }, [auth_key, promotionalOfferId, getPromotionalOfferList]);

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
    ? [...paginatedpromotionalOfferList].sort((a, b) =>
      order === "asc"
        ? sortComparator(a, b, orderBy)
        : order === "desc"
          ? sortComparator(b, a, orderBy)
          : 0
    )
    : paginatedpromotionalOfferList;

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
        <Breadcrumb routeSegments={[{ name: "Catalog", path: "" }, { name: "Promotional Offer" }]} />
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
          {/* <Box>
            <TextField
              size="small"
              type="text"
              label="Search"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
          </Box> */}
          <Button onClick={() => navigate(ROUTE_CONSTANT.catalog.promotionalOffer.add)} variant="contained" sx={{ whiteSpace: "nowrap", width: "180px", minWidth: "120px" }}>
            Add Promotional Offer
          </Button>

          <Button onClick={() => exportToExcel(excelData)} variant="contained" sx={{ whiteSpace: "nowrap", width: "180px", minWidth: "120px" }}>
            Export Promotional Offers
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
                {!personName?.includes("Promotional Title") && (
                  <TableCell sortDirection={orderBy === "promotional_title" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "promotional_title"}
                      direction={orderBy === "promotional_title" ? order : "asc"}
                      onClick={() => handleRequestSort("promotional_title")}
                    >
                      Promotional Title
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Offer Type") && (
                  <TableCell sortDirection={orderBy === "offer_type" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "offer_type"}
                      direction={orderBy === "offer_type" ? order : "asc"}
                      onClick={() => handleRequestSort("offer_type")}
                    >
                      Offer Type
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Discount Amount") && (
                  <TableCell sortDirection={orderBy === "discount_type" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "discount_type"}
                      direction={orderBy === "discount_type" ? order : "asc"}
                      onClick={() => handleRequestSort("discount_type")}
                    >
                      Discount Amount
                    </TableSortLabel>
                  </TableCell>
                )}
                 {!personName?.includes("Promotion Type") && (
                  <TableCell sortDirection={orderBy === "promotion_type" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "promotion_type"}
                      direction={orderBy === "promotion_type" ? order : "asc"}
                      onClick={() => handleRequestSort("promotion_type")}
                    >
                      Promotion Type
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Qty/Amount") && (
                  <TableCell sortDirection={orderBy === "qty" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "qty"}
                      direction={orderBy === "qty" ? order : "asc"}
                      onClick={() => handleRequestSort("qty")}
                    >
                      Qty/Amount
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Start Date") && (
                  <TableCell sortDirection={orderBy === "start_date" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "start_date"}
                      direction={orderBy === "start_date" ? order : "asc"}
                      onClick={() => handleRequestSort("start_date")}
                    >
                      Start Date
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Expiry Date") && (
                  <TableCell sortDirection={orderBy === "expiry_date" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "expiry_date"}
                      direction={orderBy === "expiry_date" ? order : "asc"}
                      onClick={() => handleRequestSort("expiry_date")}
                    >
                      Expiry
                    </TableSortLabel>
                  </TableCell>
                )}
                <TableCell sortDirection={orderBy === "promotional_status" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "promotional_status"}
                    direction={orderBy === "promotional_status" ? order : "asc"}
                    onClick={() => handleRequestSort("promotional_status")}
                  >
                    Promotional Status
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === "status" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "status"}
                    direction={orderBy === "status" ? order : "asc"}
                    onClick={() => handleRequestSort("status")}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                sortedRows.length > 0 ? (
                  sortedRows.map((row, i) => {
                    return (
                      <TableRow key={row._id}>
                        <TableCell>{row["S.No"]}</TableCell>
                        {!personName?.includes("Promotional Title") && (
                          <TableCell sx={{ wordBreak: "break-word" }}>{capitalizeFirstLetter(row.promotional_title|| "demo")}</TableCell>
                        )}
                        {!personName?.includes("Offer Type") && (
                          <TableCell sx={{ wordBreak: "break-word" }}>{capitalizeFirstLetter(row.offer_type)}</TableCell>
                        )}
                        {!personName?.includes("Discount Amount") && <TableCell>{row.discount_amount}</TableCell>}
                        {!personName?.includes("Promotion Type") && <TableCell>{capitalizeFirstLetter(row.promotion_type)}</TableCell>}
                        {!personName?.includes("Qty/Amount") && <TableCell>{row.qty != null ? row.qty: row.offer_amount}</TableCell>}
                        {!personName?.includes("Start Date") && <TableCell>{row.start_date}</TableCell>}
                        {!personName?.includes("Expiry Date") && <TableCell>{row.expiry_date}</TableCell>}
                        <TableCell>{capitalizeFirstLetter(row.expiry_status || "")}</TableCell>
                        <TableCell>
                          <Switch
                            onClick={() => {
                              handleOpen("promotionalOfferStatus");
                              setStatusData(() => ({ id: row._id, status: !row.status }));
                            }}
                            // onChange={(e) => handleStatusChange({ id: row._id, status: !row.status })}
                            checked={row.status}
                            {...label}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => {
                            handleOpen("promotionalOfferDelete");
                            setPromotionalOfferId(row?._id);
                          }}>
                            <Icon sx={{ color: "#DC3545" }}>delete</Icon>
                          </IconButton>
                          <IconButton
                            onClick={() =>
                              navigate(`${ROUTE_CONSTANT.catalog.promotionalOffer.add}?id=${row._id}`)
                            }
                          >
                            <Icon color="primary">edit</Icon>
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} sx={{ textAlign: "center" }}>
                      No data found
                    </TableCell>
                  </TableRow>
                )
              }
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[25, 50, 75, 100]}
          component="div"
          count={promotionalOfferList.length}
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

export default List;
