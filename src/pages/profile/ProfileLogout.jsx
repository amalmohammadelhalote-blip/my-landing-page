import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { authService } from '../../api/services';
import ProfileMobileHeader from './ProfileMobileHeader';

export default function ProfileLogout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch {
      // continue even if API fails
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('authToken');
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="profile-sub-page">
      <ProfileMobileHeader title="Logout" />

      <div className="profile-danger-card profile-danger-card--logout">
        <LogOut size={48} className="profile-danger-card__icon profile-danger-card__icon--green" />
        <h2>Log out from ECOSHID</h2>
        <p>Are you sure you want to end your current session?</p>

        <button type="button" className="profile-primary-btn" onClick={handleLogout} disabled={loading}>
          {loading ? 'Logging out...' : 'Confirm Logout'}
        </button>
      </div>
    </div>
  );
}
