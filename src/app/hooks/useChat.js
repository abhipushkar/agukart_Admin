import { useContext } from 'react';
import { ChatContext } from 'app/contexts/ChatContextAdmin';

const useChat = () => {
    const {
        demo,
        chats,
        composeChats,
        setComposeChats,
        userDetails, setUserDetails,
        moveToTrashHandler,
        handleCheckboxChange,
        checkMessage,
        moveToChatHandler,
        showCount,
        markAsUnreadHandler, markAsReadHandler,
        setCheckMessage,
        pinnedMessageHadler,
        searchHandler,
        searchText,
        setSearchText,
        getUserDetails
    } = useContext(ChatContext);


    return {
        demo,
        chats,
        composeChats,
        setComposeChats,
        userDetails, setUserDetails,
        moveToTrashHandler,
        handleCheckboxChange,
        checkMessage,
        moveToChatHandler,
        checkMessage,
        showCount,
        markAsUnreadHandler, markAsReadHandler,
        pinnedMessageHadler,
        setCheckMessage,
        searchText,
        setSearchText,
        searchHandler,
        getUserDetails
    };
};

export default useChat;