import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import { UserRole } from '../../constants/roles';
import { PERMISSIONS } from '../../constants/Permissions';
import PermissionProtectedRoute from '../../components/auth/PermissionProtectedRoute';

import ProvincesManagement from './ProvincesManagement';
import BranchesManagement from './BranchesManagement';

/**
 * Main HR router component
 */
const SpecialSettings = () => {
  return (
    <Routes>
      {/* Provinces Management */}
      <Route
        path="provinces"
        element={
          <PermissionProtectedRoute
            requiredPermission={PERMISSIONS.SPECIAL_SETTINGS_VIEW}
            allowedRoles={[UserRole.SUPER_ADMIN, UserRole.DEVELOPER, UserRole.EXECUTIVE]}
          >
            <ProvincesManagement />
          </PermissionProtectedRoute>
        }
      />

      {/* Branches Management */}
      <Route
        path="branches"
        element={
          <PermissionProtectedRoute
            requiredPermission={PERMISSIONS.SPECIAL_SETTINGS_VIEW}
            allowedRoles={[UserRole.SUPER_ADMIN, UserRole.DEVELOPER, UserRole.EXECUTIVE]}
          >
            <BranchesManagement />
          </PermissionProtectedRoute>
        }
      />
    </Routes>
  );
};

export default SpecialSettings;
