import { ApiService } from "app/services/ApiService";

export const uploadChatFiles = async ({
    files,
    token,
    addToast,
}) => {
    if (!files?.length) {
        return [];
    }

    const formData = new FormData();

    files.forEach((file) => {
        formData.append("files", file);
    });

    const res = await ApiService.postImage(
        "chat/upload",
        formData,
        token,
        true
    );

    if (!res?.data?.success) {
        throw new Error("File upload failed");
    }

    return res.data.files || [];
};