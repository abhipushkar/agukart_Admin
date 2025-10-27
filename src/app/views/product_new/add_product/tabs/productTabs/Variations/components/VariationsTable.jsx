import React, { useState, useEffect } from "react";
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
    IconButton,
    Menu,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Button,
    Popover
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import VariationTableRow from "./VariationTableRow";
import {useProductFormStore} from "../../../../../states/useAddProducts";

const VariationsTable = ({setShowVariantModal}) => {
    const {
        combinations,
        variationsData,
        formValues,
        combinationError,
        showAll,
        setCombinationError,
        setShowAll,
        handleToggle,
        handleCombChange,
        handleImageUpload,
        handleImageRemove,
        handleEditImage,
        handleRowReorder
    } = useProductFormStore();

    // State for column visibility
    const [visibleColumns, setVisibleColumns] = useState({
        drag: true,
        select: true,
        attribute1: true,
        attribute2: true,
        multipleUpload: true,
        mainImage1: true,
        mainImage2: true,
        mainImage3: true,
        preview: true,
        thumbnail: true,
        price: true,
        quantity: true,
        visible: true
    });

    // State for column selection menu
    const [anchorEl, setAnchorEl] = useState(null);

    // Initialize visible columns based on current data
    useEffect(() => {
        const newVisibleColumns = { ...visibleColumns };

        // Hide attribute columns if they don't exist in the data
        if (combinations?.length > 0) {
            const firstCombination = combinations[0];
            newVisibleColumns.attribute1 = !!firstCombination?.combinations[0]?.name1;
            newVisibleColumns.attribute2 = !!firstCombination?.combinations[0]?.name2;

            // Hide price/quantity columns based on form values
            newVisibleColumns.price = (variationsData.length >= 2 ? formValues?.prices === firstCombination.variant_name : true) && formValues?.isCheckedPrice;
            newVisibleColumns.quantity = (variationsData.length >= 2 ? formValues?.quantities === firstCombination.variant_name : true) && formValues?.isCheckedQuantity;
        }

        setVisibleColumns(newVisibleColumns);
    }, [combinations, variationsData, formValues]);

    const handleEdit = (comb) => {
        console.log("Edit variation:", comb);
        setShowVariantModal(true);
    };

    const handleColumnMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleColumnMenuClose = () => {
        setAnchorEl(null);
    };

    const handleColumnToggle = (column) => {
        setVisibleColumns(prev => ({
            ...prev,
            [column]: !prev[column]
        }));
    };

    const handleSelectAllColumns = () => {
        setVisibleColumns({
            drag: true,
            select: true,
            attribute1: true,
            attribute2: true,
            multipleUpload: true,
            mainImage1: true,
            mainImage2: true,
            mainImage3: true,
            preview: true,
            thumbnail: true,
            price: true,
            quantity: true,
            visible: true
        });
    };

    const handleDeselectAllColumns = () => {
        setVisibleColumns({
            drag: true,
            select: false,
            attribute1: true,
            attribute2: true,
            multipleUpload: false,
            mainImage1: false,
            mainImage2: false,
            mainImage3: false,
            preview: false,
            thumbnail: false,
            price: false,
            quantity: false,
            visible: true
        });
    };

    const getAvailableColumns = (comb) => {
        const columns = [
            { key: 'drag', label: 'Drag', alwaysVisible: true },
            { key: 'attribute1', label: comb?.combinations[0]?.name1 || 'Attribute 1', alwaysVisible: true },
            { key: 'attribute2', label: comb?.combinations[0]?.name2 || 'Attribute 2', alwaysVisible: true },
            { key: 'multipleUpload', label: 'Multiple Upload', alwaysVisible: false },
            { key: 'mainImage1', label: 'Main Image 1', alwaysVisible: false },
            { key: 'mainImage2', label: 'Main Image 2', alwaysVisible: false },
            { key: 'mainImage3', label: 'Main Image 3', alwaysVisible: false },
            { key: 'preview', label: 'Preview', alwaysVisible: false },
            { key: 'thumbnail', label: 'Thumbnail', alwaysVisible: false },
            {
                key: 'price',
                label: 'Price',
                alwaysVisible: false,
                visible: (variationsData.length >= 2 ? formValues?.prices === comb.variant_name : true) && formValues?.isCheckedPrice
            },
            {
                key: 'quantity',
                label: 'Quantity',
                alwaysVisible: false,
                visible: (variationsData.length >= 2 ? formValues?.quantities === comb.variant_name : true) && formValues?.isCheckedQuantity
            },
            { key: 'visible', label: 'Visible', alwaysVisible: true }
        ];

        return columns.filter(col => !col.alwaysVisible && (col.visible === undefined || col.visible));
    };

    return (
        <Box>
            {combinations?.map((comb, combindex) => {
                const availableColumns = getAvailableColumns(comb);

                return (
                    <Box key={combindex} sx={{ mb: 4 }}>
                        <Box sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                            p: 2,
                            backgroundColor: '#f8f9fa',
                            borderRadius: 1,
                            border: '1px solid #e9ecef'
                        }}>
                            <Box>
                                <Typography variant="h6" fontWeight={600} color="primary">
                                    {comb.variant_name || comb.combinations[0].name1}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {comb.combinations?.length || 0} attribute(s)
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    startIcon={<ViewColumnIcon />}
                                    onClick={handleColumnMenuOpen}
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        backgroundColor: 'white',
                                        '&:hover': {
                                            backgroundColor: '#f0f0f0'
                                        }
                                    }}
                                >
                                    Columns
                                </Button>
                                <IconButton
                                    onClick={() => handleEdit(comb)}
                                    color="primary"
                                    size="small"
                                    sx={{
                                        backgroundColor: 'white',
                                        '&:hover': {
                                            backgroundColor: '#f0f0f0'
                                        }
                                    }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>

                        {/* Column Selection Menu */}
                        <Popover
                            open={Boolean(anchorEl)}
                            anchorEl={anchorEl}
                            onClose={handleColumnMenuClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                        >
                            <Box sx={{ p: 2, minWidth: 200 }}>
                                <Typography variant="subtitle1" fontWeight={600} mb={1}>
                                    Show Columns
                                </Typography>
                                <Box sx={{ mb: 1 }}>
                                    <Button size="small" onClick={handleSelectAllColumns} sx={{ mr: 1 }}>
                                        All
                                    </Button>
                                    <Button size="small" onClick={handleDeselectAllColumns}>
                                        None
                                    </Button>
                                </Box>
                                {availableColumns.map((column) => (
                                    <MenuItem
                                        key={column.key}
                                        onClick={() => handleColumnToggle(column.key)}
                                        dense
                                    >
                                        <Checkbox
                                            checked={visibleColumns[column.key]}
                                            // onChange={(e) => handleColumnToggle(column.key)}
                                        />
                                        <Typography variant="body2">
                                            {column.label}
                                        </Typography>
                                    </MenuItem>
                                ))}
                            </Box>
                        </Popover>

                        {/* Variations Table */}
                        <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0' }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                        {visibleColumns.drag && (
                                            <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                                Drag
                                            </TableCell>
                                        )}
                                        {visibleColumns.attribute1 && comb.combinations[0]?.name1 && (
                                            <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                                {comb.combinations[0]?.name1}
                                            </TableCell>
                                        )}
                                        {visibleColumns.attribute2 && comb.combinations[0]?.name2 && (
                                            <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                                {comb.combinations[0]?.name2}
                                            </TableCell>
                                        )}
                                        {visibleColumns.multipleUpload && (
                                            <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                                Multiple Upload
                                            </TableCell>
                                        )}
                                        {visibleColumns.mainImage1 && (
                                            <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                                Main Image 1
                                            </TableCell>
                                        )}
                                        {visibleColumns.mainImage2 && (
                                            <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                                Main Image 2
                                            </TableCell>
                                        )}
                                        {visibleColumns.mainImage3 && (
                                            <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                                Main Image 3
                                            </TableCell>
                                        )}
                                        {visibleColumns.preview && (
                                            <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                                Preview
                                            </TableCell>
                                        )}
                                        {visibleColumns.thumbnail && (
                                            <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                                Thumbnail
                                            </TableCell>
                                        )}
                                        {visibleColumns.price && (variationsData.length >= 2 ? formValues?.prices === comb.variant_name : true) && formValues?.isCheckedPrice && (
                                            <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                                Price
                                            </TableCell>
                                        )}
                                        {visibleColumns.quantity && (variationsData.length >= 2 ? formValues?.quantities === comb.variant_name : true) && formValues?.isCheckedQuantity && (
                                            <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                                Quantity
                                            </TableCell>
                                        )}
                                        {visibleColumns.visible && (
                                            <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                                Visible
                                            </TableCell>
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <VariationTableRow
                                        comb={comb}
                                        combindex={combindex}
                                        formValues={formValues}
                                        variationsData={variationsData}
                                        combinationError={combinationError}
                                        showAll={showAll}
                                        setCombinationError={setCombinationError}
                                        setShowAll={setShowAll}
                                        handleToggle={handleToggle}
                                        handleCombChange={handleCombChange}
                                        handleImageUpload={handleImageUpload}
                                        handleImageRemove={handleImageRemove}
                                        handleEditImage={handleEditImage}
                                        onRowReorder={handleRowReorder}
                                        visibleColumns={visibleColumns}
                                    />
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                );
            })}
        </Box>
    );
};

export default VariationsTable;
