import * as React from "react";
import { useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import QuilDes from "./descriptoinTextEditor/QuilDes";
import QuillBulletPoints from "./bulletPointsEditor/QuillBulletPoints";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import {
  Box,
  Button,
  Checkbox,
  InputLabel,
  CircularProgress,
  MenuItem,
  Select,
  TextField,
  Typography
} from "@mui/material";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import { useState } from "react";
import MyImageGrid from "./Demo";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";
import "./index.css"; // import your custom styles
import { set } from "lodash";
import VideoGrid from "./VideoGrid";
import CropImage from "./CropImage";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  ...theme.applyStyles("dark", {
    backgroundColor: "#1A2027"
  })
}));

const DescriptionTabs = ({
  formData,
  setFormData,
  setTabsValue,
  inputErrors,
  setInputErrors,
  EditProducthandler,
  queryId,
  loading,
  draftLoading,
  altText,
  setAltText,
  handleOpen,
  transformData,
  setTransformData,
  handleDraftProduct
}) => {
  const [des, setDes] = useState(formData.productDescription);
  const [bullet, setBullet] = useState(formData.bulletPoints);

  const [images, setImages] = useState(formData.images);
  const [videos, setVideos] = useState(formData.videos);
  const handleChange = (e, name) => {
    setFormData((prv) => ({ ...prv, name: e.target.value }));
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const reorderedImages = Array.from(images);
    const [removed] = reorderedImages.splice(result.source.index, 1);
    reorderedImages.splice(result.destination.index, 0, removed);

    setImages(reorderedImages);
  };

  const inputFileRef = React.useRef(null);
  const inputFileRef2 = React.useRef(null);

  const handleImageChange = (e) => {
    if (images.length === 10) {
      handleOpen("error", "Selected Images Must be 10");
      return;
    }
  
    const fileList = Array.from(e.target.files);
    if (fileList.length + images.length > 10) {
      handleOpen("error", "Selected Images Must be 10");
      return;
    }
  
    const imageUrls = fileList?.map((file, i) => {
      return {
        src: URL.createObjectURL(file),
        id: images.length + i,
        file: file,
        _id: uuidv4(),
      };
    });
  
    imageUrls?.forEach((image, i) => {
      image.file.sortOrder = images.length + i + 1;
    });
  
    console.log({ imageUrls });
  
    setImages((prevImages) => [...prevImages, ...imageUrls]);
    setAltText((prevAltText) => [
      ...prevAltText,
      ...new Array(fileList.length).fill(""),
    ]);
  };
  
  const handleVideoChange = (e) => {
    console.log(e.target.files);
    if (formData.videos.length == 2) {
      handleOpen("error", "Selected Videos must Be 2");
      return;
    }
    const fileList = Array.from(e.target.files);
    if (fileList.length + videos.length > 2) {
      handleOpen("error", "Selected Videos must Be 2");
      return;
    }

    const videoList = fileList.map((file, i) => {
      return { src: URL.createObjectURL(file), id: images.length, file: file, _id: uuidv4() };
    });

    setVideos((prv) => [...prv, ...videoList]);
  };

  const handleButtonClick = () => {
    inputFileRef.current.click();
  };
  const handleButtonClick2 = () => {
    inputFileRef2.current.click();
  };

  React.useEffect(() => {
    setFormData((pre) => ({ ...pre, bulletPoints: bullet, productDescription: des }));
  }, [des, bullet]);

  React.useEffect(() => {
    if (images.length > 0) {
      setInputErrors((pre) => ({ ...pre, images: "" }));
    }
    setFormData((pre) => ({ ...pre, images: images }));
  }, [images]);

  React.useEffect(() => {
    setFormData((pre) => ({ ...pre, videos: videos }));
  }, [videos]);
  console.log({ formData });

  const [openEdit, setOpenEdit] = useState(false);

  const handleEditPopup = () => {
    setOpenEdit(true);
  };

  const handleEditClose = () => {
    setOpenEdit(false);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}
      >
        <Box
          sx={{
            display: "flex",
            marginBottom: "40px",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: "700",
              wordBreak: "normal",
              width: "20%",
              textWrap: "nowrap"
            }}
          >
            Product Description <span style={{ color: "red", fontSize: "15px" }}> *</span> :
          </Box>
          <Box width={"100%"}>
            <Box
              sx={{
                height: "auto", // Set your desired height
                width: "100%"
              }}
            >
              {/* <TextField
              multiline
              rows={6}
              sx={{
                width: "100%"
              }}
            /> */}
              {/* 
              <ReactQuill
                theme="snow"
                onBlur={() => {
                  if (!des || des === "<p><br></p>") {
                    setInputErrors((prv) => ({ ...prv, des: "Description is Required" }));
                  }
                }}
                value={des === "<p><br></p>" ? "" : des}
                name="productDescription"
                onChange={(e) => {
                  setDes(e);
                  setInputErrors((prv) => ({ ...prv, des: "" }));
                }}
                style={{ height: "100%" }}
              /> */}

              <QuilDes
                formData={formData}
                setInputErrors={setInputErrors}
                setFormData={setFormData}
              />

              {/* <MyEditor /> */}
            </Box>
            {inputErrors.des && (
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "#FF3D57"
                }}
              >
                {inputErrors.des}
              </Typography>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: "20px",
            marginBottom: "40px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: "700",
              wordBreak: "normal",
              width: "20%",
              textWrap: "nowrap"
            }}
          >
            Bullet Points <span style={{ color: "red", fontSize: "15px" }}></span> :
          </Box>
          <Box sx={{ width: "100%" }}>
            <Box width={"100%"}>
              <Box
                className="custom-quill-editor"
                sx={{
                  height: "auto", // Set your desired height
                  width: "100%"
                }}
              >
                <QuillBulletPoints formData={formData} setFormData={setFormData} />

                {/* <ReactQuill
                  theme="snow"
                  name="bulletPoints"
                  value={bullet === "<p><br></p>" ? "" : bullet}
                  onChange={(e) => {
                    setBullet(e);
                  }}
                  style={{ height: "100%" }}
                />
                {inputErrors.bullet && (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#FF3D57",
                      marginLeft: "14px",
                      marginRight: "14px",
                      marginTop: "45px"
                    }}
                  >
                    {inputErrors.bullet}
                  </Typography>
                )} */}
              </Box>
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: "20px",
            marginTop: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: "700",
              wordBreak: "normal",
              width: "16%",
              textWrap: "nowrap"
            }}
          >
            images <span style={{ color: "red", fontSize: "15px" }}> *</span> :
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              component="div"
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
              <div onClick={handleButtonClick}>Upload Multiple Files</div>
              <input
                multiple
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={inputFileRef}
                style={{ display: "none" }}
              />
            </Typography>
            <Typography ml={2}>
              <Button
                onClick={handleEditPopup}
                sx={{
                  background: "#cacaca",
                  borderRadius: "4px",
                  padding: "4px 15px",
                  color: "#000"
                }}
              >
                Edit
              </Button>
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: "700",
              wordBreak: "normal",
              width: "16%",
              textWrap: "nowrap"
            }}
          >
            Upload Images:
          </Box>
          <Box sx={{ width: 400 }}>
            <MyImageGrid images={images} setImages={setImages} setFormData={setFormData} altText={altText} setAltText={setAltText}/>
            {inputErrors.images && (
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "#FF3D57",
                  marginLeft: "14px",
                  marginRight: "14px",
                  marginTop: "45px"
                }}
              >
                {inputErrors.images}
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
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: "700",
              wordBreak: "normal",
              width: "16%",
              textWrap: "nowrap"
            }}
          >
            Vidoes <span style={{ color: "red", fontSize: "15px" }}></span> :
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              gap: "5px"
            }}
          >
            <div onClick={handleButtonClick2}>
              <ControlPointIcon />
            </div>
            <div onClick={handleButtonClick2}>Upload Multiple Files</div>
            <input
              multiple
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              ref={inputFileRef2}
              style={{ display: "none" }}
            />
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: "700",
              wordBreak: "normal",
              width: "16%",
              textWrap: "nowrap"
            }}
          >
            Upload Vidoes:
          </Box>
          <Box sx={{ width: 400 }}>
            <VideoGrid videos={formData.videos} setVideos={setVideos} setFormData={setFormData} />
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end"
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: "5px"
            }}
          >
            <Button
              endIcon={draftLoading ? <CircularProgress size={15} /> : ""}
              disabled={draftLoading}
              onClick={handleDraftProduct}
              variant="contained"
            >
              Save As Draft
            </Button>
            <Button
              onClick={() => {
                // if (!formData.productDescription || formData.productDescription === "<p><br></p>") {
                //   setInputErrors((prv) => ({ ...prv, des: "Description is Required" }));
                // }
                // if (images.length === 0) {
                //   setInputErrors((prev) => ({ ...prev, images: "Please Selecte Images" }));
                // }
                // if (formData.productDescription && images.length > 0) {
                // }
                setTabsValue((prv) => prv + 1);
              }}
              variant="contained"
            >
              Next
            </Button>

            {queryId ? (
              <Button
                endIcon={loading ? <CircularProgress size={15} /> : ""}
                disabled={loading}
                onClick={EditProducthandler}
                variant="contained"
              >
                Submit
              </Button>
            ) : (
              ""
            )}
          </Box>
        </Box>
      </Box>

      {/* editimage popup */}
      <CropImage
        openEdit={openEdit}
        handleEditClose={handleEditClose}
        imgs={images}
        setImgs={setImages}
        setFormData={setFormData}
        formData={formData}
        alts={altText}
        setAlts={setAltText}
        handleOpen={handleOpen}
        transformData={transformData}
        setTransformData={setTransformData}
      />
    </>
  );
};

export default DescriptionTabs;
