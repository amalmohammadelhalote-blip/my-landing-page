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
    date_of_birth: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!profile) return;
    setFormData({
      name: profile.name || '',
      username: profile.username || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address || '',
      date_of_birth: profile.date_of_birth || profile.dob || '',
    });
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      await userService.updateProfile({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        date_of_birth: formData.date_of_birth,
      });
      setSuccess('Profile updated successfully.');
      await refetch();
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
        <form className="profile-sub-form" onSubmit={handleSubmit}>
          <div className="profile-field">
            <label>Full name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="profile-field">
            <label>User name</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div className="profile-field">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="profile-field">
            <label>Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="profile-field">
            <label>Phone number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="profile-field">
            <label>Date of birth</label>
            <input
              type="date"
              value={
                formData.date_of_birth && String(formData.date_of_birth).includes('T')
                  ? String(formData.date_of_birth).slice(0, 10)
                  : formData.date_of_birth || ''
              }
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            />
          </div>

          {error ? <p className="profile-message profile-message--error">{error}</p> : null}
          {success ? <p className="profile-message profile-message--success">{success}</p> : null}

          <button type="submit" className="profile-primary-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Confirm changes'}
          </button>
        </form>
      )}
    </div>
  );
}
