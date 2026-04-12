import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Home, BarChart2, Smartphone, HelpCircle, Settings, LogOut, User, Menu, X } from "lucide-react";
import logo from "../assets/logo.png";
import "../pages/Dashboard.css"

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

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>

        <div className="logo">
          <img src={logo} alt="logo" className="sidebar-logo" />

        </div>

        <nav>
          <NavLink to="/dashboard/home" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Home size={20} /> Home
          </NavLink>

          <NavLink to="/dashboard/devices" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Smartphone size={20} /> Devices
          </NavLink>

          <NavLink to="/dashboard/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <BarChart2 size={20} /> Reports
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item cursor-pointer">
            <HelpCircle size={20} /> Help
          </div>
          <NavLink to="/dashboard/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={20} /> Settings
          </NavLink>
          <NavLink to="/logout" className="nav-item logout">
            <LogOut size={20} /> Log out
          </NavLink>
        </div>

        {isMobileMenuOpen && <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />}
      </aside>

      {/* الصفحات هتظهر هنا */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;