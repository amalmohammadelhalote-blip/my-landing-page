import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellRing, X } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import './NotificationToast.css';

export default function NotificationToast() {
  const { toastMessage, setToastMessage } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, setToastMessage]);

  if (!toastMessage) return null;

  const handleToastClick = () => {
    navigate('/dashboard/profile/notifications');
    setToastMessage(null);
  };

  return (
    <div className="notif-toast-container" onClick={handleToastClick}>
      <div className="notif-toast-icon">
        <BellRing size={20} />
      </div>
      <div className="notif-toast-content">
        <h4 className="notif-toast-title">{toastMessage.title}</h4>
        <p className="notif-toast-body">{toastMessage.body}</p>
      </div>
      <button 
        className="notif-toast-close"
        onClick={(e) => {
          e.stopPropagation();
          setToastMessage(null);
        }}
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
}
