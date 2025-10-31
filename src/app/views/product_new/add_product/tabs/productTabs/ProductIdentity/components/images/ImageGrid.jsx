// ProductIdentity/components/ImageGrid.jsx
import React from "react";
import { Grid, Box, Typography } from "@mui/material";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ImageTile from "./ImageTile";

const ImageGrid = ({ images, setImages, altText, setAltText, onRemoveImage }) => {
    const moveImage = (dragIndex, hoverIndex) => {
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

    const handleRemoveImage = (imageId) => {
        onRemoveImage(imageId);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <Box sx={{ width: "100%" }}>
                <Grid container spacing={1}>
                    {images.map((image, index) => (
                        <Grid item xs={3} key={image._id || index}>
                            <ImageTile
                                images={images}
                                index={index}
                                setImages={setImages}
                                handleImageClick={() => {}} // Not needed in this context
                                setSelectedImage={() => {}} // Not needed in this context
                                setChooseImg={() => {}} // Not needed in this context
                                moveImage={moveImage}
                                setAltText={setAltText}
                                handleOpen={() => {}} // Not needed in this context
                                isPreview={true}
                                onRemoveImage={handleRemoveImage}
                            />
                        </Grid>
                    ))}
                    {images.length === 0 && (
                        <Grid item xs={12}>
                            <Typography
                                variant="body2"
                                color="textSecondary"
                                textAlign="center"
                                sx={{ py: 2 }}
                            >
                                No images uploaded yet
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Box>
        </DndProvider>
    );
};

export default ImageGrid;
