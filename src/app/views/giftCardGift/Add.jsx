import {
    Box, Button, Divider, Paper, Stack, TextField, Autocomplete, MenuItem, IconButton,
    FormControl, InputAdornment, FormControlLabel, Radio, RadioGroup, FormLabel, CircularProgress,
} from "@mui/material";
import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import AppsIcon from "@mui/icons-material/Apps";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { useEffect } from "react";
import ConfirmModal from "app/components/ConfirmModal";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useProfileData } from "app/contexts/profileContext";
import ClearIcon from "@mui/icons-material/Clear";
import QuillDes from "app/components/ReactQuillTextEditor/ReactQuillTextEditor/QuilDes";
import TextEditor from "app/components/TextEditor/TextEditor";


const Add = () => {
    const [query, setQuery] = useSearchParams();
    const queryId = query.get("id");
    console.log(queryId, "queryId");
    const { logUserData, setLogUserData } = useProfileData();
    console.log(logUserData, "logUserData")
    const navigate = useNavigate();
    const auth_key = localStorage.getItem(localStorageKey.auth_key);
    const [formValues, setFormValues] = useState({
        catId: "",
        title: "",
        image: "",
        validity:"",
        description:""
    });
    const [errors, setErrors] = useState({
        catId: "",
        title: "",
        image: "",
        validity:"",
        description:""
    });
    const [loading, setLoading] = useState(false);
    const [allCategory, setAllCategory] = useState([]);
    console.log(allCategory, "allCategory");
    const [imagePreview, setImagePreview] = useState(null);
    console.log(imagePreview, "imagePreview")
    const [fileName, setFileName] = useState("");
    console.log(fileName, "fileName")
    const [image, setImage] = useState(null);
    console.log(image, "image")

    const [open, setOpen] = React.useState(false);
    const [type, setType] = useState("");
    const [route, setRoute] = useState(null);
    const [msg, setMsg] = useState(null);
    console.log({ formValues })

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImage(event.target.files[0]);
            setFileName(file.name);
        } else {
            setFileName("");
        }
    };
    const handleImageChange = (e, name) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const logOut = () => {
        localStorage.removeItem(localStorageKey.auth_key);
        localStorage.removeItem(localStorageKey.designation_id);
        localStorage.removeItem(localStorageKey.vendorId);
        setRoute(ROUTE_CONSTANT.login);
    };

    const handleOpen = (type, msg) => {
        setMsg(msg?.message);
        setOpen(true);
        setType(type);
        if (msg?.response?.status === 401) {
            logOut();
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
        setErrors((prv) => ({ ...prv, [name]: "" }));
    };

    const handleUploadImage = async (id, msg) => {
        try {
            const formData = new FormData();
            {
                image && formData.append("file", image);
            }
            formData.append("_id", id);
            const res = await ApiService.postImage(apiEndpoints.addGiftCardImage, formData, auth_key);
            if (res?.status === 200) {
                setRoute(ROUTE_CONSTANT.giftCard.gift.list);
                handleOpen("success", msg);
            }
        } catch (error) {
            handleOpen("error", error);
        }
    };
    const handleAddGiftCard = async () => {
        const newErrors = {};
        if (!formValues.catId) newErrors.catId = "Category is required";
        if (!formValues.title) newErrors.title = "Title is required";
        if (!queryId) {
            if (!image) newErrors.image = "Image is required";
        }
        if (!formValues.validity) newErrors.validity = "Validity is required";
        if (!formValues.description || formValues?.description === "<p><br></p>") newErrors.description = "Description is required";
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            try {
                const payload = {
                    _id: queryId ? queryId : "0",
                    category_id: formValues.catId,
                    title: formValues.title,
                    validity: formValues.validity,
                    description: formValues.description
                };
                setLoading(true);
                const res = await ApiService.post(apiEndpoints.addGiftCard, payload, auth_key);
                if (res?.status === 200) {
                    console.log("res---", res);
                    if (image) {
                        if (queryId) {
                            handleUploadImage(queryId, res?.data);
                        } else {
                            handleUploadImage(res?.data?.giftCard?._id, res?.data);
                        }
                    }
                    // if (!queryId) {
                        setRoute(ROUTE_CONSTANT.giftCard.gift.list);
                    // }
                    handleOpen("success", res?.data);
                }
            } catch (error) {
                setLoading(false);
                handleOpen("error", error?.response?.data || error);
            } finally {
                setLoading(false);
            }
        }
    };
    const getGiftCard = async () => {
        try {
            const res = await ApiService.get(`${apiEndpoints.getGiftCardById}/${queryId}`, auth_key);
            if (res?.status === 200) {
                console.log("res-----", res);
                const resData = res?.data?.giftCard;
                setFormValues((prev) => ({
                    ...prev,
                    catId: resData?.category_id,
                    title: resData?.title,
                    image: resData?.image,
                    validity: resData?.validity,
                    description: resData?.description
                }));
            }
        } catch (error) {
            handleOpen("error", error?.response?.data || error);
        }
    };

    useEffect(() => {
        if (queryId) {
            getGiftCard();
        }
    }, [queryId]);

    const getGiftCardCategory = async () => {
        try {
            const res = await ApiService.get(apiEndpoints.getActiveGiftCardCategory, auth_key);
            console.log({ res });
            if (res.status === 200) {
                setAllCategory(res?.data?.categories);
            }
        } catch (error) {
            handleOpen("error", error?.response?.data || error);
        }
    };

    useEffect(() => {
        getGiftCardCategory();
    }, [])

    return (
        <>
            <Box sx={{ margin: "30px" }}>
                <Box sx={{ py: "16px", marginBottom: "20px" }} component={Paper}>
                    <Stack sx={{ ml: "24px", mb: "12px" }} gap={1} direction={"row"}>
                        <Box>
                            <AppsIcon />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Go To</Typography>
                        </Box>
                    </Stack>
                    <Divider />
                    <Box sx={{ ml: "24px", mt: "16px" }}>
                        <Button
                            onClick={() => navigate(ROUTE_CONSTANT.giftCard.gift.list)}
                            startIcon={<AppsIcon />}
                            variant="contained"
                        >
                            Gift Card List
                        </Button>
                    </Box>
                </Box>
                <Box sx={{ p: "24px" }} component={Paper}>
                    <Box
                        sx={{
                            display: "flex",
                            marginBottom: "20px",
                            gap: "20px"
                        }}
                    >
                        <Box
                            sx={{
                                fontSize: "14px",
                                fontWeight: 700,
                                wordBreak: "normal",
                                width: "15%",
                                textOverflow: "ellipsis",
                                display: "flex",
                                textWrap: "wrap"
                            }}
                        >
                            Category
                            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
                                {" "}
                                *
                            </span>
                            :
                        </Box>
                        <Box width={"100%"}>
                            <Box
                                sx={{
                                    height: "auto", // Set your desired height
                                    width: "100%"
                                }}
                            >
                                <FormControl fullWidth>
                                    <TextField
                                        error={Boolean(errors.catId)}
                                        helperText={errors.catId}
                                        select
                                        sx={{
                                            "& .MuiInputBase-root": {
                                                height: "40px"
                                            },
                                            "& .MuiFormLabel-root": {
                                                top: "-7px"
                                            }
                                        }}
                                        label="Select Category"
                                        labelId="pib"
                                        id="pibb"
                                        value={formValues?.catId}
                                        name="catId"
                                        onChange={handleChange}
                                        InputProps={{
                                            endAdornment: formValues?.catId ? (
                                                <InputAdornment position="end" sx={{ mr: 3 }}>
                                                    <IconButton
                                                        onClick={() => {
                                                            handleChange({ target: { name: "catId", value: "" } });
                                                            setErrors((prv) => ({ ...prv, catId: "Category is required" }));
                                                        }}
                                                        edge="end"
                                                    >
                                                        <ClearIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            ) : null
                                        }}
                                    >
                                        {allCategory?.map((item) => (
                                            <MenuItem
                                                key={item._id}
                                                value={item._id}
                                                sx={{
                                                    display: item._id === formValues?.catId ? "none" : "block"
                                                }}
                                            >
                                                {item.title}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </FormControl>
                            </Box>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            marginBottom: "20px",
                            gap: "20px"
                        }}
                    >
                        <Box
                            sx={{
                                fontSize: "14px",
                                fontWeight: 700,
                                wordBreak: "normal",
                                width: "15%",
                                textOverflow: "ellipsis",
                                display: "flex",
                                textWrap: "wrap"
                            }}
                        >
                            Title
                            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
                                {" "}
                                *
                            </span>
                            :
                        </Box>
                        <Box width={"100%"}>
                            <Box
                                sx={{
                                    height: "auto", // Set your desired height
                                    width: "100%"
                                }}
                            >
                                <TextField
                                    error={errors.title && true}
                                    helperText={errors.title}
                                    onBlur={() => {
                                        if (!formValues.title) {
                                            setErrors((prv) => ({ ...prv, title: "Title is required" }));
                                        }
                                    }}
                                    name="title"
                                    label="Title"
                                    onChange={handleChange}
                                    value={formValues.title}
                                    rows={4}
                                    sx={{
                                        width: "100%",
                                        "& .MuiInputBase-root": {
                                            height: "40px"
                                        },
                                        "& .MuiFormLabel-root": {
                                            top: "-7px"
                                        }
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            marginBottom: "20px",
                            gap: "20px"
                        }}
                    >
                        <Box
                            sx={{
                                fontSize: "14px",
                                fontWeight: 700,
                                wordBreak: "normal",
                                width: "15%",
                                textOverflow: "ellipsis",
                                display: "flex",
                                textWrap: "wrap"
                            }}
                        >
                            Image
                            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
                                {" "}
                                *
                            </span>
                            :
                        </Box>
                        <Box width={"100%"}>
                            <Box
                                sx={{
                                    height: "auto", // Set your desired height
                                    width: "100%"
                                }}
                            >
                                <TextField
                                    fullWidth
                                    error={errors.image && true}
                                    helperText={errors.image}
                                    value={fileName}
                                    sx={{
                                        "& .MuiInputBase-root": {
                                            height: "40px"
                                        }
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
                                                style={{ display: "none" }}
                                                id="file-input"
                                                onChange={(event) => {
                                                    handleImageSelect(event);
                                                    handleImageChange(event);
                                                }}
                                            />
                                        ),
                                        readOnly: true
                                    }}
                                    placeholder="Select file"
                                    onClick={() => document.getElementById("file-input").click()}
                                />
                                <p style={{ color: '#e94560', fontSize: '12px' }}>
                                    Image size must be 290 X 160
                                </p>
                                {(imagePreview || formValues.image) && (
                                    <img
                                        style={{ margin: "16px 0" }}
                                        src={imagePreview ? imagePreview : formValues.image}
                                        width={200}
                                        alt="giftcard"
                                    />
                                )}
                            </Box>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                        display: "flex",
                        marginBottom: "20px",
                        gap: "20px"
                        }}
                    >
                        <Box
                        sx={{
                            fontSize: "14px",
                            fontWeight: 700,
                            wordBreak: "normal",
                            width: "15%",
                            textOverflow: "ellipsis",
                            display: "flex",
                            textWrap: "wrap"
                        }}
                        >
                        Validity
                        <span
                            style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}
                        >
                            {" "}
                            *
                        </span>
                        :
                        </Box>
                        <Box width={"100%"}>
                        <Box
                            sx={{
                            height: "auto",
                            width: "100%"
                            }}
                        >
                            <FormControl fullWidth>
                            <TextField
                                error={Boolean(errors.validity)}
                                helperText={errors.validity}
                                select
                                sx={{
                                "& .MuiInputBase-root": {
                                    height: "40px"
                                },
                                "& .MuiFormLabel-root": {
                                    top: "-7px"
                                }
                                }}
                                label="Select Validity"
                                labelId="pib"
                                id="pibb"
                                value={formValues?.validity}
                                name="validity"
                                onChange={handleChange}
                                InputProps={{
                                endAdornment: formValues?.validity ? (
                                    <InputAdornment position="end" sx={{ mr: 3 }}>
                                    <IconButton
                                        onClick={() => {
                                        handleChange({ target: { name: "validity", value: "" } });
                                        setErrors((prv) => ({
                                            ...prv,
                                            validity: "validity is required"
                                        }));
                                        }}
                                        edge="end"
                                    >
                                        <ClearIcon />
                                    </IconButton>
                                    </InputAdornment>
                                ) : null
                                }}
                            >
                                {[...Array(100)].map((_, index) => (
                                <MenuItem key={index + 1} value={index + 1}>
                                    {index + 1}
                                </MenuItem>
                                ))}
                            </TextField>
                            </FormControl>
                        </Box>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            marginBottom: "20px",
                            gap: "20px"
                        }}
                    >
                        <Box
                            sx={{
                                fontSize: "14px",
                                fontWeight: 700,
                                wordBreak: "normal",
                                width: "15%",
                                textOverflow: "ellipsis",
                                display: "flex",
                                textWrap: "wrap"
                            }}
                        >
                            Description
                            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
                                {" "}
                                *
                            </span>
                            :
                        </Box>
                        <Box width={"100%"}>
                            <Box
                                sx={{
                                    width: "100%"
                                }}
                            >
                                <Box
                                    sx={{
                                        height: "auto", 
                                        width: "100%"
                                    }}
                                >
                                    <QuillDes formValues={formValues} setFormValues={setFormValues} setErrors={setErrors} />
                                </Box>
                                {/* <TextEditor name="description" value={formValues?.description} setFormValues={setFormValues}/> */}
                                {errors.description && (
                                <Typography
                                    sx={{
                                    fontSize: "12px",
                                    color: "#FF3D57",
                                    marginLeft: "14px",
                                    marginRight: "14px",
                                    marginTop: "3px"
                                    }}
                                >
                                    {errors.description}
                                </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "end",
                            marginTop: "15px",
                            gap: "5px"
                        }}
                    >
                        <Button endIcon={loading ? <CircularProgress size={15} /> : ""}
                            disabled={loading ? true : false}
                            variant="contained"
                            onClick={handleAddGiftCard}>
                            Submit
                        </Button>
                    </Box>
                </Box>
            </Box>
            <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
        </>
    );
};

export default Add;
