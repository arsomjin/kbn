import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAuth } from 'contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { hasPrivilegedAccess } from '../../utils/roleUtils';
import { ROLES } from '../../constants/roles';
import { useResponsive } from 'hooks/useResponsive';
import { LoadingSpinner } from 'components/common/LoadingSpinner';

/**
 * RoleCheck component
 *
 * Handles checking the user's role after authentication and redirects to the appropriate page.
 * Shows a loading spinner while the check is in progress.
 */
const RoleCheck: React.FC = () => {
  const { isAuthenticated, userProfile, isLoading, isProfileComplete } = useAuth();

  const { isMobile } = useResponsive();

  // Use hasPrivilegedAccess utility for privilege check
  const isPrivileged = hasPrivilegedAccess(userProfile);

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
    case ROLES.PRIVILEGE:
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
