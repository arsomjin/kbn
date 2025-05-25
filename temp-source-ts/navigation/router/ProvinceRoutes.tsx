import React from 'react';
import { Route } from 'react-router-dom';
import { PERMISSIONS } from '../../constants/Permissions';
import PermissionProtectedRoute from '../../components/auth/PermissionProtectedRoute';
import Account from '../../modules/account';
import NotFound from '../../components/common/NotFound';
import { useAuth } from 'contexts/AuthContext';
import { UserRole } from '../../constants/roles';

/**
 * Province-specific routes configuration
 * These routes are only accessible within a province context
 */
export const ProvinceRoutes = [
  <Route
    key='province-account'
    path='account/*'
    element={
      <PermissionProtectedRoute
        requiredPermission={PERMISSIONS.VIEW_ACCOUNTS}
        fallbackPath='/dashboard'
        provinceCheck={() => true}
        allowedRoles={[
          UserRole.SUPER_ADMIN,
          UserRole.DEVELOPER,
          UserRole.EXECUTIVE,
          UserRole.PROVINCE_MANAGER,
          UserRole.PROVINCE_ADMIN,
          UserRole.GENERAL_MANAGER
        ]}
      >
        <Account />
      </PermissionProtectedRoute>
    }
  />
];

// Fallback element for unauthorized access to province routes
export const ProvinceRouteFallback = <NotFound />;
