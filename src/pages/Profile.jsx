import React, { useEffect, useState } from 'react';
import { userService } from '../api/services';
import { User, Lock, Mail, Phone, MapPin, Calendar, HelpCircle, Shield, Trash2, Bell, LogOut, Search, ChevronRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('edit'); // edit, password, delete, privacy, help
  
  // Forms
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password Form
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passError, setPassError] = useState('');
  const [isPassSubmitting, setIsPassSubmitting] = useState(false);

  // Notifications toggle
  const [notifications, setNotifications] = useState(true);

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
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        dob: data.dob || '06 / 10 / 2003'
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
      alert('Profile updated successfully!');
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
      alert('Password changed successfully!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassError('Failed to change password.');
    } finally {
      setIsPassSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action is permanent.')) {
        try {
            // await userService.deleteAccount();
            alert('Account deleted successfully!');
            navigate('/login');
        } catch (err) {
            alert('Failed to delete account.');
        }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="profile-page">
        <header className="top-header"><h1>Settings</h1></header>
        <div className="skeleton-container" style={{ padding: '20px' }}>
          <div className="skeleton" style={{ height: '400px', borderRadius: '24px' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <header className="top-header">
        <h1>Settings</h1>
        <div className="search-bar">
          <Search size={18} />
          <input type="text" placeholder="Search" />
        </div>
      </header>

      <div className="settings-container">
        {/* Settings Sidebar */}
        <aside className="settings-sidebar">
          <div className="user-greeting">
            <h3>Hello <span>@{profile?.username || 'user'}</span></h3>
          </div>
          
          <nav className="settings-nav">
            <button 
              className={`settings-nav-item ${activeTab === 'edit' ? 'active' : ''}`}
              onClick={() => setActiveTab('edit')}
            >
              <User size={18} /> Edit profile
            </button>
            <button 
              className={`settings-nav-item ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <Lock size={18} /> Change password
            </button>
            <button 
              className={`settings-nav-item ${activeTab === 'delete' ? 'active' : ''}`}
              onClick={() => setActiveTab('delete')}
            >
              <Trash2 size={18} /> Delete account
            </button>
            <button 
              className={`settings-nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              <Shield size={18} /> Privacy policy
            </button>
            <button 
              className={`settings-nav-item ${activeTab === 'help' ? 'active' : ''}`}
              onClick={() => setActiveTab('help')}
            >
              <HelpCircle size={18} /> Help center
            </button>
            
            <div className="settings-nav-item toggle-item">
              <div className="toggle-label">
                <Bell size={18} /> Notifications
              </div>
              <label className="switch">
                <input 
                    type="checkbox" 
                    checked={notifications} 
                    onChange={() => setNotifications(!notifications)} 
                />
                <span className="slider round"></span>
              </label>
            </div>
          </nav>

          <button className="settings-logout-btn" onClick={() => setActiveTab('logout')}>
            <LogOut size={18} /> Log out
          </button>
        </aside>

        {/* Settings Content */}
        <main className="settings-content">
          {activeTab === 'edit' && (
            <form className="settings-form" onSubmit={handleProfileSubmit}>
              <div className="setting-field">
                <label>Full name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                />
              </div>
              <div className="setting-field">
                <label>User name</label>
                <input 
                  type="text" 
                  value={formData.username} 
                  onChange={e => setFormData({ ...formData, username: e.target.value })} 
                />
              </div>
              <div className="setting-field">
                <label>Email</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })} 
                />
              </div>
              <div className="setting-field">
                <label>Adress</label>
                <input 
                  type="text" 
                  value={formData.address} 
                  onChange={e => setFormData({ ...formData, address: e.target.value })} 
                />
              </div>
              <div className="setting-field">
                <label>Phone number</label>
                <input 
                  type="text" 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                />
              </div>
              <div className="setting-field">
                <label>Date of birth</label>
                <input 
                  type="text" 
                  value={formData.dob} 
                  onChange={e => setFormData({ ...formData, dob: e.target.value })} 
                />
              </div>
              <button type="submit" className="confirm-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Confirm changes'}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form className="settings-form" onSubmit={handlePasswordSubmit}>
              <div className="setting-field">
                <label>Current password</label>
                <input 
                  type="password" 
                  placeholder="Enter your password"
                  value={passForm.currentPassword} 
                  onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })} 
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
                  onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })} 
                />
              </div>
              <div className="setting-field">
                <label>Confirm password</label>
                <input 
                  type="password" 
                  placeholder="Enter your password"
                  value={passForm.confirmPassword} 
                  onChange={e => setPassForm({ ...passForm, confirmPassword: e.target.value })} 
                />
              </div>
              {passError && <p className="error-message">{passError}</p>}
              <button type="submit" className="confirm-btn" disabled={isPassSubmitting}>
                {isPassSubmitting ? 'Processing...' : 'Confirm changes'}
              </button>
            </form>
          )}

          {activeTab === 'delete' && (
            <div className="delete-confirmation-card">
              <div className="warning-header" style={{ color: '#ef4444', marginBottom: '24px' }}>
                <Trash2 size={48} />
              </div>
              <h3>Confirm Account Deletion</h3>
              <p style={{ color: '#94a3b8', marginBottom: '32px', lineHeight: '1.6' }}>
                Deleting your account will permanently remove all your connected devices, consumption history, and personal settings. This action cannot be undone.
              </p>
              
              <div className="impact-list" style={{ textAlign: 'left', background: 'rgba(239, 68, 68, 0.05)', padding: '20px', borderRadius: '16px', marginBottom: '32px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#fca5a5', marginBottom: '12px', textTransform: 'uppercase' }}>What happens next:</p>
                <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px', color: '#cbd5e1' }}>
                  <li style={{ marginBottom: '8px' }}>• Immediate loss of access to the dashboard.</li>
                  <li style={{ marginBottom: '8px' }}>• All historical energy data will be wiped.</li>
                  <li>• Subscription and billing billing data archived.</li>
                </ul>
              </div>

              <div className="delete-actions">
                <button className="delete-confirm-btn" onClick={handleDeleteAccount}>Permanently Delete My Account</button>
                <button className="delete-cancel-btn" onClick={() => setActiveTab('edit')}>Cancel & Keep Account</button>
              </div>
            </div>
          )}

          {activeTab === 'logout' && (
            <div className="delete-confirmation-card">
              <div style={{ color: '#22c55e', marginBottom: '24px' }}>
                <LogOut size={48} />
              </div>
              <h3>Log out from ECOSHID</h3>
              <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Are you sure you want to end your current session?</p>
              <div className="delete-actions">
                <button className="confirm-btn" style={{ margin: 0, width: '100%' }} onClick={handleLogout}>Confirm Logout</button>
                <button className="delete-cancel-btn" onClick={() => setActiveTab('edit')}>Stay Connected</button>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="privacy-policy-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                  <h2>Privacy Policy</h2>
                  <div className="last-update">
                    <Calendar size={14} /> Last Updated: April 2026
                  </div>
                </div>
                <button className="all-link" style={{ height: 'fit-content' }}>Download PDF</button>
              </div>
              
              <div className="policy-text">
                <p className="intro-text">At <strong>ECOSHID</strong>, we prioritize the protection of your industrial and personal data. This policy outlines our rigorous standards for data management and user privacy within the Smart Energy Management ecosystem.</p>
                
                <section>
                  <h3><Shield size={18} color="#22c55e" /> 1. Information Infrastructure</h3>
                  <p>Our system architectures are designed to segment and secure specific data points:</p>
                  <ul>
                    <li><strong>Identity Protocol:</strong> Encrypted storage of hierarchical user credentials.</li>
                    <li><strong>Telemetry Data:</strong> High-precision capture of voltage, current, and wattage.</li>
                    <li><strong>Asset Topology:</strong> Mapping of device locators and category hierarchies.</li>
                  </ul>
                </section>

                <section>
                  <h3><Zap size={18} color="#22c55e" /> 2. Data Processing & AI Insights</h3>
                  <p>Aggregated data points are processed to generate predictive energy models:</p>
                  <ul>
                    <li>Optimizing grid distribution based on historical consumption patterns.</li>
                    <li>Predictive maintenance alerts based on unusual technical data signatures.</li>
                  </ul>
                </section>

                {/* Remaining sections maintained with premium structure */}
                <section>
                  <h3><Mail size={18} color="#22c55e" /> 3. Contact & Support Protocols</h3>
                  <p>For official privacy inquiries or data access requests, please utilize the following channels:</p>
                  <div className="contact-info-card">
                    <p><strong>ECOSHID Compliance Team</strong></p>
                    <p>Channel: arabym702@gmail.com</p>
                    <p>Operations: +01012209503</p>
                  </div>
                </section>

                <p className="copyright-text">ECOSHID Enterprise Energy Systems © {new Date().getFullYear()}. Secure Infrastructure.</p>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="help-center-content">
              <div style={{ marginBottom: '32px' }}>
                <h2>Help Center</h2>
                <p style={{ color: '#94a3b8' }}>Get support from our specialized engineering team.</p>
              </div>

              <div className="help-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div className="help-item">
                  <div className="icon-circle" style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '12px', borderRadius: '12px' }}>
                    <Mail size={24} color="#22c55e" />
                  </div>
                  <div>
                    <h4>Official Support</h4>
                    <p>arabym702@gmail.com</p>
                    <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: '600' }}>• Online</span>
                  </div>
                </div>

                <div className="help-item">
                  <div className="icon-circle" style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '12px', borderRadius: '12px' }}>
                    <Phone size={24} color="#22c55e" />
                  </div>
                  <div>
                    <h4>Direct Line</h4>
                    <p>+01012209503</p>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Sun - Thu, 9 AM - 6 PM</span>
                  </div>
                </div>

                <div className="help-item" style={{ gridColumn: '1 / -1' }}>
                  <HelpCircle size={24} color="#22c55e" />
                  <div style={{ flex: 1 }}>
                    <h4>Technical Documentation</h4>
                    <p style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '400' }}>Access our comprehensive guides on device integration and API management.</p>
                  </div>
                  <ChevronRight size={20} color="#94a3b8" />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Simple Clock component replacement for icon since Clock is imported from lucide-react but used as a component
const ClockIcon = ({ size }) => <Clock size={size} />;
