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
  QueryConstraint
} from 'firebase/firestore';
import { firestore } from './firebase';
import { Branch } from '../types/branch';

// Collection path constant
const BRANCHES_COLLECTION = 'data/company/branches';

/**
 * Get all branches with optional province filtering
 * @param provinceId - Optional province ID to filter by
 * @returns Promise resolving to an array of Branch objects
 */
export const getBranches = async (params?: {
  provinceId?: string;
  includeInactive?: boolean;
  includeAll?: boolean;
}): Promise<Branch[]> => {
  try {
    const branchesRef = collection(firestore, BRANCHES_COLLECTION);
    const constraints: QueryConstraint[] = [];

    // Only include active status filter if we're not including all statuses
    if (!params?.includeAll && !params?.includeInactive) {
      constraints.push(where('status', '==', 'active'));
    }

    // Add province filter if specified
    if (params?.provinceId) {
      constraints.push(where('provinceId', '==', params.provinceId));
    }

    // Always order by created date desc
    constraints.push(where('deleted', '!=', true));
    constraints.push(orderBy('created', 'desc'));

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
    throw new Error('Failed to fetch branches');
  }
};

/**
 * Create a new branch
 * @param branchData - The branch data to create
 * @returns Promise resolving to the new branch ID
 */
export const createBranch = async (branchData: Omit<Branch, 'id'>): Promise<string> => {
  try {
    if (!branchData.provinceId) {
      throw new Error('Province ID is required when creating a branch');
    }

    const branchesRef = collection(firestore, BRANCHES_COLLECTION);
    const docRef = await addDoc(branchesRef, {
      ...branchData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: branchData.status || 'active'
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating branch:', error);
    throw new Error('Failed to create branch');
  }
};

/**
 * Update an existing branch
 * @param branchId - The ID of the branch to update
 * @param data - The updated branch data
 */
export const updateBranch = async (branchId: string, data: Partial<Omit<Branch, 'id'>>): Promise<void> => {
  try {
    const branchRef = doc(firestore, BRANCHES_COLLECTION, branchId);

    await updateDoc(branchRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating branch:', error);
    throw new Error('Failed to update branch');
  }
};

/**
 * Delete a branch (soft delete by setting status to inactive)
 * @param branchId - The ID of the branch to delete
 */
export const deleteBranch = async (branchId: string): Promise<void> => {
  try {
    const branchRef = doc(firestore, BRANCHES_COLLECTION, branchId);

    await updateDoc(branchRef, {
      deleted: true,
      status: 'inactive',
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error deleting branch:', error);
    throw new Error('Failed to delete branch');
  }
};
