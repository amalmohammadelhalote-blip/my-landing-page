import React, { useEffect, useState } from 'react';
import { userService } from '../../api/services';
import ProfileMobileHeader from './ProfileMobileHeader';
import { useProfile } from './useProfile';

export default function ProfileEdit() {
  const { profile, loading, refetch } = useProfile();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    dob: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profile) return;
    const rawDob = profile.dob || profile.date_of_birth || '';
    const formattedDob = rawDob ? rawDob.split('T')[0] : '';
    setFormData({
      name: profile.name || '',
      username: profile.username || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address || '',
      dob: formattedDob,
    });
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      await userService.updateProfile(formData);
      await refetch();
      alert('Profile updated successfully!');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-sub-page">
      <ProfileMobileHeader title="Edit profile" />

      {loading ? (
        <p className="profile-sub-page__loading">Loading...</p>
      ) : (
        <form className="settings-form profile-sub-form" onSubmit={handleSubmit}>
          <div className="setting-field">
            <label>Full name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="setting-field">
            <label>User name</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div className="setting-field">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="setting-field">
            <label>Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="setting-field">
            <label>Phone number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="setting-field">
            <label>Date of birth</label>
            <input
              type="text"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            />
          </div>
          {error ? <p className="error-message">{error}</p> : null}
          <button type="submit" className="confirm-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Confirm changes'}
          </button>
        </form>
      )}
    </div>
  );
}
