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
    Alert
} from "@mui/material";
import {
    Delete as DeleteIcon,
    Add as AddIcon,
    Home as HomeIcon,
    List as ListIcon,
    Apps as AppsIcon
} from "@mui/icons-material";

// Dummy data for attributes
const dummyAttributes = [
    { id: 1, name: "Ring Size (US size)", type: "Text", status: true, viewOnProductPage: true, viewInFilters: true, values: [] },
    { id: 2, name: "Color Variant", type: "Number", status: true, viewOnProductPage: false, viewInFilters: true, values: [] },
    { id: 3, name: "Materials", type: "Yes/No", status: false, viewOnProductPage: true, viewInFilters: false, values: [] },
    { id: 4, name: "Gemstone", type: "Dropdown", status: true, viewOnProductPage: true, viewInFilters: true, values: [
            { id: 1, value: "Diamond", sortOrder: 1, status: true },
            { id: 2, value: "Ruby", sortOrder: 2, status: true },
            { id: 3, value: "Sapphire", sortOrder: 3, status: false }
        ] },
    { id: 5, name: "Size", type: "Compound", status: true, viewOnProductPage: true, viewInFilters: true, values: [] },
];

// Dummy data for categories
const dummyCategories = [
    { id: 1, name: "Jewelry" },
    { id: 2, name: "Rings" },
    { id: 3, name: "Necklaces" },
    { id: 4, name: "Bracelets" },
    { id: 5, name: "Earrings" },
];

const AddAttribute = () => {
    const [attributeData, setAttributeData] = useState({
        name: "",
        type: "",
        categories: [],
        viewOnProductPage: true,
        viewInFilters: true,
        status: true
    });
    const [attributeValues, setAttributeValues] = useState([
        { id: Date.now(), value: "", sortOrder: 1, status: true }
    ]);
    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const attributeId = searchParams.get("id");

    useEffect(() => {
        if (attributeId) {
            // Simulate API call to fetch attribute data
            setLoading(true);
            setTimeout(() => {
                const attribute = dummyAttributes.find(attr => attr.id === parseInt(attributeId));
                if (attribute) {
                    setAttributeData({
                        name: attribute.name,
                        type: attribute.type,
                        categories: [],
                        viewOnProductPage: attribute.viewOnProductPage,
                        viewInFilters: attribute.viewInFilters,
                        status: attribute.status
                    });
                    setAttributeValues(attribute.values.length > 0 ? attribute.values : [{ id: Date.now(), value: "", sortOrder: 1, status: true }]);
                    setIsEdit(true);
                }
                setLoading(false);
            }, 500);
        }
    }, [attributeId]);

    const handleInputChange = (e) => {
        const { name, value, checked } = e.target;

        // If type is changing, reset values if needed
        if (name === "type") {
            const newType = value;
            const oldType = attributeData.type;

            // If switching to/from dropdown/multi-select, reset values
            if ((newType === "Dropdown" || newType === "Multi-select") &&
                (oldType !== "Dropdown" && oldType !== "Multi-select")) {
                setAttributeValues([{ id: Date.now(), value: "", sortOrder: 1, status: true }]);
            } else if ((newType !== "Dropdown" && newType !== "Multi-select") &&
                (oldType === "Dropdown" || oldType === "Multi-select")) {
                setAttributeValues([]);
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

    const handleAddValue = () => {
        setAttributeValues([
            ...attributeValues,
            { id: Date.now(), value: "", sortOrder: attributeValues.length + 1, status: true }
        ]);
    };

    const handleRemoveValue = (id) => {
        if (attributeValues.length > 1) {
            setAttributeValues(attributeValues.filter(value => value.id !== id));
        }
    };

    const handleValueChange = (id, field, value) => {
        setAttributeValues(prevValues =>
            prevValues.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Validate form based on attribute type
        if (attributeData.name.trim() === "") {
            alert("Attribute name is required!");
            setLoading(false);
            return;
        }

        if (attributeData.type === "") {
            alert("Attribute type is required!");
            setLoading(false);
            return;
        }

        // For dropdown and multi-select, validate that values are provided
        if ((attributeData.type === "Dropdown" || attributeData.type === "Multi-select") &&
            attributeValues.some(val => val.value.trim() === "")) {
            alert("All attribute values must be filled!");
            setLoading(false);
            return;
        }

        // Simulate API call
        setTimeout(() => {
            console.log("Attribute Data:", attributeData);
            console.log("Attribute Values:", attributeValues);
            setLoading(false);
            alert(`Attribute ${isEdit ? 'updated' : 'created'} successfully!`);
            navigate("/attributes");
        }, 1000);
    };

    const handleReset = () => {
        setAttributeData({
            name: "",
            type: "",
            categories: [],
            viewOnProductPage: true,
            viewInFilters: true,
            status: true
        });
        setAttributeValues([{ id: Date.now(), value: "", sortOrder: 1, status: true }]);
    };

    const attributeTypes = [
        "Text",
        "Number",
        "Yes/No",
        "Dropdown",
        "Multi-select",
        "Compound"
    ];

    // Determine if categories field should be disabled
    const isCategoriesDisabled = ["Text", "Number", "Yes/No"].includes(attributeData.type);

    // Determine if values section should be shown
    const showValuesSection = ["Dropdown", "Multi-select"].includes(attributeData.type);

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
                    onClick={() => navigate("/attributes")}
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
                        onClick={() => navigate("/attributes")}
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
                            {showValuesSection && (
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>
                                        Attribute Values
                                    </Typography>
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        Add the possible values that users can choose from when they encounter this attribute
                                    </Alert>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Value *</TableCell>
                                                    <TableCell width="100px">Sort Order</TableCell>
                                                    <TableCell width="100px">Status</TableCell>
                                                    <TableCell width="100px">Action</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {attributeValues.map((value) => (
                                                    <TableRow key={value.id}>
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
                                                ))}
                                            </TableBody>
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
                </Box>
            </Box>
        </Box>
    );
};

export default AddAttribute;
