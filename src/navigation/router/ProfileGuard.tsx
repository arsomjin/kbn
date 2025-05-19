import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const ProfileGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  console.log('[ProfileGuard] State:', {
    isLoading,
    isAuthenticated,
    userProfile: userProfile
      ? {
          role: userProfile.role,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName
        }
      : null,
    currentPath: location.pathname
  });

  if (isLoading) {
    console.log('[ProfileGuard] Loading state - showing spinner');
    return (
      <div className='flex justify-center items-center h-screen'>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('[ProfileGuard] Not authenticated - redirecting to login');
    return <Navigate to='/auth/login' state={{ from: location }} replace />;
  }

  // If user is authenticated but has no profile, show profile completion
  if (!userProfile) {
    console.log('[ProfileGuard] No user profile - showing profile completion');
    return <>{children}</>;
  }

  // If profile is complete, redirect to landing page
  if (userProfile.firstName && userProfile.lastName) {
    console.log('[ProfileGuard] Profile complete - redirecting to landing page');
    return <Navigate to='/' replace />;
  }

  console.log('[ProfileGuard] Profile incomplete - showing profile completion page');
  return <>{children}</>;
};

export default ProfileGuard;
