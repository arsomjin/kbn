import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  UserCredential,
  EmailAuthProvider,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider,
} from 'firebase/auth';
import { auth, firestore } from './index';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  FieldValue,
} from 'firebase/firestore';
import { UserRole } from 'constants/roles';

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

/**
 * Types of users that can register
 * @typedef {'employee' | 'visitor'} UserRequestType
 */

/**
 * User profile - represents the user data stored in Firestore
 * @typedef {Object} UserProfile
 * @property {string} uid - User's unique identifier
 * @property {string} email - User's email address
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {string} role - User's role in the system
 * @property {UserRequestType} requestedType - Type of user registration
 */

// Simple in-memory cache to reduce Firestore reads
const userProfileCache = new Map();

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

/**
 * Register a new user with email and password
 *
 * @param email User email address
 * @param password User password
 * @param displayName User display name
 * @param requestedType Type of user ('employee' or 'visitor')
 * @param province Optional province/state
 * @param branch Optional branch office
 * @param department Optional department
 * @returns Promise resolving to UserCredential
 * @throws AuthError if registration fails
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

    // 1. Transform to User object
    const userObj = transformUserData(
      {
        ...userProfile,
        email: userProfile.email || '',
        phoneNumber: userProfile.phoneNumber || undefined,
      },
      user.uid,
      requestedType,
    );
    // 2. Transform to UserProfile
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
 *
 * @param email User email
 * @param password User password
 * @returns Promise resolving to UserCredential
 * @throws AuthError if sign in fails
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
 *
 * @returns Promise that resolves when sign out is complete
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
 *
 * @param skipCache Set to true to bypass cache and force database read
 * @returns Promise resolving to UserProfile or null if no user is authenticated
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
 *
 * @param uid User ID
 * @param skipCache Set to true to bypass cache and force database read
 * @returns Promise resolving to UserProfile or null if not found
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
 *
 * @param uid User ID
 * @param data Partial UserProfile with fields to update
 * @returns Promise that resolves when update is complete
 * @throws AuthError if update fails
 */
export const updateUserProfile = async (uid, data) => {
  try {
    // Remove fields that shouldn't be updated directly
    const { uid: _, createdAt, updatedAt, ...safeData } = data;

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
 *
 * @param email User email
 * @returns Promise that resolves when email is sent
 * @throws AuthError if sending fails
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
 *
 * @param callback Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Check if user has one of the specified roles
 *
 * @param user User object or null
 * @param requiredRole Single role or array of acceptable roles
 * @returns Promise resolving to boolean
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
 *
 * @param password Current user's password
 * @returns Promise resolving to UserCredential
 * @throws AuthError if reauthentication fails
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
 *
 * @param uid Optional user ID. If not provided, clears all cache
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
 *
 * @returns Promise resolving to UserCredential
 * @throws AuthError if sign in fails
 */
export const signInWithGoogle = async () => {
  try {
    console.log('[Auth Service] Starting Google sign-in process');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      // Request user to select an account
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
 * Used especially for social auth to check if profile setup is needed
 *
 * @param user Firebase User object
 * @returns Promise resolving to UserProfile if it exists, or null if it doesn't
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

/**
 * Transform user data to a standardized format
 */
const transformUserData = (data, uid, requestedType) => {
  return {
    ...data,
    uid,
    requestedType,
    isActive: true,
    lastLogin: Date.now(),
  };
};

/**
 * Remove undefined fields from an object
 */
const removeUndefinedFields = (obj) => {
  return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== undefined));
};
