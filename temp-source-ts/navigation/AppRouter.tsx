import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { getAllowedRolesByCategory, getUserHomePath } from 'utils/roleUtils';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import PageDoc from 'components/PageDoc';
import SystemOverview from 'modules/about/SystemOverview';

// Auth and layout components
import MainLayout from 'components/layout/MainLayout';
import NotFound from 'components/common/NotFound';
import { ProtectedRoute } from 'components/auth/ProtectedRoute';
import { PublicOnlyRoute } from './router/PublicOnlyRoute';
import PermissionProtectedRoute from 'components/auth/PermissionProtectedRoute';
import { UserRole } from 'constants/roles';
import RoleCheck from 'modules/auth/RoleCheck';

// Route configurations
import { AdminRoutes } from './router/AdminRoutes';
import { PrivateRoutes } from './router/PrivateRoutes';
import ProfileGuard from './router/ProfileGuard';
import PendingGuard from './router/PendingGuard';
import ProvinceGuard from './router/ProvinceGuard';

// Constants
import { PERMISSIONS } from 'constants/Permissions';
import { LoadingSpinner } from 'components/common/LoadingSpinner';
import { ROLE_CATEGORIES, RoleCategory } from 'constants/roles';
import BranchGuard from './router/BranchGuard';
import BranchReports from 'modules/reports/provinceReports/BranchReports';
import BranchLayout from 'modules/dashboard/BranchLayout';
import InputPriceWrapper from 'modules/account/InputPrice/InputPriceWrapper';
import AccountProvince from 'modules/account/provinces/AccountProvince';

