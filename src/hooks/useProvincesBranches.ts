import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchBranchesByProvince } from '../store/slices/branchesSlice';
import { Branch } from '../types/branch';

export const useProvinceBranches = (provinceId?: string): {
  branches: Branch[];
  loading: boolean;
  error: string | null;
} => {
  const dispatch = useAppDispatch();
  
  const branches = useAppSelector(state => 
    provinceId ? (state as any).branches.byProvince[provinceId] || [] : []
  );
  const loading = useAppSelector(state => (state as any).branches.loading);
  const error = useAppSelector(state => (state as any).branches.error);

  useEffect(() => {
    if (provinceId) {
      dispatch(fetchBranchesByProvince(provinceId));
    }
  }, [dispatch, provinceId]);

  return { branches, loading, error };
};
