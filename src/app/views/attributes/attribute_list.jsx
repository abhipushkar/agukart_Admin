import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    TextField,
    Switch,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Breadcrumbs,
    Link,
    CircularProgress,
    Divider,
    Stack
} from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Home as HomeIcon,
    List as ListIcon,
    Apps as AppsIcon
} from "@mui/icons-material";
import {ROUTE_CONSTANT} from "../../constant/routeContanst";

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

const AttributesList = () => {
    const [attributes, setAttributes] = useState([]);
    const [search, setSearch] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedAttribute, setSelectedAttribute] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setAttributes(dummyAttributes);
            setLoading(false);
        }, 500);
    }, []);

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const handleStatusChange = (id) => {
        setAttributes(attributes.map(attr =>
            attr.id === id ? { ...attr, status: !attr.status } : attr
        ));
        // Here you would make an API call to update the status
    };

    const handleViewOnProductChange = (id) => {
        setAttributes(attributes.map(attr =>
            attr.id === id ? { ...attr, viewOnProductPage: !attr.viewOnProductPage } : attr
        ));
        // Here you would make an API call to update the setting
    };

    const handleViewInFiltersChange = (id) => {
        setAttributes(attributes.map(attr =>
            attr.id === id ? { ...attr, viewInFilters: !attr.viewInFilters } : attr
        ));
        // Here you would make an API call to update the setting
    };

    const handleDeleteClick = (attribute) => {
        setSelectedAttribute(attribute);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        setAttributes(attributes.filter(attr => attr.id !== selectedAttribute.id));
        setDeleteDialogOpen(false);
        setSelectedAttribute(null);
        // Here you would make an API call to delete the attribute
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setSelectedAttribute(null);
    };

    const handleEdit = (id) => {
        navigate(`${ROUTE_CONSTANT.catalog.attribute.add}?id=${id}`);
    };

    const filteredAttributes = attributes.filter(attr =>
        attr.name.toLowerCase().includes(search.toLowerCase())
    );

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
                <Link color="inherit" href="#" sx={{ display: 'flex', alignItems: 'center' }}>
                    <ListIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Attributes
                </Link>
                <Typography color="text.primary">Attributes List</Typography>
            </Breadcrumbs>

            <Box sx={{ py: "16px", marginBottom: "20px" }} component={Paper}>
                <Stack sx={{ ml: "24px", mb: "12px" }} gap={1} direction={"row"}>
                    <AppsIcon />
                    <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Go To</Typography>
                </Stack>
                <Divider />
                <Box sx={{ ml: "24px", mt: "16px" }}>
                    <Button
                        onClick={() => navigate("/")}
                        startIcon={<AppsIcon />}
                        variant="contained"
                    >
                        Dashboard
                    </Button>
                </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4">Attributes List</Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                        size="small"
                        label="Search"
                        value={search}
                        onChange={handleSearch}
                    />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate(ROUTE_CONSTANT.catalog.attribute.add)}
                    >
                        Add Attribute
                    </Button>
                    <Button variant="contained">
                        Export Attributes
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>S.No</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>View on Product Page</TableCell>
                            <TableCell>View in Filters</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAttributes.map((attr, index) => (
                            <TableRow key={attr.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{attr.name}</TableCell>
                                <TableCell>{attr.type}</TableCell>
                                <TableCell>
                                    <Switch
                                        checked={attr.status}
                                        onChange={() => handleStatusChange(attr.id)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Switch
                                        checked={attr.viewOnProductPage}
                                        onChange={() => handleViewOnProductChange(attr.id)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Switch
                                        checked={attr.viewInFilters}
                                        onChange={() => handleViewInFiltersChange(attr.id)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => handleEdit(attr.id)}
                                        color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleDeleteClick(attr)}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete the attribute "{selectedAttribute?.name}"?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AttributesList;
