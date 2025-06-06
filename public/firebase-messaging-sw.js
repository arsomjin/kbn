// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');
// importScripts('/__/firebase/init.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  apiKey: 'AIzaSyCatKsnoUUSran1l_twBre6mRYphy8wORA',
  authDomain: 'kubota-benjapol.firebaseapp.com',
  databaseURL: 'https://kubota-benjapol.firebaseio.com',
  projectId: 'kubota-benjapol',
  storageBucket: 'kubota-benjapol.appspot.com',
  messagingSenderId: '1001687608585',
  appId: '1:1001687608585:web:f32677be5c90545bd237d8',
  measurementId: 'G-GVZW2P4JKS'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.message;
  const notificationOptions = {
    body: payload.notification.description
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
