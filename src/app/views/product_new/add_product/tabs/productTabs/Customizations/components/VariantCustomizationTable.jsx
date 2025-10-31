import React, { useState, useRef } from "react";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    TextField,
    IconButton,
    Tooltip,
    Typography,
    styled,
    Switch,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Slider,
    Chip,
    Card,
    CardContent,
    FormControlLabel,
    Checkbox,
    List,
    ListItem,
    ListItemText
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CropIcon from "@mui/icons-material/Crop";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import CheckIcon from "@mui/icons-material/Check";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CollectionsIcon from "@mui/icons-material/Collections";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
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

// React Quill modules configuration
const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['link', 'image'],
        ['clean']
    ],
};

const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'image'
];

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

        // Set drag image to be the row itself
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

const VariantCustomizationTable = ({ index }) => {
    const { customizationData, setCustomizationData, varientName } = useProductFormStore();

    const customization = customizationData?.customizations?.[index];
    const [cropDialogOpen, setCropDialogOpen] = useState(false);
    const [currentEditingImage, setCurrentEditingImage] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [optionsModalOpen, setOptionsModalOpen] = useState(false);
    const [availableOptions, setAvailableOptions] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [guideDialogOpen, setGuideDialogOpen] = useState(false);
    const [currentGuide, setCurrentGuide] = useState({
        guide_name: "",
        guide_file: null,
        guide_description: "",
        guide_type: "",
        guide_file_url: ""
    });

    // Drag and drop state
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    // Check if file is an image
    const isImageFile = (file) => {
        if (!file) return false;
        const fileName = typeof file === 'string' ? file : file.name;
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
        return imageExtensions.some(ext => fileName?.toLowerCase()?.endsWith(ext));
    };

    // Create object URL for preview
    const createObjectURL = (file) => {
        if (typeof file === 'string') {
            return file; // Already a URL string
        }
        return URL.createObjectURL(file);
    };

    // Guide Dialog Handlers
    const handleOpenGuideDialog = () => {
        // Initialize current guide with existing data or empty
        if (customization.guide) {
            setCurrentGuide({
                ...customization.guide,
                guide_file_url: customization.guide.guide_file ? createObjectURL(customization.guide.guide_file) : ""
            });
        } else {
            setCurrentGuide({
                guide_name: "",
                guide_file: null,
                guide_description: "",
                guide_type: "",
                guide_file_url: ""
            });
        }
        setGuideDialogOpen(true);
    };

    const handleCloseGuideDialog = () => {
        setGuideDialogOpen(false);
        setCurrentGuide({
            guide_name: "",
            guide_file: null,
            guide_description: "",
            guide_type: "",
            guide_file_url: ""
        });
    };

    // Handle guide file upload in dialog
    const handleGuideFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setCurrentGuide(prev => ({
            ...prev,
            guide_file: file,
            guide_file_url: URL.createObjectURL(file),
            guide_type: isImageFile(file) ? 'image' : 'document',
            guide_name: prev.guide_name || file.name
        }));
    };

    // Handle guide name change in dialog
    const handleGuideNameChange = (value) => {
        setCurrentGuide(prev => ({
            ...prev,
            guide_name: value
        }));
    };

    // Handle guide description change in dialog
    const handleGuideDescriptionChange = (value) => {
        setCurrentGuide(prev => ({
            ...prev,
            guide_description: value
        }));
    };

    // Handle guide file remove in dialog
    const handleGuideFileRemove = () => {
        setCurrentGuide(prev => ({
            ...prev,
            guide_file: null,
            guide_file_url: "",
            guide_type: ""
        }));
    };

    // Save guide data
    const handleSaveGuide = () => {
        const updatedCustomizations = [...customizationData.customizations];
        updatedCustomizations[index] = {
            ...updatedCustomizations[index],
            guide: currentGuide
        };

        setCustomizationData({
            ...customizationData,
            customizations: updatedCustomizations
        });
        handleCloseGuideDialog();
    };

    // Handle opening guide file in new tab
    const handleOpenGuideFile = () => {
        if (!currentGuide.guide_file) return;

        let fileUrl;

        if (typeof currentGuide.guide_file === 'string') {
            // If it's already a URL string
            fileUrl = currentGuide.guide_file;
        } else {
            // If it's a File object, create object URL
            fileUrl = URL.createObjectURL(currentGuide.guide_file);
        }

        // Open in new tab
        window.open(fileUrl, '_blank');
    };

    // Configuration handlers to match Option Dropdown
    const handleVariantConfigChange = (field, value) => {
        const updatedCustomizations = [...customizationData.customizations];
        updatedCustomizations[index] = {
            ...updatedCustomizations[index],
            [field]: value
        };
        setCustomizationData({
            ...customizationData,
            customizations: updatedCustomizations
        });
    };

    const handleLabelChange = (value) => {
        handleVariantConfigChange('label', value);
    };

    const handleInstructionsChange = (value) => {
        handleVariantConfigChange('instructions', value);
    };

    const handleIsCompulsoryChange = (value) => {
        handleVariantConfigChange('isCompulsory', value);
    };

    // Open options modal
    const handleOpenOptionsModal = () => {
        // Get all available options from the variant data
        const variantData = varientName?.find(v =>
            v.variant_name === customization?.title || v.name === customization?.title
        );

        if (variantData) {
            const options = variantData.variant_attribute?.map(attr => ({
                value: attr.attribute_value,
                main_images: attr.main_images || [null, null, null],
                preview_image: attr.preview_image || null,
                thumbnail: attr.thumbnail || null,
                attributeId: attr._id
            })) || [];

            setAvailableOptions(options);

            // Set currently selected options
            const currentSelected = customization?.optionList?.map(option => ({
                value: option.optionName,
                main_images: option.main_images || [null, null, null],
                preview_image: option.preview_image || null,
                thumbnail: option.thumbnail || null
            })) || [];

            setSelectedOptions(currentSelected);
        }
        setOptionsModalOpen(true);
    };

    // Handle option selection in modal
    const handleOptionToggle = (option) => {
        setSelectedOptions(prev => {
            const isSelected = prev.some(opt => opt.value === option.value);
            if (isSelected) {
                return prev.filter(opt => opt.value !== option.value);
            } else {
                return [...prev, option];
            }
        });
    };

    // Handle select all options
    const handleSelectAllOptions = () => {
        if (selectedOptions.length === availableOptions.length) {
            setSelectedOptions([]);
        } else {
            setSelectedOptions([...availableOptions]);
        }
    };

    // Apply selected options to the customization
    const handleApplyOptions = () => {
        const updatedCustomizations = [...customizationData.customizations];
        const updatedOptionList = selectedOptions.map(option => {
            // Check if this option already exists in the current optionList
            const existingOption = customization.optionList?.find(
                opt => opt.optionName === option.value
            );

            if (existingOption) {
                return existingOption;
            }

            return {
                optionName: option.value,
                priceDifference: "0",
                main_images: option.main_images || [null, null, null],
                preview_image: option.preview_image || null,
                thumbnail: option.thumbnail || null,
                isVisible: true
            };
        });

        updatedCustomizations[index] = {
            ...updatedCustomizations[index],
            optionList: updatedOptionList
        };

        setCustomizationData({
            ...customizationData,
            customizations: updatedCustomizations
        });

        setOptionsModalOpen(false);
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

    // Fixed bulk image upload function
    const handleBulkImageUpload = (optionIndex, event) => {
        const files = Array.from(event.target.files);
        console.log('Bulk upload files:', files);

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

        // Set a custom drag image if needed
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

    // Fixed function to render bulk upload cell
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
                        sx={{ fontSize: '12px' }}
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
        <Box sx={{ mt: 2 }}>
            {/* ADDED CONFIGURATION SECTION TO MATCH OPTION DROPDOWN */}
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
                                onChange={(e) => handleLabelChange(e.target.value)}
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
                                value={customization?.instructions || ""}
                                onChange={(e) => handleInstructionsChange(e.target.value)}
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
                                onChange={(e) => handleIsCompulsoryChange(e.target.checked)}
                            />
                        }
                        label="Make this customization compulsory"
                    />
                </Box>
            </Box>

            {/* GUIDE SECTION - ADDED BETWEEN CONFIGURATION AND OPTIONS LIST */}
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#f0f8ff', borderRadius: 1, border: '1px solid #e1f5fe' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                        Guide Information
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={handleOpenGuideDialog}
                        size="small"
                    >
                        {customization?.guide ? 'Edit Guide' : 'Add Guide'}
                    </Button>
                </Box>

                {customization?.guide ? (
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        {customization.guide.guide_file && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    cursor: 'pointer',
                                    padding: 1,
                                    borderRadius: 1,
                                    border: '1px solid #e0e0e0',
                                    backgroundColor: 'white',
                                    '&:hover': {
                                        backgroundColor: '#f5f5f5'
                                    }
                                }}
                                onClick={() => {
                                    if (customization.guide.guide_file) {
                                        const fileUrl = typeof customization.guide.guide_file === 'string'
                                            ? customization.guide.guide_file
                                            : URL.createObjectURL(customization.guide.guide_file);
                                        window.open(fileUrl, '_blank');
                                    }
                                }}
                                title="Click to open in new tab"
                            >
                                {isImageFile(customization.guide.guide_file) ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <img
                                            src={createObjectURL(customization.guide.guide_file)}
                                            alt="Guide preview"
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                objectFit: 'cover',
                                                borderRadius: '4px'
                                            }}
                                        />
                                        <Typography variant="body2" color="primary">
                                            {customization.guide.guide_name || 'Guide Image'}
                                        </Typography>
                                        <VisibilityIcon color="primary" fontSize="small" />
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <InsertDriveFileIcon color="primary" fontSize="small" />
                                        <Typography variant="body2" color="primary">
                                            {customization.guide.guide_name || 'Guide File'}
                                        </Typography>
                                        <VisibilityIcon color="primary" fontSize="small" />
                                    </Box>
                                )}
                            </Box>
                        )}
                        <Box sx={{ flex: 1 }}>
                            {customization.guide.guide_name && (
                                <Typography variant="body2" fontWeight={500}>
                                    {customization.guide.guide_name}
                                </Typography>
                            )}
                            {customization.guide.guide_description && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        maxHeight: '60px',
                                        overflow: 'auto',
                                        fontSize: '14px'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: customization.guide.guide_description }}
                                />
                            )}
                        </Box>
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        No guide information added
                    </Typography>
                )}
            </Box>

            {/* EXISTING VARIANT TABLE CODE */}
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Options List
                    </Typography>

                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleOpenOptionsModal}
                        sx={{ mb: 2 }}
                    >
                        Add/Edit Options
                    </Button>

                    <TableContainer component={Paper} variant="outlined">
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
                                {customization.optionList?.map((option, optionIndex) => (
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
                                                checked={option.isVisible !== false} // Default to true if not set
                                                onChange={() => {
                                                    const updatedCustomizations = [...customizationData.customizations];
                                                    const updatedOptionList = [...updatedCustomizations[index].optionList];

                                                    updatedOptionList[optionIndex] = {
                                                        ...updatedOptionList[optionIndex],
                                                        isVisible: !(updatedOptionList[optionIndex]?.isVisible !== false)
                                                    };

                                                    updatedCustomizations[index] = {
                                                        ...updatedCustomizations[index],
                                                        optionList: updatedOptionList
                                                    };

                                                    setCustomizationData({
                                                        ...customizationData,
                                                        customizations: updatedCustomizations
                                                    });
                                                }}
                                                inputProps={{ 'aria-label': 'controlled' }}
                                            />
                                        </TableCell>

                                        <TableCell align="center">
                                            <IconButton
                                                size="small"
                                                onClick={() => {
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
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </DraggableTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Button
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onClick={() => {
                            const updatedCustomizations = [...customizationData.customizations];
                            const updatedOptionList = [...updatedCustomizations[index].optionList];

                            updatedOptionList.push({
                                optionName: "",
                                priceDifference: "0",
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
                        }}
                    >
                        Add Option
                    </Button>
                </CardContent>
            </Card>

            {/* Options Selection Modal */}
            <Dialog
                open={optionsModalOpen}
                onClose={() => setOptionsModalOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Select Options for {customization?.title}
                    <Typography variant="body2" color="text.secondary">
                        Choose which options to include in this customization
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleSelectAllOptions}
                            sx={{ mb: 2 }}
                        >
                            {selectedOptions.length === availableOptions.length ? "Deselect All" : "Select All"}
                        </Button>

                        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                            {availableOptions.map((option, index) => {
                                const isSelected = selectedOptions.some(opt => opt.value === option.value);
                                return (
                                    <ListItem
                                        key={index}
                                        sx={{
                                            border: "1px solid #ddd",
                                            borderRadius: "4px",
                                            marginBottom: 1,
                                            cursor: "pointer",
                                            backgroundColor: isSelected ? "#e3f2fd" : "transparent",
                                            '&:hover': {
                                                backgroundColor: isSelected ? "#bbdefb" : "#f5f5f5"
                                            }
                                        }}
                                        onClick={() => handleOptionToggle(option)}
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            // onChange={(e) => {}}
                                            style={{ marginRight: "8px" }}
                                        />
                                        <ListItemText
                                            primary={option.value}
                                            secondary={
                                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                    {option.preview_image && (
                                                        <Box sx={{
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: '4px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <img
                                                                src={option.preview_image}
                                                                alt="Preview"
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover'
                                                                }}
                                                            />
                                                        </Box>
                                                    )}
                                                    {option.thumbnail && (
                                                        <Box sx={{
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: '4px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <img
                                                                src={option.thumbnail}
                                                                alt="Thumbnail"
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover'
                                                                }}
                                                            />
                                                        </Box>
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOptionsModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleApplyOptions}
                        disabled={selectedOptions.length === 0}
                    >
                        Apply Options ({selectedOptions.length})
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Guide Dialog */}
            <Dialog
                open={guideDialogOpen}
                onClose={handleCloseGuideDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {customization?.guide ? 'Edit Guide' : 'Add Guide'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {/* Guide Name Input */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" fontWeight={500} mb={1}>
                                Guide Name
                            </Typography>
                            <TextField
                                type="text"
                                value={currentGuide.guide_name || ""}
                                onChange={(e) => handleGuideNameChange(e.target.value)}
                                placeholder="Enter guide name"
                                fullWidth
                                size="small"
                            />
                        </Box>

                        {/* Guide File Upload and Preview */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" fontWeight={500} mb={1}>
                                Guide File
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                {currentGuide.guide_file ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {/* File Preview */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                cursor: 'pointer',
                                                padding: 1,
                                                borderRadius: 1,
                                                border: '1px solid #e0e0e0',
                                                backgroundColor: 'white',
                                                '&:hover': {
                                                    backgroundColor: '#f5f5f5'
                                                }
                                            }}
                                            onClick={handleOpenGuideFile}
                                            title="Click to open in new tab"
                                        >
                                            {isImageFile(currentGuide.guide_file) ? (
                                                // Image Preview
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <img
                                                        src={currentGuide.guide_file_url}
                                                        alt="Guide preview"
                                                        style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            objectFit: 'cover',
                                                            borderRadius: '4px'
                                                        }}
                                                    />
                                                    <Typography variant="body2" color="primary">
                                                        {currentGuide.guide_name || (typeof currentGuide.guide_file === 'string' ? 'Guide Image' : currentGuide.guide_file.name)}
                                                    </Typography>
                                                    <VisibilityIcon color="primary" fontSize="small" />
                                                </Box>
                                            ) : (
                                                // Document Preview
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <InsertDriveFileIcon color="primary" fontSize="small" />
                                                    <Typography variant="body2" color="primary">
                                                        {currentGuide.guide_name || (typeof currentGuide.guide_file === 'string' ? 'Guide File' : currentGuide.guide_file.name)}
                                                    </Typography>
                                                    <VisibilityIcon color="primary" fontSize="small" />
                                                </Box>
                                            )}
                                        </Box>

                                        {/* Remove Button */}
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={handleGuideFileRemove}
                                            title="Remove guide file"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ) : (
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        size="small"
                                    >
                                        Upload Guide File
                                        <VisuallyHiddenInput
                                            type="file"
                                            onChange={handleGuideFileUpload}
                                            accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
                                        />
                                    </Button>
                                )}
                            </Box>
                            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                                Supported formats: PDF, DOC, DOCX, TXT, XLSX, XLS, JPG, JPEG, PNG, GIF, BMP, WEBP, SVG
                            </Typography>
                        </Box>

                        {/* Guide Description - React Quill Editor */}
                        <Box>
                            <Typography variant="body2" fontWeight={500} mb={1}>
                                Guide Description
                            </Typography>
                            <Box sx={{
                                border: '1px solid #e0e0e0',
                                borderRadius: '4px',
                                '& .ql-container': {
                                    border: 'none',
                                    borderRadius: '0 0 4px 4px'
                                },
                                '& .ql-toolbar': {
                                    border: 'none',
                                    borderBottom: '1px solid #e0e0e0',
                                    borderRadius: '4px 4px 0 0'
                                }
                            }}>
                                <ReactQuill
                                    value={currentGuide.guide_description}
                                    onChange={handleGuideDescriptionChange}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    placeholder="Enter guide description..."
                                    style={{
                                        height: '200px',
                                        marginBottom: '50px'
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseGuideDialog}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveGuide}
                        variant="contained"
                    >
                        Save Guide
                    </Button>
                </DialogActions>
            </Dialog>

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

export default VariantCustomizationTable;
