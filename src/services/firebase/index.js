import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  browserLocalPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider,
  sendEmailVerification,
  signInWithPhoneNumber,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported, onMessage, getToken } from 'firebase/messaging';
import { isMobile, browserName, browserVersion, osName, osVersion } from 'react-device-detect';
import dayjs from 'dayjs';
import { store } from 'store';
import { showLog, showWarn, cleanValuesBeforeSave, appendArgumentsByArray } from 'utils/common';
import { UserRole } from 'constants/roles';

// Validate environment variables
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID',
];

const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Firebase configuration
export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase app
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const db = firestore; // Alias for backward compatibility

// Set auth persistence
export const authPersistenceReady = setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // Intentionally left blank: persistence set successfully
  })
  .catch((error) => {
    console.error('Error setting persistence:', error);
  });

// Singleton instance for messaging
let messagingInstance = null;

// Initialize Firebase Cloud Messaging
export const initializeMessaging = async () => {
  try {
    if (messagingInstance) return messagingInstance;

    if (await isSupported()) {
      messagingInstance = getMessaging(app);

      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          let messagingServiceWorker = registrations.find(
            (reg) => reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js'),
          );

          if (!messagingServiceWorker) {
            try {
              messagingServiceWorker = await navigator.serviceWorker.register(
                '/firebase-messaging-sw.js',
              );
            } catch (err) {
              console.error('Failed to register Firebase messaging service worker:', err);
            }
          }

          if (messagingServiceWorker?.active) {
            messagingServiceWorker.active.postMessage({
              type: 'FIREBASE_CONFIG',
              config: firebaseConfig,
            });
          }

          await navigator.serviceWorker.ready;
        } catch (err) {
          console.error('Error setting up service worker for messaging:', err);
        }
      }

      onMessage(messagingInstance, (payload) => {
        if (payload.notification) {
          const { title, body } = payload.notification;
          if (Notification.permission === 'granted') {
            new Notification(title || 'New notification', {
              body: body || '',
              icon: '/logo192.png',
              data: payload.data,
            });
          }

          window.dispatchEvent(
            new CustomEvent('fcm-message', {
              detail: payload,
            }),
          );
        }
      });

      return messagingInstance;
    }

    return null;
  } catch (err) {
    console.error('Error initializing Firebase messaging:', err);
    return null;
  }
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) {
      return { granted: false };
    }

    if (Notification.permission === 'granted') {
      if (messagingInstance) {
        try {
          const token = await getToken(messagingInstance, {
            vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
          });
          return { granted: true, token };
        } catch (err) {
          console.error('Error getting FCM token:', err);
          return { granted: true };
        }
      }
      return { granted: true };
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();

      if (permission === 'granted' && messagingInstance) {
        try {
          const token = await getToken(messagingInstance, {
            vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
          });
          return { granted: true, token };
        } catch (err) {
          console.error('Error getting FCM token after permission granted:', err);
          return { granted: true };
        }
      }

      return { granted: permission === 'granted' };
    }

    return { granted: false };
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { granted: false };
  }
};

// Authentication functions
export const signIn = async (email, password) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signUp = async (email, password) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    return await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    return await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

export const verifyEmail = async () => {
  try {
    return await sendEmailVerification(auth.currentUser);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Alias for backward compatibility
export const sendVerifyEmail = verifyEmail;

export const signInWithPhone = async (phoneNumber, appVerifier) => {
  try {
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  } catch (error) {
    console.error('Error signing in with phone:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const updateUserProfile = async (profile) => {
  try {
    await updateProfile(auth.currentUser, profile);
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Firestore operations
export const setDocument = async (collection, docId, data) => {
  try {
    return await setDoc(doc(firestore, collection, docId), data);
  } catch (error) {
    console.error('Error setting document:', error);
    throw error;
  }
};

// Alias for backward compatibility
export const setFirestore = setDocument;

export const addDocument = async (collection, data) => {
  try {
    return await addDoc(collection(firestore, collection), data);
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
};

export const updateDocument = async (collection, docId, data) => {
  try {
    return await updateDoc(doc(firestore, collection, docId), data);
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

// Alias for backward compatibility
export const updateFirestore = updateDocument;

export const deleteDocument = async (collection, docId) => {
  try {
    return await deleteDoc(doc(firestore, collection, docId));
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

export const getDocument = async (collection, docId) => {
  try {
    const docRef = doc(firestore, collection, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};

// Alias for backward compatibility
export const getFirestoreDoc = getDocument;

export const getCollection = async (collection, wheresArr, order, limited, isDec) => {
  try {
    let colRef = collection(firestore, collection);
    let args_arr = [colRef];

    if (wheresArr) {
      wheresArr.forEach((wh) => {
        args_arr = [...args_arr, where(wh[0], wh[1], wh[2])];
      });
    }

    if (order) {
      args_arr = [...args_arr, orderBy(order, isDec ? 'desc' : 'asc')];
    }

    if (limited) {
      args_arr = [...args_arr, limit(limited)];
    }

    let queryFn = appendArgumentsByArray(query, args_arr);
    let q = queryFn();
    let result = {};

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;

    querySnapshot.forEach((doc) => {
      result[doc.id] = doc.data();
    });

    return result;
  } catch (error) {
    console.error('Error getting collection:', error);
    throw error;
  }
};

// Alias for backward compatibility
export const getFirestoreCollection = getCollection;

export const checkDuplicateDocument = async (collection, docSnap) => {
  try {
    const wheres = Object.keys(docSnap).map((k) => [k, '==', docSnap[k]]);
    return await getCollection(collection, wheres);
  } catch (error) {
    console.error('Error checking duplicate document:', error);
    throw error;
  }
};

// User profile management
export const getUserProfile = async (uid, skipCache = false) => {
  try {
    return await getDocument('users', uid);
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfileData = async (uid, data) => {
  try {
    await updateDocument('users', uid, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile data:', error);
    throw error;
  }
};

// Error logging
export const addErrorLogs = async (error) => {
  try {
    if (!error) return false;

    const { USER } = store.getState().user;
    const collection =
      USER?.uid && auth.currentUser ? 'errors/auth/handler' : 'errors/no_auth/handler';

    showLog('addErrorLogs', error);
    const errorData = cleanValuesBeforeSave({
      ts: Date.now(),
      ...(USER?.uid &&
        auth.currentUser && {
          by: `${USER.firstName || ''} ${USER.lastName || ''}`,
          uid: USER.uid,
          email: USER.email,
        }),
      error: error || null,
      device: { isMobile, browserName, browserVersion, osName, osVersion },
      ...(error?.snap && { snap: error.snap }),
      ...(error?.module && { module: error.module }),
    });

    return await addDocument(collection, errorData);
  } catch (e) {
    console.warn(e);
    throw e;
  }
};

// Helper functions
export const getCurrentUser = () => auth.currentUser;
export const currentUser = getCurrentUser; // Alias for backward compatibility

export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const checkEmailVerification = async () => {
  try {
    const user = auth.currentUser;
    console.log('user', user);
    if (user) {
      await user.reload();
      return user.emailVerified;
    }
    return false;
  } catch (error) {
    console.error('Error checking email verification:', error);
    return false;
  }
};

export const reauthenticate = async (password) => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No authenticated user found');

    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    return true;
  } catch (error) {
    console.error('Error reauthenticating:', error);
    throw error;
  }
};

export default app;
