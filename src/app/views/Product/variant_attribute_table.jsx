import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Switch,
    Button,
    Box,
    Tooltip
} from "@mui/material";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { styled } from "@mui/material/styles";

const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
});

// Custom Tooltip component for images
const ImageTooltip = ({ imageUrl, onImageChange, onImageRemove, children, index, imageType, imageIndex = null }) => {
    const [open, setOpen] = useState(false);

    const handleTooltipOpen = () => {
        setOpen(true);
    };

    const handleTooltipClose = () => {
        setOpen(false);
    };

    const handleImageChangeWrapper = (e) => {
        onImageChange(index, imageType, e, imageIndex);
        handleTooltipClose();
    };

    const handleImageRemoveWrapper = () => {
        onImageRemove(index, imageType, imageIndex);
        handleTooltipClose();
    };

    return (
        <Tooltip
            open={open}
            onClose={handleTooltipClose}
            onOpen={handleTooltipOpen}
            title={
                <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img
                        src={imageUrl}
                        alt="Preview"
                        style={{
                            width: '150px',
                            height: '150px',
                            objectFit: 'contain',
                            marginBottom: '10px'
                        }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            size="small"
                            component="label"
                            sx={{ fontSize: '12px' }}
                        >
                            Change
                            <VisuallyHiddenInput
                                type="file"
                                onChange={handleImageChangeWrapper}
                                accept="image/*"
                            />
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={handleImageRemoveWrapper}
                            sx={{ fontSize: '12px' }}
                        >
                            Remove
                        </Button>
                    </Box>
                </Box>
            }
            arrow
            placement="top"
            componentsProps={{
                tooltip: {
                    sx: {
                        bgcolor: 'common.white',
                        color: 'common.black',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: 1
                    }
                }
            }}
        >
            {children}
        </Tooltip>
    );
};

const VariantAttributesTable = ({
                                    inputFields,
                                    setInputFields,
                                    handleImageUpload,
                                    handleImageRemove,
                                    handleChangeInput,
                                    handleChangeSwitch,
                                    handleRemoveFields
                                }) => {
    const handleMainImageUpload = (index, imageIndex, event) => {
        const file = event.target.files[0];
        if (file) {
            const newInputFields = [...inputFields];
            if (!newInputFields[index].main_images) {
                newInputFields[index].main_images = [null, null, null];
            }
            if (!newInputFields[index].mainImageUrls) {
                newInputFields[index].mainImageUrls = ["", "", ""];
            }

            newInputFields[index].main_images[imageIndex] = file;
            newInputFields[index].mainImageUrls[imageIndex] = URL.createObjectURL(file);
            setInputFields(newInputFields);
        }
    };

    const handleMainImageRemove = (index, imageIndex) => {
        const newInputFields = [...inputFields];
        if (newInputFields[index].main_images) {
            newInputFields[index].main_images[imageIndex] = null;
        }
        if (newInputFields[index].mainImageUrls) {
            newInputFields[index].mainImageUrls[imageIndex] = "";
        }
        setInputFields(newInputFields);
    };

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table sx={{ minWidth: 650 }} aria-label="variant attributes table">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell align="center">Preview Image (16x16)</TableCell>
                        <TableCell align="center">Thumbnail Image (16x16)</TableCell>
                        <TableCell align="center">Main Image 1</TableCell>
                        <TableCell align="center">Main Image 2</TableCell>
                        <TableCell align="center">Main Image 3</TableCell>
                        <TableCell align="center">Active</TableCell>
                        <TableCell align="center">Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {inputFields.map((inputField, index) => (
                        <TableRow key={inputField.id}>
                            <TableCell component="th" scope="row">
                                <TextField
                                    id={`attributeValue${inputField.id}`}
                                    name="attributeValue"
                                    placeholder={"Enter Attribute Value"}
                                    type="text"
                                    value={inputField.attributeValue}
                                    onChange={(event) => handleChangeInput(index, event)}
                                    fullWidth
                                    size="small"
                                />
                            </TableCell>

                            {/* Preview Image Column */}
                            <TableCell align="center">
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    {inputField.previewImageUrl ? (
                                        <ImageTooltip
                                            imageUrl={inputField.previewImageUrl}
                                            onImageChange={handleImageUpload}
                                            onImageRemove={handleImageRemove}
                                            index={index}
                                            imageType="previewImage"
                                        >
                                            <Box
                                                sx={{
                                                    width: 69,
                                                    height: 69,
                                                    border: '1px dashed #ccc',
                                                    p: 0.5,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <img
                                                    src={inputField.previewImageUrl}
                                                    alt="Preview"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain'
                                                    }}
                                                />
                                            </Box>
                                        </ImageTooltip>
                                    ) : (
                                        <Button
                                            component="label"
                                            variant="outlined"
                                            size="small"
                                            sx={{ mb: 1, aspectRatio: "1/1", width: "30px" }}
                                        >
                                            <AddPhotoAlternateIcon />
                                            <VisuallyHiddenInput
                                                type="file"
                                                onChange={(e) => handleImageUpload(index, "previewImage", e)}
                                                accept="image/*"
                                            />
                                        </Button>
                                    )}
                                </Box>
                            </TableCell>

                            {/* Thumbnail Image Column */}
                            <TableCell align="center">
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    {inputField.thumbnailImageUrl ? (
                                        <ImageTooltip
                                            imageUrl={inputField.thumbnailImageUrl}
                                            onImageChange={handleImageUpload}
                                            onImageRemove={handleImageRemove}
                                            index={index}
                                            imageType="thumbnailImage"
                                        >
                                            <Box
                                                sx={{
                                                    width: 69,
                                                    height: 69,
                                                    border: '1px dashed #ccc',
                                                    p: 0.5,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <img
                                                    src={inputField.thumbnailImageUrl}
                                                    alt="Thumbnail"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain'
                                                    }}
                                                />
                                            </Box>
                                        </ImageTooltip>
                                    ) : (
                                        <Button
                                            component="label"
                                            variant="outlined"
                                            size="small"
                                            sx={{ mb: 1, aspectRatio: "1/1", width: "30px" }}
                                        >
                                            <AddPhotoAlternateIcon />
                                            <VisuallyHiddenInput
                                                type="file"
                                                onChange={(e) => handleImageUpload(index, "thumbnailImage", e)}
                                                accept="image/*"
                                            />
                                        </Button>
                                    )}
                                </Box>
                            </TableCell>

                            {/* Main Images Columns */}
                            {[0, 1, 2].map((imageIndex) => (
                                <TableCell key={imageIndex} align="center">
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        {inputField.mainImageUrls && inputField.mainImageUrls[imageIndex] ? (
                                            <ImageTooltip
                                                imageUrl={inputField.mainImageUrls[imageIndex]}
                                                onImageChange={handleMainImageUpload}
                                                onImageRemove={handleMainImageRemove}
                                                index={index}
                                                imageType="mainImage"
                                                imageIndex={imageIndex}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 69,
                                                        height: 69,
                                                        border: '1px dashed #ccc',
                                                        p: 0.5,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <img
                                                        src={inputField.mainImageUrls[imageIndex]}
                                                        alt={`Main Image ${imageIndex + 1}`}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'contain'
                                                        }}
                                                    />
                                                </Box>
                                            </ImageTooltip>
                                        ) : (
                                            <Button
                                                component="label"
                                                variant="outlined"
                                                size="small"
                                                sx={{ mb: 1, aspectRatio: "1/1", width: "30px" }}
                                            >
                                                <AddPhotoAlternateIcon />
                                                <VisuallyHiddenInput
                                                    type="file"
                                                    onChange={(e) => handleMainImageUpload(index, imageIndex, e)}
                                                    accept="image/*"
                                                />
                                            </Button>
                                        )}
                                    </Box>
                                </TableCell>
                            ))}

                            <TableCell align="center">
                                <Switch
                                    name="status"
                                    checked={inputField.status}
                                    onChange={() => handleChangeSwitch(index)}
                                />
                            </TableCell>
                            <TableCell align="center">
                                <Button
                                    variant="contained"
                                    sx={{
                                        bgcolor: "#DD3A49",
                                        "&:hover": {
                                            bgcolor: "#FF5A5F"
                                        }
                                    }}
                                    onClick={() => handleRemoveFields(index, inputField._id)}
                                    type="button"
                                    size="small"
                                >
                                    Remove
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default VariantAttributesTable;
