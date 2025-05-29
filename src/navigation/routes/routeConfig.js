import React from 'react';
import { RoleCategory } from '../../constants/roles';
import { PERMISSIONS } from '../../constants/Permissions';
import { getAllowedRolesByCategory } from '../../utils/roleUtils';

// Lazy load pages
const Login = React.lazy(() => import('../../modules/auth/LoginPage'));
const Register = React.lazy(() => import('../../modules/auth/RegisterPage'));
const ForgotPassword = React.lazy(() => import('../../modules/auth/ForgotPasswordPage'));
const CompleteProfile = React.lazy(() => import('../../modules/auth/CompleteProfilePage'));
const Pending = React.lazy(() => import('../../modules/auth/PendingPage'));
const Landing = React.lazy(() => import('../../modules/dashboard/Landing'));
const ProvinceDashboard = React.lazy(() => import('../../modules/dashboard/ProvinceDashboard'));
const BranchDashboard = React.lazy(() => import('../../modules/dashboard/BranchDashboard'));
const AdminDashboard = React.lazy(() => import('../../modules/dashboard/admin/Dashboard'));
const EmployeeDashboard = React.lazy(() => import('../../modules/dashboard/employee/Dashboard'));
const VisitorDashboard = React.lazy(() => import('../../modules/dashboard/visitor/Dashboard'));
const NotFound = React.lazy(() => import('../../pages/NotFound'));

// Regular imports
import Overview from '../../modules/dashboard/Overview';
import Dashboard from '../../modules/dashboard/Dashboard';
import SystemOverview from '../../pages/SystemOverview';
import SpecialSettings from '../../modules/settings/SpecialSettings';
import PersonalProfile from '../../pages/PersonalProfile';
import AccountOverview from '../../modules/account/Overview/index';
import AccountIncome from '../../modules/account/Income';
import AccountExpense from '../../modules/account/Expense';
import AccountInputPrice from '../../modules/account/InputPrice';
import UserManagement from '../../modules/userManagement';
import { Employees } from '../../modules/hr/Employees';
import ComposeNotification from '../../components/notifications/ComposeNotification';
import NotificationSettings from '../../components/notifications/NotificationSettings';
import NotificationList from '../../components/notifications/NotificationList';

/**
 * Account route configuration for different hierarchical levels
 */
export const accountRoutes = [
  {
    path: 'overview',
    component: AccountOverview,
    permission: PERMISSIONS.VIEW_ACCOUNTS,
  },
  {
    path: 'income',
    component: AccountIncome,
    permission: PERMISSIONS.VIEW_INCOME,
  },
  {
    path: 'expense',
    component: AccountExpense,
    permission: PERMISSIONS.VIEW_EXPENSE,
  },
  {
    path: 'input-price',
    component: AccountInputPrice,
    permission: PERMISSIONS.VIEW_ACCOUNTS,
  },
];

/**
 * Executive level routes configuration
 */
export const executiveRoutes = [
  {
    path: '/overview',
    component: Overview,
    roles: getAllowedRolesByCategory(RoleCategory.EXECUTIVE),
    fallbackPath: '/dashboard',
  },
  {
    path: '/special-settings/*',
    component: SpecialSettings,
    roles: getAllowedRolesByCategory(RoleCategory.EXECUTIVE),
    fallbackPath: '/dashboard',
  },
  {
    path: '/dashboard',
    component: Dashboard,
    roles: getAllowedRolesByCategory(RoleCategory.GENERAL_MANAGER),
    fallbackPath: '/dashboard',
  },
];

/**
 * Province level routes configuration
 */
export const provinceRoutes = [
  {
    path: 'dashboard',
    component: ProvinceDashboard,
    roles: getAllowedRolesByCategory(RoleCategory.PROVINCE_MANAGER),
    fallbackPath: '/dashboard',
  },
];

/**
 * Branch level routes configuration
 */
export const branchRoutes = [
  {
    path: 'dashboard',
    component: BranchDashboard,
    roles: getAllowedRolesByCategory(RoleCategory.LEAD),
    fallbackPath: '/dashboard',
  },
  {
    path: 'landing',
    component: Landing,
    isPublic: true,
  },
];

/**
 * Admin routes configuration for different levels
 */
