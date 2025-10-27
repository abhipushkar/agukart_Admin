import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Slider,
    Typography
} from "@mui/material";
import CropIcon from "@mui/icons-material/Crop";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import Cropper from 'react-easy-crop';
import { createBlobUrl, fetchImageAsBlob, getCroppedImg, revokeBlobUrl } from './cropUtil';

const ImageTooltip = ({
                          imageUrl,
                          originalImage,
                          editData,
                          editedImage,
                          onImageChange,
                          onImageRemove,
                          onImageEdit,
                          isEditable,
                          children,
                          combindex,
                          rowIndex,
                          imageType,
                          imageIndex
                      }) => {
    const [open, setOpen] = useState(false);
    const [cropDialogOpen, setCropDialogOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const hasValidImage = imageUrl && imageUrl !== "";

    useEffect(() => {
        if (editData) {
            const parsedEditData = typeof editData === "string" ? JSON.parse(editData) : editData;
            setZoom(parsedEditData?.scale || 1);
            setCrop({ x: parsedEditData?.x || 0, y: parsedEditData?.y || 0 });
            setRotation(0);
        }
    }, [editData]);

    const handleTooltipOpen = () => {
        if (!hasValidImage) return;
        setOpen(true);
    };

    const handleTooltipClose = () => {
        setOpen(false);
    };

    const handleEditStart = () => {
        setCropDialogOpen(true);
    };

    const handleCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleCropApply = async () => {
        let blobUrl = null;

        try {
            if (!croppedAreaPixels || !croppedAreaPixels.width || !croppedAreaPixels.height) {
                throw new Error('Invalid crop area');
            }

            let imageToCrop = originalImage;

            if (typeof originalImage === 'string' &&
                (originalImage.startsWith('http') || originalImage.startsWith('https'))) {
                try {
                    const blob = await fetchImageAsBlob(originalImage);
                    blobUrl = createBlobUrl(blob);
                    imageToCrop = blobUrl;
                } catch (fetchError) {
                    console.warn('Failed to fetch image via CORS, trying direct method:', fetchError);
                }
            }

            const croppedImage = await getCroppedImg(
                imageToCrop,
                croppedAreaPixels,
                rotation
            );

            if (!croppedImage || croppedImage.size === 0) {
                throw new Error('Cropped image is empty');
            }

            const editedFile = new File([croppedImage], `edited-${Date.now()}.jpg`, {
                type: 'image/jpeg'
            });

            const newEditData = {
                scale: zoom,
                x: crop.x,
                y: crop.y,
                rotation: rotation,
                croppedAreaPixels: croppedAreaPixels,
                timestamp: new Date().toISOString()
            };

            onImageEdit(editedFile, newEditData);
            setCropDialogOpen(false);
            setOpen(false);

        } catch (error) {
            console.error('Error cropping image:', error);
            if (error.message.includes('CORS') || error.message.includes('tainted')) {
                alert('Unable to edit this image due to security restrictions. Please download the image and upload it again, or contact the administrator to enable CORS on the image server.');
            } else if (error.message.includes('dimensions') || error.message.includes('Invalid crop')) {
                alert('Invalid crop area selected. Please try cropping again.');
            } else {
                alert('Failed to process the image. Please try again or use a different image.');
            }
        } finally {
            if (blobUrl) {
                revokeBlobUrl(blobUrl);
            }
        }
    };

    const handleCropCancel = () => {
        setCropDialogOpen(false);
        if (editData) {
            const parsedEditData = typeof editData === "string" ? JSON.parse(editData) : editData;
            setZoom(parsedEditData?.scale || 1);
            setCrop({ x: parsedEditData?.x || 0, y: parsedEditData?.y || 0 });
            setRotation(0);
        }
    };

    const getEditSummary = () => {
        if (!editedImage) return null;

        const summary = [];
        if (zoom !== 1) summary.push(`Zoom: ${zoom?.toFixed(1)}x`);
        if (rotation !== 0) summary.push(`Rotation: ${rotation}°`);
        if (crop?.x !== 0 || crop?.y !== 0) summary.push(`Position: (${Math.round(crop?.x)}, ${Math.round(crop?.y)})`);

        return summary.length > 0 ? summary.join(', ') : 'Custom crop applied';
    };

    const renderNormalControls = () => (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            {isEditable && (
                <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    onClick={handleEditStart}
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
                onClick={onImageRemove}
                sx={{ fontSize: '12px' }}
            >
                Remove
            </Button>
        </Box>
    );

    return (
        <>
            <Tooltip
                open={open && !cropDialogOpen}
                onClose={handleTooltipClose}
                onOpen={handleTooltipOpen}
                title={
                    <Box sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: 280
                    }}>
                        {editedImage && (
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
                            </Box>
                        )}

                        <Box
                            sx={{
                                width: 250,
                                height: 250,
                                overflow: 'hidden',
                                borderRadius: 1,
                                border: '2px solid',
                                borderColor: editedImage ? 'success.main' : 'grey.300',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'grey.100',
                                mb: 2
                            }}
                        >
                            <img
                                src={imageUrl}
                                alt="Preview"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                }}
                            />
                        </Box>

                        {editedImage && getEditSummary() && (
                            <Box
                                sx={{
                                    mb: 1,
                                    px: 1,
                                    py: 0.5,
                                    backgroundColor: 'info.light',
                                    color: 'white',
                                    borderRadius: 1,
                                    fontSize: '0.7rem',
                                    textAlign: 'center'
                                }}
                            >
                                {getEditSummary()}
                            </Box>
                        )}

                        {renderNormalControls()}
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
                {children}
            </Tooltip>

            <Dialog
                open={cropDialogOpen}
                onClose={handleCropCancel}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    Edit Image
                    {editedImage && (
                        <Box sx={{ fontSize: '0.9rem', color: 'text.secondary', mt: 0.5 }}>
                            Current edits: {getEditSummary()}
                        </Box>
                    )}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
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
                                    src={originalImage}
                                    alt="Original"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            </Box>
                        </Box>

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
                                    image={originalImage}
                                    crop={crop}
                                    zoom={zoom}
                                    rotation={rotation}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onRotationChange={setRotation}
                                    onCropComplete={handleCropComplete}
                                    crossOrigin="anonymous"
                                />
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Typography variant="body2" sx={{ minWidth: 80 }}>
                                Zoom: {zoom?.toFixed(1)}x
                            </Typography>
                            <IconButton onClick={() => setZoom(prev => Math.max(prev - 0.1, 1))}>
                                <ZoomOutIcon />
                            </IconButton>
                            <Slider
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                onChange={(e, newValue) => setZoom(newValue)}
                                sx={{ flex: 1 }}
                            />
                            <IconButton onClick={() => setZoom(prev => Math.min(prev + 0.1, 3))}>
                                <ZoomInIcon />
                            </IconButton>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" sx={{ minWidth: 80 }}>
                                Rotation: {rotation}°
                            </Typography>
                            <IconButton onClick={() => setRotation(prev => prev - 90)}>
                                <RotateLeftIcon />
                            </IconButton>
                            <Slider
                                value={rotation}
                                min={0}
                                max={360}
                                onChange={(e, newValue) => setRotation(newValue)}
                                sx={{ flex: 1 }}
                            />
                            <IconButton onClick={() => setRotation(prev => prev + 90)}>
                                <RotateRightIcon />
                            </IconButton>
                        </Box>

                        <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Position: X: {Math.round(crop.x)}, Y: {Math.round(crop.y)}
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCropCancel} color="error" startIcon={<CloseIcon />}>
                        Cancel
                    </Button>
                    <Button onClick={handleCropApply} color="success" startIcon={<CheckIcon />}>
                        Apply Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ImageTooltip;
