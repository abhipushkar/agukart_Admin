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

const OccasionsList = () => {
  const [open1, setOpen1] = React.useState(false);
  const [title, setTitle] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [OccasionsList, setOccasionsList] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [editOccasionId, setOccasionId] = useState("");
  const [editImageData, setImageEditData] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [order, setOrder] = useState("none");
  const [orderBy, setOrderBy] = useState(null);
  const handleOpen1 = () => setOpen1(true);
  const handleClose1 = () => {
    setOpen1(false);
    setImageEditData(null);
    setOccasionId("");
    setImagePreview(null);
    setFileName("");
    setImage(null);
    setTitle("");
  };
  const Container = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
      marginBottom: "30px",
      [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
    }
  }));

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

  const addOccasionsHandler = async () => {
    try {
      setLoading(true);
      const res = await ApiService.post(
        apiEndpoints.addOccasion,
        { title: title, id: editImageData ? editImageData._id : "new" },
        auth_key
      );
      console.log(res);
      if (res.status === 200) {
        if (image === "notSelected" && editImageData) {
          getOccasionList();
          setLoading(false);
          handleClose1();
          handleOpen("success", res?.data);
        } else if (image) {
          handleUploadImage(res?.data?.occasion?._id, res?.data);
        }
      }
    } catch (error) {
      setLoading(false);
      handleOpen("error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (id, msg) => {
    try {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("_id", id);
      const res = await ApiService.postImage(apiEndpoints.addOccasionImage, formData, auth_key);
      if (res?.status === 200) {
        getOccasionList();
        handleClose1();
        handleOpen("success", msg);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  useEffect(() => {
    getOccasionList();
  }, []);

  const getOccasionList = async () => {
    try {
      const res = await ApiService.get(apiEndpoints.getOccassion, auth_key);

      console.log(res);
      if (res.status === 200) {
        const myNewList = res?.data?.data?.map((e, i) => {
          return { "S.No": i + 1, ...e };
        });
        setOccasionsList(myNewList);
        const xData = myNewList.map((e, i) => {
          let obj = {
            title: e.title,
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

  const handleStatusChange = async (payload) => {
    try {
      const res = await ApiService.post(apiEndpoints.changeOccsionsStatus, payload, auth_key);
      if (res.status === 200) {
        getOccasionList();
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  const editOccasionHandler = async () => {
    try {
      const res = await ApiService.get(`${apiEndpoints.editOccassion}/${editOccasionId}`, auth_key);
      console.log(res);
      if (res.status === 200) {
        setImageEditData(res?.data?.data);
        setTitle(res?.data?.data?.title);
        setImage("notSelected");
        setImagePreview(res?.data?.data?.image);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  useEffect(() => {
    if (editOccasionId) {
      editOccasionHandler();
    }
  }, [editOccasionId]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const deleteOccasionsHandler = async (id) => {
    setLoading(true);
    try {
      const res = await ApiService.delete(`${apiEndpoints.deleteOccassion}/${id}`, auth_key);
      if (res.status === 200) {
        getOccasionList();
        setLoading(false);
        handleOpen("success", res?.data);
      }
    } catch (error) {
      setLoading(false);
      handleOpen("error", error);
    } finally {
      setLoading(false);
    }
  };
  const label = { inputProps: { "aria-label": "Switch demo" } };

  console.log({ OccasionsList });

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
    ? [...OccasionsList].sort((a, b) =>
      order === "asc"
        ? sortComparator(a, b, orderBy)
        : order === "desc"
          ? sortComparator(b, a, orderBy)
          : 0
    )
    : OccasionsList;
  return (
    <Box sx={{ margin: "30px" }}>
      <Box sx={{ marginBottom: "30px" }}>
        <Modal
          open={open1}
          onClose={handleClose1}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography sx={{ mb: 2 }} id="modal-modal-title" variant="h6" component="h2">
              Add Occasions
            </Typography>

            <TextField
              fullWidth
              id="outlined-basic"
              label="Title"
              sx={{
                mb: 2,
                "& .MuiInputBase-root": {
                  height: "40px",
                },
                "& .MuiFormLabel-root": {
                  top: '-7px'
                }
              }}
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <TextField
              fullWidth
              value={fileName}
              sx={{
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

            <Stack sx={{ width: "300px", }}>
              <img
                style={{ width: "100%", objectFit: "contain" }}
                src={imagePreview}
                alt=""
              />
            </Stack>

            <Box>
              <Button
                endIcon={loading ? <CircularProgress size={15} /> : ""}
                disabled={loading ? true : !image ? true : !title ? true : false}
                sx={{ mr: "16px" }}
                variant="contained"
                color="primary"
                type="button"
                onClick={addOccasionsHandler}
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
          <Breadcrumb
            routeSegments={[{ name: "Occasions", path: "" }, { name: "Occasions  List" }]}
          />
          <Box display={"flex"} gap={"16px"}>
            <Button onClick={handleOpen1} variant="contained">
              Add Occasions
            </Button>
            <Button onClick={() => exportToExcel(excelData)} variant="contained">
              Export Occasions
            </Button>
          </Box>
        </Box>
      </Box>

      <Box>
        <TableContainer sx={{ paddingLeft: 2, paddingRight: 2 }} component={Paper}>
          <Table sx={{
            width: "max-content", minWidth: "100%", '.MuiTableCell-root': {
              padding: '12px 5px'
            }
          }}>
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
                    direction={orderBy === "title" ? order : "title"}
                    onClick={() => handleRequestSort("title")}
                  >
                    Tittle
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
                    <TableCell>{row.title}</TableCell>
                    <TableCell>
                      <Switch
                        onChange={(e) => handleStatusChange({ id: row._id, status: !row.status })}
                        checked={row.status}
                        {...label}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <IconButton
                        disabled={loading}
                        onClick={() => {
                          handleOpen1();
                          setOccasionId(row._id);
                        }}
                      >
                        <Icon color="primary">edit</Icon>
                      </IconButton>
                      <IconButton
                        disabled={loading}
                        onClick={() => {
                          deleteOccasionsHandler(row._id);
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
          count={OccasionsList?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>

      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </Box>
  );
};

export default OccasionsList;
