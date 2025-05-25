import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { firestore } from 'services/firebase';
import { Employee } from 'modules/employees/types/index';
import { setEmployees, setLoading, setError } from 'store/slices/employeesSlice';
import { useProvince } from 'hooks/useProvince';
import { serializeEmployees } from 'utils/timestampUtils';

interface EmployeeContextType {
  employees: Record<string, Employee>;
  loading: boolean;
  error: string | null;
}

export const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const { currentProvince } = useProvince();
  const [employees, setEmployeesState] = useState<Record<string, Employee>>({});
  const [loading, setLoadingState] = useState<boolean>(true);
  const [error, setErrorState] = useState<string | null>(null);

  useEffect(() => {
    if (!currentProvince?.id) return;
    dispatch(setLoading(true));
    setLoadingState(true);
    setErrorState(null);
    const employeesRef = collection(firestore, 'data', 'company', 'employees');
    const q = query(employeesRef, where('provinceId', '==', currentProvince.id));
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const data: Record<string, Employee> = {};
        snapshot.forEach(doc => {
          data[doc.id] = { id: doc.id, ...doc.data() } as Employee;
        });
        setEmployeesState(data);
        // Serialize timestamp fields before dispatching to Redux
        const serializedData = serializeEmployees(data);
        dispatch(setEmployees(serializedData));
        dispatch(setLoading(false));
        setLoadingState(false);
      },
      err => {
        setErrorState(err.message);
        dispatch(setError(err.message));
        setLoadingState(false);
        dispatch(setLoading(false));
      }
    );
    return () => unsubscribe();
  }, [currentProvince?.id, dispatch]);

  return <EmployeeContext.Provider value={{ employees, loading, error }}>{children}</EmployeeContext.Provider>;
};

export const useEmployeeContext = () => useContext(EmployeeContext);
