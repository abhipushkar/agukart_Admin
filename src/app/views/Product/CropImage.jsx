import React from "react";
import Dialog from "@mui/material/Dialog";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CropIcon from "@mui/icons-material/Crop";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { Link } from "react-router-dom";
import { Box, Button, TextField, Typography, IconButton, Avatar } from "@mui/material";
import { useRef } from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { makeStyles } from "@material-ui/core/styles";
import ImageTile from "./ImageTile";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import Modal from "@mui/material/Modal";
import CheckIcon from "@mui/icons-material/Check";
import { useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: "5px",
    maxWidth: "100%"
};

const CropImage = ({
                       handleEditClose,
                       openEdit,
                       imgs,
                       setImgs,
                       setFormData,
                       formData,
                       alts,
                       setAlts,
                       handleOpen,
                       transformData,
                       setTransformData
                   }) => {
    const inputRefs = useRef([]);
    const [images, setImages] = useState(imgs || []);
    console.log({ images, imgs });
    const [selectedImage, setSelectedImage] = useState(images.length > 0 ? images[0] : null);
    const [thumbnailOpen, setThumbnailOpen] = useState(false);
    const [deletedImg, setDeletedImg] = useState([]);
    const [chooseImg, setChooseImg] = useState(null);
    const [open, setOpen] = useState(false);
    const [cropper, setCropper] = useState(null);
    const [indexing, setIndexing] = useState(images.length > 0 ? 0 : null);
    const [altText, setAltText] = useState(alts || []);
    const [open1, setOpen1] = React.useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

    const handleOpen1 = () => setOpen1(true);
    const handleClose = () => setOpen1(false);
    console.log({ images });
    console.log({ selectedImage });
    console.log({ deletedImg });
    console.log({ alts });
    console.log({ altText });


    const VIEW_W = 500;
    const VIEW_H = 500;
    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
    const clampPan = ({ scale = 1, x = 0, y = 0 }) => {
        const maxX = ((VIEW_W * scale) - VIEW_W) / 2;
        const maxY = ((VIEW_H * scale) - VIEW_H) / 2;
        return {
            scale,
            x: clamp(x, -maxX, maxX),
            y: clamp(y, -maxY, maxY),
        };
    };

    const handleTranslateChange = (axis, value) => {
        setTransformData(prev => {
            const next = { scale: 1, x: 0, y: 0, ...(prev || {}) };
            next[axis] = value;
            return clampPan(next);
        });
    };

    // Handle mouse/touch events for dragging
    const handleDragStart = (clientX, clientY) => {
        setIsDragging(true);
        setDragStart({
            x: clientX - (transformData?.x || 0),
            y: clientY - (transformData?.y || 0)
        });
    };

    const handleDragMove = (clientX, clientY) => {
        if (!isDragging) return;

        const newX = clientX - dragStart.x;
        const newY = clientY - dragStart.y;

        setTransformData(prev => {
            if ((prev?.scale || 1) > 1) {
                // when zoomed → free pan
                return { ...prev, x: newX, y: newY };
            } else {
                // no zoom → restrict based on orientation
                if (imgDimensions.width > imgDimensions.height) {
                    // wide image → horizontal pan only
                    return { ...prev, x: newX, y: 0, scale: 1 };
                } else {
                    // tall image → vertical pan only
                    return { ...prev, y: newY, x: 0, scale: 1 };
                }
            }
        });
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    // Mouse event handlers
    const handleMouseDown = (e) => {
        e.preventDefault();
        handleDragStart(e.clientX, e.clientY);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        handleDragMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
        handleDragEnd();
    };

    // Touch event handlers
    const handleTouchStart = (e) => {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        handleDragStart(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        const touch = e.touches[0];
        handleDragMove(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
        handleDragEnd();
    };

    const handleDoneThumbnail = () => {
        setThumbnailOpen(false);
    };

    useEffect(() => {
        setImages(imgs || []);
        setAltText(alts || []);
    }, [formData.images]);

    React.useEffect(() => {
        if (images.length > 0 && !images[0].isPrimary) {
            setImages((prevImages) =>
                prevImages.map((img, idx) => ({
                    ...img,
                    isPrimary: idx === 0,
                    sortOrder: idx + 1 // Adding sortOrder with a value of idx + 1
                }))
            );
        }
    }, [images, setImages]);

    useEffect(() => {
        setSelectedImage(images.length > 0 ? images[0] : null);
        setIndexing(0);
    }, [images]);

    const handleImageLoad = (e) => {
        const { naturalWidth, naturalHeight } = e.target;
        setImgDimensions({ width: naturalWidth, height: naturalHeight });
    };

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
        const imageUrls = fileList.map((file, i) => {
            return { src: URL.createObjectURL(file), id: images.length, file: file, _id: uuidv4() };
        });

        console.log({ imageUrls });
        let sortArr = imageUrls;
        sortArr[imageUrls.length - 1].file.sortOrder = images.length + 1;

        setSelectedImage(images[0]?.src);
        setImages((prevImages) => [...prevImages, ...sortArr]);
        setAltText((prevAltText) => [
            ...prevAltText,
            ...new Array(fileList.length).fill("") // Add empty strings for each new image
        ]);
    };

    const triggerInput = (index) => {
        if (inputRefs.current[index]) {
            inputRefs.current[index].click();
        }
    };

    const handleImageClick = (image, i) => {
        setSelectedImage(image);
        setIndexing(i);
    };

    const handleDeleteImage = (src) => {
        const newImages = images.filter((img) => img?.src !== src);
        newImages.forEach((img, index) => {
            if (img?.file) {
                let sortData = img?.file;
                sortData.sortOrder = index + 1;
            } else {
                img.sortOrder = index + 1;
            }
        });
        setImages(newImages);
        setDeletedImg([...deletedImg, src]);
        setAltText((prevAltText) => prevAltText.filter((_, idx) => idx !== indexing));
        setChooseImg(null);
    };

    const moveImage = (dragIndex, hoverIndex) => {
        console.log({ dragIndex });
        console.log({ hoverIndex });

        const draggedImage = images[dragIndex];
        const newImages = [...images];

        newImages.splice(dragIndex, 1);

        newImages.splice(hoverIndex, 0, draggedImage);

        newImages.forEach((img, idx) => {
            img.isPrimary = idx === 0;
            if (img?.file) {
                img.file.sortOrder = idx + 1;
            } else {
                img.sortOrder = idx + 1;
            }
        });

        const newAltText = [...altText];
        const draggedAltText = newAltText[dragIndex];

        newAltText.splice(dragIndex, 1);

        newAltText.splice(hoverIndex, 0, draggedAltText);

        setImages(newImages);
        setAltText(newAltText);
    };

    const handleCrop = () => {
        if (cropper) {
            console.log({ cropper });
            const findIdArr = images
                ?.filter((item) => !item?.id && item?.src === cropper?.originalUrl)
                .map((item) => item?.src);
            console.log({ findIdArr });
            if (findIdArr?.length > 0) {
                setDeletedImg([...deletedImg, findIdArr[0]]);
            }
            const croppedDataUrl = cropper?.getCroppedCanvas()?.toDataURL();

            const base64ToFile = (dataUrl, filename) => {
                const arr = dataUrl?.split(",");
                const mime = arr[0]?.match(/:(.*?);/)[1];
                const bstr = atob(arr[1]);
                let n = bstr?.length;
                const u8arr = new Uint8Array(n);

                while (n--) {
                    u8arr[n] = bstr?.charCodeAt(n);
                }

                return new File([u8arr], filename, { type: mime });
            };

            const newCroppedFile = base64ToFile(croppedDataUrl, "cropped-image.jpg");
            console.log({ newCroppedFile });
            let sortArr = newCroppedFile;
            sortArr.sortOrder = indexing + 1;

            setImages((prevImages) =>
                prevImages.map((img, idx) =>
                    idx === indexing ? { ...img, src: croppedDataUrl, file: sortArr } : img
                )
            );

            setSelectedImage(croppedDataUrl);
            setOpen(false);
        }
    };

    const handleZoom = (value) => {
        if (cropper) {
            cropper.zoom(value);
        }
    };

    const handleRotate = (degree) => {
        if (cropper) {
            cropper.rotate(degree);
        }
    };

    const handleApply = () => {
        setImgs(images);
        handleEditClose();
        setFormData((prevFormData) => {
            const updatedDeleteIconData = [
                ...(prevFormData.deleteIconData || []),
                ...[].concat(deletedImg)
            ];
            return {
                ...prevFormData,
                deleteIconData: updatedDeleteIconData
            };
        });
        setDeletedImg([]);
        setAlts(altText);
    };

    const handleDiscard = () => {
        handleClose();
        handleEditClose();
        setImages(imgs);
        setDeletedImg([]);
        setAlts(alts);
        setAltText(alts);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <Dialog
                open={openEdit}
                sx={{
                    "& .MuiPaper-root": {
                        height: "100%",
                        width: "100%",
                        maxWidth: "100%",
                        maxHeight: "100%",
                        margin: "0"
                    }
                }}
            >
                <Button
                    onClick={handleOpen1}
                    sx={{
                        color: "#000",
                        background: "none !important",
                        border: "none",
                        position: "absolute",
                        top: "15px",
                        right: "15px"
                    }}
                >
                    <HighlightOffIcon sx={{ fontSize: "40px" }} />
                </Button>
                <Box>
                    <Box p={5} mt={{ lg: 0, md: 0, xs: 5 }}>
                        <Grid container spacing={3} alignItems={"center"}>
                            <Grid item lg={2} md={2} xs={12}>
                                <Box>
                                    <Grid
                                        container
                                        spacing={3}
                                        alignItems={"center"}
                                        flexWrap={{
                                            lg: "wrap !important",
                                            md: "wrap !important",
                                            xs: "nowrap !important"
                                        }}
                                        sx={{ overflowX: { lg: "visible", md: "visible", xs: "auto" } }}
                                    >
                                        {Array.from({ length: 10 }).map((_, index) => (
                                            <Grid item lg={index === 0 ? 12 : 6} md={12} xs={12} key={index}>
                                                <Button
                                                    sx={{
                                                        overflow: "hidden",
                                                        borderRadius: "12px",
                                                        padding: "0",
                                                        border: "2px solid #c0c0c0",
                                                        background: "#ededed !important",
                                                        width: "100%",
                                                        "&:focus": { border: "2px solid #000" }
                                                    }}
                                                >
                                                    <ImageTile
                                                        images={images}
                                                        index={index}
                                                        setImages={setImages}
                                                        handleImageClick={handleImageClick}
                                                        setSelectedImage={setSelectedImage}
                                                        setChooseImg={setChooseImg}
                                                        moveImage={moveImage}
                                                        setAltText={setAltText}
                                                        handleOpen={handleOpen}
                                                    />
                                                </Button>
                                            </Grid>
                                        ))}

                                        <Grid item lg={12} md={12} xs={12} sx={{ marginTop: "16px" }}>
                                            <Box>
                                                <Button
                                                    onClick={() => {
                                                        triggerInput(0);
                                                        handleImageClick(null, null);
                                                    }}
                                                    sx={{
                                                        whiteSpace: "nowrap",
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        borderRadius: "30px",
                                                        padding: "6px 16px",
                                                        border: "none",
                                                        background: "#ededed",
                                                        fontSize: "16px",
                                                        color: "#000",
                                                        "&:hover": { background: "#ededed", boxShadow: "0 0 3px #000" }
                                                    }}
                                                >
                                                    <AddIcon sx={{ marginRight: "4px" }} /> Add photo
                                                </Button>
                                                <input
                                                    type="file"
                                                    onChange={handleImageChange}
                                                    accept="image/*"
                                                    ref={(el) => (inputRefs.current[0] = el)}
                                                    style={{ display: "none" }}
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Grid>
                            <Grid item lg={8} md={8} xs={12}>
                                {open ? (
                                    <>
                                        <Cropper
                                            src={selectedImage?.src ? selectedImage?.src : selectedImage}
                                            sx={{
                                                height: "100vh",
                                                width: "100%",
                                                ".cropper-container": { height: "100vh" }
                                            }}
                                            initialAspectRatio={1}
                                            guides={false}
                                            cropBoxResizable={true}
                                            dragMode="move"
                                            zoomable={true}
                                            scalable={true}
                                            onInitialized={(instance) => setCropper(instance)}
                                        />
                                    </>
                                ) : (
                                    <Box
                                        sx={{
                                            overflow: "hidden",
                                            border: "2px solid #c0c0c0",
                                            borderRadius: "12px",
                                            minHeight: { lg: "500px", md: "500px", xs: "100%" },
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            paddingBlock: "12px"
                                        }}
                                    >
                                        {selectedImage ? (
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
                                                        height: "500px",
                                                        overflow: "hidden",
                                                        borderRadius: "8px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        border: "2px solid #c0c0c0",
                                                        background: "#f4f4f4",
                                                        width: {
                                                            xs: "100%",
                                                            md: "500px",
                                                        },
                                                        maxWidth: {
                                                            xs: "500px",
                                                            md: "none",
                                                        },
                                                        cursor: isDragging ? "grabbing" : "grab",
                                                        userSelect: "none"
                                                    }}
                                                    onMouseDown={handleMouseDown}
                                                    onMouseMove={handleMouseMove}
                                                    onMouseUp={handleMouseUp}
                                                    onMouseLeave={handleMouseUp}
                                                    onTouchStart={handleTouchStart}
                                                    onTouchMove={handleTouchMove}
                                                    onTouchEnd={handleTouchEnd}
                                                >
                                                    <img
                                                        src={selectedImage?.src ? selectedImage?.src : selectedImage}
                                                        alt="Zoomable"
                                                        onLoad={handleImageLoad}
                                                        style={{
                                                            maxWidth: imgDimensions.width >= imgDimensions.height ? "100%" : "auto",
                                                            maxHeight: imgDimensions.height > imgDimensions.width ? "100%" : "auto",
                                                            objectFit: "contain",
                                                            transformOrigin: "center center",
                                                            transform: `translate3d(${transformData?.x || 0}px, ${transformData?.y || 0}px, 0) scale(${transformData?.scale || 1})`,
                                                            transition: isDragging ? "none" : "transform 0.15s ease-out",
                                                            willChange: "transform",
                                                            backfaceVisibility: "hidden",
                                                            pointerEvents: "none" // Prevent image from interfering with drag events
                                                        }}
                                                    />
                                                </Box>

                                                {thumbnailOpen && (
                                                    <>
                                                        {/* Zoom slider only - pan sliders removed */}
                                                        <label
                                                            style={{
                                                                width: "80%",
                                                                textAlign: "left",
                                                                fontSize: "14px",
                                                                fontWeight: "500"
                                                            }}
                                                        >
                                                            Zoom
                                                        </label>
                                                        <input
                                                            type="range"
                                                            name="zoom"
                                                            min="1"
                                                            max="3"
                                                            step="0.1"
                                                            value={transformData?.scale || 1}
                                                            onChange={(e) => handleTranslateChange("scale", Number(e.target.value))}
                                                            style={{ width: "80%" }}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <Typography component="div" sx={{ textAlign: "center" }}>
                                                <Typography component="div">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="#989898"
                                                        height="40px"
                                                        width="40px"
                                                        viewBox="0 0 24 24"
                                                        aria-hidden="true"
                                                        focusable="false"
                                                    >
                                                        <path d="M22 2v18H11.398a5.5 5.5 0 0 0 .58-2H20V4H6v8.023a5.5 5.5 0 0 0-2 .579V2z"></path>
                                                        <path d="M10.508 13.738 12 11.5l1 1L15 9l3.5 7h-6.708a5.5 5.5 0 0 0-1.284-2.262M10 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4"></path>
                                                        <path
                                                            fill-rule="evenodd"
                                                            clip-rule="evenodd"
                                                            d="M2 17.5C2 19.981 4.019 22 6.5 22s4.5-2.019 4.5-4.5S8.981 13 6.5 13A4.505 4.505 0 0 0 2 17.5m5-.5h1.5a.5.5 0 0 1 0 1H7v1.5a.5.5 0 0 1-1 0V18H4.5a.5.5 0 0 1 0-1H6v-1.5a.5.5 0 0 1 1 0z"
                                                        ></path>
                                                    </svg>
                                                </Typography>
                                                <Button
                                                    onClick={() => {
                                                        triggerInput(0);
                                                        handleImageClick(null);
                                                    }}
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        borderRadius: "6px",
                                                        padding: "6px 16px",
                                                        border: "none",
                                                        background: "#ededed",
                                                        fontSize: "16px",
                                                        color: "#000",
                                                        "&:hover": { background: "#ededed", boxShadow: "0 0 3px #000" }
                                                    }}
                                                >
                                                    <AddIcon sx={{ marginRight: "4px" }} /> Add photo
                                                </Button>
                                                <input
                                                    type="file"
                                                    onChange={handleImageChange}
                                                    accept="image/*"
                                                    ref={(el) => (inputRefs.current[0] = el)}
                                                    style={{ display: "none" }}
                                                />
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </Grid>
                            {selectedImage && (
                                <Grid item lg={2} md={2} xs={12}>
                                    <Box>
                                        {open && (
                                            <Box mb={2}>
                                                <Grid container spacing={3} alignItems={"center"}>
                                                    <Grid item lg={6} md={6} xs={12} sx={{ textAlign: "center" }}>
                                                        <IconButton
                                                            onClick={() => handleZoom(0.1)}
                                                            sx={{
                                                                background: "#ededed",
                                                                color: "#000",
                                                                height: "50px",
                                                                width: "50px",
                                                                transition: "all 500ms",
                                                                "&:hover": { background: "#000", color: "#fff" }
                                                            }}
                                                        >
                                                            <ZoomInIcon />
                                                        </IconButton>
                                                    </Grid>
                                                    <Grid item lg={6} md={6} xs={12} sx={{ textAlign: "center" }}>
                                                        <IconButton
                                                            onClick={() => handleZoom(-0.1)}
                                                            sx={{
                                                                background: "#ededed",
                                                                color: "#000",
                                                                height: "50px",
                                                                width: "50px",
                                                                transition: "all 500ms",
                                                                "&:hover": { background: "#000", color: "#fff" }
                                                            }}
                                                        >
                                                            <ZoomOutIcon />
                                                        </IconButton>
                                                    </Grid>
                                                    <Grid item lg={6} md={6} xs={12} sx={{ textAlign: "center" }}>
                                                        <IconButton
                                                            onClick={() => handleRotate(-90)}
                                                            sx={{
                                                                background: "#ededed",
                                                                color: "#000",
                                                                height: "50px",
                                                                width: "50px",
                                                                transition: "all 500ms",
                                                                "&:hover": { background: "#000", color: "#fff" }
                                                            }}
                                                        >
                                                            <RotateLeftIcon />
                                                        </IconButton>
                                                    </Grid>
                                                    <Grid item lg={6} md={6} xs={12} sx={{ textAlign: "center" }}>
                                                        <IconButton
                                                            onClick={() => handleRotate(90)}
                                                            sx={{
                                                                background: "#ededed",
                                                                color: "#000",
                                                                height: "50px",
                                                                width: "50px",
                                                                transition: "all 500ms",
                                                                "&:hover": { background: "#000", color: "#fff" }
                                                            }}
                                                        >
                                                            <RotateRightIcon />
                                                        </IconButton>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        )}
                                        {!open && (
                                            <>
                                                {thumbnailOpen ? (
                                                    <Typography component="div">
                                                        <Button
                                                            sx={{
                                                                width: "100%",
                                                                display: "flex",
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                                borderRadius: "30px",
                                                                padding: "8px 16px",
                                                                border: "none",
                                                                background: "#ededed",
                                                                fontSize: "16px",
                                                                color: "#000",
                                                                "&:hover": { background: "#ededed", boxShadow: "0 0 3px #000" }
                                                            }}
                                                            onClick={handleDoneThumbnail}
                                                        >
                                                            <CheckIcon sx={{ marginRight: "4px" }} /> Done
                                                        </Button>
                                                    </Typography>
                                                ) : (
                                                    <Typography component="div">
                                                        <Button
                                                            sx={{
                                                                width: "100%",
                                                                display: "flex",
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                                borderRadius: "30px",
                                                                padding: "8px 16px",
                                                                border: "none",
                                                                background: "#ededed",
                                                                fontSize: "16px",
                                                                color: "#000",
                                                                "&:hover": { background: "#ededed", boxShadow: "0 0 3px #000" }
                                                            }}
                                                            onClick={() => setThumbnailOpen(true)}
                                                        >
                                                            <OpenInFullIcon sx={{ marginRight: "4px" }} /> Adjust thumbnail
                                                        </Button>
                                                    </Typography>
                                                )}
                                            </>
                                        )}
                                        <Typography component="div" mt={2}>
                                            {!open && !thumbnailOpen ? (
                                                <Button
                                                    sx={{
                                                        width: "100%",
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        borderRadius: "30px",
                                                        padding: "8px 16px",
                                                        border: "none",
                                                        background: "#ededed",
                                                        fontSize: "16px",
                                                        color: "#000",
                                                        "&:hover": { background: "#ededed", boxShadow: "0 0 3px #000" }
                                                    }}
                                                    onClick={() => setOpen(true)}
                                                >
                                                    <CropIcon sx={{ marginRight: "4px" }} /> Crop
                                                </Button>
                                            ) : (
                                                <>
                                                    {!thumbnailOpen && (
                                                        <Button
                                                            sx={{
                                                                width: "100%",
                                                                display: "flex",
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                                borderRadius: "30px",
                                                                padding: "8px 16px",
                                                                border: "none",
                                                                background: "#ededed",
                                                                fontSize: "16px",
                                                                color: "#000",
                                                                "&:hover": { background: "#ededed", boxShadow: "0 0 3px #000" }
                                                            }}
                                                            onClick={handleCrop}
                                                        >
                                                            <CheckIcon sx={{ marginRight: "4px" }} /> Done
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </Typography>
                                        {!open && !thumbnailOpen && (
                                            <Typography component="div" mt={2}>
                                                <Button
                                                    onClick={() => {
                                                        handleDeleteImage(
                                                            selectedImage?.src ? selectedImage?.src : selectedImage
                                                        );
                                                        handleImageClick(chooseImg === "select" ? images[0] : images[1], 0);
                                                    }}
                                                    sx={{
                                                        width: "100%",
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        borderRadius: "30px",
                                                        padding: "8px 16px",
                                                        border: "none",
                                                        background: "#ededed",
                                                        fontSize: "16px",
                                                        color: "red",
                                                        "&:hover": { background: "#ededed", boxShadow: "0 0 3px #000" }
                                                    }}
                                                >
                                                    <DeleteOutlineIcon sx={{ marginRight: "4px" }} /> Delete
                                                </Button>
                                            </Typography>
                                        )}

                                        {!open && !thumbnailOpen && (
                                            <Box mt={2}>
                                                <Typography component="div">
                                                    <Typography variant="h6">Alt text</Typography>
                                                    <Typography sx={{ color: "#000" }}>
                                                        Alt text describes images or media for people with visual impairments,
                                                        and can positively impact your listings' SEO on search engines.{" "}
                                                        <Link style={{ textDecoration: "underline", color: "#000" }}>
                                                            Learn more.
                                                        </Link>
                                                    </Typography>
                                                </Typography>
                                            </Box>
                                        )}
                                        {!open && !thumbnailOpen && (
                                            <Typography component="div" mt={1}>
                                                <TextField
                                                    placeholder="Describe your listing's image in detail"
                                                    multiline
                                                    rows={4}
                                                    variant="outlined"
                                                    fullWidth
                                                    value={altText[indexing]}
                                                    onChange={(e) => {
                                                        const inputText = e.target.value;

                                                        if (inputText.length <= 124) {
                                                            const newAltText = [...altText];
                                                            newAltText[indexing] = inputText;
                                                            setAltText(newAltText);
                                                        }
                                                    }}
                                                />
                                                <Typography textAlign={"end"}>{altText[indexing]?.length}/124</Typography>
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                    <Box sx={{ borderTop: "1px solid #000" }} pb={2}>
                        <Typography
                            component="div"
                            sx={{
                                display: "flex",
                                justifyContent: "end",
                                alignItems: "center",
                                padding: "18px 12px 3px 12px"
                            }}
                        >
                            <Button
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderRadius: "30px",
                                    padding: "6px 18px",
                                    border: "2px solid #000",
                                    background: "#fff",
                                    fontSize: "16px",
                                    color: "#000",
                                    "&:hover": { background: "#fff", boxShadow: "0 0 3px #000" }
                                }}
                                onClick={handleOpen1}
                            >
                                Cancel
                            </Button>
                            <Button
                                sx={{
                                    marginLeft: "10px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderRadius: "30px",
                                    padding: "6px 18px",
                                    border: "none",
                                    background: "#000",
                                    fontSize: "16px",
                                    color: "#fff !important",
                                    "&:hover": { background: "#000", boxShadow: "0 0 3px #000" }
                                }}
                                onClick={handleApply}
                                disabled={open}
                            >
                                Apply
                            </Button>
                        </Typography>
                    </Box>
                </Box>
            </Dialog>
            <Modal
                open={open1}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h4" component="h2">
                        Discard changes?
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2, fontSize: "15px" }}>
                        You will lose your changes if you continue without saving
                    </Typography>
                    <Box
                        mt={2}
                        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                        <Button
                            onClick={() => handleClose()}
                            sx={{
                                borderRadius: "30px",
                                background: "#dfdfdf !important",
                                color: "#000",
                                padding: "4px 16px",
                                "&:hover": { boxShadow: "0 0 3px #000" }
                            }}
                        >
                            Keep Editing
                        </Button>
                        <Button
                            onClick={handleDiscard}
                            sx={{
                                borderRadius: "30px",
                                background: "#000 !important",
                                color: "#fff",
                                padding: "4px 16px",
                                "&:hover": { boxShadow: "0 0 3px #000" }
                            }}
                        >
                            Discard
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </DndProvider>
    );
};

export default CropImage;
