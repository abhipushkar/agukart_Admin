import styled from "@emotion/styled";
import { Breadcrumb } from "app/components";
import { Icon, TablePagination, TextField, Typography } from "@mui/material";
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
import { exportToExcel } from "app/utils/excelExport";
import { toast } from "react-toastify";
import ConfirmModal from "app/components/ConfirmModal";
import OutlinedInput from "@mui/material/OutlinedInput";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";

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

const names = ["Tags", "Status", "Featured", "Action"];

const BlogList = () => {
  const label = { inputProps: { "aria-label": "Switch demo" } };
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(0);
  const [allBlogs, setAllBlogs] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("none");
  const [orderBy, setOrderBy] = useState(null);
  const [SearchList, setSearchList] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);
  const [statusData, setStatusData] = useState({});
  const [personName, setPersonName] = useState(
    JSON.parse(localStorage.getItem(localStorageKey.blogTable)) || []
  );
  const navigate = useNavigate();
  // console.log(statusData)

  const handleChange = (event) => {
    const {
      target: { value }
    } = event;
    const setPerson = typeof value === "string" ? value.split(",") : value;
    setPersonName(setPerson);
    localStorage.setItem(localStorageKey.blogTable, JSON.stringify(setPerson));
    if (setPerson.length <= 0) {
      localStorage.removeItem(localStorageKey.blogTable);
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

  const auth_key = localStorage.getItem(localStorageKey.auth_key);

  const getBlogList = useCallback(async () => {
    try {
      let url = `${apiEndpoints.getBlogs}`;

      const res = await ApiService.get(url, auth_key);
      if (res.status === 200) {
        const myNewList = res?.data?.data.map((e, i) => {
          return { "S.No": i + 1, ...e };
        });
        setAllBlogs(myNewList);
        setSearchList(myNewList);

        const xData = myNewList.map((e, i) => {
          let obj = {
            "S.NO": i + 1,
            title: e.title,
            status: e.status ? "Active" : "In Active"
          };
          return obj;
        });
        setExcelData(xData);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  }, [auth_key]);

  useEffect(() => {
    getBlogList();
  }, []);

  const handleStatusChange = useCallback(async () => {
    if (statusData) {
      try {
        const payload = statusData;
        const res = await ApiService.post(apiEndpoints.changeStatusBlog, payload, auth_key);
        if (res.status === 200) {
          getBlogList();
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  }, [auth_key, getBlogList, statusData]);

  const handleFeaturedStatusChange = useCallback(async () => {
    if (statusData) {
      try {
        const payload = statusData;
        const res = await ApiService.post(apiEndpoints.changeFeaturedStatusBlog, payload, auth_key);
        if (res.status === 200) {
          getBlogList();
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  }, [auth_key, getBlogList, statusData]);

  // const handleDelete = async () => {
  const handleDelete = useCallback(async () => {
    if (statusData) {
      try {
        const id = statusData;
        const res = await ApiService.delete(`${apiEndpoints.deleteBlog}/${id}`, auth_key);
        if (res?.status === 200) {
          toast.success(res?.data?.message);
          getBlogList();
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  }, [auth_key, getBlogList, statusData]);

  // const changeBrandStatus = async (row) => {
  //   try {
  //     const payload = {
  //       id: row._id,
  //       status: !row.status
  //     };
  //     const res = await ApiService.post(apiEndpoints.changeStatusBrand, payload, auth_key);
  //     if (res.status === 200) {
  //       getBlogList();
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

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
    setAllBlogs(filteredItemsWithSNo);
  };

  const asyncFilter = async () => {
    await getBlogList();
    filterHandler();
  };

  useEffect(() => {
    if (search) {
      asyncFilter();
    } else {
      getBlogList();
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
    ? [...allBlogs].sort((a, b) =>
        order === "asc"
          ? sortComparator(a, b, orderBy)
          : order === "desc"
          ? sortComparator(b, a, orderBy)
          : 0
      )
    : allBlogs;

  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          alignItems: "center",
          justifyContent: "space-between"
        }}
        className="breadcrumb"
      >
        <Breadcrumb routeSegments={[{ name: "Blog", path: "" }, { name: "Blog List" }]} />
        {/* <Box display={"flex"} gap={"16px"}>
          <Button onClick={() => navigate(ROUTE_CONSTANT.blog.add)} variant="contained">
            Add Blog
          </Button>
        </Box> */}

        <Box sx={{ display: "flex", justifyContent: "flex-end", flexWrap: "wrap" }}>
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
          <Table>
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
                <TableCell sortDirection={orderBy === "title" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "title"}
                    direction={orderBy === "title" ? order : "asc"}
                    onClick={() => handleRequestSort("title")}
                  >
                    Blog Title
                  </TableSortLabel>
                </TableCell>
                {!personName?.includes("Tags") && (
                  <TableCell sortDirection={orderBy === "tag_id" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "tag_id"}
                      direction={orderBy === "tag_id" ? order : "asc"}
                      onClick={() => handleRequestSort("tag_id")}
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
                {!personName?.includes("Featured") && (
                  <TableCell sortDirection={orderBy === "featured" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "featured"}
                      direction={orderBy === "featured" ? order : "asc"}
                      onClick={() => handleRequestSort("featured")}
                    >
                      Featured
                    </TableSortLabel>
                  </TableCell>
                )}
                {!personName?.includes("Action") && <TableCell>Action</TableCell>}
              </TableRow>
            </TableHead>
            {allBlogs?.length > 0 ? (
              <TableBody>
                {(rowsPerPage > 0
                  ? sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : sortedRows
                ).map((row) => {
                  return (
                    <TableRow key={row._id}>
                      <TableCell>{row["S.No"]}</TableCell>
                      <TableCell>{row.title}</TableCell>
                      {!personName?.includes("Tags") && (
                        <TableCell>
                          {row?.tag_id?.map((tag, index) => (
                            <span key={index}>
                              {tag?.title}
                              {index < row.tag_id.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </TableCell>
                      )}

                      {!personName?.includes("Status") && (
                        <TableCell>
                          <Switch
                            // onChange={(e) => handleStatusChange({ id: row?._id, status: !row.status })}
                            onClick={() => {
                              handleOpen("blogStatus");
                              setStatusData(() => ({ id: row?._id, status: !row.status }));
                            }}
                            checked={row.status}
                            {...label}
                          />
                        </TableCell>
                      )}
                      {!personName?.includes("Featured") && (
                        <TableCell>
                          <Switch
                            // onChange={(e) =>
                            //   handleFeaturedStatusChange({ id: row?._id, featured: !row.featured })
                            // }
                            onClick={() => {
                              handleOpen("blogFeaturedStatus");
                              setStatusData(() => ({ id: row?._id, featured: !row.featured }));
                            }}
                            checked={row?.featured}
                            {...label}
                          />
                        </TableCell>
                      )}
                      {/* <TableCell>
                      <IconButton
                        onClick={() => navigate(`${ROUTE_CONSTANT.brand.add}?id=${row._id}`)}
                      >
                        <Icon color="primary">edit</Icon>
                      </IconButton>
                    </TableCell> */}
                      {!personName?.includes("Action") && (
                        <TableCell>
                          <IconButton
                            onClick={() => navigate(`${ROUTE_CONSTANT.blog.add}?id=${row._id}`)}
                          >
                            <Icon color="primary">edit</Icon>
                          </IconButton>

                          <IconButton
                            onClick={() => {
                              handleOpen("blogDelete");
                              setStatusData(row?._id);
                            }}
                          >
                            <Icon sx={{ color: "red" }}>delete</Icon>
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell align="center" colSpan={6}>
                    <Typography fontSize={15} fontWeight="bold" my={2}>
                      No Data Found
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[25, 50, 75, 100]}
          component="div"
          count={allBlogs.length}
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
        handleFeaturedStatusChange={handleFeaturedStatusChange}
        handleDelete={handleDelete}
      />
    </Container>
  );
};

export default BlogList;
