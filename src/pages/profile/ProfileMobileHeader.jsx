import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ProfileMobileHeader({ title }) {
  const navigate = useNavigate();

  return (
    <header className="profile-mobile-header profile-mobile-only">
      <button
        type="button"
        className="profile-mobile-header__back"
        onClick={() => navigate('/dashboard/profile')}
        aria-label="Back to profile"
      >
        <ArrowLeft size={22} />
      </button>
      <h1 className="profile-mobile-header__title">{title}</h1>
      <span className="profile-mobile-header__spacer" aria-hidden="true" />
    </header>
  );
}
