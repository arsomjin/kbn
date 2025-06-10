/**
 * SIMPLIFIED usePermissions Hook for KBN Multi-Province System
 * Focused on simplicity and reactivity
 */

import { useSelector, useDispatch } from 'react-redux';
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
  hasEnhancedPermission
} from '../utils/rbac-enhanced';
import {
  getCurrentUserRBAC
} from '../redux/reducers/rbac';

/**
 * Simplified Permission Hook - focuses on reactivity and simplicity
 */
export const usePermissions = () => {
  // Get current user from auth
  const { user } = useSelector((state) => state.auth);
  
  // Get provinces and branches data
  const { provinces } = useSelector((state) => state.provinces);
  const { branches } = useSelector((state) => state.data);

  // SIMPLIFIED: Extract role directly from user auth
  const userRole = useMemo(() => {
    return user?.auth?.accessLevel || user?.accessLevel || 'STAFF';
  }, [user]);

  // SIMPLIFIED: Extract geographic access directly from user auth
  const userGeographic = useMemo(() => {
    if (!user?.auth) return null;
    
    return {
      accessLevel: userRole === 'SUPER_ADMIN' ? 'all' : 
                   userRole.includes('PROVINCE') ? 'province' : 'branch',
      allowedProvinces: user.auth.allowedProvinces || [],
      allowedBranches: user.auth.allowedBranches || [],
      homeProvince: user.auth.homeProvince || null,
      homeBranch: user.auth.homeBranch || null
    };
  }, [user, userRole]);

  // SIMPLIFIED: Permission checking using enhanced system
  const hasPermission = useMemo(() => {
    return (permission, context = {}) => {
      if (!userRole) return false;
      
      // Check enhanced permissions first
      return hasEnhancedPermission(userRole, permission);
    };
  }, [userRole]);

  // SIMPLIFIED: Geographic access checking
  const hasGeographicAccess = useMemo(() => {
    return (context = {}) => {
      if (!userGeographic) return false;
      return checkGeographicAccess(userGeographic, context);
    };
  }, [userGeographic]);

  // SIMPLIFIED: Get accessible provinces
  const accessibleProvinces = useMemo(() => {
    if (!userGeographic || !provinces) return [];
    
    const allProvincesArray = Object.keys(provinces).map(key => ({
      key,
      ...provinces[key]
    }));
    
    return getAccessibleProvinces(userGeographic, allProvincesArray);
  }, [userGeographic, provinces]);

  // SIMPLIFIED: Get accessible branches
  const accessibleBranches = useMemo(() => {
    if (!userGeographic || !branches) return [];
    
    const allBranchesArray = Object.keys(branches).map(key => ({
      key,
      branchCode: key,
      ...branches[key]
    }));
    
    return getAccessibleBranches(userGeographic, allBranchesArray);
  }, [userGeographic, branches]);

  // SIMPLIFIED: Data filtering
  const filterDataByUserAccess = useMemo(() => {
    return (data, options = {}) => {
      if (!userGeographic || !data) return [];
      return filterDataByAccess(data, userGeographic, options.provinceField || 'provinceId');
    };
  }, [userGeographic]);

  // SIMPLIFIED: Combined permission and geographic access check (required by PermissionGate)
  const hasFullAccess = useMemo(() => {
    return (permission, context = {}) => {
      if (!userRole || !userGeographic) return false;
      
      // Check permission first
      const hasPermissionResult = hasPermission(permission, context);
      if (!hasPermissionResult) return false;
      
      // Check geographic access if context provided
      if (context.province || context.branch) {
        return hasGeographicAccess(context);
      }
      
      return true;
    };
  }, [userRole, userGeographic, hasPermission, hasGeographicAccess]);

  // SIMPLIFIED: Branch access checker
  const canUserAccessBranch = useMemo(() => {
    return (branchCode) => {
      if (!userGeographic) return false;
      if (userGeographic.accessLevel === 'all') return true;
      if (userGeographic.accessLevel === 'province') {
        const branch = branches[branchCode];
        if (branch && branch.provinceId) {
          return (userGeographic.allowedProvinces || []).includes(branch.provinceId);
        }
      }
      if (userGeographic.accessLevel === 'branch') {
        return (userGeographic.allowedBranches || []).includes(branchCode);
      }
      return false;
    };
  }, [userGeographic, branches]);

  // SIMPLIFIED: Province access checker
  const canUserAccessProvince = useMemo(() => {
    return (provinceKey) => {
      if (!userGeographic) return false;
      if (userGeographic.accessLevel === 'all') return true;
      return (userGeographic.allowedProvinces || []).includes(provinceKey);
    };
  }, [userGeographic]);

  // SIMPLIFIED: Admin and executive checks (required by PermissionGate)
  const isSuperAdmin = useMemo(() => {
    return userRole === 'SUPER_ADMIN';
  }, [userRole]);

  const isExecutive = useMemo(() => {
    return userRole === 'EXECUTIVE';
  }, [userRole]);

  // SIMPLIFIED: Access level checks (required by RBACDemo)
  const hasProvinceAccess = useMemo(() => {
    return userGeographic?.accessLevel === 'province' || userGeographic?.accessLevel === 'all' || isExecutive;
  }, [userGeographic, isExecutive]);

  const hasBranchAccessOnly = useMemo(() => {
    return userGeographic?.accessLevel === 'branch';
  }, [userGeographic]);

  // SIMPLIFIED: Default helpers (required by LayoutWithRBAC and other components)
  const getDefaultProvince = useMemo(() => {
    return () => {
      if (userGeographic?.homeProvince) {
        return userGeographic.homeProvince;
      }
      
      if (userGeographic?.accessLevel === 'province' && userGeographic?.allowedProvinces?.length === 1) {
        return userGeographic.allowedProvinces[0];
      }
      
      if (userGeographic?.accessLevel === 'branch' && userGeographic?.allowedBranches?.length > 0) {
        // branches could be an object or array, handle both cases
        const firstBranchCode = userGeographic.allowedBranches[0];
        let firstBranch = null;
        
        if (Array.isArray(branches)) {
          firstBranch = branches.find(b => b.branchCode === firstBranchCode);
        } else if (branches && typeof branches === 'object') {
          firstBranch = branches[firstBranchCode];
        }
        
        return firstBranch?.provinceId || null;
      }
      
      return null;
    };
  }, [userGeographic, branches]);

  const getDefaultBranch = useMemo(() => {
    return () => {
      if (userGeographic?.homeBranch) {
        return userGeographic.homeBranch;
      }
      
      if (userGeographic?.accessLevel === 'branch' && userGeographic?.allowedBranches?.length === 1) {
        return userGeographic.allowedBranches[0];
      }
      
      return null;
    };
  }, [userGeographic]);

  // Basic convenience getters (memoized to prevent infinite re-renders)
  const userAccessLevel = userGeographic?.accessLevel || 'branch';
  
  const userProvinces = useMemo(() => {
    return accessibleProvinces.reduce((acc, p) => ({ ...acc, [p.key]: p }), {});
  }, [accessibleProvinces]);
  
  const userBranches = useMemo(() => {
    return accessibleBranches.reduce((acc, b) => ({ ...acc, [b.branchCode]: b }), {});
  }, [accessibleBranches]);

  return {
    // Core permission checking
    hasPermission,
    hasGeographicAccess,
    hasFullAccess,
    
    // User info
    userRole,
    userAccessLevel,
    userGeographic,
    isSuperAdmin,
    isExecutive,
    hasProvinceAccess,
    hasBranchAccessOnly,
    
    // Geographic access
    accessibleProvinces,
    accessibleBranches,
    userProvinces,
    userBranches,
    canUserAccessBranch,
    canUserAccessProvince,
    
    // Data filtering
    filterDataByUserAccess,
    
    // Default helpers
    getDefaultProvince,
    getDefaultBranch,
    
    // Legacy compatibility
    getAccessibleProvinces: () => accessibleProvinces,
    getAccessibleBranches: () => accessibleBranches
  };
}; 