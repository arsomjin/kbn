import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from 'config/firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { UserProfile } from 'types/auth';
import { LoadingSpinner } from 'components/common/LoadingSpinner';
import { ROLES, RoleType } from 'constants/roles';
import { transformUserData, transformToUserProfile, removeUndefinedFields } from 'utils/userTransform';
import { getPrivilegeLevel } from 'utils/roleUtils';
import { isDev } from 'utils';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  currentProvinceId: string | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  hasProvinceAccess: (provinceId: string) => boolean;
  hasBranchAccess: (branchCode: string) => boolean;
  hasDepartmentAccess: (departmentCode: string) => boolean;
  hasNoProfile: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  switchProvince: (provinceId: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
  hasPrivilege: (role: RoleType) => boolean;
  resetAuthError: () => void;
  shouldHideUserFromView: (targetUser: { email?: string | null; role: string }) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [currentProvinceId, setCurrentProvinceId] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Separate effect for handling auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      console.log('[AuthContext] Auth state changed:', user?.uid);
      setUser(user);
      if (!user) {
        console.log('[AuthContext] No user, clearing profile');
        setCurrentProvinceId(null);
        setLoading(false);
      }
    });

    return () => {
      console.log('[AuthContext] Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  // Add separate listener for user profile changes
  useEffect(() => {
    if (!user?.uid) return;

    console.log('[AuthContext] Setting up user profile listener for:', user.uid);
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      doc => {
        console.log('[AuthContext] User profile updated:', doc.data());
        if (doc.exists()) {
          const isUserProfileComplete = Boolean(doc.data()?.firstName && doc.data()?.lastName);
          const profileData = { ...doc.data(), ...doc.data()?.auth, isProfileComplete: isUserProfileComplete };
          console.log('[AuthContext] User profile data:', profileData);
          setUserProfile(profileData as UserProfile);
          // Update current province if available
          if (profileData?.provinceId) {
            setCurrentProvinceId(profileData.provinceId);
          }
        } else {
          console.log('[AuthContext] No profile found for user, creating initial profile');
          let initialUserData: UserProfile = {
            uid: user.uid,
            firstName: '',
            lastName: '',
            email: user.email,
            role: 'guest',
            requestedType: 'employee',
            createdAt: new Date(),
            updatedAt: new Date(),
            photoURL: user.photoURL,
            phoneNumber: user.phoneNumber,
            isProfileComplete: false,
            provinceId: '',
            accessibleProvinceIds: [],
            permissions: [],
            displayName: user.displayName,
            isEmailVerified: user.emailVerified,
            lastLogin: Date.now(),
            employeeInfo: {
              branch: '',
              employeeCode: '',
              department: ''
            }
          };

          setUserProfile(removeUndefinedFields(initialUserData));
          setCurrentProvinceId(null);
        }
        setLoading(false);
      },
      error => {
        console.error('[AuthContext] Error listening to profile changes:', error);
        setLoading(false);
      }
    );

    return () => {
      console.log('[AuthContext] Cleaning up user profile listener');
      unsubscribe();
    };
  }, [user?.uid]); // Only re-run if user ID changes

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Login failed'));
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Google login failed'));
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Logout failed'));
      throw err;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date()
      });
      setUserProfile((prev: any) => (prev ? { ...prev, ...data } : null));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      throw err;
    }
  };

  const switchProvince = async (provinceId: string) => {
    if (!(userProfile?.accessibleProvinceIds || []).includes(provinceId)) {
      throw new Error('User does not have access to this province');
    }
    setCurrentProvinceId(provinceId);
  };

  const refreshUserData = async () => {
    if (!user) return;
    setIsProfileLoading(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        setUserProfile(profileData);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh user data'));
    } finally {
      setIsProfileLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    return userProfile?.permissions?.includes(permission) ?? false;
  };

  const hasRole = (role: string | string[]): boolean => {
    if (Array.isArray(role)) {
      return role.includes(userProfile?.role ?? '');
    }
    return userProfile?.role === role;
  };

  /**
   * Helper function to check if a role has higher or equal privileges than another
   * @param userRole - The role of the current user
   * @param requiredRole - The role being checked against
   * @returns boolean indicating if the user has sufficient privileges
   */
  const hasPrivilege = (requiredRole: RoleType): boolean => {
    const userRoleLevel = getPrivilegeLevel(userProfile?.role ?? '');
    const requiredRoleLevel = getPrivilegeLevel(requiredRole);

    // Lower numbers have higher privilege
    return userRoleLevel <= requiredRoleLevel;
  };

  /**
   * Check if a user should be hidden from the current user's view
   * @param currentUser - The currently logged in user
   * @param targetUser - The user being checked
   * @returns true if the target user should be hidden from current user
   */
  const shouldHideUserFromView = (targetUser: { email?: string | null; role: string }): boolean => {
    console.log('[AuthContext] Checking if user should be hidden from view:', {
      targetUser,
      currentUser: userProfile
    });
    if (!userProfile || !targetUser) {
      return false;
    }

    // If current user is not a developer but target user is a developer, hide the target user
    const currentUserIsDev = isDev({ email: userProfile.email || '', role: userProfile.role });
    const targetUserIsDev = isDev({ email: targetUser.email || '', role: targetUser.role });

    return !currentUserIsDev && targetUserIsDev;
  };

  const resetAuthError = () => {
    setError(null);
  };

  // Consider authenticated if we have a user, even if profile is still loading
  const isAuthenticated = !!user;

  const value: AuthContextType = {
    // State
    user,
    userProfile,
    loading: loading || isProfileLoading,
    error,
    currentProvinceId,

    // Computed values
    isAuthenticated,
    isProfileComplete: userProfile?.isProfileComplete ?? false,
    hasProvinceAccess: (provinceId: string) => {
      return (
        !!(userProfile?.accessibleProvinceIds || []).includes(provinceId) ||
        (userProfile?.provinceId || '').includes(provinceId)
      );
    },
    hasBranchAccess: (branchCode: string) => {
      return userProfile?.employeeInfo?.branch === branchCode;
    },
    hasDepartmentAccess: (departmentCode: string) => {
      return userProfile?.employeeInfo?.department === departmentCode;
    },
    hasNoProfile: !userProfile,
    isLoading: loading || isProfileLoading,

    // Methods
    login,
    loginWithGoogle,
    logout,
    updateProfile,
    switchProvince,
    refreshUserData,
    hasPermission,
    hasRole,
    hasPrivilege,
    resetAuthError,
    shouldHideUserFromView
  };

  console.log('[AuthContext] Render state:', {
    user: !!user,
    userProfile,
    loading,
    isProfileLoading,
    isAuthenticated
  });

  if (loading || isProfileLoading) {
    return <LoadingSpinner />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
