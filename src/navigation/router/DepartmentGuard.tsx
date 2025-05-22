import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { usePermissions } from 'hooks/usePermissions';
import NotFound from 'components/common/NotFound';

interface DepartmentGuardProps {
  children: React.ReactNode;
}

const DepartmentGuard: React.FC<DepartmentGuardProps> = ({ children }) => {
  const { departmentCode } = useParams<{ departmentCode: string }>();
  const { hasDepartmentAccess } = usePermissions();

  if (!departmentCode || !hasDepartmentAccess(departmentCode)) {
    return <NotFound />;
  }

  return <>{children}</>;
};

export default DepartmentGuard;
