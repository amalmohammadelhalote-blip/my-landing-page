import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { userService } from '../../api/services';
import ProfileMobileHeader from './ProfileMobileHeader';

export default function ProfileDelete() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await userService.deleteProfile();
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('authToken');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-sub-page">
      <ProfileMobileHeader title="Delete account" />

      <div className="profile-danger-card">
        <Trash2 size={48} className="profile-danger-card__icon" />
        <h2>Confirm Account Deletion</h2>
        <p>
          Deleting your account will permanently remove your devices, history, and settings.
          This action cannot be undone.
        </p>

        {error ? <p className="profile-message profile-message--error">{error}</p> : null}

        <button
          type="button"
          className="profile-danger-btn"
          onClick={handleDelete}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Deleting...' : 'Permanently Delete My Account'}
        </button>
      </div>
    </div>
  );
}
