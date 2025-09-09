import React, { useEffect, useState, useCallback } from "react";
import styled from "@emotion/styled";
import ArrowRight from "@mui/icons-material/ArrowRight";
import { useTheme } from "@mui/material/styles";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import OutlinedInput from "@mui/material/OutlinedInput";
import ListItemText from "@mui/material/ListItemText";

import {
  Box,
  Button,
  Icon,
  IconButton,
  Paper,
  Stack,
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
  Typography,
  Menu,
  InputAdornment
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";
import { Breadcrumb } from "app/components";
import SearchIcon from "@mui/icons-material/Search";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { ApiService } from "app/services/ApiService";
import { localStorageKey } from "app/constant/localStorageKey";
import { useNavigate } from "react-router-dom";
import { exportToExcel } from "app/utils/excelExport";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { Dropdown, DropdownMenuItem, DropdownNestedMenuItem } from "../Catalog/Category/DropDown";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import DataTable from "app/components/ProductListTable/ProductListTable";
import ProductParentTable from "app/components/ProductListTable/ProductParentTable";
import { Label } from "@mui/icons-material";
import { toast } from "react-toastify";
import ClearIcon from "@mui/icons-material/Clear";
import ConfirmModal from "app/components/ConfirmModal";

const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
  }
}));

