import styled from "@emotion/styled";
import React from "react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import AppsIcon from "@mui/icons-material/Apps";
import { Formik, ErrorMessage, Field, Form } from "formik";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import * as Yup from "yup";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { toast } from "react-toastify";
import { useEffect } from "react";
import ArrowRight from "@mui/icons-material/ArrowRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Dropdown, DropdownMenuItem, DropdownNestedMenuItem } from "../Catalog/Category/DropDown";
import BasicTabs from "./ProductTabs";
import ConfirmModal from "app/components/ConfirmModal";

const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
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
  "Oliver Hansen",
  "Van Henry",
  "April Tucker",
  "Ralph Hubbard",
  "Omar Alexander",
  "Carlos Abbott",
  "Miriam Wagner",
  "Bradley Wilkerson",
  "Virginia Andrews",
  "Kelly Snyder"
];

function getStyles(name, variantAttr, theme) {
  return {
    fontWeight:
      variantAttr.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium
  };
}

const validationSchema = Yup.object().shape({
  productTitle: Yup.string().required("Product Title is required"),
  taxRatio: Yup.number()
    .required("Tax Ratio is required")
    .min(0, "Tax Ratio must be at least 0")
    .max(100, "Tax Ratio must be at most 100"),
  shortDescription: Yup.string().nullable(),
  description: Yup.string().nullable()
});
const AddProduct = () => {
  const [query, setQuery] = useSearchParams();
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [editProduct, setEditProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [getCatData, setCatData] = useState({});
  const [selectedCatId, setSelectedCatId] = useState("");
  const [selectedCatLable, setSelectedCatLable] = useState("Select Category");
  const [variantAttrLable, setVariantAttrLable] = useState("Select VariantAttribute");
  const [variantList, setVariantList] = useState([]);
  const [variantAttr, setvariantAttr] = useState([]);
  const [brandList, setBrandlist] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");

  const [allActiveCategory, setAllActiveCategory] = useState([]);

  const navigate = useNavigate();
  const theme = useTheme();

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

  const getAllActiveCategory = async () => {
    try {
      const res = await ApiService.get(apiEndpoints.getAllActiveCategory, auth_key);
      if (res?.status === 200) {
        setAllActiveCategory([{ subs: res?.data?.subCatgory }]);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  const handle = (event) => {
    const {
      target: { value }
    } = event;
    setvariantAttr(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const handleSelectBrand = (event) => {
    setSelectedBrand(event.target.value);
  };

  function returnJSX(subItems) {
    if (!subItems?.length) {
      return [];
    }
    let content = subItems.map((items) => {
      if (!items?.subs?.length) {
        return (
          <DropdownMenuItem
            onClick={() => {
              console.log(items.title);
              setSelectedCatId(items?.id);
              setSelectedCatLable(items.title);
            }}
          >
            {items?.title}
          </DropdownMenuItem>
        );
      } else {
        return (
          <DropdownNestedMenuItem
            onClick={() => {
              setSelectedCatId(items?.id);
              setSelectedCatLable(items?.title);
            }}
            label={items?.title}
            menu={returnJSX(items?.subs || []) || []}
            rightIcon={<ArrowRight />}
          />
        );
      }
    });
    return content || [];
  }

  const getVariantList = async () => {
    const res = await ApiService.get(apiEndpoints.getVariant, auth_key);
    if (res.status === 200) {
      setVariantList(res?.data?.variant);
    }
  };
  const getBrandList = async () => {
    try {
      const res = await ApiService.get(apiEndpoints.getActiveBrands, auth_key);

      if (res.status === 200) {
        setBrandlist(res?.data?.brand);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  useEffect(() => {
    if (editProduct !== null) {
      setSelectedBrand(editProduct?.brand_data?._id);
      setvariantAttr(editProduct.variant_id);
    }
  }, [editProduct]);

  useEffect(() => {
    // getAllActiveCategory();
    getBrandList();
    // getVariantList();
  }, []);

  console.log("dddd", variantAttr);

  // //////////////// tabs

  return (
    <Container>
      <Box sx={{ py: "16px" }} component={Paper}>
        <Stack sx={{ ml: "16px", mb: "12px" }} gap={1} direction={"row"}>
          <Box>
            <AppsIcon />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Go To</Typography>
          </Box>
        </Stack>
        <Divider />
        <Box sx={{ ml: "16px", mt: "16px" }}>
          <Button
            onClick={() => navigate(ROUTE_CONSTANT.catalog.product.list)}
            startIcon={<AppsIcon />}
            variant="contained"
          >
            Proudct List
          </Button>
        </Box>
      </Box>
      <Box sx={{ py: "16px" }} component={Paper}>
        <Stack sx={{ ml: "16px", mb: "12px" }} gap={1} direction={"row"}>
          <Box>
            <AppsIcon />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Add Product</Typography>
          </Box>
        </Stack>
        {/* <Divider /> */}
        <BasicTabs />
      </Box>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </Container>
  );
};

export default AddProduct;
