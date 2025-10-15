import styled from "@emotion/styled";
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Switch,
    TextField,
    Typography,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogContent,
    IconButton,
    Tooltip,
    Chip,
    DialogTitle,
    DialogActions
} from "@mui/material";
import AppsIcon from "@mui/icons-material/Apps";
import React from "react";
import {Formik} from "formik";
import * as Yup from "yup";
import {useState} from "react";
import {ApiService} from "app/services/ApiService";
import {localStorageKey} from "app/constant/localStorageKey";
import {apiEndpoints} from "app/constant/apiEndpoints";
import {useNavigate, useSearchParams} from "react-router-dom";
import {ROUTE_CONSTANT} from "app/constant/routeContanst";
import {useEffect} from "react";
import {EditTwoTone, Close} from "@mui/icons-material";
import {Fragment} from "react";
import ConfirmModal from "app/components/ConfirmModal";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

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

// Custom Tooltip component for images
const ImageTooltip = ({ imageUrl, onImageChange, onImageRemove, children }) => {
    const [open, setOpen] = useState(false);

    const handleTooltipOpen = () => {
        setOpen(true);
    };

    const handleTooltipClose = () => {
        setOpen(false);
    };

    return (
        <Tooltip
            open={open}
            onClose={handleTooltipClose}
            onOpen={handleTooltipOpen}
            title={
                <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img
                        src={imageUrl}
                        alt="Preview"
                        style={{
                            width: '150px',
                            height: '150px',
                            objectFit: 'contain',
                            marginBottom: '10px'
                        }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={onImageRemove}
                            sx={{ fontSize: '12px' }}
                        >
                            Remove
                        </Button>
                    </Box>
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
                        boxShadow: 1
                    }
                }
            }}
        >
            {children}
        </Tooltip>
    );
};

