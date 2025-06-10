/**
 * CLEAN usePermissions Hook - Orthogonal RBAC Only
 * No legacy system compatibility - uses only the new orthogonal system
 */

import { useSelector } from 'react-redux';
import { useMemo, useCallback } from 'react';
import { 
  generateUserPermissions,
  hasOrthogonalPermission,
  checkGeographicAccess,
  getAccessibleProvinces,
  getAccessibleBranches,
  filterDataByUserAccess
} from '../utils/orthogonal-rbac';

/**
 * Main permissions hook using orthogonal RBAC system
 * @returns {Object} Permission checking functions and user data
 */
export const usePermissions = () => {
  // Get current user from auth - expecting new orthogonal structure
  const { user } = useSelector((state) => state.auth);
  
  // Get system data for geographic filtering
  const { provinces } = useSelector((state) => state.provinces);
  const branches = useSelector((state) => state.data?.branches || []);

  // Generate user permissions from orthogonal access structure
  const userPermissions = useMemo(() => {
    if (!user?.access) {
      // No access defined = minimal access
      return {
        permissions: [],
        geographic: {
          scope: 'NONE',
          provinces: [],
          branches: [],
          homeBranch: null
        },
        role: null
      };
    }
    
    return generateUserPermissions(user);
  }, [user]);

  // Core permission checking function
  const hasPermission = useCallback((permission, context = {}) => {
    if (!user?.access) return false;
    
    return hasOrthogonalPermission(user, permission, context);
  }, [user]);

  // Geographic access checking
  const hasGeographicAccess = useCallback((context = {}) => {
    if (!user?.access) return false;
    
    return checkGeographicAccess(user, context);
  }, [user]);

  // Combined permission + geographic check
  const hasFullAccess = useCallback((permission, context = {}) => {
    if (!user?.access) return false;
    
    // Check permission first
    if (!hasOrthogonalPermission(user, permission)) {
      return false;
    }
    
    // Then check geographic access if context provided
    if (context.province || context.branch) {
      return checkGeographicAccess(user, context);
    }
    
    return true;
  }, [user]);

  // Get accessible provinces for current user
  const accessibleProvinces = useMemo(() => {
    if (!user?.access || !provinces) return [];
    
    return getAccessibleProvinces(user, provinces);
  }, [user, provinces]);

  // Get accessible branches for current user
  const accessibleBranches = useMemo(() => {
    if (!user?.access || !branches) return [];
    
    return getAccessibleBranches(user, branches);
  }, [user, branches]);

  // Filter data based on user's geographic access
  const filterDataByAccess = useCallback((data, options = {}) => {
    if (!user?.access) return [];
    
    return filterDataByUserAccess(user, data, options);
  }, [user]);

  // Check if user is super admin (ADMIN authority with ALL geographic scope)
  const isSuperAdmin = useMemo(() => {
    return user?.access?.authority === 'ADMIN' && 
           user?.access?.geographic === 'ALL';
  }, [user]);

  // Check if user is executive (preserved for special cases)
  const isExecutive = useMemo(() => {
    return user?.isDev || 
           (user?.access?.authority === 'ADMIN' && user?.legacyRole === 'EXECUTIVE');
  }, [user]);

  // Get user's authority level
  const userAuthority = useMemo(() => {
    return user?.access?.authority || 'STAFF';
  }, [user]);

  // Get user's geographic scope
  const userGeographic = useMemo(() => {
    return user?.access?.geographic || 'NONE';
  }, [user]);

  // Get user's departments
  const userDepartments = useMemo(() => {
    return user?.access?.departments || [];
  }, [user]);

  // Check if user has access to specific department
  const hasDepartmentAccess = useCallback((department) => {
    if (!user?.access?.departments) return false;
    
    return user.access.departments.includes(department) ||
           user.access.authority === 'ADMIN'; // Admin has access to all departments
  }, [user]);

  // Check if user can manage other users
  const canManageUsers = useMemo(() => {
    return hasPermission('users.manage') || 
           ['ADMIN', 'MANAGER'].includes(userAuthority);
  }, [hasPermission, userAuthority]);

  // Check if user can view reports
  const canViewReports = useMemo(() => {
    return hasPermission('reports.view') ||
           ['ADMIN', 'MANAGER', 'LEAD'].includes(userAuthority);
  }, [hasPermission, userAuthority]);

  // Check if user can approve documents
  const canApprove = useCallback((department = null) => {
    if (department) {
      return hasPermission(`${department.toLowerCase()}.approve`);
    }
    
    // Check if user can approve in any department
    return userDepartments.some(dept => 
      hasPermission(`${dept.toLowerCase()}.approve`)
    );
  }, [hasPermission, userDepartments]);

  // Get user's home branch info
  const homeBranch = useMemo(() => {
    if (!user?.access?.homeBranch || !branches) return null;
    
    return branches.find(branch => 
      branch.branchCode === user.access.homeBranch ||
      branch.code === user.access.homeBranch
    );
  }, [user, branches]);

  // Get user's home province info  
  const homeProvince = useMemo(() => {
    if (!homeBranch || !provinces) return null;
    
    return provinces.find(province => 
      province.provinceKey === homeBranch.provinceKey ||
      province.key === homeBranch.provinceKey
    );
  }, [homeBranch, provinces]);

  // Debugging helper - lists all user permissions
  const debugPermissions = useMemo(() => {
    if (!user?.access) return { permissions: [], access: null };
    
    return {
      permissions: userPermissions.permissions,
      access: user.access,
      geographic: userPermissions.geographic,
      accessibleProvinces: accessibleProvinces.map(p => p.provinceName || p.name),
      accessibleBranches: accessibleBranches.map(b => b.branchName || b.name)
    };
  }, [user, userPermissions, accessibleProvinces, accessibleBranches]);

  return {
    // Core permission functions
    hasPermission,
    hasGeographicAccess,
    hasFullAccess,
    
    // Data filtering
    filterDataByAccess,
    
    // Geographic access
    accessibleProvinces,
    accessibleBranches,
    
    // User information
    userAuthority,
    userGeographic,
    userDepartments,
    homeBranch,
    homeProvince,
    
    // Convenience flags
    isSuperAdmin,
    isExecutive,
    
    // Specific capability checks
    hasDepartmentAccess,
    canManageUsers,
    canViewReports,
    canApprove,
    
    // Raw permissions data
    userPermissions: userPermissions.permissions,
    geographic: userPermissions.geographic,
    
    // Debugging
    debugPermissions
  };
};

/**
 * Hook for checking a single permission (convenience hook)
 * @param {string} permission - Permission to check
 * @param {Object} context - Geographic context
 * @returns {boolean} Has permission
 */
export const useHasPermission = (permission, context = {}) => {
  const { hasFullAccess } = usePermissions();
  
  return useMemo(() => {
    return hasFullAccess(permission, context);
  }, [hasFullAccess, permission, context]);
};

/**
 * Hook for checking geographic access (convenience hook)
 * @param {Object} context - Geographic context
 * @returns {boolean} Has access
 */
export const useHasGeographicAccess = (context = {}) => {
  const { hasGeographicAccess } = usePermissions();
  
  return useMemo(() => {
    return hasGeographicAccess(context);
  }, [hasGeographicAccess, context]);
};

/**
 * Hook for filtering data by user access (convenience hook)
 * @param {Array} data - Data to filter
 * @param {Object} options - Filtering options
 * @returns {Array} Filtered data
 */
export const useFilteredData = (data, options = {}) => {
  const { filterDataByAccess } = usePermissions();
  
  return useMemo(() => {
    return filterDataByAccess(data, options);
  }, [filterDataByAccess, data, options]);
};

export default usePermissions; 