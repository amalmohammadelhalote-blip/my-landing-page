import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

const NAV_ITEMS = [
  { key: 'edit', path: '/dashboard/profile/edit', label: 'Edit profile', icon: User },
  { key: 'password', path: '/dashboard/profile/password', label: 'Change password', icon: Lock },
  { key: 'delete', path: '/dashboard/profile/delete', label: 'Delete account', icon: Trash2, danger: true },
  { key: 'privacy', path: '/dashboard/profile/privacy', label: 'Privacy policy', icon: Shield },
  { key: 'help', path: '/dashboard/profile/help', label: 'Help center', icon: HelpCircle },
];

export default function ProfileMenu() {
  const navigate = useNavigate();
  const location = useLocation();
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

  const isActive = (path) => location.pathname === path;

  if (loading) {
    return (
      <>
        <div className="profile-menu-page profile-menu-mobile">
          <p className="profile-menu-page__loading">Loading...</p>
        </div>
        <aside className="settings-sidebar profile-menu-desktop">
          <p className="profile-menu-page__loading">Loading...</p>
        </aside>
      </>
    );
  }

  return (
    <>
      {/* Mobile: قائمة كاملة الشاشة */}
      <div className="profile-menu-page profile-menu-mobile">
        <div className="user-greeting profile-menu-page__greeting-block">
          <h3>
            Hello <span>@{profile?.username || 'user'}</span>
          </h3>
        </div>
        <div className="profile-menu-card">
          {NAV_ITEMS.map(({ path, label, icon: Icon, danger }) => (
            <button
              key={path}
              type="button"
              className={`profile-menu-row ${danger ? 'profile-menu-row--danger' : ''}`}
              onClick={() => navigate(path)}
            >
              <span className="profile-menu-row__left">
                <Icon size={20} />
                {label}
              </span>
              <ChevronRight
                size={18}
                className={`profile-menu-row__chevron ${danger ? '' : 'profile-menu-row__chevron--muted'}`}
              />
            </button>
          ))}

          <div className="profile-menu-row profile-menu-row--static">
            <span className="profile-menu-row__left">
              <Bell size={20} />
              Notifications
            </span>
            <label className="switch">
              <input type="checkbox" checked={notifications} onChange={toggleNotifications} />
              <span className="slider round" />
            </label>
          </div>

          <button
            type="button"
            className="profile-menu-row profile-menu-row--danger profile-menu-row--last"
            onClick={() => navigate('/dashboard/profile/logout')}
          >
            <span className="profile-menu-row__left">
              <LogOut size={20} />
              Log out
            </span>
            <ChevronRight size={18} className="profile-menu-row__chevron" />
          </button>
        </div>
      </div>

      {/* Desktop: sidebar جنب المحتوى */}
      <aside className="settings-sidebar profile-menu-desktop">
        <div className="user-greeting">
          <h3>
            Hello <span>@{profile?.username || 'user'}</span>
          </h3>
        </div>

        <nav className="settings-nav">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              type="button"
              className={`settings-nav-item ${isActive(path) ? 'active' : ''}`}
              onClick={() => navigate(path)}
            >
              <Icon size={18} /> {label}
            </button>
          ))}

          <div className="settings-nav-item toggle-item">
            <div className="toggle-label">
              <Bell size={18} /> Notifications
            </div>
            <label className="switch">
              <input type="checkbox" checked={notifications} onChange={toggleNotifications} />
              <span className="slider round" />
            </label>
          </div>
        </nav>

        <button
          type="button"
          className={`settings-logout-btn ${isActive('/dashboard/profile/logout') ? 'active' : ''}`}
          onClick={() => navigate('/dashboard/profile/logout')}
        >
          <LogOut size={18} /> Log out
        </button>
      </aside>
    </>
  );
}
