/**
 * Role-Based Dashboard Router
 * Automatically shows the appropriate dashboard based on user's role and access level
 */

import React from 'react';
import { usePermissions } from 'hooks/usePermissions';
import {
  SuperAdminDashboard,
  ExecutiveDashboard,
  ProvinceManagerDashboard,
  BranchManagerDashboard,
  StaffDashboard
} from './RoleDashboards';

const RoleBasedDashboard = () => {
  const { 
    userRole, 
    isSuperAdmin, 
    isExecutive,
    hasProvinceAccess, 
    hasBranchAccessOnly,
    accessibleProvinces,
    accessibleBranches
  } = usePermissions();

  // Determine which dashboard to show based on user role and access level
  const getDashboardComponent = () => {
    // Executive - Full access with special executive interface
    if (isExecutive || userRole === 'EXECUTIVE') {
      return <ExecutiveDashboard />;
    }

    // Super Admin - Full system access
    if (isSuperAdmin) {
      return <SuperAdminDashboard />;
    }

    // Province Manager - Province-level access
    if (hasProvinceAccess || 
        (userRole && userRole.toString().toLowerCase().includes('province'))) {
      return <ProvinceManagerDashboard />;
    }

    // Branch Manager - Branch-level management access
    if (hasBranchAccessOnly || 
        (userRole && userRole.toString().toLowerCase().includes('branch_manager'))) {
      return <BranchManagerDashboard />;
    }

    // Staff roles - Department-specific access
    return <StaffDashboard />;
  };

  return getDashboardComponent();
};

export default RoleBasedDashboard; 