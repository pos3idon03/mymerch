import React, { useState, useEffect } from 'react';
import { FaUsers, FaGlobe, FaClock, FaEye } from 'react-icons/fa';
import axios from 'axios';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState({
    summary: {},
    popularPages: [],
    trafficSources: [],
    geographicData: [],
    recentSessions: []
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  // Debug: Log analyticsData whenever it changes
  useEffect(() => {
    console.log('Analytics data updated:', analyticsData);
  }, [analyticsData]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      const [summaryRes, popularPagesRes, trafficSourcesRes, geographicRes, recentSessionsRes] = await Promise.all([
        axios.get(`/api/analytics/summary?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`/api/analytics/popular-pages?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`/api/analytics/traffic-sources?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`/api/analytics/geographic?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('/api/analytics/recent-sessions?limit=20', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      // Debug: Log the responses to see the structure
      console.log('Summary response:', summaryRes.data);
      console.log('Recent sessions response:', recentSessionsRes.data);

      setAnalyticsData({
        summary: summaryRes.data.data || summaryRes.data || {
          totalSessions: 0,
          totalPageViews: 0,
          avgSessionDuration: 0,
          uniqueCountries: 0
        },
        popularPages: popularPagesRes.data.data || popularPagesRes.data || [],
        trafficSources: trafficSourcesRes.data.data || trafficSourcesRes.data || [],
        geographicData: geographicRes.data.data || geographicRes.data || [],
        recentSessions: recentSessionsRes.data.data || recentSessionsRes.data || []
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'facebook': return '📘';
      case 'instagram': return '📷';
      case 'linkedin': return '💼';
      case 'google': return '🔍';
      case 'direct': return '🌐';
      default: return '🔗';
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <p>Error: {error}</p>
        <button onClick={fetchAnalyticsData} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>📊 Analytics Dashboard</h2>
        <div className="header-actions">
          <div className="date-range-picker">
            <label>Date Range:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="analytics-summary">
        <div className="summary-card">
          <div className="summary-icon">
            <FaUsers />
          </div>
          <div className="summary-content">
            <h3>{analyticsData.summary.totalSessions || analyticsData.recentSessions.length || 0}</h3>
            <p>Total Sessions</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <FaEye />
          </div>
          <div className="summary-content">
            <h3>{analyticsData.summary.totalPageViews || 0}</h3>
            <p>Page Views</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <FaClock />
          </div>
          <div className="summary-content">
            <h3>{formatDuration(analyticsData.summary.avgSessionDuration || 0)}</h3>
            <p>Avg. Session</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <FaGlobe />
          </div>
          <div className="summary-content">
            <h3>{analyticsData.summary.uniqueCountries || 0}</h3>
            <p>Countries</p>
          </div>
        </div>
      </div>

      {/* Charts and Data */}
      <div className="analytics-content">
        {/* Popular Pages */}
        <div className="analytics-section">
          <h3>🔥 Most Popular Pages</h3>
          <div className="popular-pages">
            {analyticsData.popularPages.map((page, index) => (
              <div key={index} className="page-item">
                <div className="page-rank">#{index + 1}</div>
                <div className="page-info">
                  <div className="page-title">{page.title}</div>
                  <div className="page-url">{page.url}</div>
                </div>
                <div className="page-visits">{page.visits} visits</div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="analytics-section">
          <h3>📈 Traffic Sources</h3>
          <div className="traffic-sources">
            {analyticsData.trafficSources.map((source, index) => (
              <div key={index} className="source-item">
                <div className="source-icon">
                  {getSourceIcon(source._id)}
                </div>
                <div className="source-info">
                  <div className="source-name">{source._id}</div>
                  <div className="source-sessions">{source.sessions} sessions</div>
                </div>
                <div className="source-percentage">
                  {Math.round((source.sessions / analyticsData.summary.totalSessions) * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Data */}
        <div className="analytics-section">
          <h3>🌍 Geographic Distribution</h3>
          <div className="geographic-data">
            {analyticsData.geographicData.map((location, index) => (
              <div key={index} className="location-item">
                <div className="location-name">{location._id}</div>
                <div className="location-sessions">{location.sessions} sessions</div>
                <div className="location-bar">
                  <div 
                    className="location-bar-fill"
                    style={{ 
                      width: `${(location.sessions / analyticsData.summary.totalSessions) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="analytics-section full-width">
          <h3>🕒 Recent Sessions</h3>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Start Time</th>
                  <th>Duration</th>
                  <th>Source</th>
                  <th>Location</th>
                  <th>Pages</th>
                  <th>Consent</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.recentSessions.map((session, index) => (
                  <tr key={index}>
                    <td>{session.sessionId.substring(0, 8)}...</td>
                    <td>{formatDate(session.startTime)}</td>
                    <td>{formatDuration(session.duration)}</td>
                    <td>{getSourceIcon(session.source)} {session.source}</td>
                    <td>{session.country}, {session.city}</td>
                    <td>{session.pageViews?.length || 0} pages</td>
                    <td>
                      {session.consentGiven ? '✅' : '❌'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {analyticsData.recentSessions.length === 0 && (
              <div className="empty-state">
                <p>No recent sessions found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
