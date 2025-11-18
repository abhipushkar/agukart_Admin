// ProductIdentity/components/CropImage.jsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
    Dialog,
    Box,
    Button,
    Typography,
    IconButton,
    Slider,
    Grid,
    Modal,
    TextField
} from "@mui/material";
import {
    HighlightOff,
    ZoomIn,
    ZoomOut,
    Crop,
    Check,
    DeleteOutline,
    DragIndicator,
    Close
} from "@mui/icons-material";
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './cropUtils';
import { useProductFormStore } from "../../../../../../states/useAddProducts";

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: "8px",
};

const CropImage = ({
                       openEdit,
                       handleEditClose,
                       handleOpen
                   }) => {
    const {
        formData,
        setFormData,
        altText,
        setAltText
    } = useProductFormStore();

    const transformData = formData.transformData || { scale: 1, x: 0, y: 0 };

    console.log("Transform data", transformData);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isCropping, setIsCropping] = useState(false);
    const [discardModalOpen, setDiscardModalOpen] = useState(false);
    const [tempImages, setTempImages] = useState([]);
    const [tempAltText, setTempAltText] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
    const [showBlurOverlay, setShowBlurOverlay] = useState(false);

    // Drag and drop state
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [draggedIndex, setDraggedIndex] = useState(null);

    const inputFileRef = useRef(null);
    const imageContainerRef = useRef(null);

    // Check if selected image is primary (first image)
    const isPrimaryImage = selectedImageIndex === 0;

    // Update transformData in formData
    const updateTransformData = (newTransformData) => {
        setFormData({ transformData: newTransformData });
    };

    // Initialize temp state when modal opens
    useEffect(() => {
        if (openEdit) {
            setTempImages([...formData.images]);
            setTempAltText([...altText]);
            setSelectedImageIndex(0);
            setIsCropping(false);
            setCrop({ x: 0, y: 0 });
            // Initialize transformData if not present
            if (!transformData || !transformData.scale) {
                updateTransformData({ scale: 1, x: 0, y: 0 });
            }
        }
    }, [openEdit, formData.images, altText]);

    const selectedImage = tempImages[selectedImageIndex];

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCrop = async () => {
        if (!selectedImage || !croppedAreaPixels) return;

        try {
            const croppedImageBlob = await getCroppedImg(
                selectedImage.src,
                croppedAreaPixels
            );

            const croppedDataUrl = URL.createObjectURL(croppedImageBlob);
            const croppedFile = new File([croppedImageBlob], "cropped-image.jpg", {
                type: 'image/jpeg'
            });

            const updatedImages = tempImages.map((img, index) =>
                index === selectedImageIndex
                    ? { ...img, src: croppedDataUrl, file: croppedFile }
                    : img
            );

            setTempImages(updatedImages);
            setIsCropping(false);
            setCrop({ x: 0, y: 0 });
            // Reset transform data only for primary image after crop
            if (isPrimaryImage) {
                updateTransformData({ scale: 1, x: 0, y: 0 });
            }
        } catch (error) {
            console.error('Error cropping image:', error);
            handleOpen("error", "Error cropping image");
        }
    };

    // Pan and zoom functionality for primary image only
    const handleMouseDown = (e) => {
        if (isCropping || !isPrimaryImage) return;
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - (transformData?.x || 0),
            y: e.clientY - (transformData?.y || 0)
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || isCropping || !isPrimaryImage) return;

        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        updateTransformData({
            ...transformData,
            x: newX,
            y: newY
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e) => {
        if (isCropping || !isPrimaryImage) return;
        e.preventDefault();

        const delta = -e.deltaY / 100;
        const newScale = Math.max(0.1, Math.min((transformData?.scale || 1) + delta * 0.1, 5));

        updateTransformData({
            ...transformData,
            scale: newScale
        });
    };

    const handleZoomIn = () => {
        if (!isPrimaryImage) return;
        const newScale = Math.min((transformData?.scale || 1) + 0.1, 5);
        updateTransformData({
            ...transformData,
            scale: newScale
        });
    };

    const handleZoomOut = () => {
        if (!isPrimaryImage) return;
        const newScale = Math.max((transformData?.scale || 1) - 0.1, 0.1);
        updateTransformData({
            ...transformData,
            scale: newScale
        });
    };

    const handleResetZoom = () => {
        if (!isPrimaryImage) return;
        updateTransformData({ scale: 1, x: 0, y: 0 });
    };

    const handleImageLoad = (e) => {
        const { naturalWidth, naturalHeight } = e.target;
        setImgDimensions({ width: naturalWidth, height: naturalHeight });
    };

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);

        if (tempImages.length + files.length > 15) {
            handleOpen("error", "Maximum 15 images allowed");
            return;
        }

        const newImages = files.map((file, index) => ({
            src: URL.createObjectURL(file),
            file: file,
            _id: `temp-${Date.now()}-${index}`,
            isPrimary: tempImages.length === 0 && index === 0,
            sortOrder: tempImages.length + index + 1
        }));

        const updatedImages = [...tempImages, ...newImages];
        const updatedAltText = [...tempAltText, ...new Array(files.length).fill("")];

        setTempImages(updatedImages);
        setTempAltText(updatedAltText);

        // Select the first new image if no image was selected
        if (tempImages.length === 0) {
            setSelectedImageIndex(0);
        }
    };

    const handleDeleteImage = (index) => {
        const updatedImages = tempImages.filter((_, i) => i !== index);
        const updatedAltText = tempAltText.filter((_, i) => i !== index);

        // Update sort orders and mark first image as primary
        const reorderedImages = updatedImages.map((img, idx) => ({
            ...img,
            sortOrder: idx + 1,
            isPrimary: idx === 0 // First image is always primary
        }));

        setTempImages(reorderedImages);
        setTempAltText(updatedAltText);

        // Adjust selected index if needed
        if (selectedImageIndex >= reorderedImages.length) {
            setSelectedImageIndex(Math.max(0, reorderedImages.length - 1));
        }

        // If primary image was deleted, reset transform data
        if (index === 0) {
            updateTransformData({ scale: 1, x: 0, y: 0 });
        }
    };

    // Drag and Drop Handlers
    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === targetIndex) {
            setDragOverIndex(null);
            setDraggedIndex(null);
            return;
        }

        const updatedImages = [...tempImages];
        const updatedAltText = [...tempAltText];

        // Move the dragged image to the target position
        const [movedImage] = updatedImages.splice(draggedIndex, 1);
        const [movedAltText] = updatedAltText.splice(draggedIndex, 1);

        updatedImages.splice(targetIndex, 0, movedImage);
        updatedAltText.splice(targetIndex, 0, movedAltText);

        // Update sort orders and mark first image as primary
        const reorderedImages = updatedImages.map((img, idx) => ({
            ...img,
            sortOrder: idx + 1,
            isPrimary: idx === 0 // First image is always primary
        }));

        setTempImages(reorderedImages);
        setTempAltText(updatedAltText);

        // Update selected index if it moved
        if (selectedImageIndex === draggedIndex) {
            setSelectedImageIndex(targetIndex);
        } else if (
            selectedImageIndex > draggedIndex &&
            selectedImageIndex <= targetIndex
        ) {
            setSelectedImageIndex(selectedImageIndex - 1);
        } else if (
            selectedImageIndex < draggedIndex &&
            selectedImageIndex >= targetIndex
        ) {
            setSelectedImageIndex(selectedImageIndex + 1);
        }

        // If primary image changed, reset transform data
        if (draggedIndex === 0 || targetIndex === 0) {
            updateTransformData({ scale: 1, x: 0, y: 0 });
        }

        setDragOverIndex(null);
        setDraggedIndex(null);
    };

    const handleApplyChanges = () => {
        setFormData({
            images: tempImages,
            transformData: transformData // Preserve the current transformData
        });
        setAltText(tempAltText);
        handleEditClose();
    };

    const handleDiscard = () => {
        setDiscardModalOpen(false);
        handleEditClose();
    };

    const triggerFileInput = () => {
        inputFileRef.current?.click();
    };

    const canApply = tempImages.length > 0;

    return (
        <>
            {/* Main Crop Dialog */}
            <Dialog
                open={openEdit}
                onClose={() => setDiscardModalOpen(true)}
                maxWidth="md"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        height: '85vh',
                        maxHeight: '700px',
                        margin: 2,
                        width: 'calc(100% - 32px)'
                    }
                }}
            >
                <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                            Edit Images
                        </Typography>
                        <IconButton onClick={() => setDiscardModalOpen(true)} size="small">
                            <HighlightOff />
                        </IconButton>
                    </Box>

                    <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
                        {/* Thumbnail Sidebar */}
                        <Grid item xs={12} md={4}>
                            <Box sx={{
                                maxHeight: '600px',
                                overflow: 'auto',
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                p: 1
                            }}>
                                <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
                                    Drag to reorder (first image is primary)
                                </Typography>
                                <Grid container spacing={0.5}>
                                    {tempImages.map((image, index) => (
                                        <Grid item xs={6} key={image._id || index}>
                                            <Box
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, index)}
                                                onDragOver={(e) => handleDragOver(e, index)}
                                                onDragLeave={handleDragLeave}
                                                onDrop={(e) => handleDrop(e, index)}
                                                sx={{
                                                    border: dragOverIndex === index ? '2px dashed #1976d2' :
                                                        (selectedImageIndex === index ? '2px solid #1976d2' : '1px solid #e0e0e0'),
                                                    borderRadius: '6px',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    aspectRatio: '1',
                                                    backgroundColor: dragOverIndex === index ? '#f0f8ff' : 'transparent',
                                                    transition: 'all 0.2s ease',
                                                    transform: draggedIndex === index ? 'scale(0.95)' : 'scale(1)',
                                                    opacity: draggedIndex === index ? 0.6 : 1
                                                }}
                                                onClick={() => {
                                                    setSelectedImageIndex(index);
                                                }}
                                            >
                                                <img
                                                    src={image.src}
                                                    alt={`Thumbnail ${index + 1}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />

                                                {/* Remove Button (Cross Icon) */}
                                                <IconButton
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteImage(index);
                                                    }}
                                                    size="small"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 2,
                                                        right: 2,
                                                        background: 'rgba(255, 0, 0, 0.7)',
                                                        color: 'white',
                                                        width: '20px',
                                                        height: '20px',
                                                        '&:hover': {
                                                            background: 'rgba(255, 0, 0, 0.9)',
                                                        }
                                                    }}
                                                >
                                                    <Close sx={{ fontSize: 14 }} />
                                                </IconButton>

                                                {/* Primary Badge */}
                                                {index === 0 && (
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 2,
                                                            right: 24, // Moved left to make space for remove button
                                                            background: '#1976d2',
                                                            color: 'white',
                                                            fontSize: '10px',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        Primary
                                                    </Box>
                                                )}

                                                {/* Image Number */}
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: 2,
                                                        left: 2,
                                                        background: 'rgba(0,0,0,0.6)',
                                                        color: 'white',
                                                        fontSize: '10px',
                                                        padding: '1px 4px',
                                                        borderRadius: '4px'
                                                    }}
                                                >
                                                    {index + 1}
                                                </Box>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Add Image Button */}
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={triggerFileInput}
                                    sx={{ mt: 1 }}
                                    disabled={tempImages.length >= 15}
                                    size="small"
                                >
                                    Add Image ({tempImages.length}/15)
                                </Button>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    ref={inputFileRef}
                                    style={{ display: 'none' }}
                                />
                            </Box>
                        </Grid>

                        {/* Main Image Area */}
                        <Grid item xs={12} md={5}>
                            <Box
                                ref={imageContainerRef}
                                sx={{
                                    width: '350px',
                                    position: 'relative',
                                    border: '2px solid gray',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    bgcolor: '#f5f5f5',
                                    cursor: isPrimaryImage && !isCropping ? (isDragging ? 'grabbing' : 'grab') : 'default'
                                }}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                onWheel={handleWheel}
                            >
                                {selectedImage ? (
                                    isCropping ? (
                                        <Cropper
                                            image={selectedImage.src}
                                            crop={crop}
                                            zoom={transformData?.scale || 1}
                                            aspect={1}
                                            onCropChange={setCrop}
                                            onZoomChange={(zoom) => updateTransformData({ ...transformData, scale: zoom })}
                                            onCropComplete={onCropComplete}
                                            style={{
                                                containerStyle: {
                                                    position: 'relative',
                                                    height: '100%',
                                                    width: '100%'
                                                }
                                            }}
                                        />
                                    ) : (
                                        <>
                                            <img
                                                src={selectedImage.src}
                                                alt="Selected"
                                                onLoad={handleImageLoad}
                                                style={{
                                                    transform: `translate3d(${isPrimaryImage ? (transformData?.x || 0) : 0}px, ${isPrimaryImage ? (transformData?.y || 0) : 0}px, 0) scale(${isPrimaryImage ? (transformData?.scale || 1) : 1})`,
                                                    transformOrigin: 'center center',
                                                    transition: isDragging ? 'none' : 'transform 0.1s ease',
                                                    maxWidth: '100%',
                                                    maxHeight: '100%',
                                                    aspectRatio: "1/1",
                                                    objectFit: isPrimaryImage ? 'contain' : 'cover',
                                                    cursor: isPrimaryImage ? (isDragging ? 'grabbing' : 'grab') : 'default',
                                                }}
                                            />
                                        </>
                                    )
                                ) : (
                                    <Box
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#999'
                                        }}
                                    >
                                        <Typography variant="body2" gutterBottom>
                                            No Image Selected
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            onClick={triggerFileInput}
                                            size="small"
                                        >
                                            Upload Image
                                        </Button>
                                    </Box>
                                )}
                            </Box>

                            {/* Controls */}
                            {selectedImage && (
                                <Box sx={{ mt: 1 }}>
                                    {isCropping ? (
                                        <Grid container spacing={1} alignItems="center">
                                            <Grid item xs={12}>
                                                <Typography variant="body2" gutterBottom>
                                                    Zoom: {(transformData?.scale || 1).toFixed(1)}x
                                                </Typography>
                                                <Slider
                                                    value={transformData?.scale || 1}
                                                    min={1}
                                                    max={3}
                                                    step={0.1}
                                                    onChange={(e, value) => updateTransformData({ ...transformData, scale: value })}
                                                    size="small"
                                                />
                                            </Grid>
                                            <Grid item>
                                                <Button
                                                    onClick={() => {
                                                        setIsCropping(false);
                                                        if (isPrimaryImage) {
                                                            updateTransformData({ scale: 1, x: 0, y: 0 });
                                                        }
                                                    }}
                                                    variant="outlined"
                                                    size="small"
                                                >
                                                    Cancel Crop
                                                </Button>
                                            </Grid>
                                            <Grid item>
                                                <Button
                                                    variant="contained"
                                                    startIcon={<Check />}
                                                    onClick={handleCrop}
                                                    size="small"
                                                >
                                                    Apply Crop
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    ) : (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {/* Zoom Controls - Only for primary image */}
                                            {isPrimaryImage && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Typography variant="body2" sx={{ minWidth: 60 }}>
                                                        Zoom: {(transformData?.scale || 1).toFixed(1)}x
                                                    </Typography>
                                                    <IconButton
                                                        onClick={handleZoomOut}
                                                        size="small"
                                                        disabled={(transformData?.scale || 1) <= 0.1}
                                                    >
                                                        <ZoomOut fontSize="small" />
                                                    </IconButton>
                                                    <Slider
                                                        value={transformData?.scale || 1}
                                                        min={0.1}
                                                        max={5}
                                                        step={0.1}
                                                        onChange={(e, value) => {
                                                            updateTransformData({...transformData, scale: value});
                                                        }}
                                                        sx={{ flex: 1, mx: 1 }}
                                                        size="small"
                                                    />
                                                    <IconButton
                                                        onClick={handleZoomIn}
                                                        size="small"
                                                        disabled={(transformData?.scale || 1) >= 5}
                                                    >
                                                        <ZoomIn fontSize="small" />
                                                    </IconButton>
                                                    <Button
                                                        onClick={handleResetZoom}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ minWidth: 'auto', px: 1 }}
                                                    >
                                                        Reset
                                                    </Button>
                                                </Box>
                                            )}

                                            {/* Action Buttons */}
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<Crop />}
                                                    onClick={() => setIsCropping(true)}
                                                    size="small"
                                                >
                                                    Crop
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<DeleteOutline />}
                                                    onClick={() => handleDeleteImage(selectedImageIndex)}
                                                    color="error"
                                                    size="small"
                                                >
                                                    Delete
                                                </Button>
                                            </Box>

                                            {/* Info message for non-primary images */}
                                            {!isPrimaryImage && (
                                                <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                                                    Only the primary image (first image) can be zoomed and dragged. All images can be cropped.
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Grid>

                        {/* Right Sidebar - Alt Text and Actions */}
                        <Grid item xs={12} md={3}>
                            {selectedImage && !isCropping && (
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Alt Text
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary" gutterBottom>
                                        Alt text helps with accessibility and SEO.
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        size="small"
                                        value={tempAltText[selectedImageIndex] || ''}
                                        onChange={(e) => {
                                            const newAltText = [...tempAltText];
                                            newAltText[selectedImageIndex] = e.target.value.slice(0, 124);
                                            setTempAltText(newAltText);
                                        }}
                                        placeholder="Describe your image in detail..."
                                        helperText={`${tempAltText[selectedImageIndex]?.length || 0}/124 characters`}
                                    />
                                </Box>
                            )}
                        </Grid>
                    </Grid>

                    {/* Footer Actions */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 1,
                        mt: 2,
                        pt: 2,
                        // borderTop: '1px solid #e0e0e0'
                    }}>
                        <Button
                            variant="outlined"
                            onClick={() => setDiscardModalOpen(true)}
                            size="small"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleApplyChanges}
                            disabled={!canApply}
                            size="small"
                        >
                            Apply Changes
                        </Button>
                    </Box>
                </Box>
            </Dialog>

            {/* Discard Changes Modal */}
            <Modal
                open={discardModalOpen}
                onClose={() => setDiscardModalOpen(false)}
            >
                <Box sx={modalStyle}>
                    <Typography variant="h6" gutterBottom>
                        Discard Changes?
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        You will lose all unsaved changes if you continue.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                        <Button
                            variant="outlined"
                            onClick={() => setDiscardModalOpen(false)}
                            size="small"
                        >
                            Keep Editing
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleDiscard}
                            color="error"
                            size="small"
                        >
                            Discard
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

export default CropImage;
