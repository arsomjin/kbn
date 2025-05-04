import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  setUser,
  fetchUserProfile,
  loginUser,
  logoutUser,
  clearError,
  setProfileFetchStatus,
  setProfileFetchAttempted,
  clearMissingProfileUsers,
  removeMissingProfileUser,
  resetLoadingState,
  setHydrated,
  loginWithGoogleThunk,
  setProfileListenerActive,
  userProfileLoaded
} from '../store/slices/authSlice';
import { subscribeToAuthChanges } from '../services/authService';
import { authPersistenceReady } from '../services/firebase';
import { subscribeToDocument } from '../utils/firestoreUtils';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, userProfile, status, error, profileFetchStatus, missingProfileUsers, profileFetchAttempted } =
    useSelector((state: RootState) => state.auth);
  const hydrated = useSelector((state: RootState) => state.auth.hydrated);

  // Use ref for tracking initialization to prevent unnecessary renders
  const initialized = useRef(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle potentially stuck loading state
  useEffect(() => {
    // If status is loading, set a timeout to reset it if it gets stuck
    if (status === 'loading') {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      loadingTimeoutRef.current = setTimeout(() => {
        console.log('Auth loading state timeout reached, forcing reset');
        dispatch(resetLoadingState());
      }, 10000); // 10 seconds timeout
    } else {
      // Clear timeout if status changed
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [status, dispatch]);

  // Subscribe to auth state changes and Firestore profile listener
  useEffect(() => {
    // Prevent multiple subscriptions and only run once
    if (initialized.current) return;
    initialized.current = true;

    let unsubscribeProfile: (() => void) | null = null;

    authPersistenceReady.then(() => {
      console.log('Setting up auth subscription');
      const unsubscribe = subscribeToAuthChanges(authUser => {
        console.log('Auth state changed:', authUser ? `User ${authUser.uid}` : 'No user');
        dispatch(setUser(authUser));
        dispatch(setHydrated(true));

        // Unsubscribe previous profile listener if any
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        dispatch(setProfileListenerActive(false));

        // Set up Firestore profile listener if user exists
        if (authUser) {
          unsubscribeProfile = subscribeToDocument(
            'users',
            authUser.uid,
            (profile) => {
              // Convert FirestoreDocument to UserProfile
              let userProfile: any = null;
              if (profile) {
                // Convert Firestore Timestamps to ISO string if present
                const convertTimestamp = (ts: any) => {
                  if (ts && typeof ts.toDate === 'function') {
                    return ts.toDate().toISOString();
                  }
                  return ts || null;
                };
                userProfile = {
                  uid: profile.uid || profile.id,
                  firstName: profile.firstName || '',
                  lastName: profile.lastName || '',
                  email: profile.email || null,
                  role: profile.role,
                  requestedType: profile.requestedType || 'employee',
                  province: profile.province,
                  branch: profile.branch,
                  department: profile.department,
                  createdAt: convertTimestamp(profile.createdAt),
                  updatedAt: convertTimestamp(profile.updatedAt),
                  photoURL: profile.photoURL || null,
                  phoneNumber: profile.phoneNumber || null,
                  customPermissions: profile.customPermissions || [],
                  employeeId: profile.employeeId,
                  company: profile.company,
                  purpose: profile.purpose,
                  displayName: profile.displayName || null
                };
              }
              dispatch(userProfileLoaded(userProfile));
              dispatch(setProfileListenerActive(true));
            }
          );
        }
      });
      // Cleanup subscription on component unmount
      return () => {
        console.log('Cleaning up auth subscription');
        unsubscribe();
        if (unsubscribeProfile) unsubscribeProfile();
        dispatch(setProfileListenerActive(false));
      };
    });
  }, [dispatch, profileFetchAttempted, missingProfileUsers]);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login...');
      // Reset the profile fetch status before login
      dispatch(setProfileFetchStatus('idle'));
      dispatch(setProfileFetchAttempted(false));

      return await dispatch(loginUser({ email, password })).unwrap();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Attempting logout...');
      // Reset the profile fetch status before logout
      dispatch(setProfileFetchStatus('idle'));
      dispatch(setProfileFetchAttempted(false));
      dispatch(clearMissingProfileUsers());

      return await dispatch(logoutUser()).unwrap();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const resetAuthError = () => {
    dispatch(clearError());
  };

  // Force profile fetch - useful for refreshing profile data
  const refreshUserProfile = () => {
    // Only allow fetch if listener is NOT active
    const state = (window as any).store?.getState?.();
    if (user && (!state || !state.auth?.profileListenerActive)) {
      console.log('Refreshing user profile (no listener active)');
      dispatch(setProfileFetchStatus('idle'));
      dispatch(setProfileFetchAttempted(false));
      if (user.uid) {
        dispatch(removeMissingProfileUser(user.uid));
      }
      dispatch(fetchUserProfile());
    } else {
      console.log('Skipped refreshUserProfile: listener is active');
    }
  };

  // Check if the user is authenticated but has no profile
  const hasNoProfile = !!(
    user &&
    profileFetchStatus === 'succeeded' &&
    !userProfile &&
    missingProfileUsers.includes(user.uid)
  );

  // Google sign-in method
  const loginWithGoogle = async () => {
    try {
      console.log('Attempting Google login...');
      // Reset the profile fetch status before login
      dispatch(setProfileFetchStatus('idle'));
      dispatch(setProfileFetchAttempted(false));

      return await dispatch(loginWithGoogleThunk()).unwrap();
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  return {
    user,
    userProfile,
    isAuthenticated: !!user,
    isLoading: status === 'loading' || profileFetchStatus === 'pending',
    hasNoProfile,
    error,
    login,
    logout,
    loginWithGoogle,
    resetAuthError,
    refreshUserProfile,
    hydrated
  };
};
