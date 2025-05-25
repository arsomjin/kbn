import React, { createContext, useContext } from 'react';
import { useAuth } from 'contexts/AuthContext';
import { Province } from 'types/province';
import { Permission, PermissionValue } from 'constants/Permissions';
import { ROLES, RoleType } from 'constants/roles';
import { hasRolePrivilege } from 'utils/roleUtils';

interface PermissionContextType {
  hasPermission: (permission: PermissionValue) => boolean;
  hasRole: (role: string) => boolean;
  hasProvinceAccess: (provinceId: string) => boolean;
  canAccessProvince: (provinceId: string) => boolean;
  userProvinces: Province[];
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, hasRole: authHasRole } = useAuth();

  // Get all user permissions
  const userPermissions = userProfile?.permissions || [];

  // Function to check if the user has a specific permission
  const hasPermission = (permission: PermissionValue): boolean => {
    return userPermissions.includes(permission);
  };

  // Function to check if the user has access to a specific province
  const hasProvinceAccess = (provinceId: string): boolean => {
    if (!userProfile || !provinceId) return false;

    // Users with GENERAL_MANAGER role category and higher can access all provinces
    if (hasRolePrivilege(userProfile.role as RoleType, ROLES.GENERAL_MANAGER)) {
      return true;
    }

    // Check if the user has access to the specific province
    return (userProfile?.accessibleProvinceIds || []).includes(provinceId);
  };

  // Alias for hasProvinceAccess for better semantics
  const canAccessProvince = hasProvinceAccess;

  // Get provinces that the user has access to
  const userProvinces: Province[] =
    (userProfile?.accessibleProvinceIds || [])?.map(id => ({
      id,
      name: `Province ${id.substring(0, 4)}`,
      nameEn: `Province ${id.substring(0, 4)}`,
      code: id.substring(0, 3).toUpperCase(),
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now()
    })) || [];

  const value: PermissionContextType = {
    hasPermission,
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
