import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Bell } from "lucide-react";
import logo from "../assets/logo.png";
import Sidebar from "../components/Sidebar";
import { useNotification } from '../context/NotificationContext';
import "../pages/Dashboard.css";

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const notificationCtx = useNotification?.() || {};
  const { unreadCount = 0 } = notificationCtx;

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="dashboard-container">

      {/* Mobile Top Bar */}
      <div className="mobile-top-bar">
        <img src={logo} alt="logo" className="mobile-logo" />
        <div className="mobile-top-actions">
          <button 
            className="mobile-bell-btn" 
            onClick={() => navigate('/dashboard/profile/notifications')}
            aria-label="Notifications"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="mobile-bell-badge">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Standalone Sidebar Component */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;