export const adminRoutes = {
  executive: {
    path: '/admin/*',
    component: UserManagement,
    permission: PERMISSIONS.USER_VIEW,
    roles: getAllowedRolesByCategory(RoleCategory.GENERAL_MANAGER),
  },
  province: {
    path: ':provinceId/admin/*',
    component: UserManagement,
    permission: PERMISSIONS.USER_VIEW,
    roles: getAllowedRolesByCategory(RoleCategory.PROVINCE_MANAGER),
  },
  branch: {
    path: ':provinceId/:branchCode/admin/*',
    component: UserManagement,
    permission: PERMISSIONS.USER_VIEW,
    roles: getAllowedRolesByCategory(RoleCategory.BRANCH_MANAGER),
  },
};

/**
 * Account route configurations for different hierarchical levels
 */
export const accountRouteConfigs = {
  executive: {
    basePath: '/account',
    roles: getAllowedRolesByCategory(RoleCategory.EXECUTIVE),
  },
  province: {
    basePath: ':provinceId/account',
    roles: getAllowedRolesByCategory(RoleCategory.PROVINCE_MANAGER),
  },
  branch: {
    basePath: ':provinceId/:branchCode/account',
    roles: getAllowedRolesByCategory(RoleCategory.BRANCH_MANAGER),
  },
};

/**
 * Public route redirects
 */
export const authRedirects = [
  { from: '/login', to: '/auth/login' },
  { from: '/signup', to: '/auth/signup' },
  { from: '/reset-password', to: '/auth/reset-password' },
];

/**
 * Auth routes configuration
 */
export const authRoutes = [
  { path: 'login', component: Login },
  { path: 'signup', component: Register },
  { path: 'reset-password', component: ForgotPassword },
];

/**
 * Employee routes configuration for different levels
 */
export const employeeRoutes = {
  executive: {
    path: '/hr/employees/*',
    component: Employees,
    permission: PERMISSIONS.EMPLOYEE_VIEW,
    roles: getAllowedRolesByCategory(RoleCategory.EXECUTIVE),
  },
  province: {
    path: ':provinceId/hr/employees/*',
    component: Employees,
    permission: PERMISSIONS.EMPLOYEE_VIEW,
    roles: getAllowedRolesByCategory(RoleCategory.PROVINCE_MANAGER),
  },
  branch: {
    path: ':provinceId/:branchCode/hr/employees/*',
    component: Employees,
    permission: PERMISSIONS.EMPLOYEE_VIEW,
    roles: getAllowedRolesByCategory(RoleCategory.BRANCH_MANAGER),
  },
};

/**
 * Notification routes configuration for different hierarchical levels
 */
export const notificationRoutes = [
  {
    path: 'notifications',
    component: NotificationList,
    isPublic: true, // Available to all authenticated users
  },
  {
    path: 'notification-settings',
    component: NotificationSettings,
    isPublic: true, // Available to all authenticated users
  },
];

/**
 * Notification admin routes configuration for different levels
 * (Send notification functionality)
 */
export const notificationAdminRoutes = {
  executive: {
    path: '/admin/send-notification',
    component: ComposeNotification,
    roles: ['PROVINCE_ADMIN', 'GENERAL_MANAGER', 'SUPER_ADMIN', 'DEVELOPER'],
    fallbackPath: '/dashboard',
  },
  province: {
    path: ':provinceId/admin/send-notification',
    component: ComposeNotification,
    roles: ['PROVINCE_ADMIN', 'PROVINCE_MANAGER'],
    fallbackPath: ':provinceId/dashboard',
  },
  branch: {
    path: ':provinceId/:branchCode/admin/send-notification',
    component: ComposeNotification,
    roles: ['BRANCH_MANAGER'],
    fallbackPath: ':provinceId/:branchCode/dashboard',
  },
};

/**
 * Notification route configurations for different hierarchical levels
 */
export const notificationRouteConfigs = {
  executive: {
    basePath: '/',
    adminPath: '/admin/send-notification',
  },
  province: {
    basePath: ':provinceId/',
    adminPath: ':provinceId/admin/send-notification',
  },
  branch: {
    basePath: ':provinceId/:branchCode/',
    adminPath: ':provinceId/:branchCode/admin/send-notification',
  },
};
