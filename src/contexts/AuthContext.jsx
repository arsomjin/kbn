import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { auth, firestore as db } from 'services/firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { LoadingSpinner } from 'components/common/LoadingSpinner';
import { removeUndefinedFields } from 'utils/userTransform';
import { getPrivilegeLevel } from 'utils/roleUtils';
import { isDev } from 'utils';

// interface AuthContextType {
//   user: User | null;
//   userProfile: UserProfile | null;
//   loading;
//   error: Error | null;
//   currentProvinceId | null;
//   isAuthenticated;
//   isProfileComplete;
//   hasProvinceAccess: (provinceId) => boolean;
//   hasBranchAccess: (branchCode) => boolean;
//   hasDepartmentAccess: (departmentCode) => boolean;
//   hasNoProfile;
//   isLoading;
//   login: (email, password) => Promise<void>;
//   loginWithGoogle: () => Promise<void>;
//   logout: () => Promise<void>;
//   updateProfile: (data: Partial<UserProfile>) => Promise<void>;
//   switchProvince: (provinceId) => Promise<void>;
//   refreshUserData: () => Promise<void>;
//   hasPermission: (permission) => boolean;
//   hasRole: (role | string[]) => boolean;
//   hasPrivilege: (role) => boolean;
//   resetAuthError: () => void;
//   shouldHideUserFromView: (targetUser: { email? | null; role }) => boolean;
// }

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);
  const [currentProvinceId, setCurrentProvinceId] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Separate effect for handling auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('[AuthContext] Auth state changed:', user?.uid);
      setUser(user);
      if (!user) {
        console.log('[AuthContext] No user, clearing profile');
        setUserProfile(null);
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
      (doc) => {
        console.log('[AuthContext] User profile updated:', doc.data());
        if (doc.exists()) {
          const isUserProfileComplete = Boolean(doc.data()?.firstName && doc.data()?.lastName);
          const profileData = {
            ...doc.data(),
            ...doc.data()?.auth,
            isProfileComplete: isUserProfileComplete,
          };
          console.log('[AuthContext] User profile data:', profileData);
          setUserProfile(profileData);
          // Update current province if available
          if (profileData?.provinceId) {
            setCurrentProvinceId(profileData.provinceId);
          }
        } else {
          console.log('[AuthContext] No profile found for user, creating initial profile');
          let initialUserData = {
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
              department: '',
            },
          };

          setUserProfile(removeUndefinedFields(initialUserData));
          setCurrentProvinceId(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('[AuthContext] Error listening to profile changes:', error);
        setLoading(false);
      },
    );

    return () => {
      console.log('[AuthContext] Cleaning up user profile listener');
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]); // Only re-run if user ID changes

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Login failed'));
      throw err;
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Google login failed'));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Logout failed'));
      throw err;
    }
  }, []);

  const updateProfile = useCallback(
    async (data) => {
      if (!user) throw new Error('No user logged in');
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          ...data,
          updatedAt: new Date(),
        });
        setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update profile'));
        throw err;
      }
    },
    [user],
  );

  const switchProvince = useCallback(
    async (provinceId) => {
      if (!(userProfile?.accessibleProvinceIds || []).includes(provinceId)) {
        throw new Error('User does not have access to this province');
      }
      setCurrentProvinceId(provinceId);
    },
    [userProfile?.accessibleProvinceIds],
  );

  const refreshUserData = useCallback(async () => {
    if (!user) return;
    setIsProfileLoading(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        setUserProfile(profileData);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh user data'));
    } finally {
      setIsProfileLoading(false);
    }
  }, [user]);

  const hasPermission = useCallback(
    (permission) => {
      return userProfile?.permissions?.includes(permission) ?? false;
    },
    [userProfile?.permissions],
  );

  /**
   * Checks if the user has any of the required permissions
   *
   * @param userPermissions Array of permission strings assigned to the user
   * @param requiredPermissions Array of permissions to check for
   * @returns boolean indicating if user has any of the required permissions
   */
  const hasAnyPermission = useCallback(
    (requiredPermissions) => {
      if (requiredPermissions.length === 0) {
        return false;
      }

      return requiredPermissions.some((permission) =>
        userProfile?.permissions?.includes(permission),
      );
    },
    [userProfile?.permissions],
  );

  const hasRole = useCallback(
    (role) => {
      if (Array.isArray(role)) {
        return role.includes(userProfile?.role ?? '');
      }
      return userProfile?.role === role;
    },
    [userProfile?.role],
  );

  /**
   * Helper function to check if a role has higher or equal privileges than another
   * @param userRole - The role of the current user
   * @param requiredRole - The role being checked against
   * @returns boolean indicating if the user has sufficient privileges
   */
  const hasPrivilege = useCallback(
    (requiredRole) => {
      const userRoleLevel = getPrivilegeLevel(userProfile?.role ?? '');
      const requiredRoleLevel = getPrivilegeLevel(requiredRole);

      // Lower numbers have higher privilege
      return userRoleLevel <= requiredRoleLevel;
    },
    [userProfile?.role],
  );

  /**
   * Check if a user should be hidden from the current user's view
   * @param currentUser - The currently logged in user
   * @param targetUser - The user being checked
   * @returns true if the target user should be hidden from current user
   */
  const shouldHideUserFromView = useCallback(
    (targetUser) => {
      console.log('[AuthContext] Checking if user should be hidden from view:', {
        targetUser,
        currentUser: userProfile,
      });
      if (!userProfile || !targetUser) {
        return false;
      }

      // If current user is not a developer but target user is a developer, hide the target user
      const currentUserIsDev = isDev({ email: userProfile.email || '', role: userProfile?.role });
      const targetUserIsDev = isDev({ email: targetUser.email || '', role: targetUser.role });

      return !currentUserIsDev && targetUserIsDev;
    },
    [userProfile],
  );

  const resetAuthError = useCallback(() => {
    setError(null);
  }, []);

  // Consider authenticated if we have a user, even if profile is still loading
  const isAuthenticated = !!user;

  const value = useMemo(
    () => ({
      // State
      user,
      userProfile,
      loading: loading || isProfileLoading,
      error,
      currentProvinceId,

      // Computed values
      isAuthenticated,
      isProfileComplete: userProfile?.isProfileComplete ?? false,
      hasProvinceAccess: (provinceId) => {
        return (
          !!(userProfile?.accessibleProvinceIds || []).includes(provinceId) ||
          (userProfile?.provinceId || '').includes(provinceId)
        );
      },
      hasBranchAccess: (branchCode) => {
        return userProfile?.employeeInfo?.branch === branchCode;
      },
      hasDepartmentAccess: (departmentCode) => {
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
      hasAnyPermission,
      hasPermission,
      hasRole,
      hasPrivilege,
      resetAuthError,
      shouldHideUserFromView,
    }),
    [
      user,
      userProfile,
      loading,
      isProfileLoading,
      error,
      currentProvinceId,
      isAuthenticated,
      login,
      loginWithGoogle,
      logout,
      updateProfile,
      switchProvince,
      refreshUserData,
      hasAnyPermission,
      hasPermission,
      hasRole,
      hasPrivilege,
      resetAuthError,
      shouldHideUserFromView,
    ],
  );

  console.log('[AuthContext] Render state:', {
    user: !!user,
    userProfile: userProfile ? 'exists' : null,
    loading,
    isProfileLoading,
    isAuthenticated,
  });

  if (loading || isProfileLoading) {
    return <LoadingSpinner />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
