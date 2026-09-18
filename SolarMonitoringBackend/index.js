const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mqttService = require('./services/mqttHandler');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const historyRoutes = require('./routes/history');

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/history', historyRoutes);

// Base route for health check
app.get('/', (req, res) => {
  res.json({ message: 'Solar Monitoring API is running' });
});

// Start the server
app.listen(port, () => {
  console.log(`[Server] API is running on port ${port}`);
  
  // Initialize MQTT after server starts
  mqttService.initMQTT();
});
