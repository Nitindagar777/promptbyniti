const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
// FORCE PORT 8845 to bypass the ghost server on 8844
const PORT = 8845; 

// Middleware
app.use(cors({
  origin: [
    'http://localhost:7744',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:7744',
    'https://oopsverse.cloud',
    'http://oopsverse.cloud',
    'https://www.oopsverse.cloud'
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🍃 MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  }
};

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Routes
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');
const promptRoutes = require('./routes/prompts');
const sellerNewRoutes = require('./routes/seller_new');
const buyerRoutes = require('./routes/buyer');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/seller', sellerNewRoutes);
app.use('/api/buyer', buyerRoutes);

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
  app.listen(PORT, () => {
    console.log(`🚀 Backend server is running on port ${PORT}`);
    console.log(`✅ Payment Method route is active at: http://localhost:${PORT}/api/seller/payment-method`);
  });
};

start();
