import React from 'react';
import { Mail, Phone, HelpCircle, ChevronRight } from 'lucide-react';
import ProfileMobileHeader from './ProfileMobileHeader';

export default function ProfileHelp() {
  return (
    <div className="profile-sub-page profile-sub-page--scroll profile-help-page">
      <ProfileMobileHeader title="Help center" />

      <div className="help-center-content settings-content profile-help-content">
        <div className="help-center-intro">
          <h2>Help Center</h2>
          <p>Get support from our specialized engineering team.</p>
        </div>

        <div className="help-grid">
          <div className="help-item">
            <div className="help-item__icon">
              <Mail size={24} color="#22c55e" />
            </div>
            <div className="help-item__body">
              <h4>Official Support</h4>
              <p>arabym702@gmail.com</p>
              <span className="help-item__badge help-item__badge--online">• Online</span>
            </div>
          </div>

          <div className="help-item">
            <div className="help-item__icon">
              <Phone size={24} color="#22c55e" />
            </div>
            <div className="help-item__body">
              <h4>Direct Line</h4>
              <p>+01012209503</p>
              <span className="help-item__badge">Sun - Thu, 9 AM - 6 PM</span>
            </div>
          </div>

          <div className="help-item help-item--wide">
            <div className="help-item__icon">
              <HelpCircle size={24} color="#22c55e" />
            </div>
            <div className="help-item__body">
              <h4>Technical Documentation</h4>
              <p>Access our comprehensive guides on device integration and API management.</p>
            </div>
            <ChevronRight size={20} color="#94a3b8" className="help-item__chevron" />
          </div>
        </div>
      </div>
    </div>
  );
}
