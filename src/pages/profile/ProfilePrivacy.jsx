import React from 'react';
import { Calendar, Shield, Zap, Mail } from 'lucide-react';
import ProfileMobileHeader from './ProfileMobileHeader';

export default function ProfilePrivacy() {
  return (
    <div className="profile-sub-page profile-sub-page--scroll">
      <ProfileMobileHeader title="Privacy Policy" />

      <div className="profile-policy">
        <p className="profile-policy__updated">
          <Calendar size={14} /> Last Updated: April 2026
        </p>

        <p className="profile-policy__intro">
          At <strong>ECOSHID</strong>, we prioritize the protection of your industrial and personal data.
        </p>

        <section>
          <h3><Shield size={18} /> 1. Information Infrastructure</h3>
          <ul>
            <li>Encrypted storage of user credentials.</li>
            <li>Secure capture of device telemetry data.</li>
            <li>Protected mapping of device locations and categories.</li>
          </ul>
        </section>

        <section>
          <h3><Zap size={18} /> 2. Data Processing</h3>
          <p>Aggregated data is used to optimize energy usage and predictive maintenance alerts.</p>
        </section>

        <section>
          <h3><Mail size={18} /> 3. Contact</h3>
          <p>Privacy inquiries: arabym702@gmail.com</p>
        </section>

        <p className="profile-policy__copy">ECOSHID © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
