/**
 * usePermissions Hook for KBN Multi-Province System
 * Provides easy access to user permissions and geographic restrictions in React components
 */

import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import {
  checkPermission,
  checkGeographicAccess,
  hasAccess,
  filterDataByAccess,
  getAccessibleProvinces,
  getAccessibleBranches
} from '../utils/rbac';
import {
  getCurrentUserRBAC,
  hasPermission as hasPermissionSelector,
  getAccessibleProvinces as getAccessibleProvincesSelector,
  getAccessibleBranches as getAccessibleBranchesSelector,
  canAccessProvince,
  canAccessBranch
} from '../redux/reducers/rbac';

/**
 * Custom hook for accessing user permissions and geographic restrictions
 * @returns {Object} Permission utilities and user access information
 */
export const usePermissions = () => {
  // Get current user from auth
  const { user } = useSelector((state) => state.auth);
  
  // Get RBAC data from Redux
  const currentUserRBAC = useSelector(getCurrentUserRBAC);
  
  // Get provinces and branches data
  const { provinces } = useSelector((state) => state.provinces);
  const { branches } = useSelector((state) => state.data);

  // Memoized user ID
  const userId = useMemo(() => user?.uid || null, [user]);

  // Memoized user permissions and geographic data
  const userPermissions = useMemo(() => {
    if (!currentUserRBAC) return [];
    return currentUserRBAC.permissions || [];
  }, [currentUserRBAC]);

  const userGeographic = useMemo(() => {
    if (!currentUserRBAC) return null;
    return currentUserRBAC.geographic || null;
  }, [currentUserRBAC]);

  const userRole = useMemo(() => {
    if (!currentUserRBAC) return null;
    return currentUserRBAC.role || null;
  }, [currentUserRBAC]);

  // Core permission checking function
  const hasPermission = useMemo(() => {
    return (permission, context = {}) => {
      if (!userPermissions.length) return false;
      
      // Use the utility function for permission checking
      return checkPermission(userPermissions, permission, context);
    };
  }, [userPermissions]);

  // Geographic access checking
  const hasGeographicAccess = useMemo(() => {
    return (context = {}) => {
      if (!userGeographic) return false;
      
      return checkGeographicAccess(userGeographic, context);
    };
  }, [userGeographic]);

  // Combined permission and geographic access check
  const hasFullAccess = useMemo(() => {
    return (permission, context = {}) => {
      if (!userPermissions.length || !userGeographic) return false;
      
      const userObj = {
        permissions: userPermissions,
        ...userGeographic
      };
      
      return hasAccess(userObj, permission, context);
    };
  }, [userPermissions, userGeographic]);

  // Get accessible provinces
  const accessibleProvinces = useMemo(() => {
    if (!userGeographic || !provinces) return [];
    
    const allProvincesArray = Object.keys(provinces).map(key => ({
      key,
      ...provinces[key]
    }));
    
    return getAccessibleProvinces(userGeographic, allProvincesArray);
  }, [userGeographic, provinces]);

  // Get accessible branches
  const accessibleBranches = useMemo(() => {
    if (!userGeographic || !branches) return [];
    
    const allBranchesArray = Object.keys(branches).map(key => ({
      key,
      branchCode: key,
      ...branches[key]
    }));
    
    return getAccessibleBranches(userGeographic, allBranchesArray);
  }, [userGeographic, branches]);

  // Get accessible branch codes only
  const accessibleBranchCodes = useMemo(() => {
    return accessibleBranches.map(branch => branch.branchCode || branch.key);
  }, [accessibleBranches]);

  // Get accessible province keys only
  const accessibleProvinceKeys = useMemo(() => {
    return accessibleProvinces.map(province => province.key);
  }, [accessibleProvinces]);

  // Data filtering function
  const filterDataByUserAccess = useMemo(() => {
    return (data, geographicField = 'provinceId') => {
      if (!userGeographic || !data) return [];
      
      return filterDataByAccess(data, userGeographic, geographicField);
    };
  }, [userGeographic]);

  // Province access checker
  const canUserAccessProvince = useMemo(() => {
    return (provinceKey) => {
      if (!userGeographic) return false;
      
      if (userGeographic.accessLevel === 'all') return true;
      
      return (userGeographic.allowedProvinces || []).includes(provinceKey);
    };
  }, [userGeographic]);

  // Branch access checker
  const canUserAccessBranch = useMemo(() => {
    return (branchCode) => {
      if (!userGeographic) return false;
      
      if (userGeographic.accessLevel === 'all') return true;
      
      if (userGeographic.accessLevel === 'province') {
        // Check if branch belongs to allowed province
        const branch = branches[branchCode];
        if (branch && branch.provinceId) {
          return (userGeographic.allowedProvinces || []).includes(branch.provinceId);
        }
        return false;
      }
      
      if (userGeographic.accessLevel === 'branch') {
        return (userGeographic.allowedBranches || []).includes(branchCode);
      }
      
      return false;
    };
  }, [userGeographic, branches]);

  // Check if user is super admin
  const isSuperAdmin = useMemo(() => {
    return userPermissions.includes('*');
  }, [userPermissions]);

  // Check if user has province-level access
  const hasProvinceAccess = useMemo(() => {
    return userGeographic?.accessLevel === 'province' || userGeographic?.accessLevel === 'all';
  }, [userGeographic]);

  // Check if user has branch-level access only
  const hasBranchAccessOnly = useMemo(() => {
    return userGeographic?.accessLevel === 'branch';
  }, [userGeographic]);

  // Get user's home province and branch
  const homeLocation = useMemo(() => {
    return {
      province: userGeographic?.homeProvince || null,
      branch: userGeographic?.homeBranch || null
    };
  }, [userGeographic]);

  // Get filtered branches for current user (for selectors)
  const userBranches = useMemo(() => {
    if (!branches) return {};
    
    const filtered = {};
    Object.keys(branches).forEach(branchCode => {
      if (canUserAccessBranch(branchCode)) {
        filtered[branchCode] = branches[branchCode];
      }
    });
    
    return filtered;
  }, [branches, canUserAccessBranch]);

  // Get filtered provinces for current user (for selectors)
  const userProvinces = useMemo(() => {
    if (!provinces) return {};
    
    const filtered = {};
    Object.keys(provinces).forEach(provinceKey => {
      if (canUserAccessProvince(provinceKey)) {
        filtered[provinceKey] = provinces[provinceKey];
      }
    });
    
    return filtered;
  }, [provinces, canUserAccessProvince]);

  return {
    // User information
    userId,
    userRole,
    userPermissions,
    userGeographic,
    
    // Permission checking
    hasPermission,
    hasGeographicAccess,
    hasFullAccess,
    
    // Access level checks
    isSuperAdmin,
    hasProvinceAccess,
    hasBranchAccessOnly,
    
    // Geographic access
    accessibleProvinces,
    accessibleBranches,
    accessibleProvinceKeys,
    accessibleBranchCodes,
    homeLocation,
    
    // Access checkers
    canUserAccessProvince,
    canUserAccessBranch,
    
    // Data filtering
    filterDataByUserAccess,
    
    // Filtered data for components
    userBranches,
    userProvinces,
    
    // Utility getters
    getUserAccessLevel: () => userGeographic?.accessLevel || 'none',
    getAllowedProvinces: () => userGeographic?.allowedProvinces || [],
    getAllowedBranches: () => userGeographic?.allowedBranches || [],
    
    // Component helpers
    isDataAccessible: (item, geographicField = 'provinceId') => {
      if (!userGeographic || !item) return false;
      
      const filtered = filterDataByUserAccess([item], geographicField);
      return filtered.length > 0;
    },
    
    shouldShowProvinceSelector: () => hasProvinceAccess && accessibleProvinces.length > 1,
    shouldShowBranchSelector: () => accessibleBranches.length > 1,
    
    getDefaultProvince: () => {
      if (homeLocation.province) return homeLocation.province;
      if (accessibleProvinces.length === 1) return accessibleProvinces[0].key;
      return null;
    },
    
    getDefaultBranch: () => {
      if (homeLocation.branch) return homeLocation.branch;
      if (accessibleBranches.length === 1) return accessibleBranches[0].branchCode || accessibleBranches[0].key;
      return null;
    }
  };
}; 