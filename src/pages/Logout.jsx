import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/services';

export default function Logout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doLogout = async () => {
      try {
        await authService.logout();
      } catch (e) {
        // قد يفشل اللوج أوت لو التوكن انتهى؛ هنمشي في نفس اتجاه الـredirect.
      } finally {
        localStorage.removeItem('token');
        setLoading(false);
        navigate('/login', { replace: true });
      }
    };

    doLogout();
  }, [navigate]);

  return (
    <div style={{ padding: 24, color: '#cbd5e1' }}>
      {loading ? 'Logging out...' : 'Redirecting...'}
    </div>
  );
}

