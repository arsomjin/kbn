import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { usePermissions } from 'hooks/usePermissions';
import NotFound from 'components/common/NotFound';

interface BranchGuardProps {
  children: React.ReactNode;
}

const BranchGuard: React.FC<BranchGuardProps> = ({ children }) => {
  const { branchCode } = useParams<{ branchCode: string }>();
  const { hasBranchAccess } = usePermissions();

  if (!branchCode || !hasBranchAccess(branchCode)) {
    return <NotFound />;
  }

  return <>{children}</>;
};

export default BranchGuard;
