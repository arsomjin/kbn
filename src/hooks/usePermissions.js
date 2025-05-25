import { useAuth } from 'contexts/AuthContext';

export const usePermissions = () => {
  const {
    hasPermission,
    hasRole,
    hasPrivilege,
    shouldHideUserFromView,
    userProfile,
    hasProvinceAccess,
    hasBranchAccess,
    hasDepartmentAccess,
  } = useAuth();

  return {
    hasPermission,
    hasRole,
    hasPrivilege,
    shouldHideUserFromView,
    userProfile,
    hasProvinceAccess,
    hasBranchAccess,
    hasDepartmentAccess,
  };
};
