import React, { useState } from 'react';
import { WifiOff, RefreshCw, Globe, Zap, Smartphone, Settings } from 'lucide-react';
import './OfflinePage.css';

const tips = [
  { icon: <Globe size={18} />, text: 'Check if your Wi-Fi or mobile data is turned on.' },
  { icon: <Zap size={18} />, text: 'Restart your router or modem.' },
  { icon: <Smartphone size={18} />, text: 'Try disabling and re-enabling airplane mode.' },
  { icon: <Settings size={18} />, text: 'Move closer to your router or access point.' },
];

export default function OfflinePage() {
  const offline = typeof navigator !== 'undefined' && !navigator.onLine;

  const handleRetry = () => window.location.reload();

  if (!offline) return null;

  return (
    <div className="offline-overlay">
      <div className="offline-card">
        <div className="offline-icon-wrap">
          <WifiOff size={64} strokeWidth={1.5} />
        </div>
        <h2 className="offline-title">No Internet Connection</h2>
        <p className="offline-desc">Please check your internet connection and try again.</p>

        <button className="offline-retry-btn" onClick={handleRetry}>
          <RefreshCw size={18} />
          Retry
        </button>

        <div className="offline-tips-card">
          <h4>Troubleshooting Tips</h4>
          <ul className="offline-tips-list">
            {tips.map((tip, i) => (
              <li key={i}>
                <span className="offline-tip-icon">{tip.icon}</span>
                <span className="offline-tip-text">{tip.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
