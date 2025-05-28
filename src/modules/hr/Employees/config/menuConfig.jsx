import React from 'react';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PERMISSIONS } from '../../../../constants/Permissions';
import { RoleCategory } from '../../../../constants/roles';

/**
 * Employees Menu Configuration with i18n support
 * Provides menu structure for different user roles (executive, province, branch)
 * with proper translation keys for internationalization
 */
export const useEmployeesMenuConfig = () => {
  const { t } = useTranslation(['menu']);

  return {
    executive: {
      key: 'employees-executive',
      label: t('employees.executive.title'),
      icon: React.createElement(TeamOutlined),
      children: [
        {
          key: 'employee-list',
          label: t('employees.list'),
          path: '/hr/employees',
          permission: PERMISSIONS.EMPLOYEE_VIEW,
          roles: [RoleCategory.EXECUTIVE],
        },
      ],
    },
    province: {
      key: 'employees-province',
      label: t('employees.province.title'),
      icon: React.createElement(UserOutlined),
      children: [
        {
          key: 'province-employee-list',
          label: t('employees.list'),
          path: '/:provinceId/hr/employees',
          permission: PERMISSIONS.EMPLOYEE_VIEW,
          roles: [RoleCategory.PROVINCE_MANAGER],
        },
      ],
    },
    branch: {
      key: 'employees-branch',
      label: t('employees.branch.title'),
      icon: React.createElement(UserOutlined),
      children: [
        {
          key: 'branch-employee-list',
          label: t('employees.list'),
          path: '/:provinceId/:branchCode/hr/employees',
          permission: PERMISSIONS.EMPLOYEE_VIEW,
          roles: [RoleCategory.BRANCH_MANAGER],
        },
      ],
    },
  };
};

// Legacy export for backward compatibility
// @deprecated Use useEmployeesMenuConfig hook instead
export const employeesMenuConfig = {
  executive: {
    key: 'employees-executive',
    label: 'Employees (Executive)',
    icon: React.createElement(TeamOutlined),
    children: [
      {
        key: 'employee-list',
        label: 'Employee List',
        path: '/hr/employees',
        permission: PERMISSIONS.EMPLOYEE_VIEW,
        roles: [RoleCategory.EXECUTIVE],
      },
    ],
  },
  province: {
    key: 'employees-province',
    label: 'Employees (Province)',
    icon: React.createElement(UserOutlined),
    children: [
      {
        key: 'province-employee-list',
        label: 'Employee List',
        path: '/:provinceId/hr/employees',
        permission: PERMISSIONS.EMPLOYEE_VIEW,
        roles: [RoleCategory.PROVINCE_MANAGER],
      },
    ],
  },
  branch: {
    key: 'employees-branch',
    label: 'Employees (Branch)',
    icon: React.createElement(UserOutlined),
    children: [
      {
        key: 'branch-employee-list',
        label: 'Employee List',
        path: '/:provinceId/:branchCode/hr/employees',
        permission: PERMISSIONS.EMPLOYEE_VIEW,
        roles: [RoleCategory.BRANCH_MANAGER],
      },
    ],
  },
};
