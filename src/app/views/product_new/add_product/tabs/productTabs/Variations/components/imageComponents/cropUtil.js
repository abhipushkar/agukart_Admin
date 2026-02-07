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
        if (!ctx) throw new Error('No canvas context');

        const radians = (rotation * Math.PI) / 180;

        // calculate bounding box of rotated image
        const sin = Math.abs(Math.sin(radians));
        const cos = Math.abs(Math.cos(radians));

        const rotatedWidth =
            image.width * cos + image.height * sin;
        const rotatedHeight =
            image.width * sin + image.height * cos;

        // create a canvas that fits the rotated image
        const rotateCanvas = document.createElement('canvas');
        rotateCanvas.width = rotatedWidth;
        rotateCanvas.height = rotatedHeight;

        const rotateCtx = rotateCanvas.getContext('2d');
        if (!rotateCtx) throw new Error('No rotate context');

        // rotate around image center
        rotateCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
        rotateCtx.rotate(radians);
        rotateCtx.translate(-image.width / 2, -image.height / 2);
        rotateCtx.drawImage(image, 0, 0);

        // crop canvas
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            rotateCanvas,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
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
