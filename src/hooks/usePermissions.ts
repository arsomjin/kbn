import { useContext } from 'react';
import { PermissionContext } from '../contexts/PermissionContext';

/**
 * Custom hook that provides access to the permission context
 *
 * Usage:
 * ```
 * const { hasPermission, hasRole, permissions } = usePermissions();
 *
 * if (hasPermission(PERMISSIONS.DATA_EXPORT)) {
 *   // Show export options
 * }
 *
 * if (hasRole(ROLES.ADMIN)) {
 *   // Admin-only UI
 * }
 * ```
 */
export const usePermissions = () => {
  const context = useContext(PermissionContext);

  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }

  return context;
};

export default usePermissions;
