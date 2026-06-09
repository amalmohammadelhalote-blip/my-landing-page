import React from 'react';
import { Calendar, Shield, Zap, Mail } from 'lucide-react';
import ProfileMobileHeader from './ProfileMobileHeader';

export default function ProfilePrivacy() {
  return (
    <div className="profile-sub-page profile-sub-page--scroll profile-privacy-page">
      <ProfileMobileHeader title="Privacy policy" />

      <div className="privacy-policy-content settings-content profile-privacy-content">
        <div className="privacy-policy-header">
          <div className="privacy-policy-header__titles">
            <h2>Privacy Policy</h2>
            <div className="last-update">
              <Calendar size={14} /> Last Updated: April 2026
            </div>
          </div>
          <button type="button" className="all-link privacy-download-btn">
            Download PDF
          </button>
        </div>

        <div className="policy-text">
          <p className="intro-text">
            At <strong>ECOSHID</strong>, we prioritize the protection of your industrial and personal data. This policy outlines our rigorous standards for data management and user privacy within the Smart Energy Management ecosystem.
          </p>

          <section className="policy-section">
            <h3>
              <Shield size={18} color="#22c55e" /> 1. Information Infrastructure
            </h3>
            <p>Our system architectures are designed to segment and secure specific data points:</p>
            <ul>
              <li>
                <strong>Identity Protocol:</strong> Encrypted storage of hierarchical user credentials.
              </li>
              <li>
                <strong>Telemetry Data:</strong> High-precision capture of voltage, current, and wattage.
              </li>
              <li>
                <strong>Asset Topology:</strong> Mapping of device locators and category hierarchies.
              </li>
            </ul>
          </section>

          <section className="policy-section">
            <h3>
              <Zap size={18} color="#22c55e" /> 2. Data Processing &amp; AI Insights
            </h3>
            <p>Aggregated data points are processed to generate predictive energy models:</p>
            <ul>
              <li>Optimizing grid distribution based on historical consumption patterns.</li>
              <li>Predictive maintenance alerts based on unusual technical data signatures.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h3>
              <Mail size={18} color="#22c55e" /> 3. Contact &amp; Support Protocols
            </h3>
            <p>For official privacy inquiries or data access requests, please utilize the following channels:</p>
            <div className="contact-info-card">
              <p>
                <strong>ECOSHID Compliance Team</strong>
              </p>
              <p>Channel: arabym702@gmail.com</p>
              <p>Operations: +01012209503</p>
            </div>
          </section>

          <p className="copyright-text">
            ECOSHID Enterprise Energy Systems © {new Date().getFullYear()}. Secure Infrastructure.
          </p>
        </div>
      </div>
    </div>
  );
}
