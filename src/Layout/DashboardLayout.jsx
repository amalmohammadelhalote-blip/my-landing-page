import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../assets/logo.png";
import Sidebar from "../components/Sidebar";
import "../pages/Dashboard.css";

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="dashboard-container">

      {/* Mobile Top Bar */}
      <div className="mobile-top-bar">
        <img src={logo} alt="logo" className="mobile-logo" />
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
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