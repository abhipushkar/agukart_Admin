import React, { useState, useRef } from "react";
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    IconButton,
    Typography,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Slider
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import EditIcon from "@mui/icons-material/Edit";
import CropIcon from "@mui/icons-material/Crop";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './cropUtil';

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

const VariantOptionTable = ({ customizationData, setCustomizationData, index, myMyRef }) => {
    const optionList = customizationData?.customizations?.[index]?.optionList || [];

    const handlePriceDifferenceChange = (optionIndex, value) => {
        if (/^\d*$/.test(value) && value.length <= 7) {
            setCustomizationData(prev => {
                const newCustomizations = [...prev.customizations];
                newCustomizations[index].optionList[optionIndex].priceDifference = value;
                return { ...prev, customizations: newCustomizations };
            });
        }
    };

    const handleImageUpload = (optionIndex, imageType, event) => {
        const file = event.target.files[0];
        if (!file) return;

        setCustomizationData(prev => {
            const newCustomizations = [...prev.customizations];
            const option = newCustomizations[index].optionList[optionIndex];

            if (imageType.startsWith('main_images[')) {
                const imgIndex = parseInt(imageType.match(/\[(\d+)\]/)[1]);
                const newMainImages = option.main_images ? [...option.main_images] : [];

                while (newMainImages.length <= imgIndex) {
                    newMainImages.push(null);
                }

                newMainImages[imgIndex] = file;

                option.main_images = newMainImages;

                // Clear edited image when uploading a new main image (first image only)
                if (imgIndex === 0 && option.edit_main_image) {
                    option.edit_main_image = "";
                }
            } else {
                option[imageType] = file;

                // Clear edited preview image when uploading a new preview image
                if (imageType === "preview_image" && option.edit_preview_image) {
                    option.edit_preview_image = "";
                }
            }

            return { ...prev, customizations: newCustomizations };
        });
    };

    const handleImageRemove = (optionIndex, imageType) => {
        setCustomizationData(prev => {
            const newCustomizations = [...prev.customizations];
            const option = newCustomizations[index].optionList[optionIndex];

            if (imageType.startsWith('main_images[')) {
                const imgIndex = parseInt(imageType.match(/\[(\d+)\]/)[1]);

                if (!option.main_images || option.main_images.length <= imgIndex) {
                    return prev;
                }

                const newMainImages = [...option.main_images];
                newMainImages[imgIndex] = "";

                option.main_images = newMainImages;
            } else {
                option[imageType] = "";
            }

            return { ...prev, customizations: newCustomizations };
        });
    };

    const handleEditImage = (optionIndex, imageType, editedImage, imageIndex = null) => {
        setCustomizationData(prev => {
            const newCustomizations = [...prev.customizations];
            const option = newCustomizations[index].optionList[optionIndex];

            let editKey;
            if (imageType === "preview_image") {
                editKey = "edit_preview_image";
            } else if (imageType === "main_images" && imageIndex === 0) {
                editKey = "edit_main_image";
            }

            if (editKey) {
                option[editKey] = editedImage;
            }

            return { ...prev, customizations: newCustomizations };
        });
    };

    const renderImageCell = (option, optionIndex, imageType, imageIndex = null) => {
        let imageValue;
        let editedImageValue;

        if (imageIndex !== null) {
            imageValue = option.main_images && option.main_images[imageIndex];
            if (imageIndex === 0) {
                editedImageValue = option.edit_main_image;
            }
        } else {
            imageValue = option[imageType];
            if (imageType === "preview_image") {
                editedImageValue = option.edit_preview_image;
            }
        }

        const isImageRemoved = imageValue === "" || imageValue === null;
        const isEditedImageRemoved = editedImageValue === "" || editedImageValue === null;

        const createSafeObjectURL = (fileOrUrl) => {
            if (!fileOrUrl) return null;

            if (typeof fileOrUrl === 'string') {
                return fileOrUrl;
            }

            if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
                try {
                    return URL.createObjectURL(fileOrUrl);
                } catch (error) {
                    console.error('Error creating object URL:', error);
                    return null;
                }
            }

            return null;
        };

        const shouldUseEditedImage = !isImageRemoved && !isEditedImageRemoved && editedImageValue;

        const displayUrl = isImageRemoved ? null :
            shouldUseEditedImage ? createSafeObjectURL(editedImageValue) :
                createSafeObjectURL(imageValue) || (typeof imageValue === 'string' ? imageValue : null);

        const imageKey = imageIndex !== null ? `main_images[${imageIndex}]` : imageType;
        const isEditable = imageType === "preview_image" || (imageType === "main_images" && imageIndex === 0);

        return (
            <TableCell align="center">
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    {displayUrl ? (
                        <ImageTooltip
                            imageUrl={displayUrl}
                            onImageChange={(e) => handleImageUpload(optionIndex, imageKey, e)}
                            onImageRemove={() => handleImageRemove(optionIndex, imageKey)}
                            onImageEdit={isEditable ? (editedImage) => handleEditImage(optionIndex, imageType, editedImage, imageIndex) : null}
                            isEditable={isEditable}
                        >
                            <Box
                                sx={{
                                    width: 69,
                                    height: 69,
                                    border: shouldUseEditedImage ? '2px solid green' : '1px dashed #ccc',
                                    p: 0.5,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden'
                                }}
                            >
                                <img
                                    src={displayUrl}
                                    alt={`${imageKey} preview`}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            </Box>
                        </ImageTooltip>
                    ) : (
                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<AddPhotoAlternateIcon />}
                            sx={{
                                width: 69,
                                height: 69,
                                minWidth: 'auto',
                                p: 0.5
                            }}
                        >
                            <VisuallyHiddenInput
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(optionIndex, imageKey, e)}
                            />
                        </Button>
                    )}
                </Box>
            </TableCell>
        );
    };

    return (
        <Paper
            ref={myMyRef}
            elevation={2}
            sx={{
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: 1
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="h6">
                    {customizationData?.customizations?.[index]?.title || "Variant Customization"}
                </Typography>
            </Box>

            <TableContainer component={Paper} variant="outlined">
                <Table sx={{ minWidth: 650 }} aria-label="variant options table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Option Name</TableCell>
                            <TableCell align="center">Price Difference</TableCell>
                            <TableCell align="center">Main Image 1</TableCell>
                            <TableCell align="center">Main Image 2</TableCell>
                            <TableCell align="center">Main Image 3</TableCell>
                            <TableCell align="center">Preview Image</TableCell>
                            <TableCell align="center">Thumbnail</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {optionList.map((option, optionIndex) => (
                            <TableRow key={optionIndex}>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="medium">
                                        {option.optionName}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <TextField
                                        size="small"
                                        value={option.priceDifference}
                                        onChange={(e) => handlePriceDifferenceChange(optionIndex, e.target.value)}
                                        inputProps={{
                                            maxLength: 7,
                                            pattern: '[0-9]*'
                                        }}
                                        sx={{ width: 80 }}
                                    />
                                </TableCell>
                                {renderImageCell(option, optionIndex, "main_images", 0)}
                                {renderImageCell(option, optionIndex, "main_images", 1)}
                                {renderImageCell(option, optionIndex, "main_images", 2)}
                                {renderImageCell(option, optionIndex, "preview_image")}
                                {renderImageCell(option, optionIndex, "thumbnail")}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

// ImageTooltip component for image editing functionality
const ImageTooltip = ({ imageUrl, onImageChange, onImageRemove, onImageEdit, isEditable, children }) => {
    const [open, setOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const fileInputRef = useRef(null);

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleSaveCrop = async () => {
        if (!onImageEdit || !croppedAreaPixels) return;

        try {
            const croppedImage = await getCroppedImg(
                imageUrl,
                croppedAreaPixels,
                rotation
            );
            onImageEdit(croppedImage);
            setOpen(false);
        } catch (e) {
            console.error('Error cropping image:', e);
        }
    };

    const handleReplaceImage = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        onImageChange(e);
        setOpen(false);
    };

    return (
        <>
            <Tooltip title="Click to edit image" placement="top">
                <Box onClick={() => setOpen(true)}>
                    {children}
                </Box>
            </Tooltip>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Edit Image
                    <IconButton
                        aria-label="close"
                        onClick={() => setOpen(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ position: 'relative', height: 400, width: '100%' }}>
                        <Cropper
                            image={imageUrl}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onRotationChange={setRotation}
                            onCropComplete={onCropComplete}
                        />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <ZoomOutIcon />
                            <Slider
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                onChange={(e, newZoom) => setZoom(newZoom)}
                                sx={{ flex: 1 }}
                            />
                            <ZoomInIcon />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                            <RotateLeftIcon />
                            <Slider
                                value={rotation}
                                min={0}
                                max={360}
                                onChange={(e, newRotation) => setRotation(newRotation)}
                                sx={{ flex: 1 }}
                            />
                            <RotateRightIcon />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => onImageRemove()} color="error">
                        Remove
                    </Button>
                    <Button onClick={handleReplaceImage}>
                        Replace
                    </Button>
                    {isEditable && (
                        <Button onClick={handleSaveCrop} variant="contained" startIcon={<CropIcon />}>
                            Crop & Save
                        </Button>
                    )}
                    <Button onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

            <VisuallyHiddenInput
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
            />
        </>
    );
};

export default VariantOptionTable;
