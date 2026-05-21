import React from 'react';
import { Mail, Phone, HelpCircle, ChevronRight } from 'lucide-react';
import ProfileMobileHeader from './ProfileMobileHeader';

export default function ProfileHelp() {
  return (
    <div className="profile-sub-page profile-sub-page--scroll">
      <ProfileMobileHeader title="Help center" />

      <div className="help-center-content settings-content">
        <div style={{ marginBottom: '32px' }}>
          <h2>Help Center</h2>
          <p style={{ color: '#94a3b8' }}>Get support from our specialized engineering team.</p>
        </div>

        <div
          className="help-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}
        >
          <div className="help-item">
            <div
              className="icon-circle"
              style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '12px', borderRadius: '12px' }}
            >
              <Mail size={24} color="#22c55e" />
            </div>
            <div>
              <h4>Official Support</h4>
              <p>arabym702@gmail.com</p>
              <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: '600' }}>• Online</span>
            </div>
          </div>

          <div className="help-item">
            <div
              className="icon-circle"
              style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '12px', borderRadius: '12px' }}
            >
              <Phone size={24} color="#22c55e" />
            </div>
            <div>
              <h4>Direct Line</h4>
              <p>+01012209503</p>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Sun - Thu, 9 AM - 6 PM</span>
            </div>
          </div>

          <div className="help-item" style={{ gridColumn: '1 / -1' }}>
            <div
              className="icon-circle"
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                padding: '12px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HelpCircle size={24} color="#22c55e" />
            </div>
            <div style={{ flex: 1 }}>
              <h4>Technical Documentation</h4>
              <p style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '400' }}>
                Access our comprehensive guides on device integration and API management.
              </p>
            </div>
            <ChevronRight size={20} color="#94a3b8" />
          </div>
        </div>
      </div>
    </div>
  );
}
