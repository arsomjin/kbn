import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { getUserHomePath } from '../../utils/roleUtils';
import MainLayout from '../../components/layout/MainLayout';
import ProvinceLayout from '../../components/layout/ProvinceLayout';
import BranchLayout from '../../components/layout/BranchLayout';
import ProvinceGuard from '../router/ProvinceGuard';
import BranchGuard from '../router/BranchGuard';
import PersonalProfile from '../../pages/PersonalProfile';
import SystemOverview from '../../pages/SystemOverview';
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
