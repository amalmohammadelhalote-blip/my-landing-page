import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyADFXd6TwkXpSe2nVB5kVeI7td7uzMqkGA",
  authDomain: "ecoshid-328fd.firebaseapp.com",
  databaseURL: "https://ecoshid-328fd-default-rtdb.firebaseio.com",
  projectId: "ecoshid-328fd",
  storageBucket: "ecoshid-328fd.firebasestorage.app",
  messagingSenderId: "624103429256",
  appId: "1:624103429256:web:d9f20611bededdc4e9bb3d",
  measurementId: "G-T18TTWGC96"
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
      vapidKey: "BFkuhgYWS_Nosmw4_2Q9FZ1UYwJephZ4UiK1rWTDwsRce75j6KmOjfmqRfBq__l8Eg48AOGyA7DSlEBx9k0dA1M"
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
