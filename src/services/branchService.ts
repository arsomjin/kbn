import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  addDoc,
  Timestamp,
  orderBy,
  limit,
  QueryConstraint
} from 'firebase/firestore';
import { firestore } from './firebase';

export interface Branch {
  id: string;
  name: string;
  address?: string;
  city?: string;
  postalCode?: string;
  phoneNumber?: string;
  email?: string;
  managerId?: string;
  provinceId: string; // Required for multi-province architecture
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  status?: 'active' | 'inactive';
}

interface GetBranchesOptions {
  provinceId?: string | null;
  status?: 'active' | 'inactive';
  limit?: number;
}

/**
 * Get branches with optional filtering
 * @param options - Filter options including provinceId (required for multi-province architecture)
 * @returns Promise resolving to an array of Branch objects
 */
export const getBranches = async (options: GetBranchesOptions = {}): Promise<Branch[]> => {
  try {
    const { provinceId, status = 'active', limit: queryLimit = 100 } = options;

    // Ensure provinceId is provided for multi-province architecture
    if (!provinceId) {
      console.warn('getBranches called without provinceId - this might lead to unexpected results');
      // We don't throw an error to maintain backward compatibility
    }

    const branchesRef = collection(firestore, 'data', 'company', 'branches');
    const constraints: QueryConstraint[] = [where('status', '==', status)];

    // Required for multi-province architecture
    if (provinceId) {
      constraints.push(where('provinceId', '==', provinceId));
    }

    constraints.push(orderBy('name', 'asc'));
    constraints.push(limit(queryLimit));

    const branchQuery = query(branchesRef, ...constraints);
    const snapshot = await getDocs(branchQuery);

    return snapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data()
        }) as Branch
    );
  } catch (error) {
    console.error('Error fetching branches:', error);
    throw error;
  }
};

/**
 * Get a branch by ID
 * @param branchId - The ID of the branch to retrieve
 * @returns Promise resolving to a Branch object or null if not found
 */
export const getBranchById = async (branchId: string): Promise<Branch | null> => {
  try {
    const branchDoc = await getDoc(doc(firestore, 'data', 'company', 'branches', branchId));

    if (!branchDoc.exists()) {
      return null;
    }

    return {
      id: branchDoc.id,
      ...branchDoc.data()
    } as Branch;
  } catch (error) {
    console.error('Error fetching branch by ID:', error);
    throw error;
  }
};

/**
 * Create a new branch
 * @param branchData - The branch data to create (provinceId is required)
 * @returns Promise resolving to the created branch ID
 */
export const createBranch = async (branchData: Omit<Branch, 'id'>): Promise<string> => {
  try {
    // Ensure provinceId is included for multi-province support
    if (!branchData.provinceId) {
      throw new Error('Province ID is required when creating a branch');
    }

    const branchesRef = collection(firestore, 'data', 'company', 'branches');

    const docRef = await addDoc(branchesRef, {
      ...branchData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: branchData.status || 'active'
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating branch:', error);
    throw error;
  }
};

/**
 * Update a branch
 * @param branchId - The ID of the branch to update
 * @param data - The branch data to update
 */
export const updateBranch = async (branchId: string, data: Partial<Omit<Branch, 'id'>>): Promise<void> => {
  try {
    const branchRef = doc(firestore, 'data', 'company', 'branches', branchId);

    await updateDoc(branchRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating branch:', error);
    throw error;
  }
};

/**
 * Delete a branch (soft delete by setting status to inactive)
 * @param branchId - The ID of the branch to delete
 */
export const deleteBranch = async (branchId: string): Promise<void> => {
  try {
    const branchRef = doc(firestore, 'data', 'company', 'branches', branchId);

    await updateDoc(branchRef, {
      status: 'inactive',
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error deleting branch:', error);
    throw error;
  }
};
