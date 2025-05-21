import { useSelector } from 'react-redux';
import { PERMISSIONS, PermissionValue } from '../constants/Permissions';
import { Permission } from '../constants/Permissions';
import { RootState } from '../store';
import { store } from '../store';
import { UserProfile } from '../services/authService';
import { ROLE_PERMISSIONS } from '../constants/roles';

/**
 * Get all permissions for a user based on their role
 * @param userProfile - User's profile containing role
 * @returns Array of permissions the user has based on their role
 */
export const getUserPermissions = (userProfile: UserProfile | null): PermissionValue[] => {
  if (!userProfile) return [];

  // Get role-based permissions only
  return (ROLE_PERMISSIONS[userProfile.role as keyof typeof ROLE_PERMISSIONS] || []) as PermissionValue[];
};

/**
 * Check if user has a specific permission
 * @param permission - Permission to check
 * @returns boolean indicating if user has permission
 */
export const hasPermission = (permission: PermissionValue): boolean => {
  const state = store.getState();
  const { userProfile } = state.auth;

  if (!userProfile) return false;

  const allPermissions = getUserPermissions(userProfile);
  return allPermissions.includes(permission);
};

/**
 * Check if user has access to a specific province
 * @param provinceId - Province ID to check
 * @returns boolean indicating if user has province access
 */
export const hasProvinceAccess = (provinceId: string): boolean => {
  const state = store.getState();
  const { userProfile } = state.auth;
  return userProfile?.accessibleProvinceIds?.includes(provinceId) || false;
};

/**
 * Check if user has access to a specific branch
 * @param branchCode - Branch code to check
 * @returns boolean indicating if user has branch access
 */
export const hasBranchAccess = (branchCode: string): boolean => {
  const state = store.getState();
  const { userProfile } = state.auth;
  if (!userProfile) return false;
  return userProfile.requestedType === 'employee' && userProfile.branch === branchCode;
};

/**
 * Check if user has any of the specified permissions
 * @param permissions - Array of permissions to check
 * @returns boolean indicating if user has any of the permissions
 */
export const hasAnyPermission = (permissions: PermissionValue[]): boolean => {
  const state = store.getState();
  const { userProfile } = state.auth;

  if (!userProfile) return false;

  const allPermissions = getUserPermissions(userProfile);
  return permissions.some(permission => allPermissions.includes(permission));
};

/**
 * Check if user has all of the specified permissions
 * @param permissions - Array of permissions to check
 * @returns boolean indicating if user has all permissions
 */
export const hasAllPermissions = (permissions: PermissionValue[]): boolean => {
  const state = store.getState();
  const { userProfile } = state.auth;

  if (!userProfile) return false;

  const allPermissions = getUserPermissions(userProfile);
  return permissions.every(permission => allPermissions.includes(permission));
};

/**
 * Hook to check if user has a specific permission
 * @param permission - Permission to check
 * @returns boolean indicating if user has permission
 */
export const usePermissionCheck = (permission: Permission): boolean => {
  const { userProfile } = useSelector((state: RootState) => state.auth);
  const allPermissions = getUserPermissions(userProfile);
  return allPermissions.includes(permission);
};

/**
 * Hook to get all user permissions
 * @returns Array of all permissions the user has
 */
export const useUserPermissions = (): PermissionValue[] => {
  const { userProfile } = useSelector((state: RootState) => state.auth);
  return getUserPermissions(userProfile);
};
