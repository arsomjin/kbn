/**
 * Advanced Firestore Utilities
 * Provides robust helper functions for common Firestore operations
 */

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
  DocumentData,
  DocumentSnapshot,
  QuerySnapshot,
  QueryDocumentSnapshot,
  FieldValue,
  arrayUnion,
  arrayRemove,
  Query,
  CollectionReference
} from 'firebase/firestore';
import { firestore } from '../services/firebase';
import { FirebaseErrorCategory } from './firebaseErrorMessages';
import { DateTime } from 'luxon';
import { getDeviceInfo, DeviceInfo } from './device';
import { store } from '../store';
import { cleanValuesBeforeSave } from './functions';

// Types
export interface PaginatedResult<T> {
  items: T[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

export interface FirestoreDocument {
  id: string;
  createdAt?: Timestamp | Date | FieldValue;
  updatedAt?: Timestamp | Date | FieldValue;
  [key: string]: any;
}

interface AuthState {
  user: {
    uid: string;
    firstName?: string;
    lastName?: string;
    email: string | null;
  } | null;
  isAuthenticated: boolean;
}

interface ErrorLogData extends Record<string, unknown> {
  ts: number;
  by?: string;
  uid?: string;
  email?: string | null;
  error: unknown;
  device: DeviceInfo;
  snap?: unknown;
  module?: string;
}

interface ErrorWithExtras {
  snap?: unknown;
  module?: string;
  [key: string]: unknown;
}

/**
 * Convert Firestore document to a typed object with ID
 *
 * @param doc Firestore document snapshot
 * @returns Document data with ID
 */
export const convertDoc = <T extends FirestoreDocument>(doc: QueryDocumentSnapshot | DocumentSnapshot): T => {
  if (!doc.exists()) {
    throw new Error(`Document doesn't exist: ${doc.id}`);
  }

  return {
    id: doc.id,
    ...doc.data()
  } as T;
};

/**
 * Fetch a document by ID with strong typing
 *
 * @param collectionPath Collection path
 * @param id Document ID
 * @returns Promise resolving to document data
 */
export const getDocById = async <T extends FirestoreDocument>(
  collectionPath: string,
  id: string
): Promise<T | null> => {
  try {
    const segments = collectionPath.split('/') as [string, ...string[]];
    const docRef = doc(firestore, ...segments, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return convertDoc<T>(snapshot);
  } catch (error) {
    console.error(`Error fetching document ${id} from ${collectionPath}:`, error);
    return null;
  }
};

/**
 * Create a new document with automatic timestamps
 *
 * @param collectionPath Collection path
 * @param data Document data
 * @param customId Optional custom document ID
 * @returns Promise resolving to the document ID
 */
export const createDocument = async <T extends Omit<FirestoreDocument, 'id'>>(
  collectionPath: string,
  data: T,
  customId?: string
): Promise<string> => {
  try {
    const segments = collectionPath.split('/') as [string, ...string[]];
    const colRef = collection(firestore, ...segments);
    const docRef = customId ? doc(firestore, ...segments, customId) : doc(colRef);
    const docData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(docRef, docData);
    return docRef.id;
  } catch (error) {
    console.error(`Error creating document in ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Update an existing document
 *
 * @param collectionPath Collection path
 * @param id Document ID
 * @param data Partial document data to update
 * @returns Promise that resolves when update is complete
 */
export const updateDocument = async <T extends Partial<FirestoreDocument>>(
  collectionPath: string,
  id: string,
  data: T
): Promise<void> => {
  try {
    const segments = collectionPath.split('/') as [string, ...string[]];
    const docRef = doc(firestore, ...segments, id);
    const { id: _, ...updateData } = data;
    const timestampedData = {
      ...updateData,
      updatedAt: serverTimestamp()
    };
    await updateDoc(docRef, timestampedData);
  } catch (error) {
    console.error(`Error updating document ${id} in ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Delete a document
 *
 * @param collectionPath Collection path
 * @param id Document ID
 * @returns Promise that resolves when deletion is complete
 */
export const deleteDocument = async (collectionPath: string, id: string): Promise<void> => {
  try {
    const segments = collectionPath.split('/') as [string, ...string[]];
    const docRef = doc(firestore, ...segments, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document ${id} from ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Fetch documents with pagination support
 *
 * @param collectionPath Collection path
 * @param options Query options
 * @returns Promise resolving to paginated result
 */
export const getPaginatedDocuments = async <T extends FirestoreDocument>(
  collectionPath: string,
  options: {
    whereConditions?: [string, '==' | '!=' | '>' | '<' | '>=' | '<=', any][];
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
    limitCount?: number;
    startAfterDoc?: DocumentSnapshot | null;
  } = {}
): Promise<PaginatedResult<T>> => {
  try {
    const {
      whereConditions = [],
      orderByField = 'createdAt',
      orderDirection = 'desc',
      limitCount = 20,
      startAfterDoc = null
    } = options;
    const segments = collectionPath.split('/') as [string, ...string[]];
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
    const items: T[] = [];
    let lastVisible: DocumentSnapshot | null = null;
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const index = items.length;
      if (index < limitCount) {
        items.push(convertDoc<T>(doc));
        lastVisible = doc;
      }
    });
    const hasMore = querySnapshot.size > limitCount;
    return {
      items,
      lastDoc: lastVisible,
      hasMore
    };
  } catch (error) {
    console.error(`Error fetching paginated documents from ${collectionPath}:`, error);
    return {
      items: [],
      lastDoc: null,
      hasMore: false
    };
  }
};

/**
 * Perform a batch write operation (create, update, delete)
 *
 * @param operations Array of operations to perform
 * @returns Promise that resolves when batch is committed
 */
export const batchOperation = async (
  operations: Array<{
    type: 'create' | 'update' | 'delete';
    collectionPath: string;
    id: string;
    data?: any;
  }>
): Promise<void> => {
  try {
    const batch = writeBatch(firestore);

    operations.forEach(({ type, collectionPath, id, data }) => {
      const segments = collectionPath.split('/') as [string, ...string[]];
      const docRef = doc(firestore, ...segments, id);

      switch (type) {
        case 'create':
          batch.set(docRef, {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          break;
        case 'update':
          batch.update(docRef, {
            ...data,
            updatedAt: serverTimestamp()
          });
          break;
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
 *
 * @param collectionPath Collection path
 * @param id Document ID
 * @param callback Function to call with updated document
 * @returns Unsubscribe function
 */
export const subscribeToDocument = <T extends FirestoreDocument>(
  collectionPath: string,
  id: string,
  callback: (doc: T | null) => void
): (() => void) => {
  const segments = collectionPath.split('/') as [string, ...string[]];
  const docRef = doc(firestore, ...segments, id);

  return onSnapshot(
    docRef,
    snapshot => {
      if (snapshot.exists()) {
        callback(convertDoc<T>(snapshot));
      } else {
        callback(null);
      }
    },
    error => {
      console.error(`Error subscribing to document ${id} in ${collectionPath}:`, error);
      callback(null);
    }
  );
};

/**
 * Subscribe to real-time updates for a collection query
 *
 * @param collectionPath Collection path
 * @param callback Function to call with updated documents
 * @param options Query options
 * @returns Unsubscribe function
 */
export const subscribeToQuery = <T extends FirestoreDocument>(
  collectionPath: string,
  callback: (docs: T[]) => void,
  options: {
    whereConditions?: [string, '==' | '!=' | '>' | '<' | '>=' | '<=', any][];
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
    limitCount?: number;
  } = {}
): (() => void) => {
  const { whereConditions = [], orderByField = 'createdAt', orderDirection = 'desc', limitCount = 20 } = options;
  const segments = collectionPath.split('/') as [string, ...string[]];
  const q = collection(firestore, ...segments);
  let queryObj = query(q);

  whereConditions.forEach(([field, operator, value]) => {
    queryObj = query(queryObj, where(field, operator, value));
  });

  queryObj = query(queryObj, orderBy(orderByField, orderDirection));

  queryObj = query(queryObj, limit(limitCount));

  return onSnapshot(
    queryObj,
    snapshot => {
      const docs = snapshot.docs.map(doc => convertDoc<T>(doc));
      callback(docs);
    },
    error => {
      console.error(`Error subscribing to query in ${collectionPath}:`, error);
      callback([]);
    }
  );
};

/**
 * Increment a numeric field in a document
 *
 * @param collectionPath Collection path
 * @param id Document ID
 * @param field Field to increment
 * @param value Amount to increment by (default: 1)
 * @returns Promise that resolves when update is complete
 */
export const incrementField = async (collectionPath: string, id: string, field: string, value = 1): Promise<void> => {
  try {
    const segments = collectionPath.split('/') as [string, ...string[]];
    const docRef = doc(firestore, ...segments, id);

    await updateDoc(docRef, {
      [field]: increment(value),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error incrementing field ${field} in document ${id}:`, error);
    throw error;
  }
};

/**
 * Call a Firebase Cloud Function
 * @param name The name of the function to call
 * @param data The data to pass to the function
 * @returns The result of the function call
 */
export const callFunction = async (name: string, data: any): Promise<any> => {
  try {
    // This is a placeholder for Firebase Cloud Function calls
    // In a real implementation, you'd use Firebase's callable functions
    // For example:
    // import { getFunctions, httpsCallable } from 'firebase/functions';
    // const functions = getFunctions();
    // const callable = httpsCallable(functions, name);
    // const result = await callable(data);
    // return result.data;

    console.log(`Mock cloud function call to "${name}" with data:`, data);
    return { success: true };
  } catch (error) {
    console.error(`Error calling function "${name}":`, error);
    throw error;
  }
};

/**
 * Adds error logs to Firestore for monitoring
 * @param error - The error to log
 */
export const addErrorLogs = (error: any): void => {
  console.error('Error logged:', error);
  // In a real implementation, this would send the error to Firestore
};

/**
 * Check if a document exists in Firestore
 * @param collectionPath Collection path
 * @param id Document ID
 * @returns Promise resolving to boolean indicating existence
 */
export const documentExists = async (collectionPath: string, id: string): Promise<boolean> => {
  try {
    const segments = collectionPath.split('/') as [string, ...string[]];
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
 * @param collectionPath Collection path
 * @param ids Array of document IDs
 * @returns Promise resolving to array of documents
 */
export const getDocumentsByIds = async <T extends FirestoreDocument>(
  collectionPath: string,
  ids: string[]
): Promise<T[]> => {
  try {
    const docs = await Promise.all(ids.map(id => getDocById<T>(collectionPath, id)));
    return docs.filter((doc): doc is NonNullable<typeof doc> => doc !== null);
  } catch (error) {
    console.error(`Error fetching multiple documents from ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Create or update a document (upsert)
 * @param collectionPath Collection path
 * @param id Document ID
 * @param data Document data
 * @returns Promise resolving to the document ID
 */
export const upsertDocument = async <T extends Omit<FirestoreDocument, 'id'>>(
  collectionPath: string,
  id: string,
  data: T
): Promise<string> => {
  try {
    const segments = collectionPath.split('/') as [string, ...string[]];
    const docRef = doc(firestore, ...segments, id);
    const exists = await documentExists(collectionPath, id);

    const docData = {
      ...data,
      ...(exists ? { updatedAt: serverTimestamp() } : { createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
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
 * @param collectionPath Collection path
 * @param id Document ID
 * @returns Promise that resolves when soft delete is complete
 */
export const softDeleteDocument = async (collectionPath: string, id: string): Promise<void> => {
  try {
    const segments = collectionPath.split('/') as [string, ...string[]];
    const docRef = doc(firestore, ...segments, id);
    await updateDoc(docRef, {
      deleted: true,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error soft deleting document ${id} from ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Restore a soft-deleted document
 * @param collectionPath Collection path
 * @param id Document ID
 * @returns Promise that resolves when restore is complete
 */
export const restoreDocument = async (collectionPath: string, id: string): Promise<void> => {
  try {
    const segments = collectionPath.split('/') as [string, ...string[]];
    const docRef = doc(firestore, ...segments, id);
    await updateDoc(docRef, {
      deleted: false,
      deletedAt: null,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error restoring document ${id} in ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Get documents with array contains condition
 * @param collectionPath Collection path
 * @param field Field to check
 * @param value Value to check for in array
 * @returns Promise resolving to array of documents
 */
export const getDocumentsWithArrayContains = async <T extends FirestoreDocument>(
  collectionPath: string,
  field: string,
  value: any
): Promise<T[]> => {
  try {
    const segments = collectionPath.split('/') as [string, ...string[]];
    const q = query(collection(firestore, ...segments), where(field, 'array-contains', value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => convertDoc<T>(doc));
  } catch (error) {
    console.error(`Error fetching documents with array contains from ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Add an item to an array field in a document
 * @param collectionPath Collection path
 * @param id Document ID
 * @param field Array field name
 * @param value Value to add
 * @returns Promise that resolves when update is complete
 */
export const addToArray = async (collectionPath: string, id: string, field: string, value: any): Promise<void> => {
  try {
    const segments = collectionPath.split('/') as [string, ...string[]];
    const docRef = doc(firestore, ...segments, id);
    await updateDoc(docRef, {
      [field]: arrayUnion(value),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error adding to array field ${field} in document ${id}:`, error);
    throw error;
  }
};

/**
 * Remove an item from an array field in a document
 * @param collectionPath Collection path
 * @param id Document ID
 * @param field Array field name
 * @param value Value to remove
 * @returns Promise that resolves when update is complete
 */
export const removeFromArray = async (collectionPath: string, id: string, field: string, value: any): Promise<void> => {
  try {
    const segments = collectionPath.split('/') as [string, ...string[]];
    const docRef = doc(firestore, ...segments, id);
    await updateDoc(docRef, {
      [field]: arrayRemove(value),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error removing from array field ${field} in document ${id}:`, error);
    throw error;
  }
};

/**
 * Get documents with compound queries
 * @param collectionPath Collection path
 * @param conditions Array of query conditions
 * @param options Additional query options
 * @returns Promise resolving to array of documents
 */
export const getDocumentsWithCompoundQuery = async <T extends FirestoreDocument>(
  collectionPath: string,
  conditions: Array<{
    field: string;
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'array-contains' | 'in' | 'not-in' | 'array-contains-any';
    value: any;
  }>,
  options: {
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
    limitCount?: number;
  } = {}
): Promise<T[]> => {
  try {
    const { orderByField, orderDirection = 'desc', limitCount } = options;
    const segments = collectionPath.split('/') as [string, ...string[]];
    const collectionRef = collection(firestore, ...segments);
    let queryRef: Query<DocumentData> = collectionRef;

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
    return querySnapshot.docs.map(doc => convertDoc<T>(doc));
  } catch (error) {
    console.error(`Error fetching documents with compound query from ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Get document count for a collection or query
 * @param collectionPath Collection path
 * @param conditions Optional query conditions
 * @returns Promise resolving to document count
 */
export const getDocumentCount = async (
  collectionPath: string,
  conditions: Array<{
    field: string;
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'array-contains' | 'in' | 'not-in' | 'array-contains-any';
    value: any;
  }> = []
): Promise<number> => {
  try {
    const segments = collectionPath.split('/') as [string, ...string[]];
    const collectionRef = collection(firestore, ...segments);
    let queryRef: Query<DocumentData> = collectionRef;

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
