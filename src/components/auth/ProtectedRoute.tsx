import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { UserRole, hasRolePrivilege } from '../../constants/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, userProfile } = useAuth();
  const location = useLocation();

  console.log('[ProtectedRoute] State:', {
    isAuthenticated,
    isLoading,
    currentPath: location.pathname,
    allowedRoles,
    userRole: userProfile?.role
  });

  if (isLoading) {
    console.log('[ProtectedRoute] Loading state - showing spinner');
    return (
      <div className='flex justify-center items-center h-screen'>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated - redirecting to login');
    return <Navigate to='/auth/login' state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles && userProfile) {
    const hasRequiredRole = allowedRoles.some(role => 
      hasRolePrivilege(userProfile.role as UserRole, role)
    );
    console.log('[ProtectedRoute] Role check:', {
      hasRequiredRole,
      userRole: userProfile.role,
      allowedRoles
    });

    if (!hasRequiredRole) {
      console.log('[ProtectedRoute] Insufficient role - redirecting to dashboard');
      return <Navigate to='/dashboard' replace />;
    }
  }

  console.log('[ProtectedRoute] Authenticated and authorized - rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
