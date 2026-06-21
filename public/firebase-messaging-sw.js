importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing the configuration
firebase.initializeApp({
  apiKey: "AIzaSyADFXd6TwkXpSe2nVB5kVeI7td7uzMqkGA",
  authDomain: "ecoshid-328fd.firebaseapp.com",
  databaseURL: "https://ecoshid-328fd-default-rtdb.firebaseio.com",
  projectId: "ecoshid-328fd",
  storageBucket: "ecoshid-328fd.firebasestorage.app",
  messagingSenderId: "624103429256",
  appId: "1:624103429256:web:d9f20611bededdc4e9bb3d",
  measurementId: "G-T18TTWGC96"
});

// Retrieve an instance of Firebase Cloud Messaging.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);

  const notificationTitle = payload.notification?.title || 'ECOSHIED Alert';
  const notificationOptions = {
    body: payload.notification?.body || 'New message from ECOSHIED.',
    icon: '/default-device.svg',
    badge: '/default-device.svg',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
