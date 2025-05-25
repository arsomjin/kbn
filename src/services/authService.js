import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth, firestore } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserRole } from '../constants/roles';
import { removeUndefinedFields, transformUserData } from '../utils/userTransform';

/**
 * Custom error class for authentication related errors
 */
export class AuthError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = 'AuthError';
  }
}

// Simple in-memory cache to reduce Firestore reads
const userProfileCache = new Map();

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

/**
 * Register a new user with email and password
 */
export const registerUser = async (
  email,
  password,
  displayName,
  firstName,
  lastName,
  userType,
  province,
  branch,
  department,
  employeeId,
  phoneNumber,
  purpose,
  requestedType,
) => {
  // Input validation
  if (!email || !password || !displayName) {
    throw new AuthError('Email, password, and display name are required', 'auth/invalid-input');
  }

  if (!email.includes('@')) {
    throw new AuthError('Invalid email format', 'auth/invalid-email-format');
  }

  if (password.length < 6) {
    throw new AuthError('Password should be at least 6 characters', 'auth/weak-password');
  }

  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('User registered:', user);
    // Create user profile in Firestore
    const userProfile = {
      uid: user.uid,
      firstName,
      lastName,
      email: user.email,
      role: UserRole.PENDING,
      requestedType,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      displayName,
    };

    // Only add optional fields if they're defined
    if (province) userProfile.province = province;
    if (branch) userProfile.branch = branch;
    if (department) userProfile.department = department;
    if (employeeId) userProfile.employeeId = employeeId;
    if (phoneNumber) userProfile.phoneNumber = phoneNumber;
    if (purpose) userProfile.purpose = purpose;

    // Transform to User object
    const userObj = transformUserData(
      {
        ...userProfile,
        email: userProfile.email || '',
        phoneNumber: userProfile.phoneNumber || undefined,
      },
      user.uid,
      requestedType,
    );

    // Transform to UserProfile
    const cleanedProfileData = removeUndefinedFields(userObj);
    await updateUserProfile(user.uid, cleanedProfileData);

    // Add to cache
    userProfileCache.set(user.uid, {
      profile: userProfile,
      timestamp: Date.now(),
    });

    return userCredential;
  } catch (error) {
    console.error('Error registering user:', error);
    throw new AuthError(
      error.message || 'Failed to register user',
      error.code || 'auth/unknown-error',
    );
  }
};

/**
 * Sign in an existing user with email and password
 */
export const signInUser = async (email, password) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error signing in:', error);
    throw new AuthError(error.message || 'Failed to sign in', error.code || 'auth/unknown-error');
  }
};

/**
 * Sign out the currently authenticated user
 */
export const signOutUser = async () => {
  try {
    const uid = auth.currentUser?.uid;
    await signOut(auth);

    // Clear cache for the signed out user
    if (uid) {
      userProfileCache.delete(uid);
    }
  } catch (error) {
    console.error('Error signing out:', error);
    throw new AuthError(error.message || 'Failed to sign out', error.code || 'auth/unknown-error');
  }
};

/**
 * Get the profile for the currently authenticated user
 */
export const getCurrentUserProfile = async (skipCache = false) => {
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  return getUserProfile(user.uid, skipCache);
};

/**
 * Get a user profile by user ID
 */
