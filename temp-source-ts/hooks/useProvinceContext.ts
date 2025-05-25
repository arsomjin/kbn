import { useContext } from 'react';
import { ProvinceContext } from '../contexts/ProvinceContext';

export const useProvinceContext = () => {
  const context = useContext(ProvinceContext);
  if (!context) {
    throw new Error('useProvinceContext must be used within a ProvinceProvider');
  }

  return context;
};

// Hook for getting provinces with caching
export const useProvince = (provinceId?: string) => {
  const { byId, loading, error } = useProvinceContext();

  return {
    province: provinceId ? byId[provinceId] : undefined,
    loading,
    error
  };
};
