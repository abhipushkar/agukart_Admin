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
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Typography,
  CircularProgress
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
import { set } from "lodash";
import QuillDes from "app/components/ReactQuillTextEditor/SingleReactQuillTextEditor/QuilDes";
import SingleTextEditor from "app/components/TextEditor/SingleTextEditor";

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

const names = ["Date And Time","Customer Id","User Email","Status"];

const label = { inputProps: { "aria-label": "Switch demo" } };

const List = () => {
  const [emailList, setEmailList] = useState([]);
  console.log(emailList, "emailList");
  const [subscribedEmailList, setSubscribedEmailList] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const [SearchList, setSearchList] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();
  const [personName, setPersonName] = useState(
    JSON.parse(localStorage.getItem(localStorageKey.SubscribeTable)) || []
  );
  const [loading,setLoading] = useState(false);
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [formdata, setFormdata] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });
  console.log({formdata});

    const handleDateChange = async (e) => {
      const { name, value } = e.target;
      console.log({ name, value });
      setFormdata((prev) => ({
        ...prev,
        [name]: value,
      }));
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

  const handleChange = (event) => {
    const {
      target: { value }
    } = event;
    const setPerson = typeof value === "string" ? value.split(",") : value;
    setPersonName(setPerson);
    localStorage.setItem(localStorageKey.SubscribeTable, JSON.stringify(setPerson));
    if (setPerson.length <= 0) {
      localStorage.removeItem(localStorageKey.SubscribeTable);
    }
  };

  const getemailList = useCallback(async () => {
    try {
      const res = await ApiService.get(`${apiEndpoints.getSubscribeData}?start_date=${formdata.from}&end_date=${formdata.to}`, auth_key);

      if (res.status === 200) {
        console.log({ res });
        const myNewList = res?.data?.data.map((e, i) => {
          return { "S.No": i + 1, ...e };
        });

        const xData = myNewList.map((e, i) => {
          let obj = {
            "S.NO": i + 1,
            Email: e?.email
          };
          return obj;
        });
        setExcelData(xData);
        setSearchList(myNewList);
        setEmailList(myNewList);
        const subcribeEmail = myNewList?.filter((data) => data.status != "unsubscribe")
        setSubscribedEmailList(subcribeEmail || []);
      }
    } catch (error) {
      // handleOpen("error", error?.response?.data || error);
      console.log(error);
    }
  }, [auth_key, formdata.from, formdata.to]);

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const paginatedemailList = useMemo(() => {
    return rowsPerPage > 0
      ? emailList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : emailList;
  }, [emailList, page, rowsPerPage]);

  const filterHandler = () => {
    const filteredItems = SearchList.filter((item) =>
      item.email.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => {
      const aIndex = Math.min(a.email.toLowerCase().indexOf(search.toLowerCase()));
      const bIndex = Math.min(b.email.toLowerCase().indexOf(search.toLowerCase()));
      return aIndex - bIndex || a.email.localeCompare(b.email);
    });

    const filteredItemsWithSNo = filteredItems.map((item, index) => {
      return { ...item, "S.No": index + 1 };
    });
    setEmailList(filteredItemsWithSNo);
  };

  const asyncFilter = async () => {
    await getemailList();
    await filterHandler();
  };

  useEffect(() => {
    getemailList();
  }, [formdata]);

  useEffect(()=>{
    if (search) {
      asyncFilter();
    }else{
      getemailList();
    } 
  },[search])

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
    ? [...paginatedemailList].sort((a, b) =>
        order === "asc"
          ? sortComparator(a, b, orderBy)
          : order === "desc"
          ? sortComparator(b, a, orderBy)
          : 0
      )
    : paginatedemailList;

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const subscribedIds = emailList
        .filter((item) => item.status != "unsubscribe")
        .map((item) => item._id);
        console.log({subscribedIds});
      setSelectedIds(subscribedIds);
    } else {
      setSelectedIds([]);
    }
  };


  const handleSelectEmail = (id) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((e) => e !== id) : [...prevSelected, id]
    );
  };
  const handleSendEmails = async () => {
    if (!message || message === "<p><br></p>") {
      setError("Message is required");
      return;
    }
    const payload = { id: selectedIds, description: message };
    try {
      setLoading(true);
      const res = await ApiService.post(apiEndpoints.sendMailToSubscribers, payload, auth_key);
      if (res.status === 200) {
        setLoading(false);
        setMessage("");
        setSelectedIds([]);
        setOpenPopup(false);
        handleOpen("success", res?.data);
      }
    } catch (error) {
      setLoading(false);
      handleOpen("error", error?.response?.data || error);
    }
  };
  function formatToIST(utcDateStr) {
    const date = new Date(utcDateStr);
  
    const options = {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
  
    const formatter = new Intl.DateTimeFormat('en-IN', options);
  
    const parts = formatter.formatToParts(date).reduce((acc, part) => {
      if (part.type !== 'literal') {
        acc[part.type] = part.value;
      }
      return acc;
    }, {});
  
    // Output format: YYYY-MM-DD HH:mm:ss
    return `${parts.day}-${parts.month}-${parts.year} ${parts.hour}:${parts.minute}:${parts.second}`;
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
        <Breadcrumb routeSegments={[{ name: "Subscribe Emails", path: "" }]} />
        <Box display={"flex"} gap={"16px"} alignItems={"center"}>
           <Box sx={{ minWidth: 150 }}>
            <TextField
              label="From Date"
              type="date"
              fullWidth
              name="from"
              value={formdata?.from || ''}
              onChange={handleDateChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
          <Box sx={{ minWidth: 150 }}>
            <TextField
              label="To Date"
              type="date"
              fullWidth
              name="to"
              value={formdata?.to || ''}
              onChange={handleDateChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
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
          <Button
            onClick={() => exportToExcel(excelData)}
            variant="contained"
            sx={{ whiteSpace: "nowrap", width: "180px", minWidth: "120px" }}
          >
            Export Subscribe Emails
          </Button>
          <Button
            onClick={() => setOpenPopup(true)}
            variant="contained"
            color="secondary"
            disabled={selectedIds.length === 0}
          >
            Send Email
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
                <TableCell>
                  <Checkbox
                    onChange={handleSelectAll}
                    checked={selectedIds?.length === subscribedEmailList?.length}
                  />
                  Select All
                </TableCell>
                {!personName?.includes("Date And Time") && (
                  <TableCell sortDirection={orderBy === "createdAt" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "createdAt"}
                      direction={orderBy === "createdAt" ? order : "asc"}
                      onClick={() => handleRequestSort("createdAt")}
                    >
                      Date And Time
                    </TableSortLabel>
                  </TableCell>
                )}
                 {!personName?.includes("Customer Id") && (
                  <TableCell sortDirection={orderBy === "customerId" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "customerId"}
                      direction={orderBy === "customerId" ? order : "asc"}
                      onClick={() => handleRequestSort("customerId")}
                    >
                      Customer Id
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("User Email") && (
                  <TableCell sortDirection={orderBy === "email" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "email"}
                      direction={orderBy === "email" ? order : "asc"}
                      onClick={() => handleRequestSort("email")}
                    >
                      User Email
                    </TableSortLabel>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRows.length > 0 ? (
                sortedRows.map((row, i) => {
                  return (
                    <TableRow key={row._id}>
                      <TableCell>{row["S.No"]}</TableCell>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(row._id)}
                          onChange={() => handleSelectEmail(row._id)}
                          disabled={row?.status=="unsubscribe"}
                        />
                      </TableCell>
                      {!personName?.includes("Date And Time") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>{formatToIST(row.createdAt || "")}</TableCell>
                      )}
                      {!personName?.includes("Customer Id") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>{row?.customerId}</TableCell>
                      )}
                      {!personName?.includes("User Email") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>{row?.email}</TableCell>
                      )}
                      {!personName?.includes("Status") && (
                        <TableCell sx={{ wordBreak: "break-word" }}>{row?.status=="subscribe"?"Subscribed":"Unsubscribed"}</TableCell>
                      )}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={12} sx={{ textAlign: "center" }}>
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
          count={emailList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
      <Dialog open={openPopup} onClose={() => setOpenPopup(false)} maxWidth="md" fullWidth>
        <DialogTitle>Send Email</DialogTitle>
        <DialogContent>
          {/* <TextField
            fullWidth
            multiline
            rows={6}
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          /> */}
          <Box
            sx={{
              height: "auto",
              width: "100%"
            }}
          >
            <QuillDes des={message} setDes={setMessage} setErrors={setError} />
          </Box>
          {/* <SingleTextEditor value={message} setDescription={setMessage}/> */}
          {error && (
            <Typography
              sx={{
                fontSize: "12px",
                color: "#FF3D57",
                marginLeft: "14px",
                marginRight: "14px",
                marginTop: "3px"
              }}
            >
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPopup(false)}>Cancel</Button>
          <Button 
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
            onClick={handleSendEmails} 
            variant="contained" 
            color="primary"
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmModal
        open={open}
        handleClose={handleClose}
        type={type}
        msg={msg}
      />
    </Box>
  );
};

export default List;
