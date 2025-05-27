import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout, Card, Alert } from 'antd';
import { useAuth } from 'contexts/AuthContext';
import { usePermissions } from 'hooks/usePermissions';
import { ROLES, UserRole, RoleCategory } from 'constants/roles';
import { PERMISSIONS } from 'constants/Permissions';
import { getAllowedRolesByCategory } from 'utils/roleUtils';
import UserReview from './UserReview';
import UserRoleManager from './UserRoleManager';
import PermissionProtectedRoute from 'components/auth/PermissionProtectedRoute';

const { Content } = Layout;

const isRoleType = (role) => {
  return Object.values(UserRole).includes(role);
};

/**
 * Main User Management router component
 * Limited to branch_manager role category and higher
 */
const UserManagement = () => {
  const { t } = useTranslation();
  const { provinceId } = useParams();
  const { userProfile } = useAuth();
  const { hasProvinceAccess } = usePermissions();

  // Check if user has access to the province
  const checkProvinceAccess = () => {
    if (!provinceId) return true; // If no province context, allow access
    return hasProvinceAccess(provinceId);
  };

  // Check if user has any user management permissions and is branch manager or higher
  const hasAnyUserManagementPermission = () => {
    const allowedRoles = getAllowedRolesByCategory(RoleCategory.BRANCH_MANAGER);
    const roleAllowed =
      userProfile?.role && isRoleType(userProfile.role) && allowedRoles.includes(userProfile.role);
    const perms = userProfile?.permissions;
    return (
      (perms?.[PERMISSIONS.USER_ROLE_EDIT] ?? false) ||
      (perms?.[PERMISSIONS.USER_VIEW] ?? false) ||
      (perms?.[PERMISSIONS.MANAGE_USERS] ?? false) ||
      !!roleAllowed
    );
  };

  // Render unauthorized message if user has no permissions or role is below branch manager
  if (!hasAnyUserManagementPermission()) {
    return (
      <Layout className="h-full">
        <Content className="p-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <Alert
              message={t('userManagement:unauthorized.title', 'Access Restricted')}
              description={t(
                'userManagement:unauthorized.message',
                'You do not have permission to access user management. Only branch managers and higher roles can access this section. Please contact your administrator for access.',
              )}
              type="warning"
              showIcon
              className="dark:bg-gray-700"
            />
          </Card>
        </Content>
      </Layout>
    );
  }

  return (
    <div className="user-management-container">
      <Routes>
        <Route
          path="/"
          element={
            <PermissionProtectedRoute
              requiredPermission={PERMISSIONS.USER_ROLE_EDIT}
              allowedRoles={getAllowedRolesByCategory(RoleCategory.BRANCH_MANAGER)}
              provinceCheck={provinceId ? () => checkProvinceAccess() : undefined}
            >
              <UserReview />
            </PermissionProtectedRoute>
          }
        />
        <Route
          path="review-users"
          element={
            <PermissionProtectedRoute
              requiredPermission={PERMISSIONS.USER_ROLE_EDIT}
              allowedRoles={getAllowedRolesByCategory(RoleCategory.BRANCH_MANAGER)}
              provinceCheck={provinceId ? () => checkProvinceAccess() : undefined}
            >
              <UserReview />
            </PermissionProtectedRoute>
          }
        />
        <Route
          path="user-role-manager"
          element={
            <PermissionProtectedRoute
              requiredPermission={PERMISSIONS.MANAGE_USERS}
              allowedRoles={getAllowedRolesByCategory(RoleCategory.BRANCH_MANAGER)}
              provinceCheck={provinceId ? () => checkProvinceAccess() : undefined}
            >
              <UserRoleManager />
            </PermissionProtectedRoute>
          }
        />
        {/* Legacy routes for backward compatibility */}
        <Route
          path="/user-review"
          element={
            <PermissionProtectedRoute
              requiredPermission={PERMISSIONS.USER_ROLE_EDIT}
              allowedRoles={getAllowedRolesByCategory(RoleCategory.BRANCH_MANAGER)}
              provinceCheck={provinceId ? () => checkProvinceAccess() : undefined}
            >
              <UserReview />
            </PermissionProtectedRoute>
          }
        />
        <Route
          path="/review-users"
          element={
            <PermissionProtectedRoute
              requiredPermission={PERMISSIONS.USER_ROLE_EDIT}
              allowedRoles={getAllowedRolesByCategory(RoleCategory.BRANCH_MANAGER)}
              provinceCheck={provinceId ? () => checkProvinceAccess() : undefined}
            >
              <UserReview />
            </PermissionProtectedRoute>
          }
        />
        <Route
          path="/user-role-manager"
          element={
            <PermissionProtectedRoute
              requiredPermission={PERMISSIONS.MANAGE_USERS}
              allowedRoles={getAllowedRolesByCategory(RoleCategory.BRANCH_MANAGER)}
              provinceCheck={provinceId ? () => checkProvinceAccess() : undefined}
            >
              <UserRoleManager />
            </PermissionProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default UserManagement;
