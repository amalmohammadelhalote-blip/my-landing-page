import React from 'react';
import './ErrorState.css';

export default function ErrorState({ code, message, details, onRetry }) {
  // Prefer API-provided status and messages. Avoid showing 'Network Error' label.
  const codeText = details?.response?.status || details?.status || code || 'Error';
  const displayMessage =
    details?.response?.data?.message ||
    details?.response?.data?.error ||
    details?.userMessage ||
    message ||
    'Application unavailable';

  return (
    <div className="error-state-root">
      <div className="error-card">
        <div className="error-illustration">
          <div className="icon-circle">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 3a8 8 0 1 0 8 8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 4l-5 5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="error-content">
          <div className="error-code">{codeText}</div>
          <h2 className="error-title">{displayMessage}</h2>
          {details && details.response && details.response.data && details.response.data.detail && (
            <p className="error-details">{details.response.data.detail}</p>
          )}

          <div className="error-actions">
            <button className="btn-try" onClick={() => (onRetry ? onRetry() : window.location.reload())}>
              ⟳ Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
