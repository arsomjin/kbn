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
  FieldValue
} from 'firebase/firestore';
import { firestore } from '../services/firebase';
import { FirebaseErrorCategory } from './firebaseErrorMessages';

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
    const docRef = doc(firestore, collectionPath, id);
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
    // Create a reference with optional custom ID or auto-generated ID
    const docRef = customId ? doc(firestore, collectionPath, customId) : doc(collection(firestore, collectionPath));

    // Add timestamps
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
    const docRef = doc(firestore, collectionPath, id);

    // Add updatedAt timestamp and ensure no id field is included
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
    const docRef = doc(firestore, collectionPath, id);
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

    // Build the query
    const q = collection(firestore, collectionPath);
    let queryObj = query(q);

    // Add where conditions
    whereConditions.forEach(([field, operator, value]) => {
      queryObj = query(queryObj, where(field, operator, value));
    });

    // Add ordering
    queryObj = query(queryObj, orderBy(orderByField, orderDirection));

    // Add pagination
    queryObj = query(queryObj, limit(limitCount + 1)); // +1 to check if there are more results

    if (startAfterDoc) {
      queryObj = query(queryObj, startAfter(startAfterDoc));
    }

    const querySnapshot = await getDocs(queryObj);

    // Process results
    const items: T[] = [];
    let lastVisible: DocumentSnapshot | null = null;

    // Fix the forEach callback to include proper types
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const index = items.length;
      // Only add documents up to the limit
      if (index < limitCount) {
        items.push(convertDoc<T>(doc));
        lastVisible = doc;
      }
    });

    // Check if there are more results
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
      const docRef = doc(firestore, collectionPath, id);

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
  const docRef = doc(firestore, collectionPath, id);

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

  // Build the query
  const q = collection(firestore, collectionPath);
  let queryObj = query(q);

  // Add where conditions
  whereConditions.forEach(([field, operator, value]) => {
    queryObj = query(queryObj, where(field, operator, value));
  });

  // Add ordering
  queryObj = query(queryObj, orderBy(orderByField, orderDirection));

  // Add limit
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
export const incrementField = async (
  collectionPath: string,
  id: string,
  field: string,
  value = 1
): Promise<void> => {
  try {
    const docRef = doc(firestore, collectionPath, id);

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
