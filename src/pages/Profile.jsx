import React, { useEffect, useState } from 'react';
import { userService } from '../api/services';
import { User, Lock, Mail, Phone, MapPin, Calendar, Activity } from 'lucide-react';
import './Dashboard.css';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Forms
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password Form
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passError, setPassError] = useState('');
  const [isPassSubmitting, setIsPassSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await userService.getProfile();
      const data = res?.data?.data || res?.data;
      setProfile(data);
      setFormData({
        name: data.name || '',
        username: data.username || '',
        phone: data.phone || '',
        address: data.address || ''
      });
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await userService.updateProfile(formData);
      setProfile({ ...profile, ...formData });
      setIsEditMode(false);
      alert('Profile updated successfully! (Mocked)');
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassError("New passwords do not match.");
      return;
    }
    try {
      setIsPassSubmitting(true);
      await userService.changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      alert('Password changed successfully! (Mocked)');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassError('Failed to change password.');
    } finally {
      setIsPassSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <header className="top-header"><h1>Profile Setup</h1></header>
        <div className="dashboard-loading-screens">
          <div className="skeleton skeleton-chart" style={{ height: '300px' }} />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return <div className="dashboard-error">{error || 'Profile not found'}</div>;
  }

  return (
    <div className="page-container">
      <header className="top-header" style={{ marginBottom: '32px' }}>
        <h1>My Profile</h1>
      </header>

      <div className="dashboard-grid">
        {/* Left Column: Profile Info & Edit */}
        <div className="left-column" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="stat-card" style={{ padding: '32px', position: 'relative' }}>
             <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(90deg, rgba(34,197,94,0.2) 0%, rgba(2,18,11,1) 100%)', borderRadius: '24px 24px 0 0' }}></div>
             
             <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '24px', marginTop: '20px' }}>
               <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#02120b', border: '4px solid #ider', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', zIndex: 2 }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                    <User size={48} />
                  </div>
               </div>
               <div style={{ paddingBottom: '10px' }}>
                 <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#fff' }}>{profile.name}</h2>
                 <p style={{ margin: 0, color: '#94a3b8', fontSize: '15px' }}>@{profile.username}</p>
               </div>
             </div>

             <div className="device-divider" style={{ margin: '32px 0 24px 0' }} />

             {!isEditMode ? (
               <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div className="icon-box" style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)' }}><Mail size={18} color="#94a3b8" /></div>
                      <div>
                        <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#64748b' }}>Email</p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1' }}>{profile.email}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div className="icon-box" style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)' }}><Phone size={18} color="#94a3b8" /></div>
                      <div>
                        <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#64748b' }}>Phone</p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1' }}>{profile.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div className="icon-box" style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)' }}><MapPin size={18} color="#94a3b8" /></div>
                      <div>
                        <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#64748b' }}>Address</p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1' }}>{profile.address || 'N/A'}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div className="icon-box" style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)' }}><Calendar size={18} color="#94a3b8" /></div>
                      <div>
                        <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#64748b' }}>Gender</p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1', textTransform: 'capitalize' }}>{profile.gender || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                    <button className="btn-primary" onClick={() => setIsEditMode(true)}>Edit Profile</button>
                  </div>
               </div>
             ) : (
               <form onSubmit={handleProfileSubmit} className="modal-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Username</label>
                    <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                    <button type="button" className="btn-cancel" onClick={() => setIsEditMode(false)}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
               </form>
             )}
          </div>

        </div>

        {/* Right Column: Security/Password */}
        <div className="right-column" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Security Card */}
          <div className="stat-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div className="icon-box"><Lock size={20} /></div>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#f8fafc' }}>Security</h2>
            </div>
            
            {passError && <p className="dashboard-empty" style={{color: '#fca5a5', padding: '12px'}}>{passError}</p>}
            
            <form onSubmit={handlePasswordSubmit} className="modal-form">
              <div className="form-group">
                <label>Current Password</label>
                <input required type="password" value={passForm.currentPassword} onChange={e => setPassForm({...passForm, currentPassword: e.target.value})} placeholder="••••••••" />
              </div>
              <div className="form-group mt-2">
                <label>New Password</label>
                <input required type="password" value={passForm.newPassword} onChange={e => setPassForm({...passForm, newPassword: e.target.value})} placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input required type="password" value={passForm.confirmPassword} onChange={e => setPassForm({...passForm, confirmPassword: e.target.value})} placeholder="••••••••" />
              </div>
              <div style={{ marginTop: '16px' }}>
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={isPassSubmitting}>
                   {isPassSubmitting ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
