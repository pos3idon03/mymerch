import React, { useState, useEffect } from 'react';
import './CookieConsent.css';
import analyticsService from '../services/analytics';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [customConsent, setCustomConsent] = useState({
    necessary: true,
    analytics: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setShowBanner(true);
    } else {
      const consent = JSON.parse(cookieConsent);
      setConsentGiven(consent.analytics);
      
      // If analytics consent was given, start tracking
      if (consent.analytics) {
        startAnalyticsTracking();
      }
    }
  }, []);

  const startAnalyticsTracking = () => {
    // Only start analytics if not already tracking and not resuming a session
    if (!analyticsService.isTracking && !analyticsService.isResumingSession) {
      analyticsService.initializeTracking();
    }
  };

  const handleAcceptAll = () => {
    const consent = {
      necessary: true,
      analytics: true,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    setConsentGiven(true);
    setShowBanner(false);
    startAnalyticsTracking();
  };

  const handleAcceptNecessary = () => {
    const consent = {
      necessary: true,
      analytics: false,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    setConsentGiven(false);
    setShowBanner(false);
  };

  const handleCustomize = () => {
    setShowCustomizeModal(true);
  };

  const handleCustomConsent = () => {
    const consent = {
      ...customConsent,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    setConsentGiven(customConsent.analytics);
    setShowBanner(false);
    setShowCustomizeModal(false);
    
    if (customConsent.analytics) {
      startAnalyticsTracking();
    }
  };

  const handleCustomizeClose = () => {
    setShowCustomizeModal(false);
    setCustomConsent({
      necessary: true,
      analytics: false
    });
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      <div className="cookie-consent-banner">
        <div className="cookie-content">
          <div className="cookie-text">
            <h3>🍪 We use cookies</h3>
            <p>
              We use cookies to enhance your browsing experience, analyze site traffic, 
              and understand where our visitors are coming from. By clicking "Accept All", 
              you consent to our use of cookies for analytics purposes.
            </p>
            <p className="cookie-details">
              <strong>Necessary cookies:</strong> Required for the website to function properly<br/>
              <strong>Analytics cookies:</strong> Help us understand how visitors use our website
            </p>
          </div>
          
          <div className="cookie-actions">
            <button 
              className="btn btn-reject" 
              onClick={handleAcceptNecessary}
            >
              Reject All
            </button>
            <button 
              className="btn btn-customize" 
              onClick={handleCustomize}
            >
              Customize
            </button>
            <button 
              className="btn btn-accept" 
              onClick={handleAcceptAll}
            >
              Accept All
            </button>
          </div>
        </div>
      </div>

      {showCustomizeModal && (
        <div className="customize-modal-overlay">
          <div className="customize-modal">
            <div className="modal-header">
              <h3>🍪 Cookie Preferences</h3>
              <button className="close-btn" onClick={handleCustomizeClose}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="cookie-option">
                <label className="cookie-option-label">
                  <input
                    type="checkbox"
                    checked={customConsent.necessary}
                    disabled
                    readOnly
                  />
                  <span className="checkmark"></span>
                  <div className="option-text">
                    <strong>Necessary Cookies</strong>
                    <small>Required for the website to function properly. These cannot be disabled.</small>
                  </div>
                </label>
              </div>
              
              <div className="cookie-option">
                <label className="cookie-option-label">
                  <input
                    type="checkbox"
                    checked={customConsent.analytics}
                    onChange={(e) => setCustomConsent(prev => ({...prev, analytics: e.target.checked}))}
                  />
                  <span className="checkmark"></span>
                  <div className="option-text">
                    <strong>Analytics Cookies</strong>
                    <small>Help us understand how visitors use our website to improve user experience.</small>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="btn btn-customize" onClick={handleCustomizeClose}>
                Cancel
              </button>
              <button className="btn btn-accept" onClick={handleCustomConsent}>
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;
