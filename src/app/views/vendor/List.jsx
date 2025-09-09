import styled from "@emotion/styled";
import { Breadcrumb } from "app/components";
import { CircularProgress, Icon, TablePagination, TextField, Typography } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import React from "react";
import Switch from "@mui/material/Switch";
import { useNavigate } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import ConfirmModal from "app/components/ConfirmModal";
import OutlinedInput from "@mui/material/OutlinedInput";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import { useProfileData } from "app/contexts/profileContext";

const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
  }
}));

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

const names = ["Orders", "Revenue", "Followers", "Last order days", "Name", "Id", "Email"];

const List = () => {
  const label = { inputProps: { "aria-label": "Switch demo" } };
  const { getProfileData } = useProfileData();
  const navigate = useNavigate();
  const [vendorList, setVendorList] = useState();
  const [SearchList, setSearchList] = useState([]);
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState("none");
  const [orderBy, setOrderBy] = useState(null);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);
  const [statusData, setStatusData] = useState({});
  const [baseUrl, setBaseUrl] = useState("");
  const [loading,setLoading] = useState(false);
  const [personName, setPersonName] = useState(
    JSON.parse(localStorage.getItem(localStorageKey.vendorTable)) || []
  );
  const [loadingRows, setLoadingRows] = useState({}); 

  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const designation_id = localStorage.getItem(localStorageKey.designation_id)

  const handleChange = (event) => {
    const {
      target: { value }
    } = event;
    const setPerson = typeof value === "string" ? value.split(",") : value;
    setPersonName(setPerson);
    localStorage.setItem(localStorageKey.vendorTable, JSON.stringify(setPerson));
    if (setPerson.length <= 0) {
      localStorage.removeItem(localStorageKey.vendorTable);
    }
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getVendorList = useCallback(async () => {
    try {
      let url = `${apiEndpoints.getVendors}?search=${search}`;
      setLoading(true);
      const res = await ApiService.get(url, auth_key);
      if (res.status === 200) {
        setLoading(false);
        const myNewList = res?.data?.data.map((e, i) => {
          return { "S.No": i + 1, ...e };
        });
        setVendorList(myNewList);
        setSearchList(myNewList);
        setBaseUrl(res?.data?.shopIconBaseUrl);
      }
    } catch (error) {
      setLoading(false);
      handleOpen("error", error);
    }
  }, [auth_key,search]);

  useEffect(() => {
    getVendorList();
  }, [search]);

  const handleStatusChange = useCallback(async () => {
    if (statusData) {
      try {
        const payload = statusData;
        const res = await ApiService.post(apiEndpoints.changeVendorStatus, payload, auth_key);
        if (res.status === 200) {
          getVendorList();
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  }, [auth_key, getVendorList, statusData]);

  // const filterHandler = () => {
  //   const filteredItems = SearchList.filter((item) =>
  //     item.name.toLowerCase().includes(search.toLowerCase())
  //   ).sort((a, b) => {
  //     const aIndex = a.name.toLowerCase().indexOf(search.toLowerCase());
  //     const bIndex = b.name.toLowerCase().indexOf(search.toLowerCase());
  //     return aIndex - bIndex || a.name.localeCompare(b.name);
  //   });
  //   const filteredItemsWithSNo = filteredItems.map((item, index) => {
  //     return { ...item, "S.No": index + 1 };
  //   });
  //   setVendorList(filteredItemsWithSNo);
  // };

  // const asyncFilter = async () => {
  //   await getVendorList();
  //   filterHandler();
  // };

  // useEffect(() => {
  //   if (search) {
  //     asyncFilter();
  //   } else {
  //     getVendorList();
  //   }
  // }, [search]);

  const getNestedValue = (obj, path) => path.split('.').reduce((acc, key) => acc?.[key], obj);

  const sortComparator = (a, b, orderBy) => {
    const valueA = getNestedValue(a, orderBy);
    const valueB = getNestedValue(b, orderBy);
  
    if (valueA === undefined || valueB === undefined) {
      return 0;
    }
  
    if (typeof valueA === "string" && typeof valueB === "string") {
      return valueA.localeCompare(valueB);
    }
    if (valueB < valueA) {
      return -1;
    }
    if (valueB > valueA) {
      return 1;
    }
    return 0;
  };
  
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
  
  const sortedRows = orderBy
    ? [...vendorList].sort((a, b) =>
        order === "asc"
          ? sortComparator(a, b, orderBy)
          : order === "desc"
          ? sortComparator(b, a, orderBy)
          : 0
      )
    : vendorList;

  const handleVendorLogin = async(vendor)=>{
    console.log(vendor,"FGHg");
    setLoadingRows((prev) => ({ ...prev, [vendor._id]: true }));
    try {
      const payload = {
        email: vendor.email,
        password: vendor.showPassword
      };
      const res = await ApiService.login(apiEndpoints.login, payload);
      console.log(res);
      if (res.status === 200) {
        localStorage.setItem(localStorageKey.adminDetail, JSON.stringify({
          auth_key: auth_key,
          designation_id: designation_id
        }));
        localStorage.setItem(localStorageKey.auth_key, res?.data?.token);
        localStorage.setItem(localStorageKey.designation_id, res?.data?.user?.designation_id);
        if (res?.data?.user?.designation_id === 3) {
          localStorage.setItem(localStorageKey.vendorId, res?.data?.user?._id);
        }
        getProfileData()
        setRoute(ROUTE_CONSTANT.dashboard);
        handleOpen("success", res?.data);
      }
    } catch (error) {
      console.log( error?.response?.data?.message,"error");
      handleOpen("error", error?.response?.data || error);
    } finally {
      setLoadingRows((prev) => ({ ...prev, [vendor._id]: false }))
    }
  }

  return (
    <Container>
      <Box
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        className="breadcrumb"
      >
        <Breadcrumb routeSegments={[{ name: "Vendor", path: "" }, { name: "Vendor List" }]} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            flexWrap: "wrap",
            alignItems: "center"
          }}
        >
          <FormControl
            sx={{
              width: 300,
              "& .MuiOutlinedInput-root": {
                height: "38px",
                marginRight: "10px"
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
          <TextField
            size="small"
            label="Search"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            type="text"
          />
        </Box>
      </Box>

      <Box>
        <TableContainer sx={{ paddingLeft: 2, paddingRight: 2 }} component={Paper}>
          <Table
            sx={{
              width: 'auto',
              minWidth: {
                xl: '100%',
                lg: '100%',
                md: 'max-content',
                sm: 'max-content',
                xs: 'max-content'
              },
              maxWidth: {
                xl: 'max-content',
                lg: 'max-content',
                md: 'auto',
                sm: 'auto',
                xs: 'auto'
              },
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
                <TableCell>Shop Icon</TableCell>
                <TableCell sortDirection={orderBy === "vendorData.shop_name" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "vendorData.shop_name"}
                    direction={orderBy === "vendorData.shop_name" ? order : "asc"}
                    onClick={() => handleRequestSort("vendorData.shop_name")}
                  >
                    Shop Name
                  </TableSortLabel>
                </TableCell>
                {!personName?.includes("Orders") && (
                  <TableCell sortDirection={orderBy === "orderCount" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "orderCount"}
                      direction={orderBy === "orderCount" ? order : "asc"}
                      onClick={() => handleRequestSort("orderCount")}
                    >
                      No. of orders
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Revenue") && (
                  <TableCell sortDirection={orderBy === "revenue" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "revenue"}
                      direction={orderBy === "revenue" ? order : "asc"}
                      onClick={() => handleRequestSort("revenue")}
                    >
                      Revenue
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Followers") && (
                  <TableCell sortDirection={orderBy === "followers" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "followers"}
                      direction={orderBy === "followers" ? order : "asc"}
                      onClick={() => handleRequestSort("followers")}
                    >
                      Followers
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Last order days") && (
                  <TableCell sortDirection={orderBy === "lastOrderDays" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "lastOrderDays"}
                      direction={orderBy === "lastOrderDays" ? order : "asc"}
                      onClick={() => handleRequestSort("lastOrderDays")}
                    >
                      Last order days
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Name") && (
                  <TableCell sortDirection={orderBy === "name" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "name"}
                      direction={orderBy === "name" ? order : "asc"}
                      onClick={() => handleRequestSort("name")}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Id") && (
                  <TableCell sortDirection={orderBy === "id_number" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "id_number"}
                      direction={orderBy === "id_number" ? order : "asc"}
                      onClick={() => handleRequestSort("id_number")}
                    >
                      Id no.
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Email") && (
                  <TableCell sortDirection={orderBy === "email" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "email"}
                      direction={orderBy === "email" ? order : "asc"}
                      onClick={() => handleRequestSort("email")}
                    >
                      Email
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={12}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        padding: "48px",
                        width: "100%",
                        minHeight: "200px",
                      }}
                    >
                      <CircularProgress size={40} />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : sortedRows?.length > 0 ? (
                (rowsPerPage > 0
                  ? sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : sortedRows
                ).map((row) => (
                  <TableRow key={row._id}>
                    <TableCell>{row["S.No"]}</TableCell>
                    <TableCell>
                      {row?.vendorData?.shop_icon && (
                        <img
                          src={`${baseUrl}${row?.vendorData?.shop_icon}`}
                          alt=""
                          style={{ height: "60px", width: "58px" }}
                        />
                      )}
                    </TableCell>
                    <TableCell>{row?.vendorData?.shop_name}</TableCell>
                    {!personName?.includes("Orders") && <TableCell>{row?.orderCount}</TableCell>}
                    {!personName?.includes("Revenue") && <TableCell>{row?.revenue}</TableCell>}
                    {!personName?.includes("Followers") && <TableCell>{row?.followers}</TableCell>}
                    {!personName?.includes("Last order days") && <TableCell>{row?.lastOrderDays}</TableCell>}
                    {!personName?.includes("Name") && <TableCell>{row.name}</TableCell>}
                    {!personName?.includes("Id") && <TableCell>{row.id_number}</TableCell>}
                    {!personName?.includes("Email") && <TableCell>{row.email}</TableCell>}

                    <TableCell>
                      <Switch
                        onClick={() => {
                          handleOpen("vendorStatus");
                          setStatusData(() => ({ id: row?._id, status: !row.status }));
                        }}
                        checked={row.status}
                        {...label}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleVendorLogin(row)}
                        endIcon={
                          loadingRows[row._id] ? <CircularProgress size={15} /> : null
                        }
                        disabled={loadingRows[row._id]}
                      >
                        Login
                      </Button>
                      <IconButton
                        onClick={() =>
                          navigate(`${ROUTE_CONSTANT.vendor.add}?id=${row._id}`)
                        }
                      >
                        <Icon color="primary">edit</Icon>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell align="center" colSpan={12}>
                    <Typography fontSize={15} fontWeight="bold" my={2}>
                      No Data Found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[25, 50, 75, 100]}
          component="div"
          count={vendorList?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
      <ConfirmModal
        open={open}
        handleClose={handleClose}
        type={type}
        msg={msg}
        handleStatusChange={handleStatusChange}
      />
    </Container>
  );
};

export default List;
