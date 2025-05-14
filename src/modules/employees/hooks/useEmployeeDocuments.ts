import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { message } from "antd";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../../../services/firebase";
import { Timestamp } from "firebase/firestore";

interface EmployeeDocument {
  id: string;
  type: string;
  url: string;
  uploadedAt: Timestamp;
}

export const useEmployeeDocuments = () => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const uploadDocument = useCallback(async (file: File, employeeId: string): Promise<EmployeeDocument | null> => {
    try {
      setUploading(true);
      const storageRef = ref(storage, `employees/${employeeId}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      return {
        id: storageRef.name,
        type: file.type,
        url,
        uploadedAt: Timestamp.now(),
      };
    } catch (error) {
      console.error("Error uploading document:", error);
      message.error(t("employees.error.uploadingDocument"));
      return null;
    } finally {
      setUploading(false);
    }
  }, [t]);

  const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
    try {
      setUploading(true);
      const storageRef = ref(storage, documentId);
      await deleteObject(storageRef);
      message.success(t("employees.success.documentDeleted"));
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      message.error(t("employees.error.deletingDocument"));
      return false;
    } finally {
      setUploading(false);
    }
  }, [t]);

  const downloadDocument = useCallback(async (url: string, filename: string): Promise<void> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading document:", error);
      message.error(t("employees.error.downloadingDocument"));
    }
  }, [t]);

  return {
    uploading,
    uploadDocument,
    deleteDocument,
    downloadDocument,
  };
}; 