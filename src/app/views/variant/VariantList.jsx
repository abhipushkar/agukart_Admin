import styled from "@emotion/styled";
import { Breadcrumb } from "app/components";
import { Icon, TablePagination, TextField } from "@mui/material";
import { useState, useEffect, useCallback, useDeferredValue } from "react";
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
import OutlinedInput from "@mui/material/OutlinedInput";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import ConfirmModal from "app/components/ConfirmModal";

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

const names = ["Display Layout", "Short Order", "Status", "Categories", "Product", "Action"];

const VariantList = () => {
  const label = { inputProps: { "aria-label": "Switch demo" } };
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(0);
  const [allVariants, setAllVariants] = useState([]);
  const [SearchList, setSearchList] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("none");
  const [orderBy, setOrderBy] = useState(null);
  const [variant_id, setVariantId] = useState("");
  const navigate = useNavigate();
  const DeferredValue = useDeferredValue(search);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [personName, setPersonName] = useState(
    JSON.parse(localStorage.getItem(localStorageKey.variantTable)) || []
  );

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

  const handleChange = (event) => {
    const {
      target: { value }
    } = event;
    const setPerson = typeof value === "string" ? value.split(",") : value;
    setPersonName(setPerson);
    localStorage.setItem(localStorageKey.variantTable, JSON.stringify(setPerson));
    if (setPerson.length <= 0) {
      localStorage.removeItem(localStorageKey.variantTable);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const auth_key = localStorage.getItem(localStorageKey.auth_key);

  const getVariantList = useCallback(async () => {
    try {
      let url = `${apiEndpoints.getVariant}`;

      const res = await ApiService.get(url, auth_key);
      console.log(res);
      if (res.status === 200) {
        const myNewList = res?.data?.variant?.map((e, i) => {
          return { "S.No": i + 1, ...e };
        });
        setAllVariants(myNewList);
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
    getVariantList();
  }, []);

  const handleDelete = useCallback(async () => {
    if (variant_id) {
      try {
        const id = variant_id;
        const res = await ApiService.delete(`${apiEndpoints.deleteVariant}/${id}`, auth_key);
        if (res.status === 200) {
          getVariantList();
          toast.success(res?.data?.message);
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  }, [auth_key, getVariantList, variant_id]);

  const changeVariantStatus = async (row) => {
    try {
      const payload = {
        id: row._id,
        status: !row.status
      };
      const res = await ApiService.post(apiEndpoints.changeStatusVariant, payload, auth_key);
      if (res.status === 200) {
        getVariantList();
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  const changeVariantCateStatus = async (row) => {
    try {
      const payload = {
        id: row._id,
        status: !row.category_status
      };
      const res = await ApiService.post(
        apiEndpoints.changeStatusVariantCategory,
        payload,
        auth_key
      );
      if (res.status === 200) {
        getVariantList();
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  const changeVariantProductStatus = async (row) => {
    try {
      const payload = {
        id: row._id,
        status: !row.product_status
      };
      const res = await ApiService.post(apiEndpoints.changeStatusVariantProduct, payload, auth_key);
      if (res.status === 200) {
        getVariantList();
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  const filterHandler = () => {
    const filteredItems = SearchList.filter((item) =>
      item.variant_name.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => {
      const aIndex = a.variant_name.toLowerCase().indexOf(search.toLowerCase());
      const bIndex = b.variant_name.toLowerCase().indexOf(search.toLowerCase());
      return aIndex - bIndex || a.variant_name.localeCompare(b.variant_name);
    });
    console.log(filteredItems);
    setAllVariants(filteredItems);
  };

  const asyncFilter = async () => {
    await getVariantList();
    filterHandler();
  };

  useEffect(() => {
    if (search) {
      asyncFilter();
    } else {
      getVariantList();
    }
  }, [DeferredValue]);

  console.log(allVariants);

  // const deleteVariantHandler = async (id) => {
  //   try {
  //     const res = await ApiService.delete(`${apiEndpoints.deleteVariant}/${id}`, auth_key);
  //     if (res.status === 200) {
  //       getVariantList();
  //       toast.success(res?.data?.message);
  //     }
  //   } catch (error) {
  //     console.log();
  //   }
  // };

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
    ? [...allVariants].sort((a, b) =>
      order === "asc"
        ? sortComparator(a, b, orderBy)
        : order === "desc"
          ? sortComparator(b, a, orderBy)
          : 0
    )
    : allVariants;

  return (
    <Container>
      <Box
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        className="breadcrumb"
      >
        <Breadcrumb routeSegments={[{ name: "Variant", path: "" }, { name: "Variant List" }]} />
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
              label="Search"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              type="text"
            />
          </Box>
          <Button onClick={() => navigate(ROUTE_CONSTANT.catalog.variant.add)} variant="contained" sx={{ whiteSpace: "nowrap", width: "180px", minWidth: "120px" }}>
            Add Variant
          </Button>
          <Button onClick={() => exportToExcel(excelData)} variant="contained" sx={{ whiteSpace: "nowrap", width: "180px", minWidth: "120px" }}>
            Export Variants
          </Button>
        </Box>
      </Box>

      <Box>
        <TableContainer sx={{ paddingLeft: 2, paddingRight: 2 }} component={Paper}>
          <Table
            sx={{
              width: "max-content",
              minWidth: "100%",
              '.MuiTableCell-root': {
                padding: '12px 5px'
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
                <TableCell sortDirection={orderBy === "variant_name" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "variant_name"}
                    direction={orderBy === "variant_name" ? order : "asc"}
                    onClick={() => handleRequestSort("variant_name")}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                {!personName?.includes("Display Layout") && <TableCell sortDirection={orderBy === "display_layout" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "display_layout"}
                    direction={orderBy === "display_layout" ? order : "asc"}
                    onClick={() => handleRequestSort("display_layout")}
                  >
                    Display Layout
                  </TableSortLabel>
                </TableCell>}
                {/* {!personName?.includes("Short Order") && <TableCell sortDirection={orderBy === "sort_order" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "sort_order"}
                    direction={orderBy === "sort_order" ? order : "asc"}
                    onClick={() => handleRequestSort("sort_order")}
                  >
                    Short Order
                  </TableSortLabel>
                </TableCell>} */}
                {!personName?.includes("Status") && <TableCell sortDirection={orderBy === "status" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "status"}
                    direction={orderBy === "status" ? order : "asc"}
                    onClick={() => handleRequestSort("status")}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>}
                {!personName?.includes("Categories") && <TableCell sortDirection={orderBy === "category_status" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "category_status"}
                    direction={orderBy === "category_status" ? order : "asc"}
                    onClick={() => handleRequestSort("category_status")}
                  >
                    Categories
                  </TableSortLabel>
                </TableCell>}
                {!personName?.includes("Product") && <TableCell sortDirection={orderBy === "product_status" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "product_status"}
                    direction={orderBy === "product_status" ? order : "asc"}
                    onClick={() => handleRequestSort("product_status")}
                  >
                    Product
                  </TableSortLabel>
                </TableCell>}
                {!personName?.includes("Action") && <TableCell sx={{ textAlign: "center" }}>Action</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : sortedRows
              ).map((row) => {
                console.log("rowrow", row);
                return (
                  <TableRow key={row._id}>
                    <TableCell>{row["S.No"]}</TableCell>
                    <TableCell>{row.variant_name}</TableCell>
                    {!personName?.includes("Display Layout") && <TableCell>
                      {row.display_layout === 1
                        ? "Dropdown swatch"
                        : row.display_layout === 2
                          ? "Visual swatch"
                          : "Text swatch"}
                    </TableCell>}
                    {/* {!personName?.includes("Short Order") && <TableCell>{row.sort_order}</TableCell>} */}
                    {!personName?.includes("Status") && <TableCell>
                      <Switch onChange={() => changeVariantStatus(row)} checked={row.status} />
                    </TableCell>}
                    {!personName?.includes("Categories") && <TableCell>
                      <Switch
                        onChange={() => changeVariantCateStatus(row)}
                        checked={row.category_status}
                      />
                    </TableCell>}
                    {!personName?.includes("Product") && <TableCell>
                      <Switch
                        onChange={() => changeVariantProductStatus(row)}
                        checked={row.product_status}
                      />
                    </TableCell>}
                    {!personName?.includes("Action") && <TableCell sx={{ textAlign: "center" }}>
                      <IconButton onClick={() => {
                        handleOpen("variantDelete");
                        setVariantId(row?._id);
                        // deleteVariantHandler(row._id)
                        }}>
                        <Icon sx={{ color: "#DC3545" }}>delete</Icon>
                      </IconButton>
                      <IconButton
                        onClick={() =>
                          navigate(`${ROUTE_CONSTANT.catalog.variant.add}?id=${row._id}`)
                        }
                      >
                        <Icon color="primary">edit</Icon>
                      </IconButton>
                    </TableCell>}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[25, 50, 75, 100]}
          component="div"
          count={allVariants.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
      <ConfirmModal open={open} handleClose={handleClose} handleDelete={handleDelete} type={type} msg={msg} />
    </Container>
  );
};

export default VariantList;
