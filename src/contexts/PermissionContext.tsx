import React, { createContext, useContext, useMemo } from 'react';
import { UserProfile } from '../services/authService';
import { ROLE_PERMISSIONS, hasRolePermission, ROLES } from '../constants/roles';

interface PermissionContextType {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

// Create context with default values
export const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  hasPermission: () => false,
  hasRole: () => false
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
    const rolePermissions = ROLE_PERMISSIONS[userProfile.role] || [];

    // Add any custom permissions assigned directly to the user
    const customPermissions = userProfile.customPermissions || [];

    // Combine and deduplicate permissions
    return Array.from(new Set([...rolePermissions, ...customPermissions]));
  }, [userProfile]);

  // Function to check if the user has a specific permission
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  // Function to check if the user has a specific role
  const hasRole = (role: string): boolean => {
    if (!userProfile) return role === ROLES.GUEST;
    return hasRolePermission(userProfile.role, role);
  };

  // Context value
  const value = {
    permissions,
    hasPermission,
    hasRole
  };

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
};

/**
 * Testing utility for mocking permissions
 * As described in the documentation
 */
export const withTestPermissions = (permissions: string[]) => (Component: React.ComponentType<any>) => {
  return (props: any) => {
    // Mock the permission context for testing
    return (
      <PermissionContext.Provider
        value={{
          permissions,
          hasPermission: (permission: string) => permissions.includes(permission),
          hasRole: () => true // Simplified for testing
        }}
      >
        <Component {...props} />
      </PermissionContext.Provider>
    );
  };
};
