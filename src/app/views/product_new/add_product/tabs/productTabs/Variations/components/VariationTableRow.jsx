import React, { useState } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { Box, Button, Checkbox, Switch, IconButton } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

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
                               formValues,
                               variationsData,
                               combinationError,
                               showAll,
                               setShowAll,
                               handleToggle,
                               handleCombChange,
                               onRowReorder
                           }) => {
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const handleSeeMore = () => {
        setShowAll((prev) => !prev);
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
        if (sourceIndex !== targetIndex && onRowReorder) {
            onRowReorder(combindex, sourceIndex, targetIndex);
        }
        setDraggingIndex(null);
        setDragOverIndex(null);
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
                                    }
                                }}
                            >
                                <DragIndicatorIcon />
                            </IconButton>
                        </Box>
                    </TableCell>
                    <TableCell align="center">
                        <Checkbox size="small" />
                    </TableCell>

                    {item?.value1 && <TableCell align="center">{item?.value1}</TableCell>}
                    {item?.value2 && <TableCell align="center">{item?.value2}</TableCell>}

                    {/* Image Upload Cells */}
                    <TableCell align="center">
                        <Button variant="outlined" size="small" sx={{ fontSize: '12px' }}>
                            Upload
                        </Button>
                    </TableCell>
                    <TableCell align="center">
                        <Button variant="outlined" size="small" sx={{ fontSize: '12px' }}>
                            Upload
                        </Button>
                    </TableCell>
                    <TableCell align="center">
                        <Button variant="outlined" size="small" sx={{ fontSize: '12px' }}>
                            Upload
                        </Button>
                    </TableCell>
                    <TableCell align="center">
                        <Button variant="outlined" size="small" sx={{ fontSize: '12px' }}>
                            Upload
                        </Button>
                    </TableCell>
                    <TableCell align="center">
                        <Button variant="outlined" size="small" sx={{ fontSize: '12px' }}>
                            Upload
                        </Button>
                    </TableCell>
                    <TableCell align="center">
                        <Button variant="outlined" size="small" sx={{ fontSize: '12px' }}>
                            Upload
                        </Button>
                    </TableCell>

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

                    <TableCell align="center">
                        <Switch
                            checked={item.isVisible || false}
                            onChange={() => handleToggle(combindex, index)}
                            size="small"
                        />
                    </TableCell>
                </DraggableTableRow>
            ))}

            {comb.combinations.length > 5 && (
                <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 2 }}>
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
