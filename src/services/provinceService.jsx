import { firestore as db } from './firebase';
import { collection, doc, addDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';

const PROVINCES_COLLECTION = 'data/company/provinces';

export const createProvince = async (provinceData) => {
  try {
    const provincesRef = collection(db, PROVINCES_COLLECTION);
    const docRef = await addDoc(provincesRef, {
      ...provinceData,
      deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { id: docRef.id, ...provinceData };
  } catch (error) {
    console.error('Error creating province:', error);
    throw error;
  }
};

export const updateProvince = async (provinceId, provinceData) => {
  try {
    const provinceRef = doc(db, PROVINCES_COLLECTION, provinceId);
    await updateDoc(provinceRef, {
      ...provinceData,
      updatedAt: new Date().toISOString(),
    });
    return { id: provinceId, ...provinceData };
  } catch (error) {
    console.error('Error updating province:', error);
    throw error;
  }
};

export const deleteProvince = async (provinceId) => {
  try {
    const provinceRef = doc(db, PROVINCES_COLLECTION, provinceId);
    await updateDoc(provinceRef, {
      deleted: true,
      updatedAt: new Date().toISOString(),
    });
    return provinceId;
  } catch (error) {
    console.error('Error deleting province:', error);
    throw error;
  }
};

export const getProvinces = async () => {
  try {
    const provincesRef = collection(db, PROVINCES_COLLECTION);
    const q = query(provincesRef, where('deleted', '==', false));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting provinces:', error);
    throw error;
  }
};

export const getProvinceById = async (provinceId) => {
  try {
    const provinceRef = doc(db, PROVINCES_COLLECTION, provinceId);
    const provinceDoc = await getDocs(provinceRef);
    if (provinceDoc.exists()) {
      return { id: provinceDoc.id, ...provinceDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting province by ID:', error);
    throw error;
  }
};

export const getProvincesByRegion = async (region) => {
  try {
    const provincesRef = collection(db, PROVINCES_COLLECTION);
    const q = query(provincesRef, where('region', '==', region), where('deleted', '==', false));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting provinces by region:', error);
    throw error;
  }
};
