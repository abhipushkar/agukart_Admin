import React, { useState, useEffect, useCallback } from "react";
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    Chip,
    Button,
    Divider,
    Avatar,
    Stack,
    IconButton,
    Tooltip,
    Alert,
    Skeleton,
    Icon,
    Link
} from "@mui/material";
import {
    ArrowBack as ArrowBackIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Business as BusinessIcon,
    LocationOn as LocationOnIcon,
    Category as CategoryIcon,
    Description as DescriptionIcon,
    Link as LinkIcon,
    Instagram as InstagramIcon,
    Facebook as FacebookIcon,
    Twitter as TwitterIcon,
    YouTube as YouTubeIcon,
    LinkedIn as LinkedInIcon,
    Pinterest as PinterestIcon,
    GitHub as GitHubIcon,
    Language as LanguageIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Pending as PendingIcon,
    VerifiedUser as VerifiedUserIcon,
    Close as CloseIcon
} from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { ApiService } from "app/services/ApiService";
import { localStorageKey } from "app/constant/localStorageKey";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { toast } from "react-toastify";
import { Breadcrumb } from "app/components";
import ConfirmModal from "app/components/ConfirmModal";

// Mock data for development
const mockApplication = {
    _id: "1",
    fullName: "John Doe",
    email: "john.doe@example.com",
    brand: "John's Jewelry",
    number: "+91 9876543210",
    number2: "+91 9876543211",
    country: "India",
    state: "Maharashtra",
    city: "Mumbai",
    addressLine1: "123, Main Street",
    addressLine2: "Andheri East",
    zipCode: "400093",
    productCategory: "Jewelry",
    productDescription: "Handmade silver jewelry with unique designs inspired by nature. Each piece is carefully crafted using traditional techniques passed down through generations. We use ethically sourced materials and sustainable practices.",
    socialLinks: [
        { platform: "instagram", url: "https://instagram.com/johnsjewelry" },
        { platform: "website", url: "https://johnsjewelry.com" }
    ],
    status: "pending",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    countryCode: "in",
    comments: "Great portfolio! Looking forward to seeing more of your work."
};

