import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { getLandingPage } from 'utils/roleUtils';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

// Auth and layout components
import MainLayout from 'components/layout/MainLayout';
import NotFound from 'components/common/NotFound';
import { ProtectedRoute } from 'components/auth/ProtectedRoute';
import { PublicOnlyRoute } from './router/PublicOnlyRoute';
import PermissionProtectedRoute from 'components/auth/PermissionProtectedRoute';
import { ROLES } from 'constants/roles';
import RoleCheck from 'modules/auth/RoleCheck';

// Route configurations
import { AdminRoutes } from './router/AdminRoutes';
import { PrivateRoutes } from './router/PrivateRoutes';
import ProfileGuard from './router/ProfileGuard';
import PendingGuard from './router/PendingGuard';
import ProvinceGuard from './router/ProvinceGuard';

// Constants
import { PERMISSIONS } from 'constants/Permissions';

// Lazy-loaded components
const LoginPage = lazy(() => import('modules/auth/LoginPage'));
const RegisterPage = lazy(() => import('modules/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('modules/auth/ForgotPasswordPage'));
const CreateProfilePage = lazy(() => import('modules/auth/CreateProfilePage'));
const CompleteProfilePage = lazy(() => import('modules/auth/CompleteProfilePage'));
const PendingPage = lazy(() => import('modules/auth/PendingPage'));
const Overview = lazy(() => import('modules/dashboard/Overview'));
const Profile = lazy(() => import('modules/auth/CompleteProfilePage'));
const ProvinceLayout = lazy(() => import('modules/dashboard/ProvinceLayout'));
const Dashboard = lazy(() => import('modules/dashboard/Dashboard'));
const BranchDashboard = lazy(() => import('modules/dashboard/BranchDashboard'));
const ProvinceDashboard = lazy(() => import('modules/dashboard/ProvinceDashboard'));
const ProvinceSettings = lazy(() => import('modules/settings/ProvinceSettings'));
const ProvinceReports = lazy(() => import('modules/dashboard/ProvinceReports'));
const Account = lazy(() => import('modules/account'));
const Income = lazy(() => import('modules/account/Income'));
const Expense = lazy(() => import('modules/account/Expense'));

/**
 * Main application router for KBN.
 * Handles all route protection, redirection, and layout logic.
 * @returns {JSX.Element}
 */
const LoadingSpinner: React.FC = () => (
  <div className='flex items-center justify-center h-screen'>
    <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
  </div>
);

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className='auth-layout'>{children}</div>
);

export const AppRouter: React.FC = () => {
  const { user, userProfile, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Role Check route - implements post-authentication check */}
        <Route path='/role-check' element={<RoleCheck />} />

        {/* Auth routes - public, block if already authenticated */}
        <Route
          path='/auth'
          element={
            <PublicOnlyRoute>
              <AuthLayout>
                <Outlet />
              </AuthLayout>
            </PublicOnlyRoute>
          }
        >
          <Route path='login' element={<LoginPage />} />
          <Route path='signup' element={<RegisterPage />} />
          <Route path='reset-password' element={<ForgotPasswordPage />} />
          <Route path='verification' element={<div>{t('auth.verificationPage')}</div>} />
        </Route>

        {/* Pending page for users awaiting approval */}
        <Route
          path='/pending'
          element={
            <PendingGuard>
              <PendingPage />
            </PendingGuard>
          }
        />

        {/* Complete profile page */}
        <Route
          path='/complete-profile'
          element={
            <ProfileGuard>
              <CompleteProfilePage />
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
          {/* Landing page based on role */}
          <Route
            index
            element={
              userProfile ? (
                userProfile.role === ROLES.PENDING ? (
                  <Navigate to='/pending' replace />
                ) : !userProfile.isProfileComplete ? (
                  <Navigate to='/complete-profile' replace />
                ) : (
                  <Navigate to={getLandingPage(userProfile)} replace />
                )
              ) : (
                <LoadingSpinner />
              )
            }
          />

          {/* Common routes */}
          <Route path='/profile' element={<Profile />} />

          {/* Overview route for privileged users */}
          <Route
            path='/overview'
            element={
              <PermissionProtectedRoute requiredPermission={PERMISSIONS.SYSTEM_SETTINGS_VIEW} fallbackPath='/dashboard'>
                <Overview />
              </PermissionProtectedRoute>
            }
          />

          {/* Account routes */}
          <Route
            path='/account/*'
            element={
              <PermissionProtectedRoute requiredPermission={PERMISSIONS.VIEW_ACCOUNTS} fallbackPath='/dashboard'>
                <Account />
              </PermissionProtectedRoute>
            }
          >
            <Route
              index
              element={
                <PermissionProtectedRoute requiredPermission={PERMISSIONS.VIEW_ACCOUNTS} fallbackPath='/dashboard'>
                  <Overview />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path='income/*'
              element={
                <PermissionProtectedRoute requiredPermission={PERMISSIONS.VIEW_INCOME} fallbackPath='/account'>
                  <Income />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path='expense/*'
              element={
                <PermissionProtectedRoute requiredPermission={PERMISSIONS.VIEW_EXPENSE} fallbackPath='/account'>
                  <Expense />
                </PermissionProtectedRoute>
              }
            />
          </Route>

          {/* Province routes (multi-province: always require provinceId param) */}
          <Route
            path='/province/:provinceId'
            element={
              <ProvinceGuard>
                <ProvinceLayout />
              </ProvinceGuard>
            }
          >
            <Route
              index
              element={
                <PermissionProtectedRoute
                  requiredPermission={PERMISSIONS.PROVINCE_ANALYTICS_VIEW}
                  fallbackPath='/dashboard'
                  provinceCheck={() => {
                    // provinceCheck must be a zero-arg function
                    // The PermissionProtectedRoute will use useParams internally
                    return true;
                  }}
                >
                  <ProvinceDashboard />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path='settings'
              element={
                <PermissionProtectedRoute
                  requiredPermission={PERMISSIONS.SYSTEM_SETTINGS_VIEW}
                  fallbackPath='/dashboard'
                  provinceCheck={() => true}
                >
                  <ProvinceSettings />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path='reports'
              element={
                <PermissionProtectedRoute
                  requiredPermission={PERMISSIONS.PROVINCE_REPORTS_VIEW}
                  fallbackPath='/dashboard'
                  provinceCheck={() => true}
                >
                  <ProvinceReports />
                </PermissionProtectedRoute>
              }
            />
          </Route>

          {/* Admin routes */}
          <Route path='/admin'>{AdminRoutes}</Route>

          {/* Private routes */}
          <Route path='/'>{PrivateRoutes}</Route>
        </Route>

        {/* Not found route (avoid infinite redirect loop) */}
        <Route path='/not-found' element={<NotFound />} />
        <Route path='*' element={<Navigate to='/not-found' replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
