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
  TableSortLabel
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

const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
  }
}));

const TagList = () => {
  const label = { inputProps: { "aria-label": "Switch demo" } };
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(0);
  const [allTags, setAllTags] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("none");
  const [orderBy, setOrderBy] = useState(null);
  const [SearchList, setSearchList] = useState([]);
  const navigate = useNavigate();

  const [open, setOpen] = React.useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);

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

  const getTagList = useCallback(async () => {
    try {
      let url = `${apiEndpoints.getBlogTag}`;

      const res = await ApiService.get(url, auth_key);
      if (res.status === 200) {
        const myNewList = res?.data?.data.map((e, i) => {
          return { "S.No": i + 1, ...e };
        });
        setAllTags(myNewList);
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
    getTagList();
  }, []);

  const handleStatusChange = useCallback(
    async (payload) => {
      try {
        const res = await ApiService.post(apiEndpoints.changeStatusBlogTag, payload, auth_key);
        if (res.status === 200) {
          getTagList();
        }
      } catch (error) {
        handleOpen("error", error);
      }
    },
    [auth_key, getTagList]
  );

  //   const handleFeaturedStatusChange = useCallback(
  //     async (payload) => {
  //       try {
  //         const res = await ApiService.post(apiEndpoints.changeFeaturedStatusBlog, payload, auth_key);
  //         if (res.status === 200) {
  //           getTagList();
  //         }
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     },
  //     [auth_key, getTagList]
  //   );

  //   const handleDelete = async (id) => {
  //     try {
  //       const res = await ApiService.delete(`${apiEndpoints.deleteBlog}/${id}`, auth_key);
  //       if (res?.status === 200) {
  //         toast.success(res?.data?.message);
  //         getTagList();
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  // const changeBrandStatus = async (row) => {
  //   try {
  //     const payload = {
  //       id: row._id,
  //       status: !row.status
  //     };
  //     const res = await ApiService.post(apiEndpoints.changeStatusBrand, payload, auth_key);
  //     if (res.status === 200) {
  //       getTagList();
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
    setAllTags(filteredItemsWithSNo);
  };

  const asyncFilter = async () => {
    await getTagList();
    filterHandler();
  };

  useEffect(() => {
    if (search) {
      asyncFilter();
    } else {
      getTagList();
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
    ? [...allTags].sort((a, b) =>
        order === "asc"
          ? sortComparator(a, b, orderBy)
          : order === "desc"
          ? sortComparator(b, a, orderBy)
          : 0
      )
    : allTags;

  return (
    <Container>
      <Box
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        className="breadcrumb"
      >
        <Breadcrumb routeSegments={[{ name: "Tag", path: "" }, { name: "Tag List" }]} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            flexWrap: "wrap",
            alignItems: "center"
          }}
        >
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
                    Tag Title
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
            {allTags.length > 0 ? (
              <TableBody>
                {(rowsPerPage > 0
                  ? sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : sortedRows
                ).map((row) => {
                  return (
                    <TableRow key={row._id}>
                      <TableCell>{row["S.No"]}</TableCell>
                      <TableCell>{row.title}</TableCell>
                      <TableCell>
                        <Switch
                          onChange={(e) =>
                            handleStatusChange({ id: row?._id, status: !row.status })
                          }
                          checked={row.status}
                          {...label}
                        />
                      </TableCell>
                      {/* <TableCell>
                      <IconButton
                        onClick={() => navigate(`${ROUTE_CONSTANT.brand.add}?id=${row._id}`)}
                      >
                        <Icon color="primary">edit</Icon>
                      </IconButton>
                    </TableCell> */}
                      <TableCell>
                        <IconButton
                          onClick={() => navigate(`${ROUTE_CONSTANT.tag.add}?id=${row._id}`)}
                        >
                          <Icon color="primary">edit</Icon>
                        </IconButton>
                      </TableCell>
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
          count={allTags.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </Container>
  );
};

export default TagList;
