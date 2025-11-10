// components/ParentProduct/ImageUploadSection.jsx
import React, { useRef } from 'react';
import { Box, Typography } from '@mui/material';
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import {useParentProductStore} from "../../../states/parentProductStore";
import ImageGrid from "./ImageGrid";

const ImageUploadSection = () => {
    const inputFileRef = useRef(null);
    const { images, setImages, inputErrors, formData, setFormData } = useParentProductStore();

    const handleButtonClick = () => {
        inputFileRef.current.click();
    };

    const handleImageChange = (e) => {
        const fileList = Array.from(e.target.files);

        if (fileList.length + images.length > 1) {
            toast.error("Only one image can be uploaded");
            return;
        }

        const imageUrls = fileList.map((file) => ({
            src: URL.createObjectURL(file),
            id: images.length,
            file: file,
            _id: uuidv4()
        }));

        setImages(imageUrls);
    };

    return (
        <>
            <Box sx={{ display: "flex", gap: "20px", marginTop: "20px" }}>
                <Box sx={{
                    fontSize: "14px",
                    fontWeight: "700",
                    wordBreak: "normal",
                    width: "16%",
                    textWrap: "nowrap"
                }}>
                    images <span style={{ color: "red", fontSize: "15px" }}> *</span> :
                </Box>
                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    gap: "5px"
                }}>
                    <div onClick={handleButtonClick}>
                        <ControlPointIcon />
                    </div>
                    <div onClick={handleButtonClick}>Upload Parent Product Image</div>
                    <input
                        multiple
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={inputFileRef}
                        style={{ display: "none" }}
                    />
                </Box>
            </Box>

            <Box sx={{ display: "flex", gap: "20px" }}>
                <Box sx={{
                    fontSize: "14px",
                    fontWeight: "700",
                    wordBreak: "normal",
                    width: "16%",
                    textWrap: "nowrap"
                }}>
                    Upload Images:
                </Box>
                <Box sx={{ width: 400 }}>
                    <ImageGrid
                        images={images}
                        setImages={setImages}
                        setFormData={setFormData}
                    />
                    {inputErrors.images && (
                        <Typography sx={{
                            fontSize: "12px",
                            color: "#FF3D57",
                            marginLeft: "14px",
                            marginRight: "14px",
                            marginTop: "45px"
                        }}>
                            {inputErrors.images}
                        </Typography>
                    )}
                    {images.length > 0
                        ? ""
                        : inputErrors.parentImage && (
                        <Typography sx={{
                            fontSize: "12px",
                            display: "block",
                            color: "#FF3D57",
                            marginLeft: "14px",
                            marginRight: "14px",
                            marginTop: "3px"
                        }}>
                            {inputErrors.parentImage}
                        </Typography>
                    )}
                </Box>
            </Box>
        </>
    );
};

export default ImageUploadSection;
