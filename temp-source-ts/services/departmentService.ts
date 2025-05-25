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

export interface Department {
  department: string;
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  provinceId: string; // Required for multi-province architecture
  branchId?: string;
  parentDepartmentId?: string | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  status?: 'active' | 'inactive';
}

interface GetDepartmentsOptions {
  provinceId: string | null; // Required for multi-province architecture
  status?: 'active' | 'inactive';
  branchId?: string;
  parentDepartmentId?: string | null;
  limit?: number;
}

/**
 * Get departments with optional filtering
 * @param options - Filter options including provinceId (required for multi-province architecture)
 * @returns Promise resolving to an array of Department objects
 */
export const getDepartments = async (options: GetDepartmentsOptions): Promise<Department[]> => {
  try {
    const { provinceId, status = 'active', branchId, parentDepartmentId, limit: queryLimit = 100 } = options;

    // Ensure provinceId is provided for multi-province architecture
    if (!provinceId) {
      console.warn('getDepartments called without provinceId - this might lead to unexpected results');
      return [];
    }

    const departmentsRef = collection(firestore, 'data', 'company', 'departments');
    const constraints: QueryConstraint[] = [where('status', '==', status), where('provinceId', '==', provinceId)];

    if (branchId) {
      constraints.push(where('branchId', '==', branchId));
    }

    // Handle parent department filtering
    if (parentDepartmentId === null) {
      // Get top-level departments
      constraints.push(where('parentDepartmentId', '==', null));
    } else if (parentDepartmentId) {
      // Get child departments of a specific parent
      constraints.push(where('parentDepartmentId', '==', parentDepartmentId));
    }

    constraints.push(orderBy('name', 'asc'));
    constraints.push(limit(queryLimit));

    const departmentQuery = query(departmentsRef, ...constraints);
    const snapshot = await getDocs(departmentQuery);

    return snapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data()
        }) as Department
    );
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

/**
 * Get a department by ID
 */
export const getDepartmentById = async (departmentId: string): Promise<Department | null> => {
  try {
    const departmentDoc = await getDoc(doc(firestore, 'departments', departmentId));

    if (!departmentDoc.exists()) {
      return null;
    }

    return {
      id: departmentDoc.id,
      ...departmentDoc.data()
    } as Department;
  } catch (error) {
    console.error('Error fetching department by ID:', error);
    throw error;
  }
};

/**
 * Create a new department
 */
export const createDepartment = async (departmentData: Omit<Department, 'id'>): Promise<string> => {
  try {
    // Ensure provinceId is included for multi-province support
    if (!departmentData.provinceId) {
      throw new Error('Province ID is required when creating a department');
    }

    const departmentsRef = collection(firestore, 'departments');

    const docRef = await addDoc(departmentsRef, {
      ...departmentData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: departmentData.status || 'active'
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating department:', error);
    throw error;
  }
};

/**
 * Update a department
 */
export const updateDepartment = async (departmentId: string, data: Partial<Omit<Department, 'id'>>): Promise<void> => {
  try {
    const departmentRef = doc(firestore, 'departments', departmentId);

    await updateDoc(departmentRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating department:', error);
    throw error;
  }
};

/**
 * Delete a department (soft delete by setting status to inactive)
 */
export const deleteDepartment = async (departmentId: string): Promise<void> => {
  try {
    const departmentRef = doc(firestore, 'departments', departmentId);

    await updateDoc(departmentRef, {
      status: 'inactive',
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    throw error;
  }
};
