import React, { createContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../firebase/Firebase";

import { collection, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, startAfter, updateDoc, where } from "firebase/firestore";
import { useProfileData } from "./profileContext";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { ApiService } from "app/services/ApiService";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState([]);
    const [composeChats, setComposeChats] = useState([]);
    const [checkMessage, setCheckMessage] = useState([]);
    const [userDetails, setUserDetails] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [showCount, setShowCount] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [totalCount, setTotalCount] = useState(0);
    const [lastVisible, setLastVisible] = useState(null);
    const [firstVisible, setFirstVisible] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { logUserData } = useProfileData();

    const navigate = useNavigate();

    const { pathname } = useLocation();

    const designationId = localStorage.getItem("designation_id");

    useEffect(() => {
        if (!logUserData || !logUserData?._id) {
            console.log("⏳ Waiting for user data...", { logUserData });
            setIsLoading(false);
            return;
        }

        console.log("🔄 Vendor Chat Effect Running:", {
            userId: logUserData._id,
            designationId,
            pathname,
            page,
            rowsPerPage,
            lastVisible: lastVisible ? lastVisible.id : "null"
        });

        // setCheckMessage([]);
        if (searchText) return;
        let unsubscribe = undefined;
        let unsubscribeforvendor = undefined;
        if (designationId === "2") {
            const getTotalCount = async () => {
                const q = query(collection(db, "chatRooms"));
                const snapshot = await getDocs(q);
                setTotalCount(snapshot.docs.length);
                return snapshot.docs.length;
            };
            getTotalCount();

            let q = query(
                collection(db, "chatRooms"),
                orderBy("currentTime", "desc"),
                limit(rowsPerPage)
            );

            if (page > 0 && lastVisible) {
                q = query(
                    collection(db, "chatRooms"),
                    orderBy("currentTime", "desc"),
                    startAfter(lastVisible),
                    limit(rowsPerPage)
                );
            }

            unsubscribe = onSnapshot(q, (snapshot) => {
                const newMessages = snapshot?.docs?.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
                if (snapshot.docs.length > 0) {
                    setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
                }
                const userIds = newMessages?.map((chat) => chat?.user);
                getUsersDetails(userIds);
                let matchingDocument = newMessages;
                if (pathname === ROUTE_CONSTANT.messageRoute.pin) {
                    const filterPinned = matchingDocument.filter((doc) => {
                        return doc.pinnedMsgAdmin === logUserData?._id && doc?.isTempDelete2 !== logUserData?._id;
                    });
                    setChats(filterPinned)
                    return;
                }


                console.log({ matchingDocument });
                if (pathname === ROUTE_CONSTANT.message) {
                    const isDeletefilterData = matchingDocument.filter(
                        (item) => item?.isTempDelete2 !== logUserData?._id
                    );
                    setChats(isDeletefilterData);
                    return;
                }

                if (pathname === ROUTE_CONSTANT.messageRoute.inbox) {
                    const isDeletefilterData = matchingDocument.filter(
                        (item) => item?.isTempDelete2 !== logUserData?._id
                    );

                    const filteredData = isDeletefilterData?.filter((item) =>
                        item.text.some((msg) => msg.messageSenderId !== logUserData?._id)
                    );
                    setChats(filteredData);
                    return;
                }
                if (pathname === ROUTE_CONSTANT.messageRoute.unread) {
                    const filteredData = matchingDocument?.filter((item) =>
                        item.text.some(
                            (msg) => msg.messageSenderId !== logUserData?._id && msg?.isNotification === false
                        )
                    );
                    setChats(filteredData);
                    return;
                }

                if (pathname === ROUTE_CONSTANT.messageRoute.trash) {
                    const isDeletefilterData = matchingDocument.filter(
                        (item) => item.isTempDelete2 === logUserData?._id
                    );
                    setChats(isDeletefilterData);
                }
                setIsLoading(false);
            });
            const qforvendor = query(
                collection(db, "composeChat"),
                orderBy("currentTime", "desc")
            );
            unsubscribeforvendor = onSnapshot(qforvendor, (snapshot) => {
                const newMessages = snapshot?.docs?.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));

                if (pathname === ROUTE_CONSTANT.messageRoute.composeMessage) {
                    setComposeChats(newMessages);
                }
            });

        } else {
            console.log("🛒 Vendor designation detected");

            const getTotalCount = async () => {
                try {
                    console.log("📊 Getting total count for vendor...");
                    const q = query(
                        collection(db, "chatRooms"),
                        where("receiverId", "==", logUserData?._id)
                    );
                    const snapshot = await getDocs(q);
                    const total = snapshot.docs.length;
                    console.log("📊 Total vendor chats count:", total);
                    setTotalCount(total);
                    return total;
                } catch (error) {
                    console.error("❌ Error getting total count:", error);
                    setTotalCount(0);
                    return 0;
                }
            };
            getTotalCount();

            console.log("📄 Building vendor query with:", {
                receiverId: logUserData?._id,
                limit: rowsPerPage,
                page,
                hasLastVisible: !!lastVisible
            });

            let q = query(
                collection(db, "chatRooms"),
                where("receiverId", "==", logUserData?._id),
                orderBy("currentTime", "desc"),
                limit(rowsPerPage)
            );

            if (page > 0 && lastVisible) {
                console.log("📄 Using pagination - page:", page, "after:", lastVisible.id);
                q = query(
                    collection(db, "chatRooms"),
                    where("receiverId", "==", logUserData?._id),
                    orderBy("currentTime", "desc"),
                    startAfter(lastVisible),
                    limit(rowsPerPage)
                );
            }

            unsubscribe = onSnapshot(q, (snapshot) => {
                console.log("📩 Snapshot received. Docs count:", snapshot.docs.length);

                if (snapshot.docs.length > 0) {
                    const last = snapshot.docs[snapshot.docs.length - 1];
                    console.log("📌 Setting lastVisible:", last.id);
                    setLastVisible(last);
                } else {
                    console.log("⚠️ No documents in snapshot");
                }

                const newMessages = snapshot?.docs?.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));

                console.log("📝 Raw messages from query:", newMessages.length);
                console.log("📝 First message sample:", newMessages[0]);

                // Debug: Check if any messages match the receiverId
                const matchingReceiver = newMessages.filter(doc => doc.receiverId === logUserData?._id);
                console.log(`📝 Messages with receiverId ${logUserData?._id}:`, matchingReceiver.length);

                const userIds = newMessages?.map((chat) => chat?.user);
                if (userIds && userIds.length > 0) {
                    console.log("👤 User IDs found:", userIds);
                    getUsersDetails(userIds);
                }

                let matchingDocument = newMessages?.filter((doc) => {
                    const isMatch = doc?.receiverId === logUserData?._id;
                    console.log(`🔍 Doc ${doc.id}: receiverId=${doc?.receiverId}, match=${isMatch}`);
                    return isMatch;
                });

                console.log("👤 After receiver filter:", matchingDocument.length);

                if (pathname === ROUTE_CONSTANT.messageRoute.pin) {
                    console.log("📌 Filtering pinned messages...");
                    const filterPinned = matchingDocument.filter((doc) => {
                        return doc.pinnedMsgAdmin === logUserData?._id && doc?.isTempDelete2 !== logUserData?._id;
                    });
                    console.log("📌 Pinned count:", filterPinned.length);
                    setChats(filterPinned)
                    return;
                }

                console.log("📍 Pathname:", pathname);
                console.log("📍 ROUTE_CONSTANT.message:", ROUTE_CONSTANT.message);

                let filteredData = [];
                if (pathname === ROUTE_CONSTANT.message) {
                    console.log("📂 Filtering for 'message' route...");
                    const isDeletefilterData = matchingDocument.filter(
                        (item) => item?.isTempDelete2 !== logUserData?._id
                    );
                    console.log("📂 After delete filter:", isDeletefilterData.length);
                    setChats(isDeletefilterData);
                    return;
                }

                if (pathname === ROUTE_CONSTANT.messageRoute.inbox) {
                    console.log("📂 Filtering for 'inbox' route...");
                    const isDeletefilterData = matchingDocument.filter(
                        (item) => item?.isTempDelete2 !== logUserData?._id
                    );
                    console.log("📂 After delete filter:", isDeletefilterData.length);

                    const filteredData = isDeletefilterData?.filter((item) =>
                        item.text.some((msg) => msg.messageSenderId !== logUserData?._id)
                    );
                    console.log("📂 After inbox filter:", filteredData.length);
                    setChats(filteredData);
                    return;
                }

                if (pathname === ROUTE_CONSTANT.messageRoute.sent) {
                    console.log("📂 Filtering for 'sent' route...");
                    const isDeletefilterData = matchingDocument.filter(
                        (item) => item?.isTempDelete2 !== logUserData?._id
                    );

                    const filteredData = isDeletefilterData?.filter((item) =>
                        item.text.some((msg) => msg.messageSenderId === logUserData?._id)
                    );
                    console.log("📂 Sent messages count:", filteredData.length);
                    setChats(filteredData);
                    return;
                }

                if (pathname === ROUTE_CONSTANT.messageRoute.unread) {
                    console.log("📂 Filtering for 'unread' route...");
                    const filteredData = matchingDocument?.filter((item) =>
                        item.text.some(
                            (msg) => msg.messageSenderId !== logUserData?._id && msg?.isNotification === false
                        )
                    );
                    console.log("📂 Unread messages count:", filteredData.length);
                    setChats(filteredData);
                    return;
                }

                if (pathname === ROUTE_CONSTANT.messageRoute.trash) {
                    console.log("📂 Filtering for 'trash' route...");
                    const isDeletefilterData = matchingDocument.filter(
                        (item) => item.isTempDelete2 === logUserData?._id
                    );
                    console.log("📂 Trash messages count:", isDeletefilterData.length);
                    setChats(isDeletefilterData);
                }

                console.log("✅ Final filtered data count:", filteredData.length);
                setChats(filteredData);
                setIsLoading(false);
            }, (error) => {
                console.error("🔥 Snapshot error:", error);
                console.error("🔥 Error code:", error.code);
                console.error("🔥 Error message:", error.message);
                setIsLoading(false);
            });
            const qforvendor = query(
                collection(db, "composeChat"),
                orderBy("currentTime", "desc")
            );
            unsubscribeforvendor = onSnapshot(qforvendor, (snapshot) => {
                const newMessages = snapshot?.docs?.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));

                if (pathname === ROUTE_CONSTANT.messageRoute.fromEtsy) {
                    const filterData = newMessages.filter((item) => item.type === "allvendors");
                    setChats(filterData);
                }

                if (pathname === ROUTE_CONSTANT.messageRoute.composeMessage) {
                    const filtered = newMessages.filter((doc) => {
                        if (doc.type !== "allusers") return false;

                        if (!doc.userCreatedBefore || !logUserData?.createdAt) return false;

                        const userCreatedAt = new Date(logUserData.createdAt);
                        const cutoff = doc.userCreatedBefore.toDate();

                        // SNAPSHOT → OLD USERS
                        if (doc.audienceMode === "snapshot") {
                            return userCreatedAt <= cutoff;
                        }

                        // PERSISTENT → NEW USERS ONLY
                        if (doc.audienceMode === "persistent") {
                            return userCreatedAt > cutoff;
                        }

                        return false;
                    });

                    setComposeChats(filtered);
                }

            });

        }
        return () => {
            unsubscribe();
            unsubscribeforvendor();
        };
    }, [logUserData?._id, pathname, searchText, page, rowsPerPage]);



    useEffect(() => {
        setSearchText("");
    }, [pathname]);

    const getUsersDetails = async (userIds) => {
        const payload = {
            userId: userIds
        };

        try {
            const auth_key = localStorage.getItem(localStorageKey.auth_key);
            const res = await ApiService.login(apiEndpoints.getUserDetialsChat, payload, auth_key);
            if (res.status === 200) {
                setUserDetails(res?.data?.data); // Assuming res.data is the array of user details
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getUserDetails = async (id) => {
        const payload = {
            userId: [id]
        };
        try {
            const auth_key = localStorage.getItem(localStorageKey.auth_key);
            const res = await ApiService.login(apiEndpoints.getUserDetialsChat, payload, auth_key);
            if (res.status === 200) {
                return res?.data?.data[0];
            }
        } catch (error) {
            console.log(error);
        }
    };

    const moveToTrashHandler = async () => {
        if (!checkMessage.length) {
            return;
        }

        checkMessage.map(async (docId) => {
            try {
                const docRef = doc(db, "chatRooms", docId);
                await updateDoc(docRef, {
                    isTempDelete2: logUserData?._id
                });
                setCheckMessage([]);
            } catch (error) {
                console.error("Error updating document: ", error);
            }
        });
    };

    const handleCheckboxChange = (event, id) => {
        if (event.target.checked) {
            setCheckMessage([...checkMessage, id]);
        } else {
            setCheckMessage(checkMessage.filter((rowId) => rowId !== id));
        }
    };

    const moveToChatHandler = () => {
        if (!checkMessage.length) {
            return;
        }

        checkMessage.map(async (docId) => {
            try {
                const docRef = doc(db, "chatRooms", docId);
                await updateDoc(docRef, {
                    isTempDelete2: ""
                });
                setCheckMessage([]);
            } catch (error) {
                console.error("Error updating document: ", error);
            }
        });
    };

    useEffect(() => {
        if (pathname === ROUTE_CONSTANT.messageRoute.pin) {
            return;
        }
        if (chats.length > 0) {
            const count = chats?.filter((parent) =>
                parent?.text?.some(
                    (notification) =>
                        !notification?.isNotification &&
                        notification.messageSenderId !== logUserData?._id &&
                        notification.senderType === "user" // Only count unread from user
                )
            ).length;
            setShowCount(count);
        }
    }, [chats, pathname]);

    const markAsUnreadHandler = () => {
        checkMessage.map(async (docId) => {
            try {
                const docRef = doc(
                    db,
                    pathname === "/messages/etsy" ? "composeChat" : "chatRooms",
                    docId,
                );
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    navigate(ROUTE_CONSTANT.messages);
                    const myDoc = docSnap.data();
                    const existingText = myDoc.text || [];

                    // For admin: find user messages (not admin)
                    const isUser = (msg) => msg.senderType === "user";

                    // Find the last batch of user messages
                    let lastBatchIndex = -1;
                    for (let i = existingText.length - 1; i >= 0; i--) {
                        if (isUser(existingText[i])) {
                            if (lastBatchIndex === -1) {
                                lastBatchIndex = i;
                            }
                        } else {
                            // Stop when we hit admin's own message
                            if (lastBatchIndex !== -1) break;
                        }
                    }

                    if (lastBatchIndex === -1) {
                        setCheckMessage([]);
                        return;
                    }

                    // Find the start of the batch
                    let batchStart = lastBatchIndex;
                    for (let i = lastBatchIndex - 1; i >= 0; i--) {
                        if (isUser(existingText[i])) {
                            batchStart = i;
                        } else {
                            break;
                        }
                    }

                    // Update ONLY the last batch of user messages
                    const updateArr = existingText.map((msg, index) => {
                        if (index >= batchStart && isUser(msg)) {
                            return {
                                ...msg,
                                isNotification: false // Only admin sees this as unread
                            };
                        }
                        return msg;
                    });

                    await updateDoc(
                        doc(
                            db,
                            pathname === "/messages/etsy" ? "composeChat" : "chatRooms",
                            docId,
                        ),
                        {
                            text: updateArr,
                        },
                    );
                }
                setCheckMessage([]);
            } catch (error) {
                console.error("Error getting document:", error);
                throw error;
            }
        });
    };

    const markAsReadHandler = () => {
        checkMessage.map(async (docId) => {
            try {
                const docRef = doc(db, "chatRooms", docId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const myDoc = docSnap.data();

                    const updateArr = myDoc.text.map((msg) => {
                        // Only mark user messages as read
                        if (
                            msg.messageSenderId !== logUserData?._id &&
                            msg.senderType === "user"
                        ) {
                            return { ...msg, isNotification: true };
                        }
                        return msg;
                    });

                    await updateDoc(doc(db, "chatRooms", docId), {
                        text: updateArr,
                    });
                }
                setCheckMessage([]);
            } catch (error) {
                console.error("Error getting document:", error);
                throw error;
            }
        });
    };

    const pinnedMessageHadler = async (docId) => {
        try {
            const docRef = doc(db, "chatRooms", docId);

            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const docData = docSnap.data();
                if (docData?.pinnedMsgAdmin) {
                    await updateDoc(docRef, {
                        pinnedMsgAdmin: ""
                    });
                } else {
                    await updateDoc(docRef, {
                        pinnedMsgAdmin: logUserData?._id
                    });
                }
            }
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };


    // search chat 

    const searchHandler = async () => {
        console.log("🔍 Search initiated with text:", searchText);

        if (!searchText || searchText.trim() === "") {
            console.log("📭 Search text is empty, resetting...");
            // Reset to original paginated chats
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const searchTerm = searchText.toLowerCase().trim();
        console.log("🔍 Search term after cleanup:", searchTerm);

        try {
            console.log("📊 Fetching ALL chats from Firestore for search...");

            // 🔥 FIX: Don't use where for admin - fetch ALL chats
            // For vendors, use where, for admins fetch everything
            let q;
            if (designationId === "2") {
                // Admin - fetch all chats
                q = query(
                    collection(db, "chatRooms"),
                    orderBy("currentTime", "desc")
                );
                console.log("👤 Admin mode: Fetching ALL chats");
            } else {
                // Vendor - fetch only their chats
                q = query(
                    collection(db, "chatRooms"),
                    where("receiverId", "==", logUserData?._id),
                    orderBy("currentTime", "desc")
                );
                console.log("🛒 Vendor mode: Fetching chats for:", logUserData?._id);
            }

            const snapshot = await getDocs(q);
            console.log(`📊 Total chats fetched from Firestore: ${snapshot.docs.length}`);

            const allChats = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log(`📝 Total chats processed: ${allChats.length}`);

            // Log sample of what we're searching
            if (allChats.length > 0) {
                console.log("📋 Sample chat fields:", Object.keys(allChats[0]));
                console.log("📋 Sample chat data:", {
                    userName: allChats[0]?.userName,
                    shopName: allChats[0]?.shopName,
                    receiverId: allChats[0]?.receiverId,
                    user: allChats[0]?.user,
                });
            }

            // Filter all chats
            console.log("🔍 Starting search filter...");
            let matchCount = 0;

            const filteredArr = allChats.filter((item) => {
                const containsSearch = (value, fieldName = 'unknown') => {
                    if (!value) return false;
                    const hasMatch = String(value).toLowerCase().includes(searchTerm);
                    if (hasMatch) {
                        console.log(`✅ Match found in field '${fieldName}':`, value);
                    }
                    return hasMatch;
                };

                // Check all fields
                if (containsSearch(item?.userName, 'userName')) {
                    matchCount++;
                    return true;
                }
                if (containsSearch(item?.shopName, 'shopName')) {
                    matchCount++;
                    return true;
                }
                if (containsSearch(item?.userEmail, 'userEmail')) {
                    matchCount++;
                    return true;
                }
                if (containsSearch(item?.customerId, 'customerId')) {
                    matchCount++;
                    return true;
                }
                if (containsSearch(item?.subOrderId, 'subOrderId')) {
                    matchCount++;
                    return true;
                }
                if (containsSearch(item?.orderId, 'orderId')) {
                    matchCount++;
                    return true;
                }
                if (containsSearch(item?.vendorName, 'vendorName')) {
                    matchCount++;
                    return true;
                }

                // Check messages
                if (item?.text && Array.isArray(item.text)) {
                    const hasMatchingText = item.text.some((t, index) => {
                        if (containsSearch(t?.text, `text[${index}]`)) return true;
                        if (t?.productData?.productTitle && containsSearch(t.productData.productTitle, `productTitle[${index}]`)) return true;
                        if (t?.productData?.productName && containsSearch(t.productData.productName, `productName[${index}]`)) return true;
                        if (containsSearch(t?.shopLink, `shopLink[${index}]`)) return true;
                        if (containsSearch(t?.productLink, `productLink[${index}]`)) return true;
                        return false;
                    });
                    if (hasMatchingText) {
                        matchCount++;
                        console.log(`✅ Match found in messages for chat: ${item.id}`);
                        return true;
                    }
                }

                return false;
            });

            console.log(`✅ Search complete. Found ${filteredArr.length} matching chats out of ${allChats.length}`);
            console.log(`📊 Match breakdown: ${matchCount} matches found`);

            if (filteredArr.length > 0) {
                console.log("📝 Matched chat IDs:", filteredArr.map(c => c.id));
            } else {
                console.log("❌ No matches found for search term:", searchTerm);
            }

            setChats(filteredArr);
            setTotalCount(filteredArr.length);
            setPage(0);
            console.log("📊 State updated: chats count =", filteredArr.length, ", totalCount =", filteredArr.length);
            setIsLoading(false);

        } catch (error) {
            console.error("❌ Search error:", error);
            console.error("❌ Error details:", {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
            setIsLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        if (newPage === 0) {
            setLastVisible(null);
        }
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        setLastVisible(null);
    };

    return (
        <ChatContext.Provider
            value={{
                chats,
                setChats,
                composeChats,
                setComposeChats,
                userDetails,
                setUserDetails,
                moveToTrashHandler,
                handleCheckboxChange,
                checkMessage,
                moveToChatHandler,
                showCount,
                markAsUnreadHandler,
                markAsReadHandler,
                setCheckMessage,
                pinnedMessageHadler,
                searchHandler,
                searchText,
                setSearchText,
                getUserDetails,
                page,
                setPage,
                rowsPerPage,
                setRowsPerPage,
                totalCount,
                setTotalCount,
                handleChangePage,
                handleChangeRowsPerPage,
                isLoading,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
