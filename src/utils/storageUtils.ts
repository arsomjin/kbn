/**
 * Firebase Storage Utilities
 * Provides helper functions for file uploads, downloads, and management
 */

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata,
  uploadBytesResumable,
  UploadTaskSnapshot
} from 'firebase/storage';
import { storage } from '../services/firebase';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface FileUploadResult {
  downloadURL: string;
  fullPath: string;
  name: string;
  contentType: string;
  size: number;
}

export interface FileUploadProgressCallback {
  onProgress?: (progress: number, snapshot: UploadTaskSnapshot) => void;
  onError?: (error: Error) => void;
  onComplete?: (result: FileUploadResult) => void;
}

/**
 * Upload a file to Firebase Storage
 *
 * @param file File object to upload
 * @param path Storage path without leading slash (e.g., 'users/avatars')
 * @param customFilename Optional custom filename (default: UUID)
 * @param metadata Optional file metadata
 * @returns Promise resolving to upload result with download URL
 */
export const uploadFile = async (
  file: File | Blob,
  path: string,
  customFilename?: string,
  metadata?: { [key: string]: string }
): Promise<FileUploadResult> => {
  try {
    // Generate a filename if not provided
    const filename = customFilename || `${uuidv4()}_${new Date().getTime()}`;

    // Determine the content type
    const contentType = file instanceof File ? file.type : 'application/octet-stream';

    // Create the full path and reference
    const fullPath = `${path}/${filename}`;
    const storageRef = ref(storage, fullPath);

    // Upload with metadata
    const uploadResult = await uploadBytes(storageRef, file, {
      contentType,
      customMetadata: metadata
    });

    // Get the download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);

    return {
      downloadURL,
      fullPath,
      name: filename,
      contentType,
      size: uploadResult.metadata.size
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Upload a file with progress tracking
 *
 * @param file File object to upload
 * @param path Storage path without leading slash
 * @param callbacks Object containing callback functions for progress, error, and completion
 * @param customFilename Optional custom filename
 * @param metadata Optional file metadata
 * @returns Upload task that can be paused or canceled
 */
export const uploadFileWithProgress = (
  file: File | Blob,
  path: string,
  callbacks: FileUploadProgressCallback,
  customFilename?: string,
  metadata?: { [key: string]: string }
) => {
  // Generate a filename if not provided
  const filename = customFilename || `${uuidv4()}_${new Date().getTime()}`;

  // Determine the content type
  const contentType = file instanceof File ? file.type : 'application/octet-stream';

  // Create the full path and reference
  const fullPath = `${path}/${filename}`;
  const storageRef = ref(storage, fullPath);

  // Start the upload with metadata
  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType,
    customMetadata: metadata
  });

  // Set up the event observers
  uploadTask.on(
    'state_changed',
    snapshot => {
      // Track upload progress
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      if (callbacks.onProgress) {
        callbacks.onProgress(progress, snapshot);
      }
    },
    error => {
      // Handle errors
      console.error('Error uploading file:', error);
      if (callbacks.onError) {
        callbacks.onError(error);
      }
    },
    async () => {
      // Upload completed successfully
      try {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        if (callbacks.onComplete) {
          callbacks.onComplete({
            downloadURL,
            fullPath,
            name: filename,
            contentType,
            size: uploadTask.snapshot.metadata.size
          });
        }
      } catch (error) {
        console.error('Error getting download URL:', error);
        if (callbacks.onError && error instanceof Error) {
          callbacks.onError(error);
        }
      }
    }
  );

  return uploadTask;
};

/**
 * Get a download URL for a file
 *
 * @param path Full storage path to the file
 * @returns Promise resolving to download URL
 */
export const getFileDownloadURL = async (path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error(`Error getting download URL for ${path}:`, error);
    throw error;
  }
};

/**
 * Delete a file from storage
 *
 * @param path Full storage path to the file
 * @returns Promise that resolves when deletion is complete
 */
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error(`Error deleting file ${path}:`, error);
    throw error;
  }
};

/**
 * List all files in a directory
 *
 * @param path Storage path without leading slash
 * @returns Promise resolving to array of file references
 */
export const listFiles = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    return result;
  } catch (error) {
    console.error(`Error listing files in ${path}:`, error);
    throw error;
  }
};

/**
 * Get metadata for a file
 *
 * @param path Full storage path to the file
 * @returns Promise resolving to file metadata
 */
export const getFileMetadata = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    return await getMetadata(storageRef);
  } catch (error) {
    console.error(`Error getting metadata for ${path}:`, error);
    throw error;
  }
};

/**
 * Update metadata for a file
 *
 * @param path Full storage path to the file
 * @param metadata Metadata object to update
 * @returns Promise resolving to updated metadata
 */
export const updateFileMetadata = async (path: string, metadata: { [key: string]: string }) => {
  try {
    const storageRef = ref(storage, path);
    return await updateMetadata(storageRef, { customMetadata: metadata });
  } catch (error) {
    console.error(`Error updating metadata for ${path}:`, error);
    throw error;
  }
};

/**
 * Generate a unique filename with timestamp
 *
 * @param originalName Original filename or extension
 * @returns Generated unique filename
 */
export const generateUniqueFilename = (originalName?: string): string => {
  const timestamp = new Date().getTime();
  const uuid = uuidv4();

  if (originalName) {
    // If original name has an extension, keep it
    const lastDot = originalName.lastIndexOf('.');
    if (lastDot >= 0) {
      const extension = originalName.substring(lastDot);
      return `${uuid}_${timestamp}${extension}`;
    }
  }

  return `${uuid}_${timestamp}`;
};

/**
 * Create a full storage path
 *
 * @param basePath Base path in storage
 * @param userId User ID for user-specific storage (optional)
 * @param filename Filename
 * @returns Full storage path
 */
export const createStoragePath = (basePath: string, filename: string, userId?: string): string => {
  if (userId) {
    return `${basePath}/${userId}/${filename}`;
  }
  return `${basePath}/${filename}`;
};

/**
 * Extract filename from a storage path
 *
 * @param path Full storage path
 * @returns Filename part of the path
 */
export const getFilenameFromPath = (path: string): string => {
  return path.split('/').pop() || '';
};
