// Safe access to process.env with fallbacks
const safeEnv = (typeof process !== 'undefined' && process.env) || {};

export default {
  apiKey: safeEnv.REACT_APP_FIREBASE_API_KEY,
  authDomain: safeEnv.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: safeEnv.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: safeEnv.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: safeEnv.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: safeEnv.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: safeEnv.REACT_APP_FIREBASE_APP_ID,
  measurementId: safeEnv.REACT_APP_FIREBASE_MEASUREMENT_ID
};

export const vapidKey = safeEnv.REACT_APP_FIREBASE_VAPID_KEY;
