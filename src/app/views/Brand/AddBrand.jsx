import styled from "@emotion/styled";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { Formik, ErrorMessage } from "formik";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import * as Yup from "yup";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { toast } from "react-toastify";
import { useEffect } from "react";
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

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  description: Yup.string().required("Description is required"),
  file: Yup.mixed(),
  link: Yup.string().required("Link is required"),
});

const AddBrand = () => {
  const [query, setQuery] = useSearchParams();
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [imagePreview, setImagePreview] = useState(null);
  const [editBrand, setEditBrand] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const queryId = query.get("id");

  const [open, setOpen] = useState(false);
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

  const handleSubmit = async (values, { resetForm }) => {
    const payload = {
      _id: queryId ? editBrand._id : "new",
      title: values.name,
      description: values.description,
      link:values.link
    };
    try {
      setLoading(true);
      const res = await ApiService.post(apiEndpoints.addBrand, payload, auth_key);
      if (res.status === 200) {
        if (values.file) {
          if (queryId) {
            addBrandImageHandler(values.file, editBrand._id, res?.data, resetForm);
          } else {
            addBrandImageHandler(values.file, res?.data?.data?._id, res?.data, resetForm);
          }
        } else {
          // navigate(ROUTE_CONSTANT.brand.list);
          // if(!queryId) {
            setRoute(ROUTE_CONSTANT.brand.list);
          // }
          handleOpen("success", res?.data);
        }
      }
    } catch (error) {
      setLoading(false);
      handleOpen("error", error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const addBrandImageHandler = async (image, id, msg) => {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("_id", id);
    try {
      const res = await ApiService.postImage(apiEndpoints.addBrandImage, formData, auth_key);
      if (res?.status === 200) {
        // navigate(ROUTE_CONSTANT.brand.list);
        setRoute(ROUTE_CONSTANT.brand.list);
        handleOpen("success", msg);
      }
    } catch (error) {
      handleOpen("error", error?.response?.data || error);
    }
  };

  const editBrandHandler = async () => {
    try {
      const res = await ApiService.get(`${apiEndpoints.editBrand}/${queryId}`, auth_key);
      console.log(res);
      if (res?.status === 200) {
        setEditBrand(res?.data?.data);
      }
    } catch (error) {
      handleOpen("error", error?.response?.data || error);
    }
  };
  useEffect(() => {
    if (queryId) {
      editBrandHandler();
    }
  }, []);

  console.log(editBrand);
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
            onClick={() => navigate(ROUTE_CONSTANT.brand.list)}
            startIcon={<AppsIcon />}
            variant="contained"
          >
            Brand List
          </Button>
        </Box>
      </Box>
      <Box sx={{ py: "16px" }} component={Paper}>
        <Stack sx={{ ml: "16px", mb: "12px" }} gap={1} direction={"row"}>
          <Box>
            <AppsIcon />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Add Brand</Typography>
          </Box>
        </Stack>
        <Divider />

        <Formik
          initialValues={{
            name: queryId ? editBrand?.title : "",
            description: queryId ? editBrand?.description : "",
            file: "",
            link: queryId ? editBrand?.link : "",
          }}
          enableReinitialize={true}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, handleChange, handleSubmit, setFieldValue, resetForm, errors, touched }) => (
            <form onSubmit={handleSubmit}>
              <Stack gap={"16px"} sx={{ p: "16px", pb: 0 }}>
                <TextField
                  id="name"
                  name="name"
                  label={queryId ? "" : "Name"}
                  placeholder={queryId ? "Name" : ""}
                  sx={{
                    height: '40px',
                    "& .MuiInputBase-root": {
                      height: "40px",
                    },
                    "& .MuiFormLabel-root": {
                      top: '-7px'
                    }
                  }}
                  type="text"
                  value={values.name}
                  onChange={handleChange}
                  error={touched.name && Boolean(errors.name)}
                  helperText={
                    touched.name &&
                    errors.name && <Typography color="error">{errors.name}</Typography>
                  }
                />
                <TextField
                  id="description"
                  name="description"
                  label={queryId ? "" : "Enter Description"}
                  rows={2}
                  placeholder={queryId ? " Enter Description" : ""}
                  multiline
                  type="text"
                  value={values.description}
                  onChange={handleChange}
                  error={touched.description && Boolean(errors.description)}
                  helperText={
                    touched.description &&
                    errors.description && (
                      <Typography color="error">{errors.description}</Typography>
                    )
                  }
                />
                <TextField
                  fullWidth
                  value={values.file ? values.file.name : ""}
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
                          setFieldValue("file", event.currentTarget.files[0]);
                          handleImageChange(event);
                        }}
                      />
                    ),
                    readOnly: true
                  }}
                  placeholder="Select Image"
                  onClick={() => document.getElementById("file-input").click()}
                  error={touched.file && Boolean(errors.file)}
                  helperText={
                    touched.file &&
                    errors.file && <Typography color="error">{errors.file}</Typography>
                  }
                />
                <img src={imagePreview ? imagePreview : editBrand?.image} width={200} alt="" />
                <TextField
                  id="link"
                  name="link"
                  label={queryId ? "" : "Link"}
                  placeholder={queryId ? "Link" : ""}
                  sx={{
                    height: '40px',
                    "& .MuiInputBase-root": {
                      height: "40px",
                    },
                    "& .MuiFormLabel-root": {
                      top: '-7px'
                    }
                  }}
                  type="text"
                  value={values.link}
                  onChange={handleChange}
                  error={touched.link && Boolean(errors.link)}
                  helperText={
                    touched.link &&
                    errors.link && <Typography color="error">{errors.link}</Typography>
                  }
                />
                <Box sx={{ width: "100%" }}>
                  <Button
                    endIcon={loading ? <CircularProgress size={15} /> : ""}
                    disabled={loading ? true : false}
                    sx={{ mr: "16px" }}
                    variant="contained"
                    color="primary"
                    type="submit"
                  >
                    Submit
                  </Button>
                  {!queryId && (
                    <Button
                      variant="contained"
                      color="error"
                      type="reset"
                      onClick={() => {
                        resetForm();
                        setImagePreview(null);
                      }}
                    >
                      Reset
                    </Button>
                  )}
                </Box>
              </Stack>
            </form>
          )}
        </Formik>
      </Box>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </Container>
  );
};

export default AddBrand;
