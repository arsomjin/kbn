import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { ROLES } from '../../constants/roles';
import { useSelector } from 'react-redux';
import { LoadingSpinner } from 'components/common/LoadingSpinner';

const PendingGuard = ({ children }: { children: React.ReactNode }) => {
  const { userProfile, isLoading } = useAuth();
  const isProfileTransitioning = useSelector((state: any) => state.auth.isProfileTransitioning);

  if (isLoading || isProfileTransitioning) {
    return <LoadingSpinner />;
  }
  if (userProfile?.role === ROLES.PENDING) {
    return <>{children}</>;
  } else {
    return <Navigate to='/' replace />;
  }
};

export default PendingGuard;
