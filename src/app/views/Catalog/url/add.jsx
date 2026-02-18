import React, { useState, useEffect } from "react";
import {
    Button,
    Box,
    Stack,
    Paper,
    Divider,
    Typography,
    Grid,
    TextField,
    CircularProgress,
    InputAdornment,
    Container as MuiContainer
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "@emotion/styled";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { localStorageKey } from "app/constant/localStorageKey";
import ConfirmModal from "app/components/ConfirmModal";
import { toast } from "react-toastify";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AppsIcon from "@mui/icons-material/Apps";
import LinkIcon from "@mui/icons-material/Link";
import UrlService from "app/services/UrlService";

const theme = createTheme();

const StyledContainer = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
}));

const GoToCard = styled(Paper)({
    padding: "16px 24px",
    marginBottom: "30px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    border: "1px solid #e0e0e0",
    borderRadius: "8px"
});

const FormSection = styled(Paper)({
    padding: "24px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    border: "1px solid #e0e0e0",
    borderRadius: "8px"
});

const PreviewImage = styled("img")({
    width: "100%",
    maxHeight: "200px",
    objectFit: "contain",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    padding: "8px",
    backgroundColor: "#f9f9f9"
});

const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    description: Yup.string().required("Description is required")
});

export default function Add() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryId = searchParams.get("id");
    const slug = searchParams.get("slug");
    const isEditMode = !!queryId;

    const [pageLoading, setPageLoading] = useState(false);
    const [initialValues, setInitialValues] = useState({
        name: "",
        description: "",
        link: "",
        file: null,
        slug: ""
    });
    const [fileName, setFileName] = useState("");
    const [filePreview, setFilePreview] = useState(null);
    const [open, setOpen] = useState(false);
    const [type, setType] = useState("");
    const [msg, setMsg] = useState(null);
    const [route, setRoute] = useState(null);
    const [submittedUrl, setSubmittedUrl] = useState("");

    useEffect(() => {
        if (isEditMode) {
            fetchUrlDetails();
        }
    }, [isEditMode, queryId]);

    const fetchUrlDetails = async () => {
        try {
            setPageLoading(true);
            const res = await UrlService.getDetail(queryId);
            console.log(res.data);
            if (res.status === 200) {
                const data = res?.data?.data || res?.data || {};

                setInitialValues({
                    name: data.name || "",
                    description: data.description || "",
                    link: data?.link || "",
                    file: data?.file || null,
                    slug: data.slug || queryId
                });

                if (data?.file) {
                    setSubmittedUrl(data?.file);
                }

                if (data.file) {
                    setFileName(data.name || "Attached file");
                    if (data.file.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
                        setFilePreview(data.file);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching URL details:", error);
            toast.error("Failed to load URL data");
        } finally {
            setPageLoading(false);
        }
    };

    const handleFileChange = (event, setFieldValue) => {
        const file = event.target.files[0];
        if (file) {
            setFieldValue("file", file);
            setFileName(file.name);

            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setFilePreview(null);
            }
        }
    };

    const handleGenerateUrl = async (values, { setSubmitting, setFieldValue }) => {
        try {
            // Validate required fields
            if (!values.name) {
                toast.error("Please enter a name");
                return;
            }
            if (!values.description) {
                toast.error("Please enter a description");
                return;
            }

            const formData = new FormData();

            // Append all form fields
            formData.append("name", values.name);
            formData.append("description", values.description);

            // Generate slug from name
            const slug = values.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            formData.append("slug", slug);

            // Handle ID for create/update
            if (isEditMode) {
                formData.append("_id", queryId);
            }

            // Append file if selected
            if (values.file) {
                formData.append("file", values.file);
            }
            let res;
            if (isEditMode) {
                res = await UrlService.editUrl(formData, queryId);
            }
            else {
                res = await UrlService.saveUrl(formData);
            }

            if (res.status === 200 || res.status === 201) {
                // Get the returned URL from response
                const returnedUrl = res?.data?.data?.link || res?.data?.link || `${window.location.origin}/url-page/${slug}`;

                // Display the returned URL in the link field
                setFieldValue("link", returnedUrl);
                setSubmittedUrl(returnedUrl);

                toast.success(isEditMode ? "URL updated successfully" : "URL created successfully");

                // Optional: Navigate after a short delay to show the URL
                setTimeout(() => {
                    navigate(ROUTE_CONSTANT.catalog.url.list);
                }, 2000);
            }
        } catch (error) {
            console.error("Submit error:", error);
            const errorMsg = error?.response?.data?.message ||
                error?.message ||
                "Something went wrong";
            setMsg(errorMsg);
            setOpen(true);
            setType("error");
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = (resetForm) => {
        setFileName("");
        setFilePreview(null);
        setSubmittedUrl("");
        resetForm();
    };

    const logOut = () => {
        localStorage.removeItem(localStorageKey.auth_key);
        localStorage.removeItem(localStorageKey.designation_id);
        localStorage.removeItem(localStorageKey.vendorId);
        setRoute(ROUTE_CONSTANT.login);
    };

    const handleClose = () => {
        setOpen(false);
        if (route !== null) {
            navigate(route);
        }
        setRoute(null);
        setMsg(null);
    };

    if (pageLoading) {
        return (
            <StyledContainer>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress />
                </Box>
            </StyledContainer>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <MuiContainer>
                <StyledContainer>
                    <GoToCard>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                            <AppsIcon sx={{ color: "#1976d2" }} />
                            <Typography variant="h6" sx={{ fontWeight: "600", fontSize: "18px" }}>
                                Go To
                            </Typography>
                        </Stack>
                        <Divider sx={{ mb: 2 }} />
                        <Button
                            onClick={() => navigate(ROUTE_CONSTANT.catalog.url.list)}
                            startIcon={<AppsIcon />}
                            variant="contained"
                            sx={{
                                backgroundColor: "#1976d2",
                                "&:hover": { backgroundColor: "#1565c0" }
                            }}
                        >
                            URL List
                        </Button>
                    </GoToCard>

                    <Typography variant="h5" sx={{ mb: 3, fontWeight: "600" }}>
                        {isEditMode ? "Edit URL" : "Add URL"}
                    </Typography>

                    <FormSection>
                        <Formik
                            initialValues={initialValues}
                            enableReinitialize={true}
                            validationSchema={validationSchema}
                            onSubmit={handleGenerateUrl}
                        >
                            {({ values, setFieldValue, isSubmitting, resetForm, errors, touched }) => (
                                <Form>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <Box sx={{ mb: 3 }}>
                                                <Typography sx={{ mb: 1, fontWeight: "500", fontSize: "14px" }}>
                                                    Name <span style={{ color: "red" }}>*</span>
                                                </Typography>
                                                <Field
                                                    as={TextField}
                                                    name="name"
                                                    fullWidth
                                                    variant="outlined"
                                                    placeholder="Enter name"
                                                    error={touched.name && !!errors.name}
                                                    helperText={<span style={{ color: "red" }}><ErrorMessage name="name" /></span>}
                                                    sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                                                />
                                            </Box>

                                            <Box sx={{ mb: 3 }}>
                                                <Typography sx={{ mb: 1, fontWeight: "500", fontSize: "14px" }}>
                                                    Description <span style={{ color: "red" }}>*</span>
                                                </Typography>
                                                <Field
                                                    as={TextField}
                                                    name="description"
                                                    fullWidth
                                                    multiline
                                                    rows={4}
                                                    variant="outlined"
                                                    placeholder="Enter description"
                                                    error={touched.description && !!errors.description}
                                                    helperText={<span style={{ color: "red" }}><ErrorMessage name="description" /></span>}
                                                />
                                            </Box>

                                            <Box sx={{ mb: 3 }}>
                                                <Typography sx={{ mb: 1, fontWeight: "500", fontSize: "14px" }}>
                                                    File Upload
                                                </Typography>
                                                <input
                                                    type="file"
                                                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                                                    disabled={isEditMode}
                                                    style={{ display: "none" }}
                                                    id="file-upload"
                                                    onChange={(e) => handleFileChange(e, setFieldValue)}
                                                />
                                                <TextField
                                                    fullWidth
                                                    value={fileName}
                                                    sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <AttachFileIcon />
                                                            </InputAdornment>
                                                        ),
                                                        readOnly: true
                                                    }}
                                                    placeholder="Choose file"
                                                    onClick={() => document.getElementById("file-upload").click()}
                                                />
                                                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: "block" }}>
                                                    Supported formats: Images, PDF, DOC, DOCX, XLS, XLSX, TXT
                                                </Typography>
                                            </Box>

                                            <Box sx={{ mb: 3 }}>
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    disabled={isSubmitting}
                                                    sx={{
                                                        backgroundColor: "#1976d2",
                                                        "&:hover": { backgroundColor: "#1565c0" },
                                                        height: "40px",
                                                        px: 3,
                                                        minWidth: "150px"
                                                    }}
                                                >
                                                    {isSubmitting ? <CircularProgress size={20} /> : "Generate URL"}
                                                </Button>
                                            </Box>

                                            <Box sx={{ mb: 3 }}>
                                                <Typography sx={{ mb: 1, fontWeight: "500", fontSize: "14px" }}>
                                                    Generated Link
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    value={values?.link || submittedUrl}
                                                    variant="outlined"
                                                    placeholder="Generated URL will appear here after submission"
                                                    InputProps={{
                                                        readOnly: true,
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <LinkIcon />
                                                            </InputAdornment>
                                                        )
                                                    }}
                                                    sx={{
                                                        "& .MuiInputBase-root": {
                                                            height: "40px",
                                                            backgroundColor: "#f5f5f5"
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Box sx={{ pl: { md: 3 } }}>
                                                <Typography sx={{ mb: 2, fontWeight: "500", fontSize: "14px" }}>
                                                    Preview
                                                </Typography>
                                                {filePreview ? (
                                                    <PreviewImage src={filePreview} alt="Preview" />
                                                ) : (
                                                    <Box
                                                        sx={{
                                                            width: "100%",
                                                            height: "200px",
                                                            border: "1px solid #e0e0e0",
                                                            borderRadius: "4px",
                                                            backgroundColor: "#f9f9f9",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center"
                                                        }}
                                                    >
                                                        <Typography color="textSecondary">
                                                            No file selected
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                                                {!isEditMode && (
                                                    <Button
                                                        onClick={() => handleReset(resetForm)}
                                                        variant="contained"
                                                        color="error"
                                                        sx={{
                                                            minWidth: "120px",
                                                            height: "40px"
                                                        }}
                                                    >
                                                        Reset
                                                    </Button>
                                                )}
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Form>
                            )}
                        </Formik>
                    </FormSection>
                </StyledContainer>
            </MuiContainer>
            <ConfirmModal
                open={open}
                handleClose={handleClose}
                type={type}
                msg={msg}
            />
        </ThemeProvider>
    );
}
