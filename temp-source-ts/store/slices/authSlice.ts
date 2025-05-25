import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from 'firebase/auth';
import { Timestamp, FieldValue } from 'firebase/firestore';
import { UserProfile } from 'types/auth';
import { getUserProfile } from 'services/authService';
import { removeUndefinedFields } from 'utils/userTransform';

// [KBN migration] Remove Redux-based userProfile/permission logic: this slice is now obsolete for user profile/permissions.

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isProfileTransitioning: boolean;
}

const initialState: AuthState = {
  user: null,
  userProfile: null,
  loading: false,
  error: null,
  isProfileTransitioning: false
};

const convertTimestampToDate = (timestamp: Timestamp | Date | FieldValue | null | undefined): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date();
};

export const fetchUserProfile = createAsyncThunk('auth/fetchUserProfile', async (uid: string) => {
  const profile = await getUserProfile(uid);
  if (!profile) {
    throw new Error('User profile not found');
  }
  // Ensure all required properties are present
  const userProfile: UserProfile = {
    ...profile,
    permissions: profile.permissions || [],
    isProfileComplete: true,
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    email: profile.email,
    role: profile.role,
    requestedType: profile.requestedType,
    createdAt: convertTimestampToDate(profile.createdAt),
    updatedAt: convertTimestampToDate(profile.updatedAt)
  };
  return removeUndefinedFields(userProfile);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setUserProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.userProfile = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setProfileTransitioning: (state, action: PayloadAction<boolean>) => {
      state.isProfileTransitioning = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUserProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userProfile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user profile';
      });
  }
});

export const { setUser, setUserProfile, setLoading, setError, setProfileTransitioning } = authSlice.actions;
export default authSlice.reducer;
