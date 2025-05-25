import { auth, db } from './index';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseErrorMessage, getFirebaseErrorDetails } from 'utils/firebaseErrorMessages';

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const isUserVerified = () => {
  const user = getCurrentUser();
  return user ? user.emailVerified : false;
};

export const getAuthError = (error) => {
  return getFirebaseErrorMessage(error);
};

export const getAuthErrorDetails = (error) => {
  return getFirebaseErrorDetails(error);
};

export const getFirebaseUserFromObject = (userObject) => {
  // Helper function to check if an object has a valid uid
  const hasValidUid = (obj) => obj && typeof obj.uid === 'string';

  // Find the first valid user object by checking common paths
  const mUser =
    [
      userObject,
      userObject?.User,
      userObject?.User?._user,
      userObject?._user,
      userObject?.user,
      userObject?.user?._user,
      userObject?.user?.User,
      userObject?.user?.User?._user,
    ].find(hasValidUid) || userObject;

  // Extract only the needed user properties
  const { uid, displayName, email, emailVerified, isAnonymous, phoneNumber, photoURL } = mUser;

  // Return standardized user object
  return {
    uid,
    displayName,
    email,
    emailVerified,
    isAnonymous,
    phoneNumber,
    photoURL,
  };
};
