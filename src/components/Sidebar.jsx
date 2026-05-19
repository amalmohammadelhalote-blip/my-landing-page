import React from 'react';
import { NavLink } from "react-router-dom";
import { Home, BarChart2, Smartphone, Settings, LogOut, User, X } from "lucide-react";
import logo from "../assets/logo.png";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      {/* Sidebar Container */}
      <aside className={`sidebar-comp ${isOpen ? 'open' : ''}`}>
        
        {/* Mobile Close Button inside Sidebar */}
        <button className="sidebar-close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        {/* Logo Section */}
        <div className="sidebar-logo-container">
          <img src={logo} alt="ECOSHIED Logo" className="sidebar-logo" />
        </div>

        {/* Main Navigation Links */}
        <nav className="sidebar-nav">
          <NavLink 
            to="/dashboard/home" 
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Home size={20} />
            <span>Home</span>
          </NavLink>

          <NavLink 
            to="/dashboard/reports" 
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <BarChart2 size={20} />
            <span>Reports</span>
          </NavLink>

          <NavLink 
            to="/dashboard/devices" 
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Smartphone size={20} />
            <span>Devices</span>
          </NavLink>
        </nav>

        {/* Sidebar Footer (Profile, Settings, Logout) */}
        <div className="sidebar-footer">
          <NavLink 
            to="/dashboard/profile" 
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <User size={20} />
            <span>My Profile</span>
          </NavLink>
          
          <div className="sidebar-nav-item settings-disabled">
            <Settings size={20} />
            <span>Settings</span>
          </div>

          <NavLink 
            to="/logout" 
            className="sidebar-nav-item sidebar-logout"
            onClick={onClose}
          >
            <LogOut size={20} />
            <span>Log out</span>
          </NavLink>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
