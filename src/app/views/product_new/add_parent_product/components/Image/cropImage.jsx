// components/ParentProduct/Image/CropImage.jsx
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
    Check,
    DeleteOutline,
    DragIndicator,
    Close
} from "@mui/icons-material";
import { useParentProductStore } from "../../../states/parentProductStore";

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
        images,
        setImages
    } = useParentProductStore();

    const transformData = formData.transformData || { scale: 1, x: 0, y: 0 };

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [discardModalOpen, setDiscardModalOpen] = useState(false);
    const [tempImages, setTempImages] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const imageContainerRef = useRef(null);

    // Check if selected image is primary (only one image for parent product)
    const isPrimaryImage = true; // Since parent product only has one image

    // Update transformData in formData
    const updateTransformData = (newTransformData) => {
        setFormData({ transformData: newTransformData });
    };

    // Initialize temp state when modal opens
    useEffect(() => {
        if (openEdit) {
            setTempImages([...images]);
            setSelectedImageIndex(0);
        }
    }, [openEdit, images]);

    const selectedImage = tempImages[selectedImageIndex];

    // Pan and zoom functionality
    const handleMouseDown = (e) => {
        if (!isPrimaryImage) return;
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - (transformData?.x || 0),
            y: e.clientY - (transformData?.y || 0)
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !isPrimaryImage) return;

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
        if (!isPrimaryImage) return;
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

    const handleDeleteImage = (index) => {
        const updatedImages = tempImages.filter((_, i) => i !== index);
        setTempImages(updatedImages);

        if (updatedImages.length === 0) {
            updateTransformData({ scale: 1, x: 0, y: 0 });
        }
    };

    const handleApplyChanges = () => {
        setImages(tempImages);
        handleEditClose();
    };

    const handleDiscard = () => {
        setDiscardModalOpen(false);
        handleEditClose();
    };

    const canApply = tempImages.length > 0;

    return (
        <>
            {/* Main Edit Dialog */}
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
                            Edit Parent Product Image
                        </Typography>
                        <IconButton onClick={() => setDiscardModalOpen(true)} size="small">
                            <HighlightOff />
                        </IconButton>
                    </Box>

                    <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
                        {/* Thumbnail Sidebar */}
                        <Grid item xs={12} md={4}>
                            <Box sx={{
                                maxHeight: '300px',
                                overflow: 'auto',
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                p: 1
                            }}>
                                <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
                                    Parent Product Image
                                </Typography>
                                <Grid container spacing={0.5}>
                                    {tempImages.map((image, index) => (
                                        <Grid item xs={12} key={image._id || index}>
                                            <Box
                                                sx={{
                                                    border: selectedImageIndex === index ?
                                                        '2px solid #1976d2' : '1px solid #e0e0e0',
                                                    borderRadius: '6px',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    aspectRatio: '1',
                                                    transition: 'all 0.2s ease',
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

                                                {/* Remove Button */}
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
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 2,
                                                        left: 2,
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
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Grid>

                        {/* Main Image Area */}
                        <Grid item xs={12} md={8}>
                            <Box
                                ref={imageContainerRef}
                                sx={{
                                    height: '400px',
                                    position: 'relative',
                                    border: '2px solid gray',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    bgcolor: '#f5f5f5',
                                    cursor: isPrimaryImage ? (isDragging ? 'grabbing' : 'grab') : 'default'
                                }}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                onWheel={handleWheel}
                            >
                                {selectedImage ? (
                                    <img
                                        src={selectedImage.src}
                                        alt="Selected"
                                        style={{
                                            transform: `translate3d(${isPrimaryImage ? (transformData?.x || 0) : 0}px, ${isPrimaryImage ? (transformData?.y || 0) : 0}px, 0) scale(${isPrimaryImage ? (transformData?.scale || 1) : 1})`,
                                            transformOrigin: 'center center',
                                            transition: isDragging ? 'none' : 'transform 0.1s ease',
                                            maxWidth: '100%',
                                            maxHeight: '100%',
                                            objectFit: 'contain',
                                            cursor: isPrimaryImage ? (isDragging ? 'grabbing' : 'grab') : 'default',
                                        }}
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
                                    </Box>
                                )}
                            </Box>

                            {/* Controls */}
                            {selectedImage && (
                                <Box sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {/* Zoom Controls */}
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

                                        {/* Position Info */}
                                        <Typography variant="caption" color="textSecondary" sx={{ textAlign: 'center' }}>
                                            Position: X:{transformData?.x || 0}, Y:{transformData?.y || 0}
                                        </Typography>

                                        {/* Instructions */}
                                        <Typography variant="caption" color="textSecondary" sx={{ textAlign: 'center', fontStyle: 'italic' }}>
                                            Drag to pan • Scroll to zoom
                                        </Typography>
                                    </Box>
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
                        borderTop: '1px solid #e0e0e0'
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
