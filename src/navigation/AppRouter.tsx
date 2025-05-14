import Dashboard from '../modules/dashboard/Dashboard';
import BranchDashboard from '../modules/dashboard/BranchDashboard';
import Landing from '../modules/dashboard/Landing';
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getLandingPage } from '../utils/roleUtils';

// Auth and layout components
import MainLayout from '../components/layout/MainLayout';
import NotFound from '../components/common/NotFound';
import { Spin, Card, Skeleton, Typography, Descriptions } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Role checking
import { RoleCategory, isInRoleCategory, ROLES, UserRole, RoleType } from '../constants/roles';
import { UserProfile } from '../services/authService';
import RoleCheck from '../modules/auth/RoleCheck';

// Route configurations
import { AdminRoutes } from './router/AdminRoutes';
import { PrivateRoutes } from './router/PrivateRoutes';
import ProfileGuard from './router/ProfileGuard';
import PendingGuard from './router/PendingGuard';
import PublicOnlyRoute from './router/PublicOnlyRoute';
import { useSelector } from 'react-redux';

// Lazy-loaded components
const LoginPage = lazy(() => import('../modules/auth/LoginPage'));
const RegisterPage = lazy(() => import('../modules/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../modules/auth/ForgotPasswordPage'));
const CreateProfilePage = lazy(() => import('../modules/auth/CreateProfilePage'));
const CompleteProfilePage = lazy(() => import('../modules/auth/CompleteProfilePage'));
const PendingPage = lazy(() => import('../modules/auth/PendingPage'));
const Overview = lazy(() => import('../modules/dashboard/Overview'));
const Profile = lazy(() => import('../pages/Profile'));

const About = () => (
  <div style={{ padding: '24px' }}>
    <Typography.Title level={2}>About</Typography.Title>
    <Card>
      <Typography.Paragraph>
        KBN Admin Dashboard is a comprehensive administrative solution for managing dairy farm operations.
      </Typography.Paragraph>
      <Typography.Paragraph>
        <Typography.Text strong>Version:</Typography.Text> 0.1.0
      </Typography.Paragraph>
    </Card>
  </div>
);

const Developer = () => (
  <div style={{ padding: '24px' }}>
    <Typography.Title level={2}>Developer Information</Typography.Title>
    <Card>
      <Descriptions title='Environment Details' bordered column={1}>
        <Descriptions.Item label='React Version'>19.1.0</Descriptions.Item>
        <Descriptions.Item label='Environment'>Development</Descriptions.Item>
        <Descriptions.Item label='Build Date'>{new Date().toLocaleDateString()}</Descriptions.Item>
      </Descriptions>
    </Card>
  </div>
);

const Logout = () => {
  // Placeholder logout component
  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Card className='text-center' style={{ maxWidth: 400 }}>
        <Spin size='large' />
        <Typography.Title level={4} style={{ marginTop: 16 }}>
          Logging out...
        </Typography.Title>
      </Card>
    </div>
  );
};

// Loading spinner component
const LoadingSpinner = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}
  >
    <Spin size='large' />
  </div>
);

// Component for auth layout
const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className='auth-layout'>{children}</div>
);

// RequireAuth component to protect routes
interface RequireAuthProps {
  children: React.ReactNode;
  allowPending?: boolean;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { isAuthenticated, isLoading, userProfile, hasNoProfile, hydrated } = useAuth();
  const isProfileTransitioning = useSelector((state: any) => state.auth.isProfileTransitioning);
  const location = window.location.pathname;

  console.log(
    '[RequireAuth] isAuthenticated:',
    isAuthenticated,
    'isLoading:',
    isLoading,
    'userProfile:',
    userProfile,
    'hasNoProfile:',
    hasNoProfile,
    'isProfileTransitioning:',
    isProfileTransitioning,
    'hydrated:',
    hydrated,
    'location:',
    location
  );

  if (isLoading || isProfileTransitioning || !hydrated) {
    console.log('[RequireAuth] Loading spinner');
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    console.log('[RequireAuth] Redirecting to /auth/login');
    return <Navigate to='/auth/login' replace />;
  }

  // If user has no profile and we're not on the complete-profile page, redirect them
  if (hasNoProfile && location !== '/complete-profile') {
    console.log('[RequireAuth] Redirecting to /complete-profile');
    return <Navigate to='/complete-profile' replace />;
  }

  // If user is PENDING, only allow access to /pending
  if (userProfile?.role === ROLES.PENDING && location !== '/pending') {
    console.log('[RequireAuth] Redirecting to /pending, userProfile.role:', userProfile?.role, 'location:', location);
    return <Navigate to='/pending' replace />;
  }

  console.log('[RequireAuth] Rendering children');
  return <>{children}</>;
};

