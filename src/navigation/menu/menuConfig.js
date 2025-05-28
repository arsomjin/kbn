import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import { PERMISSIONS } from '../../constants/Permissions';
import { RoleCategory } from '../../constants/roles';

// ... existing imports and menu items ...

export const menuConfig = {
  executive: [
    // ... existing executive menu items ...
    {
      key: 'hr',
      label: 'HR Management',
      icon: <TeamOutlined />,
      children: [
        {
          key: 'employees',
          label: 'Employees',
          path: '/hr/employees',
          icon: <UserOutlined />,
          permission: PERMISSIONS.EMPLOYEE_VIEW,
          roles: RoleCategory.EXECUTIVE,
        },
      ],
    },
  ],
  province: [
    // ... existing province menu items ...
    {
      key: 'hr',
      label: 'HR Management',
      icon: <TeamOutlined />,
      children: [
        {
          key: 'employees',
          label: 'Employees',
          path: '/:provinceId/hr/employees',
          icon: <UserOutlined />,
          permission: PERMISSIONS.EMPLOYEE_VIEW,
          roles: RoleCategory.PROVINCE_MANAGER,
        },
      ],
    },
  ],
  branch: [
    // ... existing branch menu items ...
    {
      key: 'hr',
      label: 'HR Management',
      icon: <TeamOutlined />,
      children: [
        {
          key: 'employees',
          label: 'Employees',
          path: '/:provinceId/:branchCode/hr/employees',
          icon: <UserOutlined />,
          permission: PERMISSIONS.EMPLOYEE_VIEW,
          roles: RoleCategory.BRANCH_MANAGER,
        },
      ],
    },
  ],
};
