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
import Chip from "@mui/material/Chip";
const Add = () => {
    const [query, setQuery] = useSearchParams();
    const queryId = query.get("id");
    console.log(queryId, "queryId");
    const { logUserData, setLogUserData } = useProfileData();
    console.log(logUserData, "logUserData")
    const navigate = useNavigate();
    const auth_key = localStorage.getItem(localStorageKey.auth_key);
    const [loading, setLoading] = useState(false);
    const [formValues, setFormValues] = useState({
        title: "",
        image: "",
        sort_order: ""
    });
    const [errors, setErrors] = useState({
        title: "",
        image: "",
        sort_order: ""
    });
    const [imagePreview, setImagePreview] = useState(null);
    console.log(imagePreview, "imagePreview")
    const [fileName, setFileName] = useState("");
    console.log(fileName, "fileName")
    const [image, setImage] = useState(null);
    console.log(image, "image")
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [metaKeywords, setMetaKeywords] = useState([]);
    const [keywordInput, setKeywordInput] = useState("");
    const [altText, setAltText] = useState("");
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
            formData.append("image_alt", altText);
            const res = await ApiService.postImage(apiEndpoints.addGiftCardCategoryImage, formData, auth_key);
            if (res?.status === 200) {
                setRoute(ROUTE_CONSTANT.giftCard.category.list);
                handleOpen("success", msg);
            }
        } catch (error) {
            handleOpen("error", error);
        }
    };
    const parseKeyword = (term) => {
        if (Array.isArray(term)) {
            return term.map((t) => t.trim());
        }
        if (typeof term === "string") {
            return term
                .trim()
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);
        }
        return [];
    };
    const handleAddKeyword = () => {
        const trimmed = keywordInput.trim();
        if (trimmed && !metaKeywords.includes(trimmed)) {
            setMetaKeywords((prev) => [...prev, ...parseKeyword(trimmed)]);
        }
        setKeywordInput("");
    };
    const handleDeleteKeyword = (kwToDelete) => () => {
        setMetaKeywords((prev) => prev.filter((k) => k !== kwToDelete));
    };
    const handleAddGiftCardCategory = async () => {
        const newErrors = {};
        if (!formValues.title) newErrors.title = "Title is required";
        if (!queryId) {
            if (!image) newErrors.image = "Image is required";
        }
        if (!formValues.sort_order) newErrors.sort_order = "Sort order is required";
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            try {
                const payload = {
                    _id: queryId ? queryId : "0",
                    title: formValues.title,
                    sort_order: formValues.sort_order,
                    meta_title: metaTitle,
                    meta_description: metaDescription,
                    meta_keywords: metaKeywords,
                };
                setLoading(true);
                const res = await ApiService.post(apiEndpoints.addGiftCardCategory, payload, auth_key);
                if (res?.status === 200) {
                    console.log("res---", res);
                    if (image) {
                        if (queryId) {
                            handleUploadImage(queryId, res?.data);
                        } else {
                            handleUploadImage(res?.data?.category?._id, res?.data);
                        }
                    }
                    // if (!queryId) {
                    setRoute(ROUTE_CONSTANT.giftCard.category.list);
                    // }
                    handleOpen("success", res?.data);
                }
            } catch (error) {
                setLoading(false);
                console.log(error);
                handleOpen("error", error?.response?.data || error);
            } finally {
                setLoading(false);
            }
        }
    };
    const getGiftCardCategory = async () => {
        try {
            const res = await ApiService.get(`${apiEndpoints.getGiftCardCategoryById}/${queryId}`, auth_key);
            if (res?.status === 200) {
                console.log("res-----", res);
                const resData = res?.data?.category;
                setFormValues((prev) => ({
                    ...prev,
                    title: resData?.title,
                    image: resData?.image,
                    sort_order: resData?.sort_order,
                }));
                setMetaTitle(resData?.meta_title || "");
                setMetaDescription(resData?.meta_description || "");
                setMetaKeywords(Array.isArray(resData?.meta_keywords) ? resData.meta_keywords : []);
                setAltText(resData?.image_alt || "");
            }
        } catch (error) {
            handleOpen("error", error?.response?.data || error);
        }
    };
    useEffect(() => {
        if (queryId) {
            getGiftCardCategory();
        }
    }, [queryId]);
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
                            onClick={() => navigate(ROUTE_CONSTANT.giftCard.category.list)}
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
                            Sort Order
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
                                    type="text"
                                    error={errors.sort_order && true}
                                    helperText={errors.sort_order}
                                    onBlur={() => {
                                        if (!formValues.sort_order) {
                                            setErrors((prv) => ({ ...prv, sort_order: "Sort order is required" }));
                                        }
                                    }}
                                    name="sort_order"
                                    label="Sort Order"
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d*$/.test(value)) {
                                            handleChange(e);
                                        }
                                    }}
                                    value={formValues.sort_order}
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
                                    Image size must be 30 X 30
                                </p>
                                {(imagePreview || formValues.image) && (
                                    <img
                                        style={{ margin: "16px 0" }}
                                        src={imagePreview ? imagePreview : formValues.image}
                                        width={200}
                                        alt="Category"
                                    />
                                )}
                                {(imagePreview || formValues.image) && (
                                    <Box sx={{ mt: 1 }}>
                                        <TextField
                                            label="Image Alt Text"
                                            value={altText}
                                            onChange={(e) => setAltText(e.target.value)}
                                            sx={{ width: "100%", "& .MuiInputBase-root": { height: "40px" }, "& .MuiFormLabel-root": { top: "-7px" } }}
                                        />
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
                        {/* Meta Title */}
                        <Box sx={{ display: "flex", gap: "20px" }}>
                            <Box sx={{ fontSize: "14px", fontWeight: 700, width: "15%", display: "flex", textWrap: "wrap" }}>
                                Meta Title :
                            </Box>
                            <Box width={"100%"}>
                                <TextField
                                    label="Meta Title"
                                    value={metaTitle}
                                    onChange={(e) => setMetaTitle(e.target.value)}
                                    sx={{ width: "100%", "& .MuiInputBase-root": { height: "40px" }, "& .MuiFormLabel-root": { top: "-7px" } }}
                                />
                            </Box>
                        </Box>
                        {/* Meta Description */}
                        <Box sx={{ display: "flex", gap: "20px" }}>
                            <Box sx={{ fontSize: "14px", fontWeight: 700, width: "15%", display: "flex", textWrap: "wrap" }}>
                                Meta Description :
                            </Box>
                            <Box width={"100%"}>
                                <TextField
                                    label="Meta Description"
                                    value={metaDescription}
                                    onChange={(e) => setMetaDescription(e.target.value)}
                                    multiline
                                    rows={3}
                                    sx={{ width: "100%" }}
                                />
                            </Box>
                        </Box>
                        {/* Meta Keywords */}
                        <Box sx={{ display: "flex", gap: "20px" }}>
                            <Box sx={{ fontSize: "14px", fontWeight: 700, width: "15%", display: "flex", textWrap: "wrap" }}>
                                Meta Keywords :
                            </Box>
                            <Box width={"100%"}>
                                <Autocomplete
                                    multiple
                                    freeSolo
                                    options={[]}
                                    value={Array.isArray(metaKeywords) ? metaKeywords : []}
                                    inputValue={keywordInput}
                                    onChange={(event, newValue) => {
                                        const parsed = (newValue || []).reduce((acc, option) => acc.concat(parseKeyword(option)), []);
                                        setMetaKeywords(parsed);
                                    }}
                                    onInputChange={(e, newInputValue) => setKeywordInput(newInputValue)}
                                    onBlur={() => { if (keywordInput.trim()) handleAddKeyword(); }}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip variant="outlined" label={option} {...getTagProps({ index })} onDelete={handleDeleteKeyword(option)} size="small" />
                                        ))
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Meta Keyword"
                                            placeholder="Add Keywords"
                                            sx={{ width: "100%", "& .MuiInputBase-root": { padding: "0 11px" }, "& .MuiFormLabel-root": { top: "-7px" } }}
                                            onKeyDown={(e) => {
                                                if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleAddKeyword(); }
                                                if (e.key === ",") { e.preventDefault(); handleAddKeyword(); setKeywordInput(""); }
                                                if (e.key === "Backspace" && !keywordInput) {
                                                    setMetaKeywords((prev) => prev.slice(0, -1));
                                                }
                                            }}
                                        />
                                    )}
                                />
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
                            onClick={handleAddGiftCardCategory}>
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