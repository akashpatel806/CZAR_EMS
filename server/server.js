const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { connectToDB } = require('./config/db');
const { checkAndResetLeaves, scheduleLeaveReset } = require('./utils/leaveResetScheduler');

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: ['http://localhost:5173', 'https://czarcore.netlify.app', /\.netlify\.app$/],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

const startServer = async () => {
  await connectToDB();
  
  // ✅ Initialize leave reset scheduler
  await checkAndResetLeaves(); // Check and reset if needed on startup
  scheduleLeaveReset(); // Schedule for future resets
  
  app.listen(PORT, () => console.log(`🚀 CzarCore server running on port ${PORT}`));
};

startServer();
