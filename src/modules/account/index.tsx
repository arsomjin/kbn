import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout, Card, Alert } from 'antd';
import { useAuth } from 'contexts/AuthContext';
import { hasProvinceAccess } from '../../utils/permissions';
import { ROLES, RoleType, UserRole } from '../../constants/roles';
import { PERMISSIONS } from '../../constants/Permissions';
import Overview from './Overview';
import Income from './Income/index';
import Expense from './Expense/index';
import InputPrice from './InputPrice/index';
import { isMobile } from 'react-device-detect';
import PermissionProtectedRoute from '../../components/auth/PermissionProtectedRoute';

const { Content } = Layout;

const isRoleType = (role: any): role is UserRole => {
  return Object.values(UserRole).includes(role);
};

/**
 * Main Account router component
 */
const Account: React.FC = () => {
  const { t } = useTranslation();
  const { provinceId } = useParams<{ provinceId: string }>();
  const { userProfile } = useAuth();

  // Check if user has access to the province
  const checkProvinceAccess = () => {
    if (!provinceId) return true; // If no province context, allow access
    return hasProvinceAccess(userProfile, provinceId);
  };

  // Check if user has any accounting-related permissions
  const hasAnyAccountingPermission = () => {
    const allowedRoles: UserRole[] = [
      UserRole.SUPER_ADMIN,
      UserRole.DEVELOPER,
      UserRole.EXECUTIVE,
      UserRole.PROVINCE_MANAGER,
      UserRole.PROVINCE_ADMIN,
      UserRole.GENERAL_MANAGER,
    ];
    const roleAllowed =
      userProfile?.role && isRoleType(userProfile.role) && allowedRoles.includes(userProfile.role);
    const perms = userProfile?.permissions as Record<string, boolean> | undefined;
    return (
      (perms?.[PERMISSIONS.VIEW_ACCOUNTS] ?? false) ||
      (perms?.[PERMISSIONS.VIEW_INCOME] ?? false) ||
      (perms?.[PERMISSIONS.VIEW_EXPENSE] ?? false) ||
      !!roleAllowed
    );
  };

  // Render unauthorized message if user has no permissions
  if (!hasAnyAccountingPermission()) {
    return (
      <Layout className="h-full">
        <Content className="p-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <Alert
              message={t('account:unauthorized.title', 'Access Restricted')}
              description={t(
                'account:unauthorized.message',
                'You do not have permission to view accounting information. Please contact your administrator for access.',
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

  // Render province access warning if user doesn't have access to the current province
  if (!checkProvinceAccess()) {
    return (
      <Layout className="h-full">
        <Content className="p-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <Alert
              message={t('account:provinceAccess.title', 'Province Access Restricted')}
              description={t(
                'account:provinceAccess.message',
                'You do not have access to view accounting information for this province.',
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
    <div className={`${isMobile ? 'p-0' : 'p-2'} h-full`}>
      <Routes>
        <Route
          path="/"
          element={
            <PermissionProtectedRoute
              requiredPermission={PERMISSIONS.VIEW_ACCOUNTS}
              allowedRoles={[
                UserRole.SUPER_ADMIN,
                UserRole.DEVELOPER,
                UserRole.EXECUTIVE,
                UserRole.PROVINCE_MANAGER,
                UserRole.PROVINCE_ADMIN,
                UserRole.GENERAL_MANAGER,
              ]}
              provinceCheck={provinceId ? () => checkProvinceAccess() : undefined}
            >
              <Overview />
            </PermissionProtectedRoute>
          }
        />
        <Route
          path="/income/*"
          element={
            <PermissionProtectedRoute
              requiredPermission={PERMISSIONS.VIEW_INCOME}
              allowedRoles={[
                UserRole.SUPER_ADMIN,
                UserRole.DEVELOPER,
                UserRole.EXECUTIVE,
                UserRole.PROVINCE_MANAGER,
                UserRole.PROVINCE_ADMIN,
                UserRole.GENERAL_MANAGER,
              ]}
              provinceCheck={provinceId ? () => checkProvinceAccess() : undefined}
            >
              <Income />
            </PermissionProtectedRoute>
          }
        />
        <Route
          path="/expense/*"
          element={
            <PermissionProtectedRoute
              requiredPermission={PERMISSIONS.VIEW_EXPENSE}
              allowedRoles={[
                UserRole.SUPER_ADMIN,
                UserRole.DEVELOPER,
                UserRole.EXECUTIVE,
                UserRole.PROVINCE_MANAGER,
                UserRole.PROVINCE_ADMIN,
                UserRole.GENERAL_MANAGER,
              ]}
              provinceCheck={provinceId ? () => checkProvinceAccess() : undefined}
            >
              <Expense />
            </PermissionProtectedRoute>
          }
        />
        <Route
          path="/input-price/*"
          element={
            <PermissionProtectedRoute
              requiredPermission={PERMISSIONS.VIEW_ACCOUNTS}
              allowedRoles={[
                UserRole.SUPER_ADMIN,
                UserRole.DEVELOPER,
                UserRole.EXECUTIVE,
                UserRole.PROVINCE_MANAGER,
                UserRole.PROVINCE_ADMIN,
                UserRole.GENERAL_MANAGER,
              ]}
              provinceCheck={provinceId ? () => checkProvinceAccess() : undefined}
            >
              <InputPrice
                provinceId={provinceId || ''}
                departmentId={userProfile?.department || ''}
              />
            </PermissionProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default Account;
