import React from 'react';
import { Route } from 'react-router-dom';
import NotFound from '../../components/common/NotFound';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { UserRole } from '../../constants/roles';
import Dashboard from '../../modules/dashboard/Dashboard';

// Import private components (placeholder for now)
// These routes are only accessible to users with privated roles

const PrivilegedDashboard = () => <div>Privileged Dashboard Page</div>;

/**
 * Private routes configuration
 * Only accessible to users with private roles
 */
export const PrivateRoutes = [
  <Route
    key="dashboard"
    path="dashboard"
    element={
      <ProtectedRoute
        allowedRoles={[
          UserRole.SUPER_ADMIN,
          UserRole.PROVINCE_ADMIN,
          UserRole.GENERAL_MANAGER,
          UserRole.EXECUTIVE,
          UserRole.DEVELOPER,
        ]}
      >
        <Dashboard />
      </ProtectedRoute>
    }
  />,
  // Add more private routes here for all authenticated users
];

// Fallback element for unauthorized access to private routes
export const PrivateRouteFallback = <NotFound />;
