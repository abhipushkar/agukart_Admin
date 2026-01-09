import React, { useState, useMemo } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { Box, IconButton } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ImageCell from "app/views/product_new/add_product/tabs/productTabs/Variations/components/imageComponents/ImageCell";

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

    // FIXED: Use stable keys for table rows
    const attributeRows = useMemo(() => {
        return variant.variant_attributes?.map((attribute, attributeIndex) => ({
            attribute,
            attributeIndex,
            key: `${variant.variant_name}-${attribute._id}-${attributeIndex}`
        })) || [];
    }, [variant.variant_attributes, variant.variant_name]);

    return (
        <>
            {attributeRows.map(({ attribute, attributeIndex, key }) => (
                <DraggableTableRow
                    key={key}
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
