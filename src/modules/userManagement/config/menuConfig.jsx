import React from 'react';
import { UsergroupAddOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PERMISSIONS } from '../../../constants/Permissions';
import { RoleCategory } from '../../../constants/roles';

/**
 * User Management Menu Configuration with i18n support
 * Provides menu structure for different user roles (executive, province, branch)
 * with proper translation keys for internationalization
 * Limited to branch_manager role category and higher
 */
export const useUserManagementMenuConfig = () => {
  const { t } = useTranslation('menu');

  return {
    executive: {
      key: 'user-management-executive',
      label: t('userManagement.executive.title'),
      icon: React.createElement(UsergroupAddOutlined),
      children: [
        {
          key: 'user-review',
          label: t('userManagement.userReview'),
          path: '/admin/review-users',
          permission: PERMISSIONS.USER_ROLE_EDIT,
          roles: [RoleCategory.EXECUTIVE],
        },
        {
          key: 'user-role-manager',
          label: t('userManagement.userRoleManager'),
          path: '/admin/user-role-manager',
          permission: PERMISSIONS.MANAGE_USERS,
          roles: [RoleCategory.EXECUTIVE],
        },
      ],
    },
    province: {
      key: 'user-management-province',
      label: t('userManagement.province.title'),
      icon: React.createElement(UserOutlined),
      children: [
        {
          key: 'province-user-review',
          label: t('userManagement.userReview'),
          path: '/:provinceId/admin/review-users',
          permission: PERMISSIONS.USER_ROLE_EDIT,
          roles: [RoleCategory.PROVINCE_MANAGER],
        },
        {
          key: 'province-user-role-manager',
          label: t('userManagement.userRoleManager'),
          path: '/:provinceId/admin/user-role-manager',
          permission: PERMISSIONS.MANAGE_USERS,
          roles: [RoleCategory.PROVINCE_MANAGER],
        },
      ],
    },
    branch: {
      key: 'user-management-branch',
      label: t('userManagement.branch.title'),
      icon: React.createElement(SettingOutlined),
      children: [
        {
          key: 'branch-user-review',
          label: t('userManagement.userReview'),
          path: '/:provinceId/:branchCode/admin/review-users',
          permission: PERMISSIONS.USER_ROLE_EDIT,
          roles: [RoleCategory.BRANCH_MANAGER],
        },
        {
          key: 'branch-user-role-manager',
          label: t('userManagement.userRoleManager'),
          path: '/:provinceId/:branchCode/admin/user-role-manager',
          permission: PERMISSIONS.MANAGE_USERS,
          roles: [RoleCategory.BRANCH_MANAGER],
        },
      ],
    },
  };
};

// Legacy export for backward compatibility
// @deprecated Use useUserManagementMenuConfig hook instead
export const userManagementMenuConfig = {
  executive: {
    key: 'user-management-executive',
    label: 'User Management (Executive)',
    icon: React.createElement(UsergroupAddOutlined),
    children: [
      {
        key: 'user-review',
        label: 'User Review',
        path: '/admin/review-users',
        permission: PERMISSIONS.USER_ROLE_EDIT,
        roles: [RoleCategory.EXECUTIVE],
      },
      {
        key: 'user-role-manager',
        label: 'User Role Manager',
        path: '/admin/user-role-manager',
        permission: PERMISSIONS.MANAGE_USERS,
        roles: [RoleCategory.EXECUTIVE],
      },
    ],
  },
  province: {
    key: 'user-management-province',
    label: 'User Management (Province)',
    icon: React.createElement(UserOutlined),
    children: [
      {
        key: 'province-user-review',
        label: 'User Review',
        path: '/:provinceId/admin/review-users',
        permission: PERMISSIONS.USER_ROLE_EDIT,
        roles: [RoleCategory.PROVINCE_MANAGER],
      },
      {
        key: 'province-user-role-manager',
        label: 'User Role Manager',
        path: '/:provinceId/admin/user-role-manager',
        permission: PERMISSIONS.MANAGE_USERS,
        roles: [RoleCategory.PROVINCE_MANAGER],
      },
    ],
  },
  branch: {
    key: 'user-management-branch',
    label: 'User Management (Branch)',
    icon: React.createElement(SettingOutlined),
    children: [
      {
        key: 'branch-user-review',
        label: 'User Review',
        path: '/:provinceId/:branchCode/admin/review-users',
        permission: PERMISSIONS.USER_ROLE_EDIT,
        roles: [RoleCategory.BRANCH_MANAGER],
      },
      {
        key: 'branch-user-role-manager',
        label: 'User Role Manager',
        path: '/:provinceId/:branchCode/admin/user-role-manager',
        permission: PERMISSIONS.MANAGE_USERS,
        roles: [RoleCategory.BRANCH_MANAGER],
      },
    ],
  },
};
