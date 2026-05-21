import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { userService } from '../../api/services';
import ProfileMobileHeader from './ProfileMobileHeader';

export default function ProfileDelete() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action is permanent.')) {
      try {
        setIsSubmitting(true);
        await userService.deleteProfile();
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('authToken');
        alert('Account deleted successfully!');
        navigate('/login', { replace: true });
      } catch (err) {
        alert(err?.response?.data?.message || 'Failed to delete account.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="profile-sub-page">
      <ProfileMobileHeader title="Delete account" />

      <div className="delete-confirmation-card settings-content">
        <div className="warning-header" style={{ color: '#ef4444', marginBottom: '24px' }}>
          <Trash2 size={48} />
        </div>
        <h3>Confirm Account Deletion</h3>
        <p style={{ color: '#94a3b8', marginBottom: '32px', lineHeight: '1.6' }}>
          Deleting your account will permanently remove all your connected devices, consumption history, and personal settings. This action cannot be undone.
        </p>

        <div
          className="impact-list"
          style={{
            textAlign: 'left',
            background: 'rgba(239, 68, 68, 0.05)',
            padding: '20px',
            borderRadius: '16px',
            marginBottom: '32px',
            border: '1px solid rgba(239, 68, 68, 0.1)',
          }}
        >
          <p style={{ fontSize: '14px', fontWeight: '700', color: '#fca5a5', marginBottom: '12px', textTransform: 'uppercase' }}>
            What happens next:
          </p>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px', color: '#cbd5e1' }}>
            <li style={{ marginBottom: '8px' }}>• Immediate loss of access to the dashboard.</li>
            <li style={{ marginBottom: '8px' }}>• All historical energy data will be wiped.</li>
            <li>• Subscription and billing billing data archived.</li>
          </ul>
        </div>

        <div className="delete-actions">
          <button type="button" className="delete-confirm-btn" onClick={handleDeleteAccount} disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Permanently Delete My Account'}
          </button>
          <button type="button" className="delete-cancel-btn" onClick={() => navigate('/dashboard/profile')}>
            Cancel &amp; Keep Account
          </button>
        </div>
      </div>
    </div>
  );
}
