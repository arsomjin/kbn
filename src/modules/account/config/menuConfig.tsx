import React from 'react';
import { DollarOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons';
import { PERMISSIONS } from '../../../constants/Permissions';
import { RoleCategory } from '../../../constants/roles';

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
