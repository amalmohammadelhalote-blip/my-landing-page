import React, { useEffect, useState } from 'react';
import { Bell, BellOff, AlertTriangle, AlertOctagon } from 'lucide-react';
import noNotificationsImg from "../assets/no notifications.png";
import { useNotification } from '../context/NotificationContext';
import { getFcmToken } from '../firebase';
import { notificationService } from '../api/services';
import ProfileMobileHeader from './profile/ProfileMobileHeader';
import './Notifications.css';

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} days ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} months ago`;
  return `${Math.floor(diffMonths / 12)} years ago`;
};

export default function Notifications() {
  const {
    notifications,
    fetchNotifications,
    clearUnread,
    isNotificationSupported
  } = useNotification();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pushEnabled, setPushEnabled] = useState(
    localStorage.getItem('ecoshid_notifications_enabled') === 'true'
  );

  useEffect(() => {
    // Clear unread badge when user opens this page
    clearUnread();

    const loadNotifications = async () => {
      try {
        setLoading(true);
        await fetchNotifications();
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, []);

  const handleTogglePush = async () => {
    const next = !pushEnabled;
    setPushEnabled(next);
    localStorage.setItem('ecoshid_notifications_enabled', String(next));
    if (next) {
      if ('Notification' in window && Notification.permission === 'default') {
        try { await Notification.requestPermission(); } catch (_) {}
      }
      try {
        const token = await getFcmToken();
        if (token) await notificationService.registerToken({ token });
      } catch (_) {}
    }
  };

  if (loading) {
    return (
      <div className="profile-sub-page">
        <ProfileMobileHeader title="Notifications" />
        <div className="notif-loading">
          <div className="notif-loading-spinner" />
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-sub-page">
      <ProfileMobileHeader title="Notifications" />

      {/* Push Notification Toggle */}
      {isNotificationSupported && (
        <div className="notif-push-toggle">
          <div className="notif-push-info">
            {pushEnabled ? <Bell size={20} /> : <BellOff size={20} />}
            <div>
              <h4>Push Notifications</h4>
              <p>{pushEnabled ? 'You will receive push alerts' : 'Push alerts are disabled'}</p>
            </div>
          </div>
          <button
            className={`notif-toggle-btn ${pushEnabled ? 'active' : ''}`}
            onClick={handleTogglePush}
          >
            <span className="notif-toggle-handle" />
          </button>
        </div>
      )}

      {error && <p className="dashboard-error">{error}</p>}

      {!error && notifications.length === 0 && (
        <div className="empty-state">
          <img src={noNotificationsImg} alt="No notifications" className="illustration notif-illustration" />
          <h2>No notifications yet</h2>
          <p className="empty-state-desc">When you receive alerts about your devices, they'll appear here.</p>
        </div>
      )}

      {!error && notifications.length > 0 && (
        <div className="notif-list">
          {notifications.map((n) => {
            const textToTest = (n.title + ' ' + (n.body || '')).toLowerCase();
            
            // Only accept known severity values from backend, otherwise detect from text
            const KNOWN_SEVERITIES = ['info', 'warning', 'critical', 'error', 'alert'];
            const rawSeverity = (n.severity || n.type || '').toLowerCase();
            
            let severity;
            if (KNOWN_SEVERITIES.includes(rawSeverity)) {
              severity = rawSeverity;
            } else if (/critical|danger|emergency|hazard|fault|failed|failure|abnormal|outside|threshold|exceed/i.test(textToTest)) {
              severity = 'critical';
            } else if (/warning|alert|limit|high/i.test(textToTest)) {
              severity = 'warning';
            } else {
              severity = 'info';
            }

            // Pick icon by severity
            let NotifIcon = Bell;
            if (severity === 'critical' || severity === 'error') {
              NotifIcon = AlertOctagon;
            } else if (severity === 'warning' || severity === 'alert') {
              NotifIcon = AlertTriangle;
            }

            return (
            <div key={n._id} className={`notif-card notif-card--${severity}`}>
              <div className="notif-card-left">
                <div className={`notif-icon notif-icon--${severity}`}>
                  <NotifIcon size={26} />
                </div>
              </div>
              <div className="notif-card-content">
                <h3 className="notif-card-title">{n.title}</h3>
                <p className="notif-card-desc">{n.body}</p>
              </div>
              <div className="notif-card-right">
                <span className="notif-card-time">{timeAgo(n.sentAt || n.createdAt)}</span>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
