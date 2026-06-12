import React, { useState, useEffect, useRef } from 'react';
import { WifiOff, RefreshCw, Globe, Zap, Smartphone, Settings } from 'lucide-react';
import './OfflinePage.css';

const tips = [
  { icon: <Globe size={18} />, text: 'Check if your Wi-Fi or mobile data is turned on.' },
  { icon: <Zap size={18} />, text: 'Restart your router or modem.' },
  { icon: <Smartphone size={18} />, text: 'Try disabling and re-enabling airplane mode.' },
  { icon: <Settings size={18} />, text: 'Move closer to your router or access point.' },
];

function checkNow() {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => { img.src = ''; resolve(false); }, 4000);
    img.onload = () => { clearTimeout(timer); resolve(true); };
    img.onerror = () => { clearTimeout(timer); resolve(false); };
    img.src = 'https://www.google.com/favicon.ico?_=' + Date.now();
  });
}

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const goOnline = () => { if (!cancelled) setIsOnline(true); };
    const goOffline = () => { if (!cancelled) setIsOnline(false); };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    // Initial check
    checkNow().then((online) => { if (!cancelled) setIsOnline(online); });

    // Periodic check
    const poll = setInterval(async () => {
      const online = await checkNow();
      if (!cancelled) setIsOnline(online);
    }, 5000);

    return () => {
      cancelled = true;
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      clearInterval(poll);
    };
  }, []);

  const handleRetry = () => window.location.reload();

  if (isOnline) return null;

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
