class AnalyticsService {
  constructor() {
    this.sessionId = null;
    this.sessionStartTime = null;
    this.isTracking = false;
    this.initializing = false;
    this.hiddenStartTime = null;
    this.sessionTimeout = null;
    this.pageViewTimeout = null;
    this.isResumingSession = false;
    
    // For local development, always use relative URLs
    // For production, use the environment variable
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      this.baseURL = '';
    } else {
      this.baseURL = process.env.REACT_APP_API_URL || '';
    }
    
    // Check for existing session first, before checking consent
    this.checkForExistingSession();
    
    // If no existing session, check consent
    if (!this.isResumingSession) {
      this.checkConsent();
    }
  }

  checkForExistingSession() {
    console.log('Analytics: checkForExistingSession called');
    // Check if we have an existing session cookie
    const existingSessionId = this.getCookie('analytics_session_id');
    console.log('Analytics: existingSessionId =', existingSessionId);
    
    if (existingSessionId) {
      // Check if consent was given
      const consent = localStorage.getItem('cookieConsent');
      console.log('Analytics: consent =', consent);
      
      if (consent) {
        const consentData = JSON.parse(consent);
        if (consentData.analytics) {
          // Resume existing session
          this.sessionId = existingSessionId;
          this.sessionStartTime = new Date(); // Reset start time for current page load
          this.isTracking = true;
          this.isResumingSession = true;
          console.log('Analytics: Resuming existing session:', this.sessionId);
          
          // Set up listeners without creating a new session
          this.setupPageVisibilityListener();
          this.setupBeforeUnloadListener();
          this.setupRouteChangeListener();
          this.setupPeriodicUpdates();
          
          // Track the current page view
          this.trackPageView();
        } else {
          console.log('Analytics: No analytics consent, not resuming session');
        }
      } else {
        console.log('Analytics: No consent data, not resuming session');
      }
    } else {
      console.log('Analytics: No existing session cookie found');
    }
  }

  checkConsent() {
    const consent = localStorage.getItem('cookieConsent');
    if (consent) {
      const consentData = JSON.parse(consent);
      
      if (consentData.analytics) {
        this.initializeTracking();
      }
    }
  }

  setCookie(name, value, hours) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (hours * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  async initializeTracking() {
    // Prevent multiple session initialization
    if (this.isTracking && this.sessionId) {
      console.log('Analytics already initialized, skipping...');
      return;
    }

    // Add a flag to prevent concurrent initialization
    if (this.initializing) {
      console.log('Analytics initialization already in progress, skipping...');
      return;
    }

    this.initializing = true;

    try {
      // Determine if this is an admin session - check multiple conditions
      const isAdminSession = window.location.pathname.startsWith('/admin') || 
                            window.location.pathname.includes('admin') ||
                            document.title.includes('Admin') ||
                            document.querySelector('.admin-sidebar') !== null ||
                            document.querySelector('.admin-panel') !== null ||
                            document.querySelector('[class*="admin"]') !== null;
      
      console.log('Detected admin session:', isAdminSession, 'for path:', window.location.pathname, 'title:', document.title);
      
      // Start a new session
      const response = await fetch(`${this.baseURL}/api/analytics/session/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consentGiven: true,
          userType: isAdminSession ? 'admin' : 'user'
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.sessionId = data.sessionId;
        this.sessionStartTime = new Date();
        this.isTracking = true;
        
        // Store session ID in a cookie for persistence
        this.setCookie('analytics_session_id', this.sessionId, 24); // 24 hours
        
        // Track the initial page view
        this.trackPageView();
        
        // Set up page visibility change listener
        this.setupPageVisibilityListener();
        
        // Set up beforeunload listener
        this.setupBeforeUnloadListener();
        
        // Set up route change listener for SPA navigation
        this.setupRouteChangeListener();
        
        // Set up periodic session updates
        this.setupPeriodicUpdates();
        
        console.log('Analytics tracking initialized for', isAdminSession ? 'admin' : 'user');
      } else {
        console.warn('Analytics session start failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to initialize analytics tracking:', error);
      // Don't throw the error, just log it and continue
    } finally {
      this.initializing = false;
    }
  }

  setupPageVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden, start a timeout to end session after 30 minutes of inactivity
        this.hiddenStartTime = Date.now();
        this.sessionTimeout = setTimeout(() => {
          this.endSession();
        }, 30 * 60 * 1000); // 30 minutes
      } else {
        // Page is visible again, clear the timeout
        if (this.sessionTimeout) {
          clearTimeout(this.sessionTimeout);
          this.sessionTimeout = null;
        }
        
        // If we're not tracking, start a new session
        if (!this.isTracking) {
          this.initializeTracking();
        }
      }
    });
  }

  setupBeforeUnloadListener() {
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  }

  setupPeriodicUpdates() {
    // Update session every 30 seconds to ensure it stays active
    this.updateInterval = setInterval(() => {
      if (this.isTracking && this.sessionId) {
        this.updateSession();
      }
    }, 30000); // 30 seconds
  }

  async updateSession() {
    if (!this.isTracking || !this.sessionId) return;

    try {
      // Check if we need to update userType
      const isAdminSession = window.location.pathname.startsWith('/admin') || 
                            window.location.pathname.includes('admin') ||
                            document.title.includes('Admin') ||
                            document.querySelector('.admin-sidebar') !== null ||
                            document.querySelector('.admin-panel') !== null ||
                            document.querySelector('[class*="admin"]') !== null;

      const response = await fetch(`${this.baseURL}/api/analytics/session/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          userType: isAdminSession ? 'admin' : 'user'
        })
      });

      if (!response.ok) {
        console.warn('Session update failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  }

  setupRouteChangeListener() {
    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', () => {
      this.trackPageView();
    });

    // For React Router, we need to listen to history changes
    // This will be called when the route changes
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = (...args) => {
      originalPushState.apply(window.history, args);
      setTimeout(() => this.trackPageView(), 100); // Small delay to ensure DOM is updated
    };

    window.history.replaceState = (...args) => {
      originalReplaceState.apply(window.history, args);
      setTimeout(() => this.trackPageView(), 100);
    };
  }

  async trackPageView() {
    if (!this.isTracking || !this.sessionId) return;

    // Debounce page view tracking to prevent rapid calls
    if (this.pageViewTimeout) {
      clearTimeout(this.pageViewTimeout);
    }

    this.pageViewTimeout = setTimeout(async () => {
      try {
        const currentUrl = window.location.pathname;
        const currentTitle = document.title || 'Unknown Page';
        
        // Get a more descriptive page name
        let pageName = this.getPageName(currentUrl, currentTitle);

        const response = await fetch(`${this.baseURL}/api/analytics/pageview`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: this.sessionId,
            url: currentUrl,
            title: currentTitle,
            pageName: pageName
          })
        });

        if (!response.ok) {
          console.warn('Page view tracking failed:', response.status, response.statusText);
        } else {
          console.log('Page view tracked:', pageName);
        }
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    }, 500); // 500ms debounce
  }

  getPageName(url, title) {
    // Map URLs to more descriptive names
    const pageMap = {
      '/': 'Home',
      '/products': 'Products',
      '/blog': 'Blog',
      '/about': 'About Us',
      '/contact': 'Contact',
      '/faq': 'FAQ',
      '/privacy': 'Privacy Policy',
      '/terms': 'Terms of Service',
      '/sitemap': 'Sitemap',
      '/our-works': 'Our Works',
      '/test-your-idea': 'Test Your Idea'
    };

    // Check for admin pages
    if (url.startsWith('/admin')) {
      const adminPage = url.replace('/admin', '').replace('/', '') || 'Dashboard';
      return `Admin - ${adminPage.charAt(0).toUpperCase() + adminPage.slice(1)}`;
    }

    // Check for product detail pages
    if (url.startsWith('/products/') && url !== '/products') {
      return 'Product Detail';
    }

    // Check for blog detail pages
    if (url.startsWith('/blog/') && url !== '/blog') {
      return 'Blog Post';
    }

    // Return mapped name or extract from title
    return pageMap[url] || title.replace(' | MyMerch', '');
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

      // Clear session cookie
      this.setCookie('analytics_session_id', '', -1); // Expire immediately
      
      this.sessionId = null;
      this.sessionStartTime = null;
      this.isTracking = false;
    } catch (error) {
      console.error('Failed to end session:', error);
      // Clear session cookie even if API call failed
      this.setCookie('analytics_session_id', '', -1); // Expire immediately
      
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

  // Method to manually track page views (for React Router integration)
  trackPageViewManual() {
    this.trackPageView();
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
