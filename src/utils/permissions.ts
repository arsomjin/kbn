import { useSelector } from "react-redux";
import { PERMISSIONS, PermissionValue } from "constants/permissions";
import { Permission } from '../constants/permissions';
import { RootState } from '../store';
import { store } from '../store';
import { UserProfile } from '../services/authService';

/**
 * Check if user has a specific permission
 * @param permission - Permission to check
 * @returns boolean indicating if user has permission
 */
export const hasPermission = (permission: PermissionValue): boolean => {
  const state = store.getState();
  const { userProfile } = state.auth;
  return userProfile?.customPermissions?.includes(permission) || false;
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
  return permissions.some(permission => hasPermission(permission));
};

/**
 * Check if user has all of the specified permissions
 * @param permissions - Array of permissions to check
 * @returns boolean indicating if user has all permissions
 */
export const hasAllPermissions = (permissions: PermissionValue[]): boolean => {
  return permissions.every(permission => hasPermission(permission));
};

export const usePermissionCheck = (permission: Permission): boolean => {
  const { userProfile } = useSelector((state: RootState) => state.auth);
  return userProfile?.customPermissions?.includes(permission) || false;
};

export const useProvinceAccessCheck = (provinceId: string): boolean => {
  const { userProfile } = useSelector((state: RootState) => state.auth);
  return userProfile?.accessibleProvinceIds?.includes(provinceId) || false;
};

export const useBranchAccessCheck = (branchId: string): boolean => {
  const { userProfile } = useSelector((state: RootState) => state.auth);
  if (!userProfile) return false;
  return userProfile.requestedType === 'employee' && userProfile.branch === branchId;
}; 