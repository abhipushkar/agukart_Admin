import { Box, Button, Divider, Paper, Stack, TextField, Autocomplete } from "@mui/material";
import { useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import React, { useState } from "react";
import QuillDes from "app/components/ReactQuillTextEditor/SingleReactQuillTextEditor/QuilDes";
import Typography from "@mui/material/Typography";
import AppsIcon from "@mui/icons-material/Apps";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { toast } from "react-toastify";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { useEffect } from "react";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useCallback } from "react";
import ConfirmModal from "app/components/ConfirmModal";
import SingleTextEditor from "app/components/TextEditor/SingleTextEditor";

const AddBlog = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    title: "",
    shortDes: "",
    tags: [],
    tags_id: [],
    authorName: ""
  });
  const [images, setImages] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [des, setDes] = useState("");
  const [allTags, setAllTags] = useState([]);

  const [errors, setErrors] = useState({
    title: "",
    shortDes: "",
    des: "",
    images: "",
    tags: "",
    authorName: ""
  });
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [query, setQuery] = useSearchParams();
  const queryId = query.get("id");

  const [open, setOpen] = React.useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);

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

  console.log({ formValues });
  console.log({ des });

  const handleButtonClick = () => {
    inputFileRef.current.click();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prv) => ({ ...prv, [name]: "" }));
  };

  const handleTagHandler = (event, value) => {
    setFormValues((prv) => ({ ...prv, tags_id: value.map((option) => option?._id) }));
    setFormValues((prv) => ({ ...prv, tags: value }));
    setErrors((prv) => ({ ...prv, tags: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImages(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // const handleImageChange = (e) => {
  //   if (images.length === 9) {
  //     toast.error("Selected Images Must be 9");
  //     return;
  //   }
  //   const fileList = Array.from(e.target.files);
  //   if (fileList.length + images.length > 9) {
  //     toast.error("Selected Images Must be 9");
  //     return;
  //   }
  //   const imageUrls = fileList.map((file, i) => {
  //     return { src: URL.createObjectURL(file), id: images.length, file: file, _id: uuidv4() };
  //   });

  //   console.log({ imageUrls });

  //   setImages((prevImages) => [...prevImages, ...imageUrls]);
  // };

  const handleAddBlog = async () => {
    const newErrors = {};
    if (!formValues.title) newErrors.title = "Title is required";
    if (!formValues.shortDes) newErrors.shortDes = "Short Description is required";
    if (!des) newErrors.des = "Description is required";
    if (!imageSrc) newErrors.images = "Image is required";
    if (formValues.tags?.length <= 0) newErrors.tags = "Tags is required";
    if (!formValues.authorName) newErrors.authorName = "Author Name is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      try {
        const payload = {
          _id: queryId ? queryId : "new",
          title: formValues.title,
          short_description: formValues.shortDes,
          description: des,
          tag_id: formValues.tags_id,
          author_name: formValues.authorName
        };
        const res = await ApiService.post(apiEndpoints.addBlogs, payload, auth_key);
        if (res?.status === 200) {
          console.log("res---", res);
          // setFormValues("");
          // setImages(null);
          // setDes("");
          if (images) {
            handleUploadImg(res?.data?.blog?._id);
          }
          if(!queryId) {
            setRoute(ROUTE_CONSTANT.blog.list);
          }
          handleOpen("success", res?.data);
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  };

  const handleUploadImg = async (id) => {
    try {
      const formData = new FormData();
      formData.append("_id", id);
      formData.append("file", images);
      const res = await ApiService.postImage(apiEndpoints.addBlogImg, formData, auth_key);
      if (res.status === 200) {
        console.log(res);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  const getBlog = async () => {
    try {
      const res = await ApiService.get(`${apiEndpoints.getBlogById}/${queryId}`, auth_key);
      if (res?.status === 200) {
        console.log("res-----", res?.data?.data);
        const resData = res?.data?.data;
        setFormValues((prev) => ({
          ...prev,
          title: resData?.title,
          shortDes: resData?.short_description,
          tags_id: resData?.tag_id?.map((option) => option?._id),
          tags: resData?.tag_id,
          authorName: resData?.author_name
        }));
        setDes(resData?.description);
        setImageSrc(resData?.image);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  useEffect(() => {
    if (queryId) {
      getBlog();
    } else {
      setFormValues({
        title: "",
        shortDes: "",
        tags: [],
        tags_id: [],
        authorName: ""
      });
      setDes("");
      setImages(null);
      setImageSrc(null);
    }
  }, [queryId]);

  const getTagList = useCallback(async () => {
    try {
      let url = `${apiEndpoints.getActiveTagBlog}`;

      const res = await ApiService.get(url, auth_key);
      if (res.status === 200) {
        const myNewList = res?.data?.data.map((e, i) => {
          return { "S.No": i + 1, ...e };
        });
        setAllTags(myNewList);
        // setSearchList(myNewList);

        const xData = myNewList.map((e, i) => {
          let obj = {
            "S.NO": i + 1,
            title: e.title,
            status: e.status ? "Active" : "In Active"
          };
          return obj;
        });
      }
    } catch (error) {
      handleOpen("error", error);
    }
  }, [auth_key]);

  useEffect(() => {
    getTagList();
  }, []);

  const inputFileRef = React.useRef(null);
  console.log({ images });

  return (
    <>
      <Box sx={{ margin: "30px" }}>
        <Box sx={{ py: "16px", marginBottom: "20px" }} component={Paper}>
          <Stack sx={{ ml: "24px", mb: "12px" }} gap={1} direction={"row"}>
            <Box>
              <AppsIcon />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Go To</Typography>
            </Box>
          </Stack>
          <Divider />
          <Box sx={{ ml: "24px", mt: "16px" }}>
            <Button
              onClick={() => navigate(ROUTE_CONSTANT.blog.list)}
              startIcon={<AppsIcon />}
              variant="contained"
            >
              Blog List
            </Button>
          </Box>
        </Box>
        <Box sx={{ p: "24px" }} component={Paper}>
          <Box
            sx={{
              display: "flex",
              marginBottom: "20px",
              gap: "20px"
            }}
          >
            {/* <Box
            sx={{
              fontSize: "14px",
              fontWeight: "700",
              wordBreak: "normal",
              width: "20%",
              textWrap: "nowrap"
            }}
          >
            Title{" "}
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
              *
            </span>{" "}
            :
          </Box> */}
            <Box width={"100%"}>
              <Box
                sx={{
                  height: "auto", // Set your desired height
                  width: "100%"
                }}
              >
                <TextField
                  error={errors.title && true}
                  helperText={errors.title}
                  onBlur={() => {
                    if (!formValues.title) {
                      setErrors((prv) => ({ ...prv, title: "Title is Required" }));
                    }
                  }}
                  name="title"
                  label="Title"
                  onChange={handleChange}
                  value={formValues.title}
                  rows={4}
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-root": {
                      height: "40px"
                    },
                    "& .MuiFormLabel-root": {
                      top: "-7px"
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: "20px",
              marginBottom: "20px"
            }}
          >
            {/* <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "20%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap",
              textAlign: "center",
              display: "flex",
              gap: "3px"
            }}
          >
            Tag{" "}
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
              *
            </span>{" "}
            : <HelpOutlineIcon sx={{ width: "15px" }} />:
          </Box> */}
            <Box width={"100%"}>
              <Autocomplete
                multiple
                limitTags={4}
                id="multiple-limit-tags"
                options={allTags}
                getOptionLabel={(option) => option.title}
                renderInput={(params) => {
                  return (
                    <TextField
                      {...params}
                      label="Tag "
                      placeholder="Select Tag "
                      sx={{
                        width: "100%",
                        "& .MuiInputBase-root": {
                          // height: "40px",
                          padding: "0 11px"
                        },
                        "& .MuiFormLabel-root": {
                          top: "-7px"
                        }
                      }}
                    />
                  );
                }}
                onChange={handleTagHandler}
                onBlur={() => {
                  if (formValues.tags.length <= 0) {
                    setErrors((prv) => ({ ...prv, tags: "Tags is Required" }));
                  }
                }}
                value={formValues?.tags}
                defaultValue={formValues?.tags.length > 0 ? formValues?.tags : []}
                name="tags"
                isOptionEqualToValue={(option, value) => option._id === value._id}
              />
              {errors.tags && (
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#FF3D57",
                    marginLeft: "14px",
                    marginRight: "14px",
                    marginTop: "3px"
                  }}
                >
                  {errors.tags}
                </Typography>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              marginBottom: "20px",
              gap: "20px"
            }}
          >
            {/* <Box
            sx={{
              fontSize: "14px",
              fontWeight: "700",
              wordBreak: "normal",
              width: "20%",
              textWrap: "nowrap"
            }}
          >
            Author Name{" "}
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
              *
            </span>{" "}
            :
          </Box> */}
            <Box width={"100%"}>
              <Box
                sx={{
                  height: "auto", // Set your desired height
                  width: "100%"
                }}
              >
                <TextField
                  error={errors.authorName && true}
                  helperText={errors.authorName}
                  onBlur={() => {
                    if (!formValues.authorName) {
                      setErrors((prv) => ({ ...prv, authorName: "Author Name is Required" }));
                    }
                  }}
                  name="authorName"
                  label="Author Name"
                  onChange={handleChange}
                  value={formValues.authorName}
                  rows={4}
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-root": {
                      height: "40px"
                    },
                    "& .MuiFormLabel-root": {
                      top: "-7px"
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              marginBottom: "40px",
              gap: "20px"
            }}
          >
            {/* <Box
            sx={{
              fontSize: "14px",
              fontWeight: "700",
              wordBreak: "normal",
              width: "20%",
              textWrap: "nowrap"
            }}
          >
            Short Description{" "}
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
              *
            </span>{" "}
            :
          </Box> */}
            <Box width={"100%"}>
              <Box
                sx={{
                  height: "auto", // Set your desired height
                  width: "100%"
                }}
              >
                <TextField
                  error={errors.shortDes && true}
                  helperText={errors.shortDes}
                  onBlur={() => {
                    if (!formValues.shortDes) {
                      setErrors((prv) => ({ ...prv, shortDes: "Short Description is Required" }));
                    }
                  }}
                  name="shortDes"
                  label="Short Description"
                  onChange={handleChange}
                  value={formValues.shortDes}
                  rows={2}
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-root": {
                      height: "40px"
                    },
                    "& .MuiFormLabel-root": {
                      top: "-7px"
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              marginBottom: "40px",
              gap: "20px"
            }}
          >
            {/* <Box
            sx={{
              fontSize: "14px",
              fontWeight: "700",
              wordBreak: "normal",
              width: "20%",
              textWrap: "nowrap"
            }}
          >
            Description{" "}
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
              *
            </span>{" "}
            :
          </Box> */}
            <Box width={"100%"}>
              <Box
                sx={{
                  height: "auto", // Set your desired height
                  width: "100%"
                }}
              >
                <QuillDes des={des} setDes={setDes} setErrors={setErrors} />
              </Box>
              {/* <SingleTextEditor value={des} setDescription={setDes}/> */}
              {errors.des && (
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#FF3D57",
                    marginLeft: "14px",
                    marginRight: "14px",
                    marginTop: "3px"
                  }}
                >
                  {errors.des}
                </Typography>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: "20px",
              marginTop: "20px"
            }}
          >
            {/* <Box
            sx={{
              fontSize: "14px",
              fontWeight: "700",
              wordBreak: "normal",
              width: "16%",
              textWrap: "nowrap"
            }}
          >
            images{" "}
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
              *
            </span>{" "}
            :
          </Box> */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                gap: "5px"
              }}
            >
              <div onClick={handleButtonClick}>
                <ControlPointIcon />
              </div>
              <div onClick={handleButtonClick}>Upload File</div>
              <input
                // multiple
                type="file"
                accept="image/*"
                // onChange={handleImageChange}
                onChange={handleFileChange}
                ref={inputFileRef}
                style={{ display: "none" }}
              />
            </Box>
            {errors.images && (
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "#FF3D57",
                  marginLeft: "14px",
                  marginRight: "14px",
                  marginTop: "3px"
                }}
              >
                {errors.images}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: "20px"
            }}
          >
            {/* <Box
            sx={{
              fontSize: "14px",
              fontWeight: "700",
              wordBreak: "normal",
              width: "16%",
              textWrap: "nowrap"
            }}
          >
            
          </Box> */}
            {imageSrc && (
              <Box>
                {/* <MyImageGrid images={images} setImages={setImages} /> */}
                <img
                  src={imageSrc}
                  alt=""
                  style={{
                    aspectRatio: "9/5",
                    height: "100%",
                    width: "100%",
                    objectFit: "contain"
                  }}
                />
              </Box>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
              marginTop: "15px",
              gap: "5px"
            }}
          >
            <Button variant="contained" onClick={handleAddBlog}>
              Submit
            </Button>
          </Box>
        </Box>
      </Box>
      <ConfirmModal
        open={open}
        handleClose={handleClose}
        type={type}
        msg={msg}
      />
    </>
  );
};

export default AddBlog;
