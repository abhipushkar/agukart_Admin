import React, { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  imageContainer: {
    border: "1px solid #ccc",
    borderRadius: theme.shape.borderRadius,
    overflow: "hidden",
    height: 150,
    width: "100%",
    cursor: "move"
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
  }
}));

const MyImageGrid = ({ images, setImages }) => {
  // console.log("formDataformData", formData);
  const classes = useStyles();
  const moveImage = (dragIndex, hoverIndex) => {
    const draggedImage = images[dragIndex];
    const newImages = [...images];
    newImages.splice(dragIndex, 1);
    newImages.splice(hoverIndex, 0, draggedImage);
    setImages(newImages);
  };

  const ImageTile = ({ index, image }) => {
    const [{ isDragging }, drag] = useDrag({
      type: "image",
      item: { index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      })
    });

    const [{ isOver }, drop] = useDrop({
      accept: "image",
      drop: (item) => {
        moveImage(item.index, index);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver()
      })
    });

    const deleteHandler = (id) => {
      const filterValau = images?.filter((image) => {
        return image._id !== id;
      });
      setImages(filterValau);
    };

    return (
      <Box
        ref={(node) => drag(drop(node))}
        className={classes.imageContainer}
        style={{
          opacity: isDragging ? 0.5 : 1,
          backgroundColor: isOver ? "#f0f0f0" : "transparent",
          position: "relative"
        }}
      >
        <img src={image.src} alt={`Image ${image.id}`} className={classes.image} />
        <CloseIcon onClick={() => deleteHandler(image._id)} className={classes.closeIcon} />
      </Box>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Grid container spacing={1}>
        {images.map((image, index) => (
          <Grid item xs={4} key={image._id}>
            <ImageTile index={index} image={image} />
          </Grid>
        ))}
      </Grid>
    </DndProvider>
  );
};

export default MyImageGrid;
