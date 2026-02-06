import React, { useState, useEffect, useMemo } from "react";
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
    Button,
    Popover,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tooltip
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import EditIcon from "@mui/icons-material/Edit";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ProductVariationTableRow from "./ProductVariationTableRow";

// React Quill modules configuration
const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image'],
        ['clean']
    ],
};

const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'image'
];

// FIXED: Move AttributeCell component OUTSIDE the main component to prevent recreating
const AttributeCell = React.memo(({ variant, variantIndex, attributeName, onOpenGuideDialog, isImageFile, createObjectURL, handleOpenFile }) => {
    const hasGuide = variant.guide && (Array.isArray(variant.guide) ? variant.guide.length > 0 : !!variant.guide);
    const guide = Array.isArray(variant.guide) ? (variant.guide[0] || null) : variant.guide;
    const isImage = guide && isImageFile(guide.guide_file);
    const fileUrl = guide?.guide_file_url || (guide?.guide_file ? createObjectURL(guide.guide_file) : null);

    const handleEditClick = (event) => {
        event.stopPropagation();
        event.preventDefault();
        console.log("Edit icon clicked for variant:", variantIndex);
        onOpenGuideDialog(variantIndex, event);
    };

    const handleCellClick = (event) => {
        event.stopPropagation();
    };

    // Tooltip content
    const tooltipContent = (
        <Box sx={{ p: 1, maxWidth: 300 }}>
            {hasGuide ? (
                <Box>
                    <Typography variant="subtitle2" fontWeight={600} mb={1}>
                        Guide Preview
                    </Typography>
                    {guide.guide_name && (
                        <Typography variant="body2" mb={1}>
                            <strong>Name:</strong> {guide.guide_name}
                        </Typography>
                    )}
                    {guide.guide_file && (
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" mb={0.5}>
                                <strong>File:</strong>
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    cursor: 'pointer',
                                    padding: 1,
                                    borderRadius: 1,
                                    border: '1px solid #e0e0e0',
                                    backgroundColor: 'white',
                                    '&:hover': {
                                        backgroundColor: '#f5f5f5'
                                    }
                                }}
                                onClick={() => handleOpenFile(guide)}
                            >
                                {isImage ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <img
                                            src={fileUrl}
                                            alt="Guide preview"
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                objectFit: 'cover',
                                                borderRadius: '4px'
                                            }}
                                        />
                                        <Typography variant="body2">
                                            {guide.guide_name || 'Guide Image'}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <InsertDriveFileIcon color="primary" fontSize="small" />
                                        <Typography variant="body2">
                                            {guide.guide_name || 'Guide File'}
                                        </Typography>
                                    </Box>
                                )}
                                <VisibilityIcon color="primary" fontSize="small" />
                            </Box>
                        </Box>
                    )}
                    {guide.guide_description && (
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" mb={0.5}>
                                <strong>Description:</strong>
                            </Typography>
                            <Box
                                sx={{
                                    maxHeight: '100px',
                                    overflow: 'auto',
                                    fontSize: '12px',
                                    lineHeight: '1.4'
                                }}
                                dangerouslySetInnerHTML={{ __html: guide.guide_description }}
                            />
                        </Box>
                    )}
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={handleEditClick}
                        sx={{ mt: 1 }}
                    >
                        Edit Guide
                    </Button>
                </Box>
            ) : (
                <Box>
                    <Typography variant="body2" mb={1}>
                        No guide available
                    </Typography>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={handleEditClick}
                    >
                        Add Guide
                    </Button>
                </Box>
            )}
        </Box>
    );

    return (
        <TableCell
            align="center"
            sx={{
                wordBreak: "keep-all",
                width: 200,
                fontWeight: 600,
                py: 2,
                position: 'relative'
            }}
            onClick={handleCellClick}
        >
            <Tooltip
                title={tooltipContent}
                arrow
                placement="top"
                componentsProps={{
                    tooltip: {
                        sx: {
                            backgroundColor: 'white',
                            color: 'text.primary',
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: 3,
                            maxWidth: 400,
                            '& .MuiTooltip-arrow': {
                                color: 'white',
                            },
                        },
                    },
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        width: '100%',
                        height: '100%'
                    }}
                >
                    <Typography variant="body1" fontWeight={600}>
                        {attributeName}
                    </Typography>
                    <EditIcon
                        fontSize="small"
                        sx={{
                            cursor: 'pointer',
                            color: 'primary.main',
                            '&:hover': {
                                color: 'primary.dark',
                                transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                        }}
                        onClick={handleEditClick}
                    />
                </Box>
            </Tooltip>
        </TableCell>
    );
});

