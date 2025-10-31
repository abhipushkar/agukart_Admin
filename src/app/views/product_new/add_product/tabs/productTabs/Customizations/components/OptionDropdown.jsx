// components/OptionDropdown.jsx
import React, { useState, useRef } from 'react';
import {
    Box,
    TextField,
    Checkbox,
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Tooltip,
    Switch,
    Slider,
    Chip, Card, CardContent
} from "@mui/material";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import FilterListIcon from "@mui/icons-material/FilterList";
import DeleteIcon from "@mui/icons-material/Delete";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import AddToPhotosIcon from "@mui/icons-material/AddToPhotos";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CropIcon from "@mui/icons-material/Crop";
import CollectionsIcon from "@mui/icons-material/Collections";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import CheckIcon from "@mui/icons-material/Check";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { styled } from "@mui/material/styles";
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './cropUtil';
import {useProductFormStore} from "../../../../../states/useAddProducts";

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

// Draggable Table Row Component
const DraggableTableRow = ({
                               children,
                               index,
                               onDragStart,
                               onDragOver,
                               onDrop,
                               onDragEnd,
                               isDragging,
                               isDragOver,
                               ...props
                           }) => {
    const ref = useRef(null);

    const handleDragStart = (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());

        if (ref.current) {
            e.dataTransfer.setDragImage(ref.current, 0, 0);
        }

        onDragStart(e, index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        onDragOver(e, index);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        onDrop(e, index);
    };

    const handleDragEnd = (e) => {
        onDragEnd(e);
    };

    return (
        <TableRow
            {...props}
            ref={ref}
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            sx={{
                cursor: isDragging ? 'grabbing' : 'grab',
                backgroundColor: isDragging
                    ? 'rgba(25, 118, 210, 0.08)'
                    : isDragOver
                        ? 'rgba(0, 0, 0, 0.04)'
                        : 'transparent',
                opacity: isDragging ? 0.7 : 1,
                transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                transition: isDragging ? 'none' : 'all 0.2s ease',
                boxShadow: isDragging ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
                position: 'relative',
                zIndex: isDragging ? 1000 : 1,
                '&:hover': {
                    backgroundColor: isDragging
                        ? 'rgba(25, 118, 210, 0.08)'
                        : 'rgba(0, 0, 0, 0.04)',
                },
                '& .drag-handle': {
                    opacity: isDragging ? 1 : 0.3,
                    transition: 'opacity 0.2s ease',
                },
                '&:hover .drag-handle': {
                    opacity: 0.7,
                },
                borderBottom: isDragOver ? '2px dashed #1976d2' : '1px solid rgba(224, 224, 224, 1)'
            }}
        >
            {children}
        </TableRow>
    );
};

