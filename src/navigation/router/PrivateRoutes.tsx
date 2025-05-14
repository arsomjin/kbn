import React from 'react';
import { Route } from 'react-router-dom';
import NotFound from '../../components/common/NotFound';

// Import private components (placeholder for now)
// These routes are only accessible to users with privated roles
import Dashboard from '../../modules/dashboard/Dashboard';

const PrivilegedDashboard = () => <div>Privileged Dashboard Page</div>;

/**
 * Private routes configuration
 * Only accessible to users with privated roles
 */
export const PrivateRoutes = [
  <Route key='dashboard' path='dashboard' element={<Dashboard />} />
  // Add more private routes here for all authenticated users
];

// Fallback element for unauthorized access to private routes
export const PrivateRouteFallback = <NotFound />;
