import React, { createContext, useState, useCallback, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../services/firebase';
import { Province } from '../types/province';
import { useAuth } from '../hooks/useAuth';
import { hasAdminAccess } from '../utils/roleUtils';

interface ProvinceContextType {
  provinces: Province[];
  loading: boolean;
  error: Error | null;
  byId: {
    [provinceId: string]: Province;
  };
  lastFetched: {
    [provinceId: string]: number;
  };
  refreshProvinces: () => Promise<void>;
  canAccessSettings: boolean;  // Expose admin access status
}

const initialState: ProvinceContextType = {
  provinces: [],
  loading: false,
  error: null,
  byId: {},
  lastFetched: {},
  refreshProvinces: async () => { throw new Error('Provider not initialized'); },
  canAccessSettings: false
};

export const ProvinceContext = createContext<ProvinceContextType>(initialState);

interface ProvinceProviderProps {
  children: React.ReactNode;
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const ProvinceProvider: React.FC<ProvinceProviderProps> = ({ children }) => {
  const { userProfile } = useAuth();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [byId, setById] = useState<{ [provinceId: string]: Province }>({});
  const [lastFetched, setLastFetched] = useState<{ [provinceId: string]: number }>({});

  // Check if user has admin access
  const canAccessSettings = userProfile ? hasAdminAccess(userProfile.role) : false;

  const fetchProvinces = useCallback(async (skipCache = false) => {
    // Check admin access before fetching
    if (!canAccessSettings) {
      setError(new Error('Unauthorized: Admin access required'));
      return;
    }
    
    // Return cached data if it's still valid
    const now = Date.now();
    const cachedProvinces = Object.values(byId);
    const lastFetchTime = lastFetched['all'];
    
    if (!skipCache && lastFetchTime && now - lastFetchTime < CACHE_DURATION && cachedProvinces.length > 0) {
      return;
    }

    // If user doesn't have admin access, don't fetch data
    if (!canAccessSettings) {
      setError(new Error('Unauthorized: Insufficient permissions'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const provincesRef = collection(firestore, 'data', 'company', 'provinces');
      const provincesQuery = query(
        provincesRef,
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(provincesQuery);
      const provincesList: Province[] = [];
      const provincesById: { [provinceId: string]: Province } = {};

      snapshot.forEach(doc => {
        const province = {
          id: doc.id,
          ...doc.data()
        } as Province;

        provincesList.push(province);
        provincesById[province.id] = province;
      });

      // Sort provinces by name
      provincesList.sort((a, b) => a.name.localeCompare(b.name));

      setProvinces(provincesList);
      setById(provincesById);
      setLastFetched(prev => ({
        ...prev,
        all: Date.now()
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch provinces');
      console.error('Error fetching provinces:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [byId, lastFetched, canAccessSettings]);

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  const refreshProvinces = useCallback(async () => {
    await fetchProvinces(true);
  }, [fetchProvinces]);

  return (
    <ProvinceContext.Provider
      value={{
        provinces,
        loading,
        error,
        byId,
        lastFetched,
        refreshProvinces,
        canAccessSettings
      }}
    >
      {children}
    </ProvinceContext.Provider>
  );
};
