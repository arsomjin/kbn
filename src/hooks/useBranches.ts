import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy, QueryConstraint } from 'firebase/firestore';
import { firestore } from '../services/firebase';
import { useAuth } from './useAuth';

import { Branch } from '../types/branch';

// Cache for branches data
const branchesCache = new Map<string, {
  data: Branch[];
  timestamp: number;
}>();

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 1 * 60 * 1000; // Reduced to 1 minute for more frequent updates

interface UseBranchesOptions {
  provinceId?: string;
  skipCache?: boolean;
  includeAll?: boolean;
  includeInactive?: boolean;
}

export const useBranches = (options?: UseBranchesOptions) => {
  const { provinceId, skipCache = false, includeAll = false, includeInactive = false } = options || {};
  const { user } = useAuth();
  const [loading, setLoading] = useState(true); // Start as true to prevent flashing
  const [branches, setBranches] = useState<Branch[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const fetchBranches = useCallback(async (overrideOptions?: Partial<UseBranchesOptions>) => {
    // Allow fetching branches without authentication (for registration)
    const effectiveIncludeAll = overrideOptions?.includeAll ?? includeAll;
    const effectiveProvinceId = overrideOptions?.provinceId ?? provinceId;
    const effectiveSkipCache = overrideOptions?.skipCache ?? skipCache;
    const effectiveIncludeInactive = overrideOptions?.includeInactive ?? includeInactive;

    // Check cache first
    const cacheKey = effectiveProvinceId || 'all';
    const cachedData = branchesCache.get(cacheKey);
    const now = Date.now();

    // Use cached data initially while fetching fresh data in background
    if (!effectiveSkipCache && cachedData && (now - cachedData.timestamp < CACHE_EXPIRATION)) {
      setBranches(cachedData.data);
      setLoading(false);
      return;
    }
    if (!cachedData) {
      setLoading(true);
    }
    setError(null);
    try {
      const branchesRef = collection(firestore, 'data', 'company', 'branches');
      const constraints: QueryConstraint[] = [];

      // Only include active status filter if we're not including all statuses
      if (!effectiveIncludeAll && !effectiveIncludeInactive) {
        constraints.push(where('status', '==', 'active'));
      }
      // Add province filter if specified
      if (effectiveProvinceId) {
        constraints.push(where('provinceId', '==', effectiveProvinceId));
      }

      const branchesQuery = query(branchesRef, ...constraints);
      const querySnapshot = await getDocs(branchesQuery);
      const branchesList: Branch[] = [];
      querySnapshot.forEach(doc => {
        const branchData = doc.data() as any;
        branchesList.push({
          id: doc.id,
          branchCode: branchData.branchCode || '',
          name: branchData.name || branchData.branchName || '',
          nameEn: branchData.nameEn || branchData.branchNameEn || branchData.name || branchData.branchName || '',
          provinceId: branchData.provinceId || '',
          address: {
            address: branchData.address?.address || '',
            moo: branchData.address?.moo,
            village: branchData.address?.village,
            province: branchData.address?.province || '',
            amphoe: branchData.address?.amphoe || '',
            tambol: branchData.address?.tambol || '',
            postcode: branchData.address?.postcode || '',
            latitude: branchData.address?.latitude,
            longitude: branchData.address?.longitude,
          },
          contact: {
            tel: branchData.contact?.tel,
            fax: branchData.contact?.fax,
            email: branchData.contact?.email,
            website: branchData.contact?.website,
          },
          manager: branchData.manager,
          created: branchData.created || Date.now(),
          updated: branchData.updated,
          inputBy: branchData.inputBy || '',
          status: branchData.status || 'active'
        });
      });
      branchesList.sort((a, b) => a.name.localeCompare(b.name));
      branchesCache.set(cacheKey, {
        data: branchesList,
        timestamp: now
      });
      setBranches(branchesList);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch branches');
      setError(error);
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  }, [user, provinceId, skipCache, includeAll, includeInactive]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Clear cache when unmounting
  useEffect(() => {
    return () => {
      if (skipCache) {
        const cacheKey = provinceId || 'all';
        branchesCache.delete(cacheKey);
      }
    };
  }, [provinceId, skipCache]);

  /**
   * Refresh branches, optionally overriding options (e.g., { includeAll: true })
   * @param overrideOptions Optional options to override for this refresh
   */
  const refreshBranches = useCallback((overrideOptions?: Partial<UseBranchesOptions>) => {
    const cacheKey = (overrideOptions?.provinceId ?? provinceId) || 'all';
    branchesCache.delete(cacheKey);
    return fetchBranches(overrideOptions);
  }, [fetchBranches, provinceId]);

  return {
    branches,
    loading,
    error,
    refreshBranches
  };
};

// Export a function to clear the cache if needed
export const clearBranchesCache = (provinceId?: string) => {
  if (provinceId) {
    branchesCache.delete(provinceId);
  } else {
    branchesCache.clear();
  }
};