// Lazy-loaded components
const LoginPage = lazy(() => import('modules/auth/LoginPage'));
const RegisterPage = lazy(() => import('modules/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('modules/auth/ForgotPasswordPage'));
const CreateProfilePage = lazy(() => import('modules/auth/CreateProfilePage'));
const CompleteProfilePage = lazy(() => import('modules/auth/CompleteProfilePage'));
const PendingPage = lazy(() => import('modules/auth/PendingPage'));
const Overview = lazy(() => import('modules/dashboard/Overview'));
const Profile = lazy(() => import('modules/auth/CompleteProfilePage'));
const PersonalProfile = lazy(() => import('pages/PersonalProfile'));
const ProvinceLayout = lazy(() => import('modules/dashboard/ProvinceLayout'));
const Dashboard = lazy(() => import('modules/dashboard/Dashboard'));
const BranchDashboard = lazy(() => import('modules/dashboard/BranchDashboard'));
const ProvinceDashboard = lazy(() => import('modules/dashboard/ProvinceDashboard'));
const ProvinceSettings = lazy(() => import('modules/settings/ProvinceSettings'));
const ProvinceReports = lazy(() => import('modules/reports/provinceReports/ProvinceReports'));
const Account = lazy(() => import('modules/account'));
const Income = lazy(() => import('modules/account/Income'));
const Expense = lazy(() => import('modules/account/Expense'));
const AccountBranch = lazy(() => import('modules/account/branches/AccountBranch'));
const IncomeBranch = lazy(() => import('modules/account/branches/Income'));
const ExpenseBranch = lazy(() => import('modules/account/branches/Expense'));
const IncomeProvince = lazy(() => import('modules/account/provinces/Income'));
const ExpenseProvince = lazy(() => import('modules/account/provinces/Expense'));
const Landing = lazy(() => import('modules/dashboard/Landing'));
const InputPrice = lazy(() => import('modules/account/InputPrice'));
const HRModules = lazy(() => import('modules/hr'));

/**
 * Main application router for KBN.
 * Handles all route protection, redirection, and layout logic.
 * @returns {JSX.Element}
 */

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className='auth-layout'>{children}</div>
);

export const AppRouter: React.FC = () => {
  const { userProfile, isLoading, isProfileComplete } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner />;

  // Root redirect logic
  const getRootRedirect = () => {
    return <Navigate to={getUserHomePath(userProfile, isProfileComplete)} replace />;
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Auth and public routes */}
        <Route path='/login' element={<Navigate to='/auth/login' replace />} />
        <Route path='/signup' element={<Navigate to='/auth/signup' replace />} />
        <Route path='/reset-password' element={<Navigate to='/auth/reset-password' replace />} />
        <Route
          path='/auth'
          element={
            <PublicOnlyRoute>
              <AuthLayout>
                <Outlet />
              </AuthLayout>
            </PublicOnlyRoute>
          }
        >
          <Route index element={<Navigate to='/auth/login' replace />} />
          <Route path='login' element={<LoginPage />} />
          <Route path='signup' element={<RegisterPage />} />
          <Route path='reset-password' element={<ForgotPasswordPage />} />
          <Route path='verification' element={<div>{t('auth.verificationPage')}</div>} />
        </Route>

        <Route
          path='/pending'
          element={
            <PendingGuard>
              <PendingPage />
            </PendingGuard>
          }
        />
        <Route
          path='/complete-profile'
          element={
            <ProfileGuard>
              <CompleteProfilePage />
            </ProfileGuard>
          }
        />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* 1. Root path: / */}
          <Route index element={getRootRedirect()} />
          <Route path='/personal-profile' element={<PersonalProfile />} />
          <Route
            path='/overview'
            element={
              <PermissionProtectedRoute
                fallbackPath='/dashboard'
                allowedRoles={getAllowedRolesByCategory(RoleCategory.EXECUTIVE)}
              >
                <Overview />
              </PermissionProtectedRoute>
            }
          />
          <Route
            path='/dashboard'
            element={
              <PermissionProtectedRoute
                fallbackPath='/dashboard'
                allowedRoles={getAllowedRolesByCategory(RoleCategory.GENERAL_MANAGER)}
              >
                <Dashboard />
              </PermissionProtectedRoute>
            }
          />
          <Route path='/landing' element={<Landing />} />
          <Route
            path='/account/*'
            element={
              <PermissionProtectedRoute
                requiredPermission={PERMISSIONS.VIEW_ACCOUNTS}
                fallbackPath='/dashboard'
                allowedRoles={getAllowedRolesByCategory(RoleCategory.GENERAL_MANAGER)}
              >
                <Account />
              </PermissionProtectedRoute>
            }
          >
            <Route index element={<Account />} />
            <Route path='income/*' element={<Income />} />
            <Route path='expense/*' element={<Expense />} />
          </Route>
          <Route
            path='/reports'
            element={
              <PermissionProtectedRoute
                requiredPermission={PERMISSIONS.REPORT_VIEW}
                fallbackPath='/dashboard'
                provinceCheck={() => true}
                allowedRoles={getAllowedRolesByCategory(RoleCategory.GENERAL_MANAGER)}
              >
                <ProvinceReports />
              </PermissionProtectedRoute>
            }
          />

          <Route path='/admin/*'>{AdminRoutes}</Route>

          {/* HR routes */}
          <Route
            path='/hr/*'
            element={
              <PermissionProtectedRoute
                requiredPermission={PERMISSIONS.EMPLOYEE_VIEW}
                fallbackPath='/dashboard'
                allowedRoles={getAllowedRolesByCategory(RoleCategory.GENERAL_MANAGER)}
              >
                <HRModules />
              </PermissionProtectedRoute>
            }
          />

          {/* 2. Province path: /:provinceId */}
          <Route
            path='/:provinceId'
            element={
              <ProvinceGuard>
                <ProvinceLayout />
              </ProvinceGuard>
            }
          >
            <Route
              index
              path='dashboard'
              element={
                <PermissionProtectedRoute
                  fallbackPath='/dashboard'
                  allowedRoles={getAllowedRolesByCategory(RoleCategory.PROVINCE_MANAGER)}
                >
                  <ProvinceDashboard />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path='account'
              element={
                <PermissionProtectedRoute
                  requiredPermission={PERMISSIONS.VIEW_ACCOUNTS}
                  fallbackPath='/dashboard'
                  allowedRoles={getAllowedRolesByCategory(RoleCategory.PROVINCE_MANAGER)}
                >
                  <AccountProvince />
                </PermissionProtectedRoute>
              }
            >
              <Route index element={<AccountProvince />} />
              <Route path='income/*' element={<IncomeProvince />} />
              <Route path='expense/*' element={<ExpenseProvince />} />
              <Route path='input-price/*' element={<InputPriceWrapper />} />
            </Route>
            <Route
              path='reports'
              element={
                <PermissionProtectedRoute
                  requiredPermission={PERMISSIONS.REPORT_VIEW}
                  fallbackPath='/dashboard'
                  provinceCheck={() => true}
                  allowedRoles={getAllowedRolesByCategory(RoleCategory.PROVINCE_MANAGER)}
                >
                  <ProvinceReports />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path='settings'
              element={
                <PermissionProtectedRoute
                  requiredPermission={PERMISSIONS.SYSTEM_SETTINGS_VIEW}
                  fallbackPath='/dashboard'
                  provinceCheck={() => true}
                  allowedRoles={getAllowedRolesByCategory(RoleCategory.PROVINCE_MANAGER)}
                >
                  <ProvinceSettings />
                </PermissionProtectedRoute>
              }
            />

            {/* HR routes for province context */}
            <Route
              path='hr/*'
              element={
                <PermissionProtectedRoute
                  requiredPermission={PERMISSIONS.EMPLOYEE_VIEW}
                  fallbackPath='/dashboard'
                  allowedRoles={getAllowedRolesByCategory(RoleCategory.PROVINCE_MANAGER)}
                >
                  <HRModules />
                </PermissionProtectedRoute>
              }
            />

            {/* 3. Branch path: /:provinceId/:branchCode */}
            <Route
              path=':branchCode'
              element={
                <BranchGuard>
                  <BranchLayout />
                </BranchGuard>
              }
            >
              <Route
                index
                path='dashboard'
                element={
                  <PermissionProtectedRoute
                    fallbackPath='/dashboard'
                    allowedRoles={getAllowedRolesByCategory(RoleCategory.BRANCH_MANAGER)}
                  >
                    <BranchDashboard />
                  </PermissionProtectedRoute>
                }
              />
              <Route
                path='account'
                element={
                  <PermissionProtectedRoute
                    requiredPermission={PERMISSIONS.VIEW_ACCOUNTS}
                    fallbackPath='/dashboard'
                    allowedRoles={getAllowedRolesByCategory(RoleCategory.BRANCH_MANAGER)}
                  >
                    <AccountBranch />
                  </PermissionProtectedRoute>
                }
              >
                <Route index element={<AccountBranch />} />
                <Route path='income/*' element={<IncomeBranch />} />
                <Route path='expense/*' element={<ExpenseBranch />} />
                <Route path='input-price/*' element={<InputPriceWrapper />} />
              </Route>

              <Route
                path='reports'
                element={
                  <PermissionProtectedRoute
                    requiredPermission={PERMISSIONS.REPORT_VIEW}
                    fallbackPath='/dashboard'
                    provinceCheck={() => true}
                    allowedRoles={getAllowedRolesByCategory(RoleCategory.BRANCH_MANAGER)}
                  >
                    <BranchReports />
                  </PermissionProtectedRoute>
                }
              />

              {/* HR routes for branch context */}
              <Route
                path='hr/*'
                element={
                  <PermissionProtectedRoute
                    requiredPermission={PERMISSIONS.EMPLOYEE_VIEW}
                    fallbackPath='/dashboard'
                    allowedRoles={getAllowedRolesByCategory(RoleCategory.BRANCH_MANAGER)}
                  >
                    <HRModules />
                  </PermissionProtectedRoute>
                }
              />
            </Route>
          </Route>

          <Route path='/*'>{PrivateRoutes}</Route>
          <Route path='/about/system-overview' element={<SystemOverview />} />
        </Route>
        <Route path='/not-found' element={<NotFound />} />
        <Route path='*' element={<Navigate to='/not-found' replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
