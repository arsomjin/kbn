import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * PermissionProtectedRoute - Protects a route based on permissions
 *
 * Component that checks if a user is authenticated and has the required permission
 * before rendering the protected content. If not, it redirects to the fallback path.
 *
 * @example
 * <Route
 *   path="/admin/settings"
 *   element={
 *     <PermissionProtectedRoute requiredPermission={PERMISSIONS.SYSTEM_SETTINGS_EDIT}>
 *       <AdminSettingsScreen />
 *     </PermissionProtectedRoute>
 *   }
 * />
 */
const PermissionProtectedRoute = ({
  children,
  requiredPermission,
  fallbackPath = '/landing',
  provinceCheck,
  allowedRoles,
}) => {
  const { isAuthenticated, userProfile, isLoading } = useAuth();
  const { hasProvinceAccess, hasAnyPermission } = usePermissions();
  const location = useLocation();

  console.log('[PermissionProtectedRoute] - ', {
    isAuthenticated,
    userProfile,
    isLoading,
    requiredPermission,
    fallbackPath,
    provinceCheck,
    allowedRoles,
  });

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles && userProfile && allowedRoles.includes(userProfile?.role)) {
    // If user has an allowed role, bypass permission and province checks
    return <>{children}</>;
  }

  // Check if user has the required permission
  const hasPermission = hasAnyPermission([requiredPermission]);

  if (!hasPermission) {
    // Redirect to the previous page or landing page
    return <Navigate to={location.state?.from || '/landing'} replace />;
  }

  // If province check is required, verify user has access to the province
  if (provinceCheck && !hasProvinceAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  // User is authenticated and has required permission, render the children
  return <>{children}</>;
};

export default PermissionProtectedRoute;
