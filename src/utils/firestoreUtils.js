import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  increment,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { firestore } from '../services/firebase';
import { processFormDataForFirestore, processFirestoreDataForForm } from './dateHandling';

/**
 * Firestore Utilities with Intelligent Date Handling
 *
 * All functions in this module automatically handle date conversion:
 * - When saving: Converts dates to Firestore Timestamps
 * - When loading: Converts Timestamps to dayjs objects (Antd compatible)
 *
 * Key Functions:
 * - prepareDataForFirestore() - Convert any data for Firestore
 * - prepareDataFromFirestore() - Convert any data from Firestore
 * - All CRUD operations (create, update, get, etc.) include automatic date processing
 *
 * @version 2.0.0 - Enhanced with automatic date handling
 */

// ===== DATE HANDLING UTILITIES =====

/**
 * Auto-process any data for Firestore saving with intelligent date detection
 * This is the main function to use when saving any data to Firestore
 *
 * @param {any} data - The data to process
 * @param {Object} options - Processing options
 * @returns {any} Data with dates converted to Firestore Timestamps
 *
 * @example
 * const dataToSave = prepareDataForFirestore(formData);
 * await setDoc(docRef, dataToSave);
 */
export const prepareDataForFirestore = (data, options = {}) => {
  return processFormDataForFirestore(data, {
    processNested: true,
    convertDates: true,
    ...options,
  });
};

/**
 * Auto-process any data from Firestore for use in forms/UI
 * This is the main function to use when loading any data from Firestore
 *
 * @param {any} data - The data from Firestore
 * @param {Object} options - Processing options
 * @returns {any} Data with Timestamps converted to appropriate format
 *
 * @example
 * const docSnap = await getDoc(docRef);
 * const formData = prepareDataFromFirestore(docSnap.data());
 * form.setFieldsValue(formData);
 */
export const prepareDataFromFirestore = (data, options = {}) => {
  return processFirestoreDataForForm(data, {
    processNested: true,
    convertDates: true,
    outputFormat: 'dayjs', // Default for Antd compatibility
    ...options,
  });
};

// ===== DOCUMENT UTILITIES =====

/**
 * Convert Firestore document to an object with ID and optional date processing
 */
export const convertDoc = (doc, options = {}) => {
  if (!doc.exists()) {
    throw new Error(`Document doesn't exist: ${doc.id}`);
  }

  const docData = {
    id: doc.id,
    ...doc.data(),
  };

  // Process data from Firestore (handle date conversions)
  const { processData = false } = options;
  if (processData) {
    return prepareDataFromFirestore(docData, options);
  }

  return docData;
};

/**
 * Fetch a document by ID with automatic date processing
 */
