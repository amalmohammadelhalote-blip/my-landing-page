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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging (only if supported in browser environment)
let messaging = null;
try {
  messaging = getMessaging(app);
} catch (err) {
  console.warn("Firebase Messaging is not supported in this browser:", err);
}

export const getFcmToken = async () => {
  if (!messaging) return null;
  try {
    const token = await getToken(messaging, {
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
