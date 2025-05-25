import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
  collectionGroup,
  FirestoreError
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore as db, storage } from '../../../services/firebase';
import { Employee, EmployeeFormData, EmployeeFilters, EmployeeStatus } from '../../../types/hr';
import dayjs from '../../../utils/dayjs';
import { cleanValuesBeforeSave, processFirestoreDataForForm } from 'utils/dateHandling';

const COLLECTION_PATH = 'data/company/employees';

export const hrEmployeeService = {
  /**
   * Get employees by access level with proper 3-level access control
   * @param accessLevel - 'root' | 'province' | 'branch'
   * @param provinceId - Required for province and branch levels
   * @param branchCode - Required for branch level
   * @param filters - Additional filters to apply
   */
  async getEmployeesByAccessLevel(
    accessLevel: 'root' | 'province' | 'branch',
    provinceId?: string,
    branchCode?: string,
    filters: EmployeeFilters = {}
  ): Promise<Employee[]> {
    try {
      const employeesRef = collection(db, COLLECTION_PATH);
      let q;

      // For root level, let's first try without any filters to see if there's data
      if (accessLevel === 'root') {
        // Check if the collection exists by trying different possible paths
        const possiblePaths = [
          'data/company/employees',
          'employees',
          'sections/hr/employees',
          'company/employees',
          'data/hr/employees',
          'hr/employees'
        ];

        let foundDataPath = null;

        for (const path of possiblePaths) {
          try {
            const testRef = collection(db, path);
            const testSnapshot = await getDocs(query(testRef));

            if (testSnapshot.docs.length > 0) {
              foundDataPath = path;

              // If we found a better path with data, use it for the actual query
              if (path !== COLLECTION_PATH && testSnapshot.docs.filter(doc => doc.data().deleted !== true).length > 0) {
                const newEmployeesRef = collection(db, path);
                try {
                  q = query(newEmployeesRef, where('deleted', '==', false), orderBy('firstName'));
                } catch (orderError) {
                  q = query(newEmployeesRef, where('deleted', '==', false));
                }

                // Execute the query with the correct path and return early
                const finalSnapshot = await getDocs(q);
                const employees = finalSnapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
                })) as Employee[];

                return this.applyTextSearchFilter(employees, filters.search);
              }
            }
          } catch (error) {
            // Continue checking other paths
          }
        }

        // First, check if there's any data in the main collection
        const allDocsQuery = query(employeesRef);
        const allSnapshot = await getDocs(allDocsQuery);

        // Now apply the deleted filter
        q = query(employeesRef, where('deleted', '==', false));
        const nonDeletedSnapshot = await getDocs(q);

        // Try to add ordering if there are non-deleted documents
        if (nonDeletedSnapshot.docs.length > 0) {
          try {
            q = query(employeesRef, where('deleted', '==', false), orderBy('firstName'));
          } catch (orderError) {
            // Fallback to query without ordering
            q = query(employeesRef, where('deleted', '==', false));
          }
        } else {
          // If no documents match the deleted filter, just use the base query
          q = query(employeesRef);
        }
      } else {
        // For province/branch level
        q = query(employeesRef, where('deleted', '==', false), orderBy('firstName'));

        // Apply access level filtering
        if (accessLevel === 'province' || accessLevel === 'branch') {
          if (!provinceId) {
            throw new Error('Province ID is required for province and branch level access');
          }
          q = query(q, where('provinceId', '==', provinceId));
        }

        if (accessLevel === 'branch') {
          if (!branchCode) {
            throw new Error('Branch code is required for branch level access');
          }
          q = query(q, where('branchCode', '==', branchCode));
        }

        // Apply additional filters for province/branch levels
        if (filters.status) {
          q = query(q, where('status', '==', filters.status));
        }
        if (filters.department) {
          q = query(q, where('department', '==', filters.department));
        }
        if (filters.position) {
          q = query(q, where('position', '==', filters.position));
        }
      }

      const snapshot = await getDocs(q);
      const employees = snapshot.docs.map(doc =>
        processFirestoreDataForForm({ id: doc.id, ...doc.data() })
      ) as Employee[];

      return this.applyTextSearchFilter(employees, filters.search);
    } catch (error) {
      // Log the real error for debugging
      console.error('getEmployeesByAccessLevel error:', error);
      throw new Error('Failed to fetch employees');
    }
  },

  /**
   * Get employees with multi-level filtering support (legacy method for backward compatibility)
   * - Level 1: Root level - Get all employees
   * - Level 2: Province level - Filter by provinceId
   * - Level 3: Branch level - Filter by provinceId and branchCode
   */
  async getEmployees(provinceId?: string, filters: EmployeeFilters = {}): Promise<Employee[]> {
    try {
      // For Level 1 (root level access) - get all employees
      if (!provinceId && !filters.provinceId) {
        const employeesRef = collection(db, COLLECTION_PATH);
        let q = query(employeesRef, where('deleted', '==', false), orderBy('firstName'));

        // Apply status filter
        if (filters.status) {
          q = query(q, where('status', '==', filters.status));
        }
        // Apply department filter
        if (filters.department) {
          q = query(q, where('department', '==', filters.department));
        }
        // Apply position filter
        if (filters.position) {
          q = query(q, where('position', '==', filters.position));
        }
        // Apply branch filter
        if (filters.branchCode) {
          q = query(q, where('branchCode', '==', filters.branchCode));
        }

        const snapshot = await getDocs(q);
        const employees = snapshot.docs.map(doc =>
          processFirestoreDataForForm({ id: doc.id, ...doc.data() })
        ) as Employee[];

        return this.applyTextSearchFilter(employees, filters.search);
      }

      // For Level 2 & 3 (province/branch level access) - filter by province and optionally branch
      const employeesRef = collection(db, COLLECTION_PATH);
      const targetProvinceId = filters.provinceId || provinceId;

      let q = query(
        employeesRef,
        where('deleted', '==', false),
        where('provinceId', '==', targetProvinceId),
        orderBy('firstName')
      );

      // Apply filters
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.department) {
        q = query(q, where('department', '==', filters.department));
      }
      if (filters.position) {
        q = query(q, where('position', '==', filters.position));
      }
      if (filters.branchCode) {
        q = query(q, where('branchCode', '==', filters.branchCode));
      }

      const snapshot = await getDocs(q);
      const employees = snapshot.docs.map(doc =>
        processFirestoreDataForForm({ id: doc.id, ...doc.data() })
      ) as Employee[];

      return this.applyTextSearchFilter(employees, filters.search);
    } catch (error) {
      throw new Error('Failed to fetch employees');
    }
  },

  /**
   * Apply text search filter to employees
   */
  applyTextSearchFilter(employees: Employee[], searchTerm?: string): Employee[] {
    if (!searchTerm) return employees;

    const search = searchTerm.toLowerCase();
    return employees.filter(
      emp =>
        emp.firstName.toLowerCase().includes(search) ||
        emp.lastName.toLowerCase().includes(search) ||
        emp.employeeId.toLowerCase().includes(search) ||
        emp.employeeCode.toLowerCase().includes(search) ||
        emp.email.toLowerCase().includes(search) ||
        (emp.nickName && emp.nickName.toLowerCase().includes(search))
    );
  },

  /**
   * Get employee by ID
   */
  async getEmployeeById(id: string, provinceId?: string): Promise<Employee | null> {
    try {
      const docRef = doc(db, COLLECTION_PATH, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const employee = processFirestoreDataForForm({ id: docSnap.id, ...docSnap.data() }) as Employee;

        // If provinceId is provided, verify access
        if (provinceId && employee.provinceId !== provinceId) {
          return null; // No access to this employee
        }

        return employee;
      }
      return null;
    } catch (error) {
      throw new Error('Failed to fetch employee');
    }
  },

  /**
   * Create a new employee
   */
  async createEmployee(provinceId: string, data: EmployeeFormData, userId: string): Promise<string> {
    try {
      // Prepare initial data
      const initialData: DocumentData = {
        ...data,
        provinceId,
        startDate: Timestamp.fromDate(data.startDate),
        endDate: data.endDate ? Timestamp.fromDate(data.endDate) : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: userId,
        updatedBy: userId,
        deleted: false
      };

      // Clean the data using our enhanced function
      const employeeData = initialData;

      // Upload documents if any
      if (data.documents && data.documents.length > 0) {
        const uploadedDocs = await Promise.all(
          data.documents.map(async file => {
            const storageRef = ref(storage, `employees/${provinceId}/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            return {
              id: storageRef.name,
              type: file.type,
              url,
              uploadedAt: Timestamp.now()
            };
          })
        );
        employeeData.documents = uploadedDocs;
      }

      const docRef = await addDoc(collection(db, COLLECTION_PATH), employeeData);
      return docRef.id;
    } catch (error) {
      throw new Error('Failed to create employee');
    }
  },

  /**
   * Update an employee
   */
  async updateEmployee(provinceId: string, id: string, data: EmployeeFormData, userId: string): Promise<void> {
    try {
      // Enhanced validation
      if (!id) {
        throw new Error('Employee ID is required for update');
      }

      if (!provinceId) {
        throw new Error('Province ID is required for update');
      }

      // Check if document exists first
      const docRef = doc(db, COLLECTION_PATH, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error(`Employee with ID ${id} not found`);
      }

      console.log(`Updating employee with ID: ${id} in data: ${JSON.stringify(data)}`);

      // Prepare update data with proper type handling using enhanced cleanValuesBeforeSave
      const initialData: Record<string, any> = {
        ...data,
        provinceId, // Ensure provinceId is included
        updatedAt: Timestamp.now(),
        updatedBy: userId
      };

      // Use the enhanced cleanValuesBeforeSave function
      const updateData = cleanValuesBeforeSave(initialData);

      // Perform the update - use type assertion to match what updateDoc expects
      await updateDoc(docRef, updateData as { [x: string]: any });
      return;
    } catch (error) {
      // Check if it's a Firebase error using type guards
      if (
        typeof error === 'object' &&
        error !== null &&
        (error instanceof FirebaseError || error instanceof FirestoreError || 'code' in error)
      ) {
        // Handle specific Firebase errors
        const fbError = error as { code?: string; message?: string };
        const code = fbError.code || '';
        const message = fbError.message || 'Unknown Firebase error';

        if (code === 'permission-denied') {
          throw new Error("You don't have permission to update this employee");
        } else if (code === 'not-found') {
          throw new Error('Employee not found');
        } else {
          throw new Error(`Firebase error: ${message}`);
        }
      }

      // Default error
      throw new Error(`Failed to update employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Soft delete an employee
   */
  async deleteEmployee(provinceId: string, id: string, userId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_PATH, id);
      await updateDoc(docRef, {
        deleted: true,
        updatedAt: Timestamp.now(),
        updatedBy: userId
      });
    } catch (error) {
      throw new Error('Failed to delete employee');
    }
  },

  /**
   * Get departments for employee form
   */
  async getDepartments(provinceId?: string): Promise<{ value: string; label: string }[]> {
    try {
      // For departments, we'll look in data/company/departments
      const deptRef = collection(db, 'data/company/departments');
      let q = query(deptRef, where('deleted', '==', false));

      // If provinceId is provided, filter by province
      if (provinceId) {
        q = query(q, where('provinceId', '==', provinceId));
      }

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        value: doc.data().code || doc.id,
        label: doc.data().name || doc.data().department
      }));
    } catch (error) {
      return [];
    }
  },

  /**
   * Get positions for employee form
   */
  async getPositions(provinceId?: string): Promise<{ value: string; label: string }[]> {
    try {
      // For positions, we'll extract unique positions from existing employees
      const employeesRef = collection(db, COLLECTION_PATH);
      let q = query(employeesRef, where('deleted', '==', false));

      // If provinceId is provided, filter by province
      if (provinceId) {
        q = query(q, where('provinceId', '==', provinceId));
      }

      const snapshot = await getDocs(q);
      const positions = new Set<string>();

      snapshot.docs.forEach(doc => {
        const position = doc.data().position;
        if (position && typeof position === 'string') {
          positions.add(position);
        }
      });

      return Array.from(positions)
        .map(position => ({
          value: position,
          label: position
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    } catch (error) {
      return [];
    }
  },

  /**
   * Format date for display
   */
  formatDate(date: Date | Timestamp): string {
    if (date instanceof Timestamp) {
      return dayjs(date.toDate()).format('DD/MM/YYYY');
    }
    return dayjs(date).format('DD/MM/YYYY');
  },

  /**
   * Format employee status for display
   */
  getStatusText(status: EmployeeStatus): string {
    const statusMap = {
      [EmployeeStatus.ACTIVE]: 'ปกติ',
      [EmployeeStatus.INACTIVE]: 'ไม่ทำงาน',
      [EmployeeStatus.ON_LEAVE]: 'พักงาน',
      [EmployeeStatus.TERMINATED]: 'ลาออก',
      [EmployeeStatus.PROBATION]: 'ทดลองงาน',
      [EmployeeStatus.RESIGNED]: 'ลาออก'
    };
    return statusMap[status] || status;
  }
};
