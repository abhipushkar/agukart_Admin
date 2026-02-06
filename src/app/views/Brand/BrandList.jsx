import styled from "@emotion/styled";
import { Breadcrumb } from "app/components";
import { Icon, TablePagination, TextField } from "@mui/material";
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
import ConfirmModal from "app/components/ConfirmModal";

const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
  }
}));

const BrandList = () => {
  const label = { inputProps: { "aria-label": "Switch demo" } };
  const [rowsPerPage, setRowsPerPage] = useState(200);
  const [page, setPage] = useState(0);
  const [allBrands, setAllBrands] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("none");
  const [orderBy, setOrderBy] = useState(null);
  const [SearchList, setSearchList] = useState([]);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);
  const [statusData, setStatusData] = useState({});
  const navigate = useNavigate();

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

  const getBrandList = useCallback(async () => {
    try {
      let url = `${apiEndpoints.getBrand}`;

      const res = await ApiService.get(url, auth_key);
      if (res.status === 200) {
        const myNewList = res?.data?.brand.map((e, i) => {
          return { "S.No": i + 1, ...e };
        });
        setAllBrands(myNewList);
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
    getBrandList();
  }, []);

  // const changeBrandStatus = async (row) => {
  //   try {
  //     const payload = {
  //       id: row._id,
  //       status: !row.status
  //     };
  //     const res = await ApiService.post(apiEndpoints.changeStatusBrand, payload, auth_key);
  //     if (res.status === 200) {
  //       getBrandList();
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const handleStatusChange = useCallback(async () => {
    if (statusData) {
      try {
        const payload = statusData;
        const res = await ApiService.post(apiEndpoints.changeStatusBrand, payload, auth_key);
        if (res.status === 200) {
          getBrandList();
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  }, [auth_key, getBrandList, statusData]);

  const handleFeaturedStatusChange = useCallback(async () => {
    if (statusData) {
      try {
        const payload = statusData;
        const res = await ApiService.post(
          apiEndpoints.changeFeaturedStatusBrand,
          payload,
          auth_key
        );
        if (res.status === 200) {
          getBrandList();
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  }, [auth_key, getBrandList, statusData]);

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
    setAllBrands(filteredItemsWithSNo);
  };

  const asyncFilter = async () => {
    await getBrandList();
    filterHandler();
  };

  useEffect(() => {
    if (search) {
      asyncFilter();
    } else {
      getBrandList();
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
    ? [...allBrands].sort((a, b) =>
      order === "asc"
        ? sortComparator(a, b, orderBy)
        : order === "desc"
          ? sortComparator(b, a, orderBy)
          : 0
    )
    : allBrands;

  return (
    <Container>
      <Box
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        className="breadcrumb"
      >
        <Breadcrumb routeSegments={[{ name: "Brand", path: "" }, { name: "Brand List" }]} />
        <Box display={"flex"} gap={"16px"} alignItems={"center"}>
          <Box>
            <TextField
              size="small"
              label="Search"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              type="text"
            />
          </Box>
          <Button onClick={() => navigate(ROUTE_CONSTANT.brand.add)} variant="contained">
            Add Brand
          </Button>
          <Button onClick={() => exportToExcel(excelData)} variant="contained">
            Export Brands
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
                <TableCell sortDirection={orderBy === "title" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "title"}
                    direction={orderBy === "title" ? order : "asc"}
                    onClick={() => handleRequestSort("title")}
                  >
                    Name
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
                <TableCell sortDirection={orderBy === "featured" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "featured"}
                    direction={orderBy === "featured" ? order : "asc"}
                    onClick={() => handleRequestSort("featured")}
                  >
                    Featured
                  </TableSortLabel>
                </TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
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
                        // onChange={() => changeBrandStatus(row)}
                        onClick={() => {
                          handleOpen("brandStatus");
                          setStatusData(() => ({ id: row?._id, status: !row.status }));
                        }}
                        checked={row.status}
                        {...label}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        // onChange={() => changeBrandStatus(row)}
                        onClick={() => {
                          handleOpen("brandFeaturedStatus");
                          setStatusData(() => ({ id: row?._id, featured: !row.featured }));
                        }}
                        checked={row?.featured}
                        {...label}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => navigate(`${ROUTE_CONSTANT.brand.add}?id=${row._id}`)}
                      >
                        <Icon color="primary">edit</Icon>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[25, 50, 75, 100, 200]}
          component="div"
          count={allBrands.length}
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
      />
    </Container>
  );
};

export default BrandList;
