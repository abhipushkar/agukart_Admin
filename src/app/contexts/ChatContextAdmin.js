import React, { createContext, useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../firebase/Firebase";

import { collection, doc, getCountFromServer, getDoc, getDocs, limit, onSnapshot, orderBy, query, startAfter, updateDoc, where } from "firebase/firestore";
import { useProfileData } from "./profileContext";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { ApiService } from "app/services/ApiService";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState([]);
    const [allChats, setAllChats] = useState([]);
    const [allComposeChats, setAllComposeChats] = useState([]);
    const [checkMessage, setCheckMessage] = useState([]);
    const [userDetails, setUserDetails] = useState([]);
    const [userDetailsMap, setUserDetailsMap] = useState({});
    const [searchText, setSearchText] = useState("");
    const [showCount, setShowCount] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
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
        if (designationId === "2") {
            const getTotalCount = async () => {
                const q = query(collection(db, "chatRooms"));
                const snapshot = await getCountFromServer(q);
                setTotalCount(snapshot.data().count);
                return snapshot.data().count;
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
                const userIds = [...new Set(newMessages.map(chat => chat.user).filter(Boolean))];
                getUsersDetails(userIds);
                setAllChats(newMessages);

                setIsLoading(false);
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
                    const snapshot = await getCountFromServer(q);
                    setTotalCount(snapshot.data().count);
                    return snapshot.data().count;
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


                const userIds = [...new Set(newMessages.map(chat => chat.user).filter(Boolean))];
                getUsersDetails(userIds);

                setAllChats(newMessages);
                setIsLoading(false);
            }, (error) => {
                console.error("🔥 Snapshot error:", error);
                console.error("🔥 Error code:", error.code);
                console.error("🔥 Error message:", error.message);
                setIsLoading(false);
            });

        }
        return () => {
            unsubscribe();
        };
    }, [logUserData?._id, page, designationId, rowsPerPage]);



    useEffect(() => {
        setSearchText("");
    }, [pathname]);

    const getUsersDetails = async (userIds = []) => {
        const uniqueIds = [...new Set(userIds.filter(Boolean))];
        const missingIds = uniqueIds.filter(id => !userDetailsMap[id]);
        if (!missingIds.length) return;
        try {
            const auth_key = localStorage.getItem(localStorageKey.auth_key);
            const res = await ApiService.login(
                apiEndpoints.getUserDetialsChat,
                {
                    userId: missingIds
                },
                auth_key
            );

            if (res.status === 200) {
                const users = res?.data?.data || [];

                setUserDetailsMap(prev => {
                    const updated = { ...prev };

                    users.forEach(user => {
                        updated[user._id] = user;
                    });

                    return updated;
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getUserDetails = async (id) => {
        if (!id) return null;
        if (userDetailsMap[id]) {
            return userDetailsMap[id];
        }
        await getUsersDetails([id]);
        return userDetailsMap[id];
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

    const unreadCount = useMemo(() => {
        return allChats.filter(parent =>
            parent.text.some(msg =>
                !msg.isNotification &&
                msg.messageSenderId !== logUserData?._id &&
                msg.senderType === "user"
            )
        ).length;
    }, [allChats, logUserData?._id]);

    useEffect(() => {
        setShowCount(unreadCount);
    }, [unreadCount]);


    const filteredChats = useMemo(() => {

        if (!allChats.length) return [];
        if (pathname === ROUTE_CONSTANT.messageRoute.pin) {
            return allChats.filter(item =>
                item.pinnedMsgAdmin === logUserData?._id &&
                item.isTempDelete2 !== logUserData?._id
            );
        }
        if (pathname === ROUTE_CONSTANT.message) {
            return allChats.filter(item =>
                item.isTempDelete2 !== logUserData?._id
            );
        }
        if (pathname === ROUTE_CONSTANT.messageRoute.inbox) {
            return allChats
                .filter(item => item.isTempDelete2 !== logUserData?._id)
                .filter(item =>
                    item.text.some(msg =>
                        msg.messageSenderId !== logUserData?._id
                    )
                );
        }
        // sent route for vendor only
        if (pathname === ROUTE_CONSTANT.messageRoute.sent) {
            return allChats
                .filter(item => item.isTempDelete2 !== logUserData?._id)
                .filter(item =>
                    item.text.some(msg =>
                        msg.messageSenderId === logUserData?._id
                    )
                );
        }
        if (pathname === ROUTE_CONSTANT.messageRoute.unread) {
            return allChats.filter(item =>
                item.text.some(msg =>
                    msg.messageSenderId !== logUserData?._id &&
                    !msg.isNotification
                )
            );
        }
        if (pathname === ROUTE_CONSTANT.messageRoute.trash) {
            return allChats.filter(item =>
                item.isTempDelete2 === logUserData?._id
            );
        }
        return allChats;

    }, [
        allChats,
        pathname,
        logUserData?._id
    ]);

    useEffect(() => {
        setChats(filteredChats);
    }, [filteredChats]);


    useEffect(() => {
        const q = query(
            collection(db, "composeChat"),
            orderBy("currentTime", "desc")
        );
        const unsubscribe = onSnapshot(q, snapshot => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAllComposeChats(data);
        });
        return unsubscribe;
    }, []);


    const composeChats = useMemo(() => {

        if (!allComposeChats.length) return [];

        if (designationId === "2") {
            if (pathname === ROUTE_CONSTANT.messageRoute.composeMessage) {
                return allComposeChats;
            }
            return [];
        }
        if (pathname === ROUTE_CONSTANT.messageRoute.fromEtsy) {
            return allComposeChats.filter(
                item => item.type === "allvendors"
            );
        }
        if (pathname === ROUTE_CONSTANT.messageRoute.composeMessage) {
            return allComposeChats.filter(doc => {
                if (doc.type !== "allusers") return false;
                if (!doc.userCreatedBefore || !logUserData?.createdAt)
                    return false;
                const userCreatedAt = new Date(logUserData.createdAt);
                const cutoff = doc.userCreatedBefore.toDate();

                if (doc.audienceMode === "snapshot")
                    return userCreatedAt <= cutoff;

                if (doc.audienceMode === "persistent")
                    return userCreatedAt > cutoff;

                return false;
            });
        }
        return [];
    }, [allComposeChats, pathname, designationId, logUserData?.createdAt]);

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
                allChats,
                composeChats,
                userDetails,
                userDetailsMap,
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
