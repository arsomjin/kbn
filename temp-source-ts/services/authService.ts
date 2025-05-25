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
  OAuthProvider
} from 'firebase/auth';
import { auth, firestore } from './firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp, FieldValue } from 'firebase/firestore';
import { UserRole } from '../constants/roles';
import { removeUndefinedFields, transformUserData } from '../utils/userTransform';

/**
 * Custom error class for authentication related errors
 */
export class AuthError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'AuthError';
  }
}

/**
 * Types of users that can register
 */
export type UserRequestType = 'employee' | 'visitor';

/**
 * User profile interface - represents the user data stored in Firestore
 */
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
  createdAt: Date | Timestamp | FieldValue;
  updatedAt: Date | Timestamp | FieldValue;
  photoURL?: string | null;
  phoneNumber?: string | null;
  permissions?: string[]; // Add permissions field
  employeeId?: string; // For company employees
  company?: string; // For external visitors
  purpose?: string; // Purpose of visit for external visitors
  // displayName is deprecated, kept for backward compatibility
  displayName?: string | null;
  branchCode?: string;
  provinceId?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  lastLogin?: number;
  metadata?: Record<string, any>;
  // Province-related fields for multi-province support
  accessibleProvinceIds?: string[]; // Array of province IDs the user has access to
  employeeInfo?: {
    employeeCode: string;
    branch?: string;
    department?: string;
  };
  isProfileComplete?: boolean; // Flag to indicate if the profile is complete
}

// Simple in-memory cache to reduce Firestore reads
const userProfileCache = new Map<
  string,
  {
    profile: UserProfile;
    timestamp: number;
  }
>();

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
  email: string,
  password: string,
  displayName: string,
  firstName: string,
  lastName: string,
  userType: string,
  province: string | undefined,
  branch: string | undefined,
  department: string | undefined,
  employeeId: string | undefined,
  phoneNumber: string | undefined,
  purpose: string | undefined,
  requestedType: UserRequestType
): Promise<UserCredential> => {
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
    const userProfile: UserProfile = {
      uid: user.uid,
      firstName,
      lastName,
      email: user.email,
      role: UserRole.PENDING,
      requestedType,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      displayName
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
        phoneNumber: userProfile.phoneNumber || undefined
      },
      user.uid,
      requestedType
    );
    // 2. Transform to UserProfile
    const cleanedProfileData = removeUndefinedFields(userObj);
    await updateUserProfile(user.uid, cleanedProfileData);

    // Add to cache
    userProfileCache.set(user.uid, {
      profile: userProfile,
      timestamp: Date.now()
    });

    return userCredential;
  } catch (error: any) {
    console.error('Error registering user:', error);

    // Convert Firebase error to our custom error format
    throw new AuthError(error.message || 'Failed to register user', error.code || 'auth/unknown-error');
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
export const signInUser = async (email: string, password: string): Promise<UserCredential> => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw new AuthError(error.message || 'Failed to sign in', error.code || 'auth/unknown-error');
  }
};

/**
 * Sign out the currently authenticated user
 *
 * @returns Promise that resolves when sign out is complete
 */
export const signOutUser = async (): Promise<void> => {
  try {
    const uid = auth.currentUser?.uid;
    await signOut(auth);

    // Clear cache for the signed out user
    if (uid) {
      userProfileCache.delete(uid);
    }
  } catch (error: any) {
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
export const getCurrentUserProfile = async (skipCache = false): Promise<UserProfile | null> => {
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
export const getUserProfile = async (uid: string, skipCache = false): Promise<UserProfile | null> => {
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
      const profileData = docSnap.data() as UserProfile;

      // Update cache
      userProfileCache.set(uid, {
        profile: profileData,
        timestamp: Date.now()
      });

      return profileData;
    } else {
      return null;
    }
  } catch (error: any) {
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
export const updateUserProfile = async (
  uid: string,
  data: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    // Remove fields that shouldn't be updated directly
    const { uid: _, createdAt, updatedAt, ...safeData } = data as any;

    const userRef = doc(firestore, 'users', uid);

    // Use serverTimestamp for updatedAt to ensure accurate time even with poor client clocks
    await setDoc(
      userRef,
      {
        ...safeData,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    // Update cache or invalidate it
    userProfileCache.delete(uid);
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    throw new AuthError(error.message || 'Failed to update profile', error.code || 'auth/unknown-error');
  }
};

/**
 * Send password reset email
 *
 * @param email User email
 * @returns Promise that resolves when email is sent
 * @throws AuthError if sending fails
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    return await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Error sending password reset:', error);
    throw new AuthError(error.message || 'Failed to send password reset email', error.code || 'auth/unknown-error');
  }
};

/**
 * Subscribe to authentication state changes
 *
 * @param callback Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const subscribeToAuthChanges = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Check if user has one of the specified roles
 *
 * @param user User object or null
 * @param requiredRole Single role or array of acceptable roles
 * @returns Promise resolving to boolean
 */
export const hasRole = async (user: User | null, requiredRole: UserRole | UserRole[]): Promise<boolean> => {
  if (!user) return false;

  try {
    const userProfile = await getUserProfile(user.uid);

    if (!userProfile) return false;

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userProfile.role as UserRole);
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
export const reauthenticateUser = async (password: string): Promise<UserCredential> => {
  const user = auth.currentUser;

  if (!user || !user.email) {
    throw new AuthError('No authenticated user found', 'auth/no-user');
  }

  try {
    const credential = EmailAuthProvider.credential(user.email, password);
    return await reauthenticateWithCredential(user, credential);
  } catch (error: any) {
    console.error('Error reauthenticating user:', error);
    throw new AuthError(error.message || 'Failed to reauthenticate', error.code || 'auth/unknown-error');
  }
};

/**
 * Clear the user profile cache for a specific user or all users
 *
 * @param uid Optional user ID. If not provided, clears all cache
 */
export const clearProfileCache = (uid?: string): void => {
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
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    console.log('[Auth Service] Starting Google sign-in process');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      // Request user to select an account
      prompt: 'select_account'
    });
    const result = await signInWithPopup(auth, provider);
    console.log('[Auth Service] Google sign-in successful, user:', result.user.uid);

    // Check if this is a new user and create a profile if needed
    const existingProfile = await getUserProfile(result.user.uid, true); // Skip cache

    if (!existingProfile) {
      console.log('[Auth Service] Creating new profile for user:', result.user.uid);
      // Create a new profile with basic information from Google
      const userProfile: UserProfile = {
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
        accessibleProvinceIds: ['nakhon-ratchasima'] // Default province
      };

      // Save the profile to Firestore
      await setDoc(doc(firestore, 'users', result.user.uid), userProfile);
      console.log('[Auth Service] Created new profile for user:', result.user.uid);
    }

    return result;
  } catch (error: any) {
    console.error('[Auth Service] Google sign-in error:', error);
    throw new AuthError(error.message || 'Failed to sign in with Google', error.code || 'auth/google-sign-in-error');
  }
};

/**
 * Checks if a user profile exists in Firestore
 * Used especially for social auth to check if profile setup is needed
 *
 * @param user Firebase User object
 * @returns Promise resolving to UserProfile if it exists, or null if it doesn't
 */
export const createUserProfileIfNeeded = async (user: User): Promise<UserProfile | null> => {
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
  } catch (error: any) {
    console.error('[Auth Service] Error checking user profile:', error);
    return null;
  }
};