const ProductVariationsTable = ({
    productVariations,
    onImageUpload,
    onImageRemove,
    onImageEdit,
    onRowReorder,
    onGuideUpdate,
}) => {
    const [visibleColumns, setVisibleColumns] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentTableKey, setCurrentTableKey] = useState(null);

    // State for guide dialog
    const [guideDialogOpen, setGuideDialogOpen] = useState(false);
    const [currentVariantIndex, setCurrentVariantIndex] = useState(null);
    const [currentGuide, setCurrentGuide] = useState({
        guide_name: "",
        guide_file: null,
        guide_description: "",
        guide_type: "",
        guide_file_url: ""
    });

    // Initialize visible columns
    useEffect(() => {
        if (productVariations?.length > 0) {
            const newVisibleColumns = { ...visibleColumns };

            productVariations.forEach((variant) => {
                const tableKey = variant.variant_name;
                if (tableKey && !newVisibleColumns[tableKey]) {
                    newVisibleColumns[tableKey] = {
                        drag: true,
                        attribute: true,
                        thumbnail: true,
                    };
                }
            });

            setVisibleColumns(newVisibleColumns);
        }
    }, [productVariations]);

    const handleColumnMenuOpen = (event, tableKey) => {
        setAnchorEl(event.currentTarget);
        setCurrentTableKey(tableKey);
    };

    const handleColumnMenuClose = () => {
        setAnchorEl(null);
        setCurrentTableKey(null);
    };

    const handleColumnToggle = (column) => {
        if (!currentTableKey) return;

        setVisibleColumns(prev => ({
            ...prev,
            [currentTableKey]: {
                ...prev[currentTableKey],
                [column]: !prev[currentTableKey][column]
            }
        }));
    };

    const getTableVisibleColumns = (tableKey) => {
        return visibleColumns[tableKey] || {
            drag: true,
            attribute: true,
            thumbnail: true,
        };
    };

    // Check if file is an image
    const isImageFile = (file) => {
        if (!file) return false;
        const fileName = typeof file === 'string' ? file : file.name;
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
        return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
    };

    // Create object URL for preview
    const createObjectURL = (file) => {
        if (typeof file === 'string') {
            return file;
        }
        return URL.createObjectURL(file);
    };

    // Guide dialog functions
    const handleOpenGuideDialog = (variantIndex, event) => {
        if (event) {
            event.stopPropagation();
        }

        console.log("Opening guide dialog for variant:", variantIndex);
        setCurrentVariantIndex(variantIndex);
        const variant = productVariations[variantIndex];

        if (variant.guide && variant.guide.length > 0) {
            setCurrentGuide({
                ...variant.guide[0],
                guide_file_url: variant.guide[0].guide_file ? createObjectURL(variant.guide[0].guide_file) : ""
            });
        } else {
            setCurrentGuide({
                guide_name: "",
                guide_file: null,
                guide_description: "",
                guide_type: "",
                guide_file_url: ""
            });
        }
        setGuideDialogOpen(true);
    };

    const handleCloseGuideDialog = () => {
        setGuideDialogOpen(false);
        setCurrentVariantIndex(null);
        setCurrentGuide({
            guide_name: "",
            guide_file: null,
            guide_description: "",
            guide_type: "",
            guide_file_url: ""
        });
    };

    const handleGuideFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setCurrentGuide(prev => ({
            ...prev,
            guide_file: file,
            guide_file_url: URL.createObjectURL(file),
            guide_type: isImageFile(file) ? 'image' : 'document',
            guide_name: prev.guide_name || file.name
        }));
    };

    const handleGuideNameChange = (value) => {
        setCurrentGuide(prev => ({
            ...prev,
            guide_name: value
        }));
    };

    const handleGuideDescriptionChange = (value) => {
        setCurrentGuide(prev => ({
            ...prev,
            guide_description: value
        }));
    };

    const handleGuideFileRemove = () => {
        setCurrentGuide(prev => ({
            ...prev,
            guide_file: null,
            guide_file_url: "",
            guide_type: ""
        }));
    };

    const handleSaveGuide = () => {
        if (currentVariantIndex === null) return;

        console.log("Saving guide for variant:", currentVariantIndex, currentGuide);

        // Call the parent function to update the guide
        if (onGuideUpdate) {
            onGuideUpdate(currentVariantIndex, currentGuide);
        }

        handleCloseGuideDialog();
    };

    const handleOpenFile = (guide) => {
        if (!guide.guide_file) return;

        let fileUrl = typeof guide.guide_file === 'string'
            ? guide.guide_file
            : URL.createObjectURL(guide.guide_file);

        window.open(fileUrl, '_blank');
    };

    // FIXED: Use stable keys for table rows
    const tableSections = useMemo(() => {
        return productVariations?.map((variant, variantIndex) => {
            const tableKey = variant.variant_name;
            const tableVisibleColumns = getTableVisibleColumns(tableKey);

            return {
                variant,
                variantIndex,
                tableKey,
                tableVisibleColumns,
                key: `${tableKey}-${variantIndex}-${variant.variant_attributes?.length || 0}`
            };
        }) || [];
    }, [productVariations, visibleColumns]);

    return (
        <Box>
            {tableSections.map(({ variant, variantIndex, tableKey, tableVisibleColumns, key }) => (
                <Box
                    key={key}
                    sx={{
                        mb: 4,
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        overflow: 'hidden'
                    }}
                >
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 2,
                        backgroundColor: '#f8f9fa',
                        borderBottom: '1px solid #e9ecef'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton size="small">
                                <DragIndicatorIcon />
                            </IconButton>
                            <Box>
                                <Typography variant="h6" fontWeight={600} color="primary">
                                    {tableKey}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {variant.variant_attributes?.length || 0} attribute(s)
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Column Selection Menu */}
                    <Popover
                        open={Boolean(anchorEl) && currentTableKey === tableKey}
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
                                Show Columns - {tableKey}
                            </Typography>
                            {Object.entries(tableVisibleColumns).map(([column, isVisible]) => (
                                column !== 'attribute' && (
                                    <MenuItem
                                        key={column}
                                        onClick={() => handleColumnToggle(column)}
                                        dense
                                    >
                                        <Checkbox checked={isVisible} />
                                        <Typography variant="body2">
                                            {column === 'drag' ? 'Drag' :
                                                column === 'thumbnail' ? 'Thumbnail' : column}
                                        </Typography>
                                    </MenuItem>
                                )
                            ))}
                        </Box>
                    </Popover>

                    {/* Variations Table */}
                    <TableContainer component={Paper} sx={{ border: 'none', width: "100%", borderRadius: 0 }}>
                        <Table width={"100%"}>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f5f5f5', width: "100%" }}>
                                    {tableVisibleColumns.drag && (
                                        <TableCell width={69} align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                            Drag
                                        </TableCell>
                                    )}
                                    {tableVisibleColumns.attribute && (
                                        <AttributeCell
                                            key={`attribute-${tableKey}-${variantIndex}`}
                                            variant={variant}
                                            variantIndex={variantIndex}
                                            attributeName={variant.variant_name}
                                            onOpenGuideDialog={handleOpenGuideDialog}
                                            isImageFile={isImageFile}
                                            createObjectURL={createObjectURL}
                                            handleOpenFile={handleOpenFile}
                                        />
                                    )}
                                    {tableVisibleColumns.thumbnail && (
                                        <TableCell align="center" sx={{ wordBreak: "keep-all", width: 200, fontWeight: 600, py: 2 }}>
                                            Thumbnail
                                        </TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <ProductVariationTableRow
                                    variant={variant}
                                    variantIndex={variantIndex}
                                    visibleColumns={tableVisibleColumns}
                                    onImageUpload={onImageUpload}
                                    onImageRemove={onImageRemove}
                                    onImageEdit={onImageEdit}
                                    onRowReorder={onRowReorder}
                                />
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            ))}

            {/* Guide Dialog */}
            <Dialog
                open={guideDialogOpen}
                onClose={handleCloseGuideDialog}
                maxWidth="md"
                fullWidth
                onClick={(e) => e.stopPropagation()}
            >
                <DialogTitle>
                    {currentVariantIndex !== null && productVariations[currentVariantIndex]?.guide?.length > 0 ? 'Edit Guide' : 'Add Guide'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {/* Guide Name Input */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" fontWeight={500} mb={1}>
                                Guide Name
                            </Typography>
                            <TextField
                                type="text"
                                value={currentGuide.guide_name || ""}
                                onChange={(e) => handleGuideNameChange(e.target.value)}
                                placeholder="Enter guide name"
                                fullWidth
                                size="small"
                            />
                        </Box>

                        {/* Guide File Upload and Preview */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" fontWeight={500} mb={1}>
                                Guide File
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                {currentGuide.guide_file ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {/* File Preview */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                cursor: 'pointer',
                                                padding: 1,
                                                borderRadius: 1,
                                                border: '1px solid #e0e0e0',
                                                backgroundColor: 'white',
                                                '&:hover': {
                                                    backgroundColor: '#f5f5f5'
                                                }
                                            }}
                                            onClick={() => handleOpenFile(currentGuide)}
                                            title="Click to open in new tab"
                                        >
                                            {isImageFile(currentGuide.guide_file) ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <img
                                                        src={currentGuide.guide_file_url}
                                                        alt="Guide preview"
                                                        style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            objectFit: 'cover',
                                                            borderRadius: '4px'
                                                        }}
                                                    />
                                                    <Typography variant="body2" color="primary">
                                                        {currentGuide.guide_name || (typeof currentGuide.guide_file === 'string' ? 'Guide Image' : currentGuide.guide_file.name)}
                                                    </Typography>
                                                    <VisibilityIcon color="primary" fontSize="small" />
                                                </Box>
                                            ) : (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <InsertDriveFileIcon color="primary" fontSize="small" />
                                                    <Typography variant="body2" color="primary">
                                                        {currentGuide.guide_name || (typeof currentGuide.guide_file === 'string' ? 'Guide File' : currentGuide.guide_file.name)}
                                                    </Typography>
                                                    <VisibilityIcon color="primary" fontSize="small" />
                                                </Box>
                                            )}
                                        </Box>

                                        {/* Remove Button */}
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={handleGuideFileRemove}
                                            title="Remove guide file"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ) : (
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        size="small"
                                    >
                                        Upload Guide File
                                        <input
                                            type="file"
                                            hidden
                                            onChange={handleGuideFileUpload}
                                            accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
                                        />
                                    </Button>
                                )}
                            </Box>
                            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                                Supported formats: PDF, DOC, DOCX, TXT, XLSX, XLS, JPG, JPEG, PNG, GIF, BMP, WEBP, SVG
                            </Typography>
                        </Box>

                        {/* Guide Description - React Quill Editor */}
                        <Box>
                            <Typography variant="body2" fontWeight={500} mb={1}>
                                Guide Description
                            </Typography>
                            <Box sx={{
                                border: '1px solid #e0e0e0',
                                borderRadius: '4px',
                                '& .ql-container': {
                                    border: 'none',
                                    borderRadius: '0 0 4px 4px'
                                },
                                '& .ql-toolbar': {
                                    border: 'none',
                                    borderBottom: '1px solid #e0e0e0',
                                    borderRadius: '4px 4px 0 0'
                                }
                            }}>
                                <ReactQuill
                                    value={currentGuide.guide_description}
                                    onChange={handleGuideDescriptionChange}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    placeholder="Enter guide description..."
                                    style={{
                                        height: '200px',
                                        marginBottom: '50px'
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseGuideDialog}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveGuide}
                        variant="contained"
                    >
                        Save Guide
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProductVariationsTable;
