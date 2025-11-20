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
    Button,
    Popover,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tooltip
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import VariationTableRow from "./VariationTableRow";
import { useProductFormStore } from "../../../../../states/useAddProducts";

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

// Draggable Table Container Component
const DraggableTableContainer = ({
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

const VariationsTable = ({ setShowVariantModal, isSynced }) => {
    const {
        product_variants,
        variationsData,
        formValues,
        setShowAll,
        handleProductVariantReorder,
        handleImageUpload,
        handleImageRemove,
        handleEditImage,
        handleVariantGroupReorder, // For reordering entire variant groups
        showAll,
    } = useProductFormStore();

    // State for column visibility per table
    const [visibleColumns, setVisibleColumns] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentTableKey, setCurrentTableKey] = useState(null);
    const [hoveredHeader, setHoveredHeader] = useState(null);

    // State for table dragging
    const [draggingTableIndex, setDraggingTableIndex] = useState(null);
    const [dragOverTableIndex, setDragOverTableIndex] = useState(null);

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

    // Initialize visible columns based on product_variants
    useEffect(() => {
        if (product_variants?.length > 0) {
            const newVisibleColumns = { ...visibleColumns };

            product_variants.forEach((variant) => {
                const tableKey = variant.variant_name;
                if (tableKey && !newVisibleColumns[tableKey]) {
                    // Initialize with default visibility for images table
                    newVisibleColumns[tableKey] = {
                        drag: true,
                        attribute: true,
                        multipleUpload: true,
                        mainImage1: true,
                        mainImage2: true,
                        mainImage3: true,
                        preview: true,
                        thumbnail: true,
                    };
                }
            });

            setVisibleColumns(newVisibleColumns);
        }
    }, [product_variants]);

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
        if (sourceIndex !== targetIndex && handleVariantGroupReorder) {
            handleVariantGroupReorder(sourceIndex, targetIndex);
        }
        setDraggingTableIndex(null);
        setDragOverTableIndex(null);
    };

    const handleEdit = (variant) => {
        console.log("Edit variation:", variant);
        setShowVariantModal(true);
    };

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

    const handleSelectAllColumns = () => {
        if (!currentTableKey) return;

        setVisibleColumns(prev => ({
            ...prev,
            [currentTableKey]: {
                drag: true,
                attribute: true,
                multipleUpload: true,
                mainImage1: true,
                mainImage2: true,
                mainImage3: true,
                preview: true,
                thumbnail: true,
            }
        }));
    };

    const handleDeselectAllColumns = () => {
        if (!currentTableKey) return;

        setVisibleColumns(prev => ({
            ...prev,
            [currentTableKey]: {
                drag: true,
                attribute: true,
                multipleUpload: false,
                mainImage1: false,
                mainImage2: false,
                mainImage3: false,
                preview: false,
                thumbnail: false,
            }
        }));
    };

    const getAvailableColumns = (variant) => {
        const columns = [
            { key: 'drag', label: 'Drag', alwaysVisible: true },
            { key: 'attribute', label: 'Attribute', alwaysVisible: true },
            { key: 'multipleUpload', label: 'Multiple Upload', alwaysVisible: false },
            { key: 'mainImage1', label: 'Main Image 1', alwaysVisible: false },
            { key: 'mainImage2', label: 'Main Image 2', alwaysVisible: false },
            { key: 'mainImage3', label: 'Main Image 3', alwaysVisible: false },
            { key: 'preview', label: 'Preview', alwaysVisible: false },
            { key: 'thumbnail', label: 'Thumbnail', alwaysVisible: false },
        ];

        return columns.filter(col => !col.alwaysVisible);
    };

    const getTableVisibleColumns = (tableKey) => {
        return visibleColumns[tableKey] || {
            drag: true,
            attribute: true,
            multipleUpload: true,
            mainImage1: true,
            mainImage2: true,
            mainImage3: true,
            preview: true,
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
    const handleOpenGuideDialog = (variantIndex) => {
        setCurrentVariantIndex(variantIndex);
        const variant = product_variants[variantIndex];

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
        // TODO: Implement guide saving to product_variants
        handleCloseGuideDialog();
    };

    const handleOpenFile = (guide) => {
        if (!guide.guide_file) return;

        let fileUrl = typeof guide.guide_file === 'string'
            ? guide.guide_file
            : URL.createObjectURL(guide.guide_file);

        window.open(fileUrl, '_blank');
    };

    // Remove all images from a column
    const handleRemoveAllImages = (columnType, variantIndex) => {
        if (!product_variants?.[variantIndex]?.variant_attributes) return;

        const imageKeyMap = {
            'mainImage1': 'main_images[0]',
            'mainImage2': 'main_images[1]',
            'mainImage3': 'main_images[2]',
            'preview': 'preview_image',
            'thumbnail': 'thumbnail'
        };

        const imageKey = imageKeyMap[columnType];
        if (!imageKey) return;

        product_variants[variantIndex].variant_attributes.forEach((attribute, attributeIndex) => {
            let hasImage = false;
            if (imageKey.startsWith('main_images')) {
                const index = parseInt(imageKey.match(/\[(\d+)\]/)[1]);
                hasImage = attribute.main_images && attribute.main_images[index];
            } else {
                hasImage = attribute[imageKey];
            }

            if (hasImage) {
                handleImageRemove(variantIndex, attributeIndex, imageKey);
            }
        });
    };

    // Check if a column has any images
    const hasColumnImages = (columnType, variantIndex) => {
        if (!product_variants?.[variantIndex]?.variant_attributes) return false;

        return product_variants[variantIndex].variant_attributes.some(attribute => {
            switch (columnType) {
                case 'mainImage1':
                    return attribute.main_images && attribute.main_images[0];
                case 'mainImage2':
                    return attribute.main_images && attribute.main_images[1];
                case 'mainImage3':
                    return attribute.main_images && attribute.main_images[2];
                case 'preview':
                    return attribute.preview_image;
                case 'thumbnail':
                    return attribute.thumbnail;
                default:
                    return false;
            }
        });
    };

    // Image Header Cell Component
    const ImageHeaderCell = ({ columnKey, displayName, variantIndex }) => {
        const hasImages = hasColumnImages(columnKey, variantIndex);

        return (
            <TableCell
                align="center"
                sx={{
                    wordBreak: "keep-all",
                    fontWeight: 600,
                    py: 2,
                    position: 'relative',
                    backgroundColor: '#f5f5f5',
                    transition: 'background-color 0.2s ease',
                    minWidth: 120
                }}
                onMouseEnter={() => setHoveredHeader(columnKey)}
                onMouseLeave={() => setHoveredHeader(null)}
            >
                {displayName}
                {hasImages && hoveredHeader === columnKey && (
                    <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => handleRemoveAllImages(columnKey, variantIndex)}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            right: 4,
                            transform: 'translateY(-50%)',
                            minWidth: 'auto',
                            width: 24,
                            height: 24,
                            fontSize: '12px',
                            padding: 0,
                            borderRadius: '50%',
                        }}
                        title={`Remove all ${displayName}`}
                    >
                        ×
                    </Button>
                )}
            </TableCell>
        );
    };

    // Attribute Cell with Tooltip Component
    const AttributeCell = ({ variant, variantIndex, attributeName }) => {
        const hasGuide = variant.guide && variant.guide.length > 0 && variant.guide[0];
        const guide = hasGuide ? variant.guide[0] : null;
        const isImage = guide && isImageFile(guide.guide_file);
        const fileUrl = guide?.guide_file_url || (guide?.guide_file ? createObjectURL(guide.guide_file) : null);

        return (
            <TableCell align="center" sx={{ wordBreak: "keep-all", width: 200, fontWeight: 600, py: 2 }}>
                <Tooltip
                    title={
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
                                                title="Click to open in new tab"
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
                                        onClick={() => handleOpenGuideDialog(variantIndex)}
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
                                        onClick={() => handleOpenGuideDialog(variantIndex)}
                                    >
                                        Add Guide
                                    </Button>
                                </Box>
                            )}
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
                                boxShadow: 1,
                                maxWidth: 400
                            }
                        }
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Typography>
                            {attributeName}
                        </Typography>
                        <EditIcon
                            fontSize="small"
                            sx={{
                                cursor: 'pointer',
                                color: 'primary.main',
                                '&:hover': {
                                    color: 'primary.dark'
                                }
                            }}
                            onClick={() => handleOpenGuideDialog(variantIndex)}
                        />
                    </Box>
                </Tooltip>
            </TableCell>
        );
    };

    const handleSeeMore = () => {
        setShowAll(!showAll);
    };

    return (
        <Box>
            {product_variants?.map((variant, variantIndex) => {
                const tableKey = variant.variant_name;
                const tableVisibleColumns = getTableVisibleColumns(tableKey);
                const availableColumns = getAvailableColumns(variant);

                return (
                    <DraggableTableContainer
                        key={variantIndex}
                        index={variantIndex}
                        onDragStart={handleTableDragStart}
                        onDragOver={handleTableDragOver}
                        onDrop={handleTableDrop}
                        onDragEnd={handleTableDragEnd}
                        isDragging={draggingTableIndex === variantIndex}
                        isDragOver={dragOverTableIndex === variantIndex}
                        sx={{ mb: 4 }}
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
                                    <Typography variant="h6" fontWeight={600} color="primary">
                                        {tableKey}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {variant.variant_attributes?.length || 0} attribute(s)
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    startIcon={<ViewColumnIcon />}
                                    onClick={(e) => handleColumnMenuOpen(e, tableKey)}
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
                                            checked={tableVisibleColumns[column.key]}
                                        />
                                        <Typography variant="body2">
                                            {column.label}
                                        </Typography>
                                    </MenuItem>
                                ))}
                            </Box>
                        </Popover>

                        {/* Variations Table - Images Only */}
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
                                                variant={variant}
                                                variantIndex={variantIndex}
                                                attributeName="Attribute"
                                            />
                                        )}
                                        {tableVisibleColumns.multipleUpload && (
                                            <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                                Multi Upload
                                            </TableCell>
                                        )}
                                        {tableVisibleColumns.mainImage1 && (
                                            <ImageHeaderCell
                                                columnKey="mainImage1"
                                                displayName="Main Image 1"
                                                variantIndex={variantIndex}
                                            />
                                        )}
                                        {tableVisibleColumns.mainImage2 && (
                                            <ImageHeaderCell
                                                columnKey="mainImage2"
                                                displayName="Main Image 2"
                                                variantIndex={variantIndex}
                                            />
                                        )}
                                        {tableVisibleColumns.mainImage3 && (
                                            <ImageHeaderCell
                                                columnKey="mainImage3"
                                                displayName="Main Image 3"
                                                variantIndex={variantIndex}
                                            />
                                        )}
                                        {tableVisibleColumns.preview && (
                                            <ImageHeaderCell
                                                columnKey="preview"
                                                displayName="Preview"
                                                variantIndex={variantIndex}
                                            />
                                        )}
                                        {tableVisibleColumns.thumbnail && (
                                            <ImageHeaderCell
                                                columnKey="thumbnail"
                                                displayName="Thumbnail"
                                                variantIndex={variantIndex}
                                            />
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <VariationTableRow
                                        variant={variant}
                                        variantIndex={variantIndex}
                                        onRowReorder={handleProductVariantReorder}
                                        visibleColumns={tableVisibleColumns}
                                        isSynced={isSynced}
                                    />
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* See More/Less Button - if pagination is needed */}
                        {variant.variant_attributes.length > 5 && (
                            <Box align="center" sx={{ py: 2 }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        minWidth: '120px',
                                        backgroundColor: '#e3f2fd',
                                        '&:hover': {
                                            backgroundColor: '#bbdefb'
                                        }
                                    }}
                                    onClick={handleSeeMore}
                                >
                                    {showAll ? "See Less" : `See More (+${variant.variant_attributes.length - 5})`}
                                </Button>
                            </Box>
                        )}
                    </DraggableTableContainer>
                );
            })}

            {/* Guide Dialog */}
            <Dialog
                open={guideDialogOpen}
                onClose={handleCloseGuideDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {currentVariantIndex !== null && product_variants[currentVariantIndex]?.guide?.length > 0 ? 'Edit Guide' : 'Add Guide'}
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

export default VariationsTable;
