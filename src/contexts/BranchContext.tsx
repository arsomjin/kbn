import React, { createContext, useState, useEffect, ReactNode } from "react";
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, orderBy } from "firebase/firestore";
import { firestore as db } from "../services/firebase";
import { Branch, BranchFormData } from "../types/branch";
import { useProvinces } from "../hooks/useProvinces";
import { useTranslation } from "react-i18next";
import { notification } from "antd";
import { useLoading } from "../hooks/useLoading";
import { useAuth } from "../hooks/useAuth";

interface BranchContextType {
  branches: Branch[];
  branchesByProvince: { [provinceId: string]: Branch[] };
  loading: boolean;
  error: string | null;
  initialized: boolean;
  createBranch: (data: BranchFormData) => Promise<void>;
  updateBranch: (id: string, data: BranchFormData) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;
  getBranchById: (id: string) => Branch | undefined;
  refreshBranches: (options?: { includeAll?: boolean; provinceId?: string }) => Promise<void>;
}

export const BranchContext = createContext<BranchContextType | undefined>(undefined);

interface BranchProviderProps {
  children: ReactNode;
}

export const BranchProvider: React.FC<BranchProviderProps> = ({ children }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesByProvince, setBranchesByProvince] = useState<{ [provinceId: string]: Branch[] }>({});
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const { userProfile } = useAuth();
  const { provinces, validateProvinceId } = useProvinces();
  const { t } = useTranslation();
  const { showLoading, hideLoading } = useLoading();

  const selectedProvinceId = userProfile?.province;

  const refreshBranches = async (options?: { includeAll?: boolean; provinceId?: string }) => {
    // If includeAll is true, fetch all branches regardless of province
    if (options?.includeAll) {
      try {
        showLoading();
        setError(null);
        const branchesRef = collection(db, "data", "company", "branches");
        const q = query(
          branchesRef,
          orderBy("branchId", "asc")
        );
        const snapshot = await getDocs(q);
        const branchData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Branch[];
        setBranches(branchData);
        setInitialized(true);
      } catch (err) {
        console.error("Error fetching branches:", err);
        const message = err instanceof Error ? err.message : "Unexpected error";
        setError(message);
        notification.error({
          message: t("common.error"),
          description: t("branches.fetchError"),
        });
      } finally {
        hideLoading();
      }
      return;
    }
    const targetProvinceId = options?.provinceId || selectedProvinceId;
    if (!targetProvinceId || !validateProvinceId(targetProvinceId)) {
      setError(t("branches.noProvinceSelected"));
      return;
    }
    try {
      showLoading();
      setError(null);
      const branchesRef = collection(db, "data", "company", "branches");
      const q = query(
        branchesRef,
        where("provinceId", "==", targetProvinceId),
        where("status", "==", "active"),
        orderBy("branchId", "asc")
      );
      const snapshot = await getDocs(q);
      const branchData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Branch[];
      setBranches(branchData);
      // Update branchesByProvince
      setBranchesByProvince(prev => ({
        ...prev,
        [targetProvinceId]: branchData
      }));
      setInitialized(true);
    } catch (err) {
      console.error("Error fetching branches:", err);
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
      notification.error({
        message: t("common.error"),
        description: t("branches.fetchError"),
      });
    } finally {
      hideLoading();
    }
  }

  useEffect(() => {
    if (selectedProvinceId && validateProvinceId(selectedProvinceId)) {
      refreshBranches();
    }
  }, [selectedProvinceId]);

  const createBranch = async (data: BranchFormData) => {
    if (!selectedProvinceId || !validateProvinceId(selectedProvinceId)) {
      throw new Error(t("branches.noProvinceSelected"));
    }

    try {
      showLoading();
      const branchRef = doc(collection(db, "data", "company", "branches"));
      const timestamp = Date.now();
      
      const branch: Branch = {
        id: branchRef.id,
        ...data,
        provinceId: selectedProvinceId,
        created: timestamp,
        updated: timestamp,
        inputBy: userProfile?.uid || "system",
        deleted: false,
      };

      await setDoc(branchRef, branch);
      await refreshBranches();
      notification.success({
        message: t("common.success"),
        description: t("branches.createSuccess"),
      });
    } catch (err) {
      console.error("Error creating branch:", err);
      const message = err instanceof Error ? err.message : "Unexpected error";
      notification.error({
        message: t("common.error"),
        description: t("branches.createError"),
      });
      throw new Error(message);
    } finally {
      hideLoading();
    }
  };

  const updateBranch = async (id: string, data: BranchFormData) => {
    if (!selectedProvinceId || !validateProvinceId(selectedProvinceId)) {
      throw new Error(t("branches.noProvinceSelected"));
    }

    try {
      showLoading();
      const branchRef = doc(db, "data", "company", "branches", id);
      const timestamp = Date.now();

      const branch: Partial<Branch> = {
        ...data,
        updated: timestamp,
      };

      await setDoc(branchRef, branch, { merge: true });
      await refreshBranches();
      notification.success({
        message: t("common.success"),
        description: t("branches.updateSuccess"),
      });
    } catch (err) {
      console.error("Error updating branch:", err);
      const message = err instanceof Error ? err.message : "Unexpected error";
      notification.error({
        message: t("common.error"),
        description: t("branches.updateError"),
      });
      throw new Error(message);
    } finally {
      hideLoading();
    }
  };

  const deleteBranch = async (id: string) => {
    try {
      showLoading();
      const branchRef = doc(db, "data", "company", "branches", id);
      const timestamp = Date.now();

      // Soft delete
      await setDoc(branchRef, {
        deleted: true,
        status: "inactive",
        updated: timestamp,
      }, { merge: true });

      await refreshBranches();
      notification.success({
        message: t("common.success"),
        description: t("branches.deleteSuccess"),
      });
    } catch (err) {
      console.error("Error deleting branch:", err);
      const message = err instanceof Error ? err.message : "Unexpected error";
      notification.error({
        message: t("common.error"),
        description: t("branches.deleteError"),
      });
      throw new Error(message);
    } finally {
      hideLoading();
    }
  };

  const getBranchById = (id: string) => {
    return branches.find((branch) => branch.id === id);
  };

  return (
    <BranchContext.Provider
      value={{
        branches,
        branchesByProvince,
        loading: false, // Using global loading context
        error,
        initialized,
        createBranch,
        updateBranch,
        deleteBranch,
        getBranchById,
        refreshBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};
