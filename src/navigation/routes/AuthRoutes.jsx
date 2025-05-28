import React from 'react';
import { Route, Navigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PublicOnlyRoute } from '../router/PublicOnlyRoute';
import PendingGuard from '../router/PendingGuard';
import ProfileGuard from '../router/ProfileGuard';
import { authRoutes, authRedirects } from './routeConfig';

// Lazy load components
const CompleteProfile = React.lazy(() => import('../../modules/auth/CompleteProfilePage'));
const Pending = React.lazy(() => import('../../modules/auth/PendingPage'));

/**
 * Auth layout wrapper component
 */
const AuthLayout = ({ children }) => <div className="auth-layout">{children}</div>;

/**
 * Authentication routes component
 * Handles all auth-related routes including login, signup, pending, and profile completion
 * @returns {Array<JSX.Element>}
 */
export const AuthRoutes = () => {
  const { t } = useTranslation();

  return [
    // Legacy redirects
    ...authRedirects.map(({ from, to }) => (
      <Route key={from} path={from} element={<Navigate to={to} replace />} />
    )),

    // Main auth routes
    <Route
      key="/auth"
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
      {authRoutes.map(({ path, component: ComponentToRender }) => (
        <Route key={path} path={path} element={<ComponentToRender />} />
      ))}
      <Route path="verification" element={<div>{t('auth.verificationPage')}</div>} />
    </Route>,

    // Pending approval route
    <Route
      key="/pending"
      path="/pending"
      element={
        <PendingGuard>
          <Pending />
        </PendingGuard>
      }
    />,

    // Profile completion route
    <Route
      key="/complete-profile"
      path="/complete-profile"
      element={
        <ProfileGuard>
          <CompleteProfile />
        </ProfileGuard>
      }
    />,
  ];
};
