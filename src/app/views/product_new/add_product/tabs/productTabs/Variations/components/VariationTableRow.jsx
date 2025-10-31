import React, { useState } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { Box, Button, Checkbox, Switch, IconButton } from "@mui/material";
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

const VariationTableRow = ({
                               comb,
                               combindex,
                               visibleColumns,
                           }) => {
    const {
        formValues,
        variationsData,
        combinationError,
        showAll,
        setShowAll,
        handleToggle,
        handleCombChange,
        handleImageUpload,
        handleImageRemove,
        handleEditImage,
        handleRowReorder
    } = useProductFormStore();

    const [draggingIndex, setDraggingIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const handleSeeMore = () => {
        setShowAll(!showAll);
    };

    const itemsToShow = showAll ? comb.combinations : comb.combinations.slice(0, 5);

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
        if (sourceIndex !== targetIndex && handleRowReorder) {
            handleRowReorder(combindex, sourceIndex, targetIndex);
        }
        setDraggingIndex(null);
        setDragOverIndex(null);
    };

    // Calculate total number of columns for colspan
    const getTotalVisibleColumns = () => {
        let count = 0;
        if (visibleColumns.drag) count++;
        if (visibleColumns.select) count++;
        if (visibleColumns.attribute1 && comb.combinations[0]?.value1) count++;
        if (visibleColumns.attribute2 && comb.combinations[0]?.value2) count++;
        if (visibleColumns.multipleUpload) count++;
        if (visibleColumns.mainImage1) count++;
        if (visibleColumns.mainImage2) count++;
        if (visibleColumns.mainImage3) count++;
        if (visibleColumns.preview) count++;
        if (visibleColumns.thumbnail) count++;
        if (visibleColumns.price && (variationsData.length >= 2 ? formValues?.prices === comb.variant_name : true) && formValues?.isCheckedPrice) count++;
        if (visibleColumns.quantity && (variationsData.length >= 2 ? formValues?.quantities === comb.variant_name : true) && formValues?.isCheckedQuantity) count++;
        if (visibleColumns.visible) count++;
        return count;
    };

    // Handle bulk image upload
    const handleBulkImageUpload = (combindex, rowIndex, event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        // Upload first 3 images to main_images[0], main_images[1], main_images[2]
        files.slice(0, 3).forEach((file, index) => {
            const imageKey = `main_images[${index}]`;
            handleImageUpload(combindex, rowIndex, imageKey, { target: { files: [file] } });
        });
    };

    // Check if image is editable
    const isImageEditable = (imageType, imageIndex) => {
        if (imageType === "preview_image") return true;
        if (imageType === "main_images" && imageIndex === 0) return true;
        return false;
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
                                >
                                    <DragIndicatorIcon />
                                </IconButton>
                            </Box>
                        </TableCell>
                    )}

                    {/* Attribute 1 Column */}
                    {visibleColumns.attribute1 && item?.value1 && (
                        <TableCell align="center">{item?.value1}</TableCell>
                    )}

                    {/* Attribute 2 Column */}
                    {visibleColumns.attribute2 && item?.value2 && (
                        <TableCell align="center">{item?.value2}</TableCell>
                    )}

                    {/* Bulk Upload Column */}
                    {visibleColumns.multipleUpload && (
                        <TableCell align="center">
                            <BulkUploadCell
                                item={item}
                                index={index}
                                combindex={combindex}
                                onBulkImageUpload={handleBulkImageUpload}
                            />
                        </TableCell>
                    )}

                    {/* Main Image 1 Column */}
                    {visibleColumns.mainImage1 && (
                        <TableCell align="center">
                            <ImageCell
                                item={item}
                                index={index}
                                imageType="main_images"
                                imageIndex={0}
                                editData={item.edit_main_image_data || null}
                                combindex={combindex}
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
                                item={item}
                                index={index}
                                imageType="main_images"
                                imageIndex={1}
                                combindex={combindex}
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
                                item={item}
                                index={index}
                                imageType="main_images"
                                imageIndex={2}
                                combindex={combindex}
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
                                item={item}
                                index={index}
                                imageType="preview_image"
                                editData={item.edit_preview_image_data || null}
                                combindex={combindex}
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
                                item={item}
                                index={index}
                                imageType="thumbnail"
                                combindex={combindex}
                                onImageUpload={handleImageUpload}
                                onImageRemove={handleImageRemove}
                                onImageEdit={handleEditImage}
                                isEditable={false}
                            />
                        </TableCell>
                    )}

                    {/* Price Column */}
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
                                        border: combinationError[`Price-${comb.variant_name}-${index}`]
                                            ? "2px solid red"
                                            : "1px solid #ccc",
                                        borderRadius: "4px",
                                        padding: "0 8px",
                                        fontSize: "14px"
                                    }}
                                />
                                {combinationError[`Price-${comb.variant_name}-${index}`] && (
                                    <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                                        {combinationError[`Price-${comb.variant_name}-${index}`]}
                                    </div>
                                )}
                            </TableCell>
                        )}

                    {/* Quantity Column */}
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
                                        border: combinationError[`Quantity-${comb.variant_name}-${index}`]
                                            ? "2px solid red"
                                            : "1px solid #ccc",
                                        borderRadius: "4px",
                                        padding: "0 8px",
                                        fontSize: "14px"
                                    }}
                                />
                                {combinationError[`Quantity-${comb.variant_name}-${index}`] && (
                                    <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                                        {combinationError[`Quantity-${comb.variant_name}-${index}`]}
                                    </div>
                                )}
                            </TableCell>
                        )}

                    {/* Visible Column */}
                    {visibleColumns.visible && (
                        <TableCell align="center">
                            <Switch
                                checked={item.isVisible || false}
                                onChange={() => handleToggle(combindex, index)}
                                size="small"
                            />
                        </TableCell>
                    )}
                </DraggableTableRow>
            ))}

            {/* See More/Less Button Row */}
            {comb.combinations.length > 5 && (
                <TableRow>
                    <TableCell colSpan={getTotalVisibleColumns()} align="center" sx={{ py: 2 }}>
                        <Button
                            onClick={handleSeeMore}
                            variant="outlined"
                            size="small"
                            sx={{
                                minWidth: '120px',
                                backgroundColor: '#e3f2fd',
                                '&:hover': {
                                    backgroundColor: '#bbdefb'
                                }
                            }}
                        >
                            {showAll ? "See Less" : `See More (+${comb.combinations.length - 5})`}
                        </Button>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
};

export default VariationTableRow;