// Private component for role-based access
interface PrivateProps {
  children: React.ReactNode;
  category: RoleCategory;
  fallback?: React.ReactNode;
}

const Private: React.FC<PrivateProps> = ({ children, category, fallback = <NotFound /> }) => {
  const { userProfile } = useAuth();
  console.log('PRIVATE:', { userProfile, category });
  if (!userProfile || !isInRoleCategory(userProfile.role as RoleType, category)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Helper to determine which dashboard to show based on user role
const getDashboardRoute = (userProfile: UserProfile | null) => {
  const landing = getLandingPage(userProfile);
  console.log('[getDashboardRoute] userProfile:', userProfile, 'landing:', landing);
  return <Navigate to={landing} replace />;
};

// Wrapper to delay dashboard redirect until profile is loaded
const DashboardRedirect = () => {
  const { userProfile, isLoading, hydrated } = useAuth();
  const isProfileTransitioning = useSelector((state: any) => state.auth.isProfileTransitioning);
  if (isLoading || isProfileTransitioning || !hydrated || !userProfile) {
    return <LoadingSpinner />;
  }
  return getDashboardRoute(userProfile);
};

// Main AppRouter component
const AppRouter: React.FC = () => {
  const { userProfile } = useAuth();
  console.log('[AppRouter] userProfile:', userProfile);
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Role Check route - implements post-authentication check as per app-flow */}
        <Route path='/role-check' element={<RoleCheck />} />

        {/* Redirect legacy auth routes to new /auth/* equivalents */}
        <Route path='/login' element={<Navigate to='/auth/login' replace />} />
        <Route path='/register' element={<Navigate to='/auth/signup' replace />} />
        <Route path='/forgot-password' element={<Navigate to='/auth/reset-password' replace />} />

        {/* Catch-all route */}
        <Route path='*' element={<NotFound />} />

        {/* Auth routes - public, block if already authenticated */}
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
          <Route path='login' element={<LoginPage />} />
          <Route path='signup' element={<RegisterPage />} />
          <Route path='reset-password' element={<ForgotPasswordPage />} />
          <Route path='verification' element={<div>Verification Page</div>} />
        </Route>

        {/* Logout route - protected */}
        <Route
          path='/logout'
          element={
            <RequireAuth>
              <Logout />
            </RequireAuth>
          }
        />

        {/* Pending page for users awaiting approval - only for PENDING users */}
        <Route
          path='/pending'
          element={
            <PendingGuard>
              <PendingPage />
            </PendingGuard>
          }
        />

        {/* Complete profile page for users who need to complete their profile - only for users with incomplete profile */}
        <Route
          path='/complete-profile'
          element={
            <ProfileGuard>
              <CompleteProfilePage />
            </ProfileGuard>
          }
        />

        {/* Overview page for privilege users only */}
        <Route
          path='/overview'
          element={
            <RequireAuth>
              <Private category={RoleCategory.PRIVILEGE}>
                <Overview />
              </Private>
            </RequireAuth>
          }
        />

        {/* Protected routes in main layout */}
        <Route
          path='/'
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }
        >
          {/* Index route - conditionally redirect based on role, but only after profile is loaded */}
          <Route index element={<DashboardRedirect />} />

          {/* Landing page - accessible to all authenticated users with assigned roles */}
          <Route path='landing' element={<Landing />} />

          {/* Dashboard - only for province managers or higher */}
          <Route
            path='dashboard'
            element={
              <Private category={RoleCategory.PROVINCE_MANAGER}>
                <Dashboard />
              </Private>
            }
          />

          {/* Branch Dashboard - only for branch managers or higher */}
          <Route
            path='branch-dashboard'
            element={
              <Private category={RoleCategory.BRANCH_MANAGER}>
                <BranchDashboard />
              </Private>
            }
          />

          {/* Profile page - any authenticated user */}
          <Route 
            path='profile' 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Profile />
              </Suspense>
            } 
          />

          {/* About page - any authenticated user */}
          <Route path='about' element={<About />} />

          {/* Developer page - only developer roles */}
          <Route
            path='developer'
            element={
              <Private category={RoleCategory.DEVELOPER}>
                <Developer />
              </Private>
            }
          />

          {/* Admin routes - only admin roles */}
          <Route path='admin'>
            {AdminRoutes.map(route => (
              <Route
                key={route.key}
                path={route.props.path}
                element={<Private category={RoleCategory.PROVINCE_ADMIN}>{route.props.element}</Private>}
              />
            ))}
          </Route>

          {/* Private routes - only privilege roles */}
          {PrivateRoutes.map(route => (
            <Route
              key={route.key}
              path={route.props.path}
              element={<Private category={RoleCategory.PRIVILEGE}>{route.props.element}</Private>}
            />
          ))}
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
