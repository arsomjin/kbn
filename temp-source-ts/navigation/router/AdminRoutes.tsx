import React, { useEffect, useState } from 'react';
import { Route } from 'react-router-dom';
import NotFound from '../../components/common/NotFound';
import UserReview from '../../modules/auth/UserReview';
import UserRoleManager from '../../modules/auth/UserRoleManager';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import PermissionProtectedRoute from '../../components/auth/PermissionProtectedRoute';
import { RoleCategory, UserRole } from '../../constants/roles';
import { ComposeNotification } from '../../components/notifications';
import { PERMISSIONS } from '../../constants/Permissions';
import ProvincesManagement from '../../modules/settings/ProvincesManagement';
import BranchesManagement from '../../modules/settings/BranchesManagement';
import { EmployeeList } from '../../modules/employees/components/EmployeeList';
import { EmployeeDetails } from '../../modules/employees/components/EmployeeDetails';
import Settings from '../../modules/settings/Settings';
import { EmployeeForm } from 'modules/employees/components/EmployeeForm';
import EmployeeFormWithData from '../../modules/employees/components/EmployeeFormWithData';
import { getAllowedRolesByCategory } from 'utils/roleUtils';

/**
 * Admin routes configuration
 * Only accessible to users with admin roles (system-admin, province-admin, owner, executive, developer)
 */
export const AdminRoutes = [
  <Route
    key='review-users'
    path='review-users'
    element={
      <ProtectedRoute allowedRoles={getAllowedRolesByCategory(RoleCategory.EXECUTIVE)}>
        <UserReview />
      </ProtectedRoute>
    }
  />,
  <Route
    key='manage-users'
    path='users'
    element={
      <ProtectedRoute
        allowedRoles={[
          UserRole.PROVINCE_ADMIN,
          UserRole.SUPER_ADMIN,
          UserRole.GENERAL_MANAGER,
          UserRole.EXECUTIVE,
          UserRole.DEVELOPER
        ]}
      >
        <UserRoleManager />
      </ProtectedRoute>
    }
  />,
  <Route key='send-notification' path='send-notification' element={<ComposeNotification />} />,
  <Route
    key='provinces'
    path='provinces'
    element={
      <ProtectedRoute allowedRoles={[UserRole.EXECUTIVE, UserRole.SUPER_ADMIN, UserRole.DEVELOPER]}>
        <ProvincesManagement />
      </ProtectedRoute>
    }
  />,
  <Route
    key='branches'
    path='branches'
    element={
      <ProtectedRoute allowedRoles={[UserRole.EXECUTIVE, UserRole.SUPER_ADMIN, UserRole.DEVELOPER]}>
        <BranchesManagement />
      </ProtectedRoute>
    }
  />,
  // Settings routes
  <Route
    key='settings-branches'
    path='settings/branches'
    element={
      <ProtectedRoute allowedRoles={[UserRole.EXECUTIVE, UserRole.SUPER_ADMIN, UserRole.DEVELOPER]}>
        <Settings />
      </ProtectedRoute>
    }
  />,
  <Route
    key='settings-users'
    path='settings/users'
    element={
      <ProtectedRoute allowedRoles={[UserRole.EXECUTIVE, UserRole.SUPER_ADMIN, UserRole.DEVELOPER]}>
        <Settings />
      </ProtectedRoute>
    }
  />,
  <Route
    key='settings-vehicles'
    path='settings/vehicles'
    element={
      <ProtectedRoute allowedRoles={[UserRole.EXECUTIVE, UserRole.SUPER_ADMIN, UserRole.DEVELOPER]}>
        <Settings />
      </ProtectedRoute>
    }
  />,
  <Route
    key='settings-parts'
    path='settings/parts'
    element={
      <ProtectedRoute allowedRoles={[UserRole.EXECUTIVE, UserRole.SUPER_ADMIN, UserRole.DEVELOPER]}>
        <Settings />
      </ProtectedRoute>
    }
  />,
  <Route
    key='settings-services'
    path='settings/services'
    element={
      <ProtectedRoute allowedRoles={[UserRole.EXECUTIVE, UserRole.SUPER_ADMIN, UserRole.DEVELOPER]}>
        <Settings />
      </ProtectedRoute>
    }
  />,
  <Route
    key='settings-promotions'
    path='settings/promotions'
    element={
      <ProtectedRoute allowedRoles={[UserRole.EXECUTIVE, UserRole.SUPER_ADMIN, UserRole.DEVELOPER]}>
        <Settings />
      </ProtectedRoute>
    }
  />,
  // Employee management routes
  <Route
    key='employees'
    path='employees'
    element={
      <PermissionProtectedRoute requiredPermission={PERMISSIONS.USER_VIEW} fallbackPath='/dashboard'>
        <EmployeeList />
      </PermissionProtectedRoute>
    }
  />,
  <Route
    key='employees-new'
    path='employees/new'
    element={
      <PermissionProtectedRoute requiredPermission={PERMISSIONS.USER_VIEW} fallbackPath='/dashboard'>
        <EmployeeForm />
      </PermissionProtectedRoute>
    }
  />,
  <Route
    key='employees-edit'
    path='employees/:id/edit'
    element={
      <PermissionProtectedRoute requiredPermission={PERMISSIONS.USER_VIEW} fallbackPath='/dashboard'>
        <EmployeeFormWithData />
      </PermissionProtectedRoute>
    }
  />,
  <Route
    key='employees-details'
    path='employees/:id'
    element={
      <PermissionProtectedRoute requiredPermission={PERMISSIONS.USER_VIEW} fallbackPath='/dashboard'>
        <EmployeeDetails />
      </PermissionProtectedRoute>
    }
  />
  // Add more admin routes here
];

// Fallback element for unauthorized access to admin routes
export const AdminRouteFallback = <NotFound />;
