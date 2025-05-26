import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { usePermissions } from 'hooks/usePermissions';
import NotFound from 'pages/NotFound';

const ProvinceGuard = ({ children }) => {
  const { provinceId } = useParams();
  const { hasProvinceAccess } = usePermissions();

  if (!provinceId || !hasProvinceAccess(provinceId)) {
    return <NotFound />;
  }

  return <>{children}</>;
};

export default ProvinceGuard;
