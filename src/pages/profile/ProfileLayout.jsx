import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import ProfileMenu from './ProfileMenu';
import '../Profile.css';

export default function ProfileLayout() {
  const location = useLocation();
  const isMenuPage =
    location.pathname === '/dashboard/profile' ||
    /\/profile\/?$/.test(location.pathname);

  return (
    <div className={`profile-page profile-app ${isMenuPage ? 'profile-app--menu' : 'profile-app--sub'}`}>
      <header className="top-header profile-app__desktop-header">
        <h1>Settings</h1>
      </header>

      <div className="settings-container profile-app__shell">
        <div className="profile-app__sidebar-col">
          <ProfileMenu />
        </div>
        <main className="settings-content profile-app__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
