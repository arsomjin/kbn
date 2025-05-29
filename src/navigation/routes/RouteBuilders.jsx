import React from 'react';
import { Route } from 'react-router-dom';
import PermissionProtectedRoute from '../../components/auth/PermissionProtectedRoute';

/**
 * Creates a permission-protected route
 * @param {Object} config - Route configuration
 * @param {string} config.path - Route path
 * @param {React.Component} config.component - Component to render
 * @param {Array} [config.roles] - Allowed roles
 * @param {string} [config.permission] - Required permission
 * @param {string} [config.fallbackPath] - Fallback path for unauthorized access
 * @param {boolean} [config.isPublic] - Whether route is public
 * @returns {JSX.Element}
 */
export const createProtectedRoute = (config) => {
  const {
    path,
    component: Component,
    roles,
    permission,
    fallbackPath = '/dashboard',
    isPublic = false,
  } = config;

  if (isPublic) {
    return <Route key={path} path={path} element={<Component />} />;
  }

  return (
    <Route
      key={path}
      path={path}
      element={
        <PermissionProtectedRoute
          allowedRoles={roles}
          requiredPermission={permission}
          fallbackPath={fallbackPath}
        >
          <Component />
        </PermissionProtectedRoute>
      }
    />
  );
};

/**
 * Creates account routes for a specific hierarchical level
 * @param {Array} accountRoutes - Array of account route configurations
 * @param {string} basePath - Base path for account routes
 * @param {Array} roles - Allowed roles for these routes
 * @returns {Array<JSX.Element>}
 */
export const createAccountRoutes = (accountRoutes, basePath, roles) => {
  return accountRoutes.map((route) => {
    const fullPath = `${basePath}/${route.path}`;
    return createProtectedRoute({
      path: fullPath,
      component: route.component,
      permission: route.permission,
      roles,
      fallbackPath: '/dashboard',
    });
  });
};

/**
 * Creates admin route for a specific level
 * @param {Object} adminConfig - Admin route configuration
 * @returns {JSX.Element}
 */
export const createAdminRoute = (adminConfig) => {
  return createProtectedRoute({
    path: adminConfig.path,
    component: adminConfig.component,
    permission: adminConfig.permission,
    roles: adminConfig.roles,
    fallbackPath: '/dashboard',
  });
};

/**
 * Creates multiple routes from configuration array
 * @param {Array} routeConfigs - Array of route configurations
 * @returns {Array<JSX.Element>}
 */
export const createRoutesFromConfig = (routeConfigs) => {
  return routeConfigs.map((config) => createProtectedRoute(config));
};

/**
 * Creates notification routes for a specific hierarchical level
 * @param {Array} notificationRoutes - Array of notification route configurations
 * @param {string} basePath - Base path for notification routes
 * @returns {Array<JSX.Element>}
 */
export const createNotificationRoutes = (notificationRoutes, basePath) => {
  return notificationRoutes.map((route) => {
    const fullPath = basePath === '/' ? `/${route.path}` : `${basePath}${route.path}`;
    return createProtectedRoute({
      path: fullPath,
      component: route.component,
      isPublic: route.isPublic,
      fallbackPath: '/dashboard',
    });
  });
};

/**
 * Creates notification admin route for a specific level
 * @param {Object} notificationAdminConfig - Notification admin route configuration
 * @returns {JSX.Element}
 */
export const createNotificationAdminRoute = (notificationAdminConfig) => {
  return createProtectedRoute({
    path: notificationAdminConfig.path,
    component: notificationAdminConfig.component,
    roles: notificationAdminConfig.roles,
    fallbackPath: notificationAdminConfig.fallbackPath,
  });
};
