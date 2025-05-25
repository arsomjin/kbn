import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firestore as db } from '../services/firebase';
import { useLoading } from './useLoading';

interface Department {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
}

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        console.log('[useDepartments] Starting to fetch departments...');
        showLoading();
        setError(null);
        const departmentsRef = collection(db, 'data', 'company', 'departments');
        const q = query(departmentsRef, where('status', '==', 'active'), orderBy('code', 'asc'));
        console.log('[useDepartments] Query created, fetching documents...');
        const snapshot = await getDocs(q);
        console.log('[useDepartments] Documents fetched:', {
          totalDocs: snapshot.size,
          docs: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        });
        const departmentData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Department[];
        setDepartments(departmentData);
        console.log('[useDepartments] Departments set:', departmentData);
      } catch (err) {
        console.error('[useDepartments] Error fetching departments:', err);
        const message = err instanceof Error ? err.message : 'Unexpected error';
        setError(message);
      } finally {
        hideLoading();
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  return { departments, loading, error };
}
