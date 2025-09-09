import { useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import WallpaperIcon from "@mui/icons-material/Wallpaper";
import ChatBox from "./ChatBoxAdmin";
import ChatListAdmin from "./ChatListAdmin";
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import useChat from "app/hooks/useChat";
import { Span } from "app/components/Typography";
import AddIcon from "@mui/icons-material/Add";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Small } from "app/components/Typography"; 
import { db, storage } from "../../../../src/firebase/Firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  getDocs,
  getDoc
} from "firebase/firestore";
import { useEffect } from "react";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { AccordionDetails, Stack,AccordionSummary,Accordion, IconButton, ListItemAvatar, ListItemText, Avatar, Rating, Card, CardContent } from "@mui/material";
import { set } from "lodash";
import { localStorageKey } from "app/constant/localStorageKey";

const nameSelect = [
  {
    value: "Inbox",
    label: "Inbox"
  },
  {
    value: "From Agukart",
    label: "From Agukart"
  },
  {
    value: "Sent",
    label: "Sent"
  },
  {
    value: "All",
    label: "All"
  },
  {
    value: "Unread",
    label: "Unread"
  },
  {
    value: "Recyle bin",
    label: "Recyle bin"
  }
];

const Message = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorEl2, setAnchorEl2] = useState(null);
  const open = Boolean(anchorEl);
  const open2 = Boolean(anchorEl2);
  const navigate = useNavigate();
  const [userId,setUserId] = useState("");
  const [vendorId,setVendorId] = useState("");
  const [productData,setProductData] = useState({});
  const [userData,setUserData] = useState({});
  const [messageHistory,setMessageHistory] = useState([]);
  const [orderHistory,setOrderHistory] = useState([]);
  const [reviewHistory,setReviewHistory] = useState([]);
  const [favoriteHistory,setFavoriteHistory] = useState([]);
  console.log(userId,vendorId,userData,productData,reviewHistory,favoriteHistory,messageHistory,"Drtuytyutyuyu")
  const [expanded, setExpanded] = useState(null);
  console.log({productData,userData})

  const formatDate = (timestamp) => {
    const date = new Date(timestamp?.seconds * 1000);
    return date?.toLocaleDateString();
  };

  const [searchParams] = useSearchParams();
  let slug = searchParams.get("slug");
  const role = searchParams.get("role");
  console.log("slug", slug);
  const [openPrivateNote, setOpenPrivateNote] = useState(false);
  const [note, setNote] = useState("");
  const [privateNoteExists, setPrivateNoteExists] = useState("");
  const [isEditing, setIsEditing] = useState(false); 

  const handleEdit = () => {
    setIsEditing(true);
    setNote(privateNoteExists); 
  };

  const handleSave = async() => {
    console.log("Saved Note:", note); 
    if (note.trim()) {
      const querySnapshot = await getDocs(
        collection(db, role === "admin" ? "composeChat" : "chatRooms")
      );
      const documents = querySnapshot.docs.map((doc) => {
        const docId = doc.id;
        const docData = doc.data();

        console.log("Document ID: ", docId);
        console.log("Document Data: ", docData);

        return {
          id: docId,
          data: docData
        };
      });

      console.log("All documents: ", documents);

      const matchingDocument = documents?.find((doc) => {
        return doc?.id === slug;
      });

      console.log("matchingDocumentmatchingDocumenttt", matchingDocument);

      if (matchingDocument) {
        console.log("Matching document:", matchingDocument);
        await updateDoc(
          doc(db, role === "admin" ? "composeChat" : "chatRooms", matchingDocument?.id),
          {
            privateNote: note
          }
        );
        setNote("");
        setIsEditing(false);
        const updatedDocRef = doc(db, role === "admin" ? "composeChat" : "chatRooms", matchingDocument.id);
        const updatedDocSnap = await getDoc(updatedDocRef);
      
        if (updatedDocSnap.exists()) {
          const data = updatedDocSnap.data();
          if(data?.privateNote){
            setPrivateNoteExists(data?.privateNote);
          }
        } else {
          console.log("No such document exists!");
        }
      }
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const {
    moveToTrashHandler,
    moveToChatHandler,
    checkMessage,
    showCount,
    markAsUnreadHandler,
    markAsReadHandler,
    chats,
    setCheckMessage,
    searchText,
    setSearchText,
    searchHandler,
    getUserDetails
  } = useChat();

  console.log("jkahsiduh", showCount);

  const { pathname } = useLocation();

  const designationId = localStorage.getItem(localStorageKey.designation_id);
  const auth_key = localStorage.getItem(localStorageKey.auth_key);


  const removeHtmlTags = (htmlString) => {
    if(!htmlString) return ;
    return htmlString.replace(/<[^>]*>/g, "");
  };

  useEffect(() => {
    if (slug) {
      setProductData({});
      const q = query(
        collection(db,"chatRooms"),
        orderBy("createdAt", "asc")
      );
      const unsubscribe = onSnapshot(q,async(snapshot) => {
        const newMessages = snapshot?.docs?.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        const matchingDocument = newMessages?.filter((doc) => {
          return doc?.id === slug;
        });
        console.log("dfhdfh", matchingDocument);
        setUserId(matchingDocument[0]?.user);
        setVendorId(matchingDocument[0]?.receiverId);
        setPrivateNoteExists(matchingDocument[0]?.privateNote);
        setMessageHistory(newMessages?.filter((doc) => {
          return doc?.user === matchingDocument[0]?.user && doc?.receiverId === matchingDocument[0]?.receiverId && doc?.id !== slug;
        }))
        const userData = await getUserDetails(matchingDocument[0]?.user);
        setUserData(userData);
        setProductData(matchingDocument[0]?.productData)
      });

      return () => unsubscribe();
    }
  }, [slug,]);
  
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };

  const getOrderHistory = async(userId,vendorId)=>{
    try {
      const payload = {
        user_id:userId,
        vendor_id:vendorId
      };
      const res = await ApiService.post(`${apiEndpoints.getUserOrderHistoryForMessages}`, payload,auth_key);
      if (res.status === 200) {
        const baseUrl = res?.data?.base_url;
        const salesWithBaseUrl = res?.data?.sales?.map(sale => ({
            ...sale,
            base_url: baseUrl
        })) || [];
        setOrderHistory(salesWithBaseUrl);
        
      }
    } catch (error) {
      console.log("error", error?.response?.data || error);
    }
  }

  const getReviewHistory = async(userId,vendorId)=>{
    try {
      const payload = {
        user_id:userId,
        vendor_id:vendorId
      };
      const res = await ApiService.post(`${apiEndpoints.getReviews}`, payload,auth_key);
      if (res.status === 200) {
        const baseUrl = res?.data?.base_url;
        const reviewsWithBaseUrl = res?.data?.data?.map(item => ({
            ...item,
            base_url: baseUrl
        })) || [];
        setReviewHistory(reviewsWithBaseUrl);
      }
    } catch (error) {
      console.log("error", error?.response?.data || error);
    }
  }

  const getFavoriteHistory = async(userId,vendorId)=>{
    try {
      const payload = {
        user_id:userId,
        vendor_id:vendorId
      };
      const res = await ApiService.post(`${apiEndpoints.getFavoriteProducts}`, payload,auth_key);
      if (res.status === 200) {
        const baseUrl = res?.data?.base_url;
        const favoritesWithBaseUrl = res?.data?.data?.map(item => ({
            ...item,
            base_url: baseUrl
        })) || [];
        setFavoriteHistory(favoritesWithBaseUrl);
      }
    } catch (error) {
      console.log("error", error?.response?.data || error);
    }
  }

  useEffect(()=>{
    if(userId && vendorId){
      getOrderHistory(userId,vendorId);
      getReviewHistory(userId,vendorId);
      getFavoriteHistory(userId,vendorId);
    }
  },[userId,vendorId])

  return (
    <>
      <Box sx={{ background: "#fff" }}>
        <Box
          p={3}
          sx={{
            display: { lg: "flex", md: "flex", xs: "block" },
            alignItems: "center",
            textAlign: "center"
          }}
        >
          <Typography variant="h5" fontWeight={600}>
            Message
          </Typography>
          <Box
            sx={{
              marginLeft: { lg: "25px", md: "25px", xs: "0" },
              marginTop: { lg: "0", md: "0", xs: "12px" },
              height: "40px",
              padding: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#fff",
              boxShadow: "0 0 3px #000",
              borderRadius: "30px"
            }}
          >
            <TextField
              required
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              id="outlined-required"
              defaultValue="Enter Code"
              sx={{ ".MuiOutlinedInput-notchedOutline": { border: "none" } }}
            />
            <Button
              disabled={searchText ? false : true}
              onClick={searchHandler}
              sx={{
                paddingLeft: "18px",
                paddingRight: "18px",
                background: "none",
                border: "none",
                borderRadius: "30px"
              }}
            >
              <SearchIcon />
            </Button>
          </Box>
        </Box>
        <Grid container border={"1px solid #b6b6b6"} width={"100%"} m={0} mb={4} spacing={2}>
          <Grid lg={2} md={3} xs={12} borderRight={"1px solid #b6b6b6"}>
            <Box
              p={2}
              sx={{
                height: "100%",
                background: "#f6f9fc",
                display: { lg: "block", md: "block", xs: "none" }
              }}
            >
              <List>
                {designationId === "2" && (
                  <ListItem sx={{ paddingLeft: "0", paddingRight: "0", paddingBottom: "0" }}>
                    <Button
                      onClick={() => navigate(ROUTE_CONSTANT.messageRoute.compose)}
                      sx={{
                        width: "100%",
                        justifyContent: "start",
                        transition: "all 500ms",
                        fontWeight: "500",
                        background: pathname === "/pages/message/compose" ? "#dedede" : "none",
                        border: "none",
                        borderRadius: "30px",
                        padding: "5px 16px",
                        color: "#000",
                        "&:hover": { background: "#dedede" }
                      }}
                    >
                      Compose
                    </Button>
                  </ListItem>
                )}
                {designationId === "2" && (
                  <ListItem sx={{ paddingLeft: "0", paddingRight: "0", paddingBottom: "0" }}>
                    <Button
                      onClick={() => navigate(ROUTE_CONSTANT.messageRoute.composeMessage)}
                      sx={{
                        width: "100%",
                        justifyContent: "start",
                        transition: "all 500ms",
                        fontWeight: "500",
                        background: pathname === "/pages/message/compose/message" ? "#dedede" : "none",
                        border: "none",
                        borderRadius: "30px",
                        padding: "5px 16px",
                        color: "#000",
                        "&:hover": { background: "#dedede" }
                      }}
                    >
                      All Compose
                    </Button>
                  </ListItem>
                )}
                <ListItem sx={{ paddingLeft: "0", paddingRight: "0", paddingBottom: "0" }}>
                  <Button
                    onClick={() => navigate(ROUTE_CONSTANT.messageRoute.inbox)}
                    sx={{
                      width: "100%",
                      justifyContent: "start",
                      transition: "all 500ms",
                      fontWeight: "500",
                      background: pathname === "/pages/message/inbox" ? "#dedede" : "none",
                      border: "none",
                      borderRadius: "30px",
                      padding: "5px 16px",
                      color: "#000",
                      "&:hover": { background: "#dedede" }
                    }}
                  >
                    Inbox
                  </Button>
                  <Span>{showCount === 0 ? "" : showCount}</Span>
                </ListItem>
                {designationId === "3" && (
                  <ListItem sx={{ paddingLeft: "0", paddingRight: "0", paddingBottom: "0" }}>
                    <Button
                      onClick={() => navigate(ROUTE_CONSTANT.messageRoute.fromEtsy)}
                      sx={{
                        width: "100%",
                        justifyContent: "start",
                        transition: "all 500ms",
                        fontWeight: "500",
                        background: pathname === "/pages/message/etsy" ? "#dedede" : "none",
                        border: "none",
                        borderRadius: "30px",
                        padding: "5px 16px",
                        color: "#000",
                        "&:hover": { background: "#dedede" }
                      }}
                    >
                      From Agukart
                    </Button>
                  </ListItem>
                )}
                {designationId === "3" && (
                  <ListItem sx={{ paddingLeft: "0", paddingRight: "0", paddingBottom: "0" }}>
                    <Button
                      onClick={() => navigate(ROUTE_CONSTANT.messageRoute.sent)}
                      sx={{
                        width: "100%",
                        justifyContent: "start",
                        transition: "all 500ms",
                        fontWeight: "500",
                        background: pathname === "/pages/message/sent" ? "#dedede" : "none",
                        border: "none",
                        borderRadius: "30px",
                        padding: "5px 16px",
                        color: "#000",
                        "&:hover": { background: "#dedede" }
                      }}
                    >
                      Sent
                    </Button>
                    {designationId === "3" && <Span>{showCount === 0 ? "" : showCount}</Span>}
                  </ListItem>
                )}
                <ListItem sx={{ paddingLeft: "0", paddingRight: "0", paddingBottom: "0" }}>
                  <Button
                    onClick={() => navigate(ROUTE_CONSTANT.message)}
                    sx={{
                      width: "100%",
                      justifyContent: "start",
                      transition: "all 500ms",
                      fontWeight: "500",
                      background: pathname === "/pages/message" ? "#dedede" : "none",
                      border: "none",
                      borderRadius: "30px",
                      padding: "5px 16px",
                      color: "#000",
                      "&:hover": { background: "#dedede" }
                    }}
                  >
                    All
                  </Button>
                  <Span>{showCount === 0 ? "" : showCount}</Span>
                </ListItem>
                <ListItem sx={{ paddingLeft: "0", paddingRight: "0", paddingBottom: "0" }}>
                  <Button
                    onClick={() => navigate(ROUTE_CONSTANT.messageRoute.unread)}
                    sx={{
                      width: "100%",
                      justifyContent: "start",
                      transition: "all 500ms",
                      fontWeight: "500",
                      background: pathname === "/pages/message/unread" ? "#dedede" : "none",
                      border: "none",
                      borderRadius: "30px",
                      padding: "5px 16px",
                      color: "#000",
                      "&:hover": { background: "#dedede" }
                    }}
                  >
                    Unread
                  </Button>
                  <Span>{showCount === 0 ? "" : showCount}</Span>
                </ListItem>
                <ListItem sx={{ paddingLeft: "0", paddingRight: "0", paddingBottom: "0" }}>
                  <Button
                    onClick={() => navigate(ROUTE_CONSTANT.messageRoute.pin)}
                    sx={{
                      width: "100%",
                      justifyContent: "start",
                      transition: "all 500ms",
                      fontWeight: "500",
                      background: pathname === "/pages/message/pin" ? "#dedede" : "none",
                      border: "none",
                      borderRadius: "30px",
                      padding: "5px 16px",
                      color: "#000",
                      "&:hover": { background: "#dedede" }
                    }}
                  >
                    Pin
                  </Button>
                </ListItem>
                <ListItem sx={{ paddingLeft: "0", paddingRight: "0", paddingBottom: "0" }}>
                  <Button
                    onClick={() => navigate(ROUTE_CONSTANT.messageRoute.trash)}
                    sx={{
                      width: "100%",
                      justifyContent: "start",
                      transition: "all 500ms",
                      fontWeight: "500",
                      background: pathname === "/pages/message/trash" ? "#dedede" : "none",
                      border: "none",
                      borderRadius: "30px",
                      padding: "5px 16px",
                      color: "#000",
                      "&:hover": { background: "#dedede" }
                    }}
                  >
                    Recycle bin
                  </Button>
                </ListItem>
              </List>
            </Box>
            <Box p={2} sx={{ display: { lg: "none", md: "none", xs: "block" } }}>
              <TextField
                select
                defaultValue="Inbox"
                sx={{
                  width: "100%",
                  ".MuiInputBase-root": {
                    height: "50px"
                  }
                }}
              >
                {nameSelect.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Grid>
          <Grid lg={!slug || pathname === "/pages/message/compose/message" || role ? 10 : 7} md={!slug || pathname === "/pages/message/compose/message" || role ? 10 : 6} xs={12}>
            <Box>
            {
              pathname !== "/pages/message/compose" && pathname !== "/pages/message/compose/message" &&  pathname !== "/pages/message/etsy" && !slug && (
                <Box p={2} sx={{ background: "#f6f9fc" }} borderBottom={"1px solid #b6b6b6"}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {chats.length === 0 ? (
                      <>
                        <Typography component="span">
                          <Checkbox />
                        </Typography>
                      </>
                    ) : (
                      <Typography component="span">
                        <Checkbox
                          checked={checkMessage.length === chats.length}
                          onChange={() => {
                            if (checkMessage.length !== chats.length) {
                              const allCheckIds = chats.map((doc) => {
                                return doc.id;
                              });
                              setCheckMessage(allCheckIds);
                            } else {
                              setCheckMessage([]);
                            }
                          }}
                        />
                      </Typography>
                    )}
                    <List
                      sx={{ display: "flex", alignItems: "center", marginLeft: "30px", padding: "0" }}
                    >
                      <ListItem sx={{ width: "auto", paddingLeft: "0" }}>
                        <Tooltip
                          title={checkMessage.length === 0 ? "Please select a message" : ""}
                          arrow
                        >
                          <Button
                            onClick={moveToTrashHandler}
                            sx={{
                              transition: "all 500ms",
                              fontWeight: "500",
                              background: "none",
                              border:
                                checkMessage.length === 0 ? "1px solid #e1e1e1" : "1px solid black",
                              opacity: checkMessage.length === 0 ? "0.4" : "1",
                              borderRadius: "30px",
                              padding: "5px 16px",
                              color: "#000",
                              "&:hover": { background: "#dedede" }
                            }}
                          >
                            {pathname === "/pages/message/trash" ? "Delete" : "Recycle bin"}
                          </Button>
                        </Tooltip>
                      </ListItem>
                      <ListItem sx={{ width: "auto", paddingLeft: "0" }}>
                        <Tooltip
                          title={checkMessage.length === 0 ? "Please select a message" : ""}
                          arrow
                        >
                          <Button
                            onClick={markAsUnreadHandler}
                            sx={{
                              transition: "all 500ms",
                              fontWeight: "500",
                              background: "none",
                              border:
                                checkMessage.length === 0 ? "1px solid #e1e1e1" : "1px solid black",
                              opacity: checkMessage.length === 0 ? "0.4" : "1",
                              borderRadius: "30px",
                              padding: "5px 16px",
                              color: "#000",
                              "&:hover": { background: "#dedede" }
                            }}
                          >
                            Mark Unread
                          </Button>
                        </Tooltip>
                      </ListItem>
                      <ListItem
                        sx={{
                          width: "auto",
                          paddingLeft: "0",
                          display: { lg: "block", md: "block", xs: "none" }
                        }}
                      >
                        <Tooltip
                          title={checkMessage.length === 0 ? "Please select a message" : ""}
                          arrow
                        >
                          <Button
                            onClick={markAsReadHandler}
                            sx={{
                              transition: "all 500ms",
                              fontWeight: "500",
                              background: "none",
                              border:
                                checkMessage.length === 0 ? "1px solid #e1e1e1" : "1px solid black",
                              opacity: checkMessage.length === 0 ? "0.4" : "1",
                              borderRadius: "30px",
                              padding: "5px 16px",
                              color: "#000",
                              "&:hover": { background: "#dedede" }
                            }}
                          >
                            Mark Read
                          </Button>
                        </Tooltip>
                      </ListItem>

                      {pathname === "/pages/message/trash" ? (
                        <ListItem
                          sx={{
                            width: "auto",
                            paddingLeft: "0",
                            display: { lg: "block", md: "block", xs: "none" }
                          }}
                        >
                          <Tooltip
                            title={checkMessage.length === 0 ? "Please select a message" : ""}
                            arrow
                          >
                            <Button
                              onClick={moveToChatHandler}
                              sx={{
                                transition: "all 500ms",
                                fontWeight: "500",
                                background: "none",
                                border:
                                  checkMessage.length === 0 ? "1px solid #e1e1e1" : "1px solid black",
                                opacity: checkMessage.length === 0 ? "0.4" : "1",
                                borderRadius: "30px",
                                padding: "5px 16px",
                                color: "#000",
                                "&:hover": { background: "#dedede" }
                              }}
                            >
                              Move to inbox
                            </Button>
                          </Tooltip>
                        </ListItem>
                      ) : (
                        ""
                      )}
                      <ListItem
                        sx={{
                          width: "auto",
                          paddingLeft: "0",
                          display: { lg: "none", md: "none", xs: "block" }
                        }}
                      >
                        <Button
                          aria-label="more"
                          id="basic-button"
                          aria-controls={open2 ? "basic-menu" : undefined}
                          aria-haspopup="true"
                          aria-expanded={open2 ? "true" : undefined}
                          onClick={handleClick2}
                          sx={{
                            transition: "all 500ms",
                            fontWeight: "500",
                            background: "none",
                            border: "none",
                            opacity: "0.4",
                            borderRadius: "30px",
                            padding: "5px 16px",
                            color: "#000",
                            "&:hover": { background: "#dedede" }
                          }}
                        >
                          <MoreVertIcon />
                        </Button>
                        <Menu
                          anchorEl={anchorEl2}
                          open={open2}
                          onClose={handleClose2}
                          MenuListProps={{
                            "aria-labelledby": "basic-button"
                          }}
                        >
                          <MenuItem>
                            <Box>
                              <List>
                                <ListItem
                                  sx={{ paddingBottom: "0", width: "auto", paddingLeft: "0" }}
                                >
                                  <Button
                                    sx={{
                                      transition: "all 500ms",
                                      fontWeight: "500",
                                      background: "#fff",
                                      border: "none",
                                      borderRadius: "30px",
                                      padding: "5px 16px",
                                      color: "#000",
                                      "&:hover": { background: "#dedede" }
                                    }}
                                  >
                                    Mark Read
                                  </Button>
                                </ListItem>
                                <ListItem
                                  sx={{ paddingBottom: "0", width: "auto", paddingLeft: "0" }}
                                >
                                  <Button
                                    sx={{
                                      transition: "all 500ms",
                                      fontWeight: "500",
                                      background: "#fff",
                                      border: "none",
                                      borderRadius: "30px",
                                      padding: "5px 16px",
                                      color: "#000",
                                      "&:hover": { background: "#dedede" }
                                    }}
                                  >
                                    Report Spam
                                  </Button>
                                </ListItem>
                                <ListItem
                                  sx={{ paddingBottom: "0", width: "auto", paddingLeft: "0" }}
                                >
                                  <Button
                                    sx={{
                                      transition: "all 500ms",
                                      fontWeight: "500",
                                      background: "#fff",
                                      border: "none",
                                      borderRadius: "30px",
                                      padding: "5px 16px",
                                      color: "#000",
                                      "&:hover": { background: "#dedede" }
                                    }}
                                  >
                                    Archive
                                  </Button>
                                </ListItem>
                              </List>
                            </Box>
                          </MenuItem>
                        </Menu>
                      </ListItem>
                    </List>
                  </Box>
                </Box>
              )
            }
              <Box>
                <Outlet />
              </Box>
            </Box>
          </Grid>
          {slug && pathname !== "/pages/message/compose/message" && !role &&(
            <Grid lg={3} md={3} xs={12}>
              <Box p={3} sx={{ border: "1px solid #b6b6b6", height: "100%" }}>
                <Typography
                  component="div"
                  pb={2}
                  sx={{
                    display: "flex",
                    flexDirection: { lg: "row", md: "row", xs: "column-reverse" },
                    alignItems: "center",
                    justifyContent: { lg: "space-between", md: "space-between", xs: "center" }
                  }}
                >
                  <Typography
                    component="div"
                    sx={{ textAlign: { lg: "start", md: "start", xs: "center" } }}
                  >
                    <Typography fontSize={15} fontWeight={500} color={"#000"}>
                      <Link
                        href="#"
                        sx={{
                          color: "#000",
                          textDecoration: "none",
                          "&:hover": { textDecoration: "underline" }
                        }}
                      >
                        Name : {userData?.name || "Unknown User"}
                      </Link>
                    </Typography>
                    {
                      !role && <Typography fontSize={14} fontWeight={500} color={"#000"}>
                        Customer id no. :  #{userData?.customerId}
                      </Typography>
                    }
                  </Typography>
                  <Typography component="div">
                    <img
                      src={userData?.image || "https://i.etsystatic.com/site-assets/images/avatars/default_avatar.png?width=75"}
                      alt=""
                      style={{ borderRadius: "50%", width: "45px", height: "45px" }}
                    />
                  </Typography>
                </Typography>
                {
                  Object.keys(productData || {}).length > 0 && <Box mt={2}>
                    <Typography fontSize={16} fontWeight={600} pb={1}>
                      Item
                    </Typography>
                    <Typography
                      component="div"
                      pb={2}
                      sx={{
                        display: "flex",
                        flexDirection: { lg: "row", md: "row", xs: "column" },
                        justifyContent: { lg: "start", md: "space-between", xs: "star" }
                      }}
                    >
                      <Typography component="div">
                        <img
                          src={productData?.product_image || "https://i.etsystatic.com/iusa/5d5a40/98780171/iusa_75x75.98780171_9ox6.jpg?version=0"}
                          alt=""
                          style={{ width: "50px", height: "50px", borderRadius: "4px" }}
                        />
                      </Typography>
                      <Typography component="div" sx={{ paddingLeft: { lg: 2, md: 2, xs: 0 } }}>
                        <Typography component="div"
                            sx={{
                              fontSize: "14px",
                              fontWeight: "500",
                              color: "#000",
                              display: "flex",
                              alignItems: "center",
                          }}>
                            Order Id : {`#${productData?.orderId}`}
                        </Typography>
                        <Typography
                          fontSize={14}
                          fontWeight={500}
                          color={"#000"}
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          <Link
                            to=""
                            sx={{
                              color: "#000",
                              textDecoration: "none",
                              "&:hover": { textDecoration: "underline" }
                            }}
                          >
                            {removeHtmlTags(productData?.name || "") || "925 Sterling Silver Spinner Ring for Woman Girls"}
                          </Link>
                        </Typography>
                        <Typography component="div"
                          sx={{
                            fontSize: "15px",
                            fontWeight: "500",
                            color: "#000",
                            display: "flex",
                            alignItems: "center",
                        }}>
                          ${productData?.sale_price}
                        </Typography>
                        {productData?.isCombination && (
                          <>
                            {productData?.variantData?.map((variant, index) => (
                              <Typography
                                fontSize={14} fontWeight={500} color={"#000"}
                                key={`variant-${index}`}
                              >
                                {variant?.variant_name}:{" "}
                                <Typography component="span" fontWeight={400}>
                                  {productData?.variantAttributeData?.[index]
                                    ?.attribute_value || "N/A"}
                                </Typography>
                              </Typography>
                            ))}
                          </>
                        )}
                        {productData?.customize == "Yes" && (
                          <>
                            {productData?.customizationData?.map((item, index) => (
                              <div key={index}>
                                {Object.entries(item).map(([key, value]) => (
                                  <div key={key}>
                                    {typeof value === "object" ? (
                                      <div>
                                        {key}:
                                        {`${value?.value} (${value?.price})`}
                                      </div>
                                    ) : (
                                      <div>
                                        {key}: {value}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </>
                        )}
                      </Typography>
                    </Typography>
                  </Box>
                }
                <Accordion expanded={expanded === "messageHistory"} onChange={handleChange("messageHistory")} sx={{ boxShadow: "none", border: "1px solid #ddd", borderRadius: "6px", mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: "#f9f9f9" }}>
                    <Typography fontWeight={500}>Message History</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                  {messageHistory?.length > 0 ? (
                    <Stack spacing={1}>
                      {messageHistory?.map((message) => {
                        const currentMessageDate = formatDate(message?.createdAt);
                        const firstMessage = message?.text?.[0];
                        return <Card key={message.id} onClick={()=>{
                          const url = `/pages/message?slug=${message?.id}`
                          window.open(url, "_blank", "noopener,noreferrer");
                        }} sx={{ borderRadius: 2, boxShadow: "none", border: "1px solid #ddd",cursor:"pointer" }}>
                          <CardContent>
                            <Typography fontWeight={600}>{message?.orderId ? `Help with order #${message?.orderId}` : `${removeHtmlTags(firstMessage?.productData?.productTitle || "")}`}</Typography>
                            <Typography fontSize="small" color="gray">{currentMessageDate}</Typography>
                            <Typography>{firstMessage?.text || "No message available"}</Typography>
                          </CardContent>
                        </Card>
                        })}
                      {/* <Typography color="primary" sx={{ cursor: "pointer", fontWeight: 500 }}>
                        Full history
                      </Typography> */}
                    </Stack>
                  ) : (
                    <Typography>No data available</Typography>
                  )}
                  </AccordionDetails>
                </Accordion>
                <Accordion expanded={expanded === "orderHistory"} onChange={handleChange("orderHistory")} sx={{ boxShadow: "none", border: "1px solid #ddd", borderRadius: "6px", mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: "#f9f9f9" }}>
                    <Typography fontWeight={500}>Order History</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {
                      orderHistory.length > 0 ? (
                        <List>
                          {orderHistory.map((order) => (
                            <Box key={order.id} sx={{ mb: 2 }}>
                              <Typography fontWeight={500}>Order #{order.order_id}</Typography>
                              {/* <Typography color="green">{order.status}</Typography> */}
                              {order.saleDetaildata.map((product, index) => (
                                <Box key={index} sx={{ display: "flex", mt: 1 }}>
                                  <img
                                    src={`${order?.base_url}${product?.productData?.image[0]}`}
                                    alt="image"
                                    width={50}
                                    height={50}
                                    style={{ borderRadius: "6px", marginRight: "10px" }}
                                  />
                                  <Box>
                                    <Typography fontWeight="bold">{removeHtmlTags(product.productData.product_title || "")}</Typography>
                                    <Typography>${product.sub_total}</Typography>
                                    <Typography>Quantity: {product.qty}</Typography>
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          ))}
                        </List>
                      ) : (
                        <Typography>No data available</Typography>
                      )
                    }
                  </AccordionDetails>
                </Accordion>
                <Accordion expanded={expanded === "reviews"} onChange={handleChange("reviews")} sx={{ boxShadow: "none", border: "1px solid #ddd", borderRadius: "6px", mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: "#f9f9f9" }}>
                    <Typography fontWeight={500}>Reviews</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {reviewHistory.length > 0 ? (
                      <List>
                        {reviewHistory.map((review) => (
                          <ListItem alignItems="flex-start" key={review.id}>
                            <ListItemAvatar>
                              <Avatar alt="image" src={`${review.base_url}${review.productData[0].image[0]}`} />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <>
                                  <Typography fontWeight={600}>{removeHtmlTags(review.productData[0].product_title || "")}</Typography>
                                  <Rating value={review.item_rating} precision={0.5} readOnly />
                                </>
                              }
                              secondary={review.additional_comment}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography>No data available</Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
                <Accordion expanded={expanded === "favoriteItems"} onChange={handleChange("favoriteItems")} sx={{ boxShadow: "none", border: "1px solid #ddd", borderRadius: "6px", mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: "#f9f9f9" }}>
                    <Typography fontWeight={500}>Favorite Items</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {favoriteHistory.length > 0 ? (
                      <List>
                        {favoriteHistory.map((item) => (
                          <ListItem alignItems="flex-start" key={item.id}>
                            <ListItemAvatar>
                              <Avatar alt="image" src={`${item?.base_url}${item?.productData[0]?.image[0]}`} />
                            </ListItemAvatar>
                            <Box>
                              <Typography fontWeight="bold">{removeHtmlTags(item?.productData[0].product_title || "")}</Typography>
                              <Typography>${item?.productData[0].sale_price}</Typography>
                            </Box>
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography>No data available</Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
                <Box sx={{p: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                    }}
                    onClick={() => setOpenPrivateNote(!openPrivateNote)}
                  >
                    <Typography fontWeight={500}>Private Note</Typography>
                    <IconButton size="small">
                      <AddIcon />
                    </IconButton>
                  </Box>

                  {openPrivateNote && (
                    <>
                    {
                      !privateNoteExists || isEditing? 
                      (
                        <Box sx={{ mt: 1 }}>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Write your private note..."
                          />
                          <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={handleSave} 
                            sx={{ mt: 1 }}
                          >
                            Save
                          </Button>
                        </Box>
                      ):(
                        <Box sx={{ mt: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Typography>{privateNoteExists}</Typography>
                          <Button 
                            variant="outlined" 
                            color="secondary" 
                            onClick={handleEdit} 
                          >
                            Edit
                          </Button>
                        </Box>
                      )
                    }
                    </> 
                  )}
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </>
  );
};

export default Message;
