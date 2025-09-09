import React, { useRef, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Link,
  IconButton,
  CircularProgress
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ReactQuill from "react-quill";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { ApiService } from "app/services/ApiService";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { localStorageKey } from "app/constant/localStorageKey";
import ConfirmModal from "app/components/ConfirmModal";
import { REACT_APP_WEB_URL } from "config";

const Story = ({
  formValues,
  setFormValues,
  errors,
  setErrors,
  handleValidate,
  shopData,
  setShopData,
  images,
  setImages,
  setImageSrc,
  showVideo,
  setShowVideo,
  queryId,
  loading,
  handleVendorSave,
  setIsDeleteVideo
}) => {
  console.log({shopData,showVideo})
  const navigate = useNavigate();
  const videoRef = useRef();
  const inputFileRefs = useRef([]);
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [indexing, setIndexing] = useState(null);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);

  const logOut = () => {
    localStorage.removeItem(localStorageKey.auth_key);
    localStorage.removeItem(localStorageKey.designation_id);
    localStorage.removeItem(localStorageKey.vendorId);
    navigate(ROUTE_CONSTANT.login);
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
    setIndexing(null);
    if (route !== null) {
      navigate(route);
    }
    setRoute(null);
    setMsg(null);
  };

  console.log({ shopData });

  const handleShopChange = (index, field, value) => {
    const newShopData = [...shopData];
    newShopData[index][field] = value;
    setShopData(newShopData);
  };

  const handleDelete = () => {
    const newShopData = shopData.filter((_, index) => index !== indexing);
    setShopData(newShopData);
    setIndexing(null);
  };

  const handleAddMore = () => {
    setShopData((prev) => [...prev, { imgSrc: null, image: "", title: "" }]);
  };

  const handleRemoveShop = (indexToRemove) => {
    setShopData((prev) => prev.filter((_, i) => i !== indexToRemove));
  };


  const handleFileChange = async (e, index) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await ApiService.postImage(apiEndpoints.addShopPhotos, formData, auth_key);
        if (res?.status === 200) {
          console.log("resShopPhotos", res);
          const reader = new FileReader();
          reader.onload = (event) => {
            setShopData((prev) => {
              const newShopData = [...prev];
              newShopData[index] = {
                ...newShopData[index],
                image: res?.data?.fileName,
                imgSrc: event.target.result
              };
              return newShopData;
            });
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        if (error?.response?.status === 401) {
          logOut();
        }
      }
    }
  };

  const handleOpenFileDialog = (index) => {
    const inputRef = inputFileRefs.current[index];
    if (inputRef) {
      inputRef.click();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prv) => ({ ...prv, [name]: "" }));
  };

  const handleVideoChange = (e) => {
    setShowVideo("");
    const file = e.target.files[0];
    const allowedTypes = ["video/mp4"];

    if (file && allowedTypes.includes(file.type)) {
      setFormValues((prev) => ({ ...prev, shopVideo: file }));
      const reader = new FileReader();
      reader.onload = () => {
        setShowVideo(reader.result);
      };
      reader.readAsDataURL(file);
      setErrors((prev) => ({ ...prev, shopVideo: "" }));
    } else {
      setFormValues((prev) => ({ ...prev, shopVideo: "" }));
      setErrors((prev) => ({ ...prev, shopVideo: "Please select a valid MP4 video file." }));
    }
  };

  // const handleSave = async () => {
  //   if (handleValidate("story")) {
  //     try {
  //       const filterMemberData = formValues?.memberData?.map(({ imgSrc, ...rest }) => rest);
  //       const filterShopData = shopData?.map(({ imgSrc, ...rest }) => rest);
  //       setLoading(true);
  //       const payload = {
  //         _id: queryId ? queryId : "new",
  //         name: formValues.name,
  //         mobile: formValues.mobileNo,
  //         email: formValues.email,
  //         gender: formValues.gender,
  //         dob: formValues.dob,
  //         phone_code: formValues.mobileCode,
  //         country_id: `${formValues.country}`,
  //         state_id: `${formValues.state}`,
  //         city_id: `${formValues.city}`,
  //         password: formValues.password,
  //         confirm_password: formValues.cPassword,
  //         shop_title: formValues.shopTitle,
  //         shop_address: formValues.shopAddress,
  //         shop_announcement: formValues.shopAnnouncement,
  //         buyers_message: formValues.msgToBuyers,
  //         shop_name: formValues.newShopName,
  //         members: filterMemberData,
  //         description: formValues.description,
  //         shop_policy: formValues.shopPolicy,
  //         story_headline: formValues.headline,
  //         story: formValues.storyDesc,
  //         shop_photos: filterShopData
  //       };
  //       const res = await ApiService.post(apiEndpoints.addVendor, payload, auth_key);
  //       if (res?.status === 200) {
  //         // setFormValues("");
  //         // setImages(null);
  //         // setImageSrc(null);
  //         if (images) {
  //           handleUploadImg(res?.data?.user?._id);
  //         }
  //         if (formValues?.shopIcon) {
  //           uploadShopIcon(res?.data?.user?._id);
  //         }
  //         if (formValues?.shopVideo) {
  //           uploadStoryVideo(res?.data?.user?._id);
  //         }
  //         // navigate(ROUTE_CONSTANT.vendor.list);
  //         // if(!queryId) {
  //           setRoute(ROUTE_CONSTANT.vendor.list);
  //         // }
  //         handleOpen("success", res?.data);
  //       }
  //     } catch (error) {
  //       setLoading(false);
  //       handleOpen("error", error?.response?.data || error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  // };

  // const handleUploadImg = async (id) => {
  //   try {
  //     const formData = new FormData();
  //     formData.append("_id", id);
  //     formData.append("file", images);
  //     const res = await ApiService.postImage(apiEndpoints.addVendorProfile, formData, auth_key);
  //     if (res.status === 200) {
  //       console.log(res);
  //     }
  //   } catch (error) {
  //     handleOpen("error", error);
  //   }
  // };

  // const uploadShopIcon = async (id) => {
  //   try {
  //     const formData = new FormData();
  //     formData.append("_id", id);
  //     formData.append("file", formValues?.shopIcon);
  //     const res = await ApiService.postImage(apiEndpoints.addShopIcon, formData, auth_key);
  //     if (res.status === 200) {
  //       console.log(res);
  //     }
  //   } catch (error) {
  //     handleOpen("error", error);
  //   }
  // };

  // const uploadStoryVideo = async (id) => {
  //   try {
  //     const formData = new FormData();
  //     formData.append("_id", id);
  //     formData.append("video", formValues?.shopVideo);
  //     const res = await ApiService.postImage(apiEndpoints.addShopVideo, formData, auth_key);
  //     if (res.status === 200) {
  //       console.log(res);
  //     }
  //   } catch (error) {
  //     handleOpen("error", error);
  //   }
  // };

  return (
    <>
      <h2 style={{ marginTop: "0" }}>Shop Story</h2>
      <Box>
        <Box p={2} mb={3} bgcolor={"#e4e4e4"} borderRadius={"6px"}>
          <Typography fontWeight={500} fontSize={16}>
            Your Shop's About is live!
          </Typography>
        </Box>
        <Box mb={3} border={"1px solid #b9b9b9"} borderRadius={"6px"} overflow={"hidden"}>
          <Typography
            component="div"
            fontWeight={600}
            fontSize={17}
            borderBottom={"1px solid 1px solid #b9b9b9"}
            bgcolor={"#e4e4e4"}
            p={2}
          >
            Shop Story
          </Typography>
          <Box p={2}>
            <Typography component="div">
              <Typography pb={1} sx={{ fontSize: "16px", fontWeight: "600" }}>
                Story Headline
              </Typography>
              <TextField
                error={errors.headline && true}
                helperText={errors.headline}
                onBlur={() => {
                  if (!formValues.headline) {
                    setErrors((prv) => ({ ...prv, headline: "Story headline is Required" }));
                  }
                }}
                type="text"
                value={formValues.headline}
                onChange={handleChange}
                name="headline"
                placeholder="My Journey For jewelry making"
                sx={{
                  width: "100%",
                  "& .MuiInputBase-root": {
                    height: "40px"
                  }
                }}
              />
            </Typography>
            <Typography component="div" mt={3}>
              <Typography pb={1} sx={{ fontSize: "16px", fontWeight: "600" }}>
                Story
              </Typography>
              <ReactQuill
                placeholder="Hello Everybody"
                onChange={(html) => {
                  setFormValues((prev) => ({ ...prev, storyDesc: html }));
                  setErrors((prv) => ({ ...prv, storyDesc: "" }));
                }}
                onBlur={() => {
                  if (!formValues.storyDesc || formValues.storyDesc === "<p><br></p>") {
                    setErrors((prv) => ({ ...prv, storyDesc: "Story is Required" }));
                  }
                }}
                value={formValues?.storyDesc === "<p><br></p>" ? "" : formValues?.storyDesc}
              />
              {errors.storyDesc && (
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#FF3D57",
                    marginLeft: "14px",
                    marginRight: "14px",
                    marginTop: "3px"
                  }}
                >
                  {errors.storyDesc}
                </Typography>
              )}
            </Typography>
          </Box>
        </Box>
        <Box mb={3} border={"1px solid #b9b9b9"} borderRadius={"6px"} overflow={"hidden"}>
          <Typography
            component="div"
            fontWeight={600}
            fontSize={17}
            borderBottom={"1px solid 1px solid #b9b9b9"}
            bgcolor={"#e4e4e4"}
            p={2}
          >
            Shop Video
          </Typography>
          <Box p={2}>
            <Grid container spacing={3} p={0} sx={{ margin: "0", width: "100%" }}>
              <Grid item lg={3} md={4} xs={12} mb={1}>
                <Typography fontSize={16} fontWeight={500}>
                  Have a video ready to go
                </Typography>
              </Grid>
              <Grid item lg={3} md={4} xs={12} mb={1}>
                <Typography fontSize={16} fontWeight={500}>
                  See the{" "}
                  <Link href="#" sx={{ textDecoration: "underline", color: "#000" }}>
                    shop video FAQa{" "}
                  </Link>{" "}
                  for all sorts of ideas and advice on making a great shop video.
                </Typography>
                <Typography fontSize={16} fontWeight={500}>
                  By uploading a video, you confirm that you have all the necessary rights to the
                  content and you agree to Etay'a{" "}
                  <Link href="#" sx={{ textDecoration: "underline", color: "#000" }}>
                    {" "}
                    Terms of Use{" "}
                  </Link>
                </Typography>
                <Typography fontSize={16} fontWeight={500} color={"gray"}>
                  MOV, MPEG, AVI, MP4, M4V-300 MB file limit
                </Typography>
                <Typography component="div" mt={2}>
                  <Button
                    sx={{
                      background: "#000",
                      border: "none",
                      borderRadius: "5px",
                      color: "#fff",
                      padding: "6px 18px",
                      "&:hover": { background: "#545454" }
                    }}
                    onClick={() => videoRef.current.click()}
                  >
                    {showVideo ? "Replace Video" : "Add Video"}
                  </Button>
                  <input
                    className="form-control w-100 position-absolute"
                    type="file"
                    id="formFile"
                    onChange={handleVideoChange}
                    accept=".mp4"
                    style={{ display: "none" }}
                    ref={videoRef}
                  />
                </Typography>
              </Grid>
              <Grid item lg={6} md={4} xs={12} mb={1}>
                <Typography component="div" sx={{ position: "relative" }}>
                  {showVideo && (
                    <div style={{ position: 'relative', marginTop: '10px' }}>
                      <button
                        onClick={() => {
                          setShowVideo(null);
                          setIsDeleteVideo(true);
                        }}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: '#ff4d4d',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          cursor: 'pointer',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                          zIndex: 2,
                        }}
                        aria-label="Close video preview"
                      >
                        ×
                      </button>

                      <video
                        width="100%"
                        height="300"
                        controls
                        src={showVideo}
                        style={{
                          borderRadius: '8px',
                          display: 'block',
                          width: '100%',
                        }}
                      />
                    </div>
                  )}
                </Typography>
                {errors.shopVideo && (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#FF3D57",
                      marginLeft: "14px",
                      marginRight: "14px",
                      marginTop: "3px"
                    }}
                  >
                    {errors.shopVideo}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Box mb={3} border={"1px solid #b9b9b9"} borderRadius={"6px"} overflow={"hidden"}>
          <Typography
            component="div"
            fontWeight={600}
            fontSize={17}
            borderBottom={"1px solid 1px solid #b9b9b9"}
            bgcolor={"#e4e4e4"}
            p={2}
          >
            Shop Photos
          </Typography>
          <Box p={2}>
            <Typography fontSize={16} fontWeight={500}>
              Photos will be cropped and displayed at 760px by 468px. supported formate are jpg, png
              or gif
            </Typography>
            {errors.shopPhotos && (
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "#FF3D57",
                  marginLeft: "14px",
                  marginRight: "14px",
                  marginTop: "3px"
                }}
              >
                {errors.shopPhotos}
              </Typography>
            )}
            <Box mt={3}>
              {shopData?.map((shop, index) => (
                <Typography component="div" mb={2} sx={{ display: "flex" }} key={index}>
                  <Typography
                    component="div"
                    pr={2}
                    sx={{ width: { lg: "15%", md: "20%", xs: "30%" } }}
                  >
                    <Typography
                      component="div"
                      p={1}
                      sx={{
                        position: "relative",
                        width: { lg: "120px", md: "120px", xs: "100%" },
                        height: { lg: "120px", md: "120px", xs: "100%" },
                        border: "1px solid #000",
                        borderRadius: "4px"
                      }}
                    >
                      {shop?.imgSrc ? (
                        <img
                          src={
                            shop?.imgSrc ||
                            `${REACT_APP_WEB_URL}/backend/uploads/deal/1725509309822-446424046.webp`
                          }
                          style={{
                            borderRadius: "4px",
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                          alt=""
                        />
                      ) : (
                        <Typography textAlign={"center"}>
                          <IconButton aria-label="add" onClick={() => handleOpenFileDialog(index)}>
                            <AddCircleOutlineIcon />
                          </IconButton>
                        </Typography>
                      )}
                      <input
                        ref={(el) => (inputFileRefs.current[index] = el)}
                        onChange={(e) => handleFileChange(e, index)}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                      />
                      {shop?.imgSrc && (
                        <Button
                          sx={{
                            minWidth: "30px",
                            position: "absolute",
                            left: "12px",
                            top: "12px",
                            background: "#000",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            "&:hover": { background: "#000" }
                          }}
                          onClick={() => handleOpenFileDialog(index)}
                        >
                          <AddCircleOutlineIcon sx={{ fontSize: "18px", color: "#fff" }} />
                        </Button>
                      )}
                      {shop?.imgSrc && (
                        <Button
                          sx={{
                            minWidth: "30px",
                            position: "absolute",
                            right: "12px",
                            top: "12px",
                            background: "#000",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            "&:hover": { background: "#000" }
                          }}
                          onClick={() => {
                            handleOpen("deleteShopPhoto");
                            setIndexing(index);
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: "18px", color: "#fff" }} />
                        </Button>
                      )}
                    </Typography>
                  </Typography>
                  <Typography
                    pl={2}
                    component="div"
                    sx={{ width: { lg: "85%", md: "80%", xs: "70%" } }}
                  >
                    <TextField
                      multiline
                      rows={4}
                      variant="outlined"
                      value={shop.title}
                      onChange={(e) => handleShopChange(index, "title", e.target.value)}
                      fullWidth
                    />
                    <Typography color={"#c6c6c6"} textAlign={"end"}>
                      {shop.title.length}/50
                    </Typography>
                    <Button
                      sx={{
                        mt: 1,
                        background: "#d32f2f",
                        color: "#fff",
                        "&:hover": { background: "#b71c1c" }
                      }}
                      onClick={() => handleRemoveShop(index)}
                    >
                      Delete Item
                    </Button>
                  </Typography>
                </Typography>
              ))}
              <Typography component="div" textAlign={"end"}>
                <Button
                  onClick={handleAddMore}
                  sx={{
                    background: "#000",
                    border: "none",
                    borderRadius: "5px",
                    color: "#fff",
                    padding: "6px 18px",
                    "&:hover": { background: "#545454" }
                  }}
                >
                  Add More
                </Button>
              </Typography>
            </Box>
          </Box>
        </Box>
        <Typography component="div" mt={2} textAlign={"end"}>
          <Button
            endIcon={loading ? <CircularProgress size={15} /> : ""}
            disabled={loading}
            sx={{
              background: "#000",
              border: "none",
              borderRadius: "5px",
              color: "#fff",
              padding: "6px 18px",
              "&:hover": { background: "#545454" }
            }}
            onClick={handleVendorSave}
          >
            Save
          </Button>
          {/* <Button
            sx={{
              marginLeft: "10px",
              background: "#fff",
              border: "1px solid #000",
              borderRadius: "5px",
              color: "#000",
              padding: "6px 18px",
              "&:hover": { background: "#000", color: "#fff" }
            }}
          >
            Cancel
          </Button> */}
        </Typography>
      </Box>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} handleDelete={handleDelete} />
    </>
  );
};

export default Story;
