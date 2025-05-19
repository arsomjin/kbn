import { useAuth } from 'contexts/AuthContext';

export const usePermissions = () => {
  const { hasPermission, hasRole, userProfile, hasProvinceAccess } = useAuth();

  return {
    hasPermission,
    hasRole,
    userProfile,
    hasProvinceAccess
  };
};
