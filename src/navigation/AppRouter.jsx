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
import { PublicOnlyRoute } from './router/PublicOnlyRoute';
import PendingGuard from './router/PendingGuard';
import LoginPage from '../modules/auth/LoginPage';
import RegisterPage from '../modules/auth/RegisterPage';
import ForgotPasswordPage from '../modules/auth/ForgotPasswordPage';
import CompleteProfilePage from '../modules/auth/CompleteProfilePage';
import ProfileGuard from './router/ProfileGuard';
import MainLayout from '../components/layout/MainLayout';
import PersonalProfile from '../pages/PersonalProfile';
import Overview from '../modules/dashboard/Overview';
import Dashboard from '../modules/dashboard/Dashboard';
import Landing from '../modules/dashboard/Landing';

// Lazy load pages
const Login = React.lazy(() => import('../modules/auth/LoginPage'));
const Register = React.lazy(() => import('../modules/auth/RegisterPage'));
const PendingPage = React.lazy(() => import('../modules/auth/PendingPage'));
const LandingPage = React.lazy(() => import('../pages/LandingPage'));
const AdminDashboard = React.lazy(() => import('../pages/admin/Dashboard'));
const BranchDashboard = React.lazy(() => import('../pages/branch/Dashboard'));
const EmployeeDashboard = React.lazy(() => import('../pages/employee/Dashboard'));
const VisitorDashboard = React.lazy(() => import('../pages/visitor/Dashboard'));
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
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<RegisterPage />} />
          <Route path="reset-password" element={<ForgotPasswordPage />} />
          <Route path="verification" element={<div>{t('auth.verificationPage')}</div>} />
        </Route>

        <Route
          path="/pending"
          element={
            <PendingGuard>
              <PendingPage />
            </PendingGuard>
          }
        />

        <Route
          path="/complete-profile"
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
          <Route path="/landing" element={<Landing />} />
        </Route>

        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
