/**
 * Modern TypeScript equivalents for legacy Firebase search functions
 * Replaces getSearchData and getLatestData from temp-source
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  QuerySnapshot,
  DocumentData,
  Timestamp,
  WhereFilterOp
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { app } from '../services/firebase';
import { sortArr } from './functions';
import dayjs from 'dayjs';

// Types
interface SearchValues {
  [key: string]: any;
  startDate?: string | Date | Timestamp;
  endDate?: string | Date | Timestamp;
  month?: string;
  monthRange?: [string, string];
}

interface MapFieldName {
  date?: string;
  [key: string]: string | undefined;
}

interface GetLatestDataParams {
  collection: string;
  wheres?: [string, string, any][];
  orderBy: string;
  limit?: number;
  desc?: boolean;
}

/**
 * Modern TypeScript replacement for getSearchData
 * Searches Firestore collection with complex filters
 */
export const getSearchData = async (
  collectionPath: string,
  searchValues: SearchValues,
  sorts?: string[],
  mapFieldName?: MapFieldName
): Promise<any[]> => {
  try {
    const firestore = getFirestore(app);
    let dataArray: any[] = [];

    // Build the collection reference
    const pathSegments = collectionPath.split('/');
    let collectionRef: any = firestore;

    pathSegments.forEach((segment, index) => {
      if (index % 2 === 0) {
        collectionRef = collection(collectionRef, segment);
      } else {
        collectionRef = collectionRef.doc(segment);
      }
    });

    // Build query with where conditions
    let queryRef = collectionRef;
    const whereConditions: any[] = [];

    Object.keys(searchValues).forEach(key => {
      const value = searchValues[key];
      if (typeof value !== 'undefined' && value !== 'all') {
        switch (key) {
          case 'startDate':
            whereConditions.push([mapFieldName?.date || 'date', '>=', value]);
            break;
          case 'endDate':
            whereConditions.push([mapFieldName?.date || 'date', '<=', value]);
            break;
          case 'month':
            whereConditions.push([mapFieldName?.date || 'date', '>=', `${value}-01`]);
            whereConditions.push([mapFieldName?.date || 'date', '<=', `${value}-31`]);
            break;
          case 'monthRange':
            if (Array.isArray(value) && value.length === 2) {
              whereConditions.push([mapFieldName?.date || 'date', '>=', `${value[0]}-01`]);
              whereConditions.push([mapFieldName?.date || 'date', '<=', `${value[1]}-31`]);
            }
            break;
          default:
            whereConditions.push([key, '==', value]);
            break;
        }
      }
    });

    // Apply where conditions
    whereConditions.forEach(([field, operator, val]) => {
      queryRef = query(queryRef, where(field, operator as WhereFilterOp, val));
    });

    // Execute query
    const snapshot = await getDocs(queryRef);

    if (snapshot.empty) {
      console.warn('No documents found');
      return [];
    }

    // Process results
    snapshot.forEach(doc => {
      const data = doc.data();
      const item = {
        ...(data as DocumentData),
        _key: doc.id,
        key: doc.id
      };
      dataArray.push(item);
    });

    // Add sequential IDs
    dataArray = dataArray.map((item, id) => ({
      ...item,
      id
    }));

    // Apply sorting if specified
    if (sorts && sorts.length > 0) {
      // Use the sortArr function from utils/functions
      let sortedArray = JSON.parse(JSON.stringify(dataArray));
      sorts.forEach(sortField => {
        sortedArray = sortArr(sortedArray, sortField);
      });

      // Re-add sequential IDs after sorting
      sortedArray = sortedArray.map((item: any, id: number) => ({
        ...item,
        id
      }));

      return sortedArray;
    }

    return dataArray;
  } catch (error) {
    console.error('Error in getSearchData:', error);
    throw error;
  }
};

/**
 * Modern TypeScript replacement for getLatestData
 * Gets the latest documents from a collection
 */
export const getLatestData = async (params: GetLatestDataParams): Promise<QuerySnapshot<DocumentData> | null> => {
  const { collection: collectionPath, wheres, orderBy: orderByField, limit: limitCount = 1, desc = false } = params;

  if (!collectionPath || !orderByField) {
    return null;
  }

  try {
    const firestore = getFirestore(app);

    // Build the collection reference
    const pathSegments = collectionPath.split('/');
    let collectionRef: any = firestore;

    pathSegments.forEach((segment, index) => {
      if (index % 2 === 0) {
        collectionRef = collection(collectionRef, segment);
      } else {
        collectionRef = collectionRef.doc(segment);
      }
    });

    // Build query
    let queryRef = collectionRef;

    // Apply where conditions if provided
    if (wheres && wheres.length > 0) {
      wheres.forEach(([field, operator, value]) => {
        queryRef = query(queryRef, where(field, operator as WhereFilterOp, value));
      });
    }

    // Apply ordering
    if (orderByField) {
      queryRef = query(queryRef, orderBy(orderByField, desc ? 'desc' : 'asc'));
    }

    // Apply limit
    queryRef = query(queryRef, limit(limitCount));

    // Execute query
    const snapshot = await getDocs(queryRef);

    if (snapshot.empty) {
      console.warn('No latest data found');
      return null;
    }

    return snapshot as QuerySnapshot<DocumentData>;
  } catch (error) {
    console.error('Error in getLatestData:', error);
    throw error;
  }
};

/**
 * Helper function to convert Firestore timestamp to dayjs
 */
export const convertTimestampToDayjs = (timestamp: any) => {
  if (!timestamp) return null;

  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return dayjs(timestamp.toDate());
  }

  if (timestamp instanceof Date) {
    return dayjs(timestamp);
  }

  if (typeof timestamp === 'number') {
    return dayjs(timestamp);
  }

  if (typeof timestamp === 'string') {
    return dayjs(timestamp);
  }

  return null;
};

export default {
  getSearchData,
  getLatestData,
  convertTimestampToDayjs
};
