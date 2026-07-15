"use client";
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    Link,
    List,
    ListItem,
    TextareaAutosize,
    TextField,
    Tooltip,
    Typography,
    IconButton,
    Paper,
    Avatar,
    Card,
    Stack,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { styled } from '@mui/material/styles';
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import {
    addDoc,
    collection,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
} from "firebase/firestore";
import { db, storage } from "../../../../src/firebase/Firebase";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { uploadChatFiles } from "app/utils/uploadChatFiles";
import { localStorageKey } from "app/constant/localStorageKey";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Video from "yet-another-react-lightbox/plugins/video";

// Styled Components
const MessageContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    flex: 1,
    height: "100%",
    overflow: "hidden",
    backgroundColor: "#fafafa",
    minHeight: 0,
}));

const MessagesWrapper = styled(Box)(({ theme }) => ({
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    padding: theme.spacing(2),
    minHeight: 0,
    maxHeight: "100%",
    [theme.breakpoints.down("sm")]: {
        padding: theme.spacing(1),
    },
    "&::-webkit-scrollbar": {
        width: "6px",
    },
    "&::-webkit-scrollbar-track": {
        background: "#f1f1f1",
        borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb": {
        background: "#c1c1c1",
        borderRadius: "10px",
        "&:hover": {
            background: "#a8a8a8",
        },
    },
}));

const MessageBubble = styled(Paper)(({ theme, isOwn, images, video }) => ({
    padding: theme.spacing(1.5),
    maxWidth: video ? '70%' : images > 1 ? "60%" : images === 1 ? "30%" : "80%",
    minHeight: video ? '70%' : undefined,
    minWidth: "60px",
    borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
    backgroundColor: isOwn ? '#fff' : "#ddd",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    wordWrap: "break-word",
    whiteSpace: "pre-wrap",
    transition: "all 0.2s ease",
    [theme.breakpoints.down("sm")]: {
        maxWidth: "90%",
        padding: theme.spacing(1),
    },
}));

const InputContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: "#ffffff",
    borderTop: "1px solid #e8eaed",
    boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
    flexShrink: 0,
    [theme.breakpoints.down("sm")]: {
        padding: theme.spacing(1.5),
    },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    "& .MuiOutlinedInput-root": {
        borderRadius: "24px",
        backgroundColor: "#f8f9fa",
        "& fieldset": {
            borderColor: "transparent",
        },
        "&:hover fieldset": {
            borderColor: theme.palette.primary.main,
        },
        "&.Mui-focused fieldset": {
            borderColor: theme.palette.primary.main,
        },
        "& textarea": {
            padding: "12px 16px",
            fontSize: "14px",
            lineHeight: "1.5",
        },
    },
}));

const ImagePreviewContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(1),
    flexWrap: "wrap",
    marginBottom: theme.spacing(1),
}));

const ImagePreview = styled(Box)(({ theme }) => ({
    position: "relative",
    width: "60px",
    height: "60px",
    borderRadius: "8px",
    overflow: "hidden",
    border: "2px solid #e8eaed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
}));

const RemoveImageButton = styled(IconButton)(({ theme }) => ({
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "rgba(0,0,0,0.6)",
    color: "#fff",
    padding: "2px",
    width: "20px",
    height: "20px",
    zIndex: 10,
    "&:hover": {
        backgroundColor: "rgba(0,0,0,0.8)",
    },
    "& .MuiSvgIcon-root": {
        fontSize: "14px",
    },
}));

const DateDivider = styled(Typography)(({ theme }) => ({
    textAlign: "center",
    color: theme.palette.text.secondary,
    fontSize: "12px",
    padding: theme.spacing(1, 0),
    flex: 1,
    display: 'flex',
    justifyContent: 'center'
}));

const TimeStamp = styled(Typography)(({ theme }) => ({
    fontSize: "10px",
    color: theme.palette.text.secondary,
    marginTop: "4px",
}));

