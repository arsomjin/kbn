import { firestore as db } from './firebase';
import { collection, doc, addDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';

const BRANCHES_COLLECTION = 'data/company/branches';

export const createBranch = async (branchData) => {
  try {
    const branchesRef = collection(db, BRANCHES_COLLECTION);
    const docRef = await addDoc(branchesRef, {
      ...branchData,
      deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { id: docRef.id, ...branchData };
  } catch (error) {
    console.error('Error creating branch:', error);
    throw error;
  }
};

export const updateBranch = async (branchId, branchData) => {
  try {
    const branchRef = doc(db, BRANCHES_COLLECTION, branchId);
    await updateDoc(branchRef, {
      ...branchData,
      updatedAt: new Date().toISOString(),
    });
    return { id: branchId, ...branchData };
  } catch (error) {
    console.error('Error updating branch:', error);
    throw error;
  }
};

export const deleteBranch = async (branchId) => {
  try {
    const branchRef = doc(db, BRANCHES_COLLECTION, branchId);
    await updateDoc(branchRef, {
      deleted: true,
      updatedAt: new Date().toISOString(),
    });
    return branchId;
  } catch (error) {
    console.error('Error deleting branch:', error);
    throw error;
  }
};

export const getBranches = async () => {
  try {
    const branchesRef = collection(db, BRANCHES_COLLECTION);
    const q = query(branchesRef, where('deleted', '==', false));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting branches:', error);
    throw error;
  }
};

export const getBranchById = async (branchId) => {
  try {
    const branchRef = doc(db, BRANCHES_COLLECTION, branchId);
    const branchDoc = await getDocs(branchRef);
    if (branchDoc.exists()) {
      return { id: branchDoc.id, ...branchDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting branch by ID:', error);
    throw error;
  }
};

export const getBranchesByProvince = async (provinceId) => {
  try {
    const branchesRef = collection(db, BRANCHES_COLLECTION);
    const q = query(
      branchesRef,
      where('provinceId', '==', provinceId),
      where('deleted', '==', false),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting branches by province:', error);
    throw error;
  }
};