const View = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const applicationId = searchParams.get("id");

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [confirmType, setConfirmType] = useState("");
    const [confirmMsg, setConfirmMsg] = useState("");

    const auth_key = localStorage.getItem(localStorageKey.auth_key);

    const getApplicationDetail = useCallback(async () => {
        setLoading(true);
        try {
            // Simulate API call with mock data
            // Uncomment when API is ready
            // const res = await ApiService.get(`${apiEndpoints.getApplicationDetail}/${applicationId}`, auth_key);
            // if (res.status === 200) {
            //   setApplication(res?.data?.application);
            // }

            // Using mock data
            await new Promise(resolve => setTimeout(resolve, 800));
            setApplication(mockApplication);
        } catch (error) {
            console.error("Error fetching application details:", error);
            toast.error("Failed to load application details");
        } finally {
            setLoading(false);
        }
    }, [applicationId, auth_key]);

    useEffect(() => {
        if (applicationId) {
            getApplicationDetail();
        }
    }, [applicationId, getApplicationDetail]);

    const handleStatusUpdate = async (status) => {
        try {
            // Simulate API call
            // const payload = { applicationId, status };
            // const res = await ApiService.post(apiEndpoints.updateApplicationStatus, payload, auth_key);
            // if (res.status === 200) {
            //   toast.success(`Application ${status} successfully`);
            //   setApplication(prev => ({ ...prev, status }));
            // }

            // Mock update
            setApplication(prev => ({ ...prev, status }));
            toast.success(`Application ${status} successfully`);
        } catch (error) {
            toast.error("Failed to update application status");
        }
        setOpenConfirm(false);
    };

    const handleConfirmOpen = (type, msg) => {
        setConfirmType(type);
        setConfirmMsg(msg);
        setOpenConfirm(true);
    };

    const handleConfirmClose = () => {
        setOpenConfirm(false);
        setConfirmType("");
        setConfirmMsg("");
    };

    const getStatusChip = (status) => {
        switch (status) {
            case "approved":
                return <Chip
                    label="Approved"
                    size="medium"
                    sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 600, fontSize: "14px", p: 1 }}
                    icon={<CheckCircleIcon />}
                />;
            case "rejected":
                return <Chip
                    label="Rejected"
                    size="medium"
                    sx={{ bgcolor: "#ffebee", color: "#c62828", fontWeight: 600, fontSize: "14px", p: 1 }}
                    icon={<CancelIcon />}
                />;
            default:
                return <Chip
                    label="Pending"
                    size="medium"
                    sx={{ bgcolor: "#fff3e0", color: "#e65100", fontWeight: 600, fontSize: "14px", p: 1 }}
                    icon={<PendingIcon />}
                />;
        }
    };

    const getSocialIcon = (platform) => {
        switch (platform?.toLowerCase()) {
            case "instagram": return <InstagramIcon />;
            case "facebook": return <FacebookIcon />;
            case "twitter": return <TwitterIcon />;
            case "youtube": return <YouTubeIcon />;
            case "linkedin": return <LinkedInIcon />;
            case "pinterest": return <PinterestIcon />;
            case "github": return <GitHubIcon />;
            default: return <LanguageIcon />;
        }
    };

    const formatDate = (dateInput) => {
        if (!dateInput) return "N/A";
        const date = new Date(dateInput);
        return date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                {/* <Breadcrumb routeSegments={[{ name: "Applications", path: ROUTE_CONSTANT.creatorApplication.list }, { name: "View Application" }]} /> */}
                <Box sx={{ mt: 3 }}>
                    <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Skeleton variant="rectangular" height={400} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Skeleton variant="rectangular" height={300} />
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        );
    }

    if (!application) {
        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ py: "16px", marginBottom: "20px" }} component={Paper}>
                    <Stack sx={{ ml: "24px", mb: "12px" }} gap={1} direction={"row"}>
                        <Box>
                            <Icon>apps</Icon>
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Go To</Typography>
                        </Box>
                    </Stack>
                    <Divider />
                    <Box sx={{ ml: "24px", mt: "16px" }}>
                        <Button
                            onClick={() => navigate(ROUTE_CONSTANT.creatorApplication.list)}
                            startIcon={<Icon>apps</Icon>}
                            variant="contained"
                        >
                            Application List
                        </Button>
                    </Box>
                </Box>
                <Alert severity="error" sx={{ mt: 3 }}>
                    Application not found
                </Alert>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(ROUTE_CONSTANT.creatorApplication.list)}
                    sx={{ mt: 2 }}
                >
                    Back to Applications
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, minHeight: "100vh" }}>
            <Container maxWidth="xl">

                {/* Back Button & Title */}
                {/* <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
                    <Box />
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        {application.status === "pending" && (
                            <>
                                <Button
                                    variant="contained"
                                    startIcon={<CheckCircleIcon />}
                                    onClick={() => handleConfirmOpen("confirm", "Approve this application?")}
                                    sx={{
                                        bgcolor: "#2e7d32",
                                        "&:hover": { bgcolor: "#1b5e20" },
                                        textTransform: "none"
                                    }}
                                >
                                    Approve
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<CancelIcon />}
                                    onClick={() => handleConfirmOpen("confirm", "Reject this application?")}
                                    sx={{
                                        bgcolor: "#c62828",
                                        "&:hover": { bgcolor: "#b71c1c" },
                                        textTransform: "none"
                                    }}
                                >
                                    Reject
                                </Button>
                            </>
                        )}
                    </Box>
                </Box> */}

                <Box sx={{ py: "16px", marginBottom: "20px" }} component={Paper}>
                    <Stack sx={{ ml: "24px", mb: "12px" }} gap={1} direction={"row"}>
                        <Box>
                            <Icon>apps</Icon>
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Go To</Typography>
                        </Box>
                    </Stack>
                    <Divider />
                    <Box sx={{ ml: "24px", mt: "16px" }}>
                        <Button
                            onClick={() => navigate(ROUTE_CONSTANT.creatorApplication.list)}
                            startIcon={<Icon>apps</Icon>}
                            variant="contained"
                        >
                            Application List
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {/* Main Content - Left Column */}
                    <Grid item xs={12} md={8}>
                        {/* Personal Information */}
                        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                                <PersonIcon /> Personal Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Full Name</Typography>
                                    <Typography fontWeight={500}>{application.fullName}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Email Address</Typography>
                                    <Typography fontWeight={500}>{application.email}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                                    <Typography fontWeight={500}>{application.number}</Typography>
                                </Grid>
                                {application.number2 && (<Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Alternative Phone</Typography>
                                    <Typography fontWeight={500}>{application.number2 || "N/A"}</Typography>
                                </Grid>)}
                            </Grid>
                        </Paper>

                        {/* Brand & Product Information */}
                        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                                <BusinessIcon /> Brand & Product Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Brand Name</Typography>
                                    <Typography fontWeight={500}>{application.brand}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Product Category</Typography>
                                    <Chip
                                        label={application.productCategory}
                                        size="small"
                                        sx={{ bgcolor: "#e3f2fd", color: "#1565c0", fontWeight: 500, mt: 0.5 }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Product Description</Typography>
                                    <Paper sx={{ p: 2, bgcolor: "#f8f9fa", mt: 0.5 }}>
                                        <Typography>{application.productDescription}</Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Address Information */}
                        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                                <LocationOnIcon /> Address Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Address Line 1</Typography>
                                    <Typography fontWeight={500}>{application.addressLine1}</Typography>
                                </Grid>
                                {application.addressLine2 && (<Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">Address Line 2</Typography>
                                    <Typography fontWeight={500}>{application.addressLine2 || "N/A"}</Typography>
                                </Grid>)}
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="body2" color="text.secondary">City</Typography>
                                    <Typography fontWeight={500}>{application.city}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="body2" color="text.secondary">State / Province</Typography>
                                    <Typography fontWeight={500}>{application.state}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="body2" color="text.secondary">Zip / Postal Code</Typography>
                                    <Typography fontWeight={500}>{application.zipCode}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Country</Typography>
                                    <Typography fontWeight={500}>{application.country}</Typography>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Social Links */}
                        {application.socialLinks && application.socialLinks.length > 0 && (
                            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                                    <LinkIcon /> Social Media & Website Links
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Grid container spacing={2}>
                                    {application.socialLinks.map((link, index) => (
                                        <Grid item xs={12} sm={6} key={index}>
                                            <Paper
                                                sx={{
                                                    p: 2,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 2,
                                                    bgcolor: "#f8f9fa",
                                                    "&:hover": { bgcolor: "#e9ecef" }
                                                }}
                                            >
                                                <Avatar sx={{ bgcolor: "#1976d2", width: 40, height: 40 }}>
                                                    {getSocialIcon(link.platform)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                                                        {link.platform}
                                                    </Typography>
                                                    <Link
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        sx={{
                                                            color: "#1976d2",
                                                            textDecoration: "none",
                                                            "&:hover": { textDecoration: "underline" }
                                                        }}
                                                    >
                                                        {link.url}
                                                    </Link>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        )}
                    </Grid>

                    {/* Sidebar - Right Column */}
                    <Grid item xs={12} md={4}>
                        {/* Status Card */}
                        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                                Application Status
                            </Typography>
                            {/* <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                                {getStatusChip(application.status)}
                            </Box>   */}
                            <Divider sx={{ my: 2 }} />
                            <Grid container spacing={1}>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Application ID</Typography>
                                    <Typography fontWeight={500}>{application._id}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Submitted On</Typography>
                                    <Typography fontWeight={500}>{formatDate(application.createdAt)}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                                    <Typography fontWeight={500}>{formatDate(application.updatedAt)}</Typography>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Quick Actions */}
                        <Paper sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                                Quick Actions
                            </Typography>
                            <Stack spacing={1}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<EmailIcon />}
                                    onClick={() => window.location.href = `mailto:${application.email}`}
                                    sx={{ justifyContent: "flex-start", textTransform: "none" }}
                                >
                                    Send Email
                                </Button>
                                {application.number && (
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<PhoneIcon />}
                                        onClick={() => window.location.href = `tel:${application.number}`}
                                        sx={{ justifyContent: "flex-start", textTransform: "none" }}
                                    >
                                        Call Applicant
                                    </Button>
                                )}
                                {/* <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<VerifiedUserIcon />}
                                    sx={{ justifyContent: "flex-start", textTransform: "none" }}
                                >
                                    View Portfolio
                                </Button> */}
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* Confirm Modal */}
            <ConfirmModal
                open={openConfirm}
                handleClose={handleConfirmClose}
                handleStatusChange={() => {
                    const status = confirmType === "confirm" ? "approved" : "rejected";
                    handleStatusUpdate(status);
                }}
                type={confirmType}
                msg={confirmMsg}
                handleDelete={() => { }}
            />
        </Box>
    );
};

export default View;