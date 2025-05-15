import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getLandingPage } from '../utils/roleUtils';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

// Auth and layout components
import MainLayout from '../components/layout/MainLayout';
import NotFound from '../components/common/NotFound';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import PublicOnlyRoute from './router/PublicOnlyRoute';
import PermissionProtectedRoute from '../components/auth/PermissionProtectedRoute';
import { RoleCategory, isInRoleCategory, ROLES } from '../constants/roles';
import { UserProfile } from '../services/authService';
import RoleCheck from '../modules/auth/RoleCheck';

// Route configurations
import { AdminRoutes } from './router/AdminRoutes';
import { PrivateRoutes } from './router/PrivateRoutes';
import ProfileGuard from './router/ProfileGuard';
import PendingGuard from './router/PendingGuard';
import ProvinceGuard from './router/ProvinceGuard';

// Constants
import { PERMISSIONS } from '../constants/Permissions';

// Lazy-loaded components
const LoginPage = lazy(() => import('../modules/auth/LoginPage'));
const RegisterPage = lazy(() => import('../modules/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../modules/auth/ForgotPasswordPage'));
const CreateProfilePage = lazy(() => import('../modules/auth/CreateProfilePage'));
const CompleteProfilePage = lazy(() => import('../modules/auth/CompleteProfilePage'));
const PendingPage = lazy(() => import('../modules/auth/PendingPage'));
const Overview = lazy(() => import('../modules/dashboard/Overview'));
const Profile = lazy(() => import('../modules/auth/CompleteProfilePage'));
const ProvinceLayout = lazy(() => import('../modules/dashboard/ProvinceLayout'));
const Dashboard = lazy(() => import('../modules/dashboard/Dashboard'));
const BranchDashboard = lazy(() => import('../modules/dashboard/BranchDashboard'));
const ProvinceDashboard = lazy(() => import('../modules/dashboard/ProvinceDashboard'));
const ProvinceSettings = lazy(() => import('../modules/settings/ProvinceSettings'));
const ProvinceReports = lazy(() => import('../modules/dashboard/ProvinceReports'));
const Account = lazy(() => import('../modules/account'));
const Income = lazy(() => import('../modules/account/screens/Income'));
const Expense = lazy(() => import('../modules/account/screens/Expense'));

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
  </div>
);

// Component for auth layout
const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className='auth-layout'>{children}</div>
);

// Main AppRouter component
const AppRouter: React.FC = () => {
  const { userProfile, isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();

  // Add debug logging
  console.log('[AppRouter] State:', {
    isAuthenticated,
    isLoading,
    userProfile: userProfile ? {
      role: userProfile.role,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName
    } : null
  });

  // Lazy load components
  const ProvinceLayout = React.lazy(() => import('../modules/dashboard/ProvinceLayout'));
  const ProvinceDashboard = React.lazy(() => import('../modules/dashboard/ProvinceDashboard'));
  const ProvinceSettings = React.lazy(() => import('../modules/settings/ProvinceSettings'));
  const ProvinceReports = React.lazy(() => import('../modules/dashboard/ProvinceReports'));

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Role Check route - implements post-authentication check */}
        <Route path='/role-check' element={<RoleCheck />} />

        {/* Redirect legacy auth routes to new /auth/* equivalents */}
        <Route path='/login' element={<Navigate to='/auth/login' replace />} />
        <Route path='/register' element={<Navigate to='/auth/signup' replace />} />
        <Route path='/forgot-password' element={<Navigate to='/auth/reset-password' replace />} />

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
          <Route path='verification' element={<div>Verification Page</div>} />
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
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          {/* Landing page based on role */}
          <Route
            index
            element={
              userProfile ? (
                userProfile.role === ROLES.PENDING ? (
                  (() => {
                    console.log('[AppRouter] Redirecting to /pending - User has PENDING role');
                    return <Navigate to="/pending" replace />;
                  })()
                ) : !userProfile.firstName || !userProfile.lastName ? (
                  (() => {
                    console.log('[AppRouter] Redirecting to /complete-profile - Profile incomplete:', {
                      firstName: userProfile.firstName,
                      lastName: userProfile.lastName
                    });
                    return <Navigate to="/complete-profile" replace />;
                  })()
                ) : (
                  (() => {
                    const landingPage = getLandingPage(userProfile);
                    console.log('[AppRouter] Redirecting to landing page:', {
                      landingPage,
                      role: userProfile.role
                    });
                    return <Navigate to={landingPage} replace />;
                  })()
                )
              ) : (
                (() => {
                  console.log('[AppRouter] Showing loading spinner - No userProfile yet');
                  return <LoadingSpinner />;
                })()
              )
            }
          />

          {/* Common routes */}
          <Route path="/profile" element={<Profile />} />

          {/* Overview route for privileged users */}
          <Route
            path="/overview"
            element={
              <PermissionProtectedRoute
                requiredPermission={PERMISSIONS.SYSTEM_SETTINGS_VIEW}
                fallbackPath="/dashboard"
              >
                <Overview />
              </PermissionProtectedRoute>
            }
          />

          {/* Account routes */}
          <Route
            path="/account/*"
            element={
              <PermissionProtectedRoute
                requiredPermission={PERMISSIONS.VIEW_ACCOUNTS}
                fallbackPath="/dashboard"
              >
                <Account />
              </PermissionProtectedRoute>
            }
          >
            <Route
              index
              element={
                <PermissionProtectedRoute
                  requiredPermission={PERMISSIONS.VIEW_ACCOUNTS}
                  fallbackPath="/dashboard"
                >
                  <Overview />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path="income/*"
              element={
                <PermissionProtectedRoute
                  requiredPermission={PERMISSIONS.VIEW_INCOME}
                  fallbackPath="/account"
                >
                  <Income />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path="expense/*"
              element={
                <PermissionProtectedRoute
                  requiredPermission={PERMISSIONS.VIEW_EXPENSE}
                  fallbackPath="/account"
                >
                  <Expense />
                </PermissionProtectedRoute>
              }
            />
          </Route>

          {/* Province routes */}
          <Route path="/province" element={<ProvinceLayout />}>
            <Route
              index
              element={
                <PermissionProtectedRoute
                  requiredPermission={PERMISSIONS.PROVINCE_ANALYTICS_VIEW}
                  fallbackPath="/dashboard"
                >
                  <ProvinceDashboard />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <PermissionProtectedRoute
                  requiredPermission={PERMISSIONS.SYSTEM_SETTINGS_VIEW}
                  fallbackPath="/dashboard"
                >
                  <ProvinceSettings />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path="reports"
              element={
                <PermissionProtectedRoute
                  requiredPermission={PERMISSIONS.PROVINCE_REPORTS_VIEW}
                  fallbackPath="/dashboard"
                >
                  <ProvinceReports />
                </PermissionProtectedRoute>
              }
            />
          </Route>

          {/* Admin routes */}
          <Route path="/admin">
            {AdminRoutes}
          </Route>

          {/* Private routes */}
          <Route path="/">
            {PrivateRoutes}
          </Route>
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
