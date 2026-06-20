import React from 'react';
import { Bell, ShieldAlert, Sparkles, X } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import './NotificationPrompt.css';

export default function NotificationPrompt() {
  const { promptOpen, setPromptOpen, enableNotifications } = useNotification();

  if (!promptOpen) return null;

  const handleAllow = async () => {
    localStorage.setItem('ecoshid_notifications_prompted', 'true');
    localStorage.setItem('ecoshid_notifications_enabled', 'true');
    setPromptOpen(false);
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (_) {}
    }
  };

  const handleDecline = () => {
    localStorage.setItem('ecoshid_notifications_prompted', 'true');
    setPromptOpen(false);
    // Explicitly record decline to avoid native push requests but allow in-app notifications
    localStorage.setItem('ecoshid_notifications_enabled', 'false');
  };

  return (
    <div className="notif-prompt-overlay">
      <div className="notif-prompt-card">
        <button className="notif-prompt-close" onClick={handleDecline} aria-label="Close">
          <X size={18} />
        </button>
        
        <div className="notif-prompt-icon-container">
          <div className="notif-prompt-pulse" />
          <Bell className="notif-prompt-icon" size={32} />
        </div>

        <h2 className="notif-prompt-title">Enable Notifications?</h2>
        <p className="notif-prompt-desc">
          Get real-time insights on your home's energy consumption, device threshold status alerts, and AI recommendations.
        </p>

        <div className="notif-prompt-features">
          <div className="notif-prompt-feature-item">
            <ShieldAlert size={18} className="feature-icon" />
            <span>Threshold limit warnings</span>
          </div>
          <div className="notif-prompt-feature-item">
            <Sparkles size={18} className="feature-icon" />
            <span>Smart energy saving tips</span>
          </div>
        </div>

        <div className="notif-prompt-actions">
          <button className="notif-btn-allow" onClick={handleAllow}>
            Enable Alerts
          </button>
          <button className="notif-btn-skip" onClick={handleDecline}>
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
