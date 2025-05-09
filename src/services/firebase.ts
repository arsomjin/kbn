import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported, onMessage, Messaging, getToken } from 'firebase/messaging';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Use a guard to prevent multiple initializations (important for HMR/dev)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);

// Export a promise that resolves when persistence is set
export const authPersistenceReady = setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // Intentionally left blank: persistence set successfully
  })
  .catch(error => {
    console.error('Error setting persistence:', error);
  });

export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Singleton instance for messaging
let messagingInstance: Messaging | null = null;

// Initialize Firebase Cloud Messaging and export it if browser supports it
export const initializeMessaging = async () => {
  try {
    // If we already have an instance, return it
    if (messagingInstance) return messagingInstance;

    if (await isSupported()) {
      messagingInstance = getMessaging(app);

      // Send Firebase config to service worker
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();

          // Find the messaging service worker
          let messagingServiceWorker = registrations.find(
            reg => reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js')
          );

          // If no existing service worker is found, try to register it
          if (!messagingServiceWorker) {
            try {
              messagingServiceWorker = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            } catch (err) {
              console.error('Failed to register Firebase messaging service worker:', err);
            }
          }

          // If we have a service worker, send it the config
          if (messagingServiceWorker?.active) {
            messagingServiceWorker.active.postMessage({
              type: 'FIREBASE_CONFIG',
              config: firebaseConfig
            });
          }

          // Wait for the service worker to be ready before requesting permission
          await navigator.serviceWorker.ready;
        } catch (err) {
          console.error('Error setting up service worker for messaging:', err);
        }
      }

      // Set up foreground message handler for in-app notifications
      // This is only triggered when the app is in the foreground
      onMessage(messagingInstance, payload => {
        // Display a notification using the Notification API
        if (payload.notification) {
          const { title, body } = payload.notification;
          if (Notification.permission === 'granted') {
            new Notification(title || 'New notification', {
              body: body || '',
              icon: '/logo192.png',
              data: payload.data
            });
          }

          // Dispatch event for in-app notification display
          window.dispatchEvent(
            new CustomEvent('fcm-message', {
              detail: payload
            })
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
export const requestNotificationPermission = async (): Promise<{ granted: boolean; token?: string }> => {
  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      return { granted: false };
    }

    // Check if permission is already granted
    if (Notification.permission === 'granted') {
      // Try to get the FCM token if messaging is initialized
      if (messagingInstance) {
        try {
          const token = await getToken(messagingInstance, {
            vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
          });
          return { granted: true, token };
        } catch (err) {
          console.error('Error getting FCM token:', err);
          return { granted: true };
        }
      }
      return { granted: true };
    }

    // Request permission if not already granted or denied
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();

      if (permission === 'granted' && messagingInstance) {
        try {
          // Get FCM token after permission is granted
          const token = await getToken(messagingInstance, {
            vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
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

export default app;
