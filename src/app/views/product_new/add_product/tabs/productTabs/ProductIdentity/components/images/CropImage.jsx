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
    DeleteOutline
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

        // Update sort orders
        updatedImages.forEach((img, idx) => {
            if (img.file) {
                img.file.sortOrder = idx + 1;
            } else {
                img.sortOrder = idx + 1;
            }
            img.isPrimary = idx === 0;
        });

        setTempImages(updatedImages);
        setTempAltText(updatedAltText);

        // Adjust selected index if needed
        if (selectedImageIndex >= updatedImages.length) {
            setSelectedImageIndex(Math.max(0, updatedImages.length - 1));
        }

        // If primary image was deleted, reset transform data
        if (index === 0) {
            updateTransformData({ scale: 1, x: 0, y: 0 });
        }
    };

    const handleMoveImage = (fromIndex, toIndex) => {
        const updatedImages = [...tempImages];
        const updatedAltText = [...tempAltText];

        const [movedImage] = updatedImages.splice(fromIndex, 1);
        const [movedAltText] = updatedAltText.splice(fromIndex, 1);

        updatedImages.splice(toIndex, 0, movedImage);
        updatedAltText.splice(toIndex, 0, movedAltText);

        // Update sort orders and primary status
        updatedImages.forEach((img, idx) => {
            if (img.file) {
                img.file.sortOrder = idx + 1;
            } else {
                img.sortOrder = idx + 1;
            }
            img.isPrimary = idx === 0;
        });

        setTempImages(updatedImages);
        setTempAltText(updatedAltText);

        // Update selected index if it moved
        if (selectedImageIndex === fromIndex) {
            setSelectedImageIndex(toIndex);
        } else if (
            selectedImageIndex > fromIndex &&
            selectedImageIndex <= toIndex
        ) {
            setSelectedImageIndex(selectedImageIndex - 1);
        } else if (
            selectedImageIndex < fromIndex &&
            selectedImageIndex >= toIndex
        ) {
            setSelectedImageIndex(selectedImageIndex + 1);
        }

        // If primary image changed, reset transform data
        if (fromIndex === 0 || toIndex === 0) {
            updateTransformData({ scale: 1, x: 0, y: 0 });
        }
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
                maxWidth="lg"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        height: '90vh',
                        maxHeight: '900px'
                    }
                }}
            >
                <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" fontWeight="bold">
                            Edit Images
                        </Typography>
                        <IconButton onClick={() => setDiscardModalOpen(true)}>
                            <HighlightOff />
                        </IconButton>
                    </Box>

                    <Grid container spacing={3} sx={{ flex: 1 }}>
                        {/* Thumbnail Sidebar */}
                        <Grid item xs={12} md={3}>
                            <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
                                <Grid container spacing={1}>
                                    {tempImages.map((image, index) => (
                                        <Grid item xs={4} key={image._id || index}>
                                            <Box
                                                sx={{
                                                    border: selectedImageIndex === index ?
                                                        '2px solid #1976d2' : '1px solid #e0e0e0',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    aspectRatio: '1'
                                                }}
                                                onClick={() => {
                                                    setSelectedImageIndex(index);
                                                    // if (index === 0) {
                                                    //     updateTransformData({ scale: 1, x: 0, y: 0 });
                                                    // }
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
                                                {index === 0 && (
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 4,
                                                            left: 4,
                                                            background: '#1976d2',
                                                            color: 'white',
                                                            fontSize: '10px',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px'
                                                        }}
                                                    >
                                                        Primary
                                                    </Box>
                                                )}
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Add Image Button */}
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={triggerFileInput}
                                    sx={{ mt: 2 }}
                                    disabled={tempImages.length >= 15}
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
                        <Grid item xs={12} md={6}>
                            <Box
                                ref={imageContainerRef}
                                sx={{
                                    height: '500px',
                                    aspectRatio: "1/1",
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
                                            {/* Container for image with blur mask */}
                                            <Box
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden',
                                                    position: 'relative',
                                                    // This creates the blur mask - only overflow gets blurred
                                                    '&::before': showBlurOverlay ? {
                                                        content: '""',
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        backdropFilter: 'blur(8px)',
                                                        maskImage: `linear-gradient(black, black), 
                                                                   linear-gradient(black, black)`,
                                                        maskComposite: 'exclude',
                                                        maskClip: 'content-box, padding-box',
                                                        maskOrigin: 'content-box, padding-box',
                                                        maskPosition: '0 0, 0 0',
                                                        maskRepeat: 'no-repeat, no-repeat',
                                                        maskSize: '100% 100%, 100% 100%',
                                                        zIndex: 1,
                                                        pointerEvents: 'none'
                                                    } : {}
                                                }}
                                            >
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
                                                        objectFit: isPrimaryImage ? 'contain' : 'cover',
                                                        cursor: isPrimaryImage ? (isDragging ? 'grabbing' : 'grab') : 'default',
                                                        // Create a clipping area for the image
                                                        clipPath: showBlurOverlay ? 'inset(0 0 0 0)' : 'none',
                                                        filter: showBlurOverlay ? 'none' : 'none'
                                                    }}
                                                />
                                            </Box>

                                            {/* Alternative approach using pseudo-elements for blur overlay */}
                                            {showBlurOverlay && isPrimaryImage && (
                                                <>
                                                    {/* Top blur overlay */}
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            right: 0,
                                                            height: '50px',
                                                            backdropFilter: 'blur(4px)',
                                                            zIndex: 2,
                                                            pointerEvents: 'none',
                                                            background: 'rgba(255,255,255,0.3)'
                                                        }}
                                                    />
                                                    {/* Bottom blur overlay */}
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            bottom: 0,
                                                            left: 0,
                                                            right: 0,
                                                            height: '50px',
                                                            backdropFilter: 'blur(4px)',
                                                            zIndex: 2,
                                                            pointerEvents: 'none',
                                                            background: 'rgba(255,255,255,0.3)'
                                                        }}
                                                    />
                                                    {/* Left blur overlay */}
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            bottom: 0,
                                                            width: '50px',
                                                            backdropFilter: 'blur(4px)',
                                                            zIndex: 2,
                                                            pointerEvents: 'none',
                                                            background: 'rgba(255,255,255,0.3)'
                                                        }}
                                                    />
                                                    {/* Right blur overlay */}
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            right: 0,
                                                            bottom: 0,
                                                            width: '50px',
                                                            backdropFilter: 'blur(4px)',
                                                            zIndex: 2,
                                                            pointerEvents: 'none',
                                                            background: 'rgba(255,255,255,0.3)'
                                                        }}
                                                    />
                                                </>
                                            )}
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
                                        <Typography variant="h6" gutterBottom>
                                            No Image Selected
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            onClick={triggerFileInput}
                                        >
                                            Upload Image
                                        </Button>
                                    </Box>
                                )}
                            </Box>

                            {/* Controls */}
                            {selectedImage && (
                                <Box sx={{ mt: 2 }}>
                                    {isCropping ? (
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={12}>
                                                <Typography gutterBottom>
                                                    Zoom: {(transformData?.scale || 1).toFixed(1)}x
                                                </Typography>
                                                <Slider
                                                    value={transformData?.scale || 1}
                                                    min={1}
                                                    max={3}
                                                    step={0.1}
                                                    onChange={(e, value) => updateTransformData({ ...transformData, scale: value })}
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
                                                >
                                                    Cancel Crop
                                                </Button>
                                            </Grid>
                                            <Grid item>
                                                <Button
                                                    variant="contained"
                                                    startIcon={<Check />}
                                                    onClick={handleCrop}
                                                >
                                                    Apply Crop
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    ) : (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {/* Zoom Controls - Only for primary image */}
                                            {isPrimaryImage && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body2" sx={{ minWidth: 80 }}>
                                                        Zoom: {(transformData?.scale || 1).toFixed(1)}x
                                                    </Typography>
                                                    <IconButton
                                                        onClick={handleZoomOut}
                                                        size="small"
                                                        disabled={(transformData?.scale || 1) <= 0.1}
                                                    >
                                                        <ZoomOut />
                                                    </IconButton>
                                                    <Slider
                                                        value={transformData?.scale || 1}
                                                        min={0.1}
                                                        max={5}
                                                        step={0.1}
                                                        onChange={(e, value) => {
                                                            updateTransformData({...transformData, scale: value});
                                                        }}
                                                        sx={{ flex: 1, mx: 2 }}
                                                    />
                                                    <IconButton
                                                        onClick={handleZoomIn}
                                                        size="small"
                                                        disabled={(transformData?.scale || 1) >= 5}
                                                    >
                                                        <ZoomIn />
                                                    </IconButton>
                                                    <Button
                                                        onClick={handleResetZoom}
                                                        size="small"
                                                        variant="outlined"
                                                    >
                                                        Reset
                                                    </Button>
                                                </Box>
                                            )}

                                            {/* Action Buttons */}
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<Crop />}
                                                    onClick={() => setIsCropping(true)}
                                                >
                                                    Crop
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<DeleteOutline />}
                                                    onClick={() => handleDeleteImage(selectedImageIndex)}
                                                    color="error"
                                                >
                                                    Delete
                                                </Button>
                                            </Box>

                                            {/* Info message for non-primary images */}
                                            {!isPrimaryImage && (
                                                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
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
                                    <Typography variant="h6" gutterBottom>
                                        Alt Text
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        Alt text helps with accessibility and SEO.
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
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
                        gap: 2,
                        mt: 3,
                        pt: 2,
                        borderTop: '1px solid #e0e0e0'
                    }}>
                        <Button
                            variant="outlined"
                            onClick={() => setDiscardModalOpen(true)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleApplyChanges}
                            disabled={!canApply}
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
                        >
                            Keep Editing
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleDiscard}
                            color="error"
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
