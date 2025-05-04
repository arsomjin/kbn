import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  signInUser,
  signOutUser,
  getCurrentUserProfile,
  UserProfile,
  signInWithGoogle
} from '../../services/authService';

import { User } from 'firebase/auth';
import { UserRole } from '../../constants/roles';

// Define a serializable user type
interface SerializableUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// Convert Firebase User to serializable object
const convertUserToSerializable = (user: User | null): SerializableUser | null => {
  if (!user) return null;

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    phoneNumber: user.phoneNumber,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified
  };
};

// Types
type ProfileFetchStatus = 'idle' | 'pending' | 'succeeded' | 'failed';

interface AuthState {
  user: SerializableUser | null;
  userProfile: UserProfile | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  profileFetchStatus: ProfileFetchStatus;
  error: string | null;
  missingProfileUsers: string[];
  profileFetchAttempted: boolean;
  hydrated: boolean;
  isProfileTransitioning: boolean; // <--- NEW
  profileListenerActive: boolean; // <--- NEW
}

// Initial state
const initialState: AuthState = {
  user: null,
  userProfile: null,
  status: 'loading', // changed from 'idle' to 'loading'
  profileFetchStatus: 'idle',
  error: null,
  missingProfileUsers: [],
  profileFetchAttempted: false,
  hydrated: false, // <-- add this
  isProfileTransitioning: false, // <--- NEW
  profileListenerActive: false, // <--- NEW
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const userCredential = await signInUser(email, password);
      return convertUserToSerializable(userCredential.user);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to login');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await signOutUser();
    return null;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to logout');
  }
});

export const fetchUserProfile = createAsyncThunk('auth/fetchUserProfile', async (_, { rejectWithValue, getState }) => {
  try {
    // Get current auth state
    const state = getState() as { auth: AuthState };
    const user = state.auth.user;

    if (!user) {
      return null;
    }

    // Check if this user is known to have no profile
    if (state.auth.missingProfileUsers.includes(user.uid)) {
      console.log(`Skipping profile fetch for known missing profile user: ${user.uid}`);
      return null;
    }

    const profile = await getCurrentUserProfile();
    if (!profile) {
      console.log('No user profile found or profile fetch failed');
      // This is considered a successful API call with null result
      return null;
    }

    return profile;
  } catch (error: any) {
    console.error('Error in fetchUserProfile:', error);
    return rejectWithValue(error.message || 'Failed to fetch user profile');
  }
});

// Google Sign-in thunk
export const loginWithGoogleThunk = createAsyncThunk('auth/loginWithGoogle', async (_, { rejectWithValue }) => {
  try {
    const userCredential = await signInWithGoogle();
    return convertUserToSerializable(userCredential.user);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to login with Google');
  }
});

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = convertUserToSerializable(action.payload);
      state.status = 'idle';
      state.profileFetchAttempted = false;

      if (!action.payload) {
        state.userProfile = null;
        state.profileFetchStatus = 'idle';
      }
    },
    userProfileLoaded(state, action: PayloadAction<UserProfile | null>) {
      state.userProfile = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    setProfileFetchStatus(state, action: PayloadAction<ProfileFetchStatus>) {
      state.profileFetchStatus = action.payload;
    },
    addMissingProfileUser(state, action: PayloadAction<string>) {
      if (!state.missingProfileUsers.includes(action.payload)) {
        state.missingProfileUsers.push(action.payload);
      }
    },
    removeMissingProfileUser(state, action: PayloadAction<string>) {
      state.missingProfileUsers = state.missingProfileUsers.filter(uid => uid !== action.payload);
    },
    clearMissingProfileUsers(state) {
      state.missingProfileUsers = [];
    },
    setProfileFetchAttempted(state, action: PayloadAction<boolean>) {
      state.profileFetchAttempted = action.payload;
    },
    resetLoadingState(state) {
      console.log('Force resetting auth loading state');
      // If the status is stuck in loading, reset it to idle
      if (state.status === 'loading') {
        state.status = 'idle';
      }
      if (state.profileFetchStatus === 'pending') {
        state.profileFetchStatus = 'idle';
      }
      // Also clear any errors that might prevent UI from working
      state.error = null;
    },
    setHydrated(state, action: PayloadAction<boolean>) {
      state.hydrated = action.payload;
    },
    setProfileListenerActive(state, action: PayloadAction<boolean>) {
      state.profileListenerActive = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Login
      .addCase(loginUser.pending, state => {
        state.status = 'loading';
        state.error = null;
        state.profileFetchAttempted = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Logout
      .addCase(logoutUser.pending, state => {
        state.status = 'loading';
      })
      .addCase(logoutUser.fulfilled, state => {
        state.status = 'succeeded';
        state.user = null;
        state.userProfile = null;
        state.profileFetchStatus = 'idle';
        state.profileFetchAttempted = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Fetch user profile
      .addCase(fetchUserProfile.pending, state => {
        state.status = 'loading';
        state.profileFetchStatus = 'pending';
        state.profileFetchAttempted = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profileFetchStatus = 'succeeded';
        state.userProfile = action.payload;

        // If user exists but profile is null, add to missing profiles list
        if (state.user && !action.payload) {
          if (!state.missingProfileUsers.includes(state.user.uid)) {
            state.missingProfileUsers.push(state.user.uid);
          }
          console.log(`Added ${state.user.uid} to missing profiles list in Redux state`);
        }
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.profileFetchStatus = 'failed';
        state.error = action.payload as string;

        // If user exists but profile fetch failed, add to missing profiles list
        if (state.user) {
          if (!state.missingProfileUsers.includes(state.user.uid)) {
            state.missingProfileUsers.push(state.user.uid);
          }
        }
      })

      // Google Sign-in
      .addCase(loginWithGoogleThunk.pending, state => {
        state.status = 'loading';
        state.error = null;
        state.profileFetchAttempted = false;
      })
      .addCase(loginWithGoogleThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(loginWithGoogleThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  }
});

// Actions
export const {
  setUser,
  userProfileLoaded,
  clearError,
  setProfileFetchStatus,
  addMissingProfileUser,
  removeMissingProfileUser,
  clearMissingProfileUsers,
  setProfileFetchAttempted,
  resetLoadingState,
  setHydrated,
  setProfileListenerActive, // <--- NEW
} = authSlice.actions;

// Selector to check if user has a specific role
export const selectHasRole = (state: { auth: AuthState }, roles: UserRole | UserRole[]): boolean => {
  const { userProfile } = state.auth;

  if (!userProfile) return false;

  if (Array.isArray(roles)) {
    return (roles as (UserRole | string)[]).includes(userProfile.role);
  }

  return userProfile.role === roles;
};

export default authSlice.reducer;
