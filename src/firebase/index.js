import { createContext } from 'react';
import { app, auth, firestore, storage } from 'services/firebase';

// Create Firebase context
export const FirebaseContext = createContext({
  app,
  auth,
  firestore,
  storage,
  api: {}, // Legacy API object for backward compatibility
});

// Export db as alias for firestore for backward compatibility
export const db = firestore;

export default app;
