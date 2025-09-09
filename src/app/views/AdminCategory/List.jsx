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

const names = ["Tags", "Status", "Popular", "Special", "Menu Item", "Action"];

const label = { inputProps: { "aria-label": "Switch demo" } };

const List = () => {
  const [categoryList, setCategoryList] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const [SearchList, setSearchList] = useState([]);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState("")
  const [statusData, setStatusData] = useState({});
  const [personName, setPersonName] = useState(
    JSON.parse(localStorage.getItem(localStorageKey.adminCatTable)) || []
  );
  const [loading,setLoading] = useState(false);

  const handleChange = (event) => {
    const {
      target: { value }
    } = event;
    const setPerson = typeof value === "string" ? value.split(",") : value;
    setPersonName(setPerson);
    localStorage.setItem(localStorageKey.adminCatTable, JSON.stringify(setPerson));
    if (setPerson.length <= 0) {
      localStorage.removeItem(localStorageKey.adminCatTable);
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
      navigate(route)
    }
    setRoute(null)
    setMsg("")
  };

  const navigate = useNavigate();
  const auth_key = localStorage.getItem(localStorageKey.auth_key);

  const getCategoryList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ApiService.get(apiEndpoints.getAdminCategory, auth_key);

      if (res.status === 200) {
        setLoading(false);
        const myNewList = res?.data?.data?.map((e, i) => {
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

  // const handleStatusChange = useCallback(
  //   async (payload) => {
  //     try {
  //       const res = await ApiService.post(apiEndpoints.changeStatusCategory, payload, auth_key);
  //       if (res.status === 200) {
  //         getCategoryList();
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   },
  //   [auth_key, getCategoryList]
  // );

  const handleStatusChange = useCallback(async () => {
    if (statusData) {
      try {
        const payload = statusData;
        const res = await ApiService.post(
          apiEndpoints.changeStatusAdminCategory,
          payload,
          auth_key
        );
        if (res.status === 200) {
          getCategoryList();
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  }, [auth_key, getCategoryList, statusData]);

  const handlePopularStatusChange = useCallback(async () => {
    if (statusData) {
      try {
        const payload = statusData;
        const res = await ApiService.post(
          apiEndpoints.changePopularStatusAdminCategory,
          payload,
          auth_key
        );
        if (res.status === 200) {
          getCategoryList();
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  }, [auth_key, getCategoryList, statusData]);

  const handleSpecialCatStatusChange = useCallback(async () => {
    if (statusData) {
      try {
        const payload = statusData;
        const res = await ApiService.post(
          apiEndpoints.changeSpecialStatusAdminCategory,
          payload,
          auth_key
        );
        if (res.status === 200) {
          getCategoryList();
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  }, [auth_key, getCategoryList, statusData]);

  const handleMenuItemStatusChange = useCallback(async () => {
    if (statusData) {
      try {
        const payload = statusData;
        const res = await ApiService.post(
          apiEndpoints.changeMenuStatusAdminCategory,
          payload,
          auth_key
        );
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
        <Breadcrumb routeSegments={[{ name: "Catalog", path: "" }, { name: "Admin Category" }]} />
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
          <Button
            onClick={() => navigate(ROUTE_CONSTANT.catalog.adminCategory.add)}
            variant="contained"
            sx={{ whiteSpace: "nowrap", width: "180px", minWidth: "120px" }}
          >
            Add Admin Category
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
                    Admin Category
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
                {!personName?.includes("Tags") && (
                  <TableCell sortDirection={orderBy === "tag" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "tag"}
                      direction={orderBy === "tag" ? order : "asc"}
                      onClick={() => handleRequestSort("tag")}
                    >
                      Tags
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
                {!personName?.includes("Popular") && (
                  <TableCell sortDirection={orderBy === "popular" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "popular"}
                      direction={orderBy === "popular" ? order : "asc"}
                      onClick={() => handleRequestSort("popular")}
                    >
                      Popular
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Special") && (
                  <TableCell sortDirection={orderBy === "special" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "special"}
                      direction={orderBy === "special" ? order : "asc"}
                      onClick={() => handleRequestSort("special")}
                    >
                      Special
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Menu Item") && (
                  <TableCell sortDirection={orderBy === "menuStatus" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "menuStatus"}
                      direction={orderBy === "menuStatus" ? order : "asc"}
                      onClick={() => handleRequestSort("menuStatus")}
                    >
                      Menu Item
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Action") && <TableCell>Action</TableCell>}
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
                      sortedRows?.length > 0 ?(
                        <>
                        {
                          sortedRows.map((row, i) => {
                            return (
                              <TableRow key={row._id}>
                                <TableCell>{row["S.No"]}</TableCell>
                                <TableCell sx={{ wordBreak: "break-word" }}>{row?.parent}</TableCell>
                                {/* {!personName?.includes("Title") && <TableCell>{row.title}</TableCell>} */}
                                {!personName?.includes("Tags") && (
                                  <TableCell>
                                    {row?.tag?.map((tag, index) => (
                                      <span key={index}>
                                        {tag}
                                        {index < row.tag.length - 1 ? ", " : ""}
                                      </span>
                                    ))}
                                  </TableCell>
                                )}
                                {!personName?.includes("Status") && (
                                  <TableCell>
                                    <Switch
                                      onClick={() => {
                                        handleOpen("adminCatStatus");
                                        setStatusData(() => ({ id: row?._id, status: !row.status }));
                                      }}
                                      checked={row.status}
                                      {...label}
                                    />
                                  </TableCell>
                                )}
                                {!personName?.includes("Popular") && (
                                  <TableCell>
                                    <Switch
                                      onClick={() => {
                                        handleOpen("adminCatPopularStatus");
                                        setStatusData(() => ({ id: row?._id, popular: !row.popular }));
                                      }}
                                      checked={row?.popular}
                                      {...label}
                                    />
                                  </TableCell>
                                )}
                                {!personName?.includes("Special") && (
                                  <TableCell>
                                    <Switch
                                      onClick={() => {
                                        handleOpen("adminSpecialCatStatus");
                                        setStatusData(() => ({ id: row?._id, special: !row.special }));
                                      }}
                                      checked={row?.special}
                                      {...label}
                                    />
                                  </TableCell>
                                )}
                                {!personName?.includes("Menu Item") && (
                                  <TableCell>
                                    <Switch
                                      onClick={() => {
                                        handleOpen("adminMenuItemStatus");
                                        setStatusData(() => ({ id: row?._id, menuStatus: !row.menuStatus }));
                                      }}
                                      checked={row?.menuStatus}
                                      {...label}
                                    />
                                  </TableCell>
                                )}
                                {!personName?.includes("Action") && (
                                  <TableCell>
                                    <IconButton
                                      onClick={() =>
                                        navigate(`${ROUTE_CONSTANT.catalog.adminCategory.add}?id=${row._id}`)
                                      }
                                    >
                                      <Icon color="primary">edit</Icon>
                                    </IconButton>{" "}
                                  </TableCell>
                                )}
                              </TableRow>
                            );
                          })
                        }
                        </>
                      ):(
                        <TableRow>
                          <TableCell colSpan={8} sx={{ textAlign: "center" }}>
                            No Data Found
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
        handleFeaturedStatusChange={handlePopularStatusChange}
        handleSpecialCatStatusChange={handleSpecialCatStatusChange}
        handleFour={handleMenuItemStatusChange}
      />
    </Box>
  );
};

export default List;
