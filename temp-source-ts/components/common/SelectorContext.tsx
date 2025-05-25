import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, QueryConstraint, onSnapshot } from 'firebase/firestore';
import { firestore as db } from '../../services/firebase';

interface BaseItem {
  id: string;
  name: string;
  code?: string;
  isActive?: boolean;
}

interface DataContextState<T> {
  items: T[];
  loading: boolean;
  error: Error | null;
}

export function createDataContext<T extends BaseItem>(
  collectionName: string,
  additionalConstraints: QueryConstraint[] = []
) {
  const DataContext = createContext<DataContextState<T> | undefined>(undefined);

  const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<DataContextState<T>>({
      items: [],
      loading: true,
      error: null
    });

    useEffect(() => {
      const baseQuery = query(collection(db, collectionName), where('isActive', '==', true), ...additionalConstraints);

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        baseQuery,
        snapshot => {
          const data = snapshot.docs.map(
            doc =>
              ({
                id: doc.id,
                ...doc.data()
              }) as T
          );
          setState({ items: data, loading: false, error: null });
        },
        error => {
          setState(prev => ({ ...prev, loading: false, error: error as Error }));
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    }, []);

    return <DataContext.Provider value={state}>{children}</DataContext.Provider>;
  };

  const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
      throw new Error(`useData must be used within a ${collectionName} DataProvider`);
    }
    return context;
  };

  return { DataProvider, useData };
}
