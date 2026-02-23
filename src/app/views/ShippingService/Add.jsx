import styled from "@emotion/styled";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography,
    FormControlLabel,
    Switch
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ViewListIcon from '@mui/icons-material/ViewList';
import { Formik } from "formik";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import * as Yup from "yup";
import { ApiService } from "app/services/ApiService";
import { localStorageKey } from "app/constant/localStorageKey";
import { useEffect } from "react";
import ConfirmModal from "app/components/ConfirmModal";
import ShippingService from "app/services/ShippingService";

const Container = styled("div")(({ theme }) => ({
    margin: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
        marginBottom: "30px",
        [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
    }
}));

const validationSchema = Yup.object({
    name: Yup.string().required("Service name is required"),
    tracking_url: Yup.string().required("Link is required"),
});

const AddShippingService = () => {
    const [query, setQuery] = useSearchParams();
    const auth_key = localStorage.getItem(localStorageKey.auth_key);
    const [imagePreview, setImagePreview] = useState(null);
    const [editService, setEditService] = useState({});
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [existingLogoUrl, setExistingLogoUrl] = useState(null);

    const navigate = useNavigate();

    const queryId = query.get("id");

    const [open, setOpen] = useState(false);
    const [type, setType] = useState("");
    const [route, setRoute] = useState(null);
    const [msg, setMsg] = useState(null);

    const logOut = () => {
        localStorage.removeItem(localStorageKey.auth_key);
        localStorage.removeItem(localStorageKey.designation_id);
        localStorage.removeItem(localStorageKey.vendorId);
        setRoute(ROUTE_CONSTANT.login)
    };

    const handleOpen = (type, msg) => {
        setMsg(msg?.message);
        setOpen(true);
        setType(type);
        if (msg?.response?.status === 401) {
            logOut()
        }
    };

    const handleClose = () => {
        setOpen(false);
        if (route !== null) {
            navigate(route);
        }
        setRoute(null);
        setMsg(null);
    };

    const handleImageChange = (e, setFieldValue) => {
        const logo = e.target.files[0];

        if (logo) {

            setFieldValue("logo", logo);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(logo);
        } else {
            console.log('No file selected');
        }
    };

    const toggleAppendTrackingId = (values, isChecked, setFieldValue) => {
        if (isChecked) {
            // Toggle ON: Add tracking_id if not already present
            if (!values.tracking_url.includes("={tracking_id}")) {
                // Append tracking_id
                setFieldValue("tracking_url", values.tracking_url + "={tracking_id}");
                setFieldValue("trackingIdAddedByToggle", true);
            }
        } else {
            // Toggle OFF: Remove tracking_id only if we added it
            if (values.trackingIdAddedByToggle) {
                // Remove the ={tracking_id} that we added
                setFieldValue("tracking_url", values.tracking_url.replace("={tracking_id}", ""));
                setFieldValue("trackingIdAddedByToggle", false);
            }
        }
        setFieldValue("supportDirectTracking", isChecked);
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            const formData = new FormData();

            formData.append("name", values.name);
            formData.append("description", values.description || "");
            formData.append(
                "supportDirectTracking",
                values.supportDirectTracking ? "true" : "false"
            );
            const trackingUrl = values.tracking_url
            formData.append("tracking_url", values.tracking_url);

            if (values.logo && values.logo instanceof File && values.logo.size > 0) {
                formData.append("logo", values.logo);
            }

            let res;

            if (!queryId) {
                // CREATE
                res = await ShippingService.create(formData);
            } else {
                // UPDATE
                res = await ApiService.put(
                    `update-delivery-service/${queryId}`,
                    formData,
                    auth_key
                );
            }

            if (res.status === 200 || res.status === 201) {
                handleOpen("success", res?.data);
                setRoute(ROUTE_CONSTANT.shippingService.list);
            }
        } catch (error) {
            console.error("SUBMIT ERROR:", error);
            handleOpen("error", error?.response?.data || error);
        } finally {
            setLoading(false);
        }
    };

    const editServiceHandler = async () => {
        try {
            setInitialLoading(true);
            const res = await ApiService.get(`delivery-service/${queryId}`, auth_key);
            if (res?.status === 200) {
                const serviceData = res?.data?.data;
                setEditService(serviceData);
                if (serviceData?.logo) {
                    setExistingLogoUrl(serviceData?.logo);
                    setImagePreview(`https://api.agukart.com/uploads/delivery/${serviceData?.logo}`);
                }
            }
        } catch (error) {
            handleOpen("error", error?.response?.data || error);
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        if (queryId) {
            editServiceHandler();
        }
    }, [queryId]);

    // Determine if URL has tracking_id parameter (for initial toggle state)
    const getInitialSupportDirectTracking = () => {
        if (queryId && editService?.tracking_url) {
            return editService.tracking_url.includes("={tracking_id}");
        }
        return true; // Default for new items
    };

    const getInitialTrackingIdAddedByToggle = () => {
        if (queryId && editService?.tracking_url) {
            return editService.tracking_url.includes("={tracking_id}");
        }
        return false;
    };

    if (initialLoading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container>
            <Box sx={{ py: "16px" }} component={Paper}>
                <Stack sx={{ ml: "16px", mb: "12px" }} gap={1} direction={"row"}>
                    <Box>
                        <ViewListIcon />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Go To</Typography>
                    </Box>
                </Stack>
                <Divider />
                <Box sx={{ ml: "16px", mt: "16px" }}>
                    <Button
                        onClick={() => navigate(ROUTE_CONSTANT.shippingService.list)}
                        startIcon={<ViewListIcon />}
                        variant="contained"
                    >
                        Shipping Service List
                    </Button>
                </Box>
            </Box>
            <Box sx={{ py: "16px" }} component={Paper}>
                <Stack sx={{ ml: "16px", mb: "12px" }} gap={1} direction={"row"}>
                    <Box>
                        <LocalShippingIcon />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>
                            {queryId ? "Edit" : "Add"} Shipping Service
                        </Typography>
                    </Box>
                </Stack>
                <Divider />

                <Formik
                    initialValues={{
                        name: queryId ? editService?.name || "" : "",
                        description: queryId ? editService?.description || "" : "",
                        logo: null, // CRITICAL: Always null initially - NEVER set to URL string
                        logoChanged: false, // Track if logo was changed
                        tracking_url: queryId ? editService?.tracking_url || "" : "",
                        supportDirectTracking: getInitialSupportDirectTracking(),
                        trackingIdAddedByToggle: getInitialTrackingIdAddedByToggle(),
                    }}
                    enableReinitialize={true}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, handleChange, handleSubmit, setFieldValue, resetForm, errors, touched }) => (
                        <form onSubmit={handleSubmit}>
                            <Stack gap={"16px"} sx={{ p: "16px", pb: 0 }}>
                                <TextField
                                    id="name"
                                    name="name"
                                    required
                                    label={queryId ? "" : "Service Name"}
                                    placeholder={queryId ? "Service Name" : ""}
                                    sx={{
                                        height: '40px',
                                        "& .MuiInputBase-root": {
                                            height: "40px",
                                        },
                                        "& .MuiFormLabel-root": {
                                            top: '-7px'
                                        }
                                    }}
                                    type="text"
                                    value={values.name}
                                    onChange={handleChange}
                                    error={touched.name && Boolean(errors.name)}
                                    helperText={
                                        touched.name &&
                                        errors.name && <Typography color="error">{errors.name}</Typography>
                                    }
                                />

                                <TextField
                                    id="description"
                                    name="description"
                                    label={queryId ? "" : "Enter Description"}
                                    rows={2}
                                    placeholder={queryId ? "Enter Description" : ""}
                                    multiline
                                    type="text"
                                    value={values.description}
                                    onChange={handleChange}
                                    error={touched.description && Boolean(errors.description)}
                                    helperText={
                                        touched.description &&
                                        errors.description && (
                                            <Typography color="error">{errors.description}</Typography>
                                        )
                                    }
                                />

                                <TextField
                                    fullWidth
                                    value={values.logo instanceof File ? values.logo.name : ""}
                                    sx={{
                                        "& .MuiInputBase-root": {
                                            height: "40px",
                                        },
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AttachFileIcon />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <input
                                                type="file"
                                                accept="image/*"
                                                disabled={queryId ? true : false}
                                                style={{ display: "none" }}
                                                id="file-input"
                                                onChange={(event) => {
                                                    if (event.currentTarget.files[0]) {
                                                        handleImageChange(event, setFieldValue);
                                                    }
                                                }}
                                            />
                                        ),
                                        readOnly: true
                                    }}
                                    placeholder={existingLogoUrl ? "Change Image" : "Select Image"}
                                    onClick={() => document.getElementById("file-input").click()}
                                />

                                {imagePreview && (
                                    <Box>
                                        {existingLogoUrl && !(values.logo instanceof File) && (
                                            <Typography variant="caption" display="block" color="text.secondary">
                                                Preview
                                            </Typography>
                                        )}
                                        <img src={imagePreview} width={200} alt="preview" />
                                        {values.logo instanceof File && (
                                            <Typography variant="caption" display="block" color="success.main">
                                                New image selected: {values.logo.name}
                                            </Typography>
                                        )}
                                    </Box>
                                )}

                                <TextField
                                    id="tracking_url"
                                    name="tracking_url"
                                    required
                                    label={queryId ? "" : "Link"}
                                    placeholder={queryId ? "Link" : ""}
                                    sx={{
                                        height: '40px',
                                        "& .MuiInputBase-root": {
                                            height: "40px",
                                        },
                                        "& .MuiFormLabel-root": {
                                            top: '-7px'
                                        }
                                    }}
                                    type="text"
                                    value={values.tracking_url}
                                    onChange={handleChange}
                                    onBlur={() => {
                                        toggleAppendTrackingId(values, values.supportDirectTracking, setFieldValue);
                                    }}
                                    error={touched.tracking_url && Boolean(errors.tracking_url)}
                                    helperText={
                                        touched.tracking_url &&
                                        errors.tracking_url && <Typography color="error">{errors.tracking_url}</Typography>
                                    }
                                />

                                <Box sx={{ display: "flex", alignItems: "center", gap: 2, my: 2 }}>
                                    <Typography sx={{ minWidth: "100px" }}>Direct Tracking Supported:</Typography>
                                    <FormControlLabel
                                        label={values.supportDirectTracking ? "Yes" : "No"}
                                        control={
                                            <Switch
                                                checked={values.supportDirectTracking}
                                                onChange={(e) => {
                                                    toggleAppendTrackingId(values, e.target.checked, setFieldValue);
                                                }}
                                                name="supportDirectTracking"
                                            />
                                        }
                                    />
                                </Box>

                                <Box sx={{ width: "100%" }}>
                                    <Button
                                        endIcon={loading ? <CircularProgress size={15} /> : ""}
                                        disabled={loading}
                                        sx={{ mr: "16px" }}
                                        variant="contained"
                                        color="primary"
                                        type="submit"
                                    >
                                        {loading ? 'Submitting...' : 'Submit'}
                                    </Button>
                                    {!queryId && (
                                        <Button
                                            variant="contained"
                                            color="error"
                                            type="reset"
                                            onClick={() => {
                                                resetForm();
                                                setImagePreview(null);
                                                setExistingLogoUrl(null);
                                            }}
                                        >
                                            Reset
                                        </Button>
                                    )}
                                </Box>
                            </Stack>
                        </form>
                    )}
                </Formik>
            </Box>
            <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
        </Container>
    );
};

export default AddShippingService;