// src/app/views/orders/db.js
export const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('BulkTrackingDB', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('uploads')) {
                const store = db.createObjectStore('uploads', { keyPath: 'id' });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
};

const promisifyRequest = (request) => {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const saveUploadToDB = async (upload) => {
    try {
        const db = await openDB();
        const transaction = db.transaction('uploads', 'readwrite');
        const store = transaction.objectStore('uploads');

        // Get existing uploads to maintain limit of 5
        const allUploads = await promisifyRequest(store.getAll());
        if (allUploads.length >= 5) {
            // Delete the oldest one
            const oldest = allUploads.sort((a, b) => a.timestamp - b.timestamp)[0];
            await promisifyRequest(store.delete(oldest.id));
        }

        await promisifyRequest(store.put(upload));
        return upload;
    } catch (error) {
        console.error('Error saving to IndexedDB:', error);
    }
};

export const getAllUploadsFromDB = async () => {
    try {
        const db = await openDB();
        const transaction = db.transaction('uploads', 'readonly');
        const store = transaction.objectStore('uploads');
        const uploads = await promisifyRequest(store.getAll());
        return uploads.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
        console.error('Error loading from IndexedDB:', error);
        return [];
    }
};

export const deleteUploadFromDB = async (id) => {
    try {
        const db = await openDB();
        const transaction = db.transaction('uploads', 'readwrite');
        const store = transaction.objectStore('uploads');
        await promisifyRequest(store.delete(id));
    } catch (error) {
        console.error('Error deleting from IndexedDB:', error);
    }
};

export const clearAllUploadsFromDB = async () => {
    try {
        const db = await openDB();
        const transaction = db.transaction('uploads', 'readwrite');
        const store = transaction.objectStore('uploads');
        await promisifyRequest(store.clear());
    } catch (error) {
        console.error('Error clearing IndexedDB:', error);
    }
};