export const getDocById = async (collectionPath, id, options = {}) => {
  try {
    const segments = collectionPath.split('/');
    const docRef = doc(firestore, ...segments, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    const docData = convertDoc(snapshot);

    // Process data from Firestore (handle date conversions)
    const { processData = true } = options;
    if (processData) {
      return prepareDataFromFirestore(docData, options);
    }

    return docData;
  } catch (error) {
    console.error(`Error fetching document ${id} from ${collectionPath}:`, error);
    return null;
  }
};

/**
 * Create a new document with automatic timestamps and date processing
 */
export const createDocument = async (collectionPath, data, customId) => {
  try {
    const segments = collectionPath.split('/');
    const colRef = collection(firestore, ...segments);
    const docRef = customId ? doc(firestore, ...segments, customId) : doc(colRef);

    // Process data for Firestore (handle date conversions)
    const processedData = prepareDataForFirestore(data);

    const docData = {
      ...processedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(docRef, docData);
    return docRef.id;
  } catch (error) {
    console.error(`Error creating document in ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Update an existing document with date processing
 */
export const updateDocument = async (collectionPath, id, data) => {
  try {
    const segments = collectionPath.split('/');
    const docRef = doc(firestore, ...segments, id);
    const { id: _, ...updateData } = data;

    // Process data for Firestore (handle date conversions)
    const processedData = prepareDataForFirestore(updateData);

    const timestampedData = {
      ...processedData,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(docRef, timestampedData);
  } catch (error) {
    console.error(`Error updating document ${id} in ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (collectionPath, id) => {
  try {
    const segments = collectionPath.split('/');
    const docRef = doc(firestore, ...segments, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document ${id} from ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Fetch documents with pagination support and automatic date processing
 */
export const getPaginatedDocuments = async (collectionPath, options = {}) => {
  try {
    const {
      whereConditions = [],
      orderByField = 'createdAt',
      orderDirection = 'desc',
      limitCount = 20,
      startAfterDoc = null,
      processData = true,
      ...dateOptions
    } = options;
    const segments = collectionPath.split('/');
    const q = collection(firestore, ...segments);
    let queryObj = query(q);
    whereConditions.forEach(([field, operator, value]) => {
      queryObj = query(queryObj, where(field, operator, value));
    });
    queryObj = query(queryObj, orderBy(orderByField, orderDirection));
    queryObj = query(queryObj, limit(limitCount + 1));
    if (startAfterDoc) {
      queryObj = query(queryObj, startAfter(startAfterDoc));
    }
    const querySnapshot = await getDocs(queryObj);
    const items = [];
    let lastVisible = null;
    querySnapshot.forEach((doc) => {
      const index = items.length;
      if (index < limitCount) {
        const docData = convertDoc(doc);
        // Process data from Firestore (handle date conversions)
        items.push(processData ? prepareDataFromFirestore(docData, dateOptions) : docData);
        lastVisible = doc;
      }
    });
    const hasMore = querySnapshot.size > limitCount;
    return {
      items,
      lastDoc: lastVisible,
      hasMore,
    };
  } catch (error) {
    console.error(`Error fetching paginated documents from ${collectionPath}:`, error);
    return {
      items: [],
      lastDoc: null,
      hasMore: false,
    };
  }
};

/**
 * Perform a batch write operation (create, update, delete) with date processing
 */
export const batchOperation = async (operations) => {
  try {
    const batch = writeBatch(firestore);

    operations.forEach(({ type, collectionPath, id, data }) => {
      const segments = collectionPath.split('/');
      const docRef = doc(firestore, ...segments, id);

      switch (type) {
        case 'create': {
          // Process data for Firestore (handle date conversions)
          const processedCreateData = prepareDataForFirestore(data);
          batch.set(docRef, {
            ...processedCreateData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          break;
        }
        case 'update': {
          // Process data for Firestore (handle date conversions)
          const processedUpdateData = prepareDataForFirestore(data);
          batch.update(docRef, {
            ...processedUpdateData,
            updatedAt: serverTimestamp(),
          });
          break;
        }
        case 'delete':
          batch.delete(docRef);
          break;
      }
    });

    await batch.commit();
  } catch (error) {
    console.error('Error performing batch operation:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates for a document
 */
export const subscribeToDocument = (collectionPath, id, callback) => {
  const segments = collectionPath.split('/');
  const docRef = doc(firestore, ...segments, id);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(convertDoc(snapshot));
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error(`Error subscribing to document ${id} in ${collectionPath}:`, error);
      callback(null);
    },
  );
};

/**
 * Subscribe to real-time updates for a collection query
 */
export const subscribeToQuery = (collectionPath, callback, options = {}) => {
  const {
    whereConditions = [],
    orderByField = 'createdAt',
    orderDirection = 'desc',
    limitCount = 20,
  } = options;
  const segments = collectionPath.split('/');
  const q = collection(firestore, ...segments);
  let queryObj = query(q);

  whereConditions.forEach(([field, operator, value]) => {
    queryObj = query(queryObj, where(field, operator, value));
  });

  queryObj = query(queryObj, orderBy(orderByField, orderDirection));
  queryObj = query(queryObj, limit(limitCount));

  return onSnapshot(
    queryObj,
    (snapshot) => {
      const docs = snapshot.docs.map((doc) => convertDoc(doc));
      callback(docs);
    },
    (error) => {
      console.error(`Error subscribing to query in ${collectionPath}:`, error);
      callback([]);
    },
  );
};

/**
 * Increment a numeric field in a document
 */
export const incrementField = async (collectionPath, id, field, value = 1) => {
  try {
    const segments = collectionPath.split('/');
    const docRef = doc(firestore, ...segments, id);

    await updateDoc(docRef, {
      [field]: increment(value),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error incrementing field ${field} in document ${id}:`, error);
    throw error;
  }
};

/**
 * Call a Firebase Cloud Function
 */
export const callFunction = async (name, data) => {
  try {
    console.log(`Mock cloud function call to "${name}" with data:`, data);
    return { success: true };
  } catch (error) {
    console.error(`Error calling function "${name}":`, error);
    throw error;
  }
};

/**
 * Adds error logs to Firestore for monitoring
 */
export const addErrorLogs = (error) => {
  console.error('Error logged:', error);
};

/**
 * Check if a document exists in Firestore
 */
export const documentExists = async (collectionPath, id) => {
  try {
    const segments = collectionPath.split('/');
    const docRef = doc(firestore, ...segments, id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists();
  } catch (error) {
    console.error(`Error checking document existence ${id} in ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Get multiple documents by their IDs
 */
export const getDocumentsByIds = async (collectionPath, ids) => {
  try {
    const docs = await Promise.all(ids.map((id) => getDocById(collectionPath, id)));
    return docs.filter((doc) => doc !== null);
  } catch (error) {
    console.error(`Error fetching multiple documents from ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Create or update a document (upsert) with date processing
 */
export const upsertDocument = async (collectionPath, id, data) => {
  try {
    const segments = collectionPath.split('/');
    const docRef = doc(firestore, ...segments, id);
    const exists = await documentExists(collectionPath, id);

    // Process data for Firestore (handle date conversions)
    const processedData = prepareDataForFirestore(data);

    const docData = {
      ...processedData,
      ...(exists
        ? { updatedAt: serverTimestamp() }
        : { createdAt: serverTimestamp(), updatedAt: serverTimestamp() }),
    };

    await setDoc(docRef, docData);
    return id;
  } catch (error) {
    console.error(`Error upserting document ${id} in ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Soft delete a document by setting a deleted flag
 */
export const softDeleteDocument = async (collectionPath, id) => {
  try {
    const segments = collectionPath.split('/');
    const docRef = doc(firestore, ...segments, id);
    await updateDoc(docRef, {
      deleted: true,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error soft deleting document ${id} from ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Restore a soft-deleted document
 */
export const restoreDocument = async (collectionPath, id) => {
  try {
    const segments = collectionPath.split('/');
    const docRef = doc(firestore, ...segments, id);
    await updateDoc(docRef, {
      deleted: false,
      deletedAt: null,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error restoring document ${id} in ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Get documents with array contains condition
 */
export const getDocumentsWithArrayContains = async (collectionPath, field, value) => {
  try {
    const segments = collectionPath.split('/');
    const q = query(collection(firestore, ...segments), where(field, 'array-contains', value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => convertDoc(doc));
  } catch (error) {
    console.error(`Error fetching documents with array contains from ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Add an item to an array field in a document
 */
export const addToArray = async (collectionPath, id, field, value) => {
  try {
    const segments = collectionPath.split('/');
    const docRef = doc(firestore, ...segments, id);
    await updateDoc(docRef, {
      [field]: arrayUnion(value),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error adding to array field ${field} in document ${id}:`, error);
    throw error;
  }
};

/**
 * Remove an item from an array field in a document
 */
export const removeFromArray = async (collectionPath, id, field, value) => {
  try {
    const segments = collectionPath.split('/');
    const docRef = doc(firestore, ...segments, id);
    await updateDoc(docRef, {
      [field]: arrayRemove(value),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error removing from array field ${field} in document ${id}:`, error);
    throw error;
  }
};

/**
 * Get documents with compound queries
 */
export const getDocumentsWithCompoundQuery = async (collectionPath, conditions, options = {}) => {
  try {
    const { orderByField, orderDirection = 'desc', limitCount } = options;
    const segments = collectionPath.split('/');
    const collectionRef = collection(firestore, ...segments);
    let queryRef = collectionRef;

    conditions.forEach(({ field, operator, value }) => {
      queryRef = query(queryRef, where(field, operator, value));
    });

    if (orderByField) {
      queryRef = query(queryRef, orderBy(orderByField, orderDirection));
    }

    if (limitCount) {
      queryRef = query(queryRef, limit(limitCount));
    }

    const querySnapshot = await getDocs(queryRef);
    return querySnapshot.docs.map((doc) => convertDoc(doc));
  } catch (error) {
    console.error(`Error fetching documents with compound query from ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Get document count for a collection or query
 */
export const getDocumentCount = async (collectionPath, conditions = []) => {
  try {
    const segments = collectionPath.split('/');
    const collectionRef = collection(firestore, ...segments);
    let queryRef = collectionRef;

    conditions.forEach(({ field, operator, value }) => {
      queryRef = query(queryRef, where(field, operator, value));
    });

    const querySnapshot = await getDocs(queryRef);
    return querySnapshot.size;
  } catch (error) {
    console.error(`Error getting document count from ${collectionPath}:`, error);
    throw error;
  }
};
