// Firebase messaging service worker for handling background notifications

// Scripts for firebase and firebase messaging with cache busting
importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js?v=' + new Date().getTime());
importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging-compat.js?v=' + new Date().getTime());

// Initialize the Firebase app in the service worker
const firebaseConfig = {
  // Firebase config will be injected here at runtime from window.FIREBASE_CONFIG
};

let isFirebaseInitialized = false;

// Check if firebase config is injected from the main app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    // Only update config if Firebase isn't already initialized
    if (!isFirebaseInitialized) {
      Object.assign(firebaseConfig, event.data.config);
      initializeFirebase();
    }
  }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  // Get notification data
  const data = event.notification.data;
  let url = '/notifications';
  // If notification has a specific link, use it
  if (data && data.link) {
    url = data.link;
  }
  // Open or focus the client with the specified URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              notification: {
                id: data.id,
                url: url
              }
            });
            return;
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

function initializeFirebase() {
  // Only initialize once
  if (isFirebaseInitialized) {
    return;
  }

  if (Object.keys(firebaseConfig).length > 0) {
    try {
      // Check if Firebase is already initialized by checking for default app
      if (firebase.apps && firebase.apps.length > 0) {
        // If the config is different, log a warning
        const existingConfig = firebase.apps[0]?.options || {};
        const configString = JSON.stringify(firebaseConfig);
        const existingConfigString = JSON.stringify(existingConfig);
        if (configString !== existingConfigString) {
          console.warn('[firebase-messaging-sw.js] Firebase app already exists with different config. Using existing app.');
        }
        isFirebaseInitialized = true;
      } else {
        // Initialize new Firebase app
        firebase.initializeApp(firebaseConfig);
        isFirebaseInitialized = true;
      }
      
      // Retrieve an instance of Firebase Messaging
      const messaging = firebase.messaging();

      // Handle background messages
      messaging.onBackgroundMessage(payload => {
        
        // Extract notification data
        const notificationTitle = payload.notification?.title || 'New Notification';
        const notificationOptions = {
          body: payload.notification?.body || '',
          icon: '/logo192.png', // Use your app logo
          badge: '/logo192.png',
          data: payload.data || {},
          tag: payload.data?.id || 'default', // Use notification ID as tag to avoid duplicates
          // Add vibration pattern
          vibrate: [200, 100, 200],
          // Additional actions if needed
          actions: [
            { 
              action: 'view', 
              title: 'View' 
            }
          ]
        };
        
        // Show notification
        return self.registration.showNotification(notificationTitle, notificationOptions);
      });
    } catch (error) {
      console.error('[firebase-messaging-sw.js] Error initializing Firebase:', error);
    }
  } else {
    console.warn('[firebase-messaging-sw.js] Firebase config is empty, waiting for config message');
  }
}

// Check if we already have a config (injected by build script)
// Only initialize if we have config data and haven't initialized yet
if (!isFirebaseInitialized && Object.keys(firebaseConfig).length > 0) {
  initializeFirebase();
}