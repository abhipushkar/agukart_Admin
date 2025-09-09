import React, { useEffect, useState, useCallback } from "react";
import styled from "@emotion/styled";
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
  CircularProgress
} from "@mui/material";
import { Breadcrumb } from "app/components";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import SearchIcon from "@mui/icons-material/Search";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { ApiService } from "app/services/ApiService";
import { localStorageKey } from "app/constant/localStorageKey";
import { useNavigate } from "react-router-dom";
import { exportToExcel } from "app/utils/excelExport";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import OutlinedInput from "@mui/material/OutlinedInput";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import ConfirmModal from "app/components/ConfirmModal";
import MessagePopup from "./MessagePopup";

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

const names = [
  "Orders",
  "Total Spent",
  "Last Seen days",
  "Last Purchase days",
  "Profession",
  "Joining Date",
  "Customer ID",
  "Email",
  "Status",
  "Action"
];

const CustomersList = () => {
  const [usersList, setUserList] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");
  const [exportData, setExportData] = useState([]);
  const [search, setSearch] = useState("");
  const [SearchList, setSearchList] = useState([]);
  const [order, setOrder] = useState("none");
  const [orderBy, setOrderBy] = useState(null);
  const [personName, setPersonName] = useState(
    JSON.parse(localStorage.getItem(localStorageKey.customerTable)) || []
  );
  const [loading,setLoading] = useState(false);

  const auth_key = localStorage.getItem(localStorageKey.auth_key);

  const [open, setOpen] = React.useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);
  const [openPopup, SetOpenPopup] = useState(false);
  const [userDetailForChat,setUserDetailForChat] = useState({});


  const handleClickPopup = (user) => {
    setUserDetailForChat(user)
    SetOpenPopup(true);
  };

  const handleClosePopup = () => {
    SetOpenPopup(false);
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

  // const getUserList = useCallback(async () => {
  //   try {
  //     let url = `${apiEndpoints.userlist}?`;
  //     if (startDate) url += `&startDate=${startDate}`;
  //     if (endDate) url += `&endDate=${endDate}`;
  //     if (status) url += `&status=${status}`;

  //     const res = await ApiService.get(url, auth_key);

  //     if (res.status === 200) {
  //       const myNewList = res?.data?.result?.map((e, i) => {
  //         return { "S.No": i + 1, ...e };
  //       });

  //       const xData = myNewList.map((e, i) => {
  //         let obj = {
  //           "S.NO": i + 1,
  //           name: e.name,
  //           joining_date: e.created_at,
  //           email: e.email,
  //           status: e.status ? "Active" : "In Active"
  //         };
  //         return obj;
  //       });

  //       setUserList(myNewList);
  //       setSearchList(myNewList);
  //       setExportData(xData);
  //     }
  //   } catch (error) {
  //     if (error?.response?.status === 401) {
  //       navigate(ROUTE_CONSTANT.login);
  //       localStorage.removeItem(localStorageKey.auth_key);
  //     }
  //   }
  // }, [startDate, endDate, status, auth_key]);

  const handleChange = (event) => {
    const {
      target: { value }
    } = event;
    const setPerson = typeof value === "string" ? value.split(",") : value;
    setPersonName(setPerson);
    localStorage.setItem(localStorageKey.customerTable, JSON.stringify(setPerson));
    if (setPerson.length <= 0) {
      localStorage.removeItem(localStorageKey.customerTable);
    }
  };

  const getUserList = async () => {
    try {
      let url = `${apiEndpoints.userlist}?`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      if (status) url += `&status=${status}`;
      setLoading(true);
      const res = await ApiService.get(url, auth_key);

      if (res.status === 200) {
        setLoading(false);
        const myNewList = res?.data?.result?.map((e, i) => {
          return { "S.No": i + 1, ...e };
        });

        const xData = myNewList.map((e, i) => {
          let obj = {
            "S.NO": i + 1,
            name: e.name,
            "Customer Id" : e.id_number || "N/A",
            email: e.email || "N/A",
            "mobile":`${e?.phone_code} ${e?.mobile}` || "N/A",
            "Profession":e.profession || "N/A",
            "Total Orders":e.totalOrders,
            "Total Spent":e.totalSpent,
            "Last Seen Diff Days":e.lastSeenDiffDays,
            "Last Purchase Diff Days":e.lastPurchaseDiffDays,
            "Address":e.address ? `${e.address.first_name} ${e.address.last_name}, ${e.address.address_line1}, ${e.address.address_line2}, ${e.address.city} ${e.address.state}  ${e.address.pincode},  ${e.address.country},  ${e.address.pincode}  ${e.address.mobile}`:"N/A",
            joining_date: e.created_at,
            status: e.status ? "Active" : "In Active"
          };
          return obj;
        });

        setUserList(myNewList);
        setSearchList(myNewList);
        setExportData(xData);
      }
    } catch (error) {
      setLoading(false);
      handleOpen("error", error);
    }
  };

  useEffect(() => {
    getUserList();
  }, []);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSearch = () => {
    getUserList();
  };

  const navigate = useNavigate();

  const label = { inputProps: { "aria-label": "Switch demo" } };

  const changeCustomerStatus = async (data) => {
    try {
      const res = await ApiService.post(
        `${apiEndpoints.updateUserStatus}/${data._id}`,
        { status: !data.status },
        auth_key
      );
      if (res.status === 200) {
        getUserList();
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  const filterHandler = () => {
    const lowerCaseSearch = search.toLowerCase();

    const filteredItems = SearchList.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerCaseSearch) ||
        item.email.toLowerCase().includes(lowerCaseSearch) ||
        item.mobile.toLowerCase().includes(lowerCaseSearch) ||
        item.id_number.toLowerCase().includes(lowerCaseSearch)
    ).sort((a, b) => {
      const aIndex = a.name.toLowerCase().indexOf(lowerCaseSearch);
      const bIndex = b.name.toLowerCase().indexOf(lowerCaseSearch);

      return aIndex - bIndex || a.name.localeCompare(b.name);
    });

    const filteredItemsWithSNo = filteredItems.map((item, index) => {
      return { ...item, "S.No": index + 1 };
    });

    setUserList(filteredItemsWithSNo);
  };

  const asyncFilter = async () => {
    await getUserList();
    filterHandler();
  };

  useEffect(() => {
    if (search) {
      asyncFilter();
    } else {
      getUserList();
    }
  }, [search]);

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
    ? [...usersList].sort((a, b) =>
        order === "asc"
          ? sortComparator(a, b, orderBy)
          : order === "desc"
          ? sortComparator(b, a, orderBy)
          : 0
      )
    : usersList;

  const capitalizeFirstWord = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <Container>
      <Box
        className="breadcrumb"
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <Breadcrumb routeSegments={[{ name: "Customers", path: "" }, { name: "Customers List" }]} />
        <Button onClick={() => exportToExcel(exportData)} variant="contained">
          Export Customers
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: "16px", justifyContent: "space-between", flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", gap: "16px", marginBottom: 2 }}>
          <TextField
            size="small"
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <TextField
            size="small"
            label="End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>
          <Box display={"flex"} alignItems={"center"}>
            <Button variant="contained" size="small" color="primary" onClick={handleSearch}>
              <SearchIcon />
            </Button>
          </Box>
        </Box>

        <Box>
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
                xl: 'max-content',
                lg: 'max-content',
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
            aria-label="simple table"
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
                <TableCell sortDirection={orderBy === "name" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={() => handleRequestSort("name")}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                {!personName?.includes("Orders") && (
                  <TableCell sortDirection={orderBy === "totalOrders" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "totalOrders"}
                      direction={orderBy === "totalOrders" ? order : "asc"}
                      onClick={() => handleRequestSort("totalOrders")}
                    >
                      Orders
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Total Spent") && (
                  <TableCell sortDirection={orderBy === "totalSpent" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "totalSpent"}
                      direction={orderBy === "totalSpent" ? order : "asc"}
                      onClick={() => handleRequestSort("totalSpent")}
                    >
                      Total Spent
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Last Seen days") && (
                  <TableCell sortDirection={orderBy === "lastSeenDiffDays" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "lastSeenDiffDays"}
                      direction={orderBy === "lastSeenDiffDays" ? order : "asc"}
                      onClick={() => handleRequestSort("lastSeenDiffDays")}
                    >
                      Last Seen days
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Last Purchase days") && (
                  <TableCell sortDirection={orderBy === "lastPurchaseDiffDays" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "lastPurchaseDiffDays"}
                      direction={orderBy === "lastPurchaseDiffDays" ? order : "asc"}
                      onClick={() => handleRequestSort("lastPurchaseDiffDays")}
                    >
                      Last Purchase days
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Profession") && (
                  <TableCell sortDirection={orderBy === "profession" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "profession"}
                      direction={orderBy === "profession" ? order : "asc"}
                      onClick={() => handleRequestSort("profession")}
                    >
                      Profession
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Joining Date") && (
                  <TableCell sortDirection={orderBy === "created_at" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "created_at"}
                      direction={orderBy === "created_at" ? order : "asc"}
                      onClick={() => handleRequestSort("created_at")}
                    >
                      Joining Date
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Customer ID") && (
                  <TableCell sortDirection={orderBy === "id_number" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "id_number"}
                      direction={orderBy === "id_number" ? order : "asc"}
                      onClick={() => handleRequestSort("id_number")}
                    >
                      Customer ID
                    </TableSortLabel>
                  </TableCell>
                )}
                {/* <TableCell >
                  <TableSortLabel
                  >
                    Reg. Tpye
                  </TableSortLabel>
                </TableCell> */}
                {/* <TableCell >
                  <TableSortLabel>Mobile No.</TableSortLabel>
                </TableCell> */}
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
                 {!personName?.includes("Contact") && (
                  <TableCell>
                    Contact 
                  </TableCell>
                )}
                {!personName?.includes("Status") && (
                  <TableCell sortDirection={orderBy === "status" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "status"}
                      direction={orderBy === "status" ? order : "asc"}
                      onClick={() => handleRequestSort("status")}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Action") && (
                  <TableCell sx={{ textAlign: "center" }}>Action</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {
                loading ? (
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
                ):(
                  <>
                    {
                      sortedRows.length > 0 ?(rowsPerPage > 0
                        ? sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        : sortedRows
                      ).map((row, i) => {
                        const inputString = row.created_at;
                        const datePattern = /^(\d{2}-\d{2}-\d{4})/;
                        const match = inputString?.match(datePattern);
        
                        return (
                          <TableRow key={row._id}>
                            <TableCell>{row["S.No"]}</TableCell>
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                {row?.image ? (
                                  <img
                                    src={row?.image}
                                    alt=""
                                    style={{
                                      marginRight: "6px",
                                      borderRadius: "50%",
                                      height: "60px",
                                      width: "60px",
                                      objectFit: "cover"
                                    }}
                                  />
                                ) : (
                                  <img
                                    src="assets/images/default_user.png"
                                    alt=""
                                    style={{
                                      marginRight: "6px",
                                      borderRadius: "50%",
                                      height: "60px",
                                      width: "60px",
                                      objectFit: "cover"
                                    }}
                                  />
                                )}{" "}
                                <Box sx={{ display: "grid" }}>
                                  <b>{capitalizeFirstWord(row?.name)}</b>{" "}
                                  {`${row?.phone_code} ${row?.mobile}`}
                                </Box>{" "}
                              </Box>
                            </TableCell>
                            {!personName?.includes("Orders") && <TableCell>{row.totalOrders}</TableCell>}
                            {!personName?.includes("Total Spent") && (
                              <TableCell>{row.totalSpent.toFixed(2)}</TableCell>
                            )}
                            {!personName?.includes("Last Seen days") && (
                              <TableCell>{row.lastSeenDiffDays}</TableCell>
                            )}
                            {!personName?.includes("Last Purchase days") && (
                              <TableCell>{row.lastPurchaseDiffDays}</TableCell>
                            )}
                            {!personName?.includes("Profession") && <TableCell>{row?.profession}</TableCell>}
                            {!personName?.includes("Joining Date") && (
                              <TableCell>{match ? match[1] : row.created_at}</TableCell>
                            )}
                            {!personName?.includes("Customer ID") && <TableCell>{row.id_number}</TableCell>}
                            {/* <TableCell >{row?.type}</TableCell> */}
                            {/* <TableCell >{row?.mobile}</TableCell> */}
                            {!personName?.includes("Email") && <TableCell>{row.email}</TableCell>}
                            {!personName?.includes("Contact") && 
                              <TableCell>
                                <Button 
                                  variant="contained" 
                                  color="primary" 
                                  startIcon={<ContactMailIcon />} 
                                  onClick={()=>handleClickPopup(row)}
                                >
                                  Contact
                                </Button>
                              </TableCell>
                            }
                            {!personName?.includes("Status") && (
                              <TableCell>
                                <Switch
                                  onChange={() => changeCustomerStatus(row)}
                                  checked={row.status}
                                  {...label}
                                />
                              </TableCell>
                            )}
                            {!personName?.includes("Action") && (
                              <TableCell sx={{ textAlign: "center" }}>
                                <IconButton
                                  onClick={() => navigate(`${ROUTE_CONSTANT.customers.view}?id=${row._id}`)}
                                >
                                  <Icon color="primary">visibility</Icon>
                                </IconButton>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      }):(
                        <TableRow>
                          <TableCell colSpan={12} sx={{ textAlign: "center" }}>
                            No data found
                          </TableCell>
                        </TableRow>
                      )
                    }
                  </>
                )
              }
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[25, 50, 75, 100]}
          component="div"
          count={usersList?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
      <div>
        <MessagePopup
          openPopup={openPopup}
          userDetailForChat={userDetailForChat}
          handleClosePopup={handleClosePopup}
        />
      </div>
    </Container>
  );
};

export default CustomersList;
