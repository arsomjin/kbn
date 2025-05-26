import React, { Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import PermissionProtectedRoute from '../components/auth/PermissionProtectedRoute';
import { RoleCategory, ROLES } from '../constants/roles';
import { PERMISSIONS } from '../constants/Permissions';
import { getAllowedRolesByCategory, getUserHomePath } from 'utils/roleUtils';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from 'components/common/LoadingSpinner';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import ProvinceLayout from '../components/layout/ProvinceLayout';
import BranchLayout from '../components/layout/BranchLayout';

// Guards
import PendingGuard from './router/PendingGuard';
import ProfileGuard from './router/ProfileGuard';
import ProvinceGuard from './router/ProvinceGuard';
import BranchGuard from './router/BranchGuard';
import { PublicOnlyRoute } from './router/PublicOnlyRoute';

import PersonalProfile from '../pages/PersonalProfile';

// Home pages
import Overview from '../modules/dashboard/Overview';
import Dashboard from '../modules/dashboard/Dashboard';
import LandingPage from '../modules/dashboard/Landing';
import SystemOverview from '../pages/SystemOverview';
import SpecialSettings from '../modules/settings/SpecialSettings';

// Lazy load pages
const Login = React.lazy(() => import('../modules/auth/LoginPage'));
const Register = React.lazy(() => import('../modules/auth/RegisterPage'));
const ForgotPassword = React.lazy(() => import('../modules/auth/ForgotPasswordPage'));
const CompleteProfile = React.lazy(() => import('../modules/auth/CompleteProfilePage'));
const Pending = React.lazy(() => import('../modules/auth/PendingPage'));
const Landing = React.lazy(() => import('../modules/dashboard/Landing'));
const ProvinceDashboard = React.lazy(() => import('../modules/dashboard/ProvinceDashboard'));
const BranchDashboard = React.lazy(() => import('../modules/dashboard/BranchDashboard'));
const AdminDashboard = React.lazy(() => import('../modules/dashboard/admin/Dashboard'));
const EmployeeDashboard = React.lazy(() => import('../modules/dashboard/employee/Dashboard'));
const VisitorDashboard = React.lazy(() => import('../modules/dashboard/visitor/Dashboard'));
const NotFound = React.lazy(() => import('../pages/NotFound'));

/**
 * Main application router for KBN.
 * Handles all route protection, redirection, and layout logic.
 * @returns {JSX.Element}
 */

const AuthLayout = ({ children }) => <div className="auth-layout">{children}</div>;

const AppRouter = () => {
  const { userProfile, isLoading, isProfileComplete } = useAuth();
  const { t } = useTranslation();

  // Sync data with Redux

  if (isLoading) return <LoadingSpinner />;

  // Root redirect logic
  const getRootRedirect = () => {
    return <Navigate to={getUserHomePath(userProfile, isProfileComplete)} replace />;
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Auth and public routes */}
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />
        <Route path="/reset-password" element={<Navigate to="/auth/reset-password" replace />} />
        <Route
          path="/auth"
          element={
            <PublicOnlyRoute>
              <AuthLayout>
                <Outlet />
              </AuthLayout>
            </PublicOnlyRoute>
          }
        >
          <Route index element={<Navigate to="/auth/login" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Register />} />
          <Route path="reset-password" element={<ForgotPassword />} />
          <Route path="verification" element={<div>{t('auth.verificationPage')}</div>} />
        </Route>

        <Route
          path="/pending"
          element={
            <PendingGuard>
              <Pending />
            </PendingGuard>
          }
        />

        <Route
          path="/complete-profile"
          element={
            <ProfileGuard>
              <CompleteProfile />
            </ProfileGuard>
          }
        />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* 1. Root path: / */}
          <Route index element={getRootRedirect()} />
          <Route path="/personal-profile" element={<PersonalProfile />} />
          <Route
            path="/overview"
            element={
              <PermissionProtectedRoute
                fallbackPath="/dashboard"
                allowedRoles={getAllowedRolesByCategory(RoleCategory.EXECUTIVE)}
              >
                <Overview />
              </PermissionProtectedRoute>
            }
          />
          <Route
            path="/special-settings/*"
            element={
              <PermissionProtectedRoute
                fallbackPath="/dashboard"
                allowedRoles={getAllowedRolesByCategory(RoleCategory.EXECUTIVE)}
              >
                <SpecialSettings />
              </PermissionProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PermissionProtectedRoute
                fallbackPath="/dashboard"
                allowedRoles={getAllowedRolesByCategory(RoleCategory.GENERAL_MANAGER)}
              >
                <Dashboard />
              </PermissionProtectedRoute>
            }
          />

          {/* 2. Province path: /:provinceId */}
          <Route
            path="/:provinceId"
            element={
              <ProvinceGuard>
                <ProvinceLayout />
              </ProvinceGuard>
            }
          >
            <Route
              index
              path="dashboard"
              element={
                <PermissionProtectedRoute
                  fallbackPath="/dashboard"
                  allowedRoles={getAllowedRolesByCategory(RoleCategory.PROVINCE_MANAGER)}
                >
                  <ProvinceDashboard />
                </PermissionProtectedRoute>
              }
            />

            {/* 3. Branch path: /:provinceId/:branchCode */}
            <Route
              path=":branchCode"
              element={
                <BranchGuard>
                  <BranchLayout />
                </BranchGuard>
              }
            >
              <Route
                index
                path="dashboard"
                element={
                  <PermissionProtectedRoute
                    fallbackPath="/dashboard"
                    allowedRoles={getAllowedRolesByCategory(RoleCategory.LEAD)}
                  >
                    <BranchDashboard />
                  </PermissionProtectedRoute>
                }
              />
              <Route path="landing" element={<Landing />} />
            </Route>
          </Route>

          <Route path="/landing" element={<Landing />} />
          <Route path="/about/system-overview" element={<SystemOverview />} />
        </Route>

        <Route path="/visitor/dashboard" element={<VisitorDashboard />} />

        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