const OptionDropdown = ({ index }) => {
    const { customizationData, setCustomizationData } = useProductFormStore();
    const [open, setOpen] = useState(false);
    const [addManyOptions, setAddManyOptions] = useState([]);

    // Image editing states
    const [cropDialogOpen, setCropDialogOpen] = useState(false);
    const [currentEditingImage, setCurrentEditingImage] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    // Drag and drop state
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const handleOptionDropDownFormChange = (e) => {
        const { name, value } = e.target;
        if (name === "label" && value.length > 100) return;
        if (name === "instructions" && value.length > 200) return;

        const updatedCustomizations = customizationData.customizations.map((item, idx) =>
            idx === index ? { ...item, [name]: value } : item
        );

        setCustomizationData({
            ...customizationData,
            customizations: updatedCustomizations
        });
    };

    const handleCheckboxChange = (checked) => {
        const updatedCustomizations = customizationData.customizations.map((item, idx) =>
            idx === index ? { ...item, isCompulsory: checked } : item
        );

        setCustomizationData({
            ...customizationData,
            customizations: updatedCustomizations
        });
    };

    const handleOptionChange = (optionIndex, field, value) => {
        const updatedCustomizations = [...customizationData.customizations];
        const updatedOptionList = [...updatedCustomizations[index].optionList];

        updatedOptionList[optionIndex] = {
            ...updatedOptionList[optionIndex],
            [field]: value
        };

        updatedCustomizations[index] = {
            ...updatedCustomizations[index],
            optionList: updatedOptionList
        };

        setCustomizationData({
            ...customizationData,
            customizations: updatedCustomizations
        });
    };

    const handleImageUpload = (optionIndex, imageType, event, imageIndex = null) => {
        const file = event.target.files[0];
        if (!file) return;

        const updatedCustomizations = [...customizationData.customizations];
        const updatedOptionList = [...updatedCustomizations[index].optionList];
        let updatedOption = { ...updatedOptionList[optionIndex] };

        if (imageType.startsWith('main_images[')) {
            const imgIndex = parseInt(imageType.match(/\[(\d+)\]/)[1]);
            const newMainImages = updatedOption.main_images ? [...updatedOption.main_images] : [null, null, null];

            while (newMainImages.length <= imgIndex) {
                newMainImages.push(null);
            }

            newMainImages[imgIndex] = file;
            updatedOption = {
                ...updatedOption,
                main_images: newMainImages
            };

            // Clear edited image and edit data when uploading a new main image (first image only)
            if (imgIndex === 0 && updatedOption.edit_main_image) {
                updatedOption.edit_main_image = "";
                updatedOption.edit_main_image_data = null;
            }
        } else {
            updatedOption = {
                ...updatedOption,
                [imageType]: file
            };

            // Clear edited preview image and edit data when uploading a new preview image
            if (imageType === "preview_image" && updatedOption.edit_preview_image) {
                updatedOption.edit_preview_image = "";
                updatedOption.edit_preview_image_data = null;
            }
        }

        updatedOptionList[optionIndex] = updatedOption;
        updatedCustomizations[index] = {
            ...updatedCustomizations[index],
            optionList: updatedOptionList
        };

        setCustomizationData({
            ...customizationData,
            customizations: updatedCustomizations
        });
    };

    // Bulk image upload function
    const handleBulkImageUpload = (optionIndex, event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        const updatedCustomizations = [...customizationData.customizations];
        const updatedOptionList = [...updatedCustomizations[index].optionList];
        let updatedOption = { ...updatedOptionList[optionIndex] };

        // Initialize main_images array if it doesn't exist
        const newMainImages = updatedOption.main_images ? [...updatedOption.main_images] : [null, null, null];

        // Upload first 3 images to main_images[0], main_images[1], main_images[2]
        files.slice(0, 3).forEach((file, imgIndex) => {
            if (imgIndex < 3) {
                newMainImages[imgIndex] = file;
            }
        });

        updatedOption = {
            ...updatedOption,
            main_images: newMainImages
        };

        // Clear edited main image data for the first image
        if (updatedOption.edit_main_image) {
            updatedOption.edit_main_image = "";
            updatedOption.edit_main_image_data = null;
        }

        updatedOptionList[optionIndex] = updatedOption;
        updatedCustomizations[index] = {
            ...updatedCustomizations[index],
            optionList: updatedOptionList
        };

        setCustomizationData({
            ...customizationData,
            customizations: updatedCustomizations
        });

        // Reset the input value to allow uploading the same files again
        event.target.value = '';
    };

    const handleImageRemove = (optionIndex, imageType, imageIndex = null) => {
        const updatedCustomizations = [...customizationData.customizations];
        const updatedOptionList = [...updatedCustomizations[index].optionList];
        let updatedOption = { ...updatedOptionList[optionIndex] };

        if (imageType.startsWith('main_images[')) {
            const imgIndex = parseInt(imageType.match(/\[(\d+)\]/)[1]);
            if (!updatedOption.main_images || updatedOption.main_images.length <= imgIndex) {
                return;
            }
            const newMainImages = [...updatedOption.main_images];
            newMainImages[imgIndex] = "";
            updatedOption = {
                ...updatedOption,
                main_images: newMainImages
            };
        } else {
            updatedOption = {
                ...updatedOption,
                [imageType]: ""
            };
        }

        updatedOptionList[optionIndex] = updatedOption;
        updatedCustomizations[index] = {
            ...updatedCustomizations[index],
            optionList: updatedOptionList
        };

        setCustomizationData({
            ...customizationData,
            customizations: updatedCustomizations
        });
    };

    const handleEditImage = (optionIndex, imageType, editedImage, editData, imageIndex = null) => {
        const updatedCustomizations = [...customizationData.customizations];
        const updatedOptionList = [...updatedCustomizations[index].optionList];
        let updatedOption = { ...updatedOptionList[optionIndex] };

        let editKey, editDataKey;
        if (imageType === "preview_image") {
            editKey = "edit_preview_image";
            editDataKey = "edit_preview_image_data";
        } else if (imageType === "main_images" && imageIndex === 0) {
            editKey = "edit_main_image";
            editDataKey = "edit_main_image_data";
        }

        if (editKey && editDataKey) {
            updatedOption = {
                ...updatedOption,
                [editKey]: editedImage,
                [editDataKey]: editData
            };
        }

        updatedOptionList[optionIndex] = updatedOption;
        updatedCustomizations[index] = {
            ...updatedCustomizations[index],
            optionList: updatedOptionList
        };

        setCustomizationData({
            ...customizationData,
            customizations: updatedCustomizations
        });
    };

    const handleCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleCropApply = async () => {
        if (!currentEditingImage || !croppedAreaPixels) return;

        try {
            const croppedImage = await getCroppedImg(
                currentEditingImage.originalImage,
                croppedAreaPixels,
                rotation
            );

            const editedFile = new File([croppedImage], `edited-${Date.now()}.jpg`, {
                type: 'image/jpeg'
            });

            // Create edit data object with scale, position, and rotation
            const editData = {
                scale: zoom,
                x: crop.x,
                y: crop.y,
                rotation: rotation,
                croppedAreaPixels: croppedAreaPixels
            };

            handleEditImage(
                currentEditingImage.optionIndex,
                currentEditingImage.imageType,
                editedFile,
                editData,
                currentEditingImage.imageIndex
            );

            setCropDialogOpen(false);
            resetCropState();
        } catch (error) {
            console.error('Error cropping image:', error);
        }
    };

    const resetCropState = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setCroppedAreaPixels(null);
        setCurrentEditingImage(null);
    };

    const handleCropCancel = () => {
        setCropDialogOpen(false);
        resetCropState();
    };

    const openCropDialog = (optionIndex, imageType, originalImage, imageIndex = null) => {
        const option = customization.optionList[optionIndex];

        // Check if there's existing edit data to restore
        let existingEditData = null;
        if (imageType === "preview_image" && option.edit_preview_image_data) {
            existingEditData = option.edit_preview_image_data;
        } else if (imageType === "main_images" && imageIndex === 0 && option.edit_main_image_data) {
            existingEditData = option.edit_main_image_data;
        }

        // Set initial crop state from existing edit data or defaults
        if (existingEditData) {
            setCrop({ x: existingEditData.x || 0, y: existingEditData.y || 0 });
            setZoom(existingEditData.scale || 1);
            setRotation(existingEditData.rotation || 0);
        } else {
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setRotation(0);
        }

        setCurrentEditingImage({
            optionIndex,
            imageType,
            originalImage,
            imageIndex,
            existingEditData
        });
        setCropDialogOpen(true);
    };

    // Drag and drop handlers
    const handleDragStart = (e, sourceIndex) => {
        setDraggingIndex(sourceIndex);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', sourceIndex.toString());

        const dragImage = e.currentTarget;
        if (dragImage) {
            const rect = dragImage.getBoundingClientRect();
            e.dataTransfer.setDragImage(dragImage, rect.width / 2, rect.height / 2);
        }
    };

    const handleDragOver = (e, targetIndex) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (draggingIndex !== null && draggingIndex !== targetIndex) {
            setDragOverIndex(targetIndex);
        }
    };

    const handleDragEnd = () => {
        setDraggingIndex(null);
        setDragOverIndex(null);
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));

        if (sourceIndex !== targetIndex) {
            const updatedCustomizations = [...customizationData.customizations];
            const updatedOptionList = [...updatedCustomizations[index].optionList];

            // Reorder the options
            const [movedItem] = updatedOptionList.splice(sourceIndex, 1);
            updatedOptionList.splice(targetIndex, 0, movedItem);

            updatedCustomizations[index] = {
                ...updatedCustomizations[index],
                optionList: updatedOptionList
            };

            setCustomizationData({
                ...customizationData,
                customizations: updatedCustomizations
            });
        }

        setDraggingIndex(null);
        setDragOverIndex(null);
    };

    const addOption = () => {
        const updatedCustomizations = [...customizationData.customizations];
        const updatedOptionList = [...updatedCustomizations[index].optionList];

        updatedOptionList.push({
            optionName: "",
            priceDifference: "",
            main_images: [null, null, null],
            preview_image: null,
            thumbnail: null,
            isVisible: true,
            edit_main_image: null,
            edit_main_image_data: null,
            edit_preview_image: null,
            edit_preview_image_data: null
        });

        updatedCustomizations[index] = {
            ...updatedCustomizations[index],
            optionList: updatedOptionList
        };

        setCustomizationData({
            ...customizationData,
            customizations: updatedCustomizations
        });
    };

    const removeOption = (optionIndex) => {
        const updatedCustomizations = [...customizationData.customizations];
        const updatedOptionList = [...updatedCustomizations[index].optionList];
        updatedOptionList.splice(optionIndex, 1);

        updatedCustomizations[index] = {
            ...updatedCustomizations[index],
            optionList: updatedOptionList
        };

        setCustomizationData({
            ...customizationData,
            customizations: updatedCustomizations
        });
    };

    const handleToggleVisibility = (optionIndex) => {
        const updatedCustomizations = [...customizationData.customizations];
        const updatedOptionList = [...updatedCustomizations[index].optionList];

        updatedOptionList[optionIndex] = {
            ...updatedOptionList[optionIndex],
            isVisible: !updatedOptionList[optionIndex].isVisible
        };

        updatedCustomizations[index] = {
            ...updatedCustomizations[index],
            optionList: updatedOptionList
        };

        setCustomizationData({
            ...customizationData,
            customizations: updatedCustomizations
        });
    };

    const addManyOptionHandler = () => {
        if (addManyOptions.length === 0) return;

        const updatedCustomizations = [...customizationData.customizations];
        const updatedOptionList = [...updatedCustomizations[index].optionList];

        for (let i = 0; i < addManyOptions.length; i++) {
            updatedOptionList.push({
                optionName: addManyOptions[i],
                priceDifference: "",
                main_images: [null, null, null],
                preview_image: null,
                thumbnail: null,
                isVisible: true,
                edit_main_image: null,
                edit_main_image_data: null,
                edit_preview_image: null,
                edit_preview_image_data: null
            });
        }

        updatedCustomizations[index] = {
            ...updatedCustomizations[index],
            optionList: updatedOptionList
        };

        setCustomizationData({
            ...customizationData,
            customizations: updatedCustomizations
        });

        setOpen(false);
    };

    const customization = customizationData.customizations[index];

    const renderImageCell = (option, optionIndex, imageType, imageIndex = null) => {
        let imageValue;
        let editedImageValue;
        let editData;

        if (imageIndex !== null) {
            imageValue = option.main_images && option.main_images[imageIndex];
            if (imageIndex === 0) {
                editedImageValue = option.edit_main_image;
                editData = option.edit_main_image_data;
            }
        } else {
            imageValue = option[imageType];
            if (imageType === "preview_image") {
                editedImageValue = option.edit_preview_image;
                editData = option.edit_preview_image_data;
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

        const originalImageUrl = createSafeObjectURL(imageValue) || (typeof imageValue === 'string' ? imageValue : null);

        const imageKey = imageIndex !== null ? `main_images[${imageIndex}]` : imageType;
        const isEditable = (imageType === "preview_image") || (imageType === "main_images" && imageIndex === 0);

        return (
            <TableCell align="center">
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    {displayUrl ? (
                        <Tooltip
                            title={
                                <Box sx={{
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    minWidth: 280
                                }}>
                                    {shouldUseEditedImage && (
                                        <Box
                                            sx={{
                                                mb: 1,
                                                px: 1,
                                                py: 0.5,
                                                backgroundColor: 'success.light',
                                                color: 'white',
                                                borderRadius: 1,
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            ✓ Edited Version
                                            {editData && (
                                                <Box sx={{ fontSize: '0.6rem', mt: 0.5 }}>
                                                    Scale: {editData.scale?.toFixed(1)}x,
                                                    Pos: ({Math.round(editData.x)}, {Math.round(editData.y)})
                                                    {editData.rotation && `, Rot: ${editData.rotation}°`}
                                                </Box>
                                            )}
                                        </Box>
                                    )}

                                    <Box
                                        sx={{
                                            width: 250,
                                            height: 250,
                                            overflow: 'hidden',
                                            borderRadius: 1,
                                            border: '2px solid',
                                            borderColor: shouldUseEditedImage ? 'success.main' : 'grey.300',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: 'grey.100',
                                            mb: 2
                                        }}
                                    >
                                        <img
                                            src={displayUrl}
                                            alt="Preview"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                                        {isEditable && (
                                            <Button
                                                variant="contained"
                                                size="small"
                                                color="primary"
                                                onClick={() => openCropDialog(optionIndex, imageType, originalImageUrl, imageIndex)}
                                                sx={{ fontSize: '12px' }}
                                                startIcon={<CropIcon />}
                                            >
                                                Edit
                                            </Button>
                                        )}
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="error"
                                            onClick={() => handleImageRemove(optionIndex, imageKey, imageIndex)}
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
                                        boxShadow: 3,
                                        maxWidth: 500
                                    }
                                }
                            }}
                        >
                            <Box
                                sx={{
                                    width: 69,
                                    height: 69,
                                    border: shouldUseEditedImage ? '2px solid green' : '1px dashed #ccc',
                                    p: 0.5,
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                            >
                                {shouldUseEditedImage && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: -5,
                                            right: -5,
                                            width: 12,
                                            height: 12,
                                            backgroundColor: 'green',
                                            borderRadius: '50%',
                                            border: '2px solid white'
                                        }}
                                    />
                                )}
                                <img
                                    src={displayUrl}
                                    alt={`${imageKey} preview`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            </Box>
                        </Tooltip>
                    ) : (
                        <Button
                            component="label"
                            variant="outlined"
                            size="small"
                            sx={{mb: 1, aspectRatio: "1/1", width: "30px"}}
                        >
                            <AddPhotoAlternateIcon/>
                            <VisuallyHiddenInput
                                type="file"
                                onChange={(e) => handleImageUpload(optionIndex, imageKey, e, imageIndex)}
                                accept="image/*"
                            />
                        </Button>
                    )}
                </Box>
            </TableCell>
        );
    };

    // Function to render bulk upload cell
    const renderBulkUploadCell = (option, optionIndex) => {
        const hasMainImages = option.main_images && option.main_images.some(img => img && img !== "");
        const uploadedCount = option.main_images ? option.main_images.filter(img => img && img !== "").length : 0;

        return (
            <TableCell align="center">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <Button
                        component="label"
                        variant="outlined"
                        size="small"
                        startIcon={<CollectionsIcon />}
                        sx={{ fontSize: '12px', textWrap: "noWrap" }}
                    >
                        Bulk Upload
                        <VisuallyHiddenInput
                            type="file"
                            multiple
                            onChange={(e) => handleBulkImageUpload(optionIndex, e)}
                            accept="image/*"
                        />
                    </Button>

                    {hasMainImages && (
                        <Chip
                            label={`${uploadedCount}/3 images`}
                            size="small"
                            color={uploadedCount === 3 ? "success" : "default"}
                            variant="outlined"
                        />
                    )}
                </Box>
            </TableCell>
        );
    };

    // Function to calculate visual differences between original and edited
    const getEditSummary = () => {
        if (!currentEditingImage) return null;

        const summary = [];
        if (zoom !== 1) summary.push(`Scale: ${zoom.toFixed(1)}x`);
        if (rotation !== 0) summary.push(`Rotation: ${rotation}°`);
        if (crop.x !== 0 || crop.y !== 0) summary.push(`Position: (${Math.round(crop.x)}, ${Math.round(crop.y)})`);

        return summary.length > 0 ? summary.join(', ') : 'Custom crop applied';
    };

    return (
        <Box>
            <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                    Configuration
                </Typography>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: "100%"}}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, width: "100%" }}>
                        <Box sx={{width: "100%"}}>
                            <Typography variant="subtitle2" gutterBottom>
                                Label
                            </Typography>
                            <TextField
                                fullWidth
                                value={customization?.label || ""}
                                name="label"
                                onChange={handleOptionDropDownFormChange}
                                placeholder="Enter label for this variant"
                                size="small"
                            />
                            <Typography variant="caption" color="text.secondary">
                                {`${100 - (customization?.label?.length || 0)} of 100 characters remaining`}
                            </Typography>
                        </Box>

                        <Box sx={{width: "100%"}}>
                            <Typography variant="subtitle2" gutterBottom>
                                Instructions (Optional)
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                name="instructions"
                                value={customization?.instructions || ""}
                                onChange={handleOptionDropDownFormChange}
                                placeholder="Enter instructions for customers"
                                size="small"
                            />
                            <Typography variant="caption" color="text.secondary">
                                {`${200 - (customization?.instructions?.length || 0)} of 200 characters remaining`}
                            </Typography>
                        </Box>
                    </Box>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={customization?.isCompulsory || false}
                                onChange={(e) => handleCheckboxChange(e.target.checked)}
                            />
                        }
                        label="Make this customization compulsory"
                    />
                </Box>
            </Box>

            <Card variant={"outlined"}>
                <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px" }}>
                        <Box sx={{ fontSize: "24px", fontWeight: "700" }}>
                            Option List
                        </Box>
                    </Box>

                    <DndProvider backend={HTML5Backend}>
                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center"></TableCell>
                                        <TableCell align="center">Option Name</TableCell>
                                        <TableCell align="center">Bulk Upload</TableCell>
                                        <TableCell align="center">Main Image 1</TableCell>
                                        <TableCell align="center">Main Image 2</TableCell>
                                        <TableCell align="center">Main Image 3</TableCell>
                                        <TableCell align="center">Preview Image</TableCell>
                                        <TableCell align="center">Thumbnail</TableCell>
                                        <TableCell align="center">Price Difference</TableCell>
                                        <TableCell align="center">Visible</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {customization?.optionList?.map((option, optionIndex) => (
                                        <DraggableTableRow
                                            key={optionIndex}
                                            index={optionIndex}
                                            onDragStart={handleDragStart}
                                            onDragOver={handleDragOver}
                                            onDrop={handleDrop}
                                            onDragEnd={handleDragEnd}
                                            isDragging={draggingIndex === optionIndex}
                                            isDragOver={dragOverIndex === optionIndex}
                                        >
                                            {/* Drag Handle Column */}
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <IconButton
                                                        className="drag-handle"
                                                        size="small"
                                                        sx={{
                                                            cursor: draggingIndex === optionIndex ? 'grabbing' : 'grab',
                                                            '&:active': {
                                                                cursor: 'grabbing',
                                                            },
                                                            touchAction: 'none',
                                                            userSelect: 'none',
                                                        }}
                                                        draggable={true}
                                                        onDragStart={(e) => {
                                                            e.stopPropagation();
                                                            handleDragStart(e, optionIndex);
                                                        }}
                                                    >
                                                        <DragIndicatorIcon
                                                            sx={{
                                                                color: 'text.secondary',
                                                                opacity: draggingIndex === optionIndex ? 1 : 0.6
                                                            }}
                                                        />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>

                                            <TableCell align="center">
                                                <TextField
                                                    value={option.optionName || ""}
                                                    onChange={(e) => handleOptionChange(optionIndex, 'optionName', e.target.value)}
                                                    placeholder="Option name"
                                                    size="small"
                                                />
                                            </TableCell>

                                            {/* Bulk Upload Cell */}
                                            {renderBulkUploadCell(option, optionIndex)}

                                            {/* Main Images */}
                                            {renderImageCell(option, optionIndex, "main_images", 0)}
                                            {renderImageCell(option, optionIndex, "main_images", 1)}
                                            {renderImageCell(option, optionIndex, "main_images", 2)}

                                            {/* Preview Image */}
                                            {renderImageCell(option, optionIndex, "preview_image")}

                                            {/* Thumbnail */}
                                            {renderImageCell(option, optionIndex, "thumbnail")}

                                            <TableCell align="center">
                                                <TextField
                                                    type="number"
                                                    value={option.priceDifference || ""}
                                                    onChange={(e) => handleOptionChange(optionIndex, 'priceDifference', e.target.value)}
                                                    placeholder="0.00"
                                                    size="small"
                                                    sx={{ width: 100 }}
                                                />
                                            </TableCell>

                                            {/* Toggle Switch Column */}
                                            <TableCell align="center">
                                                <Switch
                                                    checked={option.isVisible !== false}
                                                    onChange={() => handleToggleVisibility(optionIndex)}
                                                    inputProps={{ 'aria-label': 'controlled' }}
                                                />
                                            </TableCell>

                                            <TableCell align="center">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => removeOption(optionIndex)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </DraggableTableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DndProvider>

                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "end", marginTop: "20px" }}>
                        <Box>
                            <Button
                                onClick={() => setOpen(true)}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px"
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        color: "#1976d2"
                                    }}
                                >
                                    <AddToPhotosIcon />
                                </Box>
                                <Box
                                    sx={{
                                        fontSize: "12px",
                                        color: "#1976d2",
                                        fontWeight: "600"
                                    }}
                                >
                                    Add Many Options
                                </Box>
                            </Button>
                            <Dialog
                                open={open}
                                onClose={() => setOpen(false)}
                                maxWidth="sm"
                                fullWidth
                            >
                                <DialogTitle>
                                    <Typography
                                        variant="h6"
                                        component="h2"
                                        sx={{
                                            borderBottom: "1px solid"
                                        }}
                                    >
                                        Add Many Options
                                    </Typography>
                                </DialogTitle>
                                <DialogContent>
                                    <Typography
                                        sx={{
                                            mt: 2,
                                            color: "#1976d2",
                                            fontWeight: "600"
                                        }}
                                    >
                                        Add Up to 100 options Seprated by Commas.
                                    </Typography>
                                    <Typography sx={{}}>
                                        Example: Option 1, Option 2, Option 3
                                    </Typography>
                                    <Typography
                                        sx={{
                                            marginTop: "10px"
                                        }}
                                    >
                                        <TextField
                                            multiline
                                            onChange={(e) => {
                                                setAddManyOptions(e.target.value.split(",").map(opt => opt.trim()));
                                            }}
                                            rows={3}
                                            sx={{
                                                width: "100%"
                                            }}
                                            placeholder="Option 1, Option 2, Option 3"
                                        />
                                    </Typography>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                                    <Button variant="contained" onClick={addManyOptionHandler}>
                                        Add
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </Box>
                        <Button
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px"
                            }}
                            onClick={addOption}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px"
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        color: "#1976d2"
                                    }}
                                >
                                    <AddToPhotosIcon />
                                </Box>
                                <Box
                                    sx={{
                                        fontSize: "12px",
                                        color: "#1976d2",
                                        fontWeight: "600"
                                    }}
                                >
                                    Add Options
                                </Box>
                            </Box>
                        </Button>
                    </Box>
                </CardContent>
            </Card>


            {/* Enhanced Crop Dialog */}
            <Dialog
                open={cropDialogOpen}
                onClose={handleCropCancel}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    Edit Image
                    {currentEditingImage && (
                        <Box sx={{ fontSize: '0.9rem', color: 'text.secondary', mt: 0.5 }}>
                            Current edits: {getEditSummary()}
                            {currentEditingImage.existingEditData && (
                                <Box sx={{ fontSize: '0.8rem', color: 'info.main', mt: 0.5 }}>
                                    Restored previous edits
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                        {/* Original Image */}
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" gutterBottom align="center">
                                Original Image
                            </Typography>
                            <Box sx={{
                                position: 'relative',
                                height: 300,
                                width: '100%',
                                border: '2px solid',
                                borderColor: 'primary.main',
                                borderRadius: 1,
                                overflow: 'hidden'
                            }}>
                                <img
                                    src={currentEditingImage?.originalImage}
                                    alt="Original"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Edited Image Preview */}
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" gutterBottom align="center">
                                Edited Preview
                            </Typography>
                            <Box sx={{
                                position: 'relative',
                                height: 300,
                                width: '100%',
                                border: '2px solid',
                                borderColor: 'success.main',
                                borderRadius: 1,
                                overflow: 'hidden'
                            }}>
                                <Cropper
                                    image={currentEditingImage?.originalImage}
                                    crop={crop}
                                    zoom={zoom}
                                    rotation={rotation}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onRotationChange={setRotation}
                                    onCropComplete={handleCropComplete}
                                />
                            </Box>
                        </Box>
                    </Box>

                    {/* Controls */}
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ mb: 2 }}>
                            <Typography gutterBottom>Zoom</Typography>
                            <Slider
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                onChange={(e, newValue) => setZoom(newValue)}
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => `${value.toFixed(1)}x`}
                            />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography gutterBottom>Rotation</Typography>
                            <Slider
                                value={rotation}
                                min={0}
                                max={360}
                                step={1}
                                onChange={(e, newValue) => setRotation(newValue)}
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => `${value}°`}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Button
                                variant="outlined"
                                startIcon={<ZoomInIcon />}
                                onClick={() => setZoom(Math.min(zoom + 0.1, 3))}
                            >
                                Zoom In
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<ZoomOutIcon />}
                                onClick={() => setZoom(Math.max(zoom - 0.1, 1))}
                            >
                                Zoom Out
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<RotateLeftIcon />}
                                onClick={() => setRotation((rotation - 90 + 360) % 360)}
                            >
                                Rotate Left
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<RotateRightIcon />}
                                onClick={() => setRotation((rotation + 90) % 360)}
                            >
                                Rotate Right
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCropCancel} startIcon={<CloseIcon />}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCropApply}
                        variant="contained"
                        color="primary"
                        startIcon={<CheckIcon />}
                    >
                        Apply Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OptionDropdown;
