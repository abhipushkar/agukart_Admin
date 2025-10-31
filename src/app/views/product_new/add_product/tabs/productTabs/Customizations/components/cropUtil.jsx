// components/cropUtil.js
export const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous'; // Set crossOrigin BEFORE setting src
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.src = url;

        // Add timeout to handle hanging requests
        setTimeout(() => {
            if (!image.complete) {
                reject(new Error('Image loading timeout'));
            }
        }, 10000);
    });

export const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
    try {
        // Validate pixelCrop
        if (!pixelCrop || !pixelCrop.width || !pixelCrop.height || pixelCrop.width <= 0 || pixelCrop.height <= 0) {
            throw new Error('Invalid crop dimensions');
        }

        const image = await createImage(imageSrc);

        // Validate image dimensions
        if (image.width === 0 || image.height === 0) {
            throw new Error('Image failed to load or has zero dimensions');
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Could not get canvas context');
        }

        const maxSize = Math.max(image.width, image.height);
        const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

        // Set canvas dimensions
        canvas.width = safeArea;
        canvas.height = safeArea;

        ctx.translate(safeArea / 2, safeArea / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-safeArea / 2, -safeArea / 2);

        ctx.drawImage(
            image,
            safeArea / 2 - image.width / 2,
            safeArea / 2 - image.height / 2
        );

        const data = ctx.getImageData(0, 0, safeArea, safeArea);

        // Set final canvas dimensions for cropped area
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.putImageData(
            data,
            Math.round(0 - safeArea / 2 + image.width / 2 - pixelCrop.x),
            Math.round(0 - safeArea / 2 + image.height / 2 - pixelCrop.y)
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                resolve(blob);
            }, 'image/jpeg', 0.9);
        });
    } catch (error) {
        throw new Error(`Image processing failed: ${error.message}`);
    }
};

// imageUtils.js
export const fetchImageAsBlob = async (imageUrl) => {
    try {
        const response = await fetch(imageUrl, {
            mode: 'cors',
            credentials: 'omit',
            headers: {
                'Accept': 'image/*',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();
        return blob;
    } catch (error) {
        console.error('Failed to fetch image:', error);
        throw error;
    }
};

export const createBlobUrl = (blob) => {
    return URL.createObjectURL(blob);
};

export const revokeBlobUrl = (url) => {
    if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
};
