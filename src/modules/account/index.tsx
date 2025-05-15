import React from "react";
import { Routes, Route, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout, Card, Alert, Typography } from "antd";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import { hasProvinceAccess } from "../../utils/permissions";
import { ROLES } from "../../constants/roles";
import { PERMISSIONS } from '../../constants/Permissions';

// Import screens
import Overview from "./screens/Overview";
import Income from "./screens/Income";
import Expense from "./screens/Expense";

const { Content } = Layout;
const { Title } = Typography;

/**
 * Main Account router component
 */
const Account: React.FC = () => {
  const { t } = useTranslation();
  const { provinceId } = useParams<{ provinceId: string }>();
  const { userProfile } = useAuth();
  const { hasPermission, hasRole } = usePermissions();

  // Check if user has access to the province
  const checkProvinceAccess = () => {
    if (!provinceId) return true; // If no province context, allow access
    return hasProvinceAccess(provinceId);
  };

  // Check if user has any accounting-related permissions
  const hasAnyAccountingPermission = () => {
    return (
      hasPermission(PERMISSIONS.VIEW_ACCOUNTS) ||
      hasPermission(PERMISSIONS.VIEW_INCOME) ||
      hasPermission(PERMISSIONS.VIEW_EXPENSE) ||
      hasRole([ROLES.SUPER_ADMIN, ROLES.DEVELOPER, ROLES.PRIVILEGE])
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
                'You do not have permission to view accounting information. Please contact your administrator for access.'
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
                'You do not have access to view accounting information for this province.'
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
    <Layout className="h-full">
      <Content className="p-6">
        <Title level={2} >{t('account:title', 'Accounting')}</Title>
        <Routes>
          <Route
            path="/"
            element={
              hasPermission(PERMISSIONS.VIEW_ACCOUNTS) || 
              hasRole([ROLES.SUPER_ADMIN, ROLES.DEVELOPER, ROLES.PRIVILEGE]) ? (
                <Overview />
              ) : (
                <Alert
                  message={t('account:overviewRestricted.title', 'Overview Access Restricted')}
                  description={t(
                    'account:overviewRestricted.message',
                    'You do not have permission to view the accounting overview.'
                  )}
                  type="warning"
                  showIcon
                  className="dark:bg-gray-700"
                />
              )
            }
          />
          <Route
            path="/income/*"
            element={
              hasPermission(PERMISSIONS.VIEW_INCOME) || 
              hasRole([ROLES.SUPER_ADMIN, ROLES.DEVELOPER, ROLES.PRIVILEGE]) ? (
                <Income />
              ) : (
                <Alert
                  message={t('account:incomeRestricted.title', 'Income Access Restricted')}
                  description={t(
                    'account:incomeRestricted.message',
                    'You do not have permission to view income information.'
                  )}
                  type="warning"
                  showIcon
                  className="dark:bg-gray-700"
                />
              )
            }
          />
          <Route
            path="/expense/*"
            element={
              hasPermission(PERMISSIONS.VIEW_EXPENSE) || 
              hasRole([ROLES.SUPER_ADMIN, ROLES.DEVELOPER, ROLES.PRIVILEGE]) ? (
                <Expense />
              ) : (
                <Alert
                  message={t('account:expenseRestricted.title', 'Expense Access Restricted')}
                  description={t(
                    'account:expenseRestricted.message',
                    'You do not have permission to view expense information.'
                  )}
                  type="warning"
                  showIcon
                  className="dark:bg-gray-700"
                />
              )
            }
          />
        </Routes>
      </Content>
    </Layout>
  );
};

export default Account; 