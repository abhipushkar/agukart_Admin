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

const names = ["Title", "Total Products", "View", "Orders", "Revenue"];

const label = { inputProps: { "aria-label": "Switch demo" } };

const List = () => {
  const [categoryList, setCategoryList] = useState([]);
  console.log({ categoryList })
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
    JSON.parse(localStorage.getItem(localStorageKey.categoryTable)) || []
  );
  const [loading,setLoading] = useState(false);

  const navigate = useNavigate();
  const auth_key = localStorage.getItem(localStorageKey.auth_key);

  const handleChange = (event) => {
    const {
      target: { value }
    } = event;
    const setPerson = typeof value === "string" ? value.split(",") : value;
    setPersonName(setPerson);
    localStorage.setItem(localStorageKey.categoryTable, JSON.stringify(setPerson));
    if (setPerson.length <= 0) {
      localStorage.removeItem(localStorageKey.categoryTable);
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

  const getCategoryList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ApiService.get(apiEndpoints.getCategory, auth_key);

      if (res.status === 200) {
        setLoading(false);
        const myNewList = res?.data?.categories.map((e, i) => {
          return { "S.No": i + 1, ...e };
        });

        const xData = myNewList.map((e, i) => {
          let obj = {
            "S.NO": i + 1,
            title: e.title,
            status: e.status ? "Active" : "In Active"
          };
          return obj;
        });
        setExcelData(xData);
        setSearchList(myNewList);
        setCategoryList(myNewList);
      }
    } catch (error) {
      setLoading(false);
      handleOpen("error", error);
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
        const res = await ApiService.post(apiEndpoints.changeStatusCategory, payload, auth_key);
        if (res.status === 200) {
          getCategoryList();
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  }, [auth_key, getCategoryList, statusData]);

  const handleTopRatedChange = useCallback(async () => {
    if (statusData) {
      try {
        const payload = statusData;
        const res = await ApiService.post(apiEndpoints.changeTopRatedCategory, payload, auth_key);
        if (res.status === 200) {
          getCategoryList();
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  }, [auth_key, getCategoryList, statusData]);

  const Container = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
      marginBottom: "30px",
      [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
    }
  }));

  const paginatedCategoryList = useMemo(() => {
    return rowsPerPage > 0
      ? categoryList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : categoryList;
  }, [categoryList, page, rowsPerPage]);

  const filterHandler = () => {
    const filteredItems = SearchList.filter((item) =>
      item.title.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => {
      const aIndex = a.title.toLowerCase().indexOf(search.toLowerCase());
      const bIndex = b.title.toLowerCase().indexOf(search.toLowerCase());
      return aIndex - bIndex || a.title.localeCompare(b.title);
    });
    const filteredItemsWithSNo = filteredItems.map((item, index) => {
      return { ...item, "S.No": index + 1 };
    });
    setCategoryList(filteredItemsWithSNo);
  };

  const asyncFilter = async () => {
    await getCategoryList();
    await filterHandler();
  };

  useEffect(() => {
    if (search) {
      asyncFilter();
    } else {
      getCategoryList();
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
    ? [...paginatedCategoryList].sort((a, b) =>
      order === "asc"
        ? sortComparator(a, b, orderBy)
        : order === "desc"
          ? sortComparator(b, a, orderBy)
          : 0
    )
    : paginatedCategoryList;

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
        <Breadcrumb routeSegments={[{ name: "Catalog", path: "" }, { name: "Category" }]} />
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
          <Button onClick={() => navigate(ROUTE_CONSTANT.catalog.category.add)} variant="contained" sx={{ whiteSpace: "nowrap", width: "180px", minWidth: "120px" }}>
            Add Category
          </Button>

          <Button onClick={() => exportToExcel(excelData)} variant="contained" sx={{ whiteSpace: "nowrap", width: "180px", minWidth: "120px" }}>
            Export Categories
          </Button>
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
              '.MuiTableCell-root': {
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
                <TableCell sortDirection={orderBy === "parent" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "parent"}
                    direction={orderBy === "parent" ? order : "asc"}
                    onClick={() => handleRequestSort("parent")}
                  >
                    Category
                  </TableSortLabel>
                </TableCell>
                {/* {!personName?.includes("Title") && (
                  <TableCell sortDirection={orderBy === "title" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "title"}
                      direction={orderBy === "title" ? order : "asc"}
                      onClick={() => handleRequestSort("title")}
                    >
                      Title
                    </TableSortLabel>
                  </TableCell>
                )} */}
                {!personName?.includes("Total Products") && (
                  <TableCell sortDirection={orderBy === "totalProducts" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "totalProducts"}
                      direction={orderBy === "totalProducts" ? order : "asc"}
                      onClick={() => handleRequestSort("totalProducts")}
                    >
                      Total Products
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("View") && (
                  <TableCell sortDirection={orderBy === "view" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "view"}
                      direction={orderBy === "view" ? order : "asc"}
                      onClick={() => handleRequestSort("view")}
                    >
                      View
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Orders") && (
                  <TableCell sortDirection={orderBy === "numberOfOrders" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "numberOfOrders"}
                      direction={orderBy === "numberOfOrders" ? order : "asc"}
                      onClick={() => handleRequestSort("numberOfOrders")}
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
                <TableCell sortDirection={orderBy === "status" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "status"}
                    direction={orderBy === "status" ? order : "asc"}
                    onClick={() => handleRequestSort("status")}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === "topRated" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "topRated"}
                    direction={orderBy === "topRated" ? order : "asc"}
                    onClick={() => handleRequestSort("topRated")}
                  >
                    Top Rated
                  </TableSortLabel>
                </TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                loading ? (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: "center" }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ):(
                  <>
                  {
                    sortedRows?.length > 0 ? (
                      sortedRows.map((row, i) => {
                        return (
                          <TableRow key={row._id}>
                            <TableCell>{row["S.No"]}</TableCell>
                            <TableCell sx={{ wordBreak: "break-word" }}>{row?.parent}</TableCell>
                            {/* {!personName?.includes("Title") && (
                              <TableCell sx={{ wordBreak: "break-word" }}>{row.title}</TableCell>
                            )} */}
                            {!personName?.includes("Total Products") && (
                              <TableCell>{row.totalProducts}</TableCell>
                            )}
                            {!personName?.includes("View") && <TableCell>{row.view}</TableCell>}
                            {!personName?.includes("Orders") && <TableCell>{row.numberOfOrders}</TableCell>}
                            {!personName?.includes("Revenue") && <TableCell>{row.revenue}</TableCell>}
                            <TableCell>
                              <Switch
                                onClick={() => {
                                  handleOpen("catStatus");
                                  setStatusData(() => ({ id: row._id, status: !row.status }));
                                }}
                                // onChange={(e) => handleStatusChange({ id: row._id, status: !row.status })}
                                checked={row.status}
                                {...label}
                              />
                            </TableCell>
                            <TableCell>
                              <Switch
                                // onChange={(e) =>
                                //   handleTopRatedChange({ id: row._id, topRated: !row.topRated })
                                // }
                                onClick={() => {
                                  handleOpen("catTopRatedStatus");
                                  setStatusData(() => ({ id: row._id, topRated: !row.topRated }));
                                }}
                                checked={row.topRated}
                                {...label}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() =>
                                  navigate(`${ROUTE_CONSTANT.catalog.category.add}?id=${row._id}`)
                                }
                              >
                                <Icon color="primary">edit</Icon>
                              </IconButton>{" "}
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
                  </>
                )
              }
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[25, 50, 75, 100]}
          component="div"
          count={categoryList.length}
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
        handleFeaturedStatusChange={handleTopRatedChange}
      />
    </Box>
  );
};

export default List;
