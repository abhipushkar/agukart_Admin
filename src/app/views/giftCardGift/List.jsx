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

const names = ["Title"];

const label = { inputProps: { "aria-label": "Switch demo" } };

const List = () => {
  const [giftCardList, setGiftCardList] = useState([]);
  console.log(giftCardList, "giftCardList");
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
    JSON.parse(localStorage.getItem(localStorageKey.giftCardTable)) || []
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
    localStorage.setItem(localStorageKey.giftCardTable, JSON.stringify(setPerson));
    if (setPerson.length <= 0) {
      localStorage.removeItem(localStorageKey.giftCardTable);
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

  const getGiftCardList = useCallback(async () => {
    try {
      const res = await ApiService.get(apiEndpoints.getGiftCardList, auth_key);

      if (res.status === 200) {
        console.log({ res });
        const myNewList = res?.data?.giftCards.map((e, i) => {
          return { "S.No": i + 1, ...e };
        });

        const xData = myNewList.map((e, i) => {
          let obj = {
            "S.NO": i + 1,
            "title": e?.title,
            "category": e?.category_id?.title,
            "status": e?.status ? "Active" : "In Active"
          };
          return obj;
        });
        setExcelData(xData);
        setSearchList(myNewList);
        setGiftCardList(myNewList);
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
          getGiftCardList();
        }
      } catch (error) {
        handleOpen("error", error?.response?.data || error);
      }
    }
  }, [auth_key, getGiftCardList, statusData]);

  const Container = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
      marginBottom: "30px",
      [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
    }
  }));

  const paginatedgiftCardList = useMemo(() => {
    return rowsPerPage > 0
      ? giftCardList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : giftCardList;
  }, [giftCardList, page, rowsPerPage]);
  const filterHandler = () => {
    const filteredItems = SearchList.filter((item) =>
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
    setGiftCardList(filteredItemsWithSNo);
  };

  const asyncFilter = async () => {
    await getGiftCardList();
    await filterHandler();
  };

  useEffect(() => {
    if (search) {
      asyncFilter();
    } else {
      getGiftCardList();
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
          getGiftCardList();
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  }, [auth_key, giftCardId, getGiftCardList]);

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
    ? [...paginatedgiftCardList].sort((a, b) =>
      order === "asc"
        ? sortComparator(a, b, orderBy)
        : order === "desc"
          ? sortComparator(b, a, orderBy)
          : 0
    )
    : paginatedgiftCardList;

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
        <Breadcrumb routeSegments={[{ name: "Gift Card", path: "" }, { name: "Gift" }]} />
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
              label="Search by category, title"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
          </Box>
          <Button onClick={() => navigate(ROUTE_CONSTANT.giftCard.gift.add)} variant="contained" sx={{ whiteSpace: "nowrap", width: "180px", minWidth: "120px" }}>
            Add Gift
          </Button>

          <Button onClick={() => exportToExcel(excelData)} variant="contained" sx={{ whiteSpace: "nowrap", width: "180px", minWidth: "120px" }}>
            Export Gift Cards
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
                <TableCell sortDirection={orderBy === "category_title" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "category_title"}
                    direction={orderBy === "category_title" ? order : "asc"}
                    onClick={() => handleRequestSort("category_title")}
                  >
                    Category
                  </TableSortLabel>
                </TableCell>
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
                        <TableCell sx={{ wordBreak: "break-word" }}>{capitalizeFirstLetter(row?.category_title)}</TableCell>
                        {!personName?.includes("Title") && (
                          <TableCell sx={{ wordBreak: "break-word" }}>{capitalizeFirstLetter(row.title)}</TableCell>
                        )}
                        <TableCell>
                          <Switch
                            onClick={() => {
                              handleOpen("giftCardStatus");
                              setStatusData(() => ({ id: row._id, status: !row.status }));
                            }}
                            checked={row.status}
                            {...label}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => {
                            handleOpen("giftCardDelete");
                            setGiftCardId(row?._id);
                          }}>
                            <Icon sx={{ color: "#DC3545" }}>delete</Icon>
                          </IconButton>
                          <IconButton
                            onClick={() =>
                              navigate(`${ROUTE_CONSTANT.giftCard.gift.add}?id=${row._id}`)
                            }
                          >
                            <Icon color="primary">edit</Icon>
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
                )
              }
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[25, 50, 75, 100]}
          component="div"
          count={giftCardList.length}
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
