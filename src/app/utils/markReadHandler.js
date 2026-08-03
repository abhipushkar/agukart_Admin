import { db } from "../../firebase/Firebase";
import { updateDoc, doc } from "firebase/firestore";

export const markIncomingUserMessagesAsRead = async ({
    chatId,
    messages = []
}) => {
    if (!chatId || !messages.length) return;

    if (
        typeof document !== "undefined" &&
        document.visibilityState !== "visible"
    ) {
        return;
    }

    const hasUnread = messages.some(
        msg =>
            msg.senderType === "user" &&
            msg.isNotification === false
    );

    if (!hasUnread) return;

    const updatedText = messages.map(msg => {
        if (
            msg.senderType === "user" &&
            msg.isNotification === false
        ) {
            return {
                ...msg,
                isNotification: true
            };
        }

        return msg;
    });

    await updateDoc(doc(db, "chatRooms", chatId), {
        text: updatedText
    });
};