import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { notificationService, normalizeListResponse } from '../api/services';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [promptOpen, setPromptOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const lastFetchedIds = useRef(new Set());

  const isNotificationSupported = 'Notification' in window;

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getMyNotifications();
      const list = normalizeListResponse(res);

      const sortedList = [...list].sort(
        (a, b) => new Date(b.sentAt || b.createdAt) - new Date(a.sentAt || a.createdAt)
      );

      // Check for new notifications (to show browser notification)
      if (lastFetchedIds.current.size > 0) {
        const newNotifs = sortedList.filter(n => !lastFetchedIds.current.has(n._id));
        if (newNotifs.length > 0 && Notification.permission === 'granted') {
          newNotifs.forEach(n => {
            try {
              new Notification(n.title || 'ECOSHIED Alert', {
                body: n.body || '',
                icon: '/default-device.svg',
              });
            } catch (_) {}
          });
        }
      }

      setNotifications(sortedList);

      if (lastFetchedIds.current.size === 0) {
        const hasOpened = localStorage.getItem('ecoshid_notifications_page_opened') === 'true';
        if (!hasOpened) {
          setUnreadCount(sortedList.length);
        } else {
          const lastViewed = localStorage.getItem('ecoshid_notifications_last_viewed') || 0;
          const newNotifs = sortedList.filter(
            n => new Date(n.sentAt || n.createdAt).getTime() > Number(lastViewed)
          );
          setUnreadCount(newNotifs.length);
        }
      } else {
        const newNotifs = sortedList.filter(n => !lastFetchedIds.current.has(n._id));
        if (newNotifs.length > 0) {
          setUnreadCount(prev => prev + newNotifs.length);
        }
      }

      sortedList.forEach(n => lastFetchedIds.current.add(n._id));
    } catch (err) {
      console.warn("Failed to fetch notifications:", err);
    }
  };

  const enableNotifications = async () => {
    if (!isNotificationSupported) return false;
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        localStorage.setItem('ecoshid_notifications_enabled', 'true');
        return true;
      }
    } catch (err) {
      console.error("Error enabling notifications:", err);
    }
    localStorage.setItem('ecoshid_notifications_enabled', 'false');
    return false;
  };

  const disableNotifications = async () => {
    localStorage.setItem('ecoshid_notifications_enabled', 'false');
  };

  const clearUnread = () => {
    setUnreadCount(0);
    localStorage.setItem('ecoshid_notifications_page_opened', 'true');
    localStorage.setItem('ecoshid_notifications_last_viewed', String(Date.now()));
  };

  // Check on load if we need to prompt the user
  useEffect(() => {
    const checkPermissionState = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) return;

      const prompted = localStorage.getItem('ecoshid_notifications_prompted') === 'true';
      const enabled = localStorage.getItem('ecoshid_notifications_enabled');

      if (!prompted && enabled === null) {
        setPromptOpen(true);
      }
    };

    checkPermissionState();
  }, []);

  // Poll notifications periodically
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) return;

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 45000);

    return () => clearInterval(interval);
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
