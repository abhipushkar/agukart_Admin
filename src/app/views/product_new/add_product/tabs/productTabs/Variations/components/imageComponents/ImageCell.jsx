import React from "react";
import { Box, Button, Chip, styled } from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CollectionsIcon from "@mui/icons-material/Collections";
import ImageTooltip from "./ImageTooltip";

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

const ImageCell = ({
                       item,
                       index,
                       imageType,
                       imageIndex = null,
                       editData = null,
                       combindex,
                       onImageUpload,
                       onImageRemove,
                       onImageEdit,
                       isEditable = false
                   }) => {
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

    return (
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
                    onImageChange={(e) => onImageUpload(combindex, index, imageKey, e)}
                    onImageRemove={() => onImageRemove(combindex, index, imageKey)}
                    onImageEdit={isEditable ? (editedImage, editData) => onImageEdit(combindex, index, imageType, editedImage, imageIndex, editData) : null}
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
                    sx={{ mb: 1, aspectRatio: "1/1", width: "30px" }}
                >
                    <AddPhotoAlternateIcon />
                    <VisuallyHiddenInput
                        type="file"
                        onChange={(e) => onImageUpload(combindex, index, imageKey, e)}
                        accept="image/*"
                    />
                </Button>
            )}
        </Box>
    );
};

export const BulkUploadCell = ({ item, index, combindex, onBulkImageUpload }) => {
    const hasMainImages = item.main_images && item.main_images.some(img => img && img !== "");
    const uploadedCount = item.main_images ? item.main_images.filter(img => img && img !== "").length : 0;

    return (
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
                    onChange={(e) => onBulkImageUpload(combindex, index, e)}
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
    );
};

export default ImageCell;
