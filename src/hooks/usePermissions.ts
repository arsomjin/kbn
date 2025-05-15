import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Permission } from '../constants/Permissions';
import { UserProfile } from '../types/user';
import { ROLE_PERMISSIONS, ROLES } from '../constants/roles';

/**
 * Hook providing permission-checking functionality throughout the application,
 * including province-based access control
 */
export const usePermissions = () => {
  const { userProfile } = useSelector((state: RootState) => state.auth);

  const hasPermission = (permission: Permission): boolean => {
    if (!userProfile) return false;

    // Check if user has the permission in their custom permissions
    if (userProfile.customPermissions?.includes(permission)) {
      return true;
    }

    // Check if user's role has the permission
    const rolePermissions = ROLE_PERMISSIONS[userProfile.role as keyof typeof ROLE_PERMISSIONS] || [];
    return rolePermissions.includes(permission);
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!userProfile) return false;

    if (Array.isArray(role)) {
      return role.includes(userProfile.role);
    }

    return userProfile.role === role;
  };

  const hasProvinceAccess = (provinceId: string): boolean => {
    if (!userProfile) return false;

    // Users with GENERAL_MANAGER role and higher can access all provinces
    if (userProfile.role === ROLES.GENERAL_MANAGER || 
        userProfile.role === ROLES.PRIVILEGE || 
        userProfile.role === ROLES.SUPER_ADMIN || 
        userProfile.role === ROLES.DEVELOPER) {
      return true;
    }

    // Check if user has access to the province
    return userProfile.accessibleProvinceIds?.includes(provinceId) || false;
  };

  const canAccessProvince = (provinceId: string): boolean => {
    return hasProvinceAccess(provinceId);
  };

  return {
    userProfile,
    hasPermission,
    hasRole,
    hasProvinceAccess,
    canAccessProvince,
    permissions: userProfile?.customPermissions || [],
  };
};

export default usePermissions;
