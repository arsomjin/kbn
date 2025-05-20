import React, { createContext, useContext } from 'react';
import { useAuth } from 'contexts/AuthContext';
import { Province } from 'types/province';
import { Permission } from 'constants/Permissions';
import { ROLES, isInRoleCategory, RoleCategory } from 'constants/roles';

interface PermissionContextType {
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasProvinceAccess: (provinceId: string) => boolean;
  canAccessProvince: (provinceId: string) => boolean;
  userProvinces: Province[];
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, hasPermission: authHasPermission, hasRole: authHasRole } = useAuth();

  // Function to check if the user has access to a specific province
  const hasProvinceAccess = (provinceId: string): boolean => {
    if (!userProfile || !provinceId) return false;

    // Admin roles have access to all provinces
    if (
      userProfile.role === ROLES.SUPER_ADMIN ||
      userProfile.role === ROLES.DEVELOPER ||
      userProfile.role === ROLES.PRIVILEGE
    ) {
      return true;
    }

    // Users with GENERAL_MANAGER role category and higher can access all provinces
    if (isInRoleCategory(userProfile.role as any, RoleCategory.GENERAL_MANAGER)) {
      return true;
    }

    // Check if the user has access to the specific province
    return userProfile.provinceAccess.includes(provinceId);
  };

  // Alias for hasProvinceAccess for better semantics
  const canAccessProvince = hasProvinceAccess;

  // Get provinces that the user has access to
  const userProvinces: Province[] =
    userProfile?.provinceAccess?.map(id => ({
      id,
      name: `Province ${id.substring(0, 4)}`,
      nameEn: `Province ${id.substring(0, 4)}`,
      code: id.substring(0, 3).toUpperCase(),
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now()
    })) || [];

  const value: PermissionContextType = {
    hasPermission: authHasPermission,
    hasRole: authHasRole,
    hasProvinceAccess,
    canAccessProvince,
    userProvinces
  };

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

/**
 * Testing utility for mocking permissions
 */
export const withTestPermissions = (permissions: Permission[], provinces: Province[] = []) => {
  return (Component: React.ComponentType<any>) => {
    return (props: any) => (
      <PermissionContext.Provider
        value={{
          hasPermission: () => true,
          hasRole: () => true,
          hasProvinceAccess: () => true,
          canAccessProvince: () => true,
          userProvinces: provinces
        }}
      >
        <Component {...props} />
      </PermissionContext.Provider>
    );
  };
};
