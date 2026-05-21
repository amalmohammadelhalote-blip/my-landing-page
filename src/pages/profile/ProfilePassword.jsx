import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../api/services';
import ProfileMobileHeader from './ProfileMobileHeader';

export default function ProfilePassword() {
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passForm.newPassword !== passForm.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      await userService.changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
        confirmPassword: passForm.confirmPassword,
      });
      setSuccess('Password changed successfully.');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-sub-page">
      <ProfileMobileHeader title="Change password" />

      <form className="profile-sub-form" onSubmit={handleSubmit}>
        <div className="profile-field">
          <label>Current password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={passForm.currentPassword}
            onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
            required
          />
        </div>
        <p className="profile-forgot-link">
          <Link to="/forget-password">Forgot password?</Link>
        </p>
        <div className="profile-field">
          <label>New password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={passForm.newPassword}
            onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
            required
          />
        </div>
        <div className="profile-field">
          <label>Confirm password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={passForm.confirmPassword}
            onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
            required
          />
        </div>

        {error ? <p className="profile-message profile-message--error">{error}</p> : null}
        {success ? <p className="profile-message profile-message--success">{success}</p> : null}

        <button type="submit" className="profile-primary-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Confirm changes'}
        </button>
      </form>
    </div>
  );
}
