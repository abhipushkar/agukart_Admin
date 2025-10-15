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
import { ROUTE_CONSTANT } from "../../constant/routeContanst";
import { ApiService } from "../../services/ApiService";
import ConfirmModal from "../../components/ConfirmModal"; // Import ConfirmModal
// import { apiEndpoints } from "../../services/apiEndpoints";

const AttributesList = () => {
    const [attributes, setAttributes] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedAttribute, setSelectedAttribute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [apiLoading, setApiLoading] = useState(false);
    const navigate = useNavigate();
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        type: "",
        msg: "",
        onConfirm: null
    });

    useEffect(() => {
        fetchAttributes();
    }, []);

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

    const fetchAttributes = async () => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem("auth_key");

            const response = await ApiService.get("get-attribute-list", accessToken);

            if (response.data.success) {
                setAttributes(response.data.data || []);
            } else {
                console.error("Failed to fetch attributes:", response.data.message);
                setAttributes([]);
                showConfirmModal("error", "Failed to fetch attributes");
            }
        } catch (error) {
            console.error("Error fetching attributes:", error);
            showConfirmModal("error", "Error fetching attributes. Please try again.");
            setAttributes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const handleStatusChange = async (id) => {
        setApiLoading(true);
        try {
            const accessToken = localStorage.getItem("auth_key");
            const attribute = attributes.find(attr => attr._id === id);

            // Replace with actual status update API endpoint
            const response = await ApiService.post(
                `update-attribute-list/${id}`,
                { ...attribute, status: !attribute.status },
                accessToken
            );

            if (response.data.success) {
            // Update local state on successful API call
            setAttributes(attributes.map(attr =>
                attr._id === id ? { ...attr, status: !attribute.status } : attr
            ));
            } else {
                alert("Failed to update status");
            }

            // For now, simulate API success
            // setTimeout(() => {
            //     setAttributes(attributes.map(attr =>
            //         attr._id === id ? { ...attr, status: newStatus } : attr
            //     ));
            //     setApiLoading(false);
            // }, 500);

        } catch (error) {
            console.error("Error updating status:", error);
            showConfirmModal("error", "Error updating status");
            // setApiLoading(false);
        } finally {
            setApiLoading(false);
        }
    };

    const handleViewOnProductChange = async (id) => {
        setApiLoading(true);
        try {
            const accessToken = localStorage.getItem("auth_key");
            const attribute = attributes.find(attr => attr._id === id);

            // Replace with actual view on product page update API endpoint
            const response = await ApiService.post(
                `update-attribute-list/${id}`,
                { ...attribute, viewOnProductPage: !attribute.viewOnProductPage },
                accessToken
            );

            if (response.data.success) {
            // Update local state on successful API call
            setAttributes(attributes.map(attr =>
                attr._id === id ? { ...attr, viewOnProductPage: !attribute.viewOnProductPage } : attr
            ));
            } else {
                alert("Failed to update view on product page setting");
            }

            // For now, simulate API success
            // setTimeout(() => {
            //     setAttributes(attributes.map(attr =>
            //         attr._id === id ? { ...attr, viewOnProductPage: newViewOnProductPage } : attr
            //     ));
            //     setApiLoading(false);
            // }, 500);

        } catch (error) {
            console.error("Error updating view on product page:", error);
            showConfirmModal("error", "Error updating view on product page setting");
            // setApiLoading(false);
        } finally {
            setApiLoading(false);
        }
    };

    const handleViewInFiltersChange = async (id) => {
        setApiLoading(true);
        try {
            const accessToken = localStorage.getItem("auth_key");
            const attribute = attributes.find(attr => attr._id === id);

            // Replace with actual view in filters update API endpoint
            const response = await ApiService.post(
                `update-attribute-list/${id}`,
                { ...attribute, viewInFilters: !attribute.viewInFilters },
                accessToken
            );

            if (response.data.success) {
            // Update local state on successful API call
            setAttributes(attributes.map(attr =>
                attr._id === id ? { ...attr, viewInFilters: !attribute.viewInFilters } : attr
            ));
            } else {
                alert("Failed to update view in filters setting");
            }

            // For now, simulate API success
            // setTimeout(() => {
            //     setAttributes(attributes.map(attr =>
            //         attr._id === id ? { ...attr, viewInFilters: newViewInFilters } : attr
            //     ));
            //     setApiLoading(false);
            // }, 500);

        } catch (error) {
            console.error("Error updating view in filters:", error);
            showConfirmModal("error", "Error updating view in filters setting");
            // setApiLoading(false);
        } finally {
            setApiLoading(false);
        }
    };

    const handleDeleteClick = (attribute) => {
        try {
            setSelectedAttribute(attribute);
            showConfirmModal(
                "warning",
                `Are you sure you want to delete the attribute "${attribute.name}"?`,
                handleDeleteConfirm
            );
        } catch (e) {
            showConfirmModal("error", e.message);
        }
    };

    const handleDeleteConfirm = async () => {
        setApiLoading(true);
        try {
            const accessToken = localStorage.getItem("auth_key");

            const response = await ApiService.delete(
                `delete-attribute-list/${selectedAttribute._id}`,
                accessToken
            );

            if (response.data.success) {
                // Remove from local state on successful API call
                setAttributes(attributes.filter(attr => attr._id !== selectedAttribute._id));
                setSelectedAttribute(null);
                showConfirmModal("success", "Attribute deleted successfully!");
            } else {
                showConfirmModal("error", "Failed to delete attribute");
            }
        } catch (error) {
            console.error("Error deleting attribute:", error);
            showConfirmModal("error", "Error deleting attribute");
        } finally {
            setApiLoading(false);
        }
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
                        disabled={apiLoading}
                    />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate(ROUTE_CONSTANT.catalog.attribute.add)}
                    >
                        Add Attribute
                    </Button>
                    <Button variant="contained" disabled={apiLoading}>
                        Export Attributes
                    </Button>
                </Box>
            </Box>

            <TableContainer sx={{ paddingLeft: 2, paddingRight: 2 }} component={Paper}>
                <Table >
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
                        {filteredAttributes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    {attributes.length === 0 ? "No attributes found" : "No matching attributes found"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAttributes.map((attr, index) => (
                                <TableRow key={attr._id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{attr.name}</TableCell>
                                    <TableCell>{attr.type}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={attr.status}
                                            onChange={() => handleStatusChange(attr._id)}
                                            disabled={apiLoading}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={attr.viewOnProductPage}
                                            onChange={() => handleViewOnProductChange(attr._id)}
                                            disabled={apiLoading}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={attr.viewInFilters}
                                            onChange={() => handleViewInFiltersChange(attr._id)}
                                            disabled={apiLoading}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() => handleEdit(attr._id)}
                                            color="primary"
                                            disabled={apiLoading}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDeleteClick(attr)}
                                            color="error"
                                            disabled={apiLoading}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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

export default AttributesList;
