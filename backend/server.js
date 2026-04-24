const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8844;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:7744',
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🍃 MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    // Don't exit process in development if DB is not critical for startup
  }
};

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verify Cloudinary connection
const verifyCloudinary = async () => {
  try {
    const result = await cloudinary.api.ping();
    if (result.status === 'ok') {
      console.log('☁️  Cloudinary connected successfully');
    }
  } catch (err) {
    console.error('❌ Cloudinary configuration error:', err.message);
  }
};

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: "Prompt by Niti API - System Online", 
    port: PORT,
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Start Server
const start = async () => {
  await connectDB();
  await verifyCloudinary();
  
  app.listen(PORT, () => {
    console.log(`🚀 Backend server is running on port ${PORT}`);
  });
};

start();
