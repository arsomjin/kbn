import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firestore } from '../services/firebase';
import { useAuth } from 'contexts/AuthContext';
import { message } from 'antd';

export interface Province {
  id: string;
  name: string;
  nameEn: string;
  code: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  region?: string;
}

export interface ProvinceContextType {
  provinces: Province[];
  currentProvince: Province | null;
  setCurrentProvince: (province: Province | null) => void;
  loading: boolean;
  error: Error | null;
  refreshProvinces: () => Promise<void>;
  getProvinceById: (id: string) => Province | undefined;
  hasProvinceAccess: (provinceId: string) => boolean;
  switchProvince: (provinceId: string) => boolean;
  getProvinceName: (provinceId: string) => string;
  byId: Record<string, Province>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const ProvinceContext = createContext<ProvinceContextType | null>(null);

export const ProvinceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [currentProvince, setCurrentProvince] = useState<Province | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetched, setLastFetched] = useState<number>(0);
  const { user } = useAuth();

  // Create a memoized byId map for efficient province lookups
  const byId = useMemo(() => {
    return provinces.reduce(
      (acc, province) => {
        acc[province.id] = province;
        return acc;
      },
      {} as Record<string, Province>
    );
  }, [provinces]);

  const fetchProvinces = useCallback(
    async (forceRefresh = false) => {
      if (!user) {
        setProvinces([]);
        setCurrentProvince(null);
        setLoading(false);
        return;
      }

      const now = Date.now();
      if (!forceRefresh && now - lastFetched < CACHE_DURATION && provinces.length > 0) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const provincesRef = collection(firestore, 'data/company/provinces');
        const q = query(provincesRef, where('status', '==', 'active'), orderBy('name', 'asc'));

        const snapshot = await getDocs(q);
        const provincesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Province[];

        setProvinces(provincesData);
        setLastFetched(now);

        // Set first province as current if none selected
        if (!currentProvince && provincesData.length > 0) {
          setCurrentProvince(provincesData[0]);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch provinces';
        setError(new Error(errorMessage));
        message.error('Failed to load provinces');
        console.error('Error loading provinces:', error);
      } finally {
        setLoading(false);
      }
    },
    [user, lastFetched, provinces.length, currentProvince]
  );

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  useEffect(() => {
    console.log('[ProvinceProvider] user:', user);
  }, [user]);

  useEffect(() => {
    console.log('[ProvinceProvider] provinces:', provinces);
  }, [provinces]);

  useEffect(() => {
    console.log('[ProvinceProvider] currentProvince:', currentProvince);
  }, [currentProvince]);

  const getProvinceById = useCallback(
    (id: string): Province | undefined => {
      return provinces.find(province => province.id === id);
    },
    [provinces]
  );

  const hasProvinceAccess = useCallback(
    (provinceId: string): boolean => {
      if (!user) return false;
      // Add your province access logic here
      // For example, check if user has access to the province based on their role/permissions
      return true;
    },
    [user]
  );

  const refreshProvinces = useCallback(async () => {
    await fetchProvinces(true);
  }, [fetchProvinces]);

  const switchProvince = useCallback(
    (provinceId: string): boolean => {
      const province = getProvinceById(provinceId);
      if (!province) {
        message.error('Province not found');
        return false;
      }

      if (!hasProvinceAccess(provinceId)) {
        message.error("You don't have access to this province");
        return false;
      }

      setCurrentProvince(province);
      return true;
    },
    [getProvinceById, hasProvinceAccess]
  );

  const getProvinceName = useCallback(
    (provinceId: string): string => {
      const province = getProvinceById(provinceId);
      return province?.name || 'Unknown Province';
    },
    [getProvinceById]
  );

  const value: ProvinceContextType = {
    provinces,
    currentProvince,
    setCurrentProvince,
    loading,
    error,
    refreshProvinces,
    getProvinceById,
    hasProvinceAccess,
    switchProvince,
    getProvinceName,
    byId
  };

  return <ProvinceContext.Provider value={value}>{children}</ProvinceContext.Provider>;
};
