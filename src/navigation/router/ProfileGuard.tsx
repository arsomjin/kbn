import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { LoadingSpinner } from 'components/common/LoadingSpinner';

const ProfileGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to='/auth/login' state={{ from: location }} replace />;
  }

  // If user is authenticated but has no profile, show profile completion
  if (!userProfile) {
    return <>{children}</>;
  }

  // If profile is complete, redirect to landing page
  if (userProfile.firstName && userProfile.lastName) {
    return <Navigate to='/' replace />;
  }

  return <>{children}</>;
};

export default ProfileGuard;
