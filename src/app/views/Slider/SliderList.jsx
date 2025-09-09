import styled from "@emotion/styled";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { exportToExcel } from "app/utils/excelExport";
import {
  TableSortLabel,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Modal,
  Paper,
  Stack,
  Table,
  TableCell,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  TablePagination,
  Typography
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import { Icon } from "@mui/material";
import Switch from "@mui/material/Switch";
import { Breadcrumb } from "app/components";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { toast } from "react-toastify";
import { useEffect } from "react";
import ConfirmModal from "app/components/ConfirmModal";
import { useCallback } from "react";

const SliderList = () => {
  const [open1, setOpen1] = React.useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [sliderList, setSliderList] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [editSliderlId, setSliderId] = useState("");
  const [editImageData, setImageEditData] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [order, setOrder] = useState("none");
  const [orderBy, setOrderBy] = useState(null);
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

  const handleOpen1 = () => setOpen1(true);
  const handleClose1 = () => {
    setOpen1(false);
    setImageEditData(null);
    setSliderId("");
    setImagePreview(null);
    setFileName("");
    setImage(null);
  };
  const Container = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
      marginBottom: "30px",
      [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
    }
  }));

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "70%",
    // height: "90%",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(event.target.files[0]);
      setFileName(file.name);
    } else {
      setFileName("");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const auth_key = localStorage.getItem(localStorageKey.auth_key);

  const uploadImageHandler = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", image);
      formData.append("_id", editImageData ? editImageData?._id : "0");

      const res = await ApiService.postImage(apiEndpoints.addSlider, formData, auth_key);
      console.log(res);
      if (res.status === 200) {
        setLoading(false);
        toast.success(res?.data?.message);
        handleClose1();
        setImageEditData(null);
        setSliderId("");
        setImagePreview(null);
        setFileName("");
        setImage(null);
        getSliderList();
      }
    } catch (error) {
      setLoading(false);
      handleOpen("error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSliderList();
  }, []);

  const getSliderList = async () => {
    try {
      const res = await ApiService.get(apiEndpoints.getSlider, auth_key);

      console.log(res);
      if (res.status === 200) {
        const myNewList = res?.data?.data?.map((e, i) => {
          return { "S.No": i + 1, ...e };
        });
        setSliderList(myNewList);
        const xData = myNewList.map((e, i) => {
          let obj = {
            "S.NO": i + 1,
            image: e.image,
            status: e.status ? "Active" : "In Active"
          };
          return obj;
        });
        setExcelData(xData);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  const handleStatusChange = useCallback(async () => {
    if (statusData) {
      try {
        const payload = statusData;
        const res = await ApiService.post(
          apiEndpoints.updateSliderStatus,
          payload,
          auth_key
        );
        if (res.status === 200) {
          getSliderList();
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  }, [auth_key, getSliderList, statusData]);

  const handleDelete = useCallback(async () => {
    if (statusData) {
      try {
        const id = statusData;
        const res = await ApiService.delete(`${apiEndpoints.deleteSlider}/${id}`, auth_key);
        if (res?.status === 200) {
          toast.success(res?.data?.message);
          getSliderList();
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  }, [auth_key, getSliderList, statusData]);

  const editSliderHandler = async () => {
    try {
      const res = await ApiService.get(`${apiEndpoints.editSlider}/${editSliderlId}`, auth_key);
      if (res.status === 200) {
        setImageEditData(res?.data?.data);
        setImagePreview(res?.data?.data?.image);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  useEffect(() => {
    if (editSliderlId) {
      editSliderHandler();
    }
  }, [editSliderlId]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // const deleteSliderHandler = async (id) => {
  //   setLoading(true);
  //   try {
  //     const res = await ApiService.delete(`${apiEndpoints.deleteSlider}/${id}`, auth_key);
  //     if (res.status === 200) {
  //       getSliderList();
  //       toast.success(res?.data?.message);
  //       setLoading(false);
  //     }
  //   } catch (error) {
  //     console.log();
  //     setLoading(false);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const label = { inputProps: { "aria-label": "Switch demo" } };

  console.log({ sliderList });

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
    ? [...sliderList].sort((a, b) =>
      order === "asc"
        ? sortComparator(a, b, orderBy)
        : order === "desc"
          ? sortComparator(b, a, orderBy)
          : 0
    )
    : sliderList;

  return (
    <Container>
      <Modal
        open={open1}
        onClose={handleClose1}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography sx={{ mb: 2 }} id="modal-modal-title" variant="h6" component="h2">
            Add Image
          </Typography>

          <TextField
            fullWidth
            value={fileName}
            sx={{
              width: "100%",
              mb: 2,
              "& .MuiInputBase-root": {
                height: "40px",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachFileIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  id="file-input"
                  onChange={(event) => {
                    handleImageSelect(event);
                    handleImageChange(event);
                  }}
                />
              ),
              readOnly: true
            }}
            placeholder="Select file"
            onClick={() => document.getElementById("file-input").click()}
          />

          <Stack sx={{ height: imagePreview ? "300px" : 0, width: "300px", mb: "16px" }}>
            <img
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              src={imagePreview}
              alt=""
            />
          </Stack>

          <Box>
            <Button
              endIcon={loading ? <CircularProgress size={15} /> : ""}
              disabled={loading ? true : !image ? true : false}
              sx={{ mr: "16px" }}
              variant="contained"
              color="primary"
              type="button"
              onClick={uploadImageHandler}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Modal>
      <Box
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        className="breadcrumb"
      >
        <Breadcrumb routeSegments={[{ name: "Slider", path: "" }, { name: "Slider List" }]} />
        <Box display={"flex"} gap={"16px"}>
          <Button onClick={handleOpen1} variant="contained">
            Add Slider
          </Button>
          {/* <Button onClick={() => exportToExcel(excelData)} variant="contained">
            Export
          </Button> */}
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
                <TableCell>Image</TableCell>
                <TableCell sortDirection={orderBy === "status" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "status"}
                    direction={orderBy === "status" ? order : "asc"}
                    onClick={() => handleRequestSort("status")}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? sortedRows?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : sortedRows
              )?.map((row, i) => {
                return (
                  <TableRow key={row._id}>
                    <TableCell>{row["S.No"]}</TableCell>
                    <TableCell>
                      <img height={40} src={row.image} alt="" />
                    </TableCell>
                    <TableCell>
                      <Switch
                        // onChange={(e) => handleStatusChange({ id: row._id, status: !row.status })}
                        onClick={() => {
                          handleOpen("sliderStatus");
                          setStatusData(() => ({ id: row._id, status: !row.status }));
                        }}
                        checked={row.status}
                        {...label}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <IconButton
                        disabled={loading}
                        onClick={() => {
                          handleOpen1();
                          setSliderId(row._id);
                        }}
                      >
                        <Icon color="primary">edit</Icon>
                      </IconButton>
                      <IconButton
                        disabled={loading}
                        // onClick={() => {
                        //   deleteSliderHandler(row._id);
                        // }}
                        onClick={() => {
                          handleOpen("sliderDelete");
                          setStatusData(row?._id);
                        }}
                      >
                        <Icon sx={{ color: "#DC3545" }}>delete</Icon>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sliderList?.length}
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
        handleDelete={handleDelete}
      />
    </Container>
  );
};

export default SliderList;
