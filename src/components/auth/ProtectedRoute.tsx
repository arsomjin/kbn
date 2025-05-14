import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoadingScreen from '../common/LoadingScreen';
import useRedirectLogic from '../../hooks/useRedirectLogic';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  requiresProfileComplete?: boolean;
  allowedRoles?: string[];
  minPrivilegeLevel?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresAuth = true,
  requiresProfileComplete = false,
  allowedRoles,
  minPrivilegeLevel,
}) => {
  const location = useLocation();
  const { t } = useTranslation();
  const { loading, redirectPath } = useRedirectLogic({
    requiresAuth,
    requiresProfileComplete,
    allowedRoles,
    minPrivilegeLevel,
  });

  const mounted = React.useRef(false);
  const [showLoading, setShowLoading] = React.useState(false);

  React.useEffect(() => {
    mounted.current = true;
    // Only show loading screen if loading takes more than 100ms
    // This prevents flash of loading screen for fast transitions
    const timer = setTimeout(() => {
      if (mounted.current && loading) {
        setShowLoading(true);
      }
    }, 100);

    return () => {
      mounted.current = false;
      clearTimeout(timer);
    };
  }, [loading]);

  // Don't render anything while doing initial permission check
  // This prevents flash of 404/unauthorized content
  if (loading && !showLoading) {
    return null;
  }

  if (loading) {
    return <LoadingScreen overlay tip={t('common:loading')} />;
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
