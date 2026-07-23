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
import DescriptionIcon from "@mui/icons-material/Description";
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
import { AccordionDetails, Stack, AccordionSummary, Accordion, IconButton, ListItemAvatar, ListItemText, Avatar, Rating, Card, CardContent, Drawer, useTheme, useMediaQuery } from "@mui/material";
import { set } from "lodash";
import { localStorageKey } from "app/constant/localStorageKey";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorEl2, setAnchorEl2] = useState(null);
  const open = Boolean(anchorEl);
  const open2 = Boolean(anchorEl2);
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [productData, setProductData] = useState({});
  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState({});
  const [messageHistory, setMessageHistory] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [favoriteHistory, setFavoriteHistory] = useState([]);
  console.log(userId, vendorId, userData, productData, reviewHistory, favoriteHistory, messageHistory, "Drtuytyutyuyu")
  const [expanded, setExpanded] = useState(null);
  console.log({ productData, userData })
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
  const [suborderid, setSuborderid] = useState("");

  const handleEdit = () => {
    setIsEditing(true);
    setNote(privateNoteExists);
  };

  const handleSave = async () => {
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
          if (data?.privateNote) {
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
    if (!htmlString) return;
    return htmlString.replace(/<[^>]*>/g, "");
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const toggleDetailDrawer = () => {
    setDetailDrawerOpen(!detailDrawerOpen);
  };

  useEffect(() => {
    if (slug) {
      setProductData({});
      const q = query(
        collection(db, "chatRooms"),
        orderBy("createdAt", "asc")
      );
      const unsubscribe = onSnapshot(q, async (snapshot) => {
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
        const chats = newMessages?.filter((doc) => {
          return doc?.user === matchingDocument[0]?.user && doc?.receiverId === matchingDocument[0]?.receiverId && doc?.id !== slug;
        })?.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        setMessageHistory(chats)
        console.log(chats, "chats");
        const userData = await getUserDetails(matchingDocument[0]?.user);
        if (!pathname.includes('compose')) {
          userData.shop_name = matchingDocument[0]?.shopName;
        }
        setUserData(userData);
        setProductData(matchingDocument[0]?.productData)
        setProducts(matchingDocument[0]?.products || [])
        setSuborderid(matchingDocument[0]?.subOrderId || "")
      });
      return () => unsubscribe();
    }
  }, [slug,]);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };

  const getOrderHistory = async (userId, vendorId) => {
    try {
      const payload = {
        user_id: userId,
        vendor_id: vendorId
      };
      const res = await ApiService.post(`${apiEndpoints.getUserOrderHistoryForMessages}`, payload, auth_key);
      if (res.status === 200) {
        const baseUrl = res?.data?.base_url;
        const salesWithBaseUrl = res?.data?.sales?.map(sale => ({
          ...sale,
          base_url: baseUrl,
          sub_order_id: sale.saleDetaildata[0].sub_order_id
        })) || [];
        setOrderHistory(salesWithBaseUrl);
        console.log(salesWithBaseUrl, "sale")
      }
    } catch (error) {
      console.log("error", error?.response?.data || error);
    }
  }

  const getReviewHistory = async (userId, vendorId) => {
    try {
      const payload = {
        user_id: userId,
        vendor_id: vendorId
      };
      const res = await ApiService.post(`${apiEndpoints.getReviews}`, payload, auth_key);
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

  const getFavoriteHistory = async (userId, vendorId) => {
    try {
      const payload = {
        user_id: userId,
        vendor_id: vendorId
      };
      const res = await ApiService.post(`${apiEndpoints.getFavoriteProducts}`, payload, auth_key);
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

  useEffect(() => {
    if (userId && vendorId) {
      getOrderHistory(userId, vendorId);
      getReviewHistory(userId, vendorId);
      getFavoriteHistory(userId, vendorId);
    }
  }, [userId, vendorId])

  // Sidebar content
  const SidebarContent = () => (
    <Box sx={{ height: "100%", overflowY: "auto", p: 2, background: "#f6f9fc" }}>
      <List>
        {designationId === "2" && (
          <ListItem sx={{ paddingLeft: "0", paddingRight: "0", paddingBottom: "0" }}>
            <Button
              onClick={() => {
                navigate(ROUTE_CONSTANT.messageRoute.compose);
                if (isMobile) setMobileDrawerOpen(false);
              }}
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
              onClick={() => {
                navigate(ROUTE_CONSTANT.messageRoute.composeMessage);
                if (isMobile) setMobileDrawerOpen(false);
              }}
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
            onClick={() => {
              navigate(ROUTE_CONSTANT.messageRoute.inbox);
              if (isMobile) setMobileDrawerOpen(false);
            }}
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
              onClick={() => {
                navigate(ROUTE_CONSTANT.messageRoute.fromEtsy);
                if (isMobile) setMobileDrawerOpen(false);
              }}
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
              onClick={() => {
                navigate(ROUTE_CONSTANT.messageRoute.sent);
                if (isMobile) setMobileDrawerOpen(false);
              }}
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
            onClick={() => {
              navigate(ROUTE_CONSTANT.message);
              if (isMobile) setMobileDrawerOpen(false);
            }}
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
            onClick={() => {
              navigate(ROUTE_CONSTANT.messageRoute.unread);
              if (isMobile) setMobileDrawerOpen(false);
            }}
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
            onClick={() => {
              navigate(ROUTE_CONSTANT.messageRoute.pin);
              if (isMobile) setMobileDrawerOpen(false);
            }}
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
            onClick={() => {
              navigate(ROUTE_CONSTANT.messageRoute.trash);
              if (isMobile) setMobileDrawerOpen(false);
            }}
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
      {/* {isMobile && (
        <Box sx={{ display: { lg: "none", md: "none", xs: "block" }, mt: 2 }}>
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
      )} */}
    </Box>
  );

  // Detail content for mobile drawer
  const DetailContent = () => (
    <Box p={3} sx={{ minHeight: "100%", overflowY: "auto" }}>
      {/* Same detail content as before */}
      <Typography
        component="div"
        pb={2}
        sx={{
          display: "flex",
          flexDirection: "column-reverse",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Typography
          component="div"
          sx={{ textAlign: "center" }}
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
          {!role && (
            <Typography fontSize={14} fontWeight={500} color={"#000"}>
              Customer id no. :  #{userData?.customerId}
            </Typography>
          )}
        </Typography>
        <Typography component="div" sx={{ mb: 1 }}>
          <img
            src={userData?.image || "https://i.etsystatic.com/site-assets/images/avatars/default_avatar.png?width=75"}
            alt=""
            style={{ borderRadius: "50%", width: "45px", height: "45px" }}
          />
        </Typography>
      </Typography>
      {(() => {
        const productsToRender = Array.isArray(products) && products.length > 0
          ? products
          : (Object.keys(productData || {}).length > 0 ? [productData] : []);
        return productsToRender.length > 0 && (
          <Box mt={2}>
            <Typography
              component="div"
              sx={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#000",
                display: "flex",
                alignItems: "center",
              }}
            >
              Store : {userData.shop_name || "-"}
            </Typography>
            <Typography
              component="div"
              sx={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#000",
                display: "flex",
                alignItems: "center",
              }}
            >
              Sub Order Id : {`#${suborderid || "-"}`}
            </Typography>
            <Typography fontSize={16} fontWeight={600} pb={1}>
              Items:
            </Typography>
            {productsToRender.map((item, itemIndex) => (
              <Typography
                key={`product-item-${itemIndex}`}
                component="div"
                pb={2}
                sx={{
                  display: "flex",
                  gap: 0.5,
                  justifyContent: { lg: "start", md: "space-between", xs: "star" }
                }}
              >
                <Typography component="div">
                  <img
                    src={item?.product_image || "https://i.etsystatic.com/iusa/5d5a40/98780171/iusa_75x75.98780171_9ox6.jpg?version=0"}
                    alt=""
                    style={{ width: "50px", height: "50px", borderRadius: "4px", marginTop: "6px" }}
                  />
                </Typography>
                <Typography component="div" sx={{ paddingLeft: { lg: 2, md: 2, xs: 0 } }}>
                  <Typography
                    fontSize={14}
                    fontWeight={500}
                    color={"#000"}
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
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
                      {removeHtmlTags(item?.name || "") || "925 Sterling Silver Spinner Ring for Woman Girls"}
                    </Link>
                  </Typography>
                  <Typography
                    component="div"
                    sx={{
                      fontSize: "15px",
                      fontWeight: "500",
                      color: "#000",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    ${item?.sale_price}
                  </Typography>
                  {item?.isCombination && (
                    <>
                      {item?.variantData?.map((variant, index) => (
                        <Typography
                          fontSize={14}
                          fontWeight={500}
                          color={"#000"}
                          key={`variant-${itemIndex}-${index}`}
                        >
                          {variant?.variant_name}:{" "}
                          <Typography component="span" fontWeight={400}>
                            {item?.variantAttributeData?.[index]?.attribute_value || "N/A"}
                          </Typography>
                        </Typography>
                      ))}
                    </>
                  )}
                  {item?.variants && item?.variants?.length > 0 && (
                    <>
                      {item?.variants?.map((variant, index) => (
                        <Typography
                          fontSize={14}
                          fontWeight={500}
                          color={"#000"}
                          key={`variant-${itemIndex}-${index}`}
                        >
                          {variant?.variantName}:{" "}
                          <Typography component="span" fontWeight={400}>
                            {variant?.attributeName}
                          </Typography>
                        </Typography>
                      ))}
                    </>
                  )}
                  {item?.customize == "Yes" && (
                    <>
                      {item?.customizationData?.map((customItem, index) => (
                        <div key={index}>
                          {Object.entries(customItem).map(([key, value]) => (
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
            ))}
          </Box>
        );
      })()}
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
                return <Card key={message.id} onClick={() => {
                  const url = `/pages/message?slug=${message?.id}`
                  window.open(url, "_blank", "noopener,noreferrer");
                }} sx={{ borderRadius: 2, boxShadow: "none", border: "1px solid #ddd", cursor: "pointer" }}>
                  <CardContent>
                    <Typography fontWeight={600}>{message?.orderId ? `Help with order #${message?.subOrderId || message?.orderId}` : `${removeHtmlTags(firstMessage?.productData?.productTitle || "")}`}</Typography>
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
                    <Typography fontWeight={500}>Order #{order.sub_order_id}</Typography>
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
      <Box sx={{ p: 1 }}>
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
              !privateNoteExists || isEditing ?
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
                ) : (
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
  );

  return (
    <>
      <Box sx={{ background: "#fff" }}>
        {/* Header */}
        <Box
          p={{ xs: 2, sm: 3 }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h5" fontWeight={600} sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }}>
              Message
            </Typography>
          </Box>
          <Box
            sx={{
              height: "40px",
              padding: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#fff",
              boxShadow: "0 0 3px #000",
              borderRadius: "30px",
              flex: { xs: "1 1 100%", sm: "0 1 auto" },
              maxWidth: { xs: "100%", sm: "300px" },
            }}
          >
            <TextField
              required
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              id="outlined-required"
              placeholder="Search..."
              size="small"
              sx={{
                ".MuiOutlinedInput-notchedOutline": { border: "none" },
                flex: 1,
                "& .MuiInputBase-input": {
                  padding: "4px 8px",
                  fontSize: "14px",
                }
              }}
            />
            <Button
              disabled={searchText ? false : true}
              onClick={searchHandler}
              sx={{
                paddingLeft: "18px",
                paddingRight: "18px",
                background: "none",
                border: "none",
                borderRadius: "30px",
                minWidth: "auto",
              }}
            >
              <SearchIcon />
            </Button>
          </Box>
        </Box>

        {/* Mobile Sidebar Drawer */}
        <Drawer
          anchor="left"
          open={mobileDrawerOpen}
          onClose={toggleMobileDrawer}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: 280,
              boxSizing: "border-box",
              bgcolor: "#f8f9fa",
            },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
            <IconButton onClick={toggleMobileDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          <SidebarContent />
        </Drawer>

        {/* Main Content */}
        <Grid container border={"1px solid #b6b6b6"} width={"100%"} m={0} mb={4} spacing={0}>
          {/* Sidebar - Desktop */}
          <Grid
            item
            lg={2}
            md={3}
            xs={false}
            borderRight={"1px solid #b6b6b6"}
            sx={{
              display: { xs: "none", md: "block" },
              position: "sticky",
              top: 0,
              alignSelf: "flex-start",
              height: "100vh",
              overflow: "hidden",
            }}
          >
            <SidebarContent />
          </Grid>

          {/* Chat List Area */}
          <Grid
            item
            lg={!slug || pathname === "/pages/message/compose/message" || role ? 10 : 7}
            md={!slug || pathname === "/pages/message/compose/message" || role ? 9 : 6}
            xs={12}
            sx={{
              height: { xs: "calc(100vh - 120px)", md: "100vh" },
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflow: "hidden",
              flex: 1,
            }}>
              {pathname !== "/pages/message/compose" && pathname !== "/pages/message/compose/message" && pathname !== "/pages/message/etsy" && (
                <Box
                  p={{ xs: 0.5, sm: 1 }}
                  borderBottom={"1px solid #b6b6b6"}
                  sx={{
                    background: "#f6f9fc",
                    flexShrink: 0,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
                    {isMobile && (
                      <IconButton onClick={toggleMobileDrawer} sx={{ color: "#3c4043", p: 0.5 }}>
                        <MenuIcon />
                      </IconButton>
                    )}
                    {chats.length === 0 ? (
                      <Typography component="span">
                        <Checkbox />
                      </Typography>
                    ) : (
                      <Typography component="span">
                        <Checkbox
                          checked={
                            slug
                              ? checkMessage.includes(slug)
                              : checkMessage.length === chats.length
                          }
                          onChange={() => {
                            if (slug) {
                              if (checkMessage.includes(slug)) {
                                setCheckMessage([]);
                              } else {
                                setCheckMessage([slug]);
                              }
                            } else {
                              if (checkMessage.length !== chats.length) {
                                const allCheckIds = chats.map((doc) => {
                                  return doc.id;
                                });
                                setCheckMessage(allCheckIds);
                              } else {
                                setCheckMessage([]);
                              }
                            }
                          }}
                          size={isMobile ? "small" : "medium"}
                          sx={{ padding: isMobile ? "4px" : "9px" }}
                        />
                      </Typography>
                    )}
                    <List
                      sx={{ display: "flex", alignItems: "center", marginLeft: { xs: 0, sm: "30px" }, padding: "0", flexWrap: "wrap" }}
                    >
                      <ListItem sx={{ width: "auto", paddingLeft: "0", paddingRight: { xs: "4px", sm: "8px" } }}>
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
                              border: checkMessage.length === 0 ? "1px solid #e1e1e1" : "1px solid black",
                              opacity: checkMessage.length === 0 ? "0.4" : "1",
                              borderRadius: "30px",
                              padding: { xs: "2px 10px", sm: "5px 16px" },
                              color: "#000",
                              fontSize: { xs: "11px", sm: "14px" },
                              "&:hover": { background: "#dedede" }
                            }}
                          >
                            {pathname === "/pages/message/trash" ? "Delete" : "Recycle bin"}
                          </Button>
                        </Tooltip>
                      </ListItem>
                      <ListItem sx={{ width: "auto", paddingLeft: "0", paddingRight: { xs: "4px", sm: "8px" } }}>
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
                              border: checkMessage.length === 0 ? "1px solid #e1e1e1" : "1px solid black",
                              opacity: checkMessage.length === 0 ? "0.4" : "1",
                              borderRadius: "30px",
                              padding: { xs: "2px 10px", sm: "5px 16px" },
                              color: "#000",
                              fontSize: { xs: "11px", sm: "14px" },
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
                          paddingRight: { xs: "4px", sm: "8px" },
                          display: { xs: "none", sm: "block" }
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
                              border: checkMessage.length === 0 ? "1px solid #e1e1e1" : "1px solid black",
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
                      {pathname === "/pages/message/trash" && (
                        <ListItem
                          sx={{
                            width: "auto",
                            paddingLeft: "0",
                            paddingRight: { xs: "4px", sm: "8px" },
                            display: { xs: "none", sm: "block" }
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
                                border: checkMessage.length === 0 ? "1px solid #e1e1e1" : "1px solid black",
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
                      )}
                      <ListItem
                        sx={{
                          width: "auto",
                          padding: "0",
                          display: { xs: "block", sm: "none" },
                        }}
                      >
                        <IconButton
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
                            color: "#000",
                            "&:hover": { background: "#dedede" }
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
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
                                <ListItem sx={{ paddingBottom: "0", width: "auto", paddingLeft: "0" }}>
                                  <Button
                                    onClick={() => { markAsReadHandler(); handleClose2(); }}
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
                                {pathname === "/pages/message/trash" && (
                                  <ListItem sx={{ paddingBottom: "0", width: "auto", paddingLeft: "0" }}>
                                    <Button
                                      onClick={() => { moveToChatHandler(); handleClose2(); }}
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
                                      Move to inbox
                                    </Button>
                                  </ListItem>
                                )}
                              </List>
                            </Box>
                          </MenuItem>
                        </Menu>
                      </ListItem>
                    </List>
                    {slug && isMobile && (
                      <IconButton
                        onClick={toggleDetailDrawer}
                        sx={{ display: { xs: "inline-flex", lg: "none" }, ml: 'auto' }}
                      >
                        <DescriptionIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              )}
              <Box sx={{
                flex: 1,
                overflow: "hidden",
                width: "100%",
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
              }}>
                <Outlet />
              </Box>
            </Box>
          </Grid>

          {/* Detail Panel - Desktop */}
          {slug && pathname !== "/pages/message/compose/message" && !role && (
            <Grid
              item
              lg={3}
              md={3}
              xs={false}
              sx={{
                display: { xs: "none", md: "block" },
                overflow: "auto",
                maxHeight: "100vh",
                position: "sticky",
                border: '2px solid #ddd',
                top: 0,
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
              }}
            >
              <Box p={3} sx={{ minHeight: "100%" }}>
                {/* Detail content - same as before */}
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
                {/* ... rest of the detail content (products, accordions, etc.) ... */}
                {(() => {
                  const productsToRender = Array.isArray(products) && products.length > 0
                    ? products
                    : (Object.keys(productData || {}).length > 0 ? [productData] : []);
                  return productsToRender.length > 0 && (
                    <Box mt={2}>
                      <Typography
                        component="div"
                        sx={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#000",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        Store : {userData.shop_name || "-"}
                      </Typography>
                      <Typography
                        component="div"
                        sx={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#000",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        Sub Order Id : {`#${suborderid || "-"}`}
                      </Typography>
                      <Typography fontSize={16} fontWeight={600} pb={1}>
                        Items:
                      </Typography>
                      {productsToRender.map((item, itemIndex) => (
                        <Typography
                          key={`product-item-${itemIndex}`}
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
                              src={item?.product_image || "https://i.etsystatic.com/iusa/5d5a40/98780171/iusa_75x75.98780171_9ox6.jpg?version=0"}
                              alt=""
                              style={{ width: "50px", height: "50px", borderRadius: "4px" }}
                            />
                          </Typography>
                          <Typography component="div" sx={{ paddingLeft: { lg: 2, md: 2, xs: 0 } }}>
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
                                {removeHtmlTags(item?.name || "") || "925 Sterling Silver Spinner Ring for Woman Girls"}
                              </Link>
                            </Typography>
                            <Typography
                              component="div"
                              sx={{
                                fontSize: "15px",
                                fontWeight: "500",
                                color: "#000",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              ${item?.sale_price}
                            </Typography>
                            {item?.isCombination && (
                              <>
                                {item?.variantData?.map((variant, index) => (
                                  <Typography
                                    fontSize={14}
                                    fontWeight={500}
                                    color={"#000"}
                                    key={`variant-${itemIndex}-${index}`}
                                  >
                                    {variant?.variant_name}:{" "}
                                    <Typography component="span" fontWeight={400}>
                                      {item?.variantAttributeData?.[index]?.attribute_value || "N/A"}
                                    </Typography>
                                  </Typography>
                                ))}
                              </>
                            )}
                            {item?.variants && item?.variants?.length > 0 && (
                              <>
                                {item?.variants?.map((variant, index) => (
                                  <Typography
                                    fontSize={14}
                                    fontWeight={500}
                                    color={"#000"}
                                    key={`variant-${itemIndex}-${index}`}
                                  >
                                    {variant?.variantName}:{" "}
                                    <Typography component="span" fontWeight={400}>
                                      {variant?.attributeName}
                                    </Typography>
                                  </Typography>
                                ))}
                              </>
                            )}
                            {item?.customize == "Yes" && (
                              <>
                                {item?.customizationData?.map((customItem, index) => (
                                  <div key={index}>
                                    {Object.entries(customItem).map(([key, value]) => (
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
                      ))}
                    </Box>
                  );
                })()}
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
                          return <Card key={message.id} onClick={() => {
                            const url = `/pages/message?slug=${message?.id}`
                            window.open(url, "_blank", "noopener,noreferrer");
                          }} sx={{ borderRadius: 2, boxShadow: "none", border: "1px solid #ddd", cursor: "pointer" }}>
                            <CardContent>
                              <Typography fontWeight={600}>{message?.orderId ? `Help with order #${message?.subOrderId || message?.orderId}` : `${removeHtmlTags(firstMessage?.productData?.productTitle || "")}`}</Typography>
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
                              <Typography fontWeight={500}>Order #{order.sub_order_id}</Typography>
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
                <Box sx={{ p: 1 }}>
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
                        !privateNoteExists || isEditing ?
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
                          ) : (
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

      {/* Detail Drawer - Mobile/Tablet */}
      <Drawer
        anchor="right"
        open={detailDrawerOpen}
        onClose={toggleDetailDrawer}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: { xs: "90%", sm: 400 },
            boxSizing: "border-box",
            bgcolor: "#f8f9fa",
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
          <IconButton onClick={toggleDetailDrawer}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DetailContent />
      </Drawer>
    </>
  );
};
export default Message;