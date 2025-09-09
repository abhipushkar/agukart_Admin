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

const names = ["Store Name","Sort Order"];

const label = { inputProps: { "aria-label": "Switch demo" } };

const StoreSettingList = () => {
  const [storeList, setStoreList] = useState([]);
  console.log(storeList, "storeList");
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
    JSON.parse(localStorage.getItem(localStorageKey.storeTable)) || []
  );
  const [store_id, setStoreId] = useState("");


  const navigate = useNavigate();
  const auth_key = localStorage.getItem(localStorageKey.auth_key);

  const handleChange = (event) => {
    const {
      target: { value }
    } = event;
    const setPerson = typeof value === "string" ? value.split(",") : value;
    setPersonName(setPerson);
    localStorage.setItem(localStorageKey.storeTable, JSON.stringify(setPerson));
    if (setPerson.length <= 0) {
      localStorage.removeItem(localStorageKey.storeTable);
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

  const getstoreList = useCallback(async () => {
    try {
      const res = await ApiService.get(apiEndpoints.getStores, auth_key);

      if (res.status === 200) {
        console.log({ res });
        const myNewList = res?.data?.stores.map((e, i) => {
          return { "S.No": i + 1, ...e };
        });

        const xData = myNewList.map((e, i) => {
          let obj = {
            "S.NO": i + 1,
            "Store Name": e?.store_name,
            "Sort Order": e?.sort_order,
            "status": e?.status ? "Active" : "In Active"
          };
          return obj;
        });
        setExcelData(xData);
        setSearchList(myNewList);
        setStoreList(myNewList);
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
        const res = await ApiService.post(apiEndpoints.changeStatusStore, payload, auth_key);
        if (res.status === 200) {
          getstoreList();
        }
      } catch (error) {
        handleOpen("error", error?.response?.data || error);
      }
    }
  }, [auth_key, getstoreList, statusData]);

  const Container = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
      marginBottom: "30px",
      [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
    }
  }));

  const paginatedstoreList = useMemo(() => {
    return rowsPerPage > 0
      ? storeList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : storeList;
  }, [storeList, page, rowsPerPage]);

  const filterHandler = () => {
    const filteredItems = SearchList.filter((item) =>
      item.store_name.toLowerCase().includes(search.toLowerCase()) 
    ).sort((a, b) => {
      const aIndex = Math.min(
        a.store_name.toLowerCase().indexOf(search.toLowerCase()),
      );
      const bIndex = Math.min(
        b.store_name.toLowerCase().indexOf(search.toLowerCase()),
      );
      return aIndex - bIndex || a.store_name.localeCompare(b.store_name);
    });

    const filteredItemsWithSNo = filteredItems.map((item, index) => {
      return { ...item, "S.No": index + 1 };
    });
    setStoreList(filteredItemsWithSNo);
  };


  const asyncFilter = async () => {
    await getstoreList();
    await filterHandler();
  };

  useEffect(() => {
    if (search) {
      asyncFilter();
    } else {
      getstoreList();
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
    if (store_id) {
      try {
        const id = store_id;
        const res = await ApiService.get(`${apiEndpoints.deleteStore}/${id}`, auth_key);
        if (res.status === 200) {
          getstoreList();
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  }, [auth_key, store_id, getstoreList]);

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
    ? [...paginatedstoreList].sort((a, b) =>
      order === "asc"
        ? sortComparator(a, b, orderBy)
        : order === "desc"
          ? sortComparator(b, a, orderBy)
          : 0
    )
    : paginatedstoreList;

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
        <Breadcrumb routeSegments={[{ name: "Store Settings", path: "" }]} />
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
              label="Search"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
          </Box>
          <Button onClick={() => navigate(ROUTE_CONSTANT.storeSetting.add)} variant="contained" sx={{ whiteSpace: "nowrap", width: "180px", minWidth: "120px" }}>
            Add Store
          </Button>

          <Button onClick={() => exportToExcel(excelData)} variant="contained" sx={{ whiteSpace: "nowrap", width: "180px", minWidth: "120px" }}>
            Export Stores
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
                {!personName?.includes("Store Name") && (
                  <TableCell sortDirection={orderBy === "store_name" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "store_name"}
                      direction={orderBy === "store_name" ? order : "asc"}
                      onClick={() => handleRequestSort("store_name")}
                    >
                      Store Name
                    </TableSortLabel>
                  </TableCell>
                )}
                  {!personName?.includes("Sort Order") && (
                  <TableCell sortDirection={orderBy === "sort_order" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "sort_order"}
                      direction={orderBy === "sort_order" ? order : "asc"}
                      onClick={() => handleRequestSort("sort_order")}
                    >
                      Sort Order
                    </TableSortLabel>
                  </TableCell>
                )}
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
                        {!personName?.includes("Store Name") && (
                          <TableCell sx={{ wordBreak: "break-word" }}>{capitalizeFirstLetter(row.store_name || "")}</TableCell>
                        )}
                        {!personName?.includes("Sort Order") && (
                          <TableCell sx={{ wordBreak: "break-word" }}>{row?.sort_order || 1}</TableCell>
                        )}
                        <TableCell>
                          <Switch
                            onClick={() => {
                              handleOpen("storeStatus");
                              setStatusData(() => ({ id: row._id, status: !row.status }));
                            }}
                            // onChange={(e) => handleStatusChange({ id: row._id, status: !row.status })}
                            checked={row.status}
                            {...label}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => {
                            handleOpen("storeDelete");
                            setStoreId(row?._id);
                          }}>
                            <Icon sx={{ color: "#DC3545" }}>delete</Icon>
                          </IconButton>
                          <IconButton
                            onClick={() =>
                              navigate(`${ROUTE_CONSTANT.storeSetting.add}?id=${row._id}`)
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
          count={storeList.length}
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

export default StoreSettingList;
