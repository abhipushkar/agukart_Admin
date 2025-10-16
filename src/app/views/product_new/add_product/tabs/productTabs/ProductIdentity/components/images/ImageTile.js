import React from "react";
import { useRef } from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { useDrag, useDrop } from "react-dnd";
import { Avatar, Typography } from "@mui/material";
import { makeStyles } from "@material-ui/core/styles";

const ImageTile = ({
                       images,
                       index,
                       handleImageClick,
                       setSelectedImage,
                       setImages,
                       setChooseImg,
                       moveImage,
                       setAltText,
                       handleOpen
                   }) => {
    const useStyles = makeStyles((theme) => ({
        imageContainer: {
            borderRadius: theme.shape.borderRadius,
            overflow: "hidden",
            height: `${index === 0 ? "150px" : "100px"}`,
            width: "100%",
            cursor: "move",
            position: "relative"
        }
    }));
    const classes = useStyles();
    const inputRefs1 = useRef([]);
    const triggerInput1 = (index) => {
        if (inputRefs1.current[index]) {
            inputRefs1.current[index].click();
        }
    };

    const handleImageChange1 = (e) => {
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
        let sortArr = imageUrls
        sortArr[imageUrls.length - 1].file.sortOrder = images.length + 1;

        setSelectedImage(images[0]?.src);
        setImages((prevImages) => [...prevImages, ...sortArr]);
        setAltText((prevAltText) => [
            ...prevAltText,
            ...new Array(fileList.length).fill(""), // Add empty strings for each new image
        ]);
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
        <>
            {images[index] ? (
                <Typography
                    ref={(node) => drag(drop(node))}
                    onClick={() => {
                        handleImageClick(images[index], index);
                        setChooseImg("select");
                    }}
                    component="div"
                    className={classes.imageContainer}
                    sx={{
                        height: { lg: "100px", md: "100px", xs: "100px" },
                        width: { lg: "100%", md: "100%", xs: "100px" },
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        opacity: isDragging ? 0.5 : 1,
                        backgroundColor: isOver ? "#f0f0f0" : "transparent",
                        position: "relative"
                    }}
                >
                    <Avatar
                        alt={`uploaded-${index}`}
                        src={images[index]?.src}
                        sx={{ width: 173.44,height:150,borderRadius: 2 }}
                        variant="square"
                    />
                    {index === 0 && (
                        <Typography
                            component="span"
                            sx={{
                                background: "#3b67d9",
                                color: "#fff",
                                borderRadius: "20px",
                                padding: "2px 7px",
                                position: "absolute",
                                top: "5px",
                                right: "5px",
                                fontSize: "11px"
                            }}
                        >
                            Primary
                        </Typography>
                    )}
                </Typography>
            ) : (
                <Typography
                    component="div"
                    sx={{
                        height: { lg: "100px", md: "100px", xs: "100px" },
                        width: { lg: "100%", md: "100%", xs: "100px" },
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                    onClick={() => {
                        triggerInput1(index);
                        handleImageClick(null);
                    }}
                >
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
                    <input
                        type="file"
                        onChange={handleImageChange1}
                        accept="image/*"
                        ref={(el) => (inputRefs1.current[index] = el)}
                        style={{ display: "none" }}
                    />
                </Typography>
            )}
        </>
    );
};

export default ImageTile;
