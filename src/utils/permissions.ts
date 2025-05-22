import { PERMISSIONS, PermissionValue } from '../constants/Permissions';
import { Permission } from '../constants/Permissions';
import { UserProfile } from '../services/authService';
import { ROLE_PERMISSIONS } from '../constants/roles';
import { useAuth } from 'contexts/AuthContext';

/**
 * Get all permissions for a user based on their role
 * @param userProfile - User's profile containing role
 * @returns Array of permissions the user has based on their role
 */
export const getUserPermissions = (userProfile: UserProfile | null): PermissionValue[] => {
  if (!userProfile) return [];
  return (ROLE_PERMISSIONS[userProfile.role as keyof typeof ROLE_PERMISSIONS] || []) as PermissionValue[];
};

/**
 * Check if user has a specific permission (plain function, pass userProfile explicitly)
 */
export const hasPermission = (userProfile: UserProfile | null, permission: PermissionValue): boolean => {
  if (!userProfile) return false;
  const allPermissions = getUserPermissions(userProfile);
  return allPermissions.includes(permission);
};

/**
 * Check if user has access to a specific province (plain function, pass userProfile explicitly)
 */
export const hasProvinceAccess = (userProfile: UserProfile | null, provinceId: string): boolean => {
  return userProfile?.accessibleProvinceIds?.includes(provinceId) || false;
};

/**
 * Check if user has access to a specific branch (plain function, pass userProfile explicitly)
 */
export const hasBranchAccess = (userProfile: UserProfile | null, branchCode: string): boolean => {
  if (!userProfile) return false;
  return userProfile.requestedType === 'employee' && userProfile.branch === branchCode;
};

/**
 * Check if user has any of the specified permissions (plain function, pass userProfile explicitly)
 */
export const hasAnyPermission = (userProfile: UserProfile | null, permissions: PermissionValue[]): boolean => {
  if (!userProfile) return false;
  const allPermissions = getUserPermissions(userProfile);
  return permissions.some(permission => allPermissions.includes(permission));
};

/**
 * Check if user has all of the specified permissions (plain function, pass userProfile explicitly)
 */
export const hasAllPermissions = (userProfile: UserProfile | null, permissions: PermissionValue[]): boolean => {
  if (!userProfile) return false;
  const allPermissions = getUserPermissions(userProfile);
  return permissions.every(permission => allPermissions.includes(permission));
};

/**
 * React hook: Check if user has a specific permission (uses AuthContext)
 */
export const useHasPermission = (permission: PermissionValue): boolean => {
  const { userProfile } = useAuth();
  return hasPermission(userProfile, permission);
};

/**
 * React hook: Check if user has access to a specific province (uses AuthContext)
 */
export const useHasProvinceAccess = (provinceId: string): boolean => {
  const { userProfile } = useAuth();
  return hasProvinceAccess(userProfile, provinceId);
};

/**
 * React hook: Check if user has access to a specific branch (uses AuthContext)
 */
export const useHasBranchAccess = (branchCode: string): boolean => {
  const { userProfile } = useAuth();
  return hasBranchAccess(userProfile, branchCode);
};

/**
 * React hook: Get all user permissions (uses AuthContext)
 */
export const useUserPermissions = (): PermissionValue[] => {
  const { userProfile } = useAuth();
  return getUserPermissions(userProfile);
};
