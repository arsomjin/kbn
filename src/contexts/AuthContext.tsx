import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from 'config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '@/types/auth';
import { LoadingSpinner } from 'components/common/LoadingSpinner';
import { ROLES } from 'constants/roles';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  currentProvinceId: string | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  hasProvinceAccess: (provinceId: string) => boolean;
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
  resetAuthError: () => void;
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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      setUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const profileData = userDoc.data() as UserProfile;
            setUserProfile(profileData);
            setCurrentProvinceId(profileData.defaultProvinceId || null);
          }
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to fetch user profile'));
        }
      } else {
        setUserProfile(null);
        setCurrentProvinceId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
      setUserProfile(prev => (prev ? { ...prev, ...data } : null));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      throw err;
    }
  };

  const switchProvince = async (provinceId: string) => {
    if (!userProfile?.provinceAccess.includes(provinceId)) {
      throw new Error('User does not have access to this province');
    }
    setCurrentProvinceId(provinceId);
  };

  const refreshUserData = async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        setUserProfile(profileData);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh user data'));
    }
  };

  const hasPermission = (permission: string): boolean => {
    return userProfile?.permissions.includes(permission) ?? false;
  };

  const hasRole = (role: string | string[]): boolean => {
    if (Array.isArray(role)) {
      return role.includes(userProfile?.role ?? '');
    }
    return userProfile?.role === role;
  };

  const resetAuthError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    // State
    user,
    userProfile,
    loading,
    error,
    currentProvinceId,

    // Computed values
    isAuthenticated: !!user,
    isProfileComplete: userProfile?.isProfileComplete ?? false,
    hasProvinceAccess: (provinceId: string) => !!userProfile?.provinceAccess?.includes(provinceId),
    hasNoProfile: !userProfile,
    isLoading: loading,

    // Methods
    login,
    loginWithGoogle,
    logout,
    updateProfile,
    switchProvince,
    refreshUserData,
    hasPermission,
    hasRole,
    resetAuthError
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
