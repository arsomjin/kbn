import { useAppSelector } from '../store/hooks';

export const useUserProfile = () => {
  const userProfile = useAppSelector(state => state.auth.userProfile);
  return { userProfile };
};
