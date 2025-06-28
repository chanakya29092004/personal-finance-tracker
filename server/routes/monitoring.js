const express = require('express');
const router = express.Router();
const { getAnalytics, getLiveStats, resetAnalytics } = require('../middleware/monitoring');
const { authMiddleware } = require('../middleware/auth');

// GET /api/monitoring/analytics - Get comprehensive analytics
router.get('/analytics', getAnalytics);

// GET /api/monitoring/live - Get real-time stats
router.get('/live', getLiveStats);

// GET /api/monitoring/dashboard - Get monitoring dashboard data
router.get('/dashboard', (req, res) => {
  const dashboardData = {
    message: 'Personal Finance Tracker - Monitoring Dashboard',
    endpoints: {
      analytics: '/api/monitoring/analytics',
      liveStats: '/api/monitoring/live',
      userActivity: '/api/monitoring/user-activity',
      systemHealth: '/api/health'
    },
    instructions: {
      analytics: 'Complete server analytics and user activity',
      liveStats: 'Real-time statistics updated every request',
      userActivity: 'Recent user activities and sessions',
      systemHealth: 'Server health and database status'
    }
  };
  
  res.json(dashboardData);
});

// GET /api/monitoring/user-activity - Get recent user activities
router.get('/user-activity', (req, res) => {
  const activities = global.userActivities || {};
  
  const userActivitySummary = Object.entries(activities).map(([userId, userActivities]) => ({
    userId,
    totalActivities: userActivities.length,
    lastActivity: userActivities[0]?.timestamp,
    recentEndpoints: [...new Set(userActivities.slice(0, 10).map(a => a.endpoint))],
    activities: userActivities.slice(0, 10) // Last 10 activities
  }));
  
  res.json({
    totalActiveUsers: userActivitySummary.length,
    users: userActivitySummary
  });
});

// POST /api/monitoring/reset - Reset analytics (admin only, for testing)
router.post('/reset', resetAnalytics);

module.exports = router;
