import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to='/' replace /> : <>{children}</>;
};
export default PublicOnlyRoute;
