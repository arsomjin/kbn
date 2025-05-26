import { useAuth } from 'contexts/AuthContext';

export const usePermissions = () => {
  const {
    hasPermission,
    hasAnyPermission,
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
    hasAnyPermission,
    hasRole,
    hasPrivilege,
    shouldHideUserFromView,
    userProfile,
    hasProvinceAccess,
    hasBranchAccess,
    hasDepartmentAccess,
  };
};
