import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../constants/roles';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';

const PendingGuard = ({ children }: { children: React.ReactNode }) => {
  const { userProfile, isLoading, hydrated } = useAuth();
  const isProfileTransitioning = useSelector((state: any) => state.auth.isProfileTransitioning);
  console.log(
    '[PendingGuard] userProfile:',
    userProfile,
    'isLoading:',
    isLoading,
    'hydrated:',
    hydrated,
    'isProfileTransitioning:',
    isProfileTransitioning
  );

  if (isLoading || isProfileTransitioning || !hydrated) {
    console.log('[PendingGuard] Loading spinner');
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size='large' />
      </div>
    );
  }
  if (userProfile?.role === ROLES.PENDING) {
    console.log('[PendingGuard] Rendering children for PENDING role');
    return <>{children}</>;
  } else {
    console.log('[PendingGuard] Redirecting to /, userProfile.role:', userProfile?.role);
    return <Navigate to='/' replace />;
  }
};

export default PendingGuard;
