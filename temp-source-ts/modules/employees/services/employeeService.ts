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
  DocumentData
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore as db, storage } from '../../../services/firebase';
import { Employee, EmployeeFormData, EmployeeFilters } from '../types';
import { DateTime } from 'luxon';

const COLLECTION_NAME = 'data/company/employees';

export const employeeService = {
  async getEmployees(provinceId: string, filters: EmployeeFilters = {}): Promise<Employee[]> {
    try {
      const employeesRef = collection(db, COLLECTION_NAME);
      let q = query(
        employeesRef,
        where('provinceId', '==', provinceId),
        where('deleted', '==', false),
        orderBy('createdAt', 'desc')
      );

      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters.department) {
        q = query(q, where('department', '==', filters.department));
      }

      if (filters.position) {
        q = query(q, where('position', '==', filters.position));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Employee[];
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw new Error('Failed to fetch employees');
    }
  },

  async getEmployeeById(id: string): Promise<Employee | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Employee;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw new Error('Failed to fetch employee');
    }
  },

  async createEmployee(data: EmployeeFormData, userId: string): Promise<string> {
    try {
      const employeeData: DocumentData = {
        ...data,
        startDate: Timestamp.fromDate(data.startDate),
        endDate: data.endDate ? Timestamp.fromDate(data.endDate) : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: userId,
        updatedBy: userId,
        deleted: false
      };

      // Upload documents if any
      if (data.documents && data.documents.length > 0) {
        const uploadedDocs = await Promise.all(
          data.documents.map(async file => {
            const storageRef = ref(storage, `employees/${Date.now()}_${file.name}`);
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

      const docRef = await addDoc(collection(db, COLLECTION_NAME), employeeData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw new Error('Failed to create employee');
    }
  },

  async updateEmployee(id: string, data: Partial<EmployeeFormData>, userId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData: DocumentData = {
        ...data,
        updatedAt: Timestamp.now(),
        updatedBy: userId
      };

      if (data.startDate) {
        updateData.startDate = Timestamp.fromDate(data.startDate);
      }
      if (data.endDate) {
        updateData.endDate = Timestamp.fromDate(data.endDate);
      }

      // Handle document uploads
      if (data.documents && data.documents.length > 0) {
        const uploadedDocs = await Promise.all(
          data.documents.map(async file => {
            const storageRef = ref(storage, `employees/${Date.now()}_${file.name}`);
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
        updateData.documents = uploadedDocs;
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating employee:', error);
      throw new Error('Failed to update employee');
    }
  },

  async deleteEmployee(id: string, userId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        deleted: true,
        updatedAt: Timestamp.now(),
        updatedBy: userId
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw new Error('Failed to delete employee');
    }
  },

  formatDate(date: Date | Timestamp): string {
    if (date instanceof Timestamp) {
      return DateTime.fromMillis(date.toMillis()).toFormat('yyyy-MM-dd');
    }
    return DateTime.fromJSDate(date).toFormat('yyyy-MM-dd');
  }
};
