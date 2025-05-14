import { useContext, useMemo, useCallback } from 'react';
import { PermissionContext } from '../contexts/PermissionContext';
import { ROLES, RoleCategory, RoleType, isInRoleCategory } from '../constants/roles';
import { Province } from '../types/province';

/**
 * Hook providing permission-checking functionality throughout the application,
 * including province-based access control
 */
export const usePermissions = () => {
  const context = useContext(PermissionContext);

  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }

  // List of provinces the user has access to
  const userProvinces = useMemo<Province[]>(() => {
    const user = context.user;
    const allProvinces = context.provinces || [];

    if (!user) return [];

    // Admin roles have access to all provinces
    if (user.role === ROLES.SUPER_ADMIN ||
        user.role === ROLES.DEVELOPER ||
        user.role === ROLES.PRIVILEGE ||
        isInRoleCategory(user.role as RoleType, RoleCategory.GENERAL_MANAGER)) {
      return allProvinces;
    }

    // Province Managers with multiple province access
    if (user.accessibleProvinceIds && user.accessibleProvinceIds.length > 0) {
      return allProvinces.filter(province => user.accessibleProvinceIds?.includes(province.id));
    }

    // Other roles can only access their assigned province
    if (user.province) {
      const userProvince = allProvinces.find(p => p.id === user.province);
      return userProvince ? [userProvince] : [];
    }

    return [];
  }, [context.user, context.provinces]);

  // Check if user has access to specific province
  const hasProvinceAccess = useCallback(
    (provinceId: string): boolean => {
      const user = context.user;

      if (!user || !provinceId) return false;

      // Admin roles have access to all provinces
      if (user.role === ROLES.SUPER_ADMIN ||
          user.role === ROLES.DEVELOPER ||
          user.role === ROLES.PRIVILEGE ||
          isInRoleCategory(user.role as RoleType, RoleCategory.GENERAL_MANAGER)) {
        return true;
      }

      // Other roles with multiple province access check their accessible provinces
      if (user.accessibleProvinceIds && user.accessibleProvinceIds.length > 0) {
        return user.accessibleProvinceIds.includes(provinceId);
      }

      // All other roles can only access their assigned province
      return user.province === provinceId;
    },
    [context.user]
  );

  // Alternative name for hasProvinceAccess for more readable code in some contexts
  const canAccessProvince = useCallback(
    (provinceId: string): boolean => {
      return hasProvinceAccess(provinceId);
    },
    [hasProvinceAccess]
  );

  return {
    ...context, // Include all the existing permission context properties
    userProvinces,
    hasProvinceAccess,
    canAccessProvince
  };
};

export default usePermissions;
