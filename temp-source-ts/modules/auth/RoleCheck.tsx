import React from 'react';
import { useAuth } from 'contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { ROLES } from '../../constants/roles';
import { LoadingSpinner } from 'components/common/LoadingSpinner';

/**
 * RoleCheck component
 *
 * Handles checking the user's role after authentication and redirects to the appropriate page.
 * Shows a loading spinner while the check is in progress.
 */
const RoleCheck: React.FC = () => {
  const { isAuthenticated, userProfile, isLoading, isProfileComplete } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to='/auth/login' replace />;
  }

  if (!isProfileComplete) {
    return <Navigate to='/complete-profile' replace />;
  }

  switch (userProfile?.role) {
    case ROLES.PENDING:
      return <Navigate to='/pending' replace />;
    case ROLES.EXECUTIVE:
    case ROLES.DEVELOPER:
      return <Navigate to='/overview' replace />;
    case ROLES.SUPER_ADMIN:
    case ROLES.GENERAL_MANAGER:
      return <Navigate to='/dashboard' replace />;
    case ROLES.PROVINCE_MANAGER:
    case ROLES.PROVINCE_ADMIN:
      return <Navigate to='/province-dashboard' replace />;
    case ROLES.BRANCH_MANAGER:
      return <Navigate to='/branch-dashboard' replace />;
    case ROLES.USER:
    case ROLES.LEAD:
      return <Navigate to='/landing' replace />;
    default:
      return <Navigate to='/landing' replace />;
  }
};

export default RoleCheck;
