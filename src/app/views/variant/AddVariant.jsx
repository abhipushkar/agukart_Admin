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
    Tooltip
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
                        {/*<Button*/}
                        {/*    variant="contained"*/}
                        {/*    size="small"*/}
                        {/*    component="label"*/}
                        {/*    sx={{ fontSize: '12px' }}*/}
                        {/*>*/}
                        {/*    Change*/}
                        {/*    <VisuallyHiddenInput*/}
                        {/*        type="file"*/}
                        {/*        onChange={onImageChange}*/}
                        {/*        accept="image/*"*/}
                        {/*    />*/}
                        {/*</Button>*/}
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

const AddVariant = () => {
    const [inputFields, setInputFields] = useState([
        {
            id: 1,
            attributeValue: "",
            sortOrder: "",
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

    const [deleteValue, setDeleteValue] = useState([]);
    const [open, setOpen] = React.useState(false);
    const [type, setType] = useState("");
    const [route, setRoute] = useState(null);
    const [msg, setMsg] = useState("")
    const [removeData, setRemoveData] = useState({
        i: "",
        deleteId: ""
    });

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

    const handleAddFields = () => {
        const newInputFields = inputFields.concat({
            id: inputFields.length + 1,
            attributeValue: "",
            sortOrder: "",
            status: false,
            _id: "new",
            previewImage: null,
            thumbnailImage: null,
            previewImageUrl: "",
            thumbnailImageUrl: ""
        });
        setInputFields(newInputFields);
    };

    const handleRemoveFields = (index, id) => {
        if (removeData?.i !== "new") {
            setDeleteValue((prv) => [...prv, removeData?.deleteId]);
        }
        const newInputFields = [...inputFields];
        newInputFields.splice(removeData?.i, 1);
        setInputFields(newInputFields);
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

        const sortedOrderMapping = inputFields
            .slice()
            .sort((a, b) => a.attributeValue.localeCompare(b.attributeValue))
            .map((e, index) => ({
                attributeValue: e.attributeValue,
                sortOrder: index + 1
            }));

        const updatedFields = inputFields.map((field) => {
            const sortOrderObj = sortedOrderMapping.find(
                (sortedField) => sortedField.attributeValue === field.attributeValue
            );
            return {
                ...field,
                sortOrder: sortOrderObj ? sortOrderObj.sortOrder : field.sortOrder
            };
        });

        if (updatedFields.length === 1) {
            if (!updatedFields[0].attributeValue) {
                handleOpen("error", "Please Add at least one Variant Attribute");
                return;
            } else {
                variant_attribute = updatedFields.map((e) => ({
                    attr_name: e.attributeValue,
                    sort_order: e.sortOrder,
                    _id: "new",
                    status: e.status,
                    previewImage: e.previewImage,
                    thumbnailImage: e.thumbnailImage
                }));
            }
        } else {
            if (!updatedFields[updatedFields.length - 1].attributeValue) {
                variant_attribute = updatedFields.slice(0, -1).map((e) => ({
                    attr_name: e.attributeValue,
                    sort_order: e.sortOrder,
                    _id: "new",
                    status: e.status,
                    previewImage: e.previewImage,
                    thumbnailImage: e.thumbnailImage
                }));
            } else {
                variant_attribute = updatedFields.map((e) => ({
                    attr_name: e.attributeValue,
                    sort_order: e.sortOrder,
                    _id: "new",
                    status: e.status,
                    previewImage: e.previewImage,
                    thumbnailImage: e.thumbnailImage
                }));
            }
        }

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
        const sortedOrderMapping = inputFields
            .slice()
            .sort((a, b) => a.attributeValue.localeCompare(b.attributeValue))
            .map((e, index) => ({
                attributeValue: e.attributeValue,
                sortOrder: index + 1
            }));

        const updatedInputFields = inputFields.map((field) => {
            const sortOrderObj = sortedOrderMapping.find(
                (sortedField) => sortedField.attributeValue === field.attributeValue
            );
            return {
                ...field,
                sortOrder: sortOrderObj ? sortOrderObj.sortOrder : field.sortOrder
            };
        });

        const renamedInputFields = updatedInputFields.map(
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
                sort_order: sortOrder,
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
                sortOrder: "",
                status: false,
                previewImage: null,
                thumbnailImage: null,
                previewImageUrl: "",
                thumbnailImageUrl: ""
            }
        ]);
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
                                                        <TableCell>Name</TableCell>
                                                        <TableCell align="center">Preview Image (16x16)</TableCell>
                                                        <TableCell align="center">Thumbnail Image (16x16)</TableCell>
                                                        <TableCell align="center">Active</TableCell>
                                                        <TableCell align="center">Action</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {inputFields.map((inputField, index) => (
                                                        <TableRow key={inputField.id}>
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
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>

                                        <Button
                                            sx={{mt: 2}}
                                            variant="contained"
                                            color="primary"
                                            onClick={handleAddFields}
                                            type="button"
                                        >
                                            Add More Attributes
                                        </Button>
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

            {/*/!* Image Dialog *!/*/}
            {/*<Dialog*/}
            {/*    open={imageDialogOpen}*/}
            {/*    onClose={handleCloseImageDialog}*/}
            {/*    maxWidth="md"*/}
            {/*    fullWidth*/}
            {/*>*/}
            {/*    <DialogContent sx={{position: 'relative', p: 4}}>*/}
            {/*        <IconButton*/}
            {/*            aria-label="close"*/}
            {/*            onClick={handleCloseImageDialog}*/}
            {/*            sx={{*/}
            {/*                position: 'absolute',*/}
            {/*                right: 8,*/}
            {/*                top: 8,*/}
            {/*                color: (theme) => theme.palette.grey[500],*/}
            {/*            }}*/}
            {/*        >*/}
            {/*            <Close/>*/}
            {/*        </IconButton>*/}
            {/*        {currentImage && (*/}
            {/*            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>*/}
            {/*                <img*/}
            {/*                    src={currentImage}*/}
            {/*                    alt="Enlarged view"*/}
            {/*                    style={{maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain'}}*/}
            {/*                />*/}
            {/*            </Box>*/}
            {/*        )}*/}
            {/*    </DialogContent>*/}
            {/*</Dialog>*/}

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
