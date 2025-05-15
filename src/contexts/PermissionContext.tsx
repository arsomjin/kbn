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
import { Permission } from '../constants/Permissions';

interface PermissionContextType {
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
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
  permissions: [] as Permission[],
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
    const customPermissions = (userProfile.customPermissions || []) as Permission[];

    // Combine and deduplicate permissions
    return Array.from(new Set([...rolePermissions, ...customPermissions])) as Permission[];
  }, [userProfile]);

  // Function to check if the user has a specific permission
  const hasPermission = (permission: Permission): boolean => {
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

    // Admin roles (SUPER_ADMIN, DEVELOPER, PRIVILEGE) have access to all provinces
    if (userProfile.role === ROLES.SUPER_ADMIN || 
        userProfile.role === ROLES.DEVELOPER || 
        userProfile.role === ROLES.PRIVILEGE) {
      return true;
    }

    // Users with GENERAL_MANAGER role category and higher can access all provinces
    if (isInRoleCategory(userProfile.role as RoleType, RoleCategory.GENERAL_MANAGER)) {
      return true;
    }

    // Other roles with multiple province access check their accessible provinces
    if (userProfile.accessibleProvinceIds && userProfile.accessibleProvinceIds.length > 0) {
      return userProfile.accessibleProvinceIds.includes(provinceId);
    }

    // All other roles can only access their assigned province
    return userProfile.province === provinceId;
  };

  // Alias for hasProvinceAccess for better semantics
  const canAccessProvince = hasProvinceAccess;

  // Get provinces that the user has access to
  const userProvinces = useMemo(() => {
    // If no user profile, no provinces are accessible
    if (!userProfile) return [];

    // In a real implementation, this would be populated from a provinces store or API
    const provinces: Province[] = [];

    // Admin roles and General Manager have access to all provinces
    const hasFullAccess = userProfile.role === ROLES.SUPER_ADMIN ||
                         userProfile.role === ROLES.DEVELOPER || 
                         userProfile.role === ROLES.PRIVILEGE ||
                         isInRoleCategory(userProfile.role as RoleType, RoleCategory.GENERAL_MANAGER);

    // If the user has their own province, add it
    if (userProfile.province) {
      provinces.push({
        id: userProfile.province,
        name: 'Default Province', // This would come from a province lookup
        nameEn: 'Default Province',
        code: 'DEF',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }

    // If the user has access to multiple provinces or has full access
    if (hasFullAccess || userProfile.accessibleProvinceIds?.length) {
      // In a real implementation, this would fetch from a province store
      // For now, we're just creating placeholder objects
      const provinceIds = hasFullAccess ? 
        // For full access roles, we would normally fetch all provinces
        ['all-provinces'] :
        // Otherwise use the user's accessible provinces
        userProfile.accessibleProvinceIds || [];

      provinceIds.forEach(id => {
        if (id !== userProfile.province) {
          // Avoid duplicates
          const provinceName = `Province ${id.substring(0, 4)}`; // Simplified name
          provinces.push({
            id,
            name: provinceName,
            nameEn: provinceName,
            code: id.substring(0, 3).toUpperCase(),
            status: 'active',
            createdAt: Date.now(),
            updatedAt: Date.now()
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
  (permissions: Permission[], provinces: Province[] = []) =>
  (Component: React.ComponentType<any>) => {
    return (props: any) => {
      // Mock the permission context for testing
      return (
        <PermissionContext.Provider
          value={{
            permissions,
            hasPermission: (permission: Permission) => permissions.includes(permission),
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
