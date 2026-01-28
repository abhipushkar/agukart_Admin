import React, { createContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../../firebase/Firebase";

import { collection, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { useProfileData } from "./profileContext";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { ApiService } from "app/services/ApiService";
export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState([]);
    const [composeChats, setComposeChats] = useState([]);
    const [checkMessage, setCheckMessage] = useState([]);
    const [userDetails, setUserDetails] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [showCount, setShowCount] = useState(0);

    const { logUserData } = useProfileData();

    const { pathname } = useLocation();

    console.log({ pathname, chats }, "jdjfuikkivkvvk");

    const designationId = localStorage.getItem("designation_id");

    useEffect(() => {
        // setCheckMessage([]);
        if (searchText) return;
        let unsubscribe = undefined;
        let unsubscribeforvendor = undefined;
        if (designationId === "2") {
            const q = query(
                collection(db, "chatRooms"),
                orderBy("currentTime", "desc")
            );

            unsubscribe = onSnapshot(q, (snapshot) => {
                const newMessages = snapshot?.docs?.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
                const userIds = newMessages?.map((chat) => chat?.user);
                getUsersDetails(userIds);
                let matchingDocument = newMessages;
                if (pathname === "/pages/message/pin") {
                    const filterPinned = matchingDocument.filter((doc) => {
                        return doc.pinnedMsgAdmin === logUserData?._id && doc?.isTempDelete2 !== logUserData?._id;
                    });
                    setChats(filterPinned)
                    return;
                }


                console.log({ matchingDocument });
                if (pathname === "/pages/message") {
                    const isDeletefilterData = matchingDocument.filter(
                        (item) => item?.isTempDelete2 !== logUserData?._id
                    );
                    setChats(isDeletefilterData);
                    return;
                }

                if (pathname === "/pages/message/inbox") {
                    const isDeletefilterData = matchingDocument.filter(
                        (item) => item?.isTempDelete2 !== logUserData?._id
                    );

                    const filteredData = isDeletefilterData?.filter((item) =>
                        item.text.some((msg) => msg.messageSenderId !== logUserData?._id)
                    );
                    setChats(filteredData);
                    return;
                }
                if (pathname === "/pages/message/unread") {
                    const filteredData = matchingDocument?.filter((item) =>
                        item.text.some(
                            (msg) => msg.messageSenderId !== logUserData?._id && msg?.isNotification === false
                        )
                    );
                    setChats(filteredData);
                    return;
                }

                if (pathname === "/pages/message/trash") {
                    const isDeletefilterData = matchingDocument.filter(
                        (item) => item.isTempDelete2 === logUserData?._id
                    );
                    setChats(isDeletefilterData);
                }
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

                if (pathname === "/pages/message/compose/message") {
                    const filtered = newMessages.filter((doc) => doc.type === "allvendors");
                    setComposeChats(filtered);
                }
            });

        } else {
            const q = query(
                collection(db, "chatRooms"),
                orderBy("currentTime", "desc")
            );
            unsubscribe = onSnapshot(q, (snapshot) => {
                const newMessages = snapshot?.docs?.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const userIds = newMessages?.map((chat) => chat?.user);
                getUsersDetails(userIds);

                let matchingDocument = newMessages?.filter((doc) => {
                    return doc?.receiverId === logUserData?._id;
                });


                if (pathname === "/pages/message/pin") {
                    const filterPinned = matchingDocument.filter((doc) => {
                        return doc.pinnedMsgAdmin === logUserData?._id && doc?.isTempDelete2 !== logUserData?._id;
                    });
                    setChats(filterPinned)
                    return;
                }


                console.log({ matchingDocument });
                if (pathname === "/pages/message") {
                    const isDeletefilterData = matchingDocument.filter(
                        (item) => item?.isTempDelete2 !== logUserData?._id
                    );
                    setChats(isDeletefilterData);
                    return;
                }

                if (pathname === "/pages/message/inbox") {
                    const isDeletefilterData = matchingDocument.filter(
                        (item) => item?.isTempDelete2 !== logUserData?._id
                    );

                    const filteredData = isDeletefilterData?.filter((item) =>
                        item.text.some((msg) => msg.messageSenderId !== logUserData?._id)
                    );
                    setChats(filteredData);
                    return;
                }

                if (pathname === "/pages/message/sent") {
                    const isDeletefilterData = matchingDocument.filter(
                        (item) => item?.isTempDelete2 !== logUserData?._id
                    );

                    const filteredData = isDeletefilterData?.filter((item) =>
                        item.text.some((msg) => msg.messageSenderId === logUserData?._id)
                    );

                    console.log(matchingDocument, "hiiiiiiiiiiiiiiiiiii");
                    setChats(filteredData);
                    return;
                }

                // console.log("uuuuuuuuuuuuuuuu")

                if (pathname === "/pages/message/unread") {
                    const filteredData = matchingDocument?.filter((item) =>
                        item.text.some(
                            (msg) => msg.messageSenderId !== logUserData?._id && msg?.isNotification === false
                        )
                    );
                    setChats(filteredData);
                    return;
                }

                if (pathname === "/pages/message/trash") {
                    const isDeletefilterData = matchingDocument.filter(
                        (item) => item.isTempDelete2 === logUserData?._id
                    );
                    setChats(isDeletefilterData);
                }
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

                if (pathname === "/pages/message/etsy") {
                    const filterData = newMessages.filter((item) => item.type === "allvendors");
                    setChats(filterData);
                }

                if (pathname === "/pages/message/compose/message") {
                    const filtered = newMessages.filter((doc) => {
                        if (doc.type !== "allusers") return false;

                        if (doc.audienceMode === "persistent") return true;

                        if (doc.audienceMode === "snapshot") {
                            if (!doc.userCreatedBefore || !logUserData?.createdAt) return false;
                            return new Date(logUserData.createdAt) <= doc.userCreatedBefore.toDate();
                        }

                        return true;
                    });

                    setComposeChats(filtered);
                }
            });

        }
        return () => {
            unsubscribe();
            unsubscribeforvendor();
        };
    }, [logUserData?._id, pathname, searchText]);



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

        if (pathname === "/pages/message/pin") {
            return
        }
        if (chats.length > 0) {
            const count = chats?.filter((parent) =>
                parent?.text?.some(
                    (notification) =>
                        !notification?.isNotification && notification.messageSenderId !== logUserData?._id
                )
            ).length;
            setShowCount(count);
        }
    }, [chats, pathname]);

    const markAsUnreadHandler = () => {
        checkMessage.map(async (docId) => {
            try {
                const docRef = doc(db, "chatRooms", docId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const myDoc = docSnap.data();
                    const updateArr = myDoc.text.map((msg) => {
                        if (msg.messageSenderId !== logUserData?._id) {
                            return { ...msg, isNotification: false };
                        }
                        return msg;
                    });

                    await updateDoc(doc(db, "chatRooms", docId), {
                        text: updateArr
                    });
                }
                setCheckMessage([]);
            } catch (error) {
                console.error("Error getting document:", error);
                throw error; // Handle the error as needed
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
                        if (msg.messageSenderId !== logUserData?._id) {
                            return { ...msg, isNotification: true };
                        }
                        return msg;
                    });

                    await updateDoc(doc(db, "chatRooms", docId), {
                        text: updateArr
                    });
                }
                setCheckMessage([]);
            } catch (error) {
                console.error("Error getting document:", error);
                throw error; // Handle the error as needed
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

    const searchHandler = () => {
        const filteredArr = chats.filter((item) => {
            if (item?.userName?.includes(searchText)) {
                return true;
            }
            return item.text.some((t) => t.text?.includes(searchText));
        });

        setChats(filteredArr);
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
                getUserDetails
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
