const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');

// Helper function to detect traffic source
const detectTrafficSource = (referrer) => {
  if (!referrer) return 'direct';
  
  const referrerLower = referrer.toLowerCase();
  
  if (referrerLower.includes('facebook.com') || referrerLower.includes('fb.com')) {
    return 'facebook';
  } else if (referrerLower.includes('instagram.com')) {
    return 'instagram';
  } else if (referrerLower.includes('linkedin.com')) {
    return 'linkedin';
  } else if (referrerLower.includes('google.com') || referrerLower.includes('google.') || referrerLower.includes('bing.com') || referrerLower.includes('yahoo.com')) {
    return 'google';
  } else {
    return 'other';
  }
};

// Helper function to get client IP
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
};

// Start a new session
router.post('/session/start', async (req, res) => {
  try {
    const { consentGiven = false, userType = 'user' } = req.body;
    const sessionId = uuidv4();
    const clientIP = getClientIP(req);
    const referrer = req.headers.referer || req.headers.referrer;
    const source = detectTrafficSource(referrer);
    
    // For now, we'll use a simple country detection
    // In production, you might want to use a service like ipapi.co or MaxMind
    let country = 'Unknown';
    let city = 'Unknown';
    
    // Simple IP-based country detection (you can enhance this with a proper service)
    if (clientIP && clientIP !== '::1' && clientIP !== '127.0.0.1') {
      // This is a placeholder - in production use a proper IP geolocation service
      country = 'Greece'; // Default for now
      city = 'Athens'; // Default for now
    }

    const session = new Analytics({
      sessionId,
      userAgent: req.headers['user-agent'],
      ipAddress: clientIP,
      country,
      city,
      referrer,
      source,
      consentGiven,
      userType
    });

    await session.save();

    res.json({
      success: true,
      sessionId,
      message: 'Session started successfully'
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start session'
    });
  }
});

// End a session
router.post('/session/end', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const session = await Analytics.findOne({ sessionId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    await session.endSession();

    res.json({
      success: true,
      message: 'Session ended successfully'
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end session'
    });
  }
});

// Update session (keep alive)
router.post('/session/update', async (req, res) => {
  try {
    const { sessionId, userType } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const session = await Analytics.findOne({ sessionId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Update the session's last activity time
    session.lastActivity = new Date();
    
    // Update userType if provided
    if (userType && (userType === 'admin' || userType === 'user')) {
      session.userType = userType;
    }
    
    await session.save();

    res.json({
      success: true,
      message: 'Session updated successfully'
    });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update session'
    });
  }
});

// Track page view
router.post('/pageview', async (req, res) => {
  try {
    const { sessionId, url, title, pageName } = req.body;
    
    if (!sessionId || !url || !title) {
      return res.status(400).json({
        success: false,
        message: 'Session ID, URL, and title are required'
      });
    }

    const session = await Analytics.findOne({ sessionId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    await session.addPageView(url, title, pageName);

    res.json({
      success: true,
      message: 'Page view tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track page view'
    });
  }
});

// Update consent
router.put('/consent', async (req, res) => {
  try {
    const { sessionId, consentGiven } = req.body;
    
    if (!sessionId || consentGiven === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and consent status are required'
      });
    }

    const session = await Analytics.findOne({ sessionId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    session.consentGiven = consentGiven;
    await session.save();

    res.json({
      success: true,
      message: 'Consent updated successfully'
    });
  } catch (error) {
    console.error('Error updating consent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update consent'
    });
  }
});

// Get analytics summary (admin only)
router.get('/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const summary = await Analytics.getAnalyticsSummary(startDate, endDate);
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics summary'
    });
  }
});

// Get popular pages (admin only)
router.get('/popular-pages', auth, async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    
    const popularPages = await Analytics.getPopularPages(startDate, endDate, parseInt(limit));
    
    res.json({
      success: true,
      data: popularPages
    });
  } catch (error) {
    console.error('Error getting popular pages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular pages'
    });
  }
});

// Get traffic sources (admin only)
router.get('/traffic-sources', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const trafficSources = await Analytics.getTrafficSources(startDate, endDate);
    
    res.json({
      success: true,
      data: trafficSources
    });
  } catch (error) {
    console.error('Error getting traffic sources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get traffic sources'
    });
  }
});

// Get geographic data (admin only)
router.get('/geographic', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const geographicData = await Analytics.getGeographicData(startDate, endDate);
    
    res.json({
      success: true,
      data: geographicData
    });
  } catch (error) {
    console.error('Error getting geographic data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get geographic data'
    });
  }
});

// Get recent sessions (admin only)
router.get('/recent-sessions', auth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const recentSessions = await Analytics.find()
      .sort({ startTime: -1 })
      .limit(parseInt(limit))
      .select('sessionId startTime endTime duration source country city pageViews.length consentGiven userType isActive lastActivity');
    
    // Calculate duration for active sessions
    const sessionsWithDuration = recentSessions.map(session => {
      const sessionObj = session.toObject();
      
      // If session is active (not ended), calculate duration based on current time
      if (sessionObj.isActive) {
        const now = new Date();
        // Use lastActivity if available, otherwise use startTime
        const referenceTime = sessionObj.lastActivity ? new Date(sessionObj.lastActivity) : new Date(sessionObj.startTime);
        sessionObj.duration = Math.floor((now - referenceTime) / 1000);
      }
      
      return sessionObj;
    });
    
    res.json({
      success: true,
      data: sessionsWithDuration
    });
  } catch (error) {
    console.error('Error getting recent sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent sessions'
    });
  }
});

module.exports = router;
