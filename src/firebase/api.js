import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  orderBy,
  limit,
  updateDoc,
} from 'firebase/firestore';
import { db } from './index'; // Assuming db is exported from index.js

export const checkDoc = async (collectionPath, docId) => {
  const docRef = doc(db, collectionPath, docId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const getCollection = async (collectionPath) => {
  const colRef = collection(db, collectionPath);
  const snapshot = await getDocs(colRef);
  const result = {};
  snapshot.forEach((doc) => {
    result[doc.id] = { id: doc.id, ...doc.data() };
  });
  return result;
};

export const checkCollection = async (collectionPath, queryConstraints = []) => {
  try {
    const colRef = collection(db, collectionPath);
    const q = queryConstraints.length > 0 ? query(colRef, ...queryConstraints) : colRef;
    const snapshot = await getDocs(q);
    const result = [];
    snapshot.forEach((doc) => {
      result.push({ id: doc.id, ...doc.data() });
    });
    return result;
  } catch (error) {
    console.error('Error checking collection:', error);
    throw error;
  }
};

export const getSearchData = async (collectionPath, queryConstraints = []) => {
  try {
    const colRef = collection(db, collectionPath);
    const q = queryConstraints.length > 0 ? query(colRef, ...queryConstraints) : colRef;
    const snapshot = await getDocs(q);
    const result = [];
    snapshot.forEach((doc) => {
      result.push({ id: doc.id, ...doc.data() });
    });
    return result;
  } catch (error) {
    console.error('Error searching data:', error);
    throw error;
  }
};

export const getLatestData = async (collectionPath, orderByField = 'created', limitCount = 1) => {
  try {
    const colRef = collection(db, collectionPath);
    const q = query(colRef, orderBy(orderByField, 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    const result = [];
    snapshot.forEach((doc) => {
      result.push({ id: doc.id, ...doc.data() });
    });
    return limitCount === 1 ? result[0] || null : result;
  } catch (error) {
    console.error('Error getting latest data:', error);
    throw error;
  }
};

export const updateData = async (collectionPath, docId, data) => {
  try {
    const docRef = doc(db, collectionPath, docId);
    await updateDoc(docRef, data);
    return { success: true };
  } catch (error) {
    console.error('Error updating data:', error);
    throw error;
  }
};