const MessagePopup = ({
    handleClosePopup,
    openPopup,
    vendorID,
    orderId,
    userName,
    vendorName,
    shopName,
    userId,
    product_image,
    productData,
    userImage
}) => {
    const theme = useTheme();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [imagePreviews, setImagePreviews] = useState([]);
    const [files, setFiles] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const senderId = vendorID;
    const receiverId = userId;
    const token = localStorage.getItem(localStorageKey.auth_key);
    const chatProductId = productData?.product_id || productData?.productId || null;
    const chatOrderId = productData?.orderId || orderId || null;

    const [lightboxState, setLightboxState] = useState({
        open: false,
        index: 0,
        slides: [],
    });

    const handleMediaClick = (mediaItems, index) => {
        const slides = mediaItems.map(item => {
            if (item.type === 'video') {
                return {
                    type: 'video',
                    sources: [{ src: item.url, type: 'video/mp4' }],
                };
            }
            return {
                src: item.url,
            };
        });

        setLightboxState({
            open: true,
            index: index,
            slides: slides,
        });
    };

    const handleLightboxClose = () => {
        setLightboxState({ ...lightboxState, open: false });
    };

    const getMediaItems = (msg) => {
        const items = [];
        if (msg?.imageUrls?.length > 0) {
            msg.imageUrls.forEach(url => {
                items.push({ type: 'image', url });
            });
        }
        if (msg?.attachments?.length > 0) {
            msg.attachments.forEach(attachment => {
                if (attachment.type === 'image' || attachment.type === 'video') {
                    items.push({ type: attachment.type, url: attachment.url });
                }
            });
        }
        return items;
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const detectLink = (text) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.split(urlRegex).map((part, index) =>
            urlRegex.test(part) ? (
                <a key={index} href={part} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline", fontWeight: 500 }}>
                    {part}
                </a>
            ) : (
                part
            )
        );
    };

    const removeHTMLTags = (str = "") => {
        return str.replace(/<\/?[^>]+(>|$)/g, "");
    };

    const buildDefaultMessage = () => {
        const productTitle = removeHTMLTags(productData?.product_name || "").trim();
        const comment = (productData?.additional_comment || "").trim();

        return `Hi ${userName || "there"}, we noticed your review${productTitle ? ` for "${productTitle.slice(0, 15)}"` : ""}. You gave our product a rating of ${productData?.rating || 0}/5
${comment ? ` You mentioned: "${comment}".` : ""}
We would love to help and make this right for you. Please let us know how we can assist further.`;
    };

    const roomProductData = {
        product_title: productData?.product_name || "",
        productTitle: productData?.product_name || "",
        imageUrl: product_image || "",
        product_image: product_image || "",
        price: productData?.productSku || productData?.productCode
            ? `${productData?.productSku ? `SKU: ${productData.productSku}` : ""}${productData?.productSku && productData?.productCode ? " | " : ""}${productData?.productCode ? `Code: ${productData.productCode}` : ""}`
            : "",
    };

    useEffect(() => {
        setMessages([]);
        const q = query(collection(db, "chatRooms"), orderBy("createdAt", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages = snapshot?.docs?.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            const matchingDocument = newMessages?.filter((doc) => {
                return (
                    doc?.receiverId === senderId &&
                    doc?.user === receiverId &&
                    doc?.productId == chatProductId &&
                    doc?.orderId == chatOrderId
                );
            });
            const chatExists = matchingDocument.length > 0;

            if (chatExists) {
                setInput("");
            }

            if (matchingDocument[0]?.permanentDeleteUser1 === senderId) {
                setMessages([]);
                return;
            }
            matchingDocument.forEach((data) => {
                const filterArr = data?.text?.filter((msg) => {
                    return msg.permanentDeleteUser !== senderId;
                });
                setMessages(filterArr);
            });
        });

        return () => unsubscribe();
    }, [senderId, receiverId, chatProductId, chatOrderId]);

    useEffect(() => {
        if (!openPopup) {
            setInput("");
            setImagePreviews([]);
            setFiles([]);
            return;
        }

        if (messages.length === 0) {
            setInput(buildDefaultMessage());
        } else {
            setInput("");
        }
    }, [openPopup, messages.length]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setUploadError(null);

        const validFiles = selectedFiles.filter(file => {
            const isValidType = file.type.startsWith('image/') ||
                file.type.startsWith('video/') ||
                file.type === 'application/pdf';
            const isValidSize = file.size <= 25 * 1024 * 1024;

            if (!isValidType) {
                setUploadError(`Invalid file type: ${file.type}`);
                return false;
            }
            if (!isValidSize) {
                setUploadError(`File too large: ${file.name}`);
                return false;
            }
            return true;
        });

        const hasImages = validFiles.some(f => f.type.startsWith('image/'));
        const hasNonImages = validFiles.some(f => !f.type.startsWith('image/'));

        if (hasImages && hasNonImages) {
            setUploadError("Cannot send images and other file types together. Please send separately.");
            e.target.value = "";
            return;
        }

        const existingNonImages = files.filter(f => !f.type.startsWith('image/'));
        const newNonImages = validFiles.filter(f => !f.type.startsWith('image/'));

        if (existingNonImages.length > 0 && newNonImages.length > 0) {
            setUploadError("Only one video or PDF allowed");
            e.target.value = "";
            return;
        }

        const existingImages = files.filter(f => f.type.startsWith('image/'));
        const newImages = validFiles.filter(f => f.type.startsWith('image/'));

        if (existingImages.length + newImages.length > 10) {
            setUploadError("Maximum 10 images allowed");
            e.target.value = "";
            return;
        }

        const updatedFiles = [...files, ...validFiles];
        const previews = updatedFiles.map((file) => URL.createObjectURL(file));

        setFiles(updatedFiles);
        setImagePreviews(previews);
        e.target.value = "";
    };

    useEffect(() => {
        return () => {
            imagePreviews.forEach(preview => {
                URL.revokeObjectURL(preview);
            });
        };
    }, []);

    const handleRemoveImage = (index) => {
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleClearPreview = () => {
        setImagePreviews([]);
        setFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const sendMessage = async () => {
        if ((!input.trim() && files.length === 0) || isSending) return;
        setIsSending(true);
        let uploadedFiles = [];

        try {
            const querySnapshot = await getDocs(collection(db, "chatRooms"));
            const documents = querySnapshot.docs.map((doc) => {
                const docId = doc.id;
                const docData = doc.data();
                return {
                    id: docId,
                    data: docData,
                };
            });

            const matchingDocument = documents?.find((doc) => {
                return (
                    doc.data.receiverId === senderId &&
                    doc.data.user === receiverId &&
                    doc.data.productId == chatProductId &&
                    doc.data.orderId == chatOrderId
                );
            });

            if (files.length > 0) {
                try {
                    const uploadResult = await uploadChatFiles({
                        files: files,
                        token: token,
                        addToast: (msg) => console.log(msg),
                    });
                    uploadedFiles = uploadResult;
                    handleClearPreview();
                } catch (uploadError) {
                    console.error("File upload failed:", uploadError);
                    setIsSending(false);
                    return;
                }
            }

            if (matchingDocument) {
                const existingText = matchingDocument.data.text || [];
                const lastText = existingText.length > 0 ? existingText[existingText.length - 1] : null;
                const updatedText = [
                    ...existingText,
                    {
                        senderType: "vendor",
                        text: input.trim(),
                        createdAt: {
                            seconds: Math.floor(Date.now() / 1000),
                        },
                        messageSenderId: senderId,
                        isNotification: false,
                        attachments: uploadedFiles,
                        productId: lastText?.productId || chatProductId,
                    },
                ];
                await updateDoc(doc(db, "chatRooms", matchingDocument.id), {
                    text: updatedText,
                    currentTime: new Date(),
                });
            } else {
                const initialMessages = [
                    {
                        senderType: "vendor",
                        text: "",
                        createdAt: {
                            seconds: Math.floor(Date.now() / 1000),
                        },
                        messageSenderId: senderId,
                        isNotification: true,
                        imageUrls: [],
                        productId: chatProductId,
                        productData: {
                            productTitle: productData?.product_name || "",
                            price: productData?.rating ? `Rating: ${productData.rating}/5` : "",
                            imageUrl: product_image || "",
                        },
                    },
                    {
                        senderType: "vendor",
                        text: input.trim(),
                        createdAt: {
                            seconds: Math.floor(Date.now() / 1000),
                        },
                        messageSenderId: senderId,
                        isNotification: false,
                        attachments: uploadedFiles,
                        productId: chatProductId,
                    },
                ];
                await addDoc(collection(db, "chatRooms"), {
                    text: initialMessages,
                    createdAt: new Date(),
                    user: receiverId,
                    receiverId: senderId,
                    isDeleted: false,
                    currentTime: new Date(),
                    userName: userName,
                    vendorName: vendorName || "",
                    shopName: shopName || "",
                    productId: chatProductId,
                    productData: roomProductData,
                    orderId: chatOrderId,
                });
            }
            setInput("");
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp?.seconds * 1000);
        return date?.toLocaleDateString();
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp?.seconds * 1000);
        return date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const groupMessagesByDate = () => {
        const groups = {};
        messages.forEach((msg) => {
            const date = formatDate(msg?.createdAt);
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(msg);
        });
        return groups;
    };

    const messageGroups = groupMessagesByDate();

    return (
        <Dialog
            open={openPopup}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth="sm"
            fullWidth
            sx={{
                "& .MuiDialog-paper": {
                    height: "600px",
                    maxHeight: "80vh",
                    maxWidth: "500px",
                    margin: "auto",
                    borderRadius: "12px",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                },
                "& .MuiDialogContent-root": {
                    padding: 0,
                    overflow: "hidden",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                },
            }}
            PaperProps={{
                sx: {
                    minWidth: { md: '50vw' },
                    minHeight: { md: '90vh', lg: '90vh' }
                }
            }}
        >
            <DialogContent sx={{ padding: "0", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", flex: 1 }}>
                <Lightbox
                    open={lightboxState.open}
                    close={handleLightboxClose}
                    slides={lightboxState.slides}
                    plugins={[Video]}
                    index={lightboxState.index}
                    styles={{
                        container: { backgroundColor: "rgba(0, 0, 0, 0.9)" },
                    }}
                    controller={{
                        closeOnBackdropClick: true,
                    }}
                    carousel={{
                        finite: true,
                        preload: 1,
                    }}
                    video={{
                        autoPlay: false,
                        controls: true,
                    }}
                />

                <MessageContainer>
                    {/* Header */}
                    <Box
                        sx={{
                            position: "relative",
                            width: "100%",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            background: "#fff",
                            p: 2,
                            flexShrink: 0,
                            zIndex: 1,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar
                                src={userImage || "https://i.etsystatic.com/isla/24ec0e/34844512/isla_75x75.34844512_ke6bg9xj.jpg?version=0"}
                                sx={{ width: 40, height: 40 }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="h6" fontWeight={500} fontSize={16}>
                                    {userName || "User"}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Typically responds within 24 hours
                                </Typography>
                            </Box>
                            <IconButton onClick={handleClosePopup} size="small" disabled={isSending}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Messages Area */}
                    <MessagesWrapper bgcolor={'#efefef'}>
                        <List sx={{ p: 0 }}>
                            {Object.keys(messageGroups).map((date) => (
                                <React.Fragment key={date}>
                                    <DateDivider variant="caption">
                                        {date === formatDate(new Date()) ? "Today" : date}
                                    </DateDivider>
                                    {messageGroups[date].map((msg, index) => {
                                        const isOwn = msg.messageSenderId === senderId;

                                        return (
                                            <ListItem
                                                key={`${date}-${index}`}
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: isOwn ? "flex-end" : "flex-start",
                                                    padding: "4px 0",
                                                    border: "none",
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "flex-end",
                                                        maxWidth: "100%",
                                                        gap: 1,
                                                    }}
                                                >
                                                    {!isOwn && (
                                                        <Avatar
                                                            src={userImage || "https://i.etsystatic.com/site-assets/images/avatars/default_avatar.png?width=75"}
                                                            sx={{ width: 32, height: 32, flexShrink: 0 }}
                                                        />
                                                    )}

                                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: isOwn ? "flex-end" : "flex-start", maxWidth: "100%" }}>
                                                        {(msg.text || msg?.imageUrls?.length > 0 || msg?.attachments?.length > 0) && (
                                                            <MessageBubble elevation={0} isOwn={isOwn} images={msg?.attachments?.length} video={msg?.attachments?.length > 0 && msg?.attachments[0]?.type === "video"}>
                                                                {/* Images from old format */}
                                                                {msg?.imageUrls?.length > 0 && (
                                                                    <Box
                                                                        sx={{
                                                                            display: "grid",
                                                                            gridTemplateColumns: msg.imageUrls.length === 1 ? '1fr' : 'repeat(2, 1fr)',
                                                                            gap: 0.5,
                                                                            maxWidth: "100%",
                                                                            mb: msg.text ? 1 : 0,
                                                                        }}
                                                                    >
                                                                        {msg.imageUrls.slice(0, 4).map((imageUrl, imgIndex) => {
                                                                            const isLast = imgIndex === 3 && msg.imageUrls.length > 4;
                                                                            const remainingCount = msg.imageUrls.length - 4;

                                                                            return (
                                                                                <Box
                                                                                    key={imgIndex}
                                                                                    sx={{
                                                                                        position: 'relative',
                                                                                        aspectRatio: '1',
                                                                                        borderRadius: msg.imageUrls.length === 1 ? '8px' : '4px',
                                                                                        overflow: 'hidden',
                                                                                        cursor: 'pointer',
                                                                                        gridColumn: msg.imageUrls.length === 1 ? '1 / -1' : 'auto',
                                                                                        ...(msg.imageUrls.length === 3 && imgIndex === 0 && {
                                                                                            gridRow: '1 / 3',
                                                                                        }),
                                                                                    }}
                                                                                    onClick={() => {
                                                                                        const mediaItems = getMediaItems(msg);
                                                                                        const imageIndex = mediaItems.findIndex(item => item.url === imageUrl);
                                                                                        handleMediaClick(mediaItems, imageIndex);
                                                                                    }}
                                                                                >
                                                                                    <img
                                                                                        src={imageUrl}
                                                                                        alt={`message-image-${imgIndex}`}
                                                                                        style={{
                                                                                            width: "100%",
                                                                                            height: "100%",
                                                                                            objectFit: "cover",
                                                                                        }}
                                                                                    />
                                                                                    {isLast && (
                                                                                        <Box
                                                                                            sx={{
                                                                                                position: 'absolute',
                                                                                                top: 0,
                                                                                                left: 0,
                                                                                                right: 0,
                                                                                                bottom: 0,
                                                                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                                                                display: 'flex',
                                                                                                alignItems: 'center',
                                                                                                justifyContent: 'center',
                                                                                                color: '#fff',
                                                                                                fontSize: '24px',
                                                                                                fontWeight: 'bold',
                                                                                                cursor: 'pointer',
                                                                                            }}
                                                                                            onClick={() => {
                                                                                                const mediaItems = getMediaItems(msg);
                                                                                                const imageIndex = mediaItems.findIndex(item => item.url === imageUrl);
                                                                                                handleMediaClick(mediaItems, imageIndex);
                                                                                            }}
                                                                                        >
                                                                                            +{remainingCount}
                                                                                        </Box>
                                                                                    )}
                                                                                </Box>
                                                                            );
                                                                        })}
                                                                    </Box>
                                                                )}

                                                                {/* New Attachments - Images */}
                                                                {msg?.attachments?.filter(a => a.type === 'image').length > 0 && (
                                                                    <Box
                                                                        sx={{
                                                                            display: "grid",
                                                                            gridTemplateColumns: msg.attachments.filter(a => a.type === 'image').length === 1 ? '1fr' : 'repeat(2, 1fr)',
                                                                            gap: 0.5,
                                                                            maxWidth: "100%",
                                                                            mb: msg.text ? 1 : 0,
                                                                        }}
                                                                    >
                                                                        {msg.attachments.filter(a => a.type === 'image').slice(0, 4).map((attachment, index) => {
                                                                            const imageAttachments = msg.attachments.filter(a => a.type === 'image');
                                                                            const imageIndex = imageAttachments.indexOf(attachment);
                                                                            const isLast = imageIndex === 3 && imageAttachments.length > 4;
                                                                            const remainingCount = imageAttachments.length - 4;

                                                                            return (
                                                                                <Box
                                                                                    key={index}
                                                                                    sx={{
                                                                                        position: 'relative',
                                                                                        aspectRatio: '1',
                                                                                        borderRadius: imageAttachments.length === 1 ? '8px' : '4px',
                                                                                        overflow: 'hidden',
                                                                                        cursor: 'pointer',
                                                                                        gridColumn: imageAttachments.length === 1 ? '1 / -1' : 'auto',
                                                                                        ...(imageAttachments.length === 3 && imageIndex === 0 && {
                                                                                            gridRow: '1 / 3',
                                                                                        }),
                                                                                    }}
                                                                                    onClick={() => {
                                                                                        const mediaItems = getMediaItems(msg);
                                                                                        const imageIndex = mediaItems.findIndex(item => item.url === attachment.url);
                                                                                        handleMediaClick(mediaItems, imageIndex);
                                                                                    }}
                                                                                >
                                                                                    <img
                                                                                        src={attachment.url}
                                                                                        alt={`attachment-${index}`}
                                                                                        style={{
                                                                                            width: "100%",
                                                                                            height: "100%",
                                                                                            objectFit: "cover",
                                                                                        }}
                                                                                    />
                                                                                    {isLast && (
                                                                                        <Box
                                                                                            sx={{
                                                                                                position: 'absolute',
                                                                                                top: 0,
                                                                                                left: 0,
                                                                                                right: 0,
                                                                                                bottom: 0,
                                                                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                                                                display: 'flex',
                                                                                                alignItems: 'center',
                                                                                                justifyContent: 'center',
                                                                                                color: '#fff',
                                                                                                fontSize: '24px',
                                                                                                fontWeight: 'bold',
                                                                                                cursor: 'pointer',
                                                                                            }}
                                                                                            onClick={() => {
                                                                                                const mediaItems = getMediaItems(msg);
                                                                                                const imageIndex = mediaItems.findIndex(item => item.url === attachment.url);
                                                                                                handleMediaClick(mediaItems, imageIndex);
                                                                                            }}
                                                                                        >
                                                                                            +{remainingCount}
                                                                                        </Box>
                                                                                    )}
                                                                                </Box>
                                                                            );
                                                                        })}
                                                                    </Box>
                                                                )}

                                                                {/* Videos */}
                                                                {msg?.attachments?.filter(a => a.type === 'video').map((attachment, index) => (
                                                                    <Box
                                                                        key={`video-${index}`}
                                                                        sx={{
                                                                            maxWidth: "300px",
                                                                            maxHeight: "300px",
                                                                            borderRadius: "8px",
                                                                            overflow: "hidden",
                                                                            cursor: 'pointer',
                                                                            mb: 0.5,
                                                                        }}
                                                                        onClick={() => {
                                                                            const mediaItems = getMediaItems(msg);
                                                                            const videoIndex = mediaItems.findIndex(item => item.url === attachment.url);
                                                                            handleMediaClick(mediaItems, videoIndex);
                                                                        }}
                                                                    >
                                                                        <video
                                                                            controls
                                                                            style={{
                                                                                width: "100%",
                                                                                height: "100%",
                                                                            }}
                                                                        >
                                                                            <source src={attachment.url} />
                                                                            Your browser does not support the video tag.
                                                                        </video>
                                                                    </Box>
                                                                ))}

                                                                {/* PDFs */}
                                                                {msg?.attachments?.filter(a => a.type === 'pdf').map((attachment, index) => (
                                                                    <Box
                                                                        key={`pdf-${index}`}
                                                                        sx={{
                                                                            maxWidth: "280px",
                                                                            borderRadius: "8px",
                                                                            overflow: "hidden",
                                                                            border: "1px solid #e8eaed",
                                                                            p: 1,
                                                                            backgroundColor: isOwn ? "rgba(255,255,255,0.1)" : "#fff",
                                                                            mb: 0.5,
                                                                        }}
                                                                    >
                                                                        <a
                                                                            href={attachment.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            style={{
                                                                                textDecoration: "none",
                                                                                color: "inherit",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                gap: "8px",
                                                                            }}
                                                                        >
                                                                            <span>📄</span>
                                                                            <Typography sx={{
                                                                                fontSize: "13px",
                                                                                wordBreak: "break-all",
                                                                                color: isOwn ? "#fff" : "inherit",
                                                                            }}>
                                                                                {attachment.fileName || "PDF Document"}
                                                                            </Typography>
                                                                        </a>
                                                                    </Box>
                                                                ))}

                                                                {/* Text Message */}
                                                                {msg.text && (
                                                                    <Typography
                                                                        sx={{
                                                                            fontSize: "15px",
                                                                            wordWrap: "break-word",
                                                                            whiteSpace: "pre-wrap",
                                                                            width: 'fit-content',
                                                                            maxWidth: "100%",
                                                                            textAlign: "initial",
                                                                        }}
                                                                    >
                                                                        {detectLink(msg.text || "")}
                                                                    </Typography>
                                                                )}
                                                            </MessageBubble>
                                                        )}

                                                        {/* Product Card */}
                                                        {Object.keys(msg?.productData || {}).length > 0 && (
                                                            <Card
                                                                elevation={1}
                                                                sx={{
                                                                    p: 1.5,
                                                                    borderRadius: "12px",
                                                                    border: "1px solid #e8eaed",
                                                                    backgroundColor: "#fff",
                                                                    maxWidth: "280px",
                                                                    mt: 0.5,
                                                                }}
                                                            >
                                                                <Stack direction="row" spacing={1.5}>
                                                                    <img
                                                                        src={msg?.productData?.imageUrl}
                                                                        alt="Product"
                                                                        style={{
                                                                            width: 100,
                                                                            height: 100,
                                                                            borderRadius: "8px",
                                                                            objectFit: "cover",
                                                                        }}
                                                                    />
                                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                        <Typography
                                                                            sx={{
                                                                                fontSize: "13px",
                                                                                fontWeight: 600,
                                                                                display: "-webkit-box",
                                                                                WebkitLineClamp: 2,
                                                                                WebkitBoxOrient: "vertical",
                                                                                overflow: "hidden",
                                                                            }}
                                                                        >
                                                                            {removeHTMLTags(msg?.productData?.productTitle || "")}
                                                                        </Typography>
                                                                        <Typography sx={{ fontSize: "14px", color: theme.palette.primary.main, fontWeight: 600 }}>
                                                                            {msg?.productData?.price}
                                                                        </Typography>
                                                                        <Button
                                                                            variant="contained"
                                                                            size="small"
                                                                            sx={{
                                                                                mt: 0.5,
                                                                                backgroundColor: 'black',
                                                                                color: 'white',
                                                                                textTransform: "none",
                                                                                fontSize: "11px",
                                                                                "&:hover": {
                                                                                    backgroundColor: theme.palette.primary.dark,
                                                                                },
                                                                            }}
                                                                            onClick={() => {
                                                                                window.open(msg.productLink, "_blank");
                                                                            }}
                                                                        >
                                                                            Buy It Now
                                                                        </Button>
                                                                    </Box>
                                                                </Stack>
                                                            </Card>
                                                        )}

                                                        <TimeStamp variant="caption">
                                                            {formatTime(msg?.createdAt)}
                                                        </TimeStamp>
                                                    </Box>

                                                    {isOwn && (
                                                        <Avatar
                                                            src="https://i.etsystatic.com/icm/0ff82a/701770387/icm_150x150.701770387_gvl90sgooigcowk8wcw0.png?version=0"
                                                            sx={{ width: 32, height: 32, flexShrink: 0 }}
                                                        />
                                                    )}
                                                </Box>
                                            </ListItem>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                            <div ref={messagesEndRef} />
                        </List>
                    </MessagesWrapper>

                    {/* Input Area */}
                    <InputContainer elevation={0}>
                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                            <ImagePreviewContainer>
                                {uploadError && (
                                    <Typography
                                        sx={{
                                            color: 'error.main',
                                            fontSize: '12px',
                                            width: '100%',
                                            mb: 1,
                                        }}
                                    >
                                        {uploadError}
                                    </Typography>
                                )}

                                {files.length > 0 && (
                                    <Typography
                                        sx={{
                                            color: 'text.secondary',
                                            fontSize: '11px',
                                            width: '100%',
                                            mb: 1,
                                        }}
                                    >
                                        {files.some(f => f.type.startsWith('video/')) && 'Max video size: 25MB'}
                                        {files.some(f => f.type === 'application/pdf') && 'Max PDF size: 25MB'}
                                        {files.some(f => f.type.startsWith('image/')) && `Max 10 images`}
                                    </Typography>
                                )}

                                {imagePreviews.map((preview, index) => {
                                    const file = files[index];
                                    const isVideo = file?.type?.startsWith('video/');
                                    const isPdf = file?.type === 'application/pdf';
                                    const isImage = file?.type?.startsWith('image/');

                                    return (
                                        <ImagePreview key={index} sx={{ position: 'relative' }}>
                                            {isVideo ? (
                                                <span style={{ fontSize: "24px" }}>🎬</span>
                                            ) : isPdf ? (
                                                <span style={{ fontSize: "24px" }}>📄</span>
                                            ) : isImage ? (
                                                <img
                                                    src={preview}
                                                    alt={`preview-${index}`}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            ) : null}
                                            <RemoveImageButton
                                                size="small"
                                                onClick={() => handleRemoveImage(index)}
                                                sx={{ zIndex: 10 }}
                                            >
                                                <CloseIcon />
                                            </RemoveImageButton>
                                        </ImagePreview>
                                    );
                                })}
                            </ImagePreviewContainer>
                        )}

                        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
                            <StyledTextField
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                multiline
                                minRows={1}
                                maxRows={4}
                                variant="outlined"
                                fullWidth
                                onKeyPress={handleKeyPress}
                                disabled={isSending}
                            />

                            <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                                <Tooltip title="Attach Image or Video or PDF" arrow>
                                    <IconButton
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isSending}
                                        sx={{
                                            backgroundColor: "transparent",
                                            color: theme.palette.text.secondary,
                                            "&:hover": {
                                                backgroundColor: "rgba(0,0,0,0.04)",
                                            },
                                        }}
                                    >
                                        <AttachFileIcon />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Send" arrow>
                                    <IconButton
                                        onClick={sendMessage}
                                        disabled={(!input.trim() && files.length === 0) || isSending}
                                        sx={{
                                            backgroundColor: (!input.trim() && files.length === 0) || isSending
                                                ? "rgba(0,0,0,0.12)"
                                                : theme.palette.primary.main,
                                            color: (!input.trim() && files.length === 0) || isSending
                                                ? "rgba(0,0,0,0.26)"
                                                : "#fff",
                                            "&:hover": {
                                                backgroundColor: (!input.trim() && files.length === 0) || isSending
                                                    ? "rgba(0,0,0,0.12)"
                                                    : theme.palette.primary.dark,
                                            },
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        <SendIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>

                        <input
                            type="file"
                            style={{ display: "none" }}
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*,video/*,.pdf"
                            multiple
                        />
                    </InputContainer>
                </MessageContainer>
            </DialogContent>
        </Dialog>
    );
};

export default MessagePopup;