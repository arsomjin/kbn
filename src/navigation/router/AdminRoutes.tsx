import React from 'react';
import { Route } from 'react-router-dom';
import NotFound from '../../components/common/NotFound';
import UserReview from '../../modules/auth/UserReview';
import UserRoleManager from '../../modules/auth/UserRoleManager';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import PermissionProtectedRoute from '../../components/auth/PermissionProtectedRoute';
import { UserRole } from '../../constants/roles';
import { ComposeNotification } from '../../components/notifications';
import { PERMISSIONS } from '../../constants/permissions';
import ProvincesManagement from '../../modules/settings/ProvincesManagement';
import BranchesManagement from '../../modules/settings/BranchesManagement';
import { EmployeeList } from '../../modules/employees/components/EmployeeList';
import { EmployeeForm } from '../../modules/employees/components/EmployeeForm';
import { EmployeeDetails } from '../../modules/employees/components/EmployeeDetails';

/**
 * Admin routes configuration
 * Only accessible to users with admin roles (system-admin, province-admin, owner, executive)
 */
export const AdminRoutes = [
  <Route
    key='review-users'
    path='review-users'
    element={
      <ProtectedRoute allowedRoles={[UserRole.PROVINCE_ADMIN, UserRole.SUPER_ADMIN, UserRole.GENERAL_MANAGER]}>
        <UserReview />
      </ProtectedRoute>
    }
  />,
  <Route
    key='manage-users'
    path='users'
    element={
      <ProtectedRoute allowedRoles={[UserRole.PROVINCE_ADMIN, UserRole.SUPER_ADMIN, UserRole.GENERAL_MANAGER]}>
        <UserRoleManager />
      </ProtectedRoute>
    }
  />,
  <Route key='send-notification' path='send-notification' element={<ComposeNotification />} />,
  <Route
    key='provinces'
    path='provinces'
    element={
      <ProtectedRoute allowedRoles={[UserRole.PRIVILEGE, UserRole.SUPER_ADMIN]}>
        <ProvincesManagement />
      </ProtectedRoute>
    }
  />,
  <Route
    key='branches'
    path='branches'
    element={
      <PermissionProtectedRoute
        requiredPermission={PERMISSIONS.BRANCH_MANAGE}
        fallbackPath="/dashboard"
        // Note that SUPER_ADMIN and PRIVILEGE automatically get BRANCH_MANAGE permission
        // through their role hierarchy, so we don't need separate role check
      >
        <BranchesManagement />
      </PermissionProtectedRoute>
    }
  />,
  // Employee management routes
  <Route
    key='employees'
    path='employees'
    element={
      <PermissionProtectedRoute
        requiredPermission={PERMISSIONS.USER_VIEW}
        fallbackPath="/dashboard"
      >
        <EmployeeList />
      </PermissionProtectedRoute>
    }
  />,
  <Route
    key='employees-new'
    path='employees/new'
    element={
      <PermissionProtectedRoute
        requiredPermission={PERMISSIONS.USER_VIEW}
        fallbackPath="/dashboard"
      >
        <EmployeeForm />
      </PermissionProtectedRoute>
    }
  />,
  <Route
    key='employees-edit'
    path='employees/:id/edit'
    element={
      <PermissionProtectedRoute
        requiredPermission={PERMISSIONS.USER_VIEW}
        fallbackPath="/dashboard"
      >
        <EmployeeForm />
      </PermissionProtectedRoute>
    }
  />,
  <Route
    key='employees-details'
    path='employees/:id'
    element={
      <PermissionProtectedRoute
        requiredPermission={PERMISSIONS.USER_VIEW}
        fallbackPath="/dashboard"
      >
        <EmployeeDetails />
      </PermissionProtectedRoute>
    }
  />
  // Add more admin routes here
];

// Fallback element for unauthorized access to admin routes
export const AdminRouteFallback = <NotFound />;
