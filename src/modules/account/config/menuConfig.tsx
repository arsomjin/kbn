import React from 'react';
import { DollarOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PERMISSIONS } from '../../../constants/Permissions';
import { RoleCategory } from '../../../constants/roles';

/**
 * Account Menu Configuration with i18n support
 * Provides menu structure for different user roles (executive, province, branch)
 * with proper translation keys for internationalization
 */
export const useAccountMenuConfig = () => {
  const { t } = useTranslation('menu');

  return {
    executive: {
      key: 'account-executive',
      label: t('account.executive.title'),
      icon: React.createElement(DollarOutlined),
      children: [
        {
          key: 'account-overview',
          label: t('account.overview'),
          path: '/account/overview',
          permission: PERMISSIONS.VIEW_ACCOUNTS,
          roles: [RoleCategory.EXECUTIVE],
        },
        {
          key: 'account-income',
          label: t('account.income'),
          path: '/account/income',
          permission: PERMISSIONS.VIEW_INCOME,
          roles: [RoleCategory.EXECUTIVE],
        },
        {
          key: 'account-expense',
          label: t('account.expense'),
          path: '/account/expense',
          permission: PERMISSIONS.VIEW_EXPENSE,
          roles: [RoleCategory.EXECUTIVE],
        },
        {
          key: 'account-input-price',
          label: t('account.inputPrice'),
          path: '/account/input-price',
          permission: PERMISSIONS.VIEW_ACCOUNTS,
          roles: [RoleCategory.EXECUTIVE],
        },
      ],
    },
    province: {
      key: 'account-province',
      label: t('account.province.title'),
      icon: React.createElement(FileTextOutlined),
      children: [
        {
          key: 'province-account-overview',
          label: t('account.overview'),
          path: '/:provinceId/account/overview',
          permission: PERMISSIONS.VIEW_ACCOUNTS,
          roles: [RoleCategory.PROVINCE_MANAGER],
        },
        {
          key: 'province-account-income',
          label: t('account.income'),
          path: '/:provinceId/account/income',
          permission: PERMISSIONS.VIEW_INCOME,
          roles: [RoleCategory.PROVINCE_MANAGER],
        },
        {
          key: 'province-account-expense',
          label: t('account.expense'),
          path: '/:provinceId/account/expense',
          permission: PERMISSIONS.VIEW_EXPENSE,
          roles: [RoleCategory.PROVINCE_MANAGER],
        },
        {
          key: 'province-account-input-price',
          label: t('account.inputPrice'),
          path: '/:provinceId/account/input-price',
          permission: PERMISSIONS.VIEW_ACCOUNTS,
          roles: [RoleCategory.PROVINCE_MANAGER],
        },
      ],
    },
    branch: {
      key: 'account-branch',
      label: t('account.branch.title'),
      icon: React.createElement(SettingOutlined),
      children: [
        {
          key: 'branch-account-overview',
          label: t('account.overview'),
          path: '/:provinceId/:branchCode/account/overview',
          permission: PERMISSIONS.VIEW_ACCOUNTS,
          roles: [RoleCategory.BRANCH_MANAGER, RoleCategory.BRANCH_STAFF],
        },
        {
          key: 'branch-account-income',
          label: t('account.income'),
          path: '/:provinceId/:branchCode/account/income',
          permission: PERMISSIONS.VIEW_INCOME,
          roles: [RoleCategory.BRANCH_MANAGER, RoleCategory.BRANCH_STAFF],
        },
        {
          key: 'branch-account-expense',
          label: t('account.expense'),
          path: '/:provinceId/:branchCode/account/expense',
          permission: PERMISSIONS.VIEW_EXPENSE,
          roles: [RoleCategory.BRANCH_MANAGER, RoleCategory.BRANCH_STAFF],
        },
        {
          key: 'branch-account-input-price',
          label: t('account.inputPrice'),
          path: '/:provinceId/:branchCode/account/input-price',
          permission: PERMISSIONS.VIEW_ACCOUNTS,
          roles: [RoleCategory.BRANCH_MANAGER, RoleCategory.BRANCH_STAFF],
        },
      ],
    },
  };
};

