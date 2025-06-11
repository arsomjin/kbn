/**
 * Unified RBAC Permissions Hook
 * This replaces both legacy usePermissions and useCleanSlatePermissions
 * Provides complete backward compatibility while using Clean Slate engine internally
 */

import { useSelector } from 'react-redux';
import { useMemo, useCallback } from 'react';
import { 
  AUTHORITY_LEVELS,
  DEPARTMENTS,
  DOCUMENT_ACTIONS as ACTIONS,
  generateUserPermissions,
  hasOrthogonalPermission,
  checkGeographicAccess,
  getAccessibleProvinces,
  getAccessibleBranches,
  filterDataByUserAccess as orthogonalFilterData
} from '../utils/orthogonal-rbac';

/**
 * Unified permissions hook that combines both legacy and Clean Slate APIs
 * Uses Clean Slate engine internally for all operations
 * @returns {Object} Comprehensive permission checking functions and user data
 */
export const usePermissions = () => {
  // Get current user from auth
  const { user } = useSelector((state) => state.auth);
  
  // Get system data for geographic filtering
  const { provinces } = useSelector((state) => state.provinces);
  const branches = useSelector((state) => state.data?.branches || []);

  // Normalize user data to Clean Slate format for internal processing
  const userRBAC = useMemo(() => {
    if (!user?.uid) return null;

    return {
      // User identification
      uid: user.uid,
      
      // Clean Slate fields (preferred)
      permissions: user.permissions || [],
      authority: user.authority || AUTHORITY_LEVELS.DEPARTMENT,
      departments: user.departments || [],
      
      // Geographic access
      geographic: {
        allowedProvinces: user.allowedProvinces || user.access?.geographic?.provinces || [],
        allowedBranches: user.allowedBranches || user.access?.geographic?.branches || [],
        selectedProvince: user.selectedProvince || user.access?.geographic?.selectedProvince || null,
        selectedBranch: user.selectedBranch || user.access?.geographic?.selectedBranch || null,
        homeProvince: user.homeProvince || user.access?.geographic?.homeProvince || null,
        homeBranch: user.homeBranch || user.access?.geographic?.homeBranch || null
      },
      
      // Status - Check both new RBAC structure and legacy fields
      isActive: (user.isDev || false) ? true : (user.access?.isActive ?? user.isActive ?? user.auth?.isActive ?? true), // Dev users always active, others default to true
      isDev: user.isDev || false,
      
      // Legacy compatibility fields
      accessLevel: user.accessLevel || user.access?.authority || 'STAFF',
      legacyRole: user.legacyRole || user.accessLevel
    };
  }, [user]);

  // CORE PERMISSION CHECKING
  
  /**
   * Check if user has specific permission (main function)
   * Supports both Clean Slate and legacy permission formats
   */
  const hasPermission = useCallback((permission, context = {}) => {
    // DEV USERS CAN ACCESS EVERYTHING - NO RESTRICTIONS
    if (userRBAC?.isDev) {
      return true;
    }
    
    if (!userRBAC || !userRBAC.isActive) return false;
    
    // Handle special admin cases
    if (userRBAC.authority === AUTHORITY_LEVELS.ADMIN) {
      return true;
    }
    
    // Geographic context check if required
    if (context.provinceId || context.branchCode || context.province || context.branch) {
      const geoContext = {
        provinceId: context.provinceId || context.province,
        branchCode: context.branchCode || context.branch
      };
      
      const hasGeoAccess = hasGeographicAccess(userRBAC.geographic, geoContext);
      if (!hasGeoAccess) return false;
    }

    // Use Clean Slate permission checker
    return hasOrthogonalPermission(userRBAC, permission, context);
  }, [userRBAC]);

  /**
   * Check multiple permissions (user needs ANY one)
   */
  const hasAnyPermission = useCallback((permissions, context = {}) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.some(permission => hasPermission(permission, context));
  }, [hasPermission]);

  /**
   * Check multiple permissions (user needs ALL)
   */
  const hasAllPermissions = useCallback((permissions, context = {}) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.every(permission => hasPermission(permission, context));
  }, [hasPermission]);

  /**
   * Legacy compatibility: hasFullAccess
   */
  const hasFullAccess = useCallback((permission, context = {}) => {
    return hasPermission(permission, context);
  }, [hasPermission]);

  // GEOGRAPHIC ACCESS FUNCTIONS
  
  /**
   * Check geographic access only
   */
  const hasGeographicAccess = useCallback((context = {}) => {
    if (!userRBAC) return false;
    
    const geoContext = {
      provinceId: context.provinceId || context.province,
      branchCode: context.branchCode || context.branch
    };
    
    return hasGeographicAccess(userRBAC.geographic, geoContext);
  }, [userRBAC]);

  /**
   * Check if user can access specific province
   */
  const canAccessProvince = useCallback((provinceId) => {
    // DEV USERS CAN ACCESS EVERYTHING
    if (userRBAC?.isDev) return true;
    
    if (!userRBAC) return false;
    if (userRBAC.authority === AUTHORITY_LEVELS.ADMIN) return true;
    return userRBAC.geographic.allowedProvinces.includes(provinceId);
  }, [userRBAC]);

  /**
   * Check if user can access specific branch
   */
  const canAccessBranch = useCallback((branchCode) => {
    // DEV USERS CAN ACCESS EVERYTHING
    if (userRBAC?.isDev) return true;
    
    if (!userRBAC) return false;
    if (userRBAC.authority === AUTHORITY_LEVELS.ADMIN) return true;
    return userRBAC.geographic.allowedBranches.includes(branchCode);
  }, [userRBAC]);

  // DATA FILTERING FUNCTIONS
  
  /**
   * Filter data based on user's geographic access
   * Supports both legacy and new field mapping formats
   */
  const filterDataByUserAccess = useCallback((data, options = {}) => {
    if (!userRBAC) return [];
    
    // Handle legacy format: { provinceField, branchField }
    const fieldMapping = {
      provinceField: options.provinceField || options.provinceId || 'provinceId',
      branchField: options.branchField || options.branchCode || 'branchCode'
    };
    
    return orthogonalFilterData(userRBAC, data, fieldMapping);
  }, [userRBAC]);

  /**
   * Legacy alias for filterDataByUserAccess
   */
  const filterDataByAccess = useCallback((data, options = {}) => {
    return filterDataByUserAccess(data, options);
  }, [filterDataByUserAccess]);

  // USER CONTEXT FUNCTIONS
  
  /**
   * Get user's accessible provinces
   */
  const accessibleProvinces = useMemo(() => {
    if (!userRBAC) return [];
    const provinceList = Array.isArray(provinces) ? provinces : [];
    
    // DEV USERS GET ALL PROVINCES
    if (userRBAC.isDev) return provinceList.map(p => p.provinceKey || p.key || p.id).filter(Boolean);
    
    if (userRBAC.authority === AUTHORITY_LEVELS.ADMIN) return provinceList.map(p => p.provinceKey || p.key || p.id).filter(Boolean);
    return userRBAC.geographic.allowedProvinces || [];
  }, [userRBAC, provinces]);

  /**
   * Get user's accessible branches  
   */
  const accessibleBranches = useMemo(() => {
    if (!userRBAC) return [];
    const branchList = Object.keys(branches || {});
    
    // DEV USERS GET ALL BRANCHES
    if (userRBAC.isDev) return branchList;
    
    if (userRBAC.authority === AUTHORITY_LEVELS.ADMIN) return branchList;
    return userRBAC.geographic.allowedBranches || [];
  }, [userRBAC, branches]);

  /**
   * Legacy: getAccessibleProvinces function
   */
  const getAccessibleProvinces = useCallback(() => {
    return accessibleProvinces;
  }, [accessibleProvinces]);

  /**
   * Legacy: getAccessibleBranches function  
   */
  const getAccessibleBranches = useCallback((inputBranches = null) => {
    const fallbackBranches = Array.isArray(branches) ? branches : [];
    const branchList = Array.isArray(inputBranches) ? inputBranches : fallbackBranches;
    if (!userRBAC) return [];
    if (userRBAC.authority === AUTHORITY_LEVELS.ADMIN || userRBAC.isDev) return branchList;
    
    return branchList.filter(b => 
      userRBAC.geographic.allowedBranches.includes(b.branchCode || b.code || b.id)
    );
  }, [userRBAC, branches]);

  // AUTHORITY & ROLE CHECKING
  
  /**
   * Check authority level (Clean Slate)
   */
  const hasAuthorityLevel = useCallback((level) => {
    if (!userRBAC) return false;
    
    const levels = {
      [AUTHORITY_LEVELS.ADMIN]: 4,
      [AUTHORITY_LEVELS.PROVINCE]: 3, 
      [AUTHORITY_LEVELS.BRANCH]: 2,
      [AUTHORITY_LEVELS.DEPARTMENT]: 1
    };

    const userLevel = levels[userRBAC.authority] || 0;
    const requiredLevel = levels[level] || 0;

    return userLevel >= requiredLevel;
  }, [userRBAC]);

  /**
   * Get legacy role name for backward compatibility
   */
  const userRole = useMemo(() => {
    if (!userRBAC) return 'STAFF';
    
    // Handle special cases
    if (userRBAC.isDev) return 'SUPER_ADMIN';
    
    // Map Clean Slate authority to legacy role format
    switch (userRBAC.authority) {
      case AUTHORITY_LEVELS.ADMIN:
        return userRBAC.geographic.allowedProvinces.length > 1 ? 'SUPER_ADMIN' : 'EXECUTIVE';
      case AUTHORITY_LEVELS.PROVINCE:
        return 'PROVINCE_MANAGER';
      case AUTHORITY_LEVELS.BRANCH:
        return 'BRANCH_MANAGER';
      case AUTHORITY_LEVELS.DEPARTMENT:
      default:
        return userRBAC.legacyRole || 'STAFF';
    }
  }, [userRBAC]);

  // DEPARTMENT FUNCTIONS
  
  /**
   * Check if user works in specific department
   */
  const worksInDepartment = useCallback((department) => {
    if (!userRBAC) return false;
    if (userRBAC.authority === AUTHORITY_LEVELS.ADMIN || userRBAC.isDev) return true;
    return userRBAC.departments.includes(department);
  }, [userRBAC]);

  /**
   * Legacy: hasDepartmentAccess
   */
  const hasDepartmentAccess = useCallback((department) => {
    return worksInDepartment(department);
  }, [worksInDepartment]);

  /**
   * Get user's primary department
   */
  const primaryDepartment = useMemo(() => {
    if (!userRBAC || !userRBAC.departments.length) return null;
    return userRBAC.departments[0]; // First department is primary
  }, [userRBAC]);

  // STATUS CHECKS
  
  /**
   * Check if user is super admin
   */
  const isSuperAdmin = useMemo(() => {
    return userRBAC?.isDev || 
           (userRBAC?.authority === AUTHORITY_LEVELS.ADMIN && 
            userRBAC?.geographic.allowedProvinces.length > 1);
  }, [userRBAC]);

  /**
   * Check if user is executive (preserved for special cases)
   */
  const isExecutive = useMemo(() => {
    return userRBAC?.isDev || 
           userRBAC?.authority === AUTHORITY_LEVELS.ADMIN ||
           userRBAC?.legacyRole === 'EXECUTIVE';
  }, [userRBAC]);

  /**
   * Authority level checks (Clean Slate)
   */
  const isAdmin = useMemo(() => {
    return userRBAC?.authority === AUTHORITY_LEVELS.ADMIN || userRBAC?.isDev;
  }, [userRBAC]);

  const isProvinceLevel = useMemo(() => {
    return userRBAC?.authority === AUTHORITY_LEVELS.PROVINCE;
  }, [userRBAC]);

  const isBranchLevel = useMemo(() => {
    return userRBAC?.authority === AUTHORITY_LEVELS.BRANCH;
  }, [userRBAC]);

  const isDepartmentLevel = useMemo(() => {
    return userRBAC?.authority === AUTHORITY_LEVELS.DEPARTMENT;
  }, [userRBAC]);

  // UTILITY FUNCTIONS
  
  /**
   * Get user's authority level
   */
  const userAuthority = useMemo(() => {
    return userRBAC?.authority || AUTHORITY_LEVELS.DEPARTMENT;
  }, [userRBAC]);

  /**
   * Get user's geographic scope (legacy)
   */
  const userGeographic = useMemo(() => {
    if (!userRBAC) return 'NONE';
    if (userRBAC.authority === AUTHORITY_LEVELS.ADMIN) return 'ALL';
    if (userRBAC.geographic.allowedProvinces.length > 1) return 'MULTI_PROVINCE';
    if (userRBAC.geographic.allowedProvinces.length === 1) return 'PROVINCE';
    if (userRBAC.geographic.allowedBranches.length > 0) return 'BRANCH';
    return 'NONE';
  }, [userRBAC]);

  /**
   * Get user's departments
   */
  const userDepartments = useMemo(() => {
    return userRBAC?.departments || [];
  }, [userRBAC]);

  /**
   * Get user permissions array
   */
  const userPermissions = useMemo(() => {
    return userRBAC?.permissions || [];
  }, [userRBAC]);

  /**
   * Get default branch for user
   */
  const getDefaultBranch = useCallback(() => {
    if (!userRBAC) return null;
    
    // Return home branch first
    if (userRBAC.geographic.homeBranch) {
      return userRBAC.geographic.homeBranch;
    }
    
    // Return selected branch
    if (userRBAC.geographic.selectedBranch) {
      return userRBAC.geographic.selectedBranch;
    }
    
    // Return first allowed branch
    if (userRBAC.geographic.allowedBranches.length > 0) {
      return userRBAC.geographic.allowedBranches[0];
    }
    
    return null;
  }, [userRBAC]);

  /**
   * Get default province for user
   */
  const getDefaultProvince = useCallback(() => {
    if (!userRBAC) return null;
    
    // Return home province first
    if (userRBAC.geographic.homeProvince) {
      return userRBAC.geographic.homeProvince;
    }
    
    // Return selected province
    if (userRBAC.geographic.selectedProvince) {
      return userRBAC.geographic.selectedProvince;
    }
    
    // Return first allowed province
    if (userRBAC.geographic.allowedProvinces.length > 0) {
      return userRBAC.geographic.allowedProvinces[0];
    }
    
    return null;
  }, [userRBAC]);

  /**
   * Get geographic context for components
   */
  const getGeographicContext = useCallback(() => {
    if (!userRBAC) return {};
    
    return {
      selectedProvince: userRBAC.geographic.selectedProvince,
      selectedBranch: userRBAC.geographic.selectedBranch,
      allowedProvinces: userRBAC.geographic.allowedProvinces,
      allowedBranches: userRBAC.geographic.allowedBranches,
      homeProvince: userRBAC.geographic.homeProvince,
      homeBranch: userRBAC.geographic.homeBranch
    };
  }, [userRBAC]);

  /**
   * Generate query filters for data fetching
   */
  const getQueryFilters = useCallback(() => {
    if (!userRBAC) return {};

    const filters = {};

    // Add province filter
    if (userRBAC.geographic.selectedProvince) {
      filters.provinceId = userRBAC.geographic.selectedProvince;
    } else if (userRBAC.geographic.allowedProvinces.length > 0 && !isAdmin) {
      filters.provinceId = { in: userRBAC.geographic.allowedProvinces };
    }

    // Add branch filter  
    if (userRBAC.geographic.selectedBranch) {
      filters.branchCode = userRBAC.geographic.selectedBranch;
    } else if (userRBAC.geographic.allowedBranches.length > 0 && !isAdmin) {
      filters.branchCode = { in: userRBAC.geographic.allowedBranches };
    }

    return filters;
  }, [userRBAC, isAdmin]);

  /**
   * Enhanced data enhancement for form submission
   */
  const enhanceDataForSubmission = useCallback((data) => {
    if (!userRBAC) return data;

    const enhanced = { ...data };

    // Auto-inject province if selected and not already present
    if (userRBAC.geographic.selectedProvince && !enhanced.provinceId) {
      enhanced.provinceId = userRBAC.geographic.selectedProvince;
    }

    // Auto-inject branch if selected and not already present
    if (userRBAC.geographic.selectedBranch && !enhanced.branchCode) {
      enhanced.branchCode = userRBAC.geographic.selectedBranch;
    }

    // Add metadata
    enhanced._enhancedBy = 'usePermissions';
    enhanced._timestamp = Date.now();

    return enhanced;
  }, [userRBAC]);

  // LEGACY COMPATIBILITY FUNCTIONS
  
  /**
   * Legacy: check if user can manage other users
   */
  const canManageUsers = useMemo(() => {
    return hasPermission('users.manage') || 
           hasAuthorityLevel(AUTHORITY_LEVELS.PROVINCE);
  }, [hasPermission, hasAuthorityLevel]);

  /**
   * Legacy: check if user can view reports
   */
  const canViewReports = useMemo(() => {
    return hasPermission('reports.view') ||
           hasAuthorityLevel(AUTHORITY_LEVELS.BRANCH);
  }, [hasPermission, hasAuthorityLevel]);

  /**
   * Legacy: check if user can approve documents
   */
  const canApprove = useCallback((department = null) => {
    if (department) {
      return hasPermission(`${department.toLowerCase()}.approve`);
    }
    
    // Check if user can approve in any department
    return userDepartments.some(dept => 
      hasPermission(`${dept.toLowerCase()}.approve`)
    );
  }, [hasPermission, userDepartments]);

  /**
   * Get user's home branch info
   */
  const homeBranch = useMemo(() => {
    if (!userRBAC?.geographic.homeBranch || !Array.isArray(branches) || branches.length === 0) return null;
    
    return branches.find(branch => 
      branch.branchCode === userRBAC.geographic.homeBranch ||
      branch.code === userRBAC.geographic.homeBranch
    );
  }, [userRBAC, branches]);

  /**
   * Get user's home province info  
   */
  const homeProvince = useMemo(() => {
    if (!homeBranch || !Array.isArray(provinces) || provinces.length === 0) return null;
    
    return provinces.find(province => 
      province.provinceKey === homeBranch.provinceKey ||
      province.key === homeBranch.provinceKey
    );
  }, [homeBranch, provinces]);

  /**
   * Legacy home location info
   */
  const homeLocation = useMemo(() => {
    return {
      province: homeProvince,
      branch: homeBranch
    };
  }, [homeProvince, homeBranch]);

  /**
   * Legacy: should show province selector
   */
  const shouldShowProvinceSelector = useMemo(() => {
    return accessibleProvinces.length > 1;
  }, [accessibleProvinces]);

  // RETURN UNIFIED API
  return {
    // Core permission functions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasFullAccess, // Legacy alias
    
    // Geographic access functions
    hasGeographicAccess,
    canAccessProvince,
    canAccessBranch,
    
    // Data filtering functions
    filterDataByUserAccess,
    filterDataByAccess, // Legacy alias
    
    // Authority & role checking
    hasAuthorityLevel,
    userRole, // Legacy
    userAuthority,
    
    // Department functions
    worksInDepartment,
    hasDepartmentAccess, // Legacy alias
    primaryDepartment,
    
    // Status checks
    isSuperAdmin,
    isExecutive,
    isAdmin,
    isProvinceLevel,
    isBranchLevel,
    isDepartmentLevel,
    isActive: userRBAC?.isActive ?? false,
    
    // User context
    userRBAC, // Clean Slate format
    userPermissions, // Legacy
    userDepartments,
    userGeographic, // Legacy
    
    // Geographic data
    accessibleProvinces,
    accessibleBranches,
    getAccessibleProvinces, // Legacy function
    getAccessibleBranches, // Legacy function
    getDefaultBranch,
    getDefaultProvince,
    homeProvince,
    homeBranch,
    homeLocation, // Legacy
    shouldShowProvinceSelector, // Legacy
    
    // Utility functions
    getGeographicContext,
    getQueryFilters,
    enhanceDataForSubmission,
    
    // Legacy compatibility functions
    canManageUsers,
    canViewReports,
    canApprove
  };
};

// CONVENIENCE HOOKS FOR SPECIFIC USE CASES

/**
 * Hook for checking specific permission
 */
export const useHasPermission = (permission, context = {}) => {
  const { hasPermission } = usePermissions();
  return hasPermission(permission, context);
};

/**
 * Hook for geographic access checking
 */
export const useHasGeographicAccess = (context = {}) => {
  const { hasGeographicAccess } = usePermissions();
  return hasGeographicAccess(context);
};

/**
 * Hook for filtering data by user access
 */
export const useFilteredData = (data, options = {}) => {
  const { filterDataByUserAccess } = usePermissions();
  return filterDataByUserAccess(data, options);
};

// Export as default
export default usePermissions; 