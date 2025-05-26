import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { usePermissions } from 'hooks/usePermissions';
import NotFound from 'pages/NotFound';

const BranchGuard = ({ children }) => {
  const { branchCode } = useParams();
  const { hasBranchAccess } = usePermissions();

  if (!branchCode || !hasBranchAccess(branchCode)) {
    return <NotFound />;
  }

  return <>{children}</>;
};

export default BranchGuard;
