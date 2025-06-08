/**
 * usePermissions Hook for KBN Multi-Province System
 * With automatic legacy permission migration
 */

import { useSelector, useDispatch } from 'react-redux';
import { useMemo, useEffect } from 'react';
import {
  checkPermission,
  checkGeographicAccess,
  hasAccess,
  filterDataByAccess,
  getAccessibleProvinces,
  getAccessibleBranches,
  hasDepartmentAccess,
  hasFlowAccess,
  getAccessibleDepartments,
  getAccessibleFlows
} from '../utils/rbac';
import {
  getCurrentUserRBAC
} from '../redux/reducers/rbac';
import { setUserPermissions, setUserRole, setGeographicAccess } from '../redux/actions/rbac';
import { 
  needsMigration, 
  migrateUserToRBAC, 
  validateMigratedRBAC,
  createFallbackRBAC,
  logMigration 
} from '../utils/userMigration';

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
  
  const dispatch = useDispatch();

  // Memoized user ID
  const userId = useMemo(() => user?.uid || null, [user]);

  // AUTO-MIGRATION: Check if user needs migration and perform it
  // Only run when user or branches change, NOT when currentUserRBAC changes
  // to prevent conflicts with manual role switching
  useEffect(() => {
    if (user && userId && needsMigration(user, currentUserRBAC)) {
      const migratedRBAC = migrateUserToRBAC(user, branches);
      
      if (validateMigratedRBAC(migratedRBAC)) {
        // Only migrate if there's no existing RBAC role (to avoid overriding demo roles)
        if (!currentUserRBAC?.role) {
          // Dispatch the migrated RBAC to Redux
          dispatch(setUserPermissions(userId, migratedRBAC.permissions, migratedRBAC.geographic));
          dispatch(setUserRole(userId, migratedRBAC.role));
          dispatch(setGeographicAccess(userId, migratedRBAC.geographic));
          
          logMigration(user, migratedRBAC);
        }
      } else {
        // Create fallback RBAC if migration fails
        const fallbackRBAC = createFallbackRBAC(user, branches);
        if (fallbackRBAC && !currentUserRBAC?.role) {
          dispatch(setUserPermissions(userId, fallbackRBAC.permissions, fallbackRBAC.geographic));
          dispatch(setUserRole(userId, fallbackRBAC.role));
          dispatch(setGeographicAccess(userId, fallbackRBAC.geographic));
          
          console.warn('Migration failed, using fallback RBAC for user:', userId);
        }
      }
    }
  }, [user, userId, branches, dispatch]); // Removed currentUserRBAC from deps to prevent infinite loop

  // Memoized user permissions and geographic data
  const userPermissions = useMemo(() => {
    if (!currentUserRBAC) return [];
    const permissions = currentUserRBAC.permissions || [];
    // Ensure permissions is always an array
    return Array.isArray(permissions) ? permissions : [];
  }, [currentUserRBAC]);

  const userGeographic = useMemo(() => {
    if (!currentUserRBAC) return null;
    return currentUserRBAC.geographic || null;
  }, [currentUserRBAC]);

  const userRole = useMemo(() => {
    if (!currentUserRBAC) return null;
    return currentUserRBAC.role || null;
  }, [currentUserRBAC]);

  // Enhanced permission checking function for new system
  const hasPermission = useMemo(() => {
    return (permission, context = {}) => {
      if (!userPermissions.length) return false;
      
      // Use the new permission checking logic
      return checkPermission(userPermissions, permission, context);
    };
  }, [userPermissions]);

  // Department access checker
  const hasDepartmentAccessFunc = useMemo(() => {
    return (department) => {
      return hasDepartmentAccess(userPermissions, department);
    };
  }, [userPermissions]);

  // Document flow access checker
  const hasFlowAccessFunc = useMemo(() => {
    return (flow, department = null) => {
      if (!Array.isArray(userPermissions)) return false;
      if (userPermissions.includes('*')) return true;
      
      if (department) {
        // Check for specific department.flow combination
        return userPermissions.includes(`${department}.${flow}`);
      }
      
      // Check if user has this flow in any department
      return hasFlowAccess(userPermissions, flow);
    };
  }, [userPermissions]);

  // Get user's accessible departments
  const accessibleDepartments = useMemo(() => {
    return getAccessibleDepartments(userPermissions);
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
    
    // For branch-level users, we need to find provinces that contain their allowed branches
    if (userGeographic.accessLevel === 'branch' && branches) {
      const userBranchCodes = userGeographic.allowedBranches || [];
      const accessibleProvinceKeys = new Set();
      
      // Find provinces by looking at branch data
      userBranchCodes.forEach(branchCode => {
        const branch = branches[branchCode];
        if (branch && branch.provinceId) {
          accessibleProvinceKeys.add(branch.provinceId);
        }
      });
      
      // Return provinces that contain user's branches
      return allProvincesArray.filter(province => 
        accessibleProvinceKeys.has(province.key)
      );
    }
    
    return getAccessibleProvinces(userGeographic, allProvincesArray);
  }, [userGeographic, provinces, branches]);

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

  // Check if user is executive
  const isExecutive = useMemo(() => {
    return userRole === 'EXECUTIVE';
  }, [userRole]);

  // Check if user is super admin
  const isSuperAdmin = useMemo(() => {
    return Array.isArray(userPermissions) && userPermissions.includes('*') && userRole !== 'EXECUTIVE';
  }, [userPermissions, userRole]);

  // Check if user has province-level access
  const hasProvinceAccess = useMemo(() => {
    return userGeographic?.accessLevel === 'province' || userGeographic?.accessLevel === 'all' || isExecutive;
  }, [userGeographic, isExecutive]);

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
    
    // Permission checking (new system)
    hasPermission,
    hasDepartmentAccess: hasDepartmentAccessFunc,
    hasFlowAccess: hasFlowAccessFunc,
    
    // Department and flow access
    accessibleDepartments,
    getAccessibleFlows: (department) => getAccessibleFlows(userPermissions, department),
    
    // Geographic access (enhanced)
    hasGeographicAccess,
    hasFullAccess,
    
    // Access level checks
    isSuperAdmin,
    isExecutive,
    hasProvinceAccess,
    hasBranchAccessOnly,
    
    // Geographic access data
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
    
    // Legacy compatibility
    checkLegacyPermission: (permission) => {
      // Support for old permission format during migration
      if (user?.isDev) return true;
      if (user?.permissions && user.permissions[permission]) return true;
      return hasPermission(permission);
    },
    
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