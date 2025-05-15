import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';

interface ProvinceGuardProps {
  children: React.ReactNode;
}

const ProvinceGuard: React.FC<ProvinceGuardProps> = ({ children }) => {
  const { provinceId } = useParams<{ provinceId: string }>();
  const { hasProvinceAccess } = usePermissions();

  if (!provinceId || !hasProvinceAccess(provinceId)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProvinceGuard; 