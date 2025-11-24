import React, { useState } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { Box, Button, IconButton } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useProductFormStore } from "../../../../../states/useAddProducts";
import ImageCell, { BulkUploadCell } from "./imageComponents/ImageCell";

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
        e.stopPropagation(); // Important: stop propagation
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
        onDragStart(e, index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Important: stop propagation
        e.dataTransfer.dropEffect = 'move';
        onDragOver(e, index);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Important: stop propagation
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

const VariationTableRow = ({
    variant,
    variantIndex,
    visibleColumns,
    onRowReorder,
    isSynced
}) => {
    const {
        handleImageUpload,
        handleImageRemove,
        handleEditImage,
        showAll,
        setShowAll,
    } = useProductFormStore();

    const [draggingIndex, setDraggingIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const handleDragStart = (e, index) => {
        console.log(`Drag Start: variantIndex=${variantIndex}, index=${index}`);
        setDraggingIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggingIndex !== null && draggingIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDragEnd = () => {
        console.log(`Drag End: variantIndex=${variantIndex}`);
        setDraggingIndex(null);
        setDragOverIndex(null);
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();

        // Get the source index from the drag data
        const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));

        console.log(`Row Drop: variantIndex=${variantIndex}, sourceIndex=${sourceIndex}, targetIndex=${targetIndex}`);

        // Validate indices and ensure they are different
        if (sourceIndex !== targetIndex &&
            !isNaN(sourceIndex) &&
            !isNaN(targetIndex) &&
            sourceIndex >= 0 &&
            targetIndex >= 0 &&
            sourceIndex < variant.variant_attributes.length &&
            targetIndex < variant.variant_attributes.length &&
            onRowReorder) {

            console.log(`Calling onRowReorder with: variantIndex=${variantIndex}, sourceIndex=${sourceIndex}, targetIndex=${targetIndex}`);

            // Call the reorder function passed from parent (handleProductVariantReorder)
            onRowReorder(variantIndex, sourceIndex, targetIndex);
        } else {
            console.log('Drop validation failed:', {
                sourceIndex,
                targetIndex,
                hasOnRowReorder: !!onRowReorder,
                areDifferent: sourceIndex !== targetIndex,
                areValid: !isNaN(sourceIndex) && !isNaN(targetIndex),
                arePositive: sourceIndex >= 0 && targetIndex >= 0,
                withinBounds: sourceIndex < variant.variant_attributes.length && targetIndex < variant.variant_attributes.length
            });
        }

        setDraggingIndex(null);
        setDragOverIndex(null);
    };

    const handleSeeMore = () => {
        setShowAll(!showAll);
    };

    // Handle bulk image upload for product_variants
    const handleBulkImageUpload = (variantIndex, attributeIndex, event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        // Upload first 3 images to main_images[0], main_images[1], main_images[2]
        files.slice(0, 3).forEach((file, index) => {
            const imageKey = `main_images[${index}]`;
            handleImageUpload(variantIndex, attributeIndex, imageKey, { target: { files: [file] } });
        });
    };

    // Check if image is editable
    const isImageEditable = (imageType, imageIndex) => {
        if (imageType === "preview_image") return true;
        if (imageType === "main_images" && imageIndex === 0) return true;
        return false;
    };

    // Get items to show (for pagination if needed)
    const itemsToShow = showAll ? variant.variant_attributes || [] : (variant.variant_attributes || []).slice(0, 5);

    // Calculate total number of columns for colspan
    const getTotalVisibleColumns = () => {
        let count = 0;
        if (visibleColumns.drag) count++;
        if (visibleColumns.attribute) count++;
        if (visibleColumns.multipleUpload) count++;
        if (visibleColumns.mainImage1) count++;
        if (visibleColumns.mainImage2) count++;
        if (visibleColumns.mainImage3) count++;
        if (visibleColumns.preview) count++;
        if (visibleColumns.thumbnail) count++;
        return count;
    };

    return (
        <>
            {itemsToShow?.map((attribute, attributeIndex) => (
                <DraggableTableRow
                    key={`${variantIndex}-${attributeIndex}-${attribute.attribute}`}
                    index={attributeIndex}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    isDragging={draggingIndex === attributeIndex}
                    isDragOver={dragOverIndex === attributeIndex}
                >
                    {/* Drag Handle Column */}
                    {visibleColumns.drag && (
                        <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IconButton
                                    className="drag-handle"
                                    size="small"
                                    sx={{
                                        cursor: 'grab',
                                        '&:active': {
                                            cursor: 'grabbing',
                                        }
                                    }}
                                    // Add drag handlers to the icon button as well
                                    draggable
                                    onDragStart={(e) => {
                                        e.stopPropagation();
                                        handleDragStart(e, attributeIndex);
                                    }}
                                >
                                    <DragIndicatorIcon />
                                </IconButton>
                            </Box>
                        </TableCell>
                    )}

                    {/* Attribute Column */}
                    {visibleColumns.attribute && (
                        <TableCell align="center">{attribute.attribute}</TableCell>
                    )}

                    {/* Bulk Upload Column */}
                    {visibleColumns.multipleUpload && (
                        <TableCell align="center">
                            <BulkUploadCell
                                item={attribute}
                                index={attributeIndex}
                                combindex={variantIndex}
                                onBulkImageUpload={handleBulkImageUpload}
                            />
                        </TableCell>
                    )}

                    {/* Main Image 1 Column */}
                    {visibleColumns.mainImage1 && (
                        <TableCell align="center">
                            <ImageCell
                                item={attribute}
                                index={attributeIndex}
                                imageType="main_images"
                                imageIndex={0}
                                editData={attribute.edit_main_image_data || null}
                                combindex={variantIndex}
                                onImageUpload={handleImageUpload}
                                onImageRemove={handleImageRemove}
                                onImageEdit={handleEditImage}
                                isEditable={isImageEditable("main_images", 0)}
                            />
                        </TableCell>
                    )}

                    {/* Main Image 2 Column */}
                    {visibleColumns.mainImage2 && (
                        <TableCell align="center">
                            <ImageCell
                                item={attribute}
                                index={attributeIndex}
                                imageType="main_images"
                                imageIndex={1}
                                combindex={variantIndex}
                                onImageUpload={handleImageUpload}
                                onImageRemove={handleImageRemove}
                                onImageEdit={handleEditImage}
                                isEditable={false}
                            />
                        </TableCell>
                    )}

                    {/* Main Image 3 Column */}
                    {visibleColumns.mainImage3 && (
                        <TableCell align="center">
                            <ImageCell
                                item={attribute}
                                index={attributeIndex}
                                imageType="main_images"
                                imageIndex={2}
                                combindex={variantIndex}
                                onImageUpload={handleImageUpload}
                                onImageRemove={handleImageRemove}
                                onImageEdit={handleEditImage}
                                isEditable={false}
                            />
                        </TableCell>
                    )}

                    {/* Preview Image Column */}
                    {visibleColumns.preview && (
                        <TableCell align="center">
                            <ImageCell
                                item={attribute}
                                index={attributeIndex}
                                imageType="preview_image"
                                editData={attribute.edit_preview_image_data || null}
                                combindex={variantIndex}
                                onImageUpload={handleImageUpload}
                                onImageRemove={handleImageRemove}
                                onImageEdit={handleEditImage}
                                isEditable={isImageEditable("preview_image", null)}
                            />
                        </TableCell>
                    )}

                    {/* Thumbnail Column */}
                    {visibleColumns.thumbnail && (
                        <TableCell align="center">
                            <ImageCell
                                item={attribute}
                                index={attributeIndex}
                                imageType="thumbnail"
                                combindex={variantIndex}
                                onImageUpload={handleImageUpload}
                                onImageRemove={handleImageRemove}
                                onImageEdit={handleEditImage}
                                isEditable={false}
                            />
                        </TableCell>
                    )}
                </DraggableTableRow>
            ))}
        </>
    );
};

export default VariationTableRow;
