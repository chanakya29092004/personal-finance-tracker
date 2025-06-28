const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { requestMonitor, userActivityTracker } = require('./middleware/monitoring');

// Load environment variables
dotenv.config();

const app = express();

// Monitoring middleware (before other middleware)
app.use(requestMonitor);

// Middleware
app.use(cors());
app.use(express.json());

// Add user activity tracking after auth middleware
app.use(userActivityTracker);

// Serve static files (for monitoring dashboard)
app.use('/public', express.static('public'));

// Monitoring dashboard route
app.get('/monitoring', (req, res) => {
  res.sendFile(__dirname + '/public/monitoring-dashboard.html');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/monitoring', require('./routes/monitoring'));

// Enhanced health check endpoint
app.get('/api/health', (req, res) => {
  const { requestAnalytics } = require('./middleware/monitoring');
  
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'finance-tracker-backend',
    version: process.env.npm_package_version || '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    requests: {
      total: requestAnalytics.totalRequests,
      activeUsers: requestAnalytics.activeUsers.size
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('Database connection error:', error);
  process.exit(1);
});

module.exports = app;
