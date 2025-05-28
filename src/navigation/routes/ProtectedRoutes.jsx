import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import PermissionProtectedRoute from '../../components/auth/PermissionProtectedRoute';
import { getUserHomePath } from '../../utils/roleUtils';
import { ROLES } from '../../constants/roles';
import MainLayout from '../../components/layout/MainLayout';
import ProvinceLayout from '../../components/layout/ProvinceLayout';
import BranchLayout from '../../components/layout/BranchLayout';
import ProvinceGuard from '../router/ProvinceGuard';
import BranchGuard from '../router/BranchGuard';
import PersonalProfile from '../../pages/PersonalProfile';
import SystemOverview from '../../pages/SystemOverview';
import ComposeNotification from '../../components/notifications/ComposeNotification';
import NotificationSettings from '../../components/notifications/NotificationSettings';
import NotificationList from '../../components/notifications/NotificationList';
import {
  executiveRoutes,
  provinceRoutes,
  branchRoutes,
  accountRoutes,
  accountRouteConfigs,
  adminRoutes,
  employeeRoutes,
} from './routeConfig';
import { createRoutesFromConfig, createAccountRoutes, createAdminRoute } from './RouteBuilders';

// Lazy load components
const Landing = React.lazy(() => import('../../modules/dashboard/Landing'));
const VisitorDashboard = React.lazy(() => import('../../modules/dashboard/visitor/Dashboard'));
const NotFound = React.lazy(() => import('../../pages/NotFound'));

/**
 * Protected routes component
 * Handles all authenticated user routes with proper role-based access control
 * @param {Object} props - Component props
 * @param {Object} props.userProfile - Current user profile
 * @param {boolean} props.isProfileComplete - Whether user profile is complete
 * @returns {Array<JSX.Element>}
 */
export const ProtectedRoutes = ({ userProfile, isProfileComplete }) => {
  // Root redirect logic
  const getRootRedirect = () => {
    return <Navigate to={getUserHomePath(userProfile, isProfileComplete)} replace />;
  };

  return [
    // Main protected routes
    <Route
      key="protected-main"
      element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }
    >
      {/* Root path redirect */}
      <Route index element={getRootRedirect()} />

      {/* Personal profile */}
      <Route path="/personal-profile" element={<PersonalProfile />} />

      {/* Executive level routes */}
      {createRoutesFromConfig(executiveRoutes)}

      {/* Province level routes */}
      <Route
        path="/:provinceId"
        element={
          <ProvinceGuard>
            <ProvinceLayout />
          </ProvinceGuard>
        }
      >
        {createRoutesFromConfig(provinceRoutes)}

        {/* Branch level routes */}
        <Route
          path=":branchCode"
          element={
            <BranchGuard>
              <BranchLayout />
            </BranchGuard>
          }
        >
          {createRoutesFromConfig(branchRoutes)}
        </Route>
      </Route>

      {/* Standalone routes */}
      <Route path="/landing" element={<Landing />} />
      <Route path="/about/system-overview" element={<SystemOverview />} />

      {/* Notification routes - Executive level */}
      <Route
        path="/admin/send-notification"
        element={
          <PermissionProtectedRoute
            allowedRoles={[
              ROLES.PROVINCE_ADMIN,
              ROLES.GENERAL_MANAGER,
              ROLES.SUPER_ADMIN,
              ROLES.DEVELOPER,
            ]}
            fallbackPath="/dashboard"
          >
            <ComposeNotification />
          </PermissionProtectedRoute>
        }
      />
      <Route path="/notifications" element={<NotificationList />} />
      <Route path="/notification-settings" element={<NotificationSettings />} />

      {/* Province level notification routes */}
      <Route
        path="/:provinceId/admin/send-notification"
        element={
          <ProvinceGuard>
            <PermissionProtectedRoute
              allowedRoles={[ROLES.PROVINCE_ADMIN, ROLES.PROVINCE_MANAGER]}
              fallbackPath="/:provinceId/dashboard"
            >
              <ComposeNotification />
            </PermissionProtectedRoute>
          </ProvinceGuard>
        }
      />
      <Route
        path="/:provinceId/notifications"
        element={
          <ProvinceGuard>
            <NotificationList />
          </ProvinceGuard>
        }
      />
      <Route
        path="/:provinceId/notification-settings"
        element={
          <ProvinceGuard>
            <NotificationSettings />
          </ProvinceGuard>
        }
      />

      {/* Branch level notification routes */}
      <Route
        path="/:provinceId/:branchCode/admin/send-notification"
        element={
          <BranchGuard>
            <PermissionProtectedRoute
              allowedRoles={[ROLES.BRANCH_MANAGER]}
              fallbackPath="/:provinceId/:branchCode/dashboard"
            >
              <ComposeNotification />
            </PermissionProtectedRoute>
          </BranchGuard>
        }
      />
      <Route
        path="/:provinceId/:branchCode/notifications"
        element={
          <BranchGuard>
            <NotificationList />
          </BranchGuard>
        }
      />
      <Route
        path="/:provinceId/:branchCode/notification-settings"
        element={
          <BranchGuard>
            <NotificationSettings />
          </BranchGuard>
        }
      />

      {/* Account routes for all levels */}
      {createAccountRoutes(
        accountRoutes,
        accountRouteConfigs.executive.basePath,
        accountRouteConfigs.executive.roles,
      )}
      {createAccountRoutes(
        accountRoutes,
        accountRouteConfigs.province.basePath,
        accountRouteConfigs.province.roles,
      )}
      {createAccountRoutes(
        accountRoutes,
        accountRouteConfigs.branch.basePath,
        accountRouteConfigs.branch.roles,
      )}

      {/* Admin routes for all levels */}
      {createAdminRoute(adminRoutes.executive)}
      {createAdminRoute(adminRoutes.province)}
      {createAdminRoute(adminRoutes.branch)}

      {/* Employee routes for all levels */}
      {createAdminRoute(employeeRoutes.executive)}
      {createAdminRoute(employeeRoutes.province)}
      {createAdminRoute(employeeRoutes.branch)}
    </Route>,

    // Visitor dashboard (outside protected routes)
    <Route key="visitor" path="/visitor/dashboard" element={<VisitorDashboard />} />,

    // Error routes
    <Route key="not-found" path="/not-found" element={<NotFound />} />,
    <Route key="catch-all" path="*" element={<Navigate to="/not-found" replace />} />,
  ];
};
