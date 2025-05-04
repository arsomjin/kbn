import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import useRedirectLogic from '../../hooks/useRedirectLogic';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  requiresProfileComplete?: boolean;
  allowedRoles?: string[];
  minPrivilegeLevel?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresAuth = true,
  requiresProfileComplete = false,
  allowedRoles,
  minPrivilegeLevel,
}) => {
  const location = useLocation();
  const { loading, redirectPath } = useRedirectLogic({
    requiresAuth,
    requiresProfileComplete,
    allowedRoles,
    minPrivilegeLevel,
  });

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
      </div>
    );
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
