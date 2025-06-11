/**
 * DEPRECATED: useCleanSlatePermissions Hook
 * This is now a compatibility wrapper around the unified usePermissions hook.
 * Please migrate to using usePermissions directly for new code.
 */

import { usePermissions } from './usePermissions';

/**
 * @deprecated Use usePermissions instead
 * Compatibility wrapper for useCleanSlatePermissions
 * @returns {Object} Same API as usePermissions with Clean Slate aliases
 */
export const useCleanSlatePermissions = () => {
  const permissions = usePermissions();
  
  // Return the same object but with Clean Slate naming conventions
  // This maintains 100% backward compatibility
  return {
    ...permissions,
    
    // Ensure Clean Slate specific properties are available
    userRBAC: permissions.userRBAC,
    hasPermission: permissions.hasPermission,
    hasAnyPermission: permissions.hasAnyPermission,
    hasAllPermissions: permissions.hasAllPermissions,
    hasAuthorityLevel: permissions.hasAuthorityLevel,
    worksInDepartment: permissions.worksInDepartment,
    primaryDepartment: permissions.primaryDepartment,
    isAdmin: permissions.isAdmin,
    isProvinceLevel: permissions.isProvinceLevel,
    isBranchLevel: permissions.isBranchLevel,
    isDepartmentLevel: permissions.isDepartmentLevel,
    canAccessProvince: permissions.canAccessProvince,
    canAccessBranch: permissions.canAccessBranch,
    getGeographicContext: permissions.getGeographicContext,
    getQueryFilters: permissions.getQueryFilters,
    enhanceDataForSubmission: permissions.enhanceDataForSubmission,
    filterDataByUserAccess: permissions.filterDataByUserAccess
  };
};

// Export as default for backward compatibility
export default useCleanSlatePermissions; 