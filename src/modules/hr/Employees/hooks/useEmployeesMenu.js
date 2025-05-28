import { useMemo } from 'react';
import { useAuth } from 'contexts/AuthContext';
import { useEmployeesMenuConfig } from '../config/menuConfig';
import { RoleCategory, UserRole } from '../../../../constants/roles';
import { useParams } from 'react-router-dom';
import { getAllowedRolesByCategory } from '../../../../utils/roleUtils';

export const useEmployeesMenu = () => {
  const { userProfile } = useAuth();
  const { provinceId, branchCode } = useParams();
  const employeesMenuConfig = useEmployeesMenuConfig();

  const role = userProfile?.role;

  const menuItems = useMemo(() => {
    if (!userProfile) return [];

    const { roleCategory, permissions } = userProfile;
    const items = [];

    // Helper to check permission (supports array or object)
    const hasPermission = (perm) =>
      Array.isArray(permissions) ? permissions.includes(perm) : !!permissions?.[perm];

    // Executive level menu - accessible by executive and above
    if (getAllowedRolesByCategory(RoleCategory.GENERAL_MANAGER).includes(role)) {
      const executiveMenu = employeesMenuConfig.executive;
      const filteredChildren = executiveMenu.children.filter((item) =>
        hasPermission(item.permission),
      );
      if (filteredChildren.length > 0) {
        items.push({
          ...executiveMenu,
          children: filteredChildren,
        });
      }
    }

    // Province level menu - accessible by province manager and above with province context
    if (getAllowedRolesByCategory(RoleCategory.PROVINCE_MANAGER).includes(role) && provinceId) {
      const provinceMenu = employeesMenuConfig.province;
      const filteredChildren = provinceMenu.children
        .filter((item) => hasPermission(item.permission))
        .map((item) => ({
          ...item,
          path: item.path.replace(':provinceId', provinceId),
        }));
      if (filteredChildren.length > 0) {
        items.push({
          ...provinceMenu,
          children: filteredChildren,
        });
      }
    }

    // Branch level menu - accessible by branch manager and above with branch context
    if (
      getAllowedRolesByCategory(RoleCategory.BRANCH_MANAGER).includes(role) &&
      provinceId &&
      branchCode
    ) {
      const branchMenu = employeesMenuConfig.branch;
      const filteredChildren = branchMenu.children
        .filter((item) => hasPermission(item.permission))
        .map((item) => ({
          ...item,
          path: item.path.replace(':provinceId', provinceId).replace(':branchCode', branchCode),
        }));
      if (filteredChildren.length > 0) {
        items.push({
          ...branchMenu,
          children: filteredChildren,
        });
      }
    }

    return items;
  }, [userProfile, provinceId, branchCode, employeesMenuConfig, role]);

  return menuItems;
};