// Legacy export for backward compatibility
// @deprecated Use useAccountMenuConfig hook instead
export const accountMenuConfig = {
  executive: {
    key: 'account-executive',
    label: 'Account (Executive)',
    icon: React.createElement(DollarOutlined),
    children: [
      {
        key: 'account-overview',
        label: 'Overview',
        path: '/account/overview',
        permission: PERMISSIONS.VIEW_ACCOUNTS,
        roles: [RoleCategory.EXECUTIVE],
      },
      {
        key: 'account-income',
        label: 'Income',
        path: '/account/income',
        permission: PERMISSIONS.VIEW_INCOME,
        roles: [RoleCategory.EXECUTIVE],
      },
      {
        key: 'account-expense',
        label: 'Expense',
        path: '/account/expense',
        permission: PERMISSIONS.VIEW_EXPENSE,
        roles: [RoleCategory.EXECUTIVE],
      },
      {
        key: 'account-input-price',
        label: 'Input Price',
        path: '/account/input-price',
        permission: PERMISSIONS.VIEW_ACCOUNTS,
        roles: [RoleCategory.EXECUTIVE],
      },
    ],
  },
  province: {
    key: 'account-province',
    label: 'Account (Province)',
    icon: React.createElement(FileTextOutlined),
    children: [
      {
        key: 'province-account-overview',
        label: 'Overview',
        path: '/:provinceId/account/overview',
        permission: PERMISSIONS.VIEW_ACCOUNTS,
        roles: [RoleCategory.PROVINCE_MANAGER],
      },
      {
        key: 'province-account-income',
        label: 'Income',
        path: '/:provinceId/account/income',
        permission: PERMISSIONS.VIEW_INCOME,
        roles: [RoleCategory.PROVINCE_MANAGER],
      },
      {
        key: 'province-account-expense',
        label: 'Expense',
        path: '/:provinceId/account/expense',
        permission: PERMISSIONS.VIEW_EXPENSE,
        roles: [RoleCategory.PROVINCE_MANAGER],
      },
      {
        key: 'province-account-input-price',
        label: 'Input Price',
        path: '/:provinceId/account/input-price',
        permission: PERMISSIONS.VIEW_ACCOUNTS,
        roles: [RoleCategory.PROVINCE_MANAGER],
      },
    ],
  },
  branch: {
    key: 'account-branch',
    label: 'Account (Branch)',
    icon: React.createElement(SettingOutlined),
    children: [
      {
        key: 'branch-account-overview',
        label: 'Overview',
        path: '/:provinceId/:branchCode/account/overview',
        permission: PERMISSIONS.VIEW_ACCOUNTS,
        roles: [RoleCategory.BRANCH_MANAGER, RoleCategory.BRANCH_STAFF],
      },
      {
        key: 'branch-account-income',
        label: 'Income',
        path: '/:provinceId/:branchCode/account/income',
        permission: PERMISSIONS.VIEW_INCOME,
        roles: [RoleCategory.BRANCH_MANAGER, RoleCategory.BRANCH_STAFF],
      },
      {
        key: 'branch-account-expense',
        label: 'Expense',
        path: '/:provinceId/:branchCode/account/expense',
        permission: PERMISSIONS.VIEW_EXPENSE,
        roles: [RoleCategory.BRANCH_MANAGER, RoleCategory.BRANCH_STAFF],
      },
      {
        key: 'branch-account-input-price',
        label: 'Input Price',
        path: '/:provinceId/:branchCode/account/input-price',
        permission: PERMISSIONS.VIEW_ACCOUNTS,
        roles: [RoleCategory.BRANCH_MANAGER, RoleCategory.BRANCH_STAFF],
      },
    ],
  },
};
