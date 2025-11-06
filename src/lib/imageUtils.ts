// Image utility functions
// Consolidates image manipulation functions used across components

/**
 * Converts a base64 encoded string to a Blob object
 * @param base64 - Base64 encoded string (with or without data URI prefix)
 * @param contentType - MIME type of the content (default: 'image/png')
 * @returns Blob object
 *
 * @example
 * const imageBlob = base64ToBlob(base64String, 'image/jpeg');
 */
export function base64ToBlob(
  base64: string,
  contentType: string = 'image/png'
): Blob {
  // Remove data URI prefix if present
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

  // Decode base64 string
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}

/**
 * Converts a File or Blob to a base64 encoded string
 * @param file - File or Blob to convert
 * @returns Promise that resolves to base64 string
 *
 * @example
 * const base64 = await blobToBase64(file);
 */
export function blobToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validates if a file is an image
 * @param file - File to validate
 * @returns True if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Validates if a file size is within the limit
 * @param file - File to validate
 * @param maxSizeBytes - Maximum size in bytes
 * @returns True if file size is valid
 */
export function isFileSizeValid(file: File, maxSizeBytes: number): boolean {
  return file.size <= maxSizeBytes;
}

/**
 * Gets dimensions of an image file
 * @param file - Image file
 * @returns Promise that resolves to dimensions {width, height}
 */
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Resizes an image to fit within maximum dimensions while maintaining aspect ratio
 * @param file - Image file to resize
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @returns Promise that resolves to resized image as base64 string
 */
export async function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<string> {
  const img = new Image();
  const url = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;

        if (width > height) {
          width = maxWidth;
          height = width / aspectRatio;
        } else {
          height = maxHeight;
          width = height * aspectRatio;
        }
      }

      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to base64
      const resizedBase64 = canvas.toDataURL(file.type || 'image/png');
      resolve(resizedBase64);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
