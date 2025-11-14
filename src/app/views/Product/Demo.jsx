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

const MyImageGrid = ({ images, setImages, setFormData, altText, setAltText }) => {
    const classes = useStyles();
    const [query] = useSearchParams();
    const copyQueryId = query.get("_id");
    const queryId = query.get("id");

    // Zoom state for the modal - separate from images array
    const [zoomState, setZoomState] = useState({
        open: false,
        currentImage: null,
        scale: 1,
        position: { x: 0, y: 0 },
        isDragging: false,
        dragStart: { x: 0, y: 0 }
    });

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
        setAltText(newAltText);
    };

    // Zoom functionality handlers
    const handleOpenZoom = (image) => {
        setZoomState({
            open: true,
            currentImage: image.src,
            scale: image.transformData?.scale || 1,
            position: {
                x: image.transformData?.x || 0,
                y: image.transformData?.y || 0
            },
            isDragging: false,
            dragStart: { x: 0, y: 0 }
        });
    };

    const handleCloseZoom = () => {
        // Save zoom data to formData (not images array)
        setFormData(prevFormData => ({
            ...prevFormData,
            zoom: {
                scale: zoomState.scale,
                x: zoomState.position.x,
                y: zoomState.position.y
            }
        }));

        setZoomState(prev => ({ ...prev, open: false }));
    };

    const handleZoomIn = () => {
        setZoomState(prev => ({
            ...prev,
            scale: Math.min(prev.scale + 0.1, 5)
        }));
    };

    const handleZoomOut = () => {
        setZoomState(prev => ({
            ...prev,
            scale: Math.max(prev.scale - 0.1, 0.1)
        }));
    };

    const handleResetZoom = () => {
        setZoomState(prev => ({
            ...prev,
            scale: 1,
            position: { x: 0, y: 0 }
        }));
    };

    const handleSliderChange = (event, newValue) => {
        setZoomState(prev => ({
            ...prev,
            scale: newValue
        }));
    };

    // Mouse event handlers for panning
    const handleMouseDown = (e) => {
        e.preventDefault();
        setZoomState(prev => ({
            ...prev,
            isDragging: true,
            dragStart: {
                x: e.clientX - prev.position.x,
                y: e.clientY - prev.position.y
            }
        }));
    };

    const handleMouseMove = (e) => {
        if (!zoomState.isDragging) return;

        const newX = e.clientX - zoomState.dragStart.x;
        const newY = e.clientY - zoomState.dragStart.y;

        setZoomState(prev => ({
            ...prev,
            position: { x: newX, y: newY }
        }));
    };

    const handleMouseUp = () => {
        setZoomState(prev => ({ ...prev, isDragging: false }));
    };

    const handleWheel = (e) => {
        e.preventDefault();
        const delta = -e.deltaY / 100;
        const newScale = Math.max(0.1, Math.min(zoomState.scale + delta * 0.1, 5));

        setZoomState(prev => ({
            ...prev,
            scale: newScale
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
                    setAltText((prevAltText) => prevAltText.filter((_, idx) => idx !== index));

                    // Also clear zoom data when image is deleted
                    setFormData(prevFormData => ({
                        ...prevFormData,
                        zoom: null
                    }));
                }
                setFormData((prevFormData) => {
                    const updatedDeleteIconData = [...prevFormData.deleteIconData, image.src];
                    return {
                        ...prevFormData,
                        deleteIconData: updatedDeleteIconData,
                    };
                });
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
                    zoom: null
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
            <Modal open={zoomState.open} onClose={handleCloseZoom}>
                <Box className={classes.modalBox}>
                    <Typography variant="h6" gutterBottom>
                        Edit Parent Product Image
                        {images[0]?.isPrimary && " (Primary)"}
                    </Typography>

                    <Box
                        className={classes.zoomContainer}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onWheel={handleWheel}
                        sx={{
                            cursor: zoomState.isDragging ? 'grabbing' : 'grab'
                        }}
                    >
                        {zoomState.currentImage && (
                            <img
                                src={zoomState.currentImage}
                                alt="Zoomed"
                                className={classes.zoomedImage}
                                style={{
                                    transform: `translate3d(${zoomState.position.x}px, ${zoomState.position.y}px, 0) scale(${zoomState.scale})`,
                                    transformOrigin: 'center center',
                                    cursor: zoomState.isDragging ? 'grabbing' : 'grab'
                                }}
                            />
                        )}
                    </Box>

                    <Box className={classes.controlsContainer}>
                        <Typography variant="body2" sx={{ minWidth: 80 }}>
                            Zoom: {zoomState.scale.toFixed(1)}x
                        </Typography>

                        <IconButton
                            onClick={handleZoomOut}
                            disabled={zoomState.scale <= 0.1}
                        >
                            <ZoomOutIcon />
                        </IconButton>

                        <Slider
                            value={zoomState.scale}
                            min={0.1}
                            max={5}
                            step={0.1}
                            onChange={handleSliderChange}
                            sx={{ flex: 1, mx: 2 }}
                        />

                        <IconButton
                            onClick={handleZoomIn}
                            disabled={zoomState.scale >= 5}
                        >
                            <ZoomInIcon />
                        </IconButton>

                        <Button
                            onClick={handleResetZoom}
                            variant="outlined"
                            size="small"
                        >
                            Reset
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                        <Button onClick={handleCloseZoom} variant="contained">
                            Apply Changes
                        </Button>
                    </Box>

                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                        • Use mouse wheel to zoom in/out
                        <br />
                        • Click and drag to pan the image
                        <br />
                        • Use slider or buttons for precise control
                    </Typography>
                </Box>
            </Modal>
        </>
    );
};

export default MyImageGrid;
