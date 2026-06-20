import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDYmcHb00xGY0WMOZ03ofUrFxhF7Qir-rQ",
  authDomain: "ecoshid-3b22c.firebaseapp.com",
  projectId: "ecoshid-3b22c",
  storageBucket: "ecoshid-3b22c.firebasestorage.app",
  messagingSenderId: "840010788462",
  appId: "1:840010788462:web:0d9f434ec7033b9769c07f",
  measurementId: "G-R5MY5F9NGF"
};

const app = initializeApp(firebaseConfig);

let messaging = null;
let swRegistration = null;

// Register the Firebase service worker once
const registerServiceWorker = async () => {
  if (swRegistration) return swRegistration;
  if (!('serviceWorker' in navigator)) return null;
  try {
    swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    return swRegistration;
  } catch (err) {
    console.warn('Firebase SW registration failed:', err);
    return null;
  }
};

const initMessaging = async () => {
  if (messaging) return messaging;
  try {
    await registerServiceWorker();
    messaging = getMessaging(app);
    return messaging;
  } catch (err) {
    console.warn('Firebase Messaging init failed:', err);
    return null;
  }
};

export const getFcmToken = async () => {
  const msg = await initMessaging();
  if (!msg) return null;
  try {
    const token = await getToken(msg, {
      vapidKey: "BABaiwokAUZB1M8x6JbxfH1jPwTrXsq7E2xU4-c595aAVVgvNflsl4TsE-ieDjW-i9B6lIJrRxPhDskyfL-CNYM"
    });
    return token;
  } catch (error) {
    console.error("Error retrieving FCM token:", error);
    return null;
  }
};

export const onForegroundMessage = (callback) => {
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
};

export { app, messaging };
