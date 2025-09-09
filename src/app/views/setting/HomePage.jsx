import React, { useState, useEffect } from "react";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import {
  TextField,
  Button,
  Stack,
  Box,
  Container as MuiContainer,
  InputAdornment,
  CircularProgress,
  Autocomplete
} from "@mui/material";
import Typography from "@mui/material/Typography";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import PropTypes from "prop-types";
import CloseIcon from "@mui/icons-material/Close";
import { useCallback } from "react";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ConfirmModal from "app/components/ConfirmModal";
import QuillDes from "app/components/ReactQuillTextEditor/ReactQuillTextEditor/QuilDes";
import TextEditor from "app/components/TextEditor/TextEditor";

function Tag(props) {
  const { label, onDelete, ...other } = props;
  return (
    <div {...other}>
      <span>{label}</span>
      <CloseIcon onClick={onDelete} />
    </div>
  );
}

Tag.propTypes = {
  label: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired
};

const theme = createTheme();

const StyledContainer = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
  }
}));

const HomePage = () => {
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [formValues, setFormValues] = useState({
    url1: "",
    url2: "",
    box1Title: "",
    box2Title: "",
    box3Title: "",
    box4Title: "",
    box1CatId: [],
    box1CatName: [],
    box2CatId: [],
    box2CatName: [],
    box3CatId: [],
    box3CatName: [],
    box4CatId: [],
    box4CatName: [],
    headerText:"",
    description:"",
  });
  const [errors, setErrors] = useState({
    box1Title: "",
    box2Title: "",
    box3Title: "",
    box4Title: "",
    box1CatName: "",
    box2CatName: "",
    box3CatName: "",
    box4CatName: "",
    headerText:"",
    description:"",
  });
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [imgUrl1, setImgUrl1] = useState(null);
  const [imgUrl2, setImgUrl2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [type1, setType1] = useState("add");
  const [allActiveCat, setAllActiveCat] = useState([]);
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

  console.log({ formValues });
  console.log({ allActiveCat });
  console.log({ errors });
  // console.log({ image1 });
  // console.log({ imgUrl1 });
  // console.log({ image2 });
  // console.log({ imgUrl2 });
  // console.log({ type });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBox1Change = (event, value) => {
    if (value.length <= 4) {
      setFormValues((prv) => ({ ...prv, box1CatId: value.map((option) => option?._id) }));
      setFormValues((prv) => ({ ...prv, box1CatName: value }));
    }
  };
  const handleBox2Change = (event, value) => {
    if (value.length <= 1) {
      setFormValues((prv) => ({ ...prv, box2CatId: value.map((option) => option?._id) }));
      setFormValues((prv) => ({ ...prv, box2CatName: value }));
    }
  };
  const handleBox3Change = (event, value) => {
    if (value.length <= 4) {
      setFormValues((prv) => ({ ...prv, box3CatId: value.map((option) => option?._id) }));
      setFormValues((prv) => ({ ...prv, box3CatName: value }));
    }
  };
  const handleBox4Change = (event, value) => {
    if (value.length <= 4) {
      setFormValues((prv) => ({ ...prv, box4CatId: value.map((option) => option?._id) }));
      setFormValues((prv) => ({ ...prv, box4CatName: value }));
    }
  };

  const handleImageChange = (e, name) => {
    const file = e.target.files[0];
    if (name === "dealimg1") {
      setImage1(file);
    } else if (name === "dealimg2") {
      setImage2(file);
    }
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (name === "dealimg1") {
          setImgUrl1(reader.result);
        } else if (name === "dealimg2") {
          setImgUrl2(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!formValues.box1Title && formValues.box1CatName.length > 0)
      newErrors.box1Title = "Title is required";
    if (formValues.box1Title && formValues.box1CatName.length <= 0)
      newErrors.box1CatName = "Category is required";
    if (formValues.box1CatName.length < 4 && formValues.box1CatName.length > 0)
      newErrors.box1CatName = "Atleast select 4 category";
    if (!formValues.box2Title && formValues.box2CatName.length > 0)
      newErrors.box2Title = "Title is required";
    if (formValues.box2Title && formValues.box2CatName.length <= 0)
      newErrors.box2CatName = "Category is required";
    if (!formValues.box3Title && formValues.box3CatName.length > 0)
      newErrors.box3Title = "Title is required";
    if (formValues.box3Title && formValues.box3CatName.length <= 0)
      newErrors.box3CatName = "Category is required";
    if (formValues.box3CatName.length < 4 && formValues.box3CatName.length > 0)
      newErrors.box3CatName = "Atleast select 4 category";
    if (!formValues.box4Title && formValues.box4CatName.length > 0)
      newErrors.box4Title = "Title is required";
    if (formValues.box4Title && formValues.box4CatName.length <= 0)
      newErrors.box4CatName = "Category is required";
    if (formValues.box4CatName.length < 4 && formValues.box4CatName.length > 0)
      newErrors.box4CatName = "Atleast select 4 category";
    if (!formValues.headerText)
      newErrors.headerText = "Header Text is required";
    if (!formValues.description || formValues?.description === "<p><br></p>") newErrors.description = "Description is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append("type", type1);
        {
          image1 && formData.append("deal1", image1);
        }
        {
          image2 && formData.append("deal2", image2);
        }
        formData.append("deal_1_link", formValues.url1);
        formData.append("deal_2_link", formValues.url2);
        if (formValues.box1CatId.length > 0) {
          formData.append("box1_title", formValues.box1Title);
          formData.append("box1_category", JSON.stringify(formValues.box1CatId));
        }
        if (formValues.box2CatId.length > 0) {
          formData.append("box2_title", formValues.box2Title);
          formData.append("box2_category", JSON.stringify(formValues.box2CatId));
        }
        if (formValues.box3CatId.length > 0) {
          formData.append("box3_title", formValues.box3Title);
          formData.append("box3_category", JSON.stringify(formValues.box3CatId));
        }
        if (formValues.box4CatId.length > 0) {
          formData.append("box4_title", formValues.box4Title);
          formData.append("box4_category", JSON.stringify(formValues.box4CatId));
        }
        formData.append("header_text",formValues.headerText);
        formData.append("description",formValues.description);
        const res = await ApiService.postImage(apiEndpoints.addDeal, formData, auth_key);
        if (res?.status === 200) {
          navigate(ROUTE_CONSTANT.dashboard);
          setRoute(ROUTE_CONSTANT.dashboard);
          handleOpen("success", res?.data);
        }
      } catch (error) {
        setLoading(false);
        handleOpen("error", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getDeal = useCallback(async () => {
    try {
      const res = await ApiService.get(apiEndpoints.getDeal, auth_key);
      if (res?.status === 200) {
        const resData = res?.data?.data;
        const baseUrl = res?.data?.base_url;
        console.log("resData-----", resData)
        setFormValues((prev) => ({
          ...prev,
          url1: resData?.deal_1_link,
          url2: resData?.deal_2_link,
          box1Title: resData?.box1_title,
          box2Title: resData?.box2_title,
          box3Title: resData?.box3_title,
          box4Title: resData?.box4_title,
          box1CatId: resData?.box1_category?.map((option) => option?._id),
          box1CatName: resData?.box1_category,
          box2CatId: resData?.box2_category?.map((option) => option?._id),
          box2CatName: resData?.box2_category,
          box3CatId: resData?.box3_category?.map((option) => option?._id),
          box3CatName: resData?.box3_category,
          box4CatId: resData?.box4_category?.map((option) => option?._id),
          box4CatName: resData?.box4_category,
          headerText:resData?.header_text,
          description:resData?.description
        }));
        setImgUrl1(baseUrl + resData?.deal_1);
        setImgUrl2(baseUrl + resData?.deal_2);
        if (Object.keys(resData).length > 0) {
          setType1("update");
        } else {
          setType1("add");
        }
      }
    } catch (error) {
      handleOpen("error", error);
    }
  }, [auth_key]);

  const getActiveCategory = useCallback(async () => {
    try {
      let url = `${apiEndpoints.getActiveAdminCategory}`;

      const res = await ApiService.get(url, auth_key);
      if (res.status === 200) {
        const myNewList = res?.data?.data.map((e, i) => {
          return { "S.No": i + 1, ...e };
        });
        setAllActiveCat(myNewList);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  }, [auth_key]);

  useEffect(() => {
    getDeal();
    getActiveCategory();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <MuiContainer>
        <StyledContainer>
          <h2>Home Page</h2>
          <form>
            <Stack spacing={2} direction="row" sx={{ marginBottom: 4 }}>
              <TextField
                type="url"
                variant="outlined"
                color="primary"
                label="Deal 1 Url"
                fullWidth
                name="url1"
                placeholder="Deal 1 Url"
                onChange={handleChange}
                value={formValues.url1}
                sx={{
                  width: "100%",
                  "& .MuiInputBase-root": {
                    height: "40px",
                  },
                  "& .MuiFormLabel-root": {
                    top: "-7px",
                  },

                }}
              />
            </Stack>
            <Stack spacing={2} direction="row" sx={{ marginBottom: 4 }}>
              <TextField
                type="url"
                variant="outlined"
                color="primary"
                label="Deal 2 Url"
                fullWidth
                name="url2"
                placeholder="Deal 2 Url"
                onChange={handleChange}
                value={formValues.url2}
                sx={{
                  width: "100%",
                  "& .MuiInputBase-root": {
                    height: "40px",
                  },
                  "& .MuiFormLabel-root": {
                    top: "-7px",
                  },

                }}
              />
            </Stack>

            <Box marginBottom={4}>
              <TextField
                fullWidth
                value={image1?.name}
                sx={{
                  width: "100%",
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
                      id="file-input1"
                      onChange={(event) => {
                        handleImageChange(event, "dealimg1");
                      }}
                    />
                  ),
                  readOnly: true
                }}
                placeholder="Select deal 1 image link"
                onClick={() => document.getElementById("file-input1").click()}
              />
            </Box>

            {imgUrl1 && <img style={{ marginBottom: "35px" }} src={imgUrl1} width={200} alt="" />}

            <Box marginBottom={4}>
              <TextField
                fullWidth
                value={image2?.name}
                sx={{
                  width: "100%",
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
                      id="file-input2"
                      onChange={(event) => {
                        handleImageChange(event, "dealimg2");
                      }}
                    />
                  ),
                  readOnly: true
                }}
                placeholder="Select deal 2 image link"
                onClick={() => document.getElementById("file-input2").click()}
              />
            </Box>

            {imgUrl2 && <img style={{ marginBottom: "14px" }} src={imgUrl2} width={200} alt="" />}

            <h2>Featured Occassions</h2>

            <h4>Box 1</h4>
            <Box marginBottom={4}>
              <TextField
                error={errors.box1Title && true}
                helperText={errors.box1Title}
                type="text"
                variant="outlined"
                color="primary"
                label="Title"
                fullWidth
                name="box1Title"
                placeholder="Title"
                onChange={handleChange}
                value={formValues.box1Title}
                sx={{
                  width: "100%",
                  "& .MuiInputBase-root": {
                    height: "40px",
                  },
                  "& .MuiFormLabel-root": {
                    top: "-7px",
                  },

                }}
              />
            </Box>

            <Box width={"100%"} marginBottom={4}>
              <Autocomplete
                multiple
                limitTags={4}
                id="multiple-limit-tags"
                options={allActiveCat}
                getOptionLabel={(option) => option.title}
                renderInput={(params) => {
                  return <TextField {...params} label="Category " placeholder="Select Category " sx={{
                    width: "100%",
                    "& .MuiInputBase-root": {
                      height: "40px",
                      padding: '0 11px'
                    },
                    "& .MuiFormLabel-root": {
                      top: "-7px",
                    },

                  }} />;
                }}

                onChange={handleBox1Change}
                value={formValues?.box1CatName}
                defaultValue={formValues?.box1CatName.length > 0 ? formValues?.box1CatName : []}
                name="box1CatName"
                isOptionEqualToValue={(option, value) => option._id === value._id}
              />
              {errors.box1CatName && (
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#FF3D57",
                    marginLeft: "14px",
                    marginRight: "14px",
                    marginTop: "3px"
                  }}
                >
                  {errors.box1CatName}
                </Typography>
              )}
            </Box>

            <h4>Box 2</h4>
            <Box marginBottom={4}>
              <TextField
                error={errors.box2Title && true}
                helperText={errors.box2Title}
                type="text"
                variant="outlined"
                color="primary"
                label="Title"
                fullWidth
                name="box2Title"
                placeholder="Title"
                onChange={handleChange}
                value={formValues.box2Title}
                sx={{
                  width: "100%",
                  "& .MuiInputBase-root": {
                    height: "40px",
                  },
                  "& .MuiFormLabel-root": {
                    top: "-7px",
                  },

                }}
              />
            </Box>

            <Box width={"100%"} marginBottom={4}>
              <Autocomplete
                multiple
                limitTags={4}
                id="multiple-limit-tags"
                options={allActiveCat}
                getOptionLabel={(option) => option.title}
                renderInput={(params) => {
                  return <TextField {...params} label="Category " placeholder="Select Category " sx={{
                    width: "100%",
                    "& .MuiInputBase-root": {
                      height: "40px",
                      padding: '0 11px'
                    },
                    "& .MuiFormLabel-root": {
                      top: "-7px",
                    },

                  }} />;
                }}
                onChange={handleBox2Change}
                value={formValues?.box2CatName}
                defaultValue={formValues?.box2CatName.length > 0 ? formValues?.box2CatName : []}
                name="box2CatName"
                isOptionEqualToValue={(option, value) => option._id === value._id}
              />
              {errors.box2CatName && (
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#FF3D57",
                    marginLeft: "14px",
                    marginRight: "14px",
                    marginTop: "3px"
                  }}
                >
                  {errors.box2CatName}
                </Typography>
              )}
            </Box>

            <h4>Box 3</h4>
            <Box marginBottom={4}>
              <TextField
                error={errors.box3Title && true}
                helperText={errors.box3Title}
                type="text"
                variant="outlined"
                color="primary"
                label="Title"
                fullWidth
                name="box3Title"
                placeholder="Title"
                onChange={handleChange}
                value={formValues.box3Title}
                sx={{
                  width: "100%",
                  "& .MuiInputBase-root": {
                    height: "40px",
                  },
                  "& .MuiFormLabel-root": {
                    top: "-7px",
                  },

                }}
              />
            </Box>

            <Box width={"100%"} marginBottom={4}>
              <Autocomplete
                multiple
                limitTags={4}
                id="multiple-limit-tags"
                options={allActiveCat}
                getOptionLabel={(option) => option.title}
                renderInput={(params) => {
                  return <TextField {...params} label="Category " placeholder="Select Category " sx={{
                    width: "100%",
                    "& .MuiInputBase-root": {
                      height: "40px",
                      padding: '0 11px'
                    },
                    "& .MuiFormLabel-root": {
                      top: "-7px",
                    },

                  }} />;
                }}
                onChange={handleBox3Change}
                value={formValues?.box3CatName}
                defaultValue={formValues?.box3CatName.length > 0 ? formValues?.box3CatName : []}
                name="box3CatName"
                isOptionEqualToValue={(option, value) => option._id === value._id}
              />
              {errors.box3CatName && (
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#FF3D57",
                    marginLeft: "14px",
                    marginRight: "14px",
                    marginTop: "3px"
                  }}
                >
                  {errors.box3CatName}
                </Typography>
              )}
            </Box>

            <h4>Box 4</h4>
            <Box marginBottom={4}>
              <TextField
                error={errors.box4Title && true}
                helperText={errors.box4Title}
                type="text"
                variant="outlined"
                color="primary"
                label="Title"
                fullWidth
                name="box4Title"
                placeholder="Title"
                onChange={handleChange}
                value={formValues.box4Title}
                sx={{
                  width: "100%",
                  "& .MuiInputBase-root": {
                    height: "40px",
                  },
                  "& .MuiFormLabel-root": {
                    top: "-7px",
                  },

                }}
              />
            </Box>

            <Box width={"100%"} marginBottom={4}>
              <Autocomplete
                multiple
                limitTags={4}
                id="multiple-limit-tags"
                options={allActiveCat}
                getOptionLabel={(option) => option.title}
                renderInput={(params) => {
                  return <TextField {...params} label="Category " placeholder="Select Category " sx={{
                    width: "100%",
                    "& .MuiInputBase-root": {
                      height: "40px",
                      padding: '0 11px'
                    },
                    "& .MuiFormLabel-root": {
                      top: "-7px",
                    },

                  }} />;
                }}
                onChange={handleBox4Change}
                // onBlur={() => {
                //   if (formValues.tags.length <= 0) {
                //     setErrors((prv) => ({ ...prv, tags: "Tags is Required" }));
                //   }
                // }}
                value={formValues?.box4CatName}
                defaultValue={formValues?.box4CatName.length > 0 ? formValues?.box4CatName : []}
                name="box4CatName"
                isOptionEqualToValue={(option, value) => option._id === value._id}
              />
              {errors.box4CatName && (
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#FF3D57",
                    marginLeft: "14px",
                    marginRight: "14px",
                    marginTop: "3px"
                  }}
                >
                  {errors.box4CatName}
                </Typography>
              )}
            </Box>

            <h2>Header</h2>
            <Box marginBottom={4}>
              <TextField
                error={errors.headerText && true}
                helperText={errors.headerText}
                type="text"
                variant="outlined"
                color="primary"
                label="Header Text"
                fullWidth
                name="headerText"
                placeholder="Header Text"
                onChange={handleChange}
                value={formValues.headerText}
                sx={{
                  width: "100%",
                  "& .MuiInputBase-root": {
                    height: "40px",
                  },
                  "& .MuiFormLabel-root": {
                    top: "-7px",
                  },

                }}
              />
            </Box>
            
            <h2>Home Page Description</h2>
            {/* <TextEditor name="description" value={formValues?.description} setFormValues={setFormValues}/> */}
            <Box width={"100%"}>
                <Box
                    sx={{
                        width: "100%"
                    }}
                >
                    <Box
                        sx={{
                            height: "auto", 
                            width: "100%"
                        }}
                        >
                        <QuillDes formValues={formValues} setFormValues={setFormValues} setErrors={setErrors} />
                        </Box>
                        {errors.description && (
                        <Typography
                            sx={{
                            fontSize: "12px",
                            color: "#FF3D57",
                            marginLeft: "14px",
                            marginRight: "14px",
                            marginTop: "3px"
                            }}
                        >
                            {errors.description}
                        </Typography>
                        )}
                </Box>
            </Box>
            <Button
              endIcon={loading ? <CircularProgress size={15} /> : ""}
              disabled={loading ? true : false}
              sx={{ mr: "16px" }}
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </form>
        </StyledContainer>
      </MuiContainer>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </ThemeProvider>
  );
};

export default HomePage;
