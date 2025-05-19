import { useState, useEffect, useCallback } from 'react';
import { getProvinces } from '../services/provinceService';
import { Province } from '../types/province';
import { useAuth } from 'contexts/AuthContext';

interface UseProvincesOptions {
  status?: 'active' | 'inactive';
  region?: string;
}

interface UseProvincesReturn {
  provinces: Province[];
  loading: boolean;
  error: Error | null;
  refreshProvinces: () => Promise<void>;
  getProvinceName: (provinceId: string, lang?: 'th' | 'en') => string;
  validateProvinceId: (provinceId: string) => boolean;
}

const provincesCache = new Map<string, { data: Province[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useProvinces = (options?: UseProvincesOptions & { skipCache?: boolean }): UseProvincesReturn => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, isAuthenticated } = useAuth();

  const fetchProvinces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Log authentication state
      console.log('Auth state when fetching provinces:', {
        isAuthenticated,
        userId: user?.uid,
        email: user?.email
      });

      // Check cache if not skipping
      const now = Date.now();
      const cacheKey = JSON.stringify(options || {});
      const cached = provincesCache.get(cacheKey);

      if (!options?.skipCache && cached && now - cached.timestamp < CACHE_TTL) {
        setProvinces(cached.data);
        setLoading(false);
        return;
      }

      // Fetch fresh data
      const data = await getProvinces({
        status: options?.status,
        region: options?.region
      });

      // Update cache
      provincesCache.set(cacheKey, {
        data,
        timestamp: now
      });

      setProvinces(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch provinces');
      setError(error);
      console.error('Error fetching provinces:', error);
    } finally {
      setLoading(false);
    }
  }, [options, user, isAuthenticated]);

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  const getProvinceName = useCallback(
    (provinceId: string, lang: 'th' | 'en' = 'th'): string => {
      const province = provinces.find(p => p.id === provinceId);
      if (!province) return '';
      return lang === 'th' ? province.name : province.nameEn;
    },
    [provinces]
  );

  const validateProvinceId = useCallback(
    (provinceId: string): boolean => {
      if (!provinceId) return false;
      return provinces.some(p => p.id === provinceId && p.status === 'active');
    },
    [provinces]
  );

  return {
    provinces,
    loading,
    error,
    refreshProvinces: fetchProvinces,
    getProvinceName,
    validateProvinceId
  };
};
