import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { firestore } from 'services/firebase';
// TODO: Use 'any' as fallback if Department type import fails
// import type { Department as DepartmentType } from "services/departmentService";
import { setDepartments, setLoading, setError } from 'store/slices/departmentSlice';
import { useProvince } from 'hooks/useProvince';
type DepartmentType = any;

interface DepartmentContextType {
  departments: Record<string, DepartmentType>;
  loading: boolean;
  error: string | null;
}

export const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

export const DepartmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const { currentProvince } = useProvince();
  const [departments, setDepartmentsState] = useState<Record<string, DepartmentType>>({});
  const [loading, setLoadingState] = useState<boolean>(true);
  const [error, setErrorState] = useState<string | null>(null);

  useEffect(() => {
    // console.log(`[DepartmentContext] Current province: ${currentProvince?.id}`);
    // if (!currentProvince?.id) return;
    dispatch(setLoading(true));
    setLoadingState(true);
    setErrorState(null);
    const departmentsRef = collection(firestore, 'data', 'company', 'departments');
    const q = query(departmentsRef);
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const data: Record<string, DepartmentType> = {};
        snapshot.forEach(doc => {
          data[doc.id] = { id: doc.id, ...doc.data() } as DepartmentType;
        });
        // console.log(`[DepartmentContext] Departments fetched: ${JSON.stringify(data)}`);
        setDepartmentsState(data);
        dispatch(setDepartments(data));
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

  return <DepartmentContext.Provider value={{ departments, loading, error }}>{children}</DepartmentContext.Provider>;
};

export const useDepartmentContext = () => useContext(DepartmentContext);
