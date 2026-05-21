import React, { useState } from 'react';
import { userService } from '../../api/services';
import ProfileMobileHeader from './ProfileMobileHeader';

export default function ProfilePassword() {
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passError, setPassError] = useState('');
  const [isPassSubmitting, setIsPassSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }
    try {
      setIsPassSubmitting(true);
      await userService.changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
        confirmPassword: passForm.confirmPassword,
      });
      alert('Password changed successfully!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassError(err?.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsPassSubmitting(false);
    }
  };

  return (
    <div className="profile-sub-page">
      <ProfileMobileHeader title="Change password" />

      <form className="settings-form profile-sub-form" onSubmit={handleSubmit}>
        <div className="setting-field">
          <label>Current password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={passForm.currentPassword}
            onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
          />
        </div>
        <div className="forgot-password-link">
          <a href="#">forgot password?</a>
        </div>
        <div className="setting-field">
          <label>New password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={passForm.newPassword}
            onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
          />
        </div>
        <div className="setting-field">
          <label>Confirm password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={passForm.confirmPassword}
            onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
          />
        </div>
        {passError && <p className="error-message">{passError}</p>}
        <button type="submit" className="confirm-btn" disabled={isPassSubmitting}>
          {isPassSubmitting ? 'Processing...' : 'Confirm changes'}
        </button>
      </form>
    </div>
  );
}
