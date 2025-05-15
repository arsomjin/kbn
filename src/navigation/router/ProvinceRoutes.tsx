import React from 'react';
import { Route } from 'react-router-dom';
import { PERMISSIONS } from '../../constants/Permissions';
import PermissionProtectedRoute from '../../components/auth/PermissionProtectedRoute';
import Account from '../../modules/account';
import NotFound from '../../components/common/NotFound';
import { useAuth } from '../../hooks/useAuth';

/**
 * Province-specific routes configuration
 * These routes are only accessible within a province context
 */
export const ProvinceRoutes = [
  <Route
    key="province-account"
    path="account/*"
    element={<Account />}
  />
];

// Fallback element for unauthorized access to province routes
export const ProvinceRouteFallback = <NotFound />; 