import React, { createContext, useMemo } from 'react';
import { UserProfile } from '../services/authService';
import {
  ROLE_PERMISSIONS,
  hasRolePermission,
  ROLES,
  UserRole,
  RoleType,
  RoleCategory,
  isInRoleCategory
} from '../constants/roles';
import { Province } from '../types/province';

interface PermissionContextType {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
  hasProvinceAccess: (provinceId: string) => boolean;
  canAccessProvince: (provinceId: string) => boolean;
  userProvinces: Province[];
  // Add user and provinces properties
  user: UserProfile | null;
  provinces: Province[];
}

// Create context with default values
export const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  hasPermission: () => false,
  hasRole: () => false,
  hasProvinceAccess: () => false,
  canAccessProvince: () => false,
  userProvinces: [],
  user: null,
  provinces: []
});

interface PermissionProviderProps {
  userProfile: UserProfile | null;
  children: React.ReactNode;
}

/**
 * Permission Provider component that makes permission checking available
 * to all children components
 */
export const PermissionProvider: React.FC<PermissionProviderProps> = ({ userProfile, children }) => {
  // Determine the user's permissions based on their role
  const permissions = useMemo(() => {
    if (!userProfile || !userProfile.role) {
      // Return guest permissions if no user profile
      return ROLE_PERMISSIONS[ROLES.GUEST] || [];
    }

    // Get role permissions
    const rolePermissions = ROLE_PERMISSIONS[userProfile.role as RoleType] || [];

    // Add any custom permissions assigned directly to the user
    const customPermissions = userProfile.customPermissions || [];

    // Combine and deduplicate permissions
    return Array.from(new Set([...rolePermissions, ...customPermissions]));
  }, [userProfile]);

  // Function to check if the user has a specific permission
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  // Function to check if the user has a specific role (single or array)
  const hasRole = (role: string | string[]): boolean => {
    if (!userProfile) return Array.isArray(role) ? role.includes(ROLES.GUEST as string) : role === ROLES.GUEST;

    if (Array.isArray(role)) {
      return role.some(r => hasRolePermission(userProfile.role as UserRole, r as UserRole));
    }

    return hasRolePermission(userProfile.role as UserRole, role as UserRole);
  };

  // Function to check if the user has access to a specific province
  const hasProvinceAccess = (provinceId: string): boolean => {
    if (!userProfile || !provinceId) return false;

    // Users with GENERAL_MANAGER role category and higher can access all provinces
    if (isInRoleCategory(userProfile.role as RoleType, RoleCategory.GENERAL_MANAGER)) {
      return true;
    }

    // Other roles with multiple province access check their accessible provinces
    if (userProfile.accessibleProvinceIds) {
      return userProfile.accessibleProvinceIds.includes(provinceId);
    }

    // All other roles can only access their assigned province
    return userProfile.province === provinceId;
  };

  // Alias for hasProvinceAccess for better semantics
  const canAccessProvince = hasProvinceAccess;

  // Get provinces that the user has access to
  const userProvinces = useMemo(() => {
    // In a real implementation, this would be populated from a provinces store or API
    // For now, we're returning a simple array with the user's province if available
    const provinces: Province[] = [];

    if (userProfile?.province) {
      provinces.push({
        id: userProfile.province,
        name: 'Default Province', // This would come from a province lookup
        code: 'DEF',
        isActive: true // Add required property
      });
    }

    // If the user has access to multiple provinces (like a General Manager)
    if (userProfile?.accessibleProvinceIds?.length) {
      // In a real implementation, this would fetch from a province store
      // For now, we're just creating placeholder objects
      userProfile.accessibleProvinceIds.forEach(id => {
        if (id !== userProfile.province) {
          // Avoid duplicates
          provinces.push({
            id,
            name: `Province ${id.substring(0, 4)}`, // Simplified name
            code: id.substring(0, 3).toUpperCase(),
            isActive: true // Add required property
          });
        }
      });
    }

    return provinces;
  }, [userProfile]);

  // Context value
  const value = {
    permissions,
    hasPermission,
    hasRole,
    hasProvinceAccess,
    canAccessProvince,
    userProvinces,
    user: userProfile,
    provinces: userProvinces
  };

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
};

/**
 * Testing utility for mocking permissions
 * As described in the documentation
 */
export const withTestPermissions =
  (permissions: string[], provinces: Province[] = []) =>
  (Component: React.ComponentType<any>) => {
    return (props: any) => {
      // Mock the permission context for testing
      return (
        <PermissionContext.Provider
          value={{
            permissions,
            hasPermission: (permission: string) => permissions.includes(permission),
            hasRole: (role: string | string[]) => (Array.isArray(role) ? true : true), // Simplified for testing
            hasProvinceAccess: () => true, // Simplified for testing
            canAccessProvince: () => true, // Simplified for testing
            userProvinces: provinces,
            user: null,
            provinces
          }}
        >
          <Component {...props} />
        </PermissionContext.Provider>
      );
    };
  };
