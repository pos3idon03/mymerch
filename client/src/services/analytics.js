class AnalyticsService {
  constructor() {
    this.sessionId = null;
    this.sessionStartTime = null;
    this.isTracking = false;
    
    // For local development, always use relative URLs
    // For production, use the environment variable
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      this.baseURL = '';
    } else {
      this.baseURL = process.env.REACT_APP_API_URL || '';
    }
    
    // Check if analytics consent was given
    this.checkConsent();
  }

  checkConsent() {
    const consent = localStorage.getItem('cookieConsent');
    if (consent) {
      const consentData = JSON.parse(consent);
      this.isTracking = consentData.analytics;
      
      if (this.isTracking) {
        this.initializeTracking();
      }
    }
  }

  async initializeTracking() {
    try {
      // Start a new session
      const response = await fetch(`${this.baseURL}/api/analytics/session/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consentGiven: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.sessionId = data.sessionId;
        this.sessionStartTime = new Date();
        this.isTracking = true;
        
        // Track the initial page view
        this.trackPageView();
        
        // Set up page visibility change listener
        this.setupPageVisibilityListener();
        
        // Set up beforeunload listener
        this.setupBeforeUnloadListener();
        
        console.log('Analytics tracking initialized');
      } else {
        console.warn('Analytics session start failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to initialize analytics tracking:', error);
      // Don't throw the error, just log it and continue
    }
  }

  setupPageVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden, end session
        this.endSession();
      } else if (!this.isTracking) {
        // Page is visible again and we're not tracking, start new session
        this.initializeTracking();
      }
    });
  }

  setupBeforeUnloadListener() {
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  }

  async trackPageView() {
    if (!this.isTracking || !this.sessionId) return;

    try {
      const currentUrl = window.location.pathname;
      const currentTitle = document.title || 'Unknown Page';

      const response = await fetch(`${this.baseURL}/api/analytics/pageview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          url: currentUrl,
          title: currentTitle
        })
      });

      if (!response.ok) {
        console.warn('Page view tracking failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  async endSession() {
    if (!this.isTracking || !this.sessionId) return;

    try {
      const response = await fetch(`${this.baseURL}/api/analytics/session/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId
        })
      });

      if (!response.ok) {
        console.warn('Session end failed:', response.status, response.statusText);
      }

      this.sessionId = null;
      this.sessionStartTime = null;
      this.isTracking = false;
    } catch (error) {
      console.error('Failed to end session:', error);
      // Reset tracking state even if the request failed
      this.sessionId = null;
      this.sessionStartTime = null;
      this.isTracking = false;
    }
  }

  // Method to update consent status
  async updateConsent(consentGiven) {
    if (this.sessionId) {
      try {
        const response = await fetch(`${this.baseURL}/api/analytics/consent`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: this.sessionId,
            consentGiven
          })
        });

        if (!response.ok) {
          console.warn('Consent update failed:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Failed to update consent:', error);
      }
    }

    if (consentGiven) {
      this.initializeTracking();
    } else {
      this.endSession();
    }
  }

  // Method to manually track custom events (optional)
  async trackEvent(eventName, eventData = {}) {
    if (!this.isTracking || !this.sessionId) return;

    try {
      // You can extend this to track custom events
      console.log('Custom event tracked:', eventName, eventData);
    } catch (error) {
      console.error('Failed to track custom event:', error);
    }
  }

  // Get current tracking status
  getTrackingStatus() {
    return {
      isTracking: this.isTracking,
      sessionId: this.sessionId,
      sessionStartTime: this.sessionStartTime
    };
  }
}

// Create a singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService;
