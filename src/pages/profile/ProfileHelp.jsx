import React from 'react';
import { Mail, Phone, HelpCircle } from 'lucide-react';
import ProfileMobileHeader from './ProfileMobileHeader';

export default function ProfileHelp() {
  return (
    <div className="profile-sub-page profile-sub-page--scroll">
      <ProfileMobileHeader title="Help Center" />

      <div className="profile-help-list">
        <a className="profile-help-card" href="mailto:arabym702@gmail.com">
          <Mail size={22} />
          <div>
            <h4>Official Support</h4>
            <p>arabym702@gmail.com</p>
          </div>
        </a>

        <a className="profile-help-card" href="tel:+01012209503">
          <Phone size={22} />
          <div>
            <h4>Direct Line</h4>
            <p>+01012209503</p>
            <span>Sun - Thu, 9 AM - 6 PM</span>
          </div>
        </a>

        <div className="profile-help-card profile-help-card--static">
          <HelpCircle size={22} />
          <div>
            <h4>Technical Documentation</h4>
            <p>Guides for device integration and API usage.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
