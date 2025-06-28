const express = require('express');

// Simple in-memory store for request analytics
let requestAnalytics = {
  totalRequests: 0,
  requestsByEndpoint: {},
  requestsByIP: {},
  requestsByUserAgent: {},
  activeUsers: new Set(),
  recentRequests: [],
  serverStartTime: new Date(),
  errors: []
};

// Request monitoring middleware
const requestMonitor = (req, res, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  // Extract request information
  const requestInfo = {
    id: requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    userId: req.user?.id || 'anonymous'
  };

  // Update analytics
  requestAnalytics.totalRequests++;
  
  // Track endpoint usage
  const endpoint = `${req.method} ${req.route?.path || req.originalUrl}`;
  requestAnalytics.requestsByEndpoint[endpoint] = 
    (requestAnalytics.requestsByEndpoint[endpoint] || 0) + 1;
  
  // Track IP addresses
  requestAnalytics.requestsByIP[requestInfo.ip] = 
    (requestAnalytics.requestsByIP[requestInfo.ip] || 0) + 1;
  
  // Track user agents
  if (requestInfo.userAgent) {
    requestAnalytics.requestsByUserAgent[requestInfo.userAgent] = 
      (requestAnalytics.requestsByUserAgent[requestInfo.userAgent] || 0) + 1;
  }
  
  // Track active users
  if (requestInfo.userId !== 'anonymous') {
    requestAnalytics.activeUsers.add(requestInfo.userId);
  }
  
  // Store recent requests (keep last 100)
  requestAnalytics.recentRequests.unshift(requestInfo);
  if (requestAnalytics.recentRequests.length > 100) {
    requestAnalytics.recentRequests.pop();
  }

  // Log request
  console.log(`📊 [${requestInfo.timestamp}] ${requestInfo.method} ${requestInfo.url} - IP: ${requestInfo.ip} - User: ${requestInfo.userId}`);

  // Override res.end to capture response time and status
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    
    // Update request info with response data
    requestInfo.statusCode = res.statusCode;
    requestInfo.responseTime = responseTime;
    requestInfo.responseSize = res.get('Content-Length') || 0;
    
    // Log response
    const statusEmoji = res.statusCode >= 400 ? '❌' : '✅';
    console.log(`${statusEmoji} [${requestInfo.id}] ${res.statusCode} - ${responseTime}ms`);
    
    // Track errors
    if (res.statusCode >= 400) {
      requestAnalytics.errors.unshift({
        ...requestInfo,
        error: args[0] || 'Unknown error'
      });
      // Keep last 50 errors
      if (requestAnalytics.errors.length > 50) {
        requestAnalytics.errors.pop();
      }
    }
    
    originalEnd.apply(this, args);
  };

  next();
};

// Real-time user activity tracker
const userActivityTracker = (req, res, next) => {
  if (req.user?.id) {
    // Update user's last activity
    const userId = req.user.id;
    const activity = {
      userId,
      endpoint: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress
    };
    
    // Store in recent activity (could be enhanced with Redis for production)
    if (!global.userActivities) {
      global.userActivities = {};
    }
    
    if (!global.userActivities[userId]) {
      global.userActivities[userId] = [];
    }
    
    global.userActivities[userId].unshift(activity);
    // Keep last 20 activities per user
    if (global.userActivities[userId].length > 20) {
      global.userActivities[userId] = global.userActivities[userId].slice(0, 20);
    }
    
    console.log(`👤 User Activity: ${userId} accessed ${req.method} ${req.originalUrl}`);
  }
  next();
};

// Analytics endpoint
const getAnalytics = (req, res) => {
  const uptime = Date.now() - requestAnalytics.serverStartTime.getTime();
  
  // Calculate top endpoints
  const topEndpoints = Object.entries(requestAnalytics.requestsByEndpoint)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  // Calculate top IPs
  const topIPs = Object.entries(requestAnalytics.requestsByIP)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  // Calculate error rate
  const errorRate = requestAnalytics.errors.length / requestAnalytics.totalRequests * 100;
  
  // Recent user activities
  const recentUserActivities = global.userActivities ? 
    Object.entries(global.userActivities)
      .flatMap(([userId, activities]) => 
        activities.slice(0, 5).map(activity => ({ ...activity, userId }))
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20) : [];

  const analytics = {
    server: {
      status: 'running',
      uptime: Math.floor(uptime / 1000), // seconds
      startTime: requestAnalytics.serverStartTime,
      version: process.env.npm_package_version || '1.0.0'
    },
    requests: {
      total: requestAnalytics.totalRequests,
      errorRate: Math.round(errorRate * 100) / 100,
      averagePerMinute: Math.round((requestAnalytics.totalRequests / (uptime / 60000)) * 100) / 100
    },
    users: {
      activeUsersCount: requestAnalytics.activeUsers.size,
      activeUserIds: Array.from(requestAnalytics.activeUsers).slice(0, 10),
      recentActivities: recentUserActivities
    },
    topEndpoints,
    topIPs,
    recentRequests: requestAnalytics.recentRequests.slice(0, 20),
    recentErrors: requestAnalytics.errors.slice(0, 10),
    performance: {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    }
  };

  res.json(analytics);
};

// Live monitoring endpoint (for real-time updates)
const getLiveStats = (req, res) => {
  const stats = {
    timestamp: new Date().toISOString(),
    totalRequests: requestAnalytics.totalRequests,
    activeUsers: requestAnalytics.activeUsers.size,
    recentRequests: requestAnalytics.recentRequests.slice(0, 5),
    recentErrors: requestAnalytics.errors.slice(0, 3),
    memoryUsage: process.memoryUsage()
  };
  
  res.json(stats);
};

// Reset analytics (for testing)
const resetAnalytics = (req, res) => {
  requestAnalytics = {
    totalRequests: 0,
    requestsByEndpoint: {},
    requestsByIP: {},
    requestsByUserAgent: {},
    activeUsers: new Set(),
    recentRequests: [],
    serverStartTime: new Date(),
    errorRate: 0,
    errors: []
  };
  
  global.userActivities = {};
  
  res.json({ message: 'Analytics reset successfully' });
};

module.exports = {
  requestMonitor,
  userActivityTracker,
  getAnalytics,
  getLiveStats,
  resetAnalytics,
  requestAnalytics
};
