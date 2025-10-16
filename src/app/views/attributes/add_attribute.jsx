import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Box,
    Button,
    Paper,
    Typography,
    TextField,
    IconButton,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    OutlinedInput,
    Checkbox,
    ListItemText,
    FormControlLabel,
    Switch,
    CircularProgress,
    Divider,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Breadcrumbs,
    Link,
    Alert,
    Card,
    CardContent,
    CardHeader,
    Collapse
} from "@mui/material";
import {
    Delete as DeleteIcon,
    Add as AddIcon,
    Home as HomeIcon,
    List as ListIcon,
    Apps as AppsIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    DragIndicator as DragIndicatorIcon
} from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ApiService } from "../../services/ApiService";
import {ROUTE_CONSTANT} from "../../constant/routeContanst";
import ConfirmModal from "../../components/ConfirmModal";

// Reorder function for drag and drop
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // Update sortOrder based on new position
    return result.map((item, index) => ({
        ...item,
        sortOrder: index + 1
    }));
};

// Helper function to ensure all items have proper IDs
const ensureIds = (items) => {
    return items.map((item, index) => ({
        ...item,
        id: item.id || item._id || `temp-${Date.now()}-${index}`,
        sortOrder: item.sortOrder || index + 1
    }));
};

const AddAttribute = () => {
    const [attributeData, setAttributeData] = useState({
        name: "",
        type: "",
        categories: [],
        viewOnProductPage: true,
        viewInFilters: true,
        status: true,
        isMultiSelect: false
    });
    const [attributeValues, setAttributeValues] = useState([
        { id: `temp-${Date.now()}-0`, value: "", sortOrder: 1, status: true }
    ]);
    const [subAttributes, setSubAttributes] = useState([
        { id: `temp-${Date.now()}-0`, name: "", type: "Text", values: [], sortOrder: 1 }
    ]);
    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [expandedSubAttr, setExpandedSubAttr] = useState({});
    const [categories, setCategories] = useState([]);
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        type: "",
        msg: "",
        onConfirm: null
    });

    const attributeId = searchParams.get("id");

    useEffect(() => {
        fetchCategories();

        if (attributeId) {
            fetchAttributeDetails(attributeId);
        }
    }, [attributeId]);

    const showConfirmModal = (type, msg, onConfirm) => {
        setConfirmModal({
            open: true,
            type,
            msg,
            onConfirm
        });
    };

    const closeConfirmModal = () => {
        setConfirmModal({
            open: false,
            type: "",
            msg: "",
            onConfirm: null
        });
    };

    const handleConfirm = () => {
        if (confirmModal.onConfirm) {
            confirmModal.onConfirm();
        }
        closeConfirmModal();
    };

    const fetchCategories = async () => {
        try {
            // Using dummy categories for now
            const dummyCategories = [
                { id: 1, name: "Jewelry" },
                { id: 2, name: "Rings" },
                { id: 3, name: "Necklaces" },
                { id: 4, name: "Bracelets" },
                { id: 5, name: "Earrings" },
            ];
            setCategories(dummyCategories);
        } catch (error) {
            console.error("Error fetching categories:", error);
            showConfirmModal("error", "Error fetching categories");
        }
    };

    const fetchAttributeDetails = async (id) => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem("auth_key");

            const response = await ApiService.get("get-attribute-list", accessToken);

            if (response.data.success) {
                const attributes = response.data.data || [];
                const attribute = attributes.find(attr => attr._id === id);

                if (attribute) {
                    setAttributeData({
                        name: attribute.name,
                        type: attribute.type,
                        categories: attribute.categories || [],
                        viewOnProductPage: attribute.viewOnProductPage !== undefined ? attribute.viewOnProductPage : true,
                        viewInFilters: attribute.viewInFilters !== undefined ? attribute.viewInFilters : true,
                        status: attribute.status !== undefined ? attribute.status : true,
                        isMultiSelect: attribute.multiSelect || false
                    });

                    // Ensure attribute values have proper IDs
                    if (attribute.values && attribute.values.length > 0) {
                        const valuesWithIds = ensureIds(attribute.values.map((val, index) => ({
                            ...val,
                            value: val.value || "",
                            status: val.status !== undefined ? val.status : true
                        })));
                        setAttributeValues(valuesWithIds);
                    } else if (attribute.type === "Dropdown") {
                        setAttributeValues([{ id: `temp-${Date.now()}-0`, value: "", sortOrder: 1, status: true }]);
                    }

                    // Ensure sub-attributes have proper IDs
                    if (attribute.subAttributes && attribute.subAttributes.length > 0) {
                        const subAttrsWithIds = ensureIds(attribute.subAttributes.map((subAttr, index) => {
                            // Ensure sub-attribute values have proper IDs
                            const valuesWithIds = subAttr.values && subAttr.values.length > 0
                                ? ensureIds(subAttr.values.map((val, valIndex) => ({
                                    ...val,
                                    value: val.value || "",
                                    status: val.status !== undefined ? val.status : true
                                })))
                                : [];

                            return {
                                ...subAttr,
                                name: subAttr.name || "",
                                type: subAttr.type || "Text",
                                isMultiSelect: subAttr.multiSelect || false,
                                values: valuesWithIds
                            };
                        }));
                        setSubAttributes(subAttrsWithIds);
                    } else if (attribute.type === "Compound") {
                        setSubAttributes([{ id: `temp-${Date.now()}-0`, name: "", type: "Text", values: [], sortOrder: 1 }]);
                    }

                    setIsEdit(true);
                } else {
                    showConfirmModal("error", "Attribute not found", () => {
                        navigate(ROUTE_CONSTANT.catalog.attribute.list);
                    });
                }
            } else {
                showConfirmModal("error", "Failed to fetch attribute details", () => {
                    navigate(ROUTE_CONSTANT.catalog.attribute.list);
                });
            }
        } catch (error) {
            console.error("Error fetching attribute details:", error);
            showConfirmModal("error", "Error fetching attribute details", () => {
                navigate(ROUTE_CONSTANT.catalog.attribute.list);
            });
        } finally {
            setLoading(false);
        }
    };

    // Drag and Drop Handlers
    const onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const { source, destination, type } = result;

        // Handle main attribute values drag and drop
        if (type === 'attributeValues') {
            const reorderedValues = reorder(
                attributeValues,
                source.index,
                destination.index
            );
            setAttributeValues(reorderedValues);
        }
        // Handle sub-attributes drag and drop
        else if (type === 'subAttributes') {
            const reorderedSubAttributes = reorder(
                subAttributes,
                source.index,
                destination.index
            );
            setSubAttributes(reorderedSubAttributes);
        }
        // Handle sub-attribute values drag and drop
        else if (type.startsWith('subAttributeValues-')) {
            const subAttrId = type.replace('subAttributeValues-', '');
            const updatedSubAttributes = subAttributes.map(subAttr => {
                if (subAttr.id === subAttrId) {
                    const reorderedValues = reorder(
                        subAttr.values,
                        source.index,
                        destination.index
                    );
                    return { ...subAttr, values: reorderedValues };
                }
                return subAttr;
            });
            setSubAttributes(updatedSubAttributes);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, checked } = e.target;

        // If type is changing, reset values if needed
        if (name === "type") {
            const newType = value;
            const oldType = attributeData.type;

            // If switching to/from dropdown, reset values
            if (newType === "Dropdown" && oldType !== "Dropdown") {
                setAttributeValues([{ id: `temp-${Date.now()}-0`, value: "", sortOrder: 1, status: true }]);
                setAttributeData(prev => ({ ...prev, isMultiSelect: false }));
            } else if (newType !== "Dropdown" && oldType === "Dropdown") {
                setAttributeValues([]);
            }

            // If switching to compound, reset sub-attributes
            if (newType === "Compound" && oldType !== "Compound") {
                setSubAttributes([{ id: `temp-${Date.now()}-0`, name: "", type: "Text", values: [], sortOrder: 1 }]);
            } else if (newType !== "Compound" && oldType === "Compound") {
                setSubAttributes([]);
            }
        }

        setAttributeData(prev => ({
            ...prev,
            [name]: e.target.type === 'checkbox' ? checked : value
        }));
    };

    const handleCategoryChange = (event) => {
        const {
            target: { value },
        } = event;
        setAttributeData(prev => ({
            ...prev,
            categories: typeof value === 'string' ? value.split(',') : value,
        }));
    };

    // Attribute Values Functions
    const handleAddValue = () => {
        const newSortOrder = attributeValues.length > 0
            ? Math.max(...attributeValues.map(v => v.sortOrder)) + 1
            : 1;

        setAttributeValues([
            ...attributeValues,
            { id: `temp-${Date.now()}-${attributeValues.length}`, value: "", sortOrder: newSortOrder, status: true }
        ]);
    };

    const handleRemoveValue = (id) => {
        if (attributeValues.length > 1) {
            const updatedValues = attributeValues.filter(value => value.id !== id);
            // Recalculate sortOrder after removal
            const reorderedValues = updatedValues.map((value, index) => ({
                ...value,
                sortOrder: index + 1
            }));
            setAttributeValues(reorderedValues);
        }
    };

    const handleValueChange = (id, field, value) => {
        setAttributeValues(prevValues =>
            prevValues.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    // Sub-Attributes Functions
    const handleAddSubAttribute = () => {
        const newSortOrder = subAttributes.length > 0
            ? Math.max(...subAttributes.map(sa => sa.sortOrder || 0)) + 1
            : 1;

        setSubAttributes([
            ...subAttributes,
            {
                id: `temp-${Date.now()}-${subAttributes.length}`,
                name: "",
                type: "Text",
                values: [],
                sortOrder: newSortOrder
            }
        ]);
    };

    const handleRemoveSubAttribute = (id) => {
        if (subAttributes.length > 1) {
            const updatedSubAttributes = subAttributes.filter(attr => attr.id !== id);
            // Recalculate sortOrder after removal
            const reorderedSubAttributes = updatedSubAttributes.map((attr, index) => ({
                ...attr,
                sortOrder: index + 1
            }));
            setSubAttributes(reorderedSubAttributes);
            setExpandedSubAttr(prev => {
                const newExpanded = { ...prev };
                delete newExpanded[id];
                return newExpanded;
            });
        }
    };

    const handleSubAttributeChange = (id, field, value) => {
        setSubAttributes(prevAttributes =>
            prevAttributes.map(attr =>
                attr.id === id ? { ...attr, [field]: value } : attr
            )
        );
    };

    const handleSubAttributeValueChange = (subAttrId, valueIndex, field, value) => {
        setSubAttributes(prevAttributes =>
            prevAttributes.map(attr => {
                if (attr.id === subAttrId) {
                    const newValues = [...attr.values];
                    if (!newValues[valueIndex]) {
                        newValues[valueIndex] = {
                            id: `temp-${Date.now()}-${valueIndex}`,
                            value: "",
                            sortOrder: valueIndex + 1,
                            status: true
                        };
                    }
                    newValues[valueIndex] = { ...newValues[valueIndex], [field]: value };
                    return { ...attr, values: newValues };
                }
                return attr;
            })
        );
    };

    const handleAddSubAttributeValue = (subAttrId) => {
        setSubAttributes(prevAttributes =>
            prevAttributes.map(attr => {
                if (attr.id === subAttrId) {
                    const newSortOrder = attr.values.length > 0
                        ? Math.max(...attr.values.map(v => v.sortOrder)) + 1
                        : 1;

                    const newValues = [
                        ...attr.values,
                        {
                            id: `temp-${Date.now()}-${attr.values.length}`,
                            value: "",
                            sortOrder: newSortOrder,
                            status: true
                        }
                    ];
                    return { ...attr, values: newValues };
                }
                return attr;
            })
        );
    };

    const handleRemoveSubAttributeValue = (subAttrId, valueId) => {
        setSubAttributes(prevAttributes =>
            prevAttributes.map(attr => {
                if (attr.id === subAttrId) {
                    const updatedValues = attr.values.filter(val => val.id !== valueId);
                    // Recalculate sortOrder after removal
                    const reorderedValues = updatedValues.map((value, index) => ({
                        ...value,
                        sortOrder: index + 1
                    }));
                    return { ...attr, values: reorderedValues };
                }
                return attr;
            })
        );
    };

    const toggleSubAttributeExpansion = (subAttrId) => {
        setExpandedSubAttr(prev => ({
            ...prev,
            [subAttrId]: !prev[subAttrId]
        }));
    };

    const preparePayload = () => {
        const basePayload = {
            name: attributeData.name,
            type: attributeData.type,
            status: attributeData.status,
            viewOnProductPage: attributeData.viewOnProductPage,
            viewInFilters: attributeData.viewInFilters,
        };

        // Add multiSelect for dropdown type
        if (attributeData.type === "Dropdown") {
            basePayload.multiSelect = attributeData.isMultiSelect;
        }

        // Add values for dropdown type
        if (attributeData.type === "Dropdown" && attributeValues.length > 0) {
            basePayload.values = attributeValues.map(val => ({
                value: val.value,
                sortOrder: val.sortOrder,
                status: val.status
            }));
        }

        // Add subAttributes for compound type
        if (attributeData.type === "Compound" && subAttributes.length > 0) {
            basePayload.subAttributes = subAttributes.map(subAttr => {
                const subAttrPayload = {
                    name: subAttr.name,
                    type: subAttr.type,
                    sortOrder: subAttr.sortOrder || 1
                };

                // Add multiSelect for dropdown sub-attributes
                if (subAttr.type === "Dropdown") {
                    subAttrPayload.multiSelect = subAttr.isMultiSelect || false;
                }

                // Add values for dropdown sub-attributes
                if (subAttr.type === "Dropdown" && subAttr.values.length > 0) {
                    subAttrPayload.values = subAttr.values.map(val => ({
                        value: val.value,
                        sortOrder: val.sortOrder,
                        status: val.status
                    }));
                }

                return subAttrPayload;
            });
        }

        return basePayload;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validate form based on attribute type
        if (attributeData.name.trim() === "") {
            showConfirmModal("error", "Attribute name is required!");
            setLoading(false);
            return;
        }

        if (attributeData.type === "") {
            showConfirmModal("error", "Attribute type is required!");
            setLoading(false);
            return;
        }

        // For dropdown, validate that values are provided
        if (attributeData.type === "Dropdown" && attributeValues.some(val => val.value.trim() === "")) {
            showConfirmModal("error", "All attribute values must be filled!");
            setLoading(false);
            return;
        }

        // For compound attributes, validate sub-attributes
        if (attributeData.type === "Compound") {
            const invalidSubAttr = subAttributes.find(attr => attr.name.trim() === "" || attr.type === "");
            if (invalidSubAttr) {
                showConfirmModal("error", "All sub-attributes must have a name and type!");
                setLoading(false);
                return;
            }

            // Validate dropdown sub-attribute values
            for (const subAttr of subAttributes) {
                if ((subAttr.type === "Dropdown") && subAttr.values.some(val => val.value.trim() === "")) {
                    showConfirmModal("error", `All values for sub-attribute "${subAttr.name}" must be filled!`);
                    setLoading(false);
                    return;
                }
            }
        }

        try {
            const payload = preparePayload();
            console.log("Payload:", payload);

            const accessToken = localStorage.getItem("auth_key");

            if (isEdit) {
                const response = await ApiService.post(`update-attribute-list/${attributeId}`, payload, accessToken);

                if(response.data.success) {
                    showConfirmModal("success", "Attribute updated successfully!", () => {
                        navigate(ROUTE_CONSTANT.catalog.attribute.list);
                    });
                } else {
                    showConfirmModal("error", response.data.message || "Failed to update attribute");
                }
            } else {
                const response = await ApiService.post("create-attribute-list", payload, accessToken);

                if (response.data.success) {
                    showConfirmModal("success", "Attribute created successfully!", () => {
                        navigate(ROUTE_CONSTANT.catalog.attribute.list);
                    });
                } else {
                    showConfirmModal("error", response.data.message || "Failed to create attribute");
                }
            }
        } catch (error) {
            console.error("Error saving attribute:", error);
            showConfirmModal("error", error.response.data.message.includes("E11000 duplicate key error collection: ecommerce.attributelists index: name_1 dup key:") ? "This Attribute already created" : error.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        showConfirmModal("warning", "Are you sure you want to reset all fields?", () => {
            setAttributeData({
                name: "",
                type: "",
                categories: [],
                viewOnProductPage: true,
                viewInFilters: true,
                status: true,
                isMultiSelect: false
            });
            setAttributeValues([{ id: `temp-${Date.now()}-0`, value: "", sortOrder: 1, status: true }]);
            setSubAttributes([{ id: `temp-${Date.now()}-0`, name: "", type: "Text", values: [], sortOrder: 1 }]);
            setExpandedSubAttr({});
        });
    };

    const attributeTypes = [
        "Text",
        "Number",
        "Yes/No",
        "Dropdown",
        "Compound"
    ];

    const subAttributeTypes = [
        "Text",
        "Number",
        "Yes/No",
        "Dropdown"
    ];

    // Determine if values section should be shown
    const showValuesSection = attributeData.type === "Dropdown";

    // Determine if sub-attributes section should be shown
    const showSubAttributesSection = attributeData.type === "Compound";

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link color="inherit" href="#" sx={{ display: 'flex', alignItems: 'center' }}>
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Home
                </Link>
                <Link
                    color="inherit"
                    onClick={() => navigate(ROUTE_CONSTANT.catalog.attribute.list)}
                    sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                >
                    <ListIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Attributes
                </Link>
                <Typography color="text.primary">{isEdit ? 'Edit Attribute' : 'Add Attribute'}</Typography>
            </Breadcrumbs>

            <Box sx={{ py: "16px", marginBottom: "20px" }} component={Paper}>
                <Stack sx={{ ml: "24px", mb: "12px" }} gap={1} direction={"row"}>
                    <AppsIcon />
                    <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Go To</Typography>
                </Stack>
                <Divider />
                <Box sx={{ ml: "24px", mt: "16px" }}>
                    <Button
                        onClick={() => navigate(ROUTE_CONSTANT.catalog.attribute.list)}
                        startIcon={<AppsIcon />}
                        variant="contained"
                    >
                        Attributes List
                    </Button>
                </Box>
            </Box>

            <Box sx={{ py: "16px" }} component={Paper}>
                <Stack sx={{ ml: "16px", mb: "12px" }} gap={1} direction={"row"}>
                    <AppsIcon />
                    <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>
                        {isEdit ? "Edit Attribute" : "Add Attribute"}
                    </Typography>
                </Stack>
                <Divider />

                <Box sx={{ p: 3 }}>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        Attributes are questions or fields that will appear when adding products.
                                        The attribute type determines what kind of input field will be shown to users.
                                    </Alert>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Attribute Name"
                                        name="name"
                                        value={attributeData.name}
                                        onChange={handleInputChange}
                                        required
                                        helperText="This will be the label shown to users when adding products"
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Attribute Type *</InputLabel>
                                        <Select
                                            name="type"
                                            value={attributeData.type}
                                            label="Attribute Type"
                                            onChange={handleInputChange}
                                            required
                                        >
                                            {attributeTypes.map(type => (
                                                <MenuItem key={type} value={type}>{type}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {attributeData.type === "Dropdown" && (
                                    <Grid item xs={12} md={6}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={attributeData.isMultiSelect}
                                                    onChange={handleInputChange}
                                                    name="isMultiSelect"
                                                />
                                            }
                                            label="Multi-select"
                                        />
                                        <Alert severity="info" sx={{ mt: 1 }}>
                                            {attributeData.isMultiSelect
                                                ? "Users will be able to select multiple options"
                                                : "Users will be able to select only one option"}
                                        </Alert>
                                    </Grid>
                                )}

                                {showValuesSection && (
                                    <Grid item xs={12}>
                                        <Typography variant="h6" gutterBottom>
                                            Attribute Values
                                        </Typography>
                                        <Alert severity="info" sx={{ mb: 2 }}>
                                            Add the possible values that users can choose from when they encounter this attribute.
                                            You can drag and drop to reorder the values.
                                        </Alert>
                                        <TableContainer sx={{paddingX: 2}} component={Paper} variant="outlined">
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell width="50px">Drag</TableCell>
                                                        <TableCell>Value *</TableCell>
                                                        <TableCell width="100px">Sort Order</TableCell>
                                                        <TableCell width="100px">Status</TableCell>
                                                        <TableCell width="100px">Action</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <Droppable droppableId="attributeValues" type="attributeValues">
                                                    {(provided) => (
                                                        <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                                                            {attributeValues.map((value, index) => (
                                                                <Draggable
                                                                    key={value.id}
                                                                    draggableId={value.id.toString()}
                                                                    index={index}
                                                                >
                                                                    {(provided, snapshot) => (
                                                                        <TableRow
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            style={{
                                                                                ...provided.draggableProps.style,
                                                                                backgroundColor: snapshot.isDragging ? '#f5f5f5' : 'inherit',
                                                                            }}
                                                                        >
                                                                            <TableCell>
                                                                                <IconButton
                                                                                    {...provided.dragHandleProps}
                                                                                    size="small"
                                                                                    sx={{ cursor: 'grab' }}
                                                                                >
                                                                                    <DragIndicatorIcon />
                                                                                </IconButton>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <TextField
                                                                                    fullWidth
                                                                                    size="small"
                                                                                    value={value.value}
                                                                                    onChange={(e) => handleValueChange(value.id, 'value', e.target.value)}
                                                                                    placeholder="Enter option value"
                                                                                    required
                                                                                />
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <TextField
                                                                                    type="number"
                                                                                    size="small"
                                                                                    value={value.sortOrder}
                                                                                    onChange={(e) => handleValueChange(value.id, 'sortOrder', parseInt(e.target.value))}
                                                                                />
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Switch
                                                                                    checked={value.status}
                                                                                    onChange={(e) => handleValueChange(value.id, 'status', e.target.checked)}
                                                                                />
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <IconButton
                                                                                    onClick={() => handleRemoveValue(value.id)}
                                                                                    color="error"
                                                                                    disabled={attributeValues.length <= 1}
                                                                                >
                                                                                    <DeleteIcon />
                                                                                </IconButton>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}
                                                        </TableBody>
                                                    )}
                                                </Droppable>
                                            </Table>
                                        </TableContainer>
                                        <Button
                                            onClick={handleAddValue}
                                            variant="outlined"
                                            startIcon={<AddIcon />}
                                            sx={{ mt: 2 }}
                                        >
                                            Add Value
                                        </Button>
                                    </Grid>
                                )}

                                {showSubAttributesSection && (
                                    <Grid item xs={12}>
                                        <Typography variant="h6" gutterBottom>
                                            Sub-Attributes
                                        </Typography>
                                        <Alert severity="info" sx={{ mb: 2 }}>
                                            Compound attributes contain multiple sub-attributes. Each sub-attribute can have its own type and values.
                                            You can drag and drop to reorder the sub-attributes.
                                        </Alert>

                                        <Droppable droppableId="subAttributes" type="subAttributes">
                                            {(provided) => (
                                                <Box ref={provided.innerRef} {...provided.droppableProps}>
                                                    {subAttributes.map((subAttr, index) => (
                                                        <Draggable
                                                            key={subAttr.id}
                                                            draggableId={subAttr.id.toString()}
                                                            index={index}
                                                        >
                                                            {(provided, snapshot) => (
                                                                <Card
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    sx={{
                                                                        mb: 2,
                                                                        backgroundColor: snapshot.isDragging ? '#f5f5f5' : 'inherit',
                                                                    }}
                                                                >
                                                                    <CardHeader
                                                                        action={
                                                                            <Box>
                                                                                <IconButton
                                                                                    {...provided.dragHandleProps}
                                                                                    aria-label="drag"
                                                                                    sx={{ cursor: 'grab' }}
                                                                                >
                                                                                    <DragIndicatorIcon />
                                                                                </IconButton>
                                                                                <IconButton
                                                                                    onClick={() => toggleSubAttributeExpansion(subAttr.id)}
                                                                                    aria-label="expand"
                                                                                >
                                                                                    {expandedSubAttr[subAttr.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                                                </IconButton>
                                                                                <IconButton
                                                                                    onClick={() => handleRemoveSubAttribute(subAttr.id)}
                                                                                    color="error"
                                                                                    disabled={subAttributes.length <= 1}
                                                                                >
                                                                                    <DeleteIcon />
                                                                                </IconButton>
                                                                            </Box>
                                                                        }
                                                                        title={
                                                                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                                                <TextField
                                                                                    label="Sub-Attribute Name"
                                                                                    value={subAttr.name}
                                                                                    onChange={(e) => handleSubAttributeChange(subAttr.id, 'name', e.target.value)}
                                                                                    size="small"
                                                                                    sx={{ width: 200 }}
                                                                                    required
                                                                                />
                                                                                <FormControl size="small" sx={{ width: 150 }}>
                                                                                    <InputLabel>Type</InputLabel>
                                                                                    <Select
                                                                                        value={subAttr.type}
                                                                                        label="Type"
                                                                                        onChange={(e) => handleSubAttributeChange(subAttr.id, 'type', e.target.value)}
                                                                                        required
                                                                                    >
                                                                                        {subAttributeTypes.map(type => (
                                                                                            <MenuItem key={type} value={type}>{type}</MenuItem>
                                                                                        ))}
                                                                                    </Select>
                                                                                </FormControl>
                                                                                {subAttr.type === "Dropdown" && (
                                                                                    <FormControlLabel
                                                                                        control={
                                                                                            <Switch
                                                                                                checked={subAttr.isMultiSelect || false}
                                                                                                onChange={(e) => handleSubAttributeChange(subAttr.id, 'isMultiSelect', e.target.checked)}
                                                                                            />
                                                                                        }
                                                                                        label="Multi-select"
                                                                                    />
                                                                                )}
                                                                            </Box>
                                                                        }
                                                                    />
                                                                    <Collapse in={expandedSubAttr[subAttr.id]} timeout="auto" unmountOnExit>
                                                                        <CardContent>
                                                                            {subAttr.type === "Dropdown" && (
                                                                                <>
                                                                                    <Typography variant="subtitle1" gutterBottom>
                                                                                        Values for {subAttr.name}
                                                                                    </Typography>
                                                                                    <Alert severity="info" sx={{ mb: 2 }}>
                                                                                        You can drag and drop to reorder the values.
                                                                                    </Alert>
                                                                                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, paddingX: 2 }}>
                                                                                        <Table size="small">
                                                                                            <TableHead>
                                                                                                <TableRow>
                                                                                                    <TableCell width="50px">Drag</TableCell>
                                                                                                    <TableCell>Value *</TableCell>
                                                                                                    <TableCell width="100px">Sort Order</TableCell>
                                                                                                    <TableCell width="100px">Status</TableCell>
                                                                                                    <TableCell width="100px">Action</TableCell>
                                                                                                </TableRow>
                                                                                            </TableHead>
                                                                                            <Droppable droppableId={`subAttributeValues-${subAttr.id}`} type={`subAttributeValues-${subAttr.id}`}>
                                                                                                {(provided) => (
                                                                                                    <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                                                                                                        {subAttr.values.map((value, index) => (
                                                                                                            <Draggable
                                                                                                                key={value.id}
                                                                                                                draggableId={value.id.toString()}
                                                                                                                index={index}
                                                                                                            >
                                                                                                                {(provided, snapshot) => (
                                                                                                                    <TableRow
                                                                                                                        ref={provided.innerRef}
                                                                                                                        {...provided.draggableProps}
                                                                                                                        style={{
                                                                                                                            ...provided.draggableProps.style,
                                                                                                                            backgroundColor: snapshot.isDragging ? '#f5f5f5' : 'inherit',
                                                                                                                        }}
                                                                                                                    >
                                                                                                                        <TableCell>
                                                                                                                            <IconButton
                                                                                                                                {...provided.dragHandleProps}
                                                                                                                                size="small"
                                                                                                                                sx={{ cursor: 'grab' }}
                                                                                                                            >
                                                                                                                                <DragIndicatorIcon />
                                                                                                                            </IconButton>
                                                                                                                        </TableCell>
                                                                                                                        <TableCell>
                                                                                                                            <TextField
                                                                                                                                fullWidth
                                                                                                                                size="small"
                                                                                                                                value={value.value}
                                                                                                                                onChange={(e) => handleSubAttributeValueChange(subAttr.id, index, 'value', e.target.value)}
                                                                                                                                placeholder="Enter option value"
                                                                                                                                required
                                                                                                                            />
                                                                                                                        </TableCell>
                                                                                                                        <TableCell>
                                                                                                                            <TextField
                                                                                                                                type="number"
                                                                                                                                size="small"
                                                                                                                                value={value.sortOrder}
                                                                                                                                onChange={(e) => handleSubAttributeValueChange(subAttr.id, index, 'sortOrder', parseInt(e.target.value))}
                                                                                                                            />
                                                                                                                        </TableCell>
                                                                                                                        <TableCell>
                                                                                                                            <Switch
                                                                                                                                checked={value.status}
                                                                                                                                onChange={(e) => handleSubAttributeValueChange(subAttr.id, index, 'status', e.target.checked)}
                                                                                                                            />
                                                                                                                        </TableCell>
                                                                                                                        <TableCell>
                                                                                                                            <IconButton
                                                                                                                                onClick={() => handleRemoveSubAttributeValue(subAttr.id, value.id)}
                                                                                                                                color="error"
                                                                                                                                disabled={subAttr.values.length <= 1}
                                                                                                                            >
                                                                                                                                <DeleteIcon />
                                                                                                                            </IconButton>
                                                                                                                        </TableCell>
                                                                                                                    </TableRow>
                                                                                                                )}
                                                                                                            </Draggable>
                                                                                                        ))}
                                                                                                        {provided.placeholder}
                                                                                                    </TableBody>
                                                                                                )}
                                                                                            </Droppable>
                                                                                        </Table>
                                                                                    </TableContainer>
                                                                                    <Button
                                                                                        onClick={() => handleAddSubAttributeValue(subAttr.id)}
                                                                                        variant="outlined"
                                                                                        startIcon={<AddIcon />}
                                                                                        size="small"
                                                                                    >
                                                                                        Add Value
                                                                                    </Button>
                                                                                </>
                                                                            )}
                                                                            {subAttr.type !== "Dropdown" && (
                                                                                <Alert severity="info">
                                                                                    {subAttr.type} type sub-attribute doesn't require additional values.
                                                                                </Alert>
                                                                            )}
                                                                        </CardContent>
                                                                    </Collapse>
                                                                </Card>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </Box>
                                            )}
                                        </Droppable>

                                        <Button
                                            onClick={handleAddSubAttribute}
                                            variant="outlined"
                                            startIcon={<AddIcon />}
                                            sx={{ mt: 2 }}
                                        >
                                            Add Sub-Attribute
                                        </Button>
                                    </Grid>
                                )}

                                <Grid item xs={12} md={6}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={attributeData.viewOnProductPage}
                                                onChange={handleInputChange}
                                                name="viewOnProductPage"
                                            />
                                        }
                                        label="View on Product Page"
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={attributeData.viewInFilters}
                                                onChange={handleInputChange}
                                                name="viewInFilters"
                                            />
                                        }
                                        label="View in Filters"
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={attributeData.status}
                                                onChange={handleInputChange}
                                                name="status"
                                            />
                                        }
                                        label="Status"
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            disabled={loading}
                                            startIcon={loading ? <CircularProgress size={20} /> : null}
                                        >
                                            {isEdit ? 'Update' : 'Submit'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outlined"
                                            size="large"
                                            onClick={handleReset}
                                        >
                                            Reset
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </form>
                    </DragDropContext>
                </Box>
            </Box>

            {/* Confirm Modal */}
            <ConfirmModal
                open={confirmModal.open}
                handleClose={closeConfirmModal}
                onConfirm={handleConfirm}
                type={confirmModal.type}
                msg={confirmModal.msg}
            />
        </Box>
    );
};

export default AddAttribute;
