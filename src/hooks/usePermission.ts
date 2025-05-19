import { useAuth } from 'contexts/AuthContext';

export const usePermission = () => {
  const { hasPermission } = useAuth();

  return {
    hasPermission
  };
};
