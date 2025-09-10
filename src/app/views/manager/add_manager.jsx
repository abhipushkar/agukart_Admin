import React, { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Grid,
    Button,
    Typography,
    CircularProgress
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { TextValidator, ValidatorForm } from "react-material-ui-form-validator";
import ConfirmModal from "app/components/ConfirmModal";
import {dummyManagers} from "./manager_list";

const AddManager = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const managerId = searchParams.get("id");
    const isEditMode = Boolean(managerId);

    const auth_key = localStorage.getItem(localStorageKey.auth_key);

    const [formValues, setFormValues] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    });

    const [errors, setErrors] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    });

    const [open, setOpen] = useState(false);
    const [type, setType] = useState("");
    const [route, setRoute] = useState(null);
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Load manager data if in edit mode
    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            // Simulate API call to fetch manager data
            setTimeout(() => {
                const managerData = dummyManagers[managerId] || {
                    name: "",
                    email: "",
                    phone: "",
                    password: "",
                };

                setFormValues(managerData);
                setLoading(false);
            }, 500);
        }
    }, [isEditMode, managerId]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormValues({
            ...formValues,
            [name]: value
        });

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ""
            });
        }
    };

    const handleOpen = (type, msg) => {
        setMsg(msg?.message || msg);
        setOpen(true);
        setType(type);
    };

    const handleClose = () => {
        setOpen(false);
        if (route !== null) {
            navigate(route);
        }
        setRoute(null);
        setMsg(null);
    };

    const handleValidate = () => {
        const newErrors = {};

        if (!formValues.name) newErrors.name = "Name is required";
        if (!formValues.email) newErrors.email = "Email is required";
        if (formValues.email && !emailRegex.test(formValues.email))
            newErrors.email = "Invalid Email";
        if (!formValues.phone) newErrors.phone = "Phone is required";

        // Only validate password for new managers, not when editing
        if (!isEditMode) {
            if (!formValues.password) newErrors.password = "Password is required";
            if (formValues.password && formValues.password.length < 6)
                newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (handleValidate()) {
            try {
                setLoading(true);

                const payload = {
                    name: formValues.name,
                    email: formValues.email,
                    phone: formValues.phone,
                    role: "MANAGER",
                    designation_id: 5
                };

                // Only include password if we're creating a new manager or if it's been changed
                if (!isEditMode || formValues.password) {
                    payload.password = formValues.password;
                }

                // Add ID for edit mode
                if (isEditMode) {
                    payload._id = managerId;
                }

                // Simulate API call since API is not ready
                console.log(`${isEditMode ? 'Updating' : 'Creating'} manager with:`, payload);

                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Simulate successful response
                const mockResponse = {
                    status: 200,
                    data: {
                        message: `Manager ${isEditMode ? 'updated' : 'created'} successfully!`
                    }
                };

                if (mockResponse.status === 200) {
                    setRoute(ROUTE_CONSTANT.manager.list);
                    handleOpen("success", mockResponse.data);
                }
            } catch (error) {
                setLoading(false);
                handleOpen("error", error?.response?.data || error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Box sx={{ margin: "30px" }}>
            <Box sx={{ p: { lg: "24px", md: "24px", xs: "12px" } }} component={Paper}>
                <Typography variant="h5" fontWeight="600" gutterBottom sx={{ mb: 3 }}>
                    {isEditMode ? "Edit Manager" : "Add Manager"}
                </Typography>

                {loading && isEditMode ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress />
                    </Box>
                ) : (
                    <ValidatorForm onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item sm={6} xs={12}>
                                <TextValidator
                                    fullWidth
                                    label="Full Name"
                                    onChange={handleChange}
                                    type="text"
                                    name="name"
                                    value={formValues.name}
                                    validators={['required']}
                                    errorMessages={[errors.name || 'this field is required']}
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item sm={6} xs={12}>
                                <TextValidator
                                    fullWidth
                                    label="Email"
                                    onChange={handleChange}
                                    type="email"
                                    name="email"
                                    value={formValues.email}
                                    validators={['required', 'isEmail']}
                                    errorMessages={[errors.email || 'this field is required', 'email is not valid']}
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item sm={6} xs={12}>
                                <TextValidator
                                    fullWidth
                                    label="Phone"
                                    onChange={handleChange}
                                    type="text"
                                    name="phone"
                                    value={formValues.phone}
                                    validators={['required']}
                                    errorMessages={[errors.phone || 'this field is required']}
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item sm={6} xs={12}>
                                <TextValidator
                                    fullWidth
                                    label={isEditMode ? "New Password (leave blank to keep current)" : "Password"}
                                    onChange={handleChange}
                                    type="password"
                                    name="password"
                                    value={formValues.password}
                                    validators={isEditMode ? [] : ['required']}
                                    errorMessages={[errors.password || 'this field is required']}
                                    variant="outlined"
                                    helperText={isEditMode ? "Only enter a password if you want to change it" : ""}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate(ROUTE_CONSTANT.manager.list)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                variant="contained"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? "Processing..." : (isEditMode ? "Update Manager" : "Add Manager")}
                            </Button>
                        </Box>
                    </ValidatorForm>
                )}
            </Box>
            <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
        </Box>
    );
};

export default AddManager;