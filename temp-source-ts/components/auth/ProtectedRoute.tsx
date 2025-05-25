import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { UserRole } from 'constants/roles';
import { getLandingPage } from 'utils/roleUtils';
import { LoadingSpinner } from 'components/common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, userProfile } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to='/auth/login' state={{ from: location }} replace />;
  }

  // If no allowed roles specified, allow access
  if (!allowedRoles) {
    return <>{children}</>;
  }

  // Check if user has an allowed role
  if (userProfile && !allowedRoles.includes(userProfile.role as UserRole)) {
    // Get the appropriate landing page for the user's role
    const landingPage = getLandingPage(userProfile);

    // Prevent redirect loop by checking if we're already at the landing page
    if (location.pathname === landingPage) {
      return <>{children}</>;
    }

    return <Navigate to={landingPage} replace />;
  }

  return <>{children}</>;
};
