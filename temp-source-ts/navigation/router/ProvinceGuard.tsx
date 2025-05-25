import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { usePermissions } from 'hooks/usePermissions';
import NotFound from 'components/common/NotFound';

interface ProvinceGuardProps {
  children: React.ReactNode;
}

const ProvinceGuard: React.FC<ProvinceGuardProps> = ({ children }) => {
  const { provinceId } = useParams<{ provinceId: string }>();
  const { hasProvinceAccess } = usePermissions();

  if (!provinceId || !hasProvinceAccess(provinceId)) {
    return <NotFound />;
  }

  return <>{children}</>;
};

export default ProvinceGuard;
