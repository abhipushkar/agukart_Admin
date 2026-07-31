import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation, useSearchParams } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import { Modal, Button, IconButton, Slider, Typography } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import Cropper from "react-easy-crop";
import { getCroppedImg } from '../product_new/add_product/tabs/productTabs/Variations/components/imageComponents/cropUtil.js';

const useStyles = makeStyles((theme) => ({
    imageContainer: {
        border: "1px solid #ccc",
        borderRadius: theme.shape.borderRadius,
        overflow: "hidden",
        height: 150,
        width: "100%",
        cursor: "move",
        position: "relative"
    },
    image: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    },
    closeIcon: {
        position: "absolute",
        top: 0,
        right: 0,
        color: "red",
        cursor: "pointer",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderRadius: "50%"
    },
    editIcon: {
        position: "absolute",
        top: 0,
        right: 25,
        color: "blue",
        cursor: "pointer",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderRadius: "50%",
        fontSize: "20px"
    },
    modalBox: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600,
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "8px",
        outline: "none"
    },
    zoomContainer: {
        position: 'relative',
        width: '100%',
        height: '400px',
        overflow: 'hidden',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: '#f5f5f5'
    },
    zoomedImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        transition: 'transform 0.1s ease',
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain'
    },
    controlsContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginTop: '16px',
        padding: '16px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px'
    }
}));

