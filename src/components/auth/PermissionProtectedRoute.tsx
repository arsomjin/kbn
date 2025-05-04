import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface PermissionProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  fallbackPath?: string;
}

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
const PermissionProtectedRoute: React.FC<PermissionProtectedRouteProps> = ({
  children,
  requiredPermission,
  fallbackPath = '/dashboard'
}) => {
  const { isAuthenticated, userProfile, isLoading } = useAuth();
  const { hasPermission } = usePermissions();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the location they were trying to go to for later redirect
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // If permission check is required, verify user has the permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    // Redirect to fallback path if user doesn't have required permission
    return <Navigate to={fallbackPath} replace />;
  }

  // User is authenticated and has required permission, render the children
  return <>{children}</>;
};

export default PermissionProtectedRoute;
