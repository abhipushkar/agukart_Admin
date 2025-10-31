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
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import VariationTableRow from "./VariationTableRow";
import {useProductFormStore} from "../../../../../states/useAddProducts";

// React Quill modules configuration
const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
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
        handleRowReorder,
        setCombinations
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
        price: formValues.isCheckedPrice,
        quantity: formValues.isCheckedQuantity,
        visible: true
    });

    // State for column selection menu
    const [anchorEl, setAnchorEl] = useState(null);

    // State for hovered header
    const [hoveredHeader, setHoveredHeader] = useState(null);

    // State for guide dialog
    const [guideDialogOpen, setGuideDialogOpen] = useState(false);
    const [currentCombIndex, setCurrentCombIndex] = useState(null);
    const [currentGuide, setCurrentGuide] = useState({
        guide_name: "",
        guide_file: null,
        guide_description: "",
        guide_type: "",
        guide_file_url: ""
    });

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
            return file; // Already a URL string
        }
        return URL.createObjectURL(file);
    };

    // Open guide dialog
    const handleOpenGuideDialog = (combIndex) => {
        setCurrentCombIndex(combIndex);
        const comb = combinations[combIndex];

        // Initialize current guide with existing data or empty
        if (comb.guide && comb.guide.length > 0) {
            setCurrentGuide({
                ...comb.guide[0],
                guide_file_url: comb.guide[0].guide_file ? createObjectURL(comb.guide[0].guide_file) : ""
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

    // Close guide dialog
    const handleCloseGuideDialog = () => {
        setGuideDialogOpen(false);
        setCurrentCombIndex(null);
        setCurrentGuide({
            guide_name: "",
            guide_file: null,
            guide_description: "",
            guide_type: "",
            guide_file_url: ""
        });
    };

    // Handle guide file upload in dialog
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

    // Handle guide name change in dialog
    const handleGuideNameChange = (value) => {
        setCurrentGuide(prev => ({
            ...prev,
            guide_name: value
        }));
    };

    // Handle guide description change in dialog
    const handleGuideDescriptionChange = (value) => {
        setCurrentGuide(prev => ({
            ...prev,
            guide_description: value
        }));
    };

    // Handle guide file remove in dialog
    const handleGuideFileRemove = () => {
        setCurrentGuide(prev => ({
            ...prev,
            guide_file: null,
            guide_file_url: "",
            guide_type: ""
        }));
    };

    // Save guide data
    const handleSaveGuide = () => {
        if (currentCombIndex === null) return;

        const updatedCombinations = combinations.map((comb, index) => {
            if (index === currentCombIndex) {
                return {
                    ...comb,
                    guide: [currentGuide] // Store as array with one object
                };
            }
            return comb;
        });

        setCombinations(updatedCombinations);
        handleCloseGuideDialog();
    };

    // Handle opening file in new tab
    const handleOpenFile = (guide) => {
        if (!guide.guide_file) return;

        let fileUrl;

        if (typeof guide.guide_file === 'string') {
            // If it's already a URL string
            fileUrl = guide.guide_file;
        } else {
            // If it's a File object, create object URL
            fileUrl = URL.createObjectURL(guide.guide_file);
        }

        // Open in new tab
        window.open(fileUrl, '_blank');
    };

    // Fixed handleRemoveAllImages function
    const handleRemoveAllImages = (columnType, combIndex) => {
        if (!combinations?.[combIndex]?.combinations) return;

        const imageKeyMap = {
            'mainImage1': 'main_images[0]',
            'mainImage2': 'main_images[1]',
            'mainImage3': 'main_images[2]',
            'preview': 'preview_image',
            'thumbnail': 'thumbnail'
        };

        const imageKey = imageKeyMap[columnType];
        if (!imageKey) return;

        console.log('Removing all images for:', columnType, '->', imageKey, 'in combination:', combIndex);

        combinations[combIndex].combinations.forEach((item, rowIndex) => {
            // Check if image exists
            let hasImage = false;
            if (imageKey.startsWith('main_images')) {
                const index = parseInt(imageKey.match(/\[(\d+)\]/)[1]);
                hasImage = item.main_images && item.main_images[index];
            } else {
                hasImage = item[imageKey];
            }

            if (hasImage) {
                console.log(`Removing image from row ${rowIndex}`);
                try {
                    handleImageRemove(combIndex, rowIndex, imageKey);
                } catch (error) {
                    console.error(`Error removing image from row ${rowIndex}:`, error);
                }
            }
        });
    };

    // Check if a column has any images
    const hasColumnImages = (columnType, combindex) => {
        if (!combinations?.[combindex]?.combinations) return false;

        return combinations[combindex].combinations.some(item => {
            switch (columnType) {
                case 'mainImage1':
                    return item.main_images && item.main_images[0];
                case 'mainImage2':
                    return item.main_images && item.main_images[1];
                case 'mainImage3':
                    return item.main_images && item.main_images[2];
                case 'preview':
                    return item.preview_image;
                case 'thumbnail':
                    return item.thumbnail;
                default:
                    return false;
            }
        });
    };

    // Image Header Cell Component
    const ImageHeaderCell = ({
                                 columnKey,
                                 displayName,
                                 combindex
                             }) => {
        const hasImages = hasColumnImages(columnKey, combindex);

        return (
            <TableCell
                align="center"
                sx={{
                    wordBreak: "keep-all",
                    fontWeight: 600,
                    py: 2,
                    position: 'relative',
                    backgroundColor: hoveredHeader === columnKey ? '#fff3e0' : '#f5f5f5',
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
                        onClick={() => handleRemoveAllImages(columnKey, combindex)}
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
                            borderRadius: '50%'
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
    const AttributeCell = ({ comb, combindex, attributeName, attributeKey }) => {
        const hasGuide = comb.guide && comb.guide.length > 0 && comb.guide[0];
        const guide = hasGuide ? comb.guide[0] : null;
        const isImage = guide && isImageFile(guide.guide_file);
        const fileUrl = guide?.guide_file_url || (guide?.guide_file ? createObjectURL(guide.guide_file) : null);

        return (
            <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
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
                                        onClick={() => handleOpenGuideDialog(combindex)}
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
                                        onClick={() => handleOpenGuideDialog(combindex)}
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
                            onClick={() => handleOpenGuideDialog(combindex)}
                        />
                    </Box>
                </Tooltip>
            </TableCell>
        );
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
                                        />
                                        <Typography variant="body2">
                                            {column.label}
                                        </Typography>
                                    </MenuItem>
                                ))}
                            </Box>
                        </Popover>

                        {/* Variations Table */}
                        <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0', width: "100%" }}>
                            <Table width={"100%"}>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5', width: "100%" }}>
                                        {visibleColumns.drag && (
                                            <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                                Drag
                                            </TableCell>
                                        )}
                                        {visibleColumns.attribute1 && comb.combinations[0]?.name1 && (
                                            <AttributeCell
                                                comb={comb}
                                                combindex={combindex}
                                                attributeName={comb.combinations[0]?.name1}
                                                attributeKey="attribute1"
                                            />
                                        )}
                                        {visibleColumns.attribute2 && comb.combinations[0]?.name2 && (
                                            <AttributeCell
                                                comb={comb}
                                                combindex={combindex}
                                                attributeName={comb.combinations[0]?.name2}
                                                attributeKey="attribute2"
                                            />
                                        )}
                                        {visibleColumns.multipleUpload && (
                                            <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                                Multiple Upload
                                            </TableCell>
                                        )}
                                        {visibleColumns.mainImage1 && (
                                            <ImageHeaderCell
                                                columnKey="mainImage1"
                                                displayName="Main Image 1"
                                                combindex={combindex}
                                            />
                                        )}
                                        {visibleColumns.mainImage2 && (
                                            <ImageHeaderCell
                                                columnKey="mainImage2"
                                                displayName="Main Image 2"
                                                combindex={combindex}
                                            />
                                        )}
                                        {visibleColumns.mainImage3 && (
                                            <ImageHeaderCell
                                                columnKey="mainImage3"
                                                displayName="Main Image 3"
                                                combindex={combindex}
                                            />
                                        )}
                                        {visibleColumns.preview && (
                                            <ImageHeaderCell
                                                columnKey="preview"
                                                displayName="Preview"
                                                combindex={combindex}
                                            />
                                        )}
                                        {visibleColumns.thumbnail && (
                                            <ImageHeaderCell
                                                columnKey="thumbnail"
                                                displayName="Thumbnail"
                                                combindex={combindex}
                                            />
                                        )}
                                        {(variationsData.length >= 2 ? formValues?.prices === comb.variant_name : true) && formValues?.isCheckedPrice && (
                                            <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                                Price
                                            </TableCell>
                                        )}
                                        {(variationsData.length >= 2 ? formValues?.quantities === comb.variant_name : true) && formValues?.isCheckedQuantity && (
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

            {/* Guide Dialog */}
            <Dialog
                open={guideDialogOpen}
                onClose={handleCloseGuideDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {currentCombIndex !== null && combinations[currentCombIndex]?.guide?.length > 0 ? 'Edit Guide' : 'Add Guide'}
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
                                                // Image Preview
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
                                                // Document Preview
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