// Draggable Table Row Component
const DraggableTableRow = ({
                               children,
                               index,
                               onDragStart,
                               onDragOver,
                               onDrop,
                               onDragEnd,
                               isDragging,
                               isDragOver,
                               ...props
                           }) => {
    const handleDragStart = (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
        onDragStart(e, index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        onDragOver(e, index);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        onDrop(e, index);
    };

    return (
        <TableRow
            {...props}
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={onDragEnd}
            sx={{
                cursor: isDragging ? 'grabbing' : 'grab',
                backgroundColor: isDragging
                    ? 'rgba(25, 118, 210, 0.08)'
                    : isDragOver
                        ? 'rgba(0, 0, 0, 0.04)'
                        : 'transparent',
                opacity: isDragging ? 0.7 : 1,
                transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.2s ease',
                boxShadow: isDragging ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
                position: 'relative',
                '&:hover': {
                    backgroundColor: isDragging
                        ? 'rgba(25, 118, 210, 0.08)'
                        : 'rgba(0, 0, 0, 0.04)',
                },
                '& .drag-handle': {
                    opacity: isDragging ? 1 : 0.3,
                    transition: 'opacity 0.2s ease',
                },
                '&:hover .drag-handle': {
                    opacity: 0.7,
                },
                borderBottom: isDragOver ? '2px dashed #1976d2' : '1px solid rgba(224, 224, 224, 1)'
            }}
        >
            {children}
        </TableRow>
    );
};

const AddVariant = () => {
    const [inputFields, setInputFields] = useState([
        {
            id: 1,
            attributeValue: "",
            sortOrder: 1,
            status: false,
            _id: "",
            previewImage: null,
            thumbnailImage: null,
            previewImageUrl: "",
            thumbnailImageUrl: ""
        }
    ]);
    console.log("inputFieldsinputFields", inputFields);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useSearchParams();
    const [editData, setEditData] = useState({});
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState("");
    const [bulkInput, setBulkInput] = useState("");
    const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

    const [deleteValue, setDeleteValue] = useState([]);
    const [open, setOpen] = React.useState(false);
    const [type, setType] = useState("");
    const [route, setRoute] = useState(null);
    const [msg, setMsg] = useState("")
    const [removeData, setRemoveData] = useState({
        i: "",
        deleteId: ""
    });

    // Drag and drop state
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

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
            navigate(route)
        }
        setRoute(null)
        setMsg("")
    };

    const navigate = useNavigate();

    const queryId = query.get("id");

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required("Name is required")
            .min(2, "Name is too short - should be 2 chars minimum")
    });

    // Drag and drop handlers
    const handleDragStart = (e, sourceIndex) => {
        setDraggingIndex(sourceIndex);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', sourceIndex.toString());
    };

    const handleDragOver = (e, targetIndex) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (draggingIndex !== null && draggingIndex !== targetIndex) {
            setDragOverIndex(targetIndex);
        }
    };

    const handleDragEnd = () => {
        setDraggingIndex(null);
        setDragOverIndex(null);
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));

        if (sourceIndex !== targetIndex) {
            const newInputFields = [...inputFields];
            const [movedItem] = newInputFields.splice(sourceIndex, 1);
            newInputFields.splice(targetIndex, 0, movedItem);

            // Update sortOrder based on new position (1-based indexing)
            const updatedFields = newInputFields.map((field, index) => ({
                ...field,
                sortOrder: index + 1
            }));

            setInputFields(updatedFields);
        }

        setDraggingIndex(null);
        setDragOverIndex(null);
    };

    const handleAddFields = () => {
        const newInputFields = inputFields.concat({
            id: Date.now(), // Use timestamp for unique ID
            attributeValue: "",
            sortOrder: inputFields.length + 1, // Auto-assign next sort order
            status: false,
            _id: "new",
            previewImage: null,
            thumbnailImage: null,
            previewImageUrl: "",
            thumbnailImageUrl: ""
        });
        setInputFields(newInputFields);
    };

    // New function to handle bulk attribute addition
    const handleBulkAddAttributes = () => {
        if (!bulkInput.trim()) return;

        // Split by comma and trim each attribute
        const attributes = bulkInput.split(',')
            .map(attr => attr.trim())
            .filter(attr => attr.length > 0);

        if (attributes.length === 0) return;

        const newAttributes = attributes.map((attribute, index) => ({
            id: Date.now() + index, // Unique IDs
            attributeValue: attribute,
            sortOrder: inputFields.length + index + 1, // Continue from current length
            status: false,
            _id: "new",
            previewImage: null,
            thumbnailImage: null,
            previewImageUrl: "",
            thumbnailImageUrl: ""
        }));

        setInputFields(prev => [...prev, ...newAttributes]);
        setBulkInput(""); // Clear the input after adding
        setBulkDialogOpen(false); // Close dialog after adding
    };

    const handleOpenBulkDialog = () => {
        setBulkDialogOpen(true);
    };

    const handleCloseBulkDialog = () => {
        setBulkDialogOpen(false);
        setBulkInput("");
    };

    const handleRemoveFields = (index, id) => {
        if (removeData?.i !== "new") {
            setDeleteValue((prv) => [...prv, removeData?.deleteId]);
        }
        const newInputFields = [...inputFields];
        newInputFields.splice(removeData?.i, 1);

        // Re-calculate sortOrder after removal
        const updatedFields = newInputFields.map((field, index) => ({
            ...field,
            sortOrder: index + 1
        }));

        setInputFields(updatedFields);
    };

    const handleChangeInput = (index, event) => {
        const newInputFields = [...inputFields];
        newInputFields[index][event.target.name] = event.target.value;
        setInputFields(newInputFields);
    };

    const handleChangeSwitch = (index) => {
        const newInputFields = [...inputFields];
        newInputFields[index]["status"] = !newInputFields[index]["status"];
        setInputFields(newInputFields);
    };

    const handleImageUpload = (index, type, event) => {
        const file = event.target.files[0];
        if (file) {
            const newInputFields = [...inputFields];
            newInputFields[index][type] = file;
            newInputFields[index][`${type}Url`] = URL.createObjectURL(file);
            setInputFields(newInputFields);
        }
    };

    const handleImageRemove = (index, type) => {
        const newInputFields = [...inputFields];
        newInputFields[index][type] = null;
        newInputFields[index][`${type}Url`] = "";
        setInputFields(newInputFields);
    };

    const handleOpenImageDialog = (imageUrl) => {
        setCurrentImage(imageUrl);
        setImageDialogOpen(true);
    };

    const handleCloseImageDialog = () => {
        setImageDialogOpen(false);
        setCurrentImage("");
    };

    const auth_key = localStorage.getItem(localStorageKey.auth_key);

    const addVariantHandler = async (values) => {
        let variant_attribute = [];

        // Use the current sortOrder from drag-and-drop position
        const validFields = inputFields.filter(field => field.attributeValue.trim() !== "");

        if (validFields.length === 0) {
            handleOpen("error", "Please Add at least one Variant Attribute");
            return;
        }

        variant_attribute = validFields.map((e) => ({
            attr_name: e.attributeValue,
            sort_order: e.sortOrder, // Use the drag-and-drop assigned sortOrder
            _id: "new",
            status: e.status,
            previewImage: e.previewImage,
            thumbnailImage: e.thumbnailImage
        }));

        // Create FormData to handle file uploads
        const formData = new FormData();
        formData.append("variant_name", values.name);
        formData.append("_id", "new");

        variant_attribute.forEach((attr, index) => {
            formData.append(`variant_attr[${index}][attr_name]`, attr.attr_name);
            formData.append(`variant_attr[${index}][sort_order]`, attr.sort_order);
            formData.append(`variant_attr[${index}][status]`, attr.status);
            formData.append(`variant_attr[${index}][_id]`, attr._id);

            if (attr.previewImage) {
                formData.append(`variant_attr[${index}][preview_image]`, attr.previewImage);
            }

            if (attr.thumbnailImage) {
                formData.append(`variant_attr[${index}][thumbnail]`, attr.thumbnailImage);
            }
        });

        console.log({formData: Object.fromEntries(formData)});
        try {
            setLoading(true);
            const res = await ApiService.postImage(apiEndpoints.addVariant, formData, auth_key);
            console.log(res);
            if (res.status === 200) {
                setLoading(false);
                if (!queryId) {
                    setRoute(ROUTE_CONSTANT.catalog.variant.list)
                }
                handleOpen("success", res?.data);
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
            handleOpen("error", error);
        }
    };

    const editVariant = async () => {
        try {
            const res = await ApiService.get(`${apiEndpoints.editVariant}/${queryId}`, auth_key);

            if (res.status === 200) {
                setEditData(res.data.variant);
                const variantAttr = res?.data?.variant?.variantAttributes.map((e, i) => {
                    return {
                        id: i + 1,
                        attributeValue: e.attribute_value,
                        sortOrder: e.sort_order,
                        status: e.status,
                        _id: e._id,
                        previewImage: null,
                        thumbnailImage: null,
                        previewImageUrl: e.preview_image || "",
                        thumbnailImageUrl: e.thumbnail || ""
                    };
                });
                setInputFields(variantAttr);
            }
        } catch (error) {
            console.log(error);
            handleOpen("error", error);
        }
    };

    const editVariantHandler = async (values) => {
        // Use the current sortOrder from drag-and-drop position
        const renamedInputFields = inputFields.map(
            ({
                 id,
                 attributeValue,
                 sortOrder,
                 status,
                 _id,
                 previewImage,
                 thumbnailImage,
                 previewImageUrl,
                 thumbnailImageUrl,
                 ...rest
             }) => ({
                attr_name: attributeValue,
                sort_order: sortOrder, // Use the current sortOrder from drag-and-drop
                status: status,
                _id: _id,
                previewImage: previewImage,
                thumbnailImage: thumbnailImage,
                ...rest
            })
        );

        // Create FormData to handle file uploads
        const formData = new FormData();
        formData.append("variant_name", values.name);
        formData.append("_id", editData._id);
        formData.append("deletedAttrIds", JSON.stringify(deleteValue));

        renamedInputFields.forEach((attr, index) => {
            formData.append(`variant_attr[${index}][attr_name]`, attr.attr_name);
            formData.append(`variant_attr[${index}][sort_order]`, attr.sort_order);
            formData.append(`variant_attr[${index}][status]`, attr.status);
            formData.append(`variant_attr[${index}][_id]`, attr._id);

            if (attr.previewImage) {
                formData.append(`variant_attr[${index}][preview_image]`, attr.previewImage);
            }

            if (attr.thumbnailImage) {
                formData.append(`variant_attr[${index}][thumbnail]`, attr.thumbnailImage);
            }
        });

        try {
            setLoading(true);
            const res = await ApiService.postImage(apiEndpoints.addVariant, formData, auth_key);
            console.log(res);
            if (res.status === 200) {
                setLoading(false);
                if (!queryId) {
                    setRoute(ROUTE_CONSTANT.catalog.variant.list)
                }
                handleOpen("success", res?.data);
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
            handleOpen("error", error);
        }
    };

    useEffect(() => {
        if (queryId) {
            editVariant();
        }
    }, []);

    const handleReset = () => {
        setInputFields([
            {
                id: 1,
                attributeValue: "",
                sortOrder: 1,
                status: false,
                previewImage: null,
                thumbnailImage: null,
                previewImageUrl: "",
                thumbnailImageUrl: ""
            }
        ]);
        setBulkInput("");
    };

    return (
        <Fragment>
            <Box sx={{margin: "30px", display: "flex", flexDirection: "column", gap: "16px"}}>
                <Box sx={{py: "16px", marginBottom: "20px"}} component={Paper}>
                    <Stack sx={{ml: "24px", mb: "12px"}} gap={1} direction={"row"}>
                        <Box>
                            <AppsIcon/>
                        </Box>
                        <Box>
                            <Typography sx={{fontWeight: "600", fontSize: "18px"}}>Go To</Typography>
                        </Box>
                    </Stack>
                    <Divider/>
                    <Box sx={{ml: "24px", mt: "16px"}}>
                        <Button
                            onClick={() => navigate(ROUTE_CONSTANT.catalog.variant.list)}
                            startIcon={<AppsIcon/>}
                            variant="contained"
                        >
                            Variant List
                        </Button>
                    </Box>
                </Box>
                <Box sx={{py: "16px"}} component={Paper}>
                    <Stack sx={{ml: "16px", mb: "12px"}} gap={1} direction={"row"}>
                        <Box>
                            <AppsIcon/>
                        </Box>
                        <Box>
                            <Typography sx={{fontWeight: "600", fontSize: "18px"}}>
                                {queryId ? "Edit Variant" : "Add Variant"}
                            </Typography>
                        </Box>
                    </Stack>
                    <Divider/>

                    <Formik
                        initialValues={{
                            name: queryId ? editData?.variant_name || "" : "",
                            category: queryId ? editData?.display_layout : "",
                            sortOrder: queryId ? editData.sort_order : ""
                        }}
                        validationSchema={validationSchema}
                        enableReinitialize={true}
                        onSubmit={(values) => {
                            if (queryId) {
                                editVariantHandler(values);
                            } else {
                                addVariantHandler(values);
                            }
                        }}
                    >
                        {({values, handleChange, handleSubmit, errors, touched}) => {
                            return (
                                <form onSubmit={handleSubmit}>
                                    <Stack gap={"16px"} sx={{p: "16px"}}>
                                        <TextField
                                            id="name"
                                            name="name"
                                            label={" Enter Variant Name"}
                                            placeholder={"Enter Variant Name"}
                                            type="text"
                                            value={values.name}
                                            sx={{
                                                "& .MuiInputBase-root": {
                                                    height: "40px"
                                                },
                                                "& .MuiFormLabel-root": {
                                                    top: "-7px"
                                                }
                                            }}
                                            onChange={handleChange}
                                            error={touched.name && Boolean(errors.name)}
                                            helperText={touched.name && errors.name}
                                        />
                                    </Stack>

                                    <Box sx={{p: "16px"}}>
                                        <Typography variant="h6" sx={{mb: 2}}>
                                            Variant Attributes
                                        </Typography>

                                        <TableContainer component={Paper} variant="outlined">
                                            <Table sx={{minWidth: 650}} aria-label="variant attributes table">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell width="50px">Drag</TableCell>
                                                        <TableCell>Name</TableCell>
                                                        <TableCell align="center">Preview Image (16x16)</TableCell>
                                                        <TableCell align="center">Thumbnail Image (16x16)</TableCell>
                                                        <TableCell align="center">Active</TableCell>
                                                        <TableCell align="center">Action</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {inputFields.map((inputField, index) => (
                                                        <DraggableTableRow
                                                            key={inputField.id}
                                                            index={index}
                                                            onDragStart={handleDragStart}
                                                            onDragOver={handleDragOver}
                                                            onDrop={handleDrop}
                                                            onDragEnd={handleDragEnd}
                                                            isDragging={draggingIndex === index}
                                                            isDragOver={dragOverIndex === index}
                                                        >
                                                            <TableCell align="center">
                                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <IconButton
                                                                        className="drag-handle"
                                                                        size="small"
                                                                        sx={{
                                                                            cursor: 'grab',
                                                                            '&:active': {
                                                                                cursor: 'grabbing',
                                                                            },
                                                                            touchAction: 'none'
                                                                        }}
                                                                    >
                                                                        <DragIndicatorIcon
                                                                            sx={{
                                                                                color: 'text.secondary',
                                                                                opacity: draggingIndex === index ? 1 : 0.6
                                                                            }}
                                                                        />
                                                                    </IconButton>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell component="th" scope="row">
                                                                <TextField
                                                                    id={`attributeValue${inputField.id}`}
                                                                    name="attributeValue"
                                                                    placeholder={"Enter Attribute Value"}
                                                                    type="text"
                                                                    value={inputField.attributeValue}
                                                                    onChange={(event) => handleChangeInput(index, event)}
                                                                    fullWidth
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    {inputField.previewImageUrl ? (
                                                                        <ImageTooltip
                                                                            imageUrl={inputField.previewImageUrl}
                                                                            onImageChange={(e) => handleImageUpload(index, "previewImage", e)}
                                                                            onImageRemove={() => handleImageRemove(index, "previewImage")}
                                                                        >
                                                                            <Box
                                                                                sx={{
                                                                                    width: 69,
                                                                                    height: 69,
                                                                                    border: '1px dashed #ccc',
                                                                                    p: 0.5,
                                                                                    cursor: 'pointer'
                                                                                }}
                                                                            >
                                                                                <img
                                                                                    src={inputField.previewImageUrl}
                                                                                    alt="Preview"
                                                                                    style={{
                                                                                        width: '100%',
                                                                                        height: '100%',
                                                                                        objectFit: 'contain'
                                                                                    }}
                                                                                />
                                                                            </Box>
                                                                        </ImageTooltip>
                                                                    ) : (
                                                                        <Button
                                                                            component="label"
                                                                            variant="outlined"
                                                                            size="small"
                                                                            sx={{mb: 1, aspectRatio: "1/1", width: "30px"}}
                                                                        >
                                                                            <AddPhotoAlternateIcon/>
                                                                            <VisuallyHiddenInput
                                                                                type="file"
                                                                                onChange={(e) => handleImageUpload(index, "previewImage", e)}
                                                                                accept="image/*"
                                                                            />
                                                                        </Button>
                                                                    )}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    {inputField.thumbnailImageUrl ? (
                                                                        <ImageTooltip
                                                                            imageUrl={inputField.thumbnailImageUrl}
                                                                            onImageChange={(e) => handleImageUpload(index, "thumbnailImage", e)}
                                                                            onImageRemove={() => handleImageRemove(index, "thumbnailImage")}
                                                                        >
                                                                            <Box
                                                                                sx={{
                                                                                    width: 69,
                                                                                    height: 69,
                                                                                    border: '1px dashed #ccc',
                                                                                    p: 0.5,
                                                                                    cursor: 'pointer'
                                                                                }}
                                                                            >
                                                                                <img
                                                                                    src={inputField.thumbnailImageUrl}
                                                                                    alt="Thumbnail"
                                                                                    style={{
                                                                                        width: '100%',
                                                                                        height: '100%',
                                                                                        objectFit: 'contain'
                                                                                    }}
                                                                                />
                                                                            </Box>
                                                                        </ImageTooltip>
                                                                    ) : (
                                                                        <Button
                                                                            component="label"
                                                                            variant="outlined"
                                                                            size="small"
                                                                            sx={{
                                                                                mb: 1,
                                                                                aspectRatio: "1/1",
                                                                                width: "30px"
                                                                            }}
                                                                        >
                                                                            <AddPhotoAlternateIcon/>
                                                                            <VisuallyHiddenInput
                                                                                type="file"
                                                                                onChange={(e) => handleImageUpload(index, "thumbnailImage", e)}
                                                                                accept="image/*"
                                                                            />
                                                                        </Button>
                                                                    )}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <Switch
                                                                    name="status"
                                                                    checked={inputField.status}
                                                                    onChange={() => handleChangeSwitch(index)}
                                                                />
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <Button
                                                                    variant="contained"
                                                                    sx={{
                                                                        bgcolor: "#DD3A49",
                                                                        "&:hover": {
                                                                            bgcolor: "#FF5A5F"
                                                                        }
                                                                    }}
                                                                    onClick={() => {
                                                                        handleOpen("remove");
                                                                        setRemoveData(() => ({
                                                                            i: index,
                                                                            deleteId: inputField._id
                                                                        }));
                                                                    }}
                                                                    type="button"
                                                                    size="small"
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </TableCell>
                                                        </DraggableTableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>

                                        <Box sx={{display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap'}}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleAddFields}
                                                type="button"
                                            >
                                                Add Single Attribute
                                            </Button>

                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                onClick={handleOpenBulkDialog}
                                                type="button"
                                            >
                                                Add Multiple Attributes
                                            </Button>

                                            <Box sx={{flex: 1}}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Total Attributes: {inputFields.length} |
                                                    Drag and drop to reorder attributes
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box sx={{ml: "16px", mt: "16px", width: "100%"}}>
                                        <Button
                                            endIcon={loading ? <CircularProgress size={15}/> : ""}
                                            disabled={loading ? true : false}
                                            sx={{mr: "16px"}}
                                            variant="contained"
                                            color="primary"
                                            type="submit"
                                        >
                                            Submit
                                        </Button>

                                        <Button
                                            variant="contained"
                                            color="error"
                                            type="reset"
                                            onClick={() => handleOpen("reset")}
                                        >
                                            Reset
                                        </Button>
                                    </Box>
                                </form>
                            );
                        }}
                    </Formik>
                </Box>
            </Box>

            {/* Bulk Add Attributes Dialog */}
            <Dialog
                open={bulkDialogOpen}
                onClose={handleCloseBulkDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Add Multiple Attributes
                </DialogTitle>
                <DialogContent>
                    <Box sx={{mt: 2}}>
                        <Typography variant="body1" sx={{mb: 2}}>
                            Enter attribute names separated by commas. Each attribute will be added as a separate row.
                        </Typography>

                        <TextField
                            value={bulkInput}
                            onChange={(e) => setBulkInput(e.target.value)}
                            placeholder="Enter attributes separated by commas (e.g., stone, color, size, material)"
                            fullWidth
                            multiline
                            rows={4}
                            autoFocus
                        />

                        {bulkInput && (
                            <Box sx={{mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1}}>
                                <Typography variant="subtitle2" sx={{mb: 1}}>
                                    Preview - Will add {bulkInput.split(',').filter(attr => attr.trim()).length} attributes:
                                </Typography>
                                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                                    {bulkInput.split(',').map((attr, index) => (
                                        attr.trim() && (
                                            <Chip
                                                key={index}
                                                label={attr.trim()}
                                                size="small"
                                                variant="outlined"
                                            />
                                        )
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseBulkDialog}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleBulkAddAttributes}
                        variant="contained"
                        disabled={!bulkInput.trim()}
                    >
                        Add Attributes
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmModal
                open={open}
                handleClose={handleClose}
                handleReset={handleReset}
                type={type}
                msg={msg}
                handleRemoveFields={handleRemoveFields}
            />
        </Fragment>
    );
};

export default AddVariant;
