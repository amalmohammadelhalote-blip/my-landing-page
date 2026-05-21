import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  Trash2,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useProfile } from './useProfile';

const NOTIFICATIONS_KEY = 'ecoshid_notifications';

export default function ProfileMenu() {
  const navigate = useNavigate();
  const { profile, loading } = useProfile();
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(NOTIFICATIONS_KEY);
    if (saved !== null) setNotifications(saved === 'true');
  }, []);

  const toggleNotifications = () => {
    const next = !notifications;
    setNotifications(next);
    localStorage.setItem(NOTIFICATIONS_KEY, String(next));
  };

  const go = (path) => () => navigate(path);

  if (loading) {
    return (
      <div className="profile-menu-page">
        <h1 className="profile-menu-page__title">Settings &amp; Profile</h1>
        <p className="profile-menu-page__loading">Loading...</p>
      </div>
    );
  }

  return (
    <div className="profile-menu-page">
      <h1 className="profile-menu-page__title">Settings &amp; Profile</h1>
      <p className="profile-menu-page__greeting">
        Hello <span>@{profile?.username || 'user'}</span>
      </p>

      <div className="profile-menu-card">
        <button type="button" className="profile-menu-row" onClick={go('/dashboard/profile/edit')}>
          <span className="profile-menu-row__left">
            <User size={20} />
            Edit profile
          </span>
          <ChevronRight size={18} className="profile-menu-row__chevron profile-menu-row__chevron--muted" />
        </button>

        <button type="button" className="profile-menu-row" onClick={go('/dashboard/profile/password')}>
          <span className="profile-menu-row__left">
            <Lock size={20} />
            Change password
          </span>
          <ChevronRight size={18} className="profile-menu-row__chevron profile-menu-row__chevron--muted" />
        </button>

        <button type="button" className="profile-menu-row profile-menu-row--danger" onClick={go('/dashboard/profile/delete')}>
          <span className="profile-menu-row__left">
            <Trash2 size={20} />
            Delete account
          </span>
          <ChevronRight size={18} className="profile-menu-row__chevron" />
        </button>

        <div className="profile-menu-row profile-menu-row--static">
          <span className="profile-menu-row__left">
            <Bell size={20} />
            Notifications
          </span>
          <label className="profile-toggle">
            <input type="checkbox" checked={notifications} onChange={toggleNotifications} />
            <span className="profile-toggle__slider" />
          </label>
        </div>

        <button type="button" className="profile-menu-row" onClick={go('/dashboard/profile/privacy')}>
          <span className="profile-menu-row__left">
            <Shield size={20} />
            Privacy Policy
          </span>
          <ChevronRight size={18} className="profile-menu-row__chevron" />
        </button>

        <button type="button" className="profile-menu-row" onClick={go('/dashboard/profile/help')}>
          <span className="profile-menu-row__left">
            <HelpCircle size={20} />
            Help Center
          </span>
          <ChevronRight size={18} className="profile-menu-row__chevron" />
        </button>

        <button
          type="button"
          className="profile-menu-row profile-menu-row--danger profile-menu-row--last"
          onClick={go('/dashboard/profile/logout')}
        >
          <span className="profile-menu-row__left">
            <LogOut size={20} />
            Logout
          </span>
          <ChevronRight size={18} className="profile-menu-row__chevron" />
        </button>
      </div>
    </div>
  );
}
