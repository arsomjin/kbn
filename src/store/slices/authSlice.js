import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Timestamp } from 'firebase/firestore';
import { getUserProfile } from 'services/authService';
import { removeUndefinedFields } from 'utils/userTransform';

const initialState = {
  user: null,
  userProfile: null,
  loading: false,
  error: null,
  isProfileTransitioning: false
};

const convertTimestampToDate = (timestamp) => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date();
};

export const fetchUserProfile = createAsyncThunk('auth/fetchUserProfile', async (uid) => {
  const profile = await getUserProfile(uid);
  if (!profile) {
    throw new Error('User profile not found');
  }
  // Ensure all required properties are present
  const userProfile = {
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
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setUserProfile: (state, action) => {
      state.userProfile = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setProfileTransitioning: (state, action) => {
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