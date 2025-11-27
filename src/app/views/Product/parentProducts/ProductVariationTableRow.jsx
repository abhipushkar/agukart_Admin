import React, { useState } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { Box, IconButton } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ImageCell, { BulkUploadCell } from "app/views/product_new/add_product/tabs/productTabs/Variations/components/imageComponents/ImageCell";
// import ImageCell, { BulkUploadCell } from "./imageComponents/ImageCell";

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
        e.stopPropagation();
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
        onDragStart(e, index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        onDragOver(e, index);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
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

const ProductVariationTableRow = ({
    variant,
    variantIndex,
    visibleColumns,
    onImageUpload,
    onImageRemove,
    onImageEdit,
    onRowReorder
}) => {
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const handleDragStart = (e, index) => {
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
        setDraggingIndex(null);
        setDragOverIndex(null);
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));

        if (sourceIndex !== targetIndex &&
            !isNaN(sourceIndex) &&
            !isNaN(targetIndex) &&
            sourceIndex >= 0 &&
            targetIndex >= 0 &&
            sourceIndex < variant.variant_attributes.length &&
            targetIndex < variant.variant_attributes.length &&
            onRowReorder) {

            onRowReorder(variantIndex, sourceIndex, targetIndex);
        }

        setDraggingIndex(null);
        setDragOverIndex(null);
    };

    // Handle bulk image upload
    // const handleBulkImageUpload = (variantIndex, attributeIndex, event) => {
    //     const files = Array.from(event.target.files);
    //     if (files.length === 0) return;

    //     files.slice(0, 3).forEach((file, index) => {
    //         const imageKey = `main_images[${index}]`;
    //         onImageUpload(variantIndex, attributeIndex, imageKey, { target: { files: [file] } });
    //     });
    // };

    // Check if image is editable
    // const isImageEditable = (imageType, imageIndex) => {
    //     if (imageType === "preview_image") return true;
    //     if (imageType === "main_images" && imageIndex === 0) return true;
    //     return false;
    // };

    return (
        <>
            {variant.variant_attributes?.map((attribute, attributeIndex) => (
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
                    {/* {visibleColumns.multipleUpload && (
                        <TableCell align="center">
                            <BulkUploadCell
                                item={attribute}
                                index={attributeIndex}
                                combindex={variantIndex}
                                onBulkImageUpload={handleBulkImageUpload}
                            />
                        </TableCell>
                    )} */}

                    {/* Main Image 1 Column */}
                    {/* {visibleColumns.mainImage1 && (
                        <TableCell align="center">
                            <ImageCell
                                item={attribute}
                                index={attributeIndex}
                                imageType="main_images"
                                imageIndex={0}
                                editData={attribute.edit_main_image_data || null}
                                combindex={variantIndex}
                                onImageUpload={onImageUpload}
                                onImageRemove={onImageRemove}
                                onImageEdit={onImageEdit}
                                isEditable={isImageEditable("main_images", 0)}
                            />
                        </TableCell>
                    )} */}

                    {/* Main Image 2 Column */}
                    {/* {visibleColumns.mainImage2 && (
                        <TableCell align="center">
                            <ImageCell
                                item={attribute}
                                index={attributeIndex}
                                imageType="main_images"
                                imageIndex={1}
                                combindex={variantIndex}
                                onImageUpload={onImageUpload}
                                onImageRemove={onImageRemove}
                                onImageEdit={onImageEdit}
                                isEditable={false}
                            />
                        </TableCell>
                    )} */}

                    {/* Main Image 3 Column */}
                    {/* {visibleColumns.mainImage3 && (
                        <TableCell align="center">
                            <ImageCell
                                item={attribute}
                                index={attributeIndex}
                                imageType="main_images"
                                imageIndex={2}
                                combindex={variantIndex}
                                onImageUpload={onImageUpload}
                                onImageRemove={onImageRemove}
                                onImageEdit={onImageEdit}
                                isEditable={false}
                            />
                        </TableCell>
                    )} */}

                    {/* Preview Image Column */}
                    {/* {visibleColumns.preview && (
                        <TableCell align="center">
                            <ImageCell
                                item={attribute}
                                index={attributeIndex}
                                imageType="preview_image"
                                editData={attribute.edit_preview_image_data || null}
                                combindex={variantIndex}
                                onImageUpload={onImageUpload}
                                onImageRemove={onImageRemove}
                                onImageEdit={onImageEdit}
                                isEditable={isImageEditable("preview_image", null)}
                            />
                        </TableCell>
                    )} */}

                    {/* Thumbnail Column */}
                    {visibleColumns.thumbnail && (
                        <TableCell align="center">
                            <ImageCell
                                item={attribute}
                                index={attributeIndex}
                                imageType="thumbnail"
                                combindex={variantIndex}
                                onImageUpload={onImageUpload}
                                onImageRemove={onImageRemove}
                                onImageEdit={onImageEdit}
                                isEditable={false}
                            />
                        </TableCell>
                    )}
                </DraggableTableRow>
            ))}
        </>
    );
};

export default ProductVariationTableRow;