const MyImageGrid = ({ images, setImages, setFormData, formData, altText, setAltText }) => {
    const classes = useStyles();
    const [query] = useSearchParams();
    const copyQueryId = query.get("_id");
    const queryId = query.get("id");

    // Zoom state for the modal - separate from images array
    const MIN_ZOOM = 0.1;
    const MAX_ZOOM = 3;

    const [zoomState, setZoomState] = useState({
        open: false,
        currentImage: null,
        zoom: formData.zoom?.scale ?? 1,
        rotation: formData.zoom?.rotation ?? 0,
        crop: {
            x: formData.zoom?.x ?? 0,
            y: formData.zoom?.y ?? 0,
        },
    });

    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    React.useEffect(() => {
        if (images.length > 0 && !images[0].isPrimary) {
            setImages((prevImages) =>
                prevImages.map((img, idx) => ({
                    ...img,
                    isPrimary: idx === 0,
                    sortOrder: idx + 1
                }))
            );
        }
    }, [images, setImages]);

    const moveImage = (dragIndex, hoverIndex) => {
        const draggedImage = images[dragIndex];
        const newImages = [...images];

        newImages.splice(dragIndex, 1);
        newImages.splice(hoverIndex, 0, draggedImage);

        newImages.forEach((img, idx) => {
            img.isPrimary = idx === 0;
            if (img?.file) {
                let sortData = img?.file
                sortData.sortOrder = idx + 1
            } else {
                img.sortOrder = idx + 1;
            }
        });

        const newAltText = [...altText];
        const draggedAltText = newAltText[dragIndex];

        newAltText.splice(dragIndex, 1);
        newAltText.splice(hoverIndex, 0, draggedAltText);

        setImages(newImages);
        if (setAltText) {
            setAltText(newAltText);
        }
    };

    // Zoom functionality handlers
    const handleOpenZoom = (image) => {
        setZoomState({
            open: true,
            currentImage: image.src,
            zoom: formData.zoom?.scale ?? 1,
            rotation: formData.zoom?.rotation ?? 0,
            crop: {
                x: formData.zoom?.x ?? 0,
                y: formData.zoom?.y ?? 0,
            },
        });
    };

    const handleCropComplete = (_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    };

    const handleCloseZoom = async () => {
        if (!croppedAreaPixels) {
            setZoomState(prev => ({
                ...prev,
                open: false,
            }));
            return;
        }

        const blob = await getCroppedImg(
            zoomState.currentImage,
            croppedAreaPixels,
            zoomState.rotation
        );

        setFormData(prev => ({
            ...prev,
            zoom: {
                scale: zoomState.zoom,
                rotation: zoomState.rotation,
                x: zoomState.crop.x,
                y: zoomState.crop.y,
            },
            editedImage: blob,
        }));

        setZoomState(prev => ({
            ...prev,
            open: false
        }));
    };


    const handleZoomIn = () => {
        setZoomState(prev => ({
            ...prev,
            zoom: Math.min(prev.zoom + 0.1, MAX_ZOOM),
        }));
    };

    const handleZoomOut = () => {
        setZoomState(prev => ({
            ...prev,
            zoom: Math.max(prev.zoom - 0.1, MIN_ZOOM),
        }));
    };

    const handleResetZoom = () => {
        setZoomState(prev => ({
            ...prev,
            zoom: 1,
            rotation: 0,
            crop: {
                x: 0,
                y: 0,
            },
        }));
    };

    const handleSliderChange = (event, newValue) => {
        setZoomState(prev => ({
            ...prev,
            scale: newValue
        }));
    };


    const handleRotateLeft = () => {
        setZoomState(prev => ({
            ...prev,
            rotation: prev.rotation - 90,
        }));
    };

    const handleRotateRight = () => {
        setZoomState(prev => ({
            ...prev,
            rotation: prev.rotation + 90,
        }));
    };

    const handleRotationSlider = (e, value) => {
        setZoomState(prev => ({
            ...prev,
            rotation: value,
        }));
    };

    const ImageTile = ({ index, image }) => {
        const [{ isDragging }, drag] = useDrag({
            type: "image",
            item: { index },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        });

        const [{ isOver }, drop] = useDrop({
            accept: "image",
            drop: (item) => {
                moveImage(item.index, index);
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
            }),
        });

        const deleteImageHandler = (image) => {
            if (copyQueryId || queryId) {
                if (image.src) {
                    const newImages = images.filter((img) => img?.src !== image?.src);
                    newImages.forEach((img, index) => {
                        if (img?.file) {
                            let sortData = img?.file
                            sortData.sortOrder = index + 1
                        } else {
                            img.sortOrder = index + 1;
                        }
                    });
                    setImages(newImages);
                    if (setAltText) {
                        setAltText((prevAltText) => prevAltText.filter((_, idx) => idx !== index));
                    }
                    // Also clear zoom data when image is deleted
                    setFormData(prevFormData => ({
                        ...prevFormData,
                        zoom: { scale: 1, x: 0, y: 0 }
                    }));
                }
                // setFormData((prevFormData) => {
                //     const updatedDeleteIconData = [...?prevFormData?.deleteIconData, image.src];
                //     return {
                //         ...prevFormData,
                //         deleteIconData: updatedDeleteIconData,
                //     };
                // });
                setTimeout(() => {
                    const newImages = images.filter((img) => img?.src !== image?.src);
                    setImages(newImages);
                }, 500);
            } else {
                const newImages = images.filter((img) => img._id !== image._id);
                setImages(newImages);

                // Clear zoom data when image is deleted
                setFormData(prevFormData => ({
                    ...prevFormData,
                    zoom: {}
                }));
            }
        };

        return (
            <>
                <Box
                    ref={(node) => drag(drop(node))}
                    className={classes.imageContainer}
                    style={{
                        opacity: isDragging ? 0.5 : 1,
                        backgroundColor: isOver ? "#f0f0f0" : "transparent",
                        position: "relative",
                    }}
                >
                    {image.isPrimary && (
                        <span
                            style={{
                                position: "absolute",
                                top: 3,
                                left: 3,
                                backgroundColor: "#1976d2",
                                padding: "5px",
                                borderRadius: "20px",
                                fontWeight: "500",
                                color: "#fff",
                            }}
                        >
                            Primary
                        </span>
                    )}
                    <img src={image.src} alt={`Image ${index}`} className={classes.image} />
                    <EditIcon
                        className={classes.editIcon}
                        onClick={() => handleOpenZoom(image)}
                    />
                    <CloseIcon onClick={() => deleteImageHandler(image)} className={classes.closeIcon} />
                </Box>
            </>
        );
    };

    return (
        <>
            <DndProvider backend={HTML5Backend}>
                <Grid container spacing={1}>
                    {images.map((image, index) => (
                        <Grid item xs={4} key={image.id}>
                            <ImageTile index={index} image={image} />
                        </Grid>
                    ))}
                </Grid>
            </DndProvider>

            {/* Zoom Modal */}
            <Modal open={zoomState.open} onClose={handleCloseZoom} sx={{
                display: "flex",
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Box sx={{
                    width: "500px",
                    maxHeight: "90vh",
                    bgcolor: "#ffff",
                    p: 2,
                    m: "auto",
                    borderRadius: "20px",
                }}>
                    <Typography variant="h6" gutterBottom>
                        Edit Parent Product Image
                        {images[0]?.isPrimary && " (Primary)"}
                    </Typography>

                    <Box
                        sx={{
                            position: "relative",
                            height: 400,
                            width: "100%",
                        }}
                    >
                        <Cropper
                            image={zoomState.currentImage}
                            crop={zoomState.crop}
                            zoom={zoomState.zoom}
                            rotation={zoomState.rotation}
                            aspect={1}
                            objectFit="contain"
                            onCropChange={(crop) =>
                                setZoomState(prev => ({
                                    ...prev,
                                    crop,
                                }))
                            }
                            onZoomChange={(zoom) =>
                                setZoomState(prev => ({
                                    ...prev,
                                    zoom,
                                }))
                            }
                            onRotationChange={(rotation) =>
                                setZoomState(prev => ({
                                    ...prev,
                                    rotation,
                                }))
                            }
                            onCropComplete={handleCropComplete}
                        />
                    </Box>

                    <Typography>
                        Zoom: {(zoomState.zoom ?? 1).toFixed(1)}x
                    </Typography>
                    <Box display={'flex'}>

                        <IconButton
                            onClick={handleZoomOut}
                            disabled={zoomState.zoom <= MIN_ZOOM}
                        >
                            <ZoomOutIcon />
                        </IconButton>

                        <Slider
                            value={zoomState.zoom}
                            min={MIN_ZOOM}
                            max={MAX_ZOOM}
                            step={0.1}
                            onChange={(e, value) =>
                                setZoomState(prev => ({
                                    ...prev,
                                    zoom: value,
                                }))
                            }
                        />

                        <IconButton
                            onClick={handleZoomIn}
                            disabled={zoomState.zoom >= MAX_ZOOM}
                        >
                            <ZoomInIcon />
                        </IconButton>


                    </Box>


                    <Box>
                        <Typography>
                            Rotation: {zoomState.rotation ?? 0}°
                        </Typography>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <IconButton onClick={handleRotateLeft}>
                                <RotateLeftIcon />
                            </IconButton>

                            <Slider
                                value={zoomState.rotation}
                                min={0}
                                max={360}
                                step={1}
                                onChange={(e, value) =>
                                    setZoomState(prev => ({
                                        ...prev,
                                        rotation: value,
                                    }))
                                }
                            />

                            <IconButton onClick={handleRotateRight}>
                                <RotateRightIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                        <Button
                            onClick={handleResetZoom}
                            variant="outlined"
                            size="small"
                        >
                            Reset
                        </Button>
                        <Button onClick={handleCloseZoom} variant="contained">
                            Apply Changes
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

export default MyImageGrid;
