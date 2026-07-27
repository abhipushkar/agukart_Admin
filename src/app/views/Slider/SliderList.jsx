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
  Typography,
  FormControl,
  FormLabel,
  Slider as MuiSlider,
  Chip
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
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

// Add this to your Container styled component or as a global style
const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
  },
}));

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%", // Increased width
  maxWidth: "1200px", // Max width for large screens
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  maxHeight: "95vh",
  overflowY: "auto"
};

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
  const [altText, setAltText] = useState("");

  // Cropper ref and state
  const cropperRef = React.useRef(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [isCropping, setIsCropping] = useState(false);

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
    setAltText("");
    setCroppedImage(null);
    setImageToCrop(null);
    setShowCropper(false);
    setIsCropping(false);
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setFileName(file.name);

      // Read file for cropping
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageToCrop(e.target.result);
        setShowCropper(true);
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
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

  // Handle crop
  const handleCrop = () => {
    if (cropperRef.current) {
      const cropper = cropperRef.current.cropper;
      const croppedDataUrl = cropper.getCroppedCanvas({
        width: 1200,
        height: 300,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      }).toDataURL('image/jpeg', 0.95);

      setCroppedImage(croppedDataUrl);
      setImagePreview(croppedDataUrl);
      setShowCropper(false);
      setIsCropping(false);

      // Convert data URL to file
      fetch(croppedDataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], fileName || 'cropped-image.jpg', { type: 'image/jpeg' });
          setImage(file);
        });
    }
  };

  // Reset cropper
  const resetCropper = () => {
    setShowCropper(false);
    setIsCropping(false);
    setImageToCrop(null);
    if (editImageData?.image) {
      setImagePreview(editImageData.image);
    }
  };

  const auth_key = localStorage.getItem(localStorageKey.auth_key);

  const uploadImageHandler = async () => {
    try {
      setLoading(true);
      const formData = new FormData();

      // Use cropped image if available, otherwise use original
      if (croppedImage) {
        const blob = await fetch(croppedImage).then(res => res.blob());
        formData.append("file", blob, fileName || 'slider-image.jpg');
      } else if (image) {
        formData.append("file", image);
      } else {
        toast.error("No image selected");
        setLoading(false);
        return;
      }

      formData.append("_id", editImageData ? editImageData?._id : "0");
      formData.append("image_alt", altText);

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
        setCroppedImage(null);
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
        setAltText(res?.data?.data?.image_alt || "");
        // Set image to crop for editing
        setImageToCrop(res?.data?.data?.image);
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
            {editImageData ? 'Edit Image' : 'Add Image'}
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
            <Box sx={{ flex: 1, minWidth: "200px" }}>
              <label htmlFor="file-input">
                <TextField
                  fullWidth
                  value={fileName}
                  sx={{
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
                  helperText={<strong color={'primary.main'}>4:1 image is preferred</strong>}
                />
              </label>
            </Box>

            {imagePreview && (
              <Box sx={{ flex: 1, minWidth: "200px" }}>
                <TextField
                  fullWidth
                  label="Image Alt Text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  sx={{
                    "& .MuiInputBase-root": {
                      height: "40px",
                    },
                    "& .MuiFormLabel-root": {
                      top: "-7px",
                    }
                  }}
                  helperText={<strong>Alt text is required!</strong>}
                />
              </Box>
            )}
          </Box>

          {/* Image Preview with Edit Button */}
          {imagePreview && !showCropper && (
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Stack
                sx={{
                  height: "200px",
                  width: "100%",
                  backgroundColor: '#f5f5f5',
                  borderRadius: 1,
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <img
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain"
                  }}
                  src={imagePreview}
                  alt="slider-image"
                />
              </Stack>
              {/* Edit Image Button - always visible at bottom right */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  display: 'flex',
                  gap: 1,
                }}
              >
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    setShowCropper(true);
                    setImageToCrop(imagePreview);
                    setIsCropping(true);
                  }}
                  startIcon={<EditIcon />}
                >
                  Edit
                </Button>
                {editImageData && (
                  <Button
                    variant="contained"
                    size="small"
                    color="error"
                    onClick={() => {
                      // Reset to original
                      setImagePreview(editImageData.image);
                      setImageToCrop(editImageData.image);
                      setImage(null);
                      setFileName('');
                    }}
                    sx={{
                      backgroundColor: 'rgba(220, 0, 0, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(220, 0, 0, 1)',
                      }
                    }}
                  >
                    Reset
                  </Button>
                )}
              </Box>
            </Box>
          )}

          {/* Cropper Section */}
          {showCropper && imageToCrop && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{
                width: '100%',
                maxHeight: '500px',
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                overflow: 'hidden'
              }}>
                <Cropper
                  ref={cropperRef}
                  src={imageToCrop}
                  style={{ height: 400, width: '100%' }}
                  aspectRatio={4 / 1}
                  guides={true}
                  viewMode={1}
                  dragMode="move"
                  cropBoxMovable={true}
                  cropBoxResizable={true}
                  toggleDragModeOnDblclick={false}
                  minCropBoxHeight={50}
                  minCropBoxWidth={200}
                  background={true}
                  responsive={true}
                  checkOrientation={false}
                  modal={true}
                  movable={true}
                  zoomable={true}
                  rotatable={false}
                  scalable={false}
                  center={true}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCrop}
                  disabled={loading}
                >
                  Apply Crop
                </Button>
                <Button
                  variant="outlined"
                  onClick={resetCropper}
                  disabled={loading}
                >
                  Cancel Crop
                </Button>
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              endIcon={loading ? <CircularProgress size={15} /> : ""}
              disabled={loading ? true : (!image && !editImageData) ? true : !altText.trim() ? true : false}
              variant="contained"
              color="primary"
              type="button"
              onClick={uploadImageHandler}
            >
              Submit
            </Button>
            <Button
              variant="outlined"
              onClick={handleClose1}
              disabled={loading}
            >
              Cancel
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
                      <img
                        height={40}
                        src={row.image}
                        alt={row.image_alt || "slider-image"}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
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