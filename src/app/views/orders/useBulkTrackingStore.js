// useBulkTrackingStore.js
import { create } from "zustand";
import {
    saveUploadToDB,
    getAllUploadsFromDB,
    deleteUploadFromDB,
    clearAllUploadsFromDB
} from "./db";

export const useBulkTrackingStore = create((set, get) => ({
    uploads: [],

    addUpload: async (upload) => {
        // Ensure upload has timestamp
        const uploadWithTimestamp = {
            ...upload,
            timestamp: upload.timestamp || Date.now()
        };

        // Save to IndexedDB
        await saveUploadToDB(uploadWithTimestamp);

        // Update state
        set((state) => {
            const newUploads = [uploadWithTimestamp, ...state.uploads]
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 5);
            return { uploads: newUploads };
        });
    },

    removeUpload: async (id) => {
        await deleteUploadFromDB(id);
        set((state) => ({
            uploads: state.uploads.filter(u => u.id !== id)
        }));
    },

    clearUploads: async () => {
        await clearAllUploadsFromDB();
        set({ uploads: [] });
    },

    loadUploads: async () => {
        const savedUploads = await getAllUploadsFromDB();
        set({ uploads: savedUploads });
    }
}));