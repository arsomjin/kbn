import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';

const ProfileGuard = ({ children }: { children: React.ReactNode }) => {
  const { hasNoProfile, isLoading, hydrated } = useAuth();
  const isProfileTransitioning = useSelector((state: any) => state.auth.isProfileTransitioning);
  console.log('PROFILE_GUARD:', { hasNoProfile, isLoading, hydrated, isProfileTransitioning });
  if (isLoading || isProfileTransitioning || !hydrated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size='large' />
      </div>
    );
  }
  return hasNoProfile ? <>{children}</> : <Navigate to='/' replace />;
};
export default ProfileGuard;
