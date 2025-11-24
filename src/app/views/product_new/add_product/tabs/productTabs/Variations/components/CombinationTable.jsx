import React, { useState } from "react";
import {
    Box,
    Typography,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Switch,
    TextField,
    Button,
    IconButton,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useProductFormStore } from "../../../../../states/useAddProducts";

// Draggable Table Container Component for Combinations
const DraggableCombinationTable = ({
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
        <Box
            {...props}
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={onDragEnd}
            sx={{
                cursor: isDragging ? 'grabbing' : 'grab',
                backgroundColor: isDragging
                    ? 'rgba(25, 118, 210, 0.04)'
                    : isDragOver
                        ? 'rgba(0, 0, 0, 0.02)'
                        : 'transparent',
                my: 2,
                opacity: isDragging ? 0.8 : 1,
                transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.2s ease',
                boxShadow: isDragging ? '0 8px 25px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
                position: 'relative',
                border: isDragOver ? '2px dashed #1976d2' : '1px solid rgba(224, 224, 224, 1)',
                borderRadius: 1,
                overflow: 'hidden',
                '&:hover': {
                    backgroundColor: isDragging
                        ? 'rgba(25, 118, 210, 0.04)'
                        : 'rgba(0, 0, 0, 0.01)',
                },
                '& .drag-handle': {
                    opacity: isDragging ? 1 : 0.5,
                    transition: 'opacity 0.2s ease',
                },
                '&:hover .drag-handle': {
                    opacity: 0.8,
                },
            }}
        >
            {children}
        </Box>
    );
};

const CombinationsTable = ({ isSynced }) => {
    const {
        combinations,
        formValues,
        variationsData,
        combinationError,
        showAll,
        setShowAll,
        handleToggle,
        handleCombChange,
        handleCombinationGroupReorder, // You'll need to add this to your store
    } = useProductFormStore();

    // State for table dragging
    const [draggingTableIndex, setDraggingTableIndex] = useState(null);
    const [dragOverTableIndex, setDragOverTableIndex] = useState(null);

    // Table drag and drop handlers
    const handleTableDragStart = (e, index) => {
        setDraggingTableIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleTableDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggingTableIndex !== null && draggingTableIndex !== index) {
            setDragOverTableIndex(index);
        }
    };

    const handleTableDragEnd = () => {
        setDraggingTableIndex(null);
        setDragOverTableIndex(null);
    };

    const handleTableDrop = (e, targetIndex) => {
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (sourceIndex !== targetIndex && handleCombinationGroupReorder) {
            handleCombinationGroupReorder(sourceIndex, targetIndex);
        }
        setDraggingTableIndex(null);
        setDragOverTableIndex(null);
    };

    const handleSeeMore = () => {
        setShowAll(!showAll);
    };

    if (!combinations || combinations.length === 0) {
        return null;
    }

    return (
        <Box>
            {combinations.map((comb, combindex) => {
                const itemsToShow = showAll ? comb.combinations : comb.combinations.slice(0, 5);

                console.log("Combinations", comb.combinations[1].isVisible);


                return (
                    <DraggableCombinationTable
                        key={combindex}
                        index={combindex}
                        onDragStart={handleTableDragStart}
                        onDragOver={handleTableDragOver}
                        onDrop={handleTableDrop}
                        onDragEnd={handleTableDragEnd}
                        isDragging={draggingTableIndex === combindex}
                        isDragOver={dragOverTableIndex === combindex}
                        sx={{ mb: 4 }}
                    >
                        <Box sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 2,
                            backgroundColor: '#f0f7ff',
                            borderBottom: '1px solid #e1f5fe'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                                <Box>
                                    <Typography variant="h6" fontWeight={600} color="primary.main">
                                        {comb.variant_name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {comb.combinations?.length || 0} combination(s)
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <TableContainer component={Paper} sx={{ border: 'none', borderRadius: 0 }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                                            {comb.combinations[combindex]?.name1}
                                        </TableCell>
                                        {comb.combinations[0]?.name2 && (
                                            <TableCell align="center" sx={{ fontWeight: 600 }}>
                                                {comb.combinations[combindex].name2}
                                            </TableCell>
                                        )}
                                        {(variationsData.length >= 2 ? formValues?.prices === comb.variant_name : true) &&
                                            formValues?.isCheckedPrice && (
                                                <TableCell align="center" sx={{ fontWeight: 600 }}>
                                                    Price
                                                </TableCell>
                                            )}
                                        {(variationsData.length >= 2 ? formValues?.quantities === comb.variant_name : true) &&
                                            formValues?.isCheckedQuantity && (
                                                <TableCell align="center" sx={{ fontWeight: 600 }}>
                                                    Quantity
                                                </TableCell>
                                            )}
                                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                                            Visible
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {itemsToShow.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell height={99} align="center">
                                                {item.value1}
                                            </TableCell>
                                            {item.value2 && (
                                                <TableCell align="center">
                                                    {item.value2}
                                                </TableCell>
                                            )}
                                            {(variationsData.length >= 2 ? formValues?.prices === comb.variant_name : true) &&
                                                (formValues?.isCheckedPrice === true || formValues?.isCheckedPrice === 'true') && (
                                                    <TableCell align="center">
                                                        <TextField
                                                            type="text"
                                                            name="price"
                                                            value={item.price || ""}
                                                            onChange={(e) => handleCombChange(e, combindex, index)}
                                                            size="small"
                                                            error={!!combinationError[`Price-${comb.variant_name}-${index}`]}
                                                            helperText={combinationError[`Price-${comb.variant_name}-${index}`]}
                                                        />
                                                    </TableCell>
                                                )}
                                            {(variationsData.length >= 2 ? formValues?.quantities === comb.variant_name : true) &&
                                                (formValues?.isCheckedQuantity === true || formValues?.isCheckedQuantity === 'true') && (
                                                    <TableCell align="center">
                                                        <TextField
                                                            type="text"
                                                            name="qty"
                                                            value={item.qty || ""}
                                                            onChange={(e) => handleCombChange(e, combindex, index)}
                                                            size="small"
                                                            error={!!combinationError[`Quantity-${comb.variant_name}-${index}`]}
                                                            helperText={combinationError[`Quantity-${comb.variant_name}-${index}`]}
                                                        />
                                                    </TableCell>
                                                )}
                                            <TableCell align="center">
                                                <Switch
                                                    checked={item.isVisible === "true" || item.isVisible === true || false}
                                                    onChange={() => handleToggle(combindex, index)}
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* See More/Less Button */}
                        {comb.combinations.length > 5 && (
                            <Box sx={{ textAlign: 'center', p: 2, borderTop: '1px solid #e0e0e0' }}>
                                <Button
                                    onClick={handleSeeMore}
                                    variant="outlined"
                                    size="small"
                                >
                                    {showAll ? "See Less" : `See More (+${comb.combinations.length - 5})`}
                                </Button>
                            </Box>
                        )}
                    </DraggableCombinationTable>
                );
            })}
        </Box>
    );
};

export default CombinationsTable;