export const getUserProfile = async (uid, skipCache = false) => {
  // Check cache first unless skipCache is true
  if (!skipCache && userProfileCache.has(uid)) {
    const cached = userProfileCache.get(uid);
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRATION) {
      return cached.profile;
    }
  }

  try {
    const docRef = doc(firestore, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const profileData = docSnap.data();

      // Update cache
      userProfileCache.set(uid, {
        profile: profileData,
        timestamp: Date.now(),
      });

      return profileData;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Update a user's profile
 */
export const updateUserProfile = async (uid, data) => {
  try {
    // Remove fields that shouldn't be updated directly
    const { uid: _uid, ...safeData } = data;

    const userRef = doc(firestore, 'users', uid);

    // Use serverTimestamp for updatedAt to ensure accurate time even with poor client clocks
    await setDoc(
      userRef,
      {
        ...safeData,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    // Update cache or invalidate it
    userProfileCache.delete(uid);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new AuthError(
      error.message || 'Failed to update profile',
      error.code || 'auth/unknown-error',
    );
  }
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email) => {
  try {
    return await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset:', error);
    throw new AuthError(
      error.message || 'Failed to send password reset email',
      error.code || 'auth/unknown-error',
    );
  }
};

/**
 * Subscribe to authentication state changes
 */
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Check if user has one of the specified roles
 */
export const hasRole = async (user, requiredRole) => {
  if (!user) return false;

  try {
    const userProfile = await getUserProfile(user.uid);

    if (!userProfile) return false;

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userProfile.role);
    }

    return userProfile.role === requiredRole;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};

/**
 * Reauthenticate the current user (needed for sensitive operations)
 */
export const reauthenticateUser = async (password) => {
  const user = auth.currentUser;

  if (!user || !user.email) {
    throw new AuthError('No authenticated user found', 'auth/no-user');
  }

  try {
    const credential = EmailAuthProvider.credential(user.email, password);
    return await reauthenticateWithCredential(user, credential);
  } catch (error) {
    console.error('Error reauthenticating user:', error);
    throw new AuthError(
      error.message || 'Failed to reauthenticate',
      error.code || 'auth/unknown-error',
    );
  }
};

/**
 * Clear the user profile cache for a specific user or all users
 */
export const clearProfileCache = (uid) => {
  if (uid) {
    userProfileCache.delete(uid);
  } else {
    userProfileCache.clear();
  }
};

/**
 * Sign in with Google using a popup
 */
export const signInWithGoogle = async () => {
  try {
    console.log('[Auth Service] Starting Google sign-in process');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });
    const result = await signInWithPopup(auth, provider);
    console.log('[Auth Service] Google sign-in successful, user:', result.user.uid);

    // Check if this is a new user and create a profile if needed
    const existingProfile = await getUserProfile(result.user.uid, true); // Skip cache

    if (!existingProfile) {
      console.log('[Auth Service] Creating new profile for user:', result.user.uid);
      // Create a new profile with basic information from Google
      const userProfile = {
        uid: result.user.uid,
        firstName: result.user.displayName?.split(' ')[0] || '',
        lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
        email: result.user.email,
        role: UserRole.PENDING,
        requestedType: 'employee', // Default to employee
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        photoURL: result.user.photoURL,
        isEmailVerified: result.user.emailVerified,
        isActive: true,
        lastLogin: Date.now(),
        // Add default province access if needed
        accessibleProvinceIds: ['nakhon-ratchasima'], // Default province
      };

      // Save the profile to Firestore
      await setDoc(doc(firestore, 'users', result.user.uid), userProfile);
      console.log('[Auth Service] Created new profile for user:', result.user.uid);
    }

    return result;
  } catch (error) {
    console.error('[Auth Service] Google sign-in error:', error);
    throw new AuthError(
      error.message || 'Failed to sign in with Google',
      error.code || 'auth/google-sign-in-error',
    );
  }
};

/**
 * Checks if a user profile exists in Firestore
 */
export const createUserProfileIfNeeded = async (user) => {
  if (!user.uid) {
    console.error('[Auth Service] Cannot check profile: User ID is missing');
    return null;
  }

  try {
    console.log('[Auth Service] Checking for existing profile for user:', user.uid);
    // Check if a profile already exists
    const existingProfile = await getUserProfile(user.uid, true); // Skip cache

    if (existingProfile) {
      console.log('[Auth Service] Existing profile found for user:', user.uid);
      return existingProfile;
    }

    console.log('[Auth Service] No profile found for user:', user.uid);
    // No profile exists, clear any cached data
    userProfileCache.delete(user.uid);
    return null;
  } catch (error) {
    console.error('[Auth Service] Error checking user profile:', error);
    return null;
  }
};

// Create and export the authService object
const authService = {
  registerUser,
  signInUser,
  signOutUser,
  getCurrentUserProfile,
  getUserProfile,
  updateUserProfile,
  sendPasswordReset,
  subscribeToAuthChanges,
  hasRole,
  reauthenticateUser,
  clearProfileCache,
  signInWithGoogle,
  createUserProfileIfNeeded,
};

export default authService;
