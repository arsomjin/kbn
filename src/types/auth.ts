import { User } from 'firebase/auth';
import { UserRole } from '../constants/roles';
import { UserRequestType } from '../services/authService';
import type { UserProfile } from '../services/authService';

export type { UserProfile };

export interface AuthContextType {
  // State
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  currentProvinceId: string | null;

  // Computed values
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  hasProvinceAccess: (provinceId: string) => boolean;
  hasNoProfile: boolean;
  isLoading: boolean;

  // Methods
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  switchProvince: (provinceId: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
  resetAuthError: () => void;
}
