import React, { Suspense } from 'react';
import { Routes } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AuthRoutes } from './routes/AuthRoutes';
import { ProtectedRoutes } from './routes/ProtectedRoutes';

/**
 * Main application router for KBN.
 * Handles all route protection, redirection, and layout logic.
 *
 * This router is organized into modular components for better maintainability:
 * - AuthRoutes: Handles authentication-related routes
 * - ProtectedRoutes: Handles all authenticated user routes with RBAC
 *
 * @returns {JSX.Element}
 */
const AppRouter = () => {
  const { userProfile, isLoading, isProfileComplete } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Authentication routes */}
        {AuthRoutes()}

        {/* Protected routes */}
        {ProtectedRoutes({ userProfile, isProfileComplete })}
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
