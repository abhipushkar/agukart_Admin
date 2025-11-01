// ProductIdentity/components/ImageTile.jsx
import React from "react";
import { useDrag, useDrop } from "react-dnd";
import { Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ImageTile = ({ image, index, moveImage, onRemoveImage }) => {
    const handleRemove = (e) => {
        e.stopPropagation();
        onRemoveImage(index); // Just pass the index
    };

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

    return (
        <Typography
            ref={(node) => drag(drop(node))}
            component="div"
            sx={{
                height: "150px",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                opacity: isDragging ? 0.5 : 1,
                backgroundColor: isOver ? "#f0f0f0" : "transparent",
                position: "relative",
                border: "1px solid gray",
                borderRadius: "4px",
                overflow: "hidden",
                cursor: "move"
            }}
        >
            {/* Remove button */}
            <IconButton
                onClick={handleRemove}
                sx={{
                    position: "absolute",
                    top: "2px",
                    right: "2px",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    padding: "2px",
                    zIndex: 10,
                    '&:hover': {
                        backgroundColor: "rgba(255, 0, 0, 0.8)",
                        color: "white"
                    }
                }}
                size="small"
            >
                <CloseIcon sx={{ fontSize: "14px" }} />
            </IconButton>

            <img
                alt={`uploaded-${index}`}
                src={image?.src}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain"
                }}
            />

            {image.isPrimary && (
                <Typography
                    component="span"
                    sx={{
                        background: "#3b67d9",
                        color: "#fff",
                        borderRadius: "20px",
                        padding: "2px 7px",
                        position: "absolute",
                        top: "5px",
                        left: "5px",
                        fontSize: "11px",
                        zIndex: 5
                    }}
                >
                    Primary
                </Typography>
            )}
        </Typography>
    );
};

export default ImageTile;
