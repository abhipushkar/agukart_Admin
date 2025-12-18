import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Paper,
    Slider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Tooltip,
    styled
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CropIcon from "@mui/icons-material/Crop";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import Cropper from 'react-easy-crop';
import { ApiService } from "app/services/ApiService";
import { getCroppedImg } from "../product_new/add_product/tabs/productTabs/Variations/components/imageComponents/cropUtil";
import { toast } from "react-toastify";
import { Breadcrumb } from "app/components";
import { localStorageKey } from "app/constant/localStorageKey";

const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
});

const Container = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
        marginBottom: "30px",
        [theme.breakpoints.down("sm")]: { marginBottom: "16px" },
    },
}));

export default function VendorBannerImage() {
    const [banners, setBanners] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [cropDialogOpen, setCropDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [userId, setUserId] = useState("");
    const authToken = localStorage.getItem(localStorageKey.auth_key);

    // Form State
    const [currentImage, setCurrentImage] = useState(null);
    const [originalImage, setOriginalImage] = useState(null);
    const [editedImage, setEditedImage] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    // API endpoints (placeholders)
    const GET_BANNERS_URL = "/get-shop-banner";
    const ADD_BANNER_URL = "/add-shop-banner";
    const DELETE_BANNER_URL = "/delete-shop-banner";

    useEffect(() => {
        fetchBanners();
    }, [authToken]);

    const fetchBanners = async () => {
        if (!GET_BANNERS_URL) return;
        setLoading(true);
        try {
            const res = await ApiService.get(GET_BANNERS_URL, authToken);
            console.log("Response ", res.data.data);

            if (res?.data) {
                setUserId(res.data.user_id);
                setBanners(res.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching banners:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadClick = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setOriginalImage(reader.result);
                setCurrentImage(file);
                setCropDialogOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleCropApply = async () => {
        try {
            if (!croppedAreaPixels) return;

            const croppedImageBlob = await getCroppedImg(
                originalImage,
                croppedAreaPixels,
                rotation
            );

            const editedFile = new File([croppedImageBlob], `edited-${Date.now()}.jpg`, {
                type: 'image/jpeg'
            });

            setEditedImage(editedFile);
            setCropDialogOpen(false);
            setOpenDialog(true);
        } catch (error) {
            console.error("Error cropping image:", error);
            toast.error("Failed to crop image");
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("image", currentImage);
            formData.append("editedImage", editedImage);
            formData.append("scale", zoom);
            formData.append("x", crop.x);
            formData.append("y", crop.y);
            formData.append("user_id", userId);


            if (editIndex !== null) {
                // Update
                formData.append("index", editIndex);
                await ApiService.postImage(ADD_BANNER_URL, formData, authToken);
                toast.success("Banner updated successfully");
            } else {
                // Add
                await ApiService.postImage(ADD_BANNER_URL, formData, authToken);
                toast.success("Banner added successfully");
            }

            handleCloseDialog();
            await fetchBanners();
        } catch (error) {
            console.error("Error saving banner:", error);
            toast.error("Failed to save banner");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (index) => {
        const banner = banners[index];
        setEditIndex(index);
        setCurrentImage(banner.image);
        setOriginalImage(banner.image);
        setEditedImage(banner.editedImage);
        setZoom(banner.metaData.scale);
        setCrop({ x: banner.metaData.x, y: banner.metaData.y });
        setOpenDialog(true);
    };

    const handleDelete = async (index) => {
        if (!window.confirm("Are you sure you want to delete this banner?")) return;

        setLoading(true);
        try {
            if (DELETE_BANNER_URL) {
                await ApiService.post(DELETE_BANNER_URL, { user_id: userId, index: index }, authToken);
                toast.success("Banner deleted successfully");
            }

            const updatedBanners = banners.filter((_, i) => i !== index);
            setBanners(updatedBanners);
        } catch (error) {
            console.error("Error deleting banner:", error);
            toast.error("Failed to delete banner");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditIndex(null);
        setCurrentImage(null);
        setOriginalImage(null);
        setEditedImage(null);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
        setRotation(0);
    };

    const handleOpenAdd = () => {
        handleCloseDialog();
        setOpenDialog(true);
    };

    // Helper to get image source for preview
    const getImageSrc = (img) => {
        if (!img) return "";
        if (typeof img === 'string') return img;
        if (img instanceof File || img instanceof Blob) {
            return URL.createObjectURL(img);
        }
        return "";
    };

    return (
        <Container>
            <Box className="breadcrumb">
                <Breadcrumb routeSegments={[{ name: "Vendor", path: "/pages/vendor" }, { name: "Banner Images" }]} />
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Vendor Banner Images</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAdd}
                >
                    Add New Banner
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="banner table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Preview</TableCell>
                            <TableCell>Original Image</TableCell>
                            <TableCell>Meta Data</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {banners.map((banner, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <Box
                                        component="img"
                                        src={banner.editedImage || banner.image}
                                        alt="Banner Preview"
                                        sx={{ width: 100, height: 60, objectFit: "cover", borderRadius: 1 }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Box
                                        component="img"
                                        src={banner.image}
                                        alt="Banner Preview"
                                        sx={{ width: 100, height: 60, objectFit: "cover", borderRadius: 1 }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption" color="textSecondary">
                                        Scale: {banner.metaData.scale.toFixed(2)}, X: {banner.metaData.x}, Y: {banner.metaData.y}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => handleEdit(index)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(index)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {banners.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No banners found. Click "Add New Banner" to create one.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Main Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>{editIndex !== null ? "Edit Banner" : "Add New Banner"}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <Box
                                border="1px dashed #ccc"
                                p={3}
                                textAlign="center"
                                borderRadius={1}
                                sx={{ backgroundColor: "#f9f9f9", cursor: "pointer" }}
                                onClick={() => document.getElementById("banner-upload").click()}
                            >
                                <VisuallyHiddenInput
                                    id="banner-upload"
                                    type="file"
                                    onChange={handleUploadClick}
                                    accept="image/*"
                                />
                                <CloudUploadIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
                                <Typography>
                                    {currentImage ? "Change Image" : "Click to Upload Banner Image"}
                                </Typography>
                            </Box>
                        </Grid>

                        {currentImage && (
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" gutterBottom>Preview</Typography>
                                <Box sx={{ position: 'relative', width: '100%', height: 200, border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
                                    <img
                                        src={getImageSrc(editedImage || currentImage)}
                                        alt="Final Preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />
                                    <Tooltip title="Re-crop Image">
                                        <IconButton
                                            sx={{ position: 'absolute', bottom: 8, right: 8, bgcolor: 'rgba(255,255,255,0.8)' }}
                                            onClick={() => setCropDialogOpen(true)}
                                            color="primary"
                                        >
                                            <CropIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="caption" color="textSecondary">
                                        Metadata: Scale: {zoom.toFixed(2)}, X: {Math.round(crop.x)}, Y: {Math.round(crop.y)}
                                    </Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        color="primary"
                        variant="contained"
                        disabled={!currentImage || loading}
                    >
                        {editIndex !== null ? "Update" : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Crop Dialog */}
            <Dialog open={cropDialogOpen} onClose={() => setCropDialogOpen(false)} maxWidth="lg" fullWidth>
                <DialogTitle>Crop Banner Image</DialogTitle>
                <DialogContent>
                    <Box sx={{ position: 'relative', height: 400, width: '100%', mt: 2, bgcolor: '#333' }}>
                        <Cropper
                            image={originalImage}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={16 / 9}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onRotationChange={setRotation}
                            onCropComplete={handleCropComplete}
                            crossOrigin="anonymous"
                        />
                    </Box>
                    <Box sx={{ mt: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item>
                                <ZoomOutIcon />
                            </Grid>
                            <Grid item xs>
                                <Slider
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onChange={(e, newValue) => setZoom(newValue)}
                                />
                            </Grid>
                            <Grid item>
                                <ZoomInIcon />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item>
                                <RotateLeftIcon />
                            </Grid>
                            <Grid item xs>
                                <Slider
                                    value={rotation}
                                    min={0}
                                    max={360}
                                    onChange={(e, newValue) => setRotation(newValue)}
                                />
                            </Grid>
                            <Grid item>
                                <RotateRightIcon />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCropDialogOpen(false)} color="error" startIcon={<CloseIcon />}>Cancel</Button>
                    <Button onClick={handleCropApply} color="success" variant="contained" startIcon={<CheckIcon />}>Apply Crop</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
