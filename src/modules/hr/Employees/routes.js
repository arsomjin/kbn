import { UserOutlined } from '@ant-design/icons';
import { PERMISSIONS } from 'constants/Permissions';
import { RoleCategory } from 'constants/roles';
import { Employees } from './index';

export const employeeRoutes = {
  // Executive Layer
  executive: {
    path: '/hr/employees/*',
    element: <Employees />,
    allowedRoles: [RoleCategory.EXECUTIVE],
    requiredPermission: PERMISSIONS.EMPLOYEE_VIEW,
    children: [
      {
        path: '',
        element: <Employees />,
      },
      {
        path: 'create',
        element: <Employees />,
        requiredPermission: PERMISSIONS.EMPLOYEE_CREATE,
      },
      {
        path: 'edit/:employeeId',
        element: <Employees />,
        requiredPermission: PERMISSIONS.EMPLOYEE_EDIT,
      },
    ],
  },

  // Province Layer
  province: {
    path: '/:provinceId/hr/employees/*',
    element: <Employees />,
    allowedRoles: [RoleCategory.PROVINCE_MANAGER],
    requiredPermission: PERMISSIONS.EMPLOYEE_VIEW,
    children: [
      {
        path: '',
        element: <Employees />,
      },
      {
        path: 'create',
        element: <Employees />,
        requiredPermission: PERMISSIONS.EMPLOYEE_CREATE,
      },
      {
        path: 'edit/:employeeId',
        element: <Employees />,
        requiredPermission: PERMISSIONS.EMPLOYEE_EDIT,
      },
    ],
  },

  // Branch Layer
  branch: {
    path: '/:provinceId/:branchCode/hr/employees/*',
    element: <Employees />,
    allowedRoles: [RoleCategory.BRANCH_MANAGER, RoleCategory.BRANCH_STAFF],
    requiredPermission: PERMISSIONS.EMPLOYEE_VIEW,
    children: [
      {
        path: '',
        element: <Employees />,
      },
      {
        path: 'create',
        element: <Employees />,
        requiredPermission: PERMISSIONS.EMPLOYEE_CREATE,
      },
      {
        path: 'edit/:employeeId',
        element: <Employees />,
        requiredPermission: PERMISSIONS.EMPLOYEE_EDIT,
      },
    ],
  },
};

export const employeeMenuItems = {
  // Executive Layer Menu
  executive: {
    key: 'hr-employees-executive',
    label: 'employees.menu.executive',
    icon: <UserOutlined />,
    children: [
      {
        key: 'hr-employees-list-executive',
        label: 'employees.menu.list',
        path: '/hr/employees',
        permission: PERMISSIONS.EMPLOYEE_VIEW,
      },
      {
        key: 'hr-employees-create-executive',
        label: 'employees.menu.create',
        path: '/hr/employees/create',
        permission: PERMISSIONS.EMPLOYEE_CREATE,
      },
    ],
  },

  // Province Layer Menu
  province: {
    key: 'hr-employees-province',
    label: 'employees.menu.province',
    icon: <UserOutlined />,
    children: [
      {
        key: 'hr-employees-list-province',
        label: 'employees.menu.list',
        path: '/:provinceId/hr/employees',
        permission: PERMISSIONS.EMPLOYEE_VIEW,
      },
      {
        key: 'hr-employees-create-province',
        label: 'employees.menu.create',
        path: '/:provinceId/hr/employees/create',
        permission: PERMISSIONS.EMPLOYEE_CREATE,
      },
    ],
  },

  // Branch Layer Menu
  branch: {
    key: 'hr-employees-branch',
    label: 'employees.menu.branch',
    icon: <UserOutlined />,
    children: [
      {
        key: 'hr-employees-list-branch',
        label: 'employees.menu.list',
        path: '/:provinceId/:branchCode/hr/employees',
        permission: PERMISSIONS.EMPLOYEE_VIEW,
      },
      {
        key: 'hr-employees-create-branch',
        label: 'employees.menu.create',
        path: '/:provinceId/:branchCode/hr/employees/create',
        permission: PERMISSIONS.EMPLOYEE_CREATE,
      },
    ],
  },
};
