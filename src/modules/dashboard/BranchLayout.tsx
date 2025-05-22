import React from 'react';
import { Outlet } from 'react-router-dom';

interface BranchLayoutProps {
  children?: React.ReactNode;
}

const BranchLayout: React.FC<BranchLayoutProps> = ({ children }) => {
  return <>{children || <Outlet />}</>;
};

export default BranchLayout;
