import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { hasPrivilegedAccess } from '../../utils/roleUtils';
import { ROLES } from '../../constants/roles';

/**
 * RoleCheck component
 *
 * Handles checking the user's role after authentication and redirects to the appropriate page.
 * Shows a loading spinner while the check is in progress.
 */
const RoleCheck: React.FC = () => {
  const { isAuthenticated, userProfile, isLoading } = useAuth();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 480;

  // Use hasPrivilegedAccess utility for privilege check
  const isPrivileged = hasPrivilegedAccess(userProfile);

  if (isLoading) {
    return (
      <div className='flex flex-col justify-center items-center h-screen'>
        <Spin indicator={<LoadingOutlined style={{ fontSize: isMobile ? 36 : 48 }} spin />} />
        <p className={`mt-4 ${isMobile ? 'text-base' : 'text-lg'}`}>Checking your account...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to='/auth/login' replace />;
  }

  if (!userProfile) {
    return <Navigate to='/complete-profile' replace />;
  }

  if (userProfile.role === ROLES.PENDING) {
    return <Navigate to='/pending' replace />;
  }

  if (isPrivileged) {
    return <Navigate to='/overview' replace />;
  }

  return <Navigate to='/dashboard' replace />;
};

export default RoleCheck;
