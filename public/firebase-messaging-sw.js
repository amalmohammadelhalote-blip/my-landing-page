importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing the configuration
firebase.initializeApp({
  apiKey: "AIzaSyDYmcHb00xGY0WMOZ03ofUrFxhF7Qir-rQ",
  authDomain: "ecoshid-3b22c.firebaseapp.com",
  projectId: "ecoshid-3b22c",
  storageBucket: "ecoshid-3b22c.firebasestorage.app",
  messagingSenderId: "840010788462",
  appId: "1:840010788462:web:0d9f434ec7033b9769c07f",
  measurementId: "G-R5MY5F9NGF"
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
