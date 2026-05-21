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
      <ProfileMobileHeader title="Log out" />

      <div className="delete-confirmation-card settings-content">
        <div style={{ color: '#22c55e', marginBottom: '24px' }}>
          <LogOut size={48} />
        </div>
        <h3>Log out from ECOSHID</h3>
        <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Are you sure you want to end your current session?</p>
        <div className="delete-actions">
          <button
            type="button"
            className="confirm-btn"
            style={{ margin: 0, width: '100%' }}
            onClick={handleLogout}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm Logout'}
          </button>
          <button type="button" className="delete-cancel-btn" onClick={() => navigate('/dashboard/profile')}>
            Stay Connected
          </button>
        </div>
      </div>
    </div>
  );
}
