import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/services';
import { LogOut } from 'lucide-react';
import './Dashboard.css'; // Using global dashboard styles
import './Profile.css';   // Reusing confirmation card styles

export default function Logout() {
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
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="logout-confirmation-page" style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#040d08'
    }}>
      <div className="delete-confirmation-card" style={{ maxWidth: '400px' }}>
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
        
        <h3 style={{ fontSize: '22px', marginBottom: '12px' }}>Confirm Log Out</h3>
        <p style={{ color: '#94a3b8', marginBottom: '32px', fontSize: '15px' }}>
          Are you sure you want to log out? You will need to enter your credentials to access the dashboard again.
        </p>

        <div className="delete-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            className="delete-confirm-btn" 
            onClick={handleConfirmLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Log Out'}
          </button>
          
          <button 
            className="delete-cancel-btn" 
            onClick={handleCancel}
            disabled={isLoggingOut}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
