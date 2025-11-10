import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation, useSearchParams } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Modal, Button, IconButton } from "@mui/material";
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
    }
}));

const ImageGrid = ({ images, setImages, setFormData, altText, setAltText }) => {
    const classes = useStyles();
    // const { state } = useLocation();
    const [query, setQuery] = useSearchParams();
    const copyQueryId = query.get("_id");
    const queryId = query.get("id");
    console.log({images})
    console.log({altText})

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
        console.log({newAltText})

        setImages(newImages);
        setAltText(newAltText);
    };

    const ImageTile = ({ index, image }) => {
        const [open, setOpen] = useState(false);
        const [currentImage, setCurrentImage] = useState(null);
        const [cropper, setCropper] = useState(null);

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

        const handleEditClick = (image) => {
            setCurrentImage(image.src);
            setOpen(true);
        };

        // const handleCrop = () => {
        //   if (cropper) {
        //     const croppedDataUrl = cropper.getCroppedCanvas().toDataURL();
        //     setImages((prevImages) =>
        //       prevImages.map((img, idx) =>
        //         idx === index ? { ...img, src: croppedDataUrl } : img
        //       )
        //     );
        //     setOpen(false);
        //   }
        // };

        // const handleZoom = (value) => {
        //   if (cropper) {
        //     cropper.zoom(value);
        //   }
        // };

        // const handleRotate = (degree) => {
        //   if (cropper) {
        //     cropper.rotate(degree);
        //   }
        // };

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
                    // return;
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
                    {/* <EditIcon className={classes.editIcon} onClick={() => handleEditClick(image)} /> */}
                    <CloseIcon onClick={() => deleteImageHandler(image)} className={classes.closeIcon} />
                </Box>

                {/* <Modal open={open} onClose={() => setOpen(false)}>
          <Box className={classes.modalBox} sx={{ p: 2 }}>
            {currentImage ? (
              <>
                <Cropper
                  src={currentImage}
                  style={{ height: 400, width: "100%" }}
                  initialAspectRatio={1}
                  guides={false}
                  cropBoxResizable={true}
                  dragMode="move"
                  zoomable={true}
                  scalable={true}
                  onInitialized={(instance) => setCropper(instance)}
                />
                <Box className={classes.modalActions}>
                  <IconButton onClick={() => handleZoom(0.1)} color="primary">
                    <ZoomInIcon />
                  </IconButton>
                  <IconButton onClick={() => handleZoom(-0.1)} color="primary">
                    <ZoomOutIcon />
                  </IconButton>
                  <IconButton onClick={() => handleRotate(-90)} color="primary">
                    <RotateLeftIcon />
                  </IconButton>
                  <IconButton onClick={() => handleRotate(90)} color="primary">
                    <RotateRightIcon />
                  </IconButton>
                  <Button variant="contained" onClick={handleCrop}>
                    Crop Image
                  </Button>
                </Box>
              </>
            ) : (
              <p>No image selected for editing.</p>
            )}
          </Box>
        </Modal> */}
            </>
        );
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <Grid container spacing={1}>
                {images.map((image, index) => (
                    <Grid item xs={4} key={image.id}>
                        <ImageTile index={index} image={image} />
                    </Grid>
                ))}
            </Grid>
        </DndProvider>
    );
};

export default ImageGrid;


