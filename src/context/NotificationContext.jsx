import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { notificationService, normalizeListResponse } from '../api/services';
import { getFcmToken, onForegroundMessage } from '../firebase';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [promptOpen, setPromptOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  
  // Track last fetched notifications to detect new items and count them
  const lastFetchedIds = useRef(new Set());
  
  const tokenRegistered = useRef(false);
  const lastRegisteredToken = useRef(null);

  // Check if browser notifications are supported
  const isNotificationSupported = 'Notification' in window && 'serviceWorker' in navigator;

  // Fetch notifications from the backend
  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getMyNotifications();
      const list = normalizeListResponse(res);
      
      // Order list from newest to oldest
      const sortedList = [...list].sort(
        (a, b) => new Date(b.sentAt || b.createdAt) - new Date(a.sentAt || a.createdAt)
      );
      
      setNotifications(sortedList);

      // Determine unread count. If it's the first fetch, count all notifications.
      // Otherwise, count any notifications that are new since we last fetched.
      if (lastFetchedIds.current.size === 0) {
        // Count all if not opened notifications page yet
        const hasOpened = localStorage.getItem('ecoshid_notifications_page_opened') === 'true';
        if (!hasOpened) {
          setUnreadCount(sortedList.length);
        } else {
          // If they have opened it before, maybe check if there's any newer than the last viewed timestamp
          const lastViewed = localStorage.getItem('ecoshid_notifications_last_viewed') || 0;
          const newNotifs = sortedList.filter(
            n => new Date(n.sentAt || n.createdAt).getTime() > Number(lastViewed)
          );
          setUnreadCount(newNotifs.length);
        }
      } else {
        // Identify notifications not present in our previous fetch to light up the indicator
        const newNotifs = sortedList.filter(n => !lastFetchedIds.current.has(n._id));
        if (newNotifs.length > 0) {
          setUnreadCount(prev => prev + newNotifs.length);
        }
      }

      // Update ref set of fetched IDs
      sortedList.forEach(n => lastFetchedIds.current.add(n._id));
    } catch (err) {
      console.warn("Failed to fetch notifications:", err);
    }
  };

  // Register Token to Backend
  const registerTokenToBackend = async (token) => {
    // Prevent duplicate registrations for the same token
    if (lastRegisteredToken.current === token) return;

    try {
      await notificationService.registerToken({ token });
      console.log("Successfully registered FCM token to backend.");
      lastRegisteredToken.current = token;
      tokenRegistered.current = true;
    } catch (err) {
      console.error("Failed to register FCM token to backend:", err);
    }
  };

  // Enable notifications (Request permission, obtain token, register on backend)
  const enableNotifications = async () => {
    if (!isNotificationSupported) {
      console.warn("Notifications are not supported in this browser.");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getFcmToken();
        if (token) {
          await registerTokenToBackend(token);
          localStorage.setItem('ecoshid_notifications_enabled', 'true');
          return true;
        }
      } else {
        console.warn("Notification permission was denied/dismissed.");
      }
    } catch (err) {
      console.error("Error enabling notifications:", err);
    }
    
    // Fallback: set enabled state to false in case of failure or rejection
    localStorage.setItem('ecoshid_notifications_enabled', 'false');
    return false;
  };

  // Disable notifications
  const disableNotifications = async () => {
    localStorage.setItem('ecoshid_notifications_enabled', 'false');
    // Clear token on the backend
    await registerTokenToBackend("");
  };

  // Clear unread count (e.g. when opening notifications list)
  const clearUnread = () => {
    setUnreadCount(0);
    localStorage.setItem('ecoshid_notifications_page_opened', 'true');
    localStorage.setItem('ecoshid_notifications_last_viewed', String(Date.now()));
  };

  // Check on load if we need to prompt the user
  useEffect(() => {
    const checkPermissionState = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) return; // Only prompt logged-in users

      const prompted = localStorage.getItem('ecoshid_notifications_prompted') === 'true';
      const enabled = localStorage.getItem('ecoshid_notifications_enabled');

      if (!prompted && enabled === null) {
        // Show the prompt dialog
        setPromptOpen(true);
      } else if (enabled === 'true' && isNotificationSupported) {
        // Register token if already enabled previously
        const currentPermission = Notification.permission;
        if (currentPermission === 'granted') {
          const token = await getFcmToken();
          if (token) {
            registerTokenToBackend(token);
          }
        }
      }
    };

    checkPermissionState();
  }, []);

  // Poll notifications periodically to update the in-app bell indicator (lights up)
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) return;

    fetchNotifications(); // Fetch initially

    // Setup polling every 45 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  // Register the foreground FCM message listener
  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload) => {
      console.log("Received foreground FCM message:", payload);
      
      // Update notifications list
      fetchNotifications();

      // Show in-app Toast notification
      if (payload.notification) {
        setToastMessage({
          title: payload.notification.title,
          body: payload.notification.body,
          id: Date.now()
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        promptOpen,
        setPromptOpen,
        toastMessage,
        setToastMessage,
        enableNotifications,
        disableNotifications,
        fetchNotifications,
        clearUnread,
        isNotificationSupported
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
