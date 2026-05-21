import React from 'react';
import { Outlet } from 'react-router-dom';
import '../Profile.css';

export default function ProfileLayout() {
  return (
    <div className="profile-app">
      <Outlet />
    </div>
  );
}