const ProductList = () => {
  const [productList, setProductLIst] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(0);
  const [exportData, setExportData] = useState([]);
  const [search, setSearch] = useState("");
  const [allActiveCategory, setAllActiveCategory] = useState([]);
  const [order, setOrder] = useState("none");
  const [orderBy, setOrderBy] = useState(null);
  const [variantAttr, setvariantAttr] = useState("");
  const [getallProductList, setGetAllProductList] = useState([]);
  const [filterProducts, setFilterProducts] = useState(getallProductList);
  const [anchorEl, setAnchorEl] = useState(null);
  const openOption = Boolean(anchorEl);
  const [productIds, setProductIds] = useState([]);
  const [variationsIds, setVariationsIds] = useState([]);
  const [totalProductIdsCount, setTotalProductIdsCount] = useState(null);
  const [totalVariationIdsCount, setTotalVariationIdsCount] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading,setLoading] = useState(false);
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);
  const designation_id = localStorage.getItem(localStorageKey.designation_id);

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

  console.log({ filterProducts });

  const handleClick = (event, index) => {
    setAnchorEl(event.currentTarget);
  };

  const theme = useTheme();

  const getAllProductList = async () => {
    try {
      let url = `${apiEndpoints.getProduct}?type=${statusFilter}&category=${variantAttr}`;
      setLoading(true);
      const res = await ApiService.get(url, auth_key);
      if (res.status == 200) {
        setLoading(false);
        setGetAllProductList(res.data.data);

        const allProductIds = res?.data?.data
          .filter((row) => row.type === "product")
          .map((row) => row)
          .concat(
            res?.data?.data
              .filter((row) => row.type === "variations")
              .flatMap((row) => row.productData.map((item) => item))
          );
        setExportData(allProductIds);
      }
    } catch (error) {
      setLoading(false);
      handleOpen("error", error);
    }
  };

  useEffect(() => {
    getAllProductList();
  }, [auth_key, statusFilter, variantAttr]);

  useEffect(() => {
    getAllActiveCategory();

    return () => {
      setProductLIst([]);
      setOrder("none");
      setOrderBy(null);
    };
  }, []);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const getAllActiveCategory = async () => {
    try {
      const res = await ApiService.get(apiEndpoints.getAllActiveCategory, auth_key);
      if (res?.status === 200) {
        function flattenArray(data) {
          let result = [];

          function recurse(items) {
            for (const item of items) {
              // Create a shallow copy of the item without the 'subs' key
              let { subs, ...itemWithoutSubs } = item;
              result.push(itemWithoutSubs);
              if (subs && subs.length > 0) {
                recurse(subs);
              }
            }
          }

          recurse(data);
          return result;
        }

        const flatArray = flattenArray(res?.data?.subCatgory);

        setAllActiveCategory(flatArray);

        // setAllActiveCategory([
        //   { subs: [{ title: "All Product", subs: [], id: "" }, ...res?.data?.subCatgory] }
        // ]);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  const sortComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    const aValue = orderBy.includes(".")
      ? orderBy.split(".").reduce((o, i) => (o ? o[i] : null), a)
      : a[orderBy];
    const bValue = orderBy.includes(".")
      ? orderBy.split(".").reduce((o, i) => (o ? o[i] : null), b)
      : b[orderBy];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return aValue - bValue;
    }

    if (bValue < aValue) {
      return -1;
    }
    if (bValue > aValue) {
      return 1;
    }
    return 0;
  };

  const sortedRows = orderBy
    ? [...productList].sort((a, b) =>
        order === "asc"
          ? sortComparator(a, b, orderBy)
          : order === "desc"
          ? sortComparator(b, a, orderBy)
          : 0
      )
    : productList;

  function getStyles(name, variantAttr, theme) {
    return {
      fontWeight:
        variantAttr.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium
    };
  }

  // const handle = (event) => {
  //   const {
  //     target: { value }
  //   } = event;
  //   setvariantAttr(
  //     // On autofill we get a stringified value.
  //     typeof value === "string" ? value.split(",") : value
  //   );
  // };

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

  console.log({ allActiveCategory });

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14
    }
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0
    }
  }));

  function createData(name, calories, fat, carbs, protein) {
    return { name, calories, fat, carbs, protein };
  }

  const rows = [
    createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
    createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
    createData("Eclair", 262, 16.0, 24, 6.0),
    createData("Cupcake", 305, 3.7, 67, 4.3),
    createData("Gingerbread", 356, 16.0, 49, 3.9)
  ];

  const names = [
    "Status",
    "Image",
    "Product Id",
    "SKU",
    "Product Title",
    "Available",
    "Sale Price"
  ];

  const [personName, setPersonName] = React.useState(
    JSON.parse(localStorage.getItem(localStorageKey.productTable)) || []
  );

  const handleChange = (event) => {
    const {
      target: { value }
    } = event;
    const setPerson = typeof value === "string" ? value.split(",") : value;
    setPersonName(setPerson);
    localStorage.setItem(localStorageKey.productTable, JSON.stringify(setPerson));
    if (setPerson.length <= 0) {
      localStorage.removeItem(localStorageKey.productTable);
    }
  };

  const handleMasterCheckboxChange = (isChecked, rows) => {
    if (isChecked) {
      const allProductIds = rows
        .filter((row) => row.type === "product")
        .map((row) => row._id)
        .concat(
          rows
            .filter((row) => row.type === "variations")
            .flatMap((row) => row.productData.map((item) => item._id))
        );

      const allVariationIds = rows.filter((row) => row.type === "variations").map((row) => row._id);

      setProductIds(allProductIds);
      setVariationsIds(allVariationIds);
      setTotalProductIdsCount(allProductIds?.length);
      setTotalVariationIdsCount(allVariationIds?.length);
    } else {
      setProductIds([]);
      setVariationsIds([]);
      setTotalProductIdsCount(null);
      setTotalVariationIdsCount(null);
    }
  };

  const handleCheckboxChange = (id, row) => {
    setProductIds((prev) => {
      const newIds = prev.includes(id) ? prev.filter((orderId) => orderId !== id) : [...prev, id];

      const allProductDataChecked = row?.productData?.every((item) => newIds.includes(item._id));

      if (!allProductDataChecked) {
        setVariationsIds((prevVariationsIds) =>
          prevVariationsIds.filter((orderId) => orderId !== row._id)
        );
      } else {
        setVariationsIds((prevVariationsIds) => [...prevVariationsIds, row._id]);
      }

      return newIds;
    });
  };

  const handleVariationsCheckbox = (ids, id) => {
    setVariationsIds((prev) => {
      if (prev.includes(id)) {
        setProductIds((prevProductIds) =>
          prevProductIds.filter((productId) => !ids.includes(productId))
        );
        return prev.filter((orderId) => orderId !== id);
      } else {
        setProductIds((prevProductIds) => [...new Set([...prevProductIds, ...ids])]);
        return [...prev, id];
      }
    });
  };

  const handleCombinedCheckboxClick = (row) => {
    const variationIds = row?.productData?.map((item) => item._id);

    handleVariationsCheckbox(variationIds, row?._id);
  };

  const label = { inputProps: { "aria-label": "Checkbox demo" } };


  const handleChangeStatusProduct = async (status,deleteStatus) => {
    if (productIds?.length > 0) {
      try {
        let payload = { _id: productIds }
        if(status == "delete"){
          payload.delete = deleteStatus;
        }else if(status == "draft"){
          payload.draft = deleteStatus
        }else{
          payload.status = status
        }
        const res = await ApiService.post(apiEndpoints.changeAllStatusProduct, payload, auth_key);
        if (res?.status === 200) {
          getAllProductList();
          setAnchorEl(null);
          setProductIds([]);
          setVariationsIds([]);
          setTotalProductIdsCount(null);
          setTotalVariationIdsCount(null);
          handleOpen("success", res?.data);
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  };

  const handleSearch = () => {
    if (search) {
      const trimmedSearch = search.trim().toLowerCase();

      const filterData = getallProductList.filter((product) => {
        if (product.sku_code || product.seller_sku) {
          return (
            product?.product_title?.toLowerCase().includes(trimmedSearch) ||
            product?.sku_code?.toLowerCase().includes(trimmedSearch) ||
            product?.seller_sku?.toLowerCase().includes(trimmedSearch) ||
            product?._id?.toLowerCase().includes(trimmedSearch)
          );
        } else if (product.productData && Array.isArray(product.productData)) {
          return product.productData.some((variant) =>
            variant.sku_code?.toLowerCase().includes(trimmedSearch)
          );
        }
        return false;
      });

      console.log({ filterData });
      setFilterProducts(filterData.length > 0 ? filterData : ["No Product Found"]);
    } else {
      setFilterProducts([]);
    }
  };

  console.log({ getallProductList, filterProducts }, "EJJJJJJJJY");

  return (
    <Container>
      <Box
        className="breadcrumb"
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <Breadcrumb routeSegments={[{ name: "Product", path: "" }, { name: "Product" }]} />
        <Box>
          <Button
            sx={{ marginRight: "16px" }}
            onClick={() => navigate(ROUTE_CONSTANT.catalog.product.parentProducts)}
            variant="contained"
          >
            Add Parent Products
          </Button>
          <Button
            sx={{ marginRight: "16px" }}
            onClick={() => navigate(ROUTE_CONSTANT.catalog.product.add)}
            variant="contained"
          >
            Add Product
          </Button>
          <Button onClick={() => exportToExcel(exportData, "Product.xlsx")} variant="contained">
            Export Products
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: "16px", justifyContent: "flex-start", flexWrap: "wrap" }}>
        <Box
          sx={{
            background: "#fff",
            height: "36px",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            border: "1px solid #c8c8c8",
            borderRadius: "8px"
          }}
        >
          <Typography component="div">
            <Checkbox
              {...label}
              checked={
                productIds.length === totalProductIdsCount &&
                variationsIds.length === totalVariationIdsCount
              }
              onChange={(e) => handleMasterCheckboxChange(e.target.checked, getallProductList)}
              size="small"
            />
          </Typography>
          <Typography>{productIds?.length}</Typography>

          <Typography component="div" textAlign={"start"}>
            <Button
              sx={{ color: "#000" }}
              id={`basic-button`}
              aria-controls={openOption ? `basic-menu` : undefined}
              aria-haspopup="true"
              aria-expanded={openOption ? "true" : undefined}
              onClick={handleClick}
            >
              Action <ArrowDropDownIcon />
            </Button>
            <Menu
              id={`basic-menu`}
              anchorEl={anchorEl}
              open={openOption}
              onClose={() => setAnchorEl(null)}
              MenuListProps={{
                "aria-labelledby": `basic-button`
              }}
            >
              <MenuItem onClick={() => handleChangeStatusProduct(true)}>Active</MenuItem>
              <MenuItem onClick={() => handleChangeStatusProduct(false)}>Inctive</MenuItem>
              <MenuItem onClick={() => handleChangeStatusProduct("draft",true)}>Draft</MenuItem>
              <MenuItem onClick={() => handleChangeStatusProduct("delete",true)}>Delete</MenuItem>
            </Menu>
          </Typography>
        </Box>
        <Box>
          <Box sx={{ minWidth: "50%" }}>
            <FormControl>
              <InputLabel sx={{ top: "-6px" }} id="demo-multiple-name-label">
                Category
              </InputLabel>
              <Select
                sx={{ minWidth: "187px", maxWidth: "187px" }}
                labelId="demo-multiple-name-label"
                id="demo-multiple-name"
                size="small"
                value={variantAttr}
                onChange={(e) => setvariantAttr(e.target.value)}
                input={
                  <OutlinedInput
                    label="Name"
                    endAdornment={
                      variantAttr ? (
                        <InputAdornment position="end" sx={{ mr: 2 }}>
                          <IconButton
                            aria-label="clear selection"
                            edge="end"
                            sx={{ fontSize: "18px" }}
                          >
                            <ClearIcon fontSize="18px" onClick={() => setvariantAttr("")} />
                          </IconButton>
                        </InputAdornment>
                      ) : null
                    }
                  />
                }
                MenuProps={MenuProps}
              >
                {allActiveCategory?.map((name) => (
                  <MenuItem
                    key={name.id}
                    value={name.id}
                    style={getStyles(name, variantAttr, theme)}
                  >
                    {name.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: "16px", marginBottom: 2 }}>
          <Box>
            <TextField
              size="small"
              label="Search SKU, Title,Product Id"
              placeholder="Search SKU, Title, Product Id"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              type="text"
              InputProps={{
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      sx={{ fontSize: "18px" }}
                      onClick={() => {
                        setSearch("");
                        setFilterProducts([]);
                      }}
                    >
                      <ClearIcon fontSize="18px" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
            />
          </Box>
          <Button variant="contained" size="small" onClick={handleSearch}>
            Search
          </Button>
        </Box>
      </Box>
      <Box>
        <Box
          p={3}
          sx={{
            background: "#f1f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>Filters:</span>
            <span style={{ margin: "0 10px 0 15px" }}>Status:</span>
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <FormControlLabel value="all" control={<Radio />} label="All" />
              <FormControlLabel value="active" control={<Radio />} label="Active" />
              <FormControlLabel value="inactive" control={<Radio />} label="Inactive" />
              <FormControlLabel value="sold-out" control={<Radio />} label="Sold Out" />
              <FormControlLabel value="draft" control={<Radio />} label="Draft" />
              {
                designation_id == "2" && (
                  <FormControlLabel value="delete" control={<Radio />} label="Delete" />
                )
              }
            </RadioGroup>
          </div>

          <FormControl
            sx={{
              width: 300,
              "& .MuiOutlinedInput-root": {
                height: "40px"
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

        {/* new design work  */}
        <>
          <DataTable
            setProductList={filterProducts.length > 0 ? setFilterProducts : setGetAllProductList}
            productList={filterProducts.length > 0 ? (rowsPerPage > 0 ? filterProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : filterProducts) : (rowsPerPage > 0 ? getallProductList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : getallProductList)}
            personName={personName}
            getAllProductList={getAllProductList}
            productIds={productIds}
            setProductIds={setProductIds}
            handleCheckboxChange={handleCheckboxChange}
            handleVariationsCheckbox={handleVariationsCheckbox}
            variationsIds={variationsIds}
            handleCombinedCheckboxClick={handleCombinedCheckboxClick}
            rowsPerPage={rowsPerPage}
            page={page}
            loading={loading}
          />
        </>

        {/* end desing work  */}
        <TablePagination
          rowsPerPageOptions={[25, 50, 75, 100]}
          component="div"
          count={getallProductList?.length}
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

export default ProductList;
