import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Checkbox from "@mui/material/Checkbox";
import { Avatar, Box, Button, CircularProgress, FormControl, Select, Switch, TableSortLabel } from "@mui/material";
import parse from "html-react-parser";
import { useNavigate } from "react-router-dom";
import _ from "lodash";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import debounce from "lodash.debounce";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import ConfirmModal from "../ConfirmModal";
import { useState } from "react";
import { useCallback } from "react";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { REACT_APP_WEB_URL } from "config";

export default function ProductListTable({
  statusFilter,
  categ,
  productList,
  personName,
  getAllProductList,
  setProductList,
  productIds,
  setProductIds,
  handleCheckboxChange,
  handleVariationsCheckbox,
  variationsIds,
  handleCombinedCheckboxClick,
  page,
  rowsPerPage,
  loading
}) {
  console.log("aaproductListproductListproductList", productList);
  const [expandedRow, setExpandedRow] = React.useState(null);
  const [ToogleIcon, setToogleIcon] = React.useState({
    istoogle: true,
    id: ""
  });
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [inputData, setInputData] = React.useState([]);
  const [parentInput, setParentInput] = React.useState([]);
  const [order, setOrder] = React.useState("none");
  const [orderBy, setOrderBy] = React.useState(null);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);
  const [productId, setProductId] = useState("");
  const [statusData, setStatusData] = useState({});
  const designation_id = localStorage.getItem(localStorageKey.designation_id);

  console.log({ inputData });
  console.log({ parentInput });
  const navigate = useNavigate();

  console.log("expandedRowexpandedRow", ToogleIcon);

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

  const handleSortChange = async (e, item, index) => {
    const { name, value } = e.target;
    try {
      let payload = {
        [name]: value,
        _id: item?._id
      };

      const res = await ApiService.post(apiEndpoints.updateSortOrderProduct, payload, auth_key);
      if (res?.status === 200) {
        getAllProductList();
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleDelete = useCallback(async () => {
    if (productId) {
      try {
        const id = productId;
        const res = await ApiService.get(`${apiEndpoints.deleteGiftCard}/${id}`, auth_key);
        if (res.status === 200) {
          // getGiftCardList();
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  }, [auth_key, productId]);

  const handleStatusChange = useCallback(async () => {
    if (statusData) {
      try {
        const payload = statusData;
        const res = await ApiService.post(apiEndpoints.changeBestSellerProduct, payload, auth_key);
        if (res.status === 200) {
          getAllProductList();
        }
      } catch (error) {
        handleOpen("error", error?.response?.data || error);
      }
    }
  }, [auth_key, getAllProductList, statusData]);

  const handleBadgeChange = async (badgeData) => {
    if (badgeData) {
      try {
        const payload = badgeData;
        const res = await ApiService.post(apiEndpoints.changeProductBadge, payload, auth_key);
        if (res.status === 200) {
          getAllProductList();
        }
      } catch (error) {
        handleOpen("error", error?.response?.data || error);
      }
    }
  }

  const handlePopularGiftStatusChange = useCallback(async () => {
    if (statusData) {
      try {
        const payload = statusData;
        const res = await ApiService.post(apiEndpoints.changePopularGiftProduct, payload, auth_key);
        if (res.status === 200) {
          getAllProductList();
        }
      } catch (error) {
        handleOpen("error", error?.response?.data || error);
      }
    }
  }, [auth_key, getAllProductList, statusData]);

  const handleFeaturedStatusChange = useCallback(async (data) => {
    if (data) {
      try {
        const payload = data;
        const res = await ApiService.post(apiEndpoints.changeFeatureStatus, payload, auth_key);
        if (res.status === 200) {
          getAllProductList();
        }
      } catch (error) {
        handleOpen("error", error?.response?.data || error);
      }
    }
  }, [auth_key, getAllProductList]);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-CA"); // This ensures the correct date without time zone issues
  };

  const toggleRowExpansion = (id) => {
    console.log(id);
    setExpandedRow(expandedRow === id ? null : id);
  };
  const handleIconToggle = (id, productsData) => {
    console.log({ productsData });

    const myproductList = productsData?.map((item) => {
      return {
        price: item.price,
        sale_price: item.sale_price,
        sale_start_date: formatDate(item.sale_start_date),
        sale_end_date: formatDate(item.sale_end_date)
      };
    });
    setInputData(myproductList);

    setToogleIcon((prevState) => ({
      istoogle: prevState.id === id ? !prevState.istoogle : true,
      id: id
    }));
  };
  const label = { inputProps: { "aria-label": "Checkbox demo" } };

  useEffect(() => {
    const myproductList = productList?.map((item) => {
      return {
        price: item.price,
        sale_price: item.sale_price,
        sort_order: item.sort_order,
        sale_start_date: formatDate(item.sale_start_date),
        sale_end_date: formatDate(item.sale_end_date)
      };
    });
    setParentInput(myproductList);
  }, [productList]);

  const debouncedApiCall = React.useRef(
    debounce(async (e, item) => {
      try {
        const { name, value, type } = e.target;

        if (name === "price" && +value < item?.sale_price) {
          toast.error("Your price must be greater than the sale price");
          return;
        }
        if (name === "sale_price" && +value > item?.price) {
          toast.error("Sale price must be less than your price");
          return;
        }

        if (name === "sale_start_date") {
          const saleStartDate = new Date(value);
          const saleEndDate = new Date(item?.sale_end_date);

          if (saleStartDate > saleEndDate) {
            toast.error("Sale start date must be less than sale end date");
            return;
          }
        }

        if (name === "sale_end_date") {
          const saleEndDate = new Date(value);
          const saleStartDate = new Date(item?.sale_start_date);

          if (saleEndDate < saleStartDate) {
            toast.error("Sale end date must be greater than sale start date");
            return;
          }
        }

        let payload = {
          [name]: type === "date" ? value : +value,
          _id: item?._id
        };

        const res = await ApiService.post(apiEndpoints.updateProductByField, payload, auth_key);
        if (res?.status === 200) {
          getAllProductList();
        }
      } catch (error) {
        console.log(error);
      }
    }, 2000)
  );

  const handleChange = React.useCallback(async (e, item, i) => {
    const { name, value, type } = e.target;

    if (item?.type && item?.type === "product") {
      setParentInput((prv) => {
        let newArr = [...prv];

        if (type === "text") {
          if (/^[0-9]*$/.test(value)) {
            if (+value < 0) {
              newArr[i][name] = 0;
            } else {
              newArr[i][name] = +value;
            }
          }
        }

        if (type === "date") {
          newArr[i][name] = value;
        }

        return newArr;
      });
    } else {
      setInputData((prv) => {
        let newArr = [...prv];

        if (type === "text") {
          if (/^[0-9]*$/.test(value)) {
            if (+value < 0) {
              newArr[i][name] = 0;
            } else {
              newArr[i][name] = +value;
            }
          }
        }

        if (type === "date") {
          newArr[i][name] = value;
        }

        return newArr;
      });
    }

    debouncedApiCall.current(e, item);
  }, []);

  // function formatDate(dateStr) {
  //   if (!dateStr) {
  //     return "";
  //   }

  //   const date = new Date(dateStr);
  //   if (isNaN(date)) {
  //     return "";
  //   }

  //   const options = { day: "2-digit", month: "short", year: "numeric" };
  //   return date.toLocaleDateString("en-GB", options);
  // }

  function capitalizeFirstLetter(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

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

  // const sortedRows = orderBy
  //   ? [...productList].sort((a, b) =>
  //       order === "asc"
  //         ? sortComparator(a, b, orderBy)
  //         : order === "desc"
  //         ? sortComparator(b, a, orderBy)
  //         : 0
  //     )
  //   : productList;

  useEffect(() => {
    const sortedData = orderBy
      ? [...productList].sort((a, b) =>
        order === "asc" ? sortComparator(a, b, orderBy) : sortComparator(b, a, orderBy)
      )
      : productList;

    setProductList(sortedData);
  }, [order, orderBy]);

  const handleProductDelete = async (productId) => {
    try {
      const id = productId;
      const res = await ApiService.get(`${apiEndpoints.deleteProduct}/${id}`, auth_key);
      if (res.status === 200) {
        handleOpen("success", res?.data);
        getAllProductList();
      }
    } catch (error) {
      handleOpen("error", error);
    }
  }

  const VIEW_W = 200;
  const VIEW_H = 200;
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
  const clampPan = ({ scale = 1, x = 0, y = 0 }) => {
    const maxX = ((VIEW_W * scale) - VIEW_W) / 2;
    const maxY = ((VIEW_H * scale) - VIEW_H) / 2;
    return {
      scale,
      x: clamp(x, -maxX, maxX),
      y: clamp(y, -maxY, maxY),
    };
  };


  return (
    <>
      <TableContainer component={Paper}>
        <Table
          sx={{
            minWidth: "100%",
            maxWidth: { lg: "100%", md: "auto", xs: "auto" },
            width: "max-content",
            ".MuiTableCell-root": {
              padding: "12px 5px"
            }
          }}
          aria-label="simple table"
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  wordBreak: "keep-all"
                }}
                align="center"
                sortDirection={orderBy === "S.No" ? order : false}
              >
                <TableSortLabel
                  active={orderBy === "S.No"}
                  direction={orderBy === "S.No" ? order : "asc"}
                  onClick={() => handleRequestSort("S.No")}
                >
                  S.No
                </TableSortLabel>
              </TableCell>
              {!personName?.includes("Status") && (
                <TableCell
                  sx={{
                    wordBreak: "keep-all"
                  }}
                  align="center"
                  sortDirection={orderBy === "status" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "status"}
                    direction={orderBy === "status" ? order : "asc"}
                    onClick={() => handleRequestSort("status")}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
              )}
              {!personName?.includes("Image") && (
                <TableCell
                  sx={{
                    wordBreak: "keep-all"
                  }}
                  align="center"
                >
                  Images
                </TableCell>
              )}
              {!personName?.includes("Feature") && designation_id == "2" && (
                <TableCell
                  sx={{
                    wordBreak: "keep-all"
                  }}
                  align="center"
                >
                  Feature
                </TableCell>
              )}
              {!personName?.includes("Product Id") && (
                <TableCell
                  sx={{
                    wordBreak: "keep-all"
                  }}
                  align="center"
                >
                  Product Id
                </TableCell>
              )}
              {!personName?.includes("SKU") && (
                <TableCell
                  sx={{
                    wordBreak: "keep-all"
                  }}
                  align="center"
                  sortDirection={orderBy === "sku_code" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "sku_code"}
                    direction={orderBy === "sku_code" ? order : "asc"}
                    onClick={() => handleRequestSort("sku_code")}
                  >
                    SKU
                  </TableSortLabel>
                </TableCell>
              )}
              {!personName?.includes("Product Title") && (
                <TableCell
                  sx={{
                    wordBreak: "keep-all"
                  }}
                  align="center"
                  sortDirection={orderBy === "product_title" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "product_title"}
                    direction={orderBy === "product_title" ? order : "asc"}
                    onClick={() => handleRequestSort("product_title")}
                  >
                    Product Title
                  </TableSortLabel>
                </TableCell>
              )}
              {!personName?.includes("Available") && (
                <TableCell
                  sx={{
                    wordBreak: "keep-all"
                  }}
                  align="center"
                  sortDirection={orderBy === "qty" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "qty"}
                    direction={orderBy === "qty" ? order : "asc"}
                    onClick={() => handleRequestSort("qty")}
                  >
                    Available
                  </TableSortLabel>
                </TableCell>
              )}
              {!personName?.includes("Sale Price") && (
                <TableCell
                  sx={{
                    wordBreak: "keep-all"
                  }}
                  align="center"
                  sortDirection={orderBy === "sale_price" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "sale_price"}
                    direction={orderBy === "sale_price" ? order : "asc"}
                    onClick={() => handleRequestSort("sale_price")}
                  >
                    Sale Price
                  </TableSortLabel>
                </TableCell>
              )}
              {!personName?.includes("Sort Order") && (
                <TableCell
                  sx={{
                    wordBreak: "keep-all"
                  }}
                  align="center"
                  sortDirection={orderBy === "sort_order" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "sort_order"}
                    direction={orderBy === "sort_order" ? order : "asc"}
                    onClick={() => handleRequestSort("sort_order")}
                  >
                    Sort Order
                  </TableSortLabel>
                </TableCell>
              )}
              {/* {!personName?.includes("Best Selling") && (
                <TableCell
                  sx={{
                    wordBreak: "keep-all"
                  }}
                  align="center"
                  sortDirection={orderBy === "best_selling" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "best_selling"}
                    direction={orderBy === "best_selling" ? order : "asc"}
                    onClick={() => handleRequestSort("best_selling")}
                  >
                    Best Selling
                  </TableSortLabel>
                </TableCell>
              )}
              {!personName?.includes("Popular Gift") && (
                <TableCell
                  sx={{
                    wordBreak: "keep-all"
                  }}
                  align="center"
                  sortDirection={orderBy === "popular_gift" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "popular_gift"}
                    direction={orderBy === "popular_gift" ? order : "asc"}
                    onClick={() => handleRequestSort("popular_gift")}
                  >
                    Popular Gift
                  </TableSortLabel>
                </TableCell>
              )} */}
              {!personName?.includes("Badge") && (
                <TableCell
                  sx={{
                    wordBreak: "keep-all"
                  }}
                  align="center"
                  sortDirection={orderBy === "badge" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "badge"}
                    direction={orderBy === "badge" ? order : "asc"}
                    onClick={() => handleRequestSort("badge")}
                  >
                    Badge
                  </TableSortLabel>
                </TableCell>
              )}
              {/* {!personName?.includes("Sale Start Date") && (
              <TableCell
                sx={{
                  wordBreak: "keep-all"
                }}
                align="center"
              >
                Sale Start Date
              </TableCell>
            )}
            {!personName?.includes("Sale End Date") && (
              <TableCell
                sx={{
                  wordBreak: "keep-all"
                }}
                align="center"
              >
                Sale End Date
              </TableCell>
            )} */}
              <TableCell
                sx={{
                  wordBreak: "keep-all"
                }}
                align="center"
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          {
            loading ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={12}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        padding: "48px",
                        width: "100%",
                        minHeight: "200px",
                      }}
                    >
                      <CircularProgress size={40} />
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <>
                {productList.length > 0 && productList[0] !== "No Product Found" ? (
                  <TableBody>
                    {productList.map((row, index) => {
                      console.log({ productList }, "jjffjuuuuj");
                      return (
                        <React.Fragment key={index}>
                          <TableRow
                            key={index}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                              cursor: "pointer"
                            }}
                            onClick={() => toggleRowExpansion(row?._id)}
                          >
                            <TableCell
                              sx={{
                                wordBreak: "keep-all"
                              }}
                            >
                              {row?.type === "product" ? (
                                <Checkbox
                                  {...label}
                                  checked={productIds.includes(row?._id)}
                                  onClick={() => handleCheckboxChange(row?._id, row)}
                                  size="small"
                                />
                              ) : (
                                <Checkbox
                                  {...label}
                                  checked={variationsIds.includes(row?._id)}
                                  onClick={() => handleCombinedCheckboxClick(row)}
                                  size="small"
                                />
                              )}
                            </TableCell>
                            {!personName?.includes("Status") && (
                              <TableCell
                                sx={{
                                  wordBreak: "keep-all"
                                }}
                                align="center"
                                onClick={() => handleIconToggle(row._id, row.productData)}
                              >
                                <Box
                                  sx={{
                                    alignItems: "center",
                                    display: "flex",
                                    justifyContent: "center"
                                  }}
                                >
                                  <>
                                    {row?.productData?.length > 0 ? (
                                      <>
                                        {ToogleIcon.id === row._id && ToogleIcon.istoogle ? (
                                          <KeyboardArrowDownIcon />
                                        ) : (
                                          <KeyboardArrowRightIcon />
                                        )}
                                      </>
                                    ) : (
                                      <></>
                                    )}
                                    {row?.type === "product"
                                      ? row?.status
                                      : `${row?.type} ${statusFilter !== "all" ? row?.childCountData[0]?.count : ""}(${row.productData?.length})`}
                                  </>
                                </Box>
                              </TableCell>
                            )}
                            {!personName?.includes("Image") && (
                              <TableCell
                                sx={{
                                  wordBreak: "keep-all"
                                }}
                                align="center"
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "12px"
                                  }}
                                >
                                  <Box
                                    sx={{
                                      height: "200px",
                                      overflow: "hidden",
                                      borderRadius: "8px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      border: "2px solid #c0c0c0",
                                      background: "#f4f4f4",
                                      width: {
                                        xs: "100%",
                                        md: "200px",
                                      },
                                      maxWidth: {
                                        xs: "200px",
                                        md: "none",
                                      },
                                    }}
                                  >
                                    <img
                                      src={row?.type === "product" ? row?.image?.[0] : row?.image}
                                      alt="Zoomable"
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                        transformOrigin: "center center",
                                        transition: "transform 0.15s ease-out",
                                        willChange: "transform",
                                        backfaceVisibility: "hidden",
                                        ...(() => {
                                          const { x, y, scale } = clampPan(row?.zoom || {});
                                          return {
                                            transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                                          };
                                        })(),
                                      }}
                                    />
                                  </Box>
                                </div>
                              </TableCell>
                            )}
                            {!personName?.includes("Feature") && designation_id == "2" && (
                              <TableCell
                                sx={{
                                  wordBreak: "keep-all"
                                }}
                                align="center"
                              >
                                {row?.type === "product" ? (
                                  <IconButton
                                    onClick={(e) => {
                                      handleFeaturedStatusChange({ _id: row._id, featured: !row?.featured })
                                    }}
                                    color={row?.featured ? "error" : "default"}
                                  >
                                    {row?.featured ? <Favorite /> : <FavoriteBorder />}
                                  </IconButton>
                                ) : "-"}
                              </TableCell>
                            )}
                            {!personName?.includes("Product Id") && (
                              <TableCell
                                sx={{
                                  wordBreak: "break-word"
                                }}
                                align="center"
                              >
                                {row?._id}
                              </TableCell>
                            )}
                            {!personName?.includes("SKU") && (
                              <TableCell
                                sx={{
                                  wordBreak: "break-word"
                                }}
                                align="center"
                              >
                                {row?.type === "product" ? (
                                  capitalizeFirstLetter(row?.sku_code)
                                ) : (
                                  capitalizeFirstLetter(row?.seller_sku)
                                )}

                              </TableCell>
                            )}
                            {!personName?.includes("Product Title") && (
                              <TableCell
                                sx={{
                                  wordBreak: "break-word",
                                  width: "225px",
                                  cursor: "pointer",
                                  textDecoration: "underline"
                                }}
                                align="center"
                              >
                                <a
                                  href={`${REACT_APP_WEB_URL}/products/${row?._id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: "inherit", textDecoration: "none" }}
                                >
                                  {capitalizeFirstLetter(
                                    row?.product_title.replace(/<\/?[^>]+(>|$)/g, "")
                                  )}
                                </a>
                              </TableCell>
                            )}
                            {!personName?.includes("Available") && (
                              <TableCell
                                sx={{
                                  wordBreak: "keep-all"
                                }}
                                align="center"
                              >
                                {row?.type === "product" ? row?.qty : "-"}
                              </TableCell>
                            )}
                            {!personName?.includes("Sale Price") && (
                              <TableCell
                                sx={{
                                  wordBreak: "keep-all"
                                }}
                                align="center"
                              >
                                {row?.type === "product" ? (
                                  <input
                                    type="text"
                                    name="sale_price"
                                    value={parentInput[index]?.sale_price || ""}
                                    onChange={(e) => handleChange(e, row, index)}
                                    style={{
                                      height: "30px",
                                      width: "100px",
                                      border: "2px solid green"
                                    }}
                                  />
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                            )}
                            {!personName?.includes("Sort Order") && (
                              <TableCell
                                sx={{
                                  wordBreak: "keep-all"
                                }}
                                align="center"
                              >
                                {row?.type === "product" ? (
                                  <input
                                    type="text"
                                    name="sort_order"
                                    value={parentInput[index]?.sort_order || ""}
                                    onChange={(e) => handleSortChange(e, row, index)}
                                    style={{
                                      height: "30px",
                                      width: "100px",
                                      border: "2px solid green"
                                    }}
                                  />
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                            )}
                            {/* {!personName?.includes("Best Selling") && (
                              <TableCell
                                sx={{
                                  wordBreak: "keep-all"
                                }}
                                align="center"
                              >
                                {row?.type === "product" ? (
                                  <Switch
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpen("bestSellingStatus");
                                      setStatusData(() => ({ _id: row._id, bestseller: row?.bestseller == "Yes" ? "No" : "Yes"}));
                                    }}
                                    checked={row?.bestseller=="Yes" ? true : false}
                                    {...label}
                                  />
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                            )}
                            {!personName?.includes("popular Gift") && (
                              <TableCell
                                sx={{
                                  wordBreak: "keep-all"
                                }}
                                align="center"
                              >
                                {row?.type === "product" ? (
                                  <Switch
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpen("popularGiftStatus");
                                      setStatusData(() => ({ _id: row._id, popular_gifts: row?.popular_gifts == "Yes" ? "No" : "Yes" }));
                                    }}
                                    checked={row?.popular_gifts == "Yes" ? true : false}
                                    {...label}
                                  />
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                            )} */}
                            {!personName?.includes("Badge") && (
                              <TableCell
                                sx={{
                                  wordBreak: "keep-all"
                                }}
                                align="center"
                              >
                                {row?.type === "product" ? (
                                  <FormControl size="small" fullWidth>
                                    <Select
                                      value={row?.product_bedge || ""}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => {
                                        console.log(e.target.value, "hcccc");
                                        handleBadgeChange({ product_id: row._id, badge: e.target.value })
                                      }}
                                      displayEmpty
                                    >
                                      <MenuItem value="">None</MenuItem>
                                      <MenuItem value="Agu's Pics">Agu's Pics</MenuItem>
                                      <MenuItem value="Popular Now">Popular Now</MenuItem>
                                      <MenuItem value="Best Seller">Best Seller</MenuItem>
                                    </Select>
                                  </FormControl>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                            )}

                            {/* {!personName?.includes("Sale Start Date") && (
                              <TableCell
                                sx={{
                                  wordBreak: "keep-all"
                                }}
                                align="center"
                              >
                                {row?.type === "product" ? (
                                  <input
                                    type="date"
                                    name="sale_start_date"
                                    value={parentInput[index]?.sale_start_date || ""}
                                    onChange={(e) => handleChange(e, row, index)}
                                    style={{
                                      height: "30px",
                                      width: "100px",
                                      border: "2px solid green"
                                    }}
                                  />
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                            )}
                            {!personName?.includes("Sale End Date") && (
                              <TableCell
                                sx={{
                                  wordBreak: "keep-all"
                                }}
                                align="center"
                              >
                                {row?.type === "product" ? (
                                  <input
                                    type="date"
                                    name="sale_end_date"
                                    value={parentInput[index]?.sale_end_date || ""}
                                    onChange={(e) => handleChange(e, row, index)}
                                    style={{
                                      height: "30px",
                                      width: "100px",
                                      border: "2px solid green"
                                    }}
                                  />
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                            )} */}
                            <TableCell
                              sx={{
                                wordBreak: "keep-all"
                              }}
                              align="center"
                            >
                              <Box
                                sx={{ display: "flex", alignItems: "centre", justifyContent: "center" }}
                              >
                                <Button
                                  variant="contained"
                                  sx={{
                                    borderRadius: "4px 0 0px 4px",
                                    border: "1px solid #cacaca",
                                    borderRight: "none",
                                    boxShadow: "none",
                                    background: "#fff",
                                    color: "#000",
                                    "&:hover": { color: "#fff", boxShadow: "none" }
                                  }}
                                >
                                  Action
                                </Button>
                                <TextField
                                  select
                                  defaultValue="Edit"
                                  sx={{
                                    background: "#fff",
                                    "& .MuiOutlinedInput-notchedOutline": {
                                      borderRadius: "0px 4px 4px 0px",
                                      border: "1px solid #cacaca !important"
                                    }
                                  }}
                                >
                                  <MenuItem>
                                    <a
                                      href={row?.type === "variations" ? `${ROUTE_CONSTANT.catalog.product.parentProducts}?id=${row._id}` : `${ROUTE_CONSTANT.catalog.product.add}?id=${row._id}`}
                                      className="w-full h-full block"
                                    >
                                      Edit
                                    </a>
                                  </MenuItem>
                                  <MenuItem>
                                    <a
                                      href={`${ROUTE_CONSTANT.catalog.product.add}?_id=${row._id}`}
                                      className="w-full h-full block"
                                    >
                                      Copy Listing
                                    </a>
                                  </MenuItem>

                                  <MenuItem onClick={() => handleProductDelete(row?._id)}>Delete</MenuItem>
                                </TextField>
                              </Box>
                            </TableCell>
                            {/* varient show or not  */}

                            {/* end varient show or not  */}
                          </TableRow>
                          {expandedRow === row._id &&
                            row?.productData?.map((item, i) => {
                              return (
                                <>
                                  <TableRow
                                    sx={{
                                      wordBreak: "keep-all"
                                    }}
                                  >
                                    <TableCell
                                      sx={{
                                        wordBreak: "keep-all"
                                      }}
                                    >
                                      <Checkbox
                                        {...label}
                                        checked={productIds.includes(item?._id)}
                                        onClick={() => handleCheckboxChange(item?._id, row)}
                                        size="small"
                                      />
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        wordBreak: "keep-all"
                                      }}
                                      align="center"
                                    >
                                      {item?.productStatus}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        wordBreak: "keep-all",
                                      }}
                                      align="center"
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center",
                                          gap: "12px"
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            height: "200px",
                                            overflow: "hidden",
                                            borderRadius: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            border: "2px solid #c0c0c0",
                                            background: "#f4f4f4",
                                            width: {
                                              xs: "100%",
                                              md: "200px",
                                            },
                                            maxWidth: {
                                              xs: "200px",
                                              md: "none",
                                            },
                                          }}
                                        >
                                          <img
                                            src={item?.image?.[0]}
                                            alt="Zoomable"
                                            style={{
                                              width: "100%",
                                              height: "100%",
                                              objectFit: "contain",
                                              transformOrigin: "center center",
                                              ...(() => {
                                                const { x, y, scale } = clampPan(item?.zoom || {});
                                                return {
                                                  transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                                                };
                                              })(),
                                              transition: "transform 0.15s ease-out",
                                              willChange: "transform",
                                              backfaceVisibility: "hidden",
                                            }}
                                          />
                                        </Box>
                                      </div>
                                    </TableCell>

                                    {!personName?.includes("Feature") && designation_id == "2" && (
                                      <TableCell
                                        sx={{
                                          wordBreak: "keep-all"
                                        }}
                                        align="center"
                                      >
                                        <IconButton
                                          onClick={(e) => {
                                            handleFeaturedStatusChange({ _id: item._id, featured: !item?.featured })
                                          }}
                                          color={item?.featured ? "error" : "default"}
                                        >
                                          {item?.featured ? <Favorite /> : <FavoriteBorder />}
                                        </IconButton>
                                      </TableCell>
                                    )}
                                    {
                                      !personName?.includes("Product Id") && <TableCell
                                        sx={{
                                          wordBreak: "keep-all"
                                        }}
                                        align="center"
                                      >
                                        {item?._id}
                                      </TableCell>
                                    }
                                    {
                                      !personName?.includes("SKU") && <TableCell
                                        sx={{
                                          wordBreak: "keep-all"
                                        }}
                                        align="center"
                                      >
                                        {capitalizeFirstLetter(item?.sku_code)}
                                      </TableCell>
                                    }
                                    <TableCell
                                      sx={{
                                        wordBreak: "break-word",
                                        width: "225px",
                                        cursor: "pointer",
                                        textDecoration: "underline"
                                      }}
                                      align="center"
                                    >
                                      <a
                                        href={`${REACT_APP_WEB_URL}/products/${item?._id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: "inherit", textDecoration: "none" }}
                                      >
                                        {capitalizeFirstLetter(
                                          item?.product_title.replace(/<\/?[^>]+(>|$)/g, "")
                                        )}
                                      </a>
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        wordBreak: "keep-all"
                                      }}
                                      align="center"
                                    >
                                      {item?.qty}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        wordBreak: "keep-all"
                                      }}
                                      align="center"
                                    >
                                      <input
                                        type="text"
                                        name="sale_price"
                                        value={inputData[i]?.sale_price || ""}
                                        onChange={(e) => handleChange(e, item, i)}
                                        style={{
                                          height: "30px",
                                          width: "100px",
                                          border: "2px solid green"
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        wordBreak: "keep-all"
                                      }}
                                      align="center"
                                    >
                                      <input
                                        type="text"
                                        name="sort_order"
                                        value={inputData[i]?.sort_order || ""}
                                        onChange={(e) => handleSortChange(e, item, i)}
                                        style={{
                                          height: "30px",
                                          width: "100px",
                                          border: "2px solid green"
                                        }}
                                      />
                                    </TableCell>
                                    {/* {!personName?.includes("Best Selling") && (
                                      <TableCell
                                        sx={{
                                          wordBreak: "keep-all"
                                        }}
                                        align="center"
                                      >
                                        <Switch
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpen("bestSellingStatus");
                                            setStatusData(() => ({ _id: item?._id, bestseller: item?.bestseller == "Yes" ? "No" : "Yes"}));
                                          }}
                                          checked={item?.bestseller=="Yes" ? true : false}
                                          {...label}
                                        />
                                      </TableCell>
                                    )}
                                    {!personName?.includes("popular Gift") && (
                                      <TableCell
                                        sx={{
                                          wordBreak: "keep-all"
                                        }}
                                        align="center"
                                      >
                                        <Switch
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpen("popularGiftStatus");
                                            setStatusData(() => ({ _id: item?._id, popular_gifts: item?.popular_gifts == "Yes" ? "No" : "Yes" }));
                                          }}
                                          checked={item?.popular_gifts == "Yes" ? true : false}
                                          {...label}
                                        />
                                      </TableCell>
                                    )} */}
                                    {!personName?.includes("Badge") && (
                                      <TableCell
                                        sx={{
                                          wordBreak: "keep-all"
                                        }}
                                        align="center"
                                      >
                                        <FormControl size="small" fullWidth>
                                          <Select
                                            value={item?.product_bedge || ""}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => {
                                              console.log(e.target.value, "hcccc");
                                              handleBadgeChange({ product_id: item._id, badge: e.target.value })
                                            }}
                                            displayEmpty
                                          >
                                            <MenuItem value="">None</MenuItem>
                                            <MenuItem value="Agu's Pics">Agu's Pics</MenuItem>
                                            <MenuItem value="Popular Now">Popular Now</MenuItem>
                                            <MenuItem value="Featured">Featured</MenuItem>
                                          </Select>
                                        </FormControl>
                                      </TableCell>
                                    )}
                                    {/* <TableCell
                                      sx={{
                                        wordBreak: "keep-all"
                                      }}
                                      align="center"
                                    >
                                      <input
                                        type="date"
                                        name="sale_start_date"
                                        // value={inputData[i]?.price_shipping_cost}
                                        value={inputData[i]?.sale_start_date || ""}
                                        onChange={(e) => handleChange(e, item, i)}
                                        style={{
                                          height: "30px",
                                          width: "100px",
                                          border: "2px solid green"
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        wordBreak: "keep-all"
                                      }}
                                      align="center"
                                    >
                                      <input
                                        type="date"
                                        name="sale_end_date"
                                        value={inputData[i]?.sale_end_date || ""}
                                        onChange={(e) => handleChange(e, item, i)}
                                        style={{
                                          height: "30px",
                                          width: "100px",
                                          border: "2px solid green"
                                        }}
                                      />
                                    </TableCell> */}
                                    <TableCell>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "centre",
                                          justifyContent: "center"
                                        }}
                                      >
                                        <Button
                                          variant="contained"
                                          sx={{
                                            borderRadius: "4px 0 0px 4px",
                                            border: "1px solid #cacaca",
                                            borderRight: "none",
                                            boxShadow: "none",
                                            background: "#fff",
                                            color: "#000",
                                            "&:hover": { color: "#fff", boxShadow: "none" }
                                          }}
                                        >
                                          Action
                                        </Button>
                                        <TextField
                                          select
                                          defaultValue="Edit"
                                          sx={{
                                            background: "#fff",
                                            "& .MuiOutlinedInput-notchedOutline": {
                                              borderRadius: "0px 4px 4px 0px",
                                              border: "1px solid #cacaca !important"
                                            }
                                          }}
                                        >
                                          <MenuItem>
                                            <a
                                              href={item?.type === "variations" ? `${ROUTE_CONSTANT.catalog.product.parentProducts}?id=${item?._id}` : `${ROUTE_CONSTANT.catalog.product.add}?id=${item?._id}`}
                                              className="w-full h-full block"
                                            >
                                              Edit
                                            </a>
                                          </MenuItem>
                                          <MenuItem>
                                            <a
                                              href={`${ROUTE_CONSTANT.catalog.product.add}?_id=${item._id}`}
                                              className="w-full h-full block"
                                            >
                                              Copy Listing
                                            </a>
                                          </MenuItem>
                                          <MenuItem onClick={() => handleProductDelete(item?._id)}>Delete</MenuItem>
                                          {/* <MenuItem>Submit</MenuItem> */}
                                        </TextField>
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                </>
                              );
                            })}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                ) : (
                  <TableBody sx={{ display: "flex", justifyContent: "center" }}>
                    <TableRow>
                      <TableCell>No Product Found</TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </>
            )
          }
        </Table>
      </TableContainer>
      <ConfirmModal
        open={open}
        handleClose={handleClose}
        handleDelete={handleDelete}
        type={type}
        msg={msg}
        handleStatusChange={handleStatusChange}
        handlePopularGiftStatusChange={handlePopularGiftStatusChange}
      />
    </>
  );
}
