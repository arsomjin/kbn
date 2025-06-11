/**
 * Firebase Node.js Setup for Migration Scripts
 * Compatible with Node.js environment using Firebase v7
 */

// Use Firebase v7 syntax for Node.js
const firebase = require('firebase/app');
require('firebase/firestore');
require('firebase/auth');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Firebase configuration using your existing credentials
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase app
let firebaseApp = null;

const initializeFirebase = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Check if Firebase is already initialized
    if (!firebase.apps.length) {
      firebaseApp = firebase.initializeApp(firebaseConfig);
    } else {
      firebaseApp = firebase.app();
    }
    
    console.log('🔥 Firebase v7 initialized successfully');
    console.log(`📊 Connected to project: ${firebaseConfig.projectId}`);
    return firebaseApp;
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    throw error;
  }
};

// Get Firestore instance
const getFirestore = () => {
  const app = initializeFirebase();
  return app.firestore();
};

// Export Firebase app and utilities
module.exports = {
  app: initializeFirebase(),
  firestore: getFirestore(),
  firebase,
  initializeFirebase,
  getFirestore
}; 