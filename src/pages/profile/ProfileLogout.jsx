import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../api/services';
import { LogOut } from 'lucide-react';
import '../../components/Sidebar.css';
import '../Profile.css';

export default function ProfileLogout() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authService.logout();
    } catch (e) {
      console.warn("Logout request failed, cleaning up locally anyway.");
    } finally {
      localStorage.clear();
      navigate('/login', { replace: true });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="logout-confirmation-page" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#040d08',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div className="delete-confirmation-card settings-content" style={{ 
        width: '100%',
        maxWidth: '400px',
        padding: '32px 24px',
        boxSizing: 'border-box',
        borderRadius: '24px',
        textAlign: 'center'
      }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: 'rgba(239, 68, 68, 0.1)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: '#ef4444'
        }}>
          <LogOut size={32} />
        </div>
        
        <h3 style={{ fontSize: '22px', marginBottom: '12px', color: '#fff' }}>Confirm Log Out</h3>
        <p style={{ color: '#94a3b8', marginBottom: '32px', fontSize: '15px', lineHeight: '1.5' }}>
          Are you sure you want to log out? You will need to enter your credentials to access the dashboard again.
        </p>

        <div className="delete-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            className="delete-cancel-btn delete-cancel-btn--danger" 
            onClick={handleConfirmLogout}
            disabled={isLoggingOut}
            style={{ width: '100%', margin: 0 }}
          >
            {isLoggingOut ? 'Logging out...' : 'Log Out'}
          </button>
          
          <button 
            className="delete-cancel-btn" 
            onClick={handleCancel}
            disabled={isLoggingOut}
            style={{ width: '100%', margin: 0 }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
