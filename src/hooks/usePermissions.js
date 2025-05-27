import { useAuth } from 'contexts/AuthContext';
import { hasRolePrivilege } from 'utils/roleUtils';
import { ROLES } from 'constants/roles';

/**
 * Unified permissions hook that provides all permission-related functionality
 * Consolidates logic from both AuthContext and PermissionContext
 */
export const usePermissions = () => {
  const {
    hasPermission,
    hasAnyPermission,
    hasRole,
    hasPrivilege,
    shouldHideUserFromView,
    userProfile,
    hasProvinceAccess: authHasProvinceAccess,
    hasBranchAccess,
    hasDepartmentAccess,
  } = useAuth();

  // Enhanced province access check with role privilege
  const hasProvinceAccess = (provinceId) => {
    if (!userProfile || !provinceId) return false;

    // Users with GENERAL_MANAGER role category and higher can access all provinces
    if (hasRolePrivilege(userProfile?.role, ROLES.GENERAL_MANAGER)) {
      return true;
    }

    // Use the AuthContext method as fallback
    return authHasProvinceAccess(provinceId);
  };

  // Alias for hasProvinceAccess for better semantics
  const canAccessProvince = hasProvinceAccess;

  // Get provinces that the user has access to
  const userProvinces =
    (userProfile?.accessibleProvinceIds || [])?.map((id) => ({
      id,
      name: `Province ${id.substring(0, 4)}`,
      nameEn: `Province ${id.substring(0, 4)}`,
      code: id.substring(0, 3).toUpperCase(),
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })) || [];

  return {
    // Core permission functions
    hasPermission,
    hasAnyPermission,
    hasRole,
    hasPrivilege,

    // Access control functions
    hasProvinceAccess,
    canAccessProvince,
    hasBranchAccess,
    hasDepartmentAccess,

    // User data and utilities
    userProfile,
    userProvinces,
    shouldHideUserFromView,
  };
};
