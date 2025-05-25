import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { firestore } from 'services/firebase';
import { User } from 'types/user';
import { setUsers, setLoading, setError } from 'store/slices/usersSlice';
import { useProvince } from 'hooks/useProvince';
import { ROLES } from 'constants/roles';

interface UsersContextType {
  users: Record<string, User>;
  loading: boolean;
  error: string | null;
}

export const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const { currentProvince } = useProvince();
  const [users, setUsersState] = useState<Record<string, User>>({});
  const [loading, setLoadingState] = useState<boolean>(true);
  const [error, setErrorState] = useState<string | null>(null);

  useEffect(() => {
    dispatch(setLoading(true));
    setLoadingState(true);
    setErrorState(null);
    let q;
    const usersRef = collection(firestore, 'users');
    if (currentProvince?.id) {
      q = query(
        usersRef,
        where('provinceId', '==', currentProvince.id),
        where('deleted', '==', false),
        where('role', '!=', ROLES.DEVELOPER)
      );
    } else {
      q = query(usersRef, where('deleted', '==', false), where('role', '!=', ROLES.DEVELOPER));
    }
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const data: Record<string, User> = {};
        snapshot.forEach(doc => {
          data[doc.id] = { id: doc.id, ...doc.data() } as User;
        });
        setUsersState(data);
        dispatch(setUsers(data));
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

  return <UsersContext.Provider value={{ users, loading, error }}>{children}</UsersContext.Provider>;
};

export const useUsersContext = () => useContext(UsersContext);
