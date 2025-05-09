import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  Timestamp,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  QueryConstraint
} from 'firebase/firestore';
import { firestore } from './firebase';
import { User } from '../types/user';

interface GetUsersOptions {
  provinceId: string | null; // Required for multi-province architecture
  status?: 'active' | 'inactive' | 'pending';
  role?: string;
  branch?: string;
  department?: string;
  limit?: number;
  startAfter?: DocumentSnapshot;
}

/**
 * Get users with optional filtering
 * @param options - Filter options including provinceId (required for multi-province architecture)
 * @returns Promise resolving to an array of User objects
 */
export const getUsers = async (options: GetUsersOptions): Promise<User[]> => {
  try {
    const {
      provinceId,
      status = 'active',
      role,
      branch,
      department,
      limit: queryLimit = 100,
      startAfter: startAfterDoc
    } = options;

    // Ensure provinceId is provided for multi-province architecture
    if (!provinceId) {
      console.warn('getUsers called without provinceId - this might lead to unexpected results');
      return [];
    }

    const usersRef = collection(firestore, 'data', 'users', 'profiles');
    const constraints: QueryConstraint[] = [
      where('status', '==', status),
      where('provinceId', '==', provinceId) // Required filter for multi-province architecture
    ];

    // Add optional filters
    if (role) {
      constraints.push(where('role', '==', role));
    }
    if (branch) {
      constraints.push(where('branch', '==', branch));
    }
    if (department) {
      constraints.push(where('department', '==', department));
    }

    // Add sorting and pagination
    constraints.push(orderBy('displayName', 'asc'));
    constraints.push(limit(queryLimit));

    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
    }

    const userQuery = query(usersRef, ...constraints);
    const snapshot = await getDocs(userQuery);

    return snapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data()
        }) as User
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Get a single user by ID
 * @param userId - The ID of the user to retrieve
 * @returns Promise resolving to a User object or null if not found
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(firestore, 'data', 'users', 'profiles', userId));

    if (!userDoc.exists()) {
      return null;
    }

    return {
      id: userDoc.id,
      ...userDoc.data()
    } as User;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

/**
 * Update user data
 * @param userId User ID to update
 * @param data Updated user data
 */
export const updateUser = async (userId: string, data: Partial<Omit<User, 'id'>>): Promise<void> => {
  try {
    const userRef = doc(firestore, 'users', userId);

    await updateDoc(userRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Create a new user
 * @param userData User data to create
 * @returns The created user ID
 */
export const createUser = async (userData: Omit<User, 'id'>): Promise<string> => {
  try {
    const usersRef = collection(firestore, 'users');

    const docRef = await addDoc(usersRef, {
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: userData.status || 'active'
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Get users by role with proper pagination
 * @param role - The role to filter by
 * @param provinceId - The province ID (required for multi-province architecture)
 * @param lastDoc - The last document for pagination
 * @param pageSize - The number of users to fetch
 * @returns Promise resolving to an object with users array, last doc, and hasMore flag
 */
export const getUsersByRole = async (
  role: string,
  provinceId: string | null,
  lastDoc?: DocumentSnapshot,
  pageSize = 20
): Promise<{ users: User[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> => {
  try {
    // Ensure provinceId is provided for multi-province architecture
    if (!provinceId) {
      console.warn('getUsersByRole called without provinceId - this might lead to unexpected results');
      return {
        users: [],
        lastDoc: null,
        hasMore: false
      };
    }

    const usersRef = collection(firestore, 'data', 'users', 'profiles');
    const constraints: QueryConstraint[] = [
      where('role', '==', role),
      where('status', '==', 'active'),
      where('provinceId', '==', provinceId), // Required filter for multi-province architecture
      orderBy('displayName', 'asc'),
      limit(pageSize + 1) // Get one extra to check if there's more
    ];

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const userQuery = query(usersRef, ...constraints);
    const snapshot = await getDocs(userQuery);

    const users: User[] = [];
    let newLastDoc: DocumentSnapshot | null = null;

    // Process results
    snapshot.docs.forEach((doc, index) => {
      if (index < pageSize) {
        users.push({
          id: doc.id,
          ...doc.data()
        } as User);
      }

      // Save the last document for pagination
      if (index === Math.min(snapshot.docs.length - 1, pageSize - 1)) {
        newLastDoc = doc;
      }
    });

    // Determine if there are more results
    const hasMore = snapshot.docs.length > pageSize;

    return {
      users,
      lastDoc: newLastDoc,
      hasMore
    };
  } catch (error) {
    console.error('Error fetching users by role:', error);
    throw error;
  }
};
