import { User } from 'firebase/auth';
import { UserRole } from '../constants/roles';
import { UserRequestType } from '../services/authService';

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string | null;
  role: UserRole | string;
  requestedType: UserRequestType;
  province?: string;
  branch?: string;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
  photoURL?: string | null;
  phoneNumber?: string | null;
  employeeId?: string;
  company?: string;
  purpose?: string;
  displayName?: string | null;
  branchCode?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  lastLogin?: number;
  metadata?: Record<string, any>;
  accessibleProvinceIds?: string[];
  isProfileComplete: boolean;
  provinceAccess: string[];
  provinceId?: string;
  permissions: string[];
}

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
