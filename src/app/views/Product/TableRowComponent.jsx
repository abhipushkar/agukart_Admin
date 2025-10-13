import React, { useState, useRef, useEffect } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import {Box, Button, Checkbox, styled, Switch, Tooltip, IconButton, Slider, Dialog, DialogActions, DialogContent, DialogTitle, Chip} from "@mui/material";
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
import CollectionsIcon from "@mui/icons-material/Collections";
import Cropper from 'react-easy-crop';
import {createBlobUrl, fetchImageAsBlob, getCroppedImg, revokeBlobUrl} from './cropUtil';
import Typography from "@mui/material/Typography";

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

// Draggable row component
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
    const handleDragStart = (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
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

    return (
        <TableRow
            {...props}
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={onDragEnd}
            sx={{
                cursor: isDragging ? 'grabbing' : 'grab',
                backgroundColor: isDragging
                    ? 'rgba(25, 118, 210, 0.08)'
                    : isDragOver
                        ? 'rgba(0, 0, 0, 0.04)'
                        : 'transparent',
                opacity: isDragging ? 0.7 : 1,
                transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.2s ease',
                boxShadow: isDragging ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
                position: 'relative',
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

const TableRowComponent = ({
                               comb,
                               handleCombChange,
                               handleToggle,
                               combindex,
                               formValues,
                               variationsData,
                               combinationError,
                               showAll,
                               handleImageUpload,
                               handleImageRemove,
                               setShowAll,
                               handleEditImage,
                               onRowReorder
                           }) => {
    const label = { inputProps: { "aria-label": "Switch demo" } };

    // Drag and drop state
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const handleSeeMore = () => {
        setShowAll((prev) => !prev);
    };

    const itemsToShow = showAll ? comb.combinations : comb.combinations.slice(0, 5);

    // Fixed Drag and drop handlers - SIMPLIFIED VERSION
    const handleDragStart = (e, index) => {
        console.log('Drag start:', index);
        setDraggingIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // Only update if we're dragging over a different row
        if (draggingIndex !== null && draggingIndex !== index) {
            console.log('Drag over index:', index);
            setDragOverIndex(index);
        }
    };

    const handleDragEnd = () => {
        console.log('Drag end');
        setDraggingIndex(null);
        setDragOverIndex(null);
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));

        console.log('Drop event - FINAL:', {
            sourceIndex,
            targetIndex, // This is the actual row index where drop occurred
            dragOverIndex // This should be the same as targetIndex
        });

        // Use targetIndex directly - this is the actual row where the drop happened
        if (sourceIndex !== targetIndex && onRowReorder) {
            console.log('Calling onRowReorder with:', {
                combindex,
                sourceIndex,
                targetIndex
            });
            onRowReorder(combindex, sourceIndex, targetIndex);
        }

        setDraggingIndex(null);
        setDragOverIndex(null);
    };

    // Handle drag handle events
    const handleDragHandleMouseDown = (e) => {
        e.stopPropagation();
    };

    const handleDragHandleTouchStart = (e) => {
        e.stopPropagation();
    };

    // New function to handle bulk image upload
    const handleBulkImageUpload = (combindex, rowIndex, event) => {
        const files = Array.from(event.target.files);

        if (files.length === 0) return;

        // Upload first 3 images to main_images[0], main_images[1], main_images[2]
        files.slice(0, 3).forEach((file, index) => {
            const imageKey = `main_images[${index}]`;
            handleImageUpload(combindex, rowIndex, imageKey, { target: { files: [file] } });
        });
    };

    const isImageEditable = (imageType, imageIndex, item) => {
        if (imageType === "preview_image") return true;
        if (imageType === "main_images" && imageIndex === 0) return true;
        return false;
    };

    const renderImageCell = (item, index, imageType, imageIndex = null, editData = null) => {
        let imageValue;
        let editedImageValue;

        if (imageIndex !== null) {
            imageValue = item.main_images && item.main_images[imageIndex];
            if (imageIndex === 0) {
                editedImageValue = item.edit_main_image;
            }
        } else {
            imageValue = item[imageType];
            if (imageType === "preview_image") {
                editedImageValue = item.edit_preview_image;
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

        const displayMini = createSafeObjectURL(imageValue) || (typeof imageValue === 'string' ? imageValue : null);

        const imageKey = imageIndex !== null ? `main_images[${imageIndex}]` : imageType;
        const isEditable = isImageEditable(imageType, imageIndex, item);

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
                            editData={editData}
                            originalImage={displayMini}
                            editedImage={shouldUseEditedImage ? editedImageValue : null}
                            onImageChange={(e) => handleImageUpload(combindex, index, imageKey, e)}
                            onImageRemove={() => handleImageRemove(combindex, index, imageKey)}
                            onImageEdit={isEditable ? (editedImage, editData) => handleEditImage(combindex, index, imageType, editedImage, imageIndex, editData) : null}
                            isEditable={isEditable}
                            combindex={combindex}
                            rowIndex={index}
                            imageType={imageType}
                            imageIndex={imageIndex}
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
                        </ImageTooltip>
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
                                onChange={(e) => handleImageUpload(combindex, index, imageKey, e)}
                                accept="image/*"
                            />
                        </Button>
                    )}
                </Box>
            </TableCell>
        );
    };

    // New function to render bulk upload cell
    const renderBulkUploadCell = (item, index) => {
        const hasMainImages = item.main_images && item.main_images.some(img => img && img !== "");
        const uploadedCount = item.main_images ? item.main_images.filter(img => img && img !== "").length : 0;

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
                            onChange={(e) => handleBulkImageUpload(combindex, index, e)}
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

    return (
        <>
            {itemsToShow?.map((item, index) => (
                <DraggableTableRow
                    key={`${combindex}-${index}-${item.value1}-${item.value2}`}
                    index={index}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    isDragging={draggingIndex === index}
                    isDragOver={dragOverIndex === index}
                >
                    <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IconButton
                                className="drag-handle"
                                size="small"
                                sx={{
                                    cursor: 'grab',
                                    '&:active': {
                                        cursor: 'grabbing',
                                    },
                                    touchAction: 'none'
                                }}
                                onMouseDown={handleDragHandleMouseDown}
                                onTouchStart={handleDragHandleTouchStart}
                                draggable={false} // Important: don't make the button itself draggable
                            >
                                <DragIndicatorIcon
                                    sx={{
                                        color: 'text.secondary',
                                        opacity: draggingIndex === index ? 1 : 0.6
                                    }}
                                />
                            </IconButton>
                        </Box>
                    </TableCell>
                    <TableCell align="center">
                        <Checkbox {...label} size="small" />
                    </TableCell>

                    {item?.value1 && <TableCell align="center">{item?.value1}</TableCell>}
                    {item?.value2 && <TableCell align="center">{item?.value2}</TableCell>}

                    {/* Bulk Upload Column */}
                    {renderBulkUploadCell(item, index)}

                    {/* Main Images */}
                    {renderImageCell(item, index, "main_images", 0, item.edit_main_image_data || null)}
                    {renderImageCell(item, index, "main_images", 1)}
                    {renderImageCell(item, index, "main_images", 2)}

                    {/* Preview Image */}
                    {renderImageCell(item, index, "preview_image", null, item.edit_preview_image_data || null)}

                    {/* Thumbnail */}
                    {renderImageCell(item, index, "thumbnail")}

                    {(variationsData.length >= 2 ? formValues?.prices === comb.variant_name : true) &&
                        formValues?.isCheckedPrice && (
                            <TableCell align="center">
                                <input
                                    type="text"
                                    name="price"
                                    value={item?.price || ""}
                                    onChange={(e) => handleCombChange(e, combindex, index)}
                                    style={{
                                        height: "30px",
                                        width: "100px",
                                        border: "2px solid green"
                                    }}
                                />
                                {combinationError[`Price-${comb.variant_name}-${index}`] && (
                                    <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                                        {combinationError[`Price-${comb.variant_name}-${index}`]}
                                    </div>
                                )}
                            </TableCell>
                        )}

                    {(variationsData.length >= 2 ? formValues?.quantities === comb.variant_name : true) &&
                        formValues?.isCheckedQuantity && (
                            <TableCell align="center">
                                <input
                                    type="text"
                                    name="qty"
                                    value={item?.qty || ""}
                                    onChange={(e) => handleCombChange(e, combindex, index)}
                                    style={{
                                        height: "30px",
                                        width: "100px",
                                        border: "2px solid green"
                                    }}
                                />
                                {combinationError[`Quantity-${comb.variant_name}-${index}`] && (
                                    <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                                        {combinationError[`Quantity-${comb.variant_name}-${index}`]}
                                    </div>
                                )}
                            </TableCell>
                        )}

                    <TableCell align="center">
                        <Switch
                            {...label}
                            checked={item.isVisible}
                            onChange={() => handleToggle(combindex, index)}
                        />
                    </TableCell>
                </DraggableTableRow>
            ))}

            {comb.combinations.length > 5 && (
                <TableRow>
                    <TableCell colSpan={11} align="center">
                        <button
                            onClick={handleSeeMore}
                            style={{
                                padding: "5px 10px",
                                background: "lightblue",
                                border: "none",
                                cursor: "pointer",
                                borderRadius: "4px"
                            }}
                        >
                            {showAll ? "See Less" : "See More"}
                        </button>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
};

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
    const [isEditing, setIsEditing] = useState(false);
    const [cropDialogOpen, setCropDialogOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const hasValidImage = imageUrl && imageUrl !== "";

    useEffect(() => {
        console.log("Edited Image in useEffect", editData, typeof editData);
        editData = typeof editData === "string" ? JSON.parse(editData) : editData;
        console.log("Edited Image in useEffect", editData, typeof editData);
        setZoom(editData?.scale);
            setCrop({x: editData?.x, y: editData?.y});
            setRotation(0);
    }, [])

    const handleTooltipOpen = () => {
        if (!hasValidImage) return;
        setOpen(true);
    };

    const handleTooltipClose = () => {
        setOpen(false);
        setIsEditing(false);
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
            // Validate crop area
            if (!croppedAreaPixels || !croppedAreaPixels.width || !croppedAreaPixels.height) {
                throw new Error('Invalid crop area');
            }

            let imageToCrop = originalImage;

            // If it's an external URL, fetch it as blob first to avoid CORS issues
            if (typeof originalImage === 'string' &&
                (originalImage.startsWith('http') || originalImage.startsWith('https'))) {

                try {
                    const blob = await fetchImageAsBlob(originalImage);
                    blobUrl = createBlobUrl(blob);
                    imageToCrop = blobUrl;
                } catch (fetchError) {
                    console.warn('Failed to fetch image via CORS, trying direct method:', fetchError);
                    // Continue with original URL and hope CORS works
                }
            }

            const croppedImage = await getCroppedImg(
                imageToCrop,
                croppedAreaPixels,
                rotation
            );

            // Validate the cropped image
            if (!croppedImage || croppedImage.size === 0) {
                throw new Error('Cropped image is empty');
            }

            const editedFile = new File([croppedImage], `edited-${Date.now()}.jpg`, {
                type: 'image/jpeg'
            });

            editData = {
                scale: zoom,
                x: crop.x,
                y: crop.y,
                rotation: rotation,
                croppedAreaPixels: croppedAreaPixels,
                timestamp: new Date().toISOString()
            };

            onImageEdit(editedFile, editData);
            setCropDialogOpen(false);
            setOpen(false);

        } catch (error) {
            console.error('Error cropping image:', error);

            // Show user-friendly error message
            if (error.message.includes('CORS') || error.message.includes('tainted')) {
                alert('Unable to edit this image due to security restrictions. Please download the image and upload it again, or contact the administrator to enable CORS on the image server.');
            } else if (error.message.includes('dimensions') || error.message.includes('Invalid crop')) {
                alert('Invalid crop area selected. Please try cropping again.');
            } else {
                alert('Failed to process the image. Please try again or use a different image.');
            }
        } finally {
            // Clean up blob URL if we created one
            if (blobUrl) {
                revokeBlobUrl(blobUrl);
            }
        }
    };


    const handleCropCancel = () => {
        setCropDialogOpen(false);
        setZoom(editData?.scale || 1);
        setCrop({x: editData?.x || 0, y: editData?.y || 0});
        setRotation(0);
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

    // Function to calculate visual differences between original and edited
    const getEditSummary = () => {
        console.log("Edited Image", editData);
        if (!editedImage) return null;

        const summary = [];
        if (zoom !== 1) summary.push(`Zoom: ${zoom?.toFixed(1)}x`);
        if (rotation !== 0) summary.push(`Rotation: ${rotation}°`);
        if (crop?.x !== 0 || crop?.y !== 0) summary.push(`Position: (${Math.round(crop?.x)}, ${Math.round(crop?.y)})`);

        return summary.length > 0 ? summary.join(', ') : 'Custom crop applied';
    };

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

            {/* Enhanced Crop Dialog */}
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

                    {/* Controls */}
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

export default TableRowComponent;
