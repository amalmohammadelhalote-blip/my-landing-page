import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EmptyState.css';

const PeopleTryingConnect = () => (
  <svg width="240" height="180" viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Person 1 (left) */}
    <circle cx="60" cy="45" r="18" stroke="#22c55e" strokeWidth="2.5" fill="rgba(34,197,94,0.08)" />
    <line x1="60" y1="63" x2="60" y2="110" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="60" y1="75" x2="40" y2="100" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="60" y1="75" x2="80" y2="100" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="60" y1="110" x2="40" y2="145" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="60" y1="110" x2="80" y2="145" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
    {/* Left arm reaching out */}
    <line x1="80" y1="80" x2="110" y2="70" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />

    {/* Person 2 (right) */}
    <circle cx="180" cy="45" r="18" stroke="#22c55e" strokeWidth="2.5" fill="rgba(34,197,94,0.08)" />
    <line x1="180" y1="63" x2="180" y2="110" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="180" y1="75" x2="160" y2="100" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="180" y1="75" x2="200" y2="100" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="180" y1="110" x2="160" y2="145" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="180" y1="110" x2="200" y2="145" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
    {/* Right arm reaching out */}
    <line x1="160" y1="80" x2="130" y2="70" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />

    {/* Device in the middle */}
    <rect x="107" y="55" width="26" height="30" rx="5" stroke="#facc15" strokeWidth="2" fill="rgba(250,204,21,0.08)" />
    <line x1="120" y1="60" x2="120" y2="80" stroke="#facc15" strokeWidth="1.5" />
    <circle cx="120" cy="70" r="3" fill="#facc15" />

    {/* Broken connection line */}
    <line x1="110" y1="68" x2="80" y2="60" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />
    <line x1="130" y1="68" x2="160" y2="60" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />
    <text x="115" y="42" textAnchor="middle" fontSize="11" fill="#ef4444" fontWeight="700">?</text>

    {/* Wifi/connection indicator */}
    <line x1="95" y1="52" x2="100" y2="56" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="145" y1="52" x2="140" y2="56" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function EmptyState({ type = 'device' }) {
  const navigate = useNavigate();

  const isDevice = type === 'device';

  return (
    <div className="empty-state-container">
      <div className="empty-state-content">
        <div className="empty-state-illustration">
          <PeopleTryingConnect />
        </div>
        <h2 className="empty-state-title">
          {isDevice ? 'No device connected' : 'No reports available'}
        </h2>
        {!isDevice && (
          <p className="empty-state-desc">
            Connect a device first to start generating reports
          </p>
        )}
        <button
          className="empty-state-btn"
          onClick={() => navigate('/dashboard/devices/add')}
        >
          Add New Device
        </button>
      </div>
    </div>
  );
}
