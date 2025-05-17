import { useCallback } from 'react';
import { useSelector } from 'react-redux';

type Permission = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';

export const usePermission = () => {
  const userPermissions = useSelector((state: any) => state.auth?.permissions || []);

  const hasPermission = useCallback((permission: Permission) => {
    return userPermissions.includes(permission);
  }, [userPermissions]);

  return { hasPermission };
}; 