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
    };
};

export default useChat;