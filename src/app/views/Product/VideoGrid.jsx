import React, { useState } from "react";
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
    width: "100%"
  },
  video: {
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

const VideoGrid = ({ videos, setVideos, setFormData }) => {
  const [deletedVideo, setDeletedVideo] = useState([]);
  const classes = useStyles();
  const { state } = useLocation();

  const ImageTile = ({ index, video }) => {
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
        // moveImage(item.index, index);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver()
      })
    });

    const deletVideoHandler = (id, video) => {
      if (state) {
        if (video.file) {
          const filter = videos.filter((item) => {
            return item.src !== video.src;
          });
          setVideos(filter);
          return;
        }
        setFormData((prevFormData) => {
          const updatedDeleteIconData = [...prevFormData.deletedVideos, video.src];

          return {
            ...prevFormData,
            deletedVideos: updatedDeleteIconData
          };
        });

        const filter = videos.filter((item) => {
          return item.src !== video.src;
        });
        setVideos(filter);
      } else {
        const filter = videos.filter((item) => {
          return item._id !== id;
        });
        setVideos(filter);
      }
    };

    return (
      <Box
        // ref={(node) => drag(drop(node))}
        className={classes.imageContainer}
        style={{
          opacity: isDragging ? 0.5 : 1,
          backgroundColor: isOver ? "#f0f0f0" : "transparent",
          position: "relative"
        }}
      >
        <video className={classes.video} controls>
          <source src={video.src} type="video/mp4" />
        </video>
        <CloseIcon
          onClick={() => deletVideoHandler(video._id, video)}
          className={classes.closeIcon}
        />
      </Box>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Grid container spacing={1}>
        {videos.map((video, index) => (
          <Grid item xs={4} key={video._id}>
            <ImageTile index={index} video={video} />
          </Grid>
        ))}
      </Grid>
    </DndProvider>
  );
};

export default VideoGrid;
