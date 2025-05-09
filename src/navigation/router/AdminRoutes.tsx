import React from 'react';
import { Route } from 'react-router-dom';
import NotFound from '../../components/common/NotFound';
import UserReview from '../../modules/auth/UserReview';
import UserRoleManager from '../../modules/auth/UserRoleManager';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { UserRole } from '../../constants/roles';
import { ComposeNotification } from '../../components/notifications';
import { PERMISSIONS } from '../../constants/Permissions';

/**
 * Admin routes configuration
 * Only accessible to users with admin roles (system-admin, province-admin, owner, executive)
 */
export const AdminRoutes = [
  <Route
    key='review-users'
    path='review-users'
    element={
      <ProtectedRoute allowedRoles={[UserRole.PROVINCE_ADMIN, UserRole.GENERAL_MANAGER]}>
        <UserReview />
      </ProtectedRoute>
    }
  />,
  <Route
    key='manage-users'
    path='users'
    element={
      <ProtectedRoute allowedRoles={[UserRole.PROVINCE_ADMIN, UserRole.SUPER_ADMIN]}>
        <UserRoleManager />
      </ProtectedRoute>
    }
  />,
  <Route key='send-notification' path='send-notification' element={<ComposeNotification />} />
  // Add more admin routes here
];

// Fallback element for unauthorized access to admin routes
export const AdminRouteFallback = <NotFound />;
