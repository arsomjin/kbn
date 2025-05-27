import { useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { accountMenuConfig } from '../config/menuConfig';
import { RoleCategory, UserRole } from '../../../constants/roles';
import { useParams } from 'react-router-dom';
import { MenuProps } from 'antd';
import { getAllowedRolesByCategory } from '../../../utils/roleUtils';

interface UserProfile {
  role?: (typeof UserRole)[keyof typeof UserRole];
  permissions?: Record<string, boolean>;
  roleCategory?: (typeof RoleCategory)[keyof typeof RoleCategory];
}

interface MenuItem {
  key: string;
  label: string;
  path: string;
  permission: string;
  roles: (typeof RoleCategory)[keyof typeof RoleCategory][];
}

interface MenuGroup {
  key: string;
  label: string;
  icon: React.ReactNode;
  children: MenuItem[];
}

export const useAccountMenu = () => {
  const { userProfile } = useAuth() as { userProfile: UserProfile };
  const { provinceId, branchCode } = useParams<{ provinceId?: string; branchCode?: string }>();

  const role = userProfile?.role;

  const menuItems = useMemo(() => {
    if (!userProfile) return [];

    const { roleCategory, permissions } = userProfile;
    const items: MenuGroup[] = [];

    // Helper to check permission (supports array or object)
    const hasPermission = (perm: string) =>
      Array.isArray(permissions) ? permissions.includes(perm) : !!permissions?.[perm];

    // Executive level menu
    if (getAllowedRolesByCategory(RoleCategory.EXECUTIVE).includes(role)) {
      const executiveMenu = accountMenuConfig.executive;
      console.log('[useAccountMenu] Executive level menu', executiveMenu);
      console.log('[useAccountMenu] user permissions', permissions);
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

    // Province level menu
    if (getAllowedRolesByCategory(RoleCategory.PROVINCE_MANAGER).includes(role) && provinceId) {
      const provinceMenu = accountMenuConfig.province;
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

    // Branch level menu
    if (
      getAllowedRolesByCategory(RoleCategory.BRANCH_MANAGER).includes(role) &&
      provinceId &&
      branchCode
    ) {
      const branchMenu = accountMenuConfig.branch;
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
  }, [userProfile, provinceId, branchCode]);

  return menuItems;
};
