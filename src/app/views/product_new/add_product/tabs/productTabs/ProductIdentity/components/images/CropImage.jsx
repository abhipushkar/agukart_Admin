import React, { useState, useRef, useCallback, useEffect } from "react";
import {
    Dialog, Box, Button, Typography,
    IconButton, Grid, Modal, TextField,
    Slider
} from "@mui/material";
import {
    HighlightOff,
    Crop,
    Check,
    DeleteOutline,
    DragIndicator,
    Close,
    RotateLeft,
    RotateRight
} from "@mui/icons-material";
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './cropUtils';
import { useProductFormStore } from "../../../../../../states/useAddProducts";
// import { image } from "html2canvas/dist/types/css/types/image";
const stripHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
};
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

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [discardModalOpen, setDiscardModalOpen] = useState(false);
    const [tempImages, setTempImages] = useState([]);
    const [tempAltText, setTempAltText] = useState([]);
    // Drag and drop state
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [draggedIndex, setDraggedIndex] = useState(null);

    const inputFileRef = useRef(null);
    const imageContainerRef = useRef(null);
    // Initialize temp state when modal opens
    useEffect(() => {
        if (!openEdit) return;
        setTempImages([...formData.images]);

        setTempAltText(
            altText.map((text) =>
                stripHtml(text || "")
            )
        );

        setSelectedImageIndex(0);

        const transform =
            formData.transformData || {};

        setCrop(
            transform.crop || {
                x: 0,
                y: 0
            }
        );

        setZoom(
            transform.zoom || 1
        );

        setRotation(
            transform.rotation || 0
        );

        setCroppedAreaPixels(
            transform.croppedAreaPixels || null
        );

    }, [
        openEdit
    ]);

    const selectedImage = tempImages[selectedImageIndex];
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        if (tempImages.length + files.length > 15) {
            handleOpen("error", "Maximum 15 images allowed");
            return;
        }
        const newImages = files.map((file, index) => {
            const objectUrl = URL.createObjectURL(file);
            return ({
                src: objectUrl,
                originalSrc: objectUrl,
                file: file,
                edited_image: null,
                _id: `temp-${Date.now()}-${index}`,
                isPrimary: tempImages.length === 0 && index === 0,
                sortOrder: tempImages.length + index + 1
            })
        });
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
        if (index === 0) {
            setZoom(1);
            setRotation(0);
            setCrop({ x: 0, y: 0 });
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
        if (draggedIndex === 0 || targetIndex === 0) {
            setZoom(1);
            setRotation(0);
            setCrop({ x: 0, y: 0 });
        }
        const updatedImages = [...tempImages];
        const updatedAltText = [...tempAltText];
        const [movedImage] = updatedImages.splice(draggedIndex, 1);
        const [movedAltText] = updatedAltText.splice(draggedIndex, 1);
        updatedImages.splice(targetIndex, 0, movedImage);
        updatedAltText.splice(targetIndex, 0, movedAltText);
        const reorderedImages = updatedImages.map((img, idx) => ({
            ...img,
            sortOrder: idx + 1,
            isPrimary: idx === 0
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
        setDragOverIndex(null);
        setDraggedIndex(null);
    };

    const handleApplyChanges = async () => {
        try {

            let updatedImages = [...tempImages];

            const safeCrop = croppedAreaPixels
                ? (() => {

                    const size = Math.round(
                        Math.min(
                            croppedAreaPixels.width,
                            croppedAreaPixels.height
                        )
                    );

                    return {
                        x: Math.round(croppedAreaPixels.x),
                        y: Math.round(croppedAreaPixels.y),
                        width: size,
                        height: size
                    };

                })()
                : null;

            if (
                selectedImage &&
                safeCrop
            ) {

                const editedBlob = await getCroppedImg(
                    updatedImages[0].originalSrc ||
                    updatedImages[0].src,
                    safeCrop,
                    rotation
                );

                const editedFile = new File(
                    [editedBlob],
                    "edited-image.jpg",
                    {
                        type: "image/jpeg"
                    }
                );

                const previewUrl =
                    URL.createObjectURL(editedBlob);

                updatedImages[0] = {
                    ...updatedImages[0],

                    edited_image: editedFile,

                    previewSrc: previewUrl
                };
            }

            setFormData({
                images: updatedImages,

                transformData: {
                    crop,
                    zoom,
                    rotation,
                    croppedAreaPixels: safeCrop
                }
            });

            handleEditClose();

        } catch (error) {

            console.error(error);

            handleOpen(
                "error",
                "Failed to apply changes"
            );
        }
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
            <Dialog
                open={openEdit}
                onClose={() => setDiscardModalOpen(true)}
                maxWidth="md"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        height: '88vh',
                        maxHeight: '640px',
                        margin: 2,
                        width: 'calc(100% - 32px)',
                        maxWidth: '1000px',
                    }
                }}
            >
                <Box sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                            Edit Images
                        </Typography>
                        <IconButton onClick={() => setDiscardModalOpen(true)} size="small">
                            <HighlightOff />
                        </IconButton>
                    </Box>
                    <Grid container spacing={1} sx={{ flex: 1, minHeight: 0 }}>
                        <Grid item xs={12} md={4}>
                            <Box sx={{
                                maxHeight: '520px',
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
                                        <Grid item xs={4} key={image._id || index}>
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
                                                {index === 0 && (
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 2,
                                                            right: 24,
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
                        <Grid item xs={12} md={5} sx={{ mt: -2 }}>
                            <Box
                                ref={imageContainerRef}
                                sx={{
                                    width: '100%',
                                    maxWidth: '400px',
                                    height: '400px',
                                    aspectRatio: '1',
                                    position: 'relative',
                                    border: '2px solid gray',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    bgcolor: '#f5f5f5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {selectedImage ? (
                                    <Cropper
                                        key={`${openEdit}-${selectedImageIndex}-${selectedImage?.originalSrc}`}
                                        image={selectedImage.originalSrc || selectedImage.src}
                                        crop={crop}
                                        zoom={zoom}
                                        rotation={rotation}
                                        aspect={1}
                                        onCropChange={setCrop}
                                        onZoomChange={setZoom}
                                        onRotationChange={setRotation}
                                        onCropComplete={onCropComplete}
                                        crossOrigin="anonymous"
                                    />
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
                                    {
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {/* ✅ ZOOM SLIDER — sirf primary image pe */}

                                            {selectedImageIndex === 0 && (
                                                <>
                                                    {/* Rotate Controls */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Typography variant="body2" sx={{ minWidth: 70 }}>
                                                            Rotate: {rotation || 0}°
                                                        </Typography>

                                                        <IconButton
                                                            size="small"
                                                            onClick={() =>
                                                                setRotation(prev => (prev - 90 + 360) % 360)
                                                            }
                                                        >
                                                            <RotateLeft />
                                                        </IconButton>

                                                        <Slider
                                                            value={rotation || 0}
                                                            min={0}
                                                            max={360}
                                                            step={1}
                                                            onChange={(e, value) =>
                                                                setRotation(value)
                                                            }
                                                            sx={{ flex: 1, mx: 1 }}
                                                            size="small"
                                                        />

                                                        <IconButton
                                                            size="small"
                                                            onClick={() =>
                                                                setRotation(prev => (prev + 90) % 360)
                                                            }
                                                        >
                                                            <RotateRight />
                                                        </IconButton>
                                                    </Box>

                                                    {/* Zoom Controls */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Typography variant="body2" sx={{ minWidth: 70 }}>
                                                            Zoom: {zoom.toFixed(1)}x
                                                        </Typography>

                                                        <Slider
                                                            value={zoom}
                                                            min={1}
                                                            max={5}
                                                            step={0.1}
                                                            onChange={(e, value) =>
                                                                setZoom(value)
                                                            }
                                                            sx={{ flex: 1, mx: 1 }}
                                                            size="small"
                                                        />

                                                        <Button
                                                            onClick={() => {
                                                                setZoom(1);
                                                                setRotation(0);
                                                                setCrop({ x: 0, y: 0 });
                                                            }}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ minWidth: 'auto', px: 1 }}
                                                        >
                                                            Reset
                                                        </Button>
                                                    </Box>
                                                </>
                                            )}
                                            {/* Action Buttons */}

                                        </Box>
                                    }
                                </Box>
                            )}
                        </Grid>
                        {/* Right Sidebar - Alt Text and Actions */}
                        <Grid item xs={12} md={3} sx={{ mt: -3 }}>
                            {selectedImage && (
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
                                        rows={5}
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
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 2.0,
                                            mt: 22
                                        }}
                                    >
                                        {/* <Button
                                            variant="outlined"
                                            startIcon={<Crop />}
                                            size="small"
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                width: '190px',
                                                alignSelf: 'center'
                                            }}
                                        >
                                            Crop
                                        </Button> */}

                                        <Button
                                            variant="outlined"
                                            onClick={() => setDiscardModalOpen(true)}
                                            size="small"
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                width: '190px',
                                                alignSelf: 'center'
                                            }}
                                        >
                                            Cancel
                                        </Button>

                                        <Button
                                            variant="contained"
                                            onClick={handleApplyChanges}
                                            disabled={!canApply}
                                            size="small"
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                width: '190px',
                                                alignSelf: 'center'
                                            }}
                                        >
                                            Apply Changes
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
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