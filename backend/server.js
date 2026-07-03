const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
// FORCE PORT 8845 to bypass the ghost server on 8844
const PORT = 8845; 

// Middleware
// Security: Helmet adds 14+ essential HTTP headers to prevent XSS, clickjacking, and sniffing attacks
app.use(helmet({
  crossOriginResourcePolicy: false, // Prevents CORS errors when loading images
}));

// Security: Rate Limiting prevents DDoS and brute-force attacks on the API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  message: { success: false, message: 'Too many requests, please try again later. System secured.' }
});
app.use('/api', apiLimiter);

app.use(cors({
  origin: [
    'http://localhost:7744',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:7744',
    'https://promptbyniti.in',
    'http://promptbyniti.in',
    'https://www.promptbyniti.in'
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
const generateRoutes = require('./routes/generate');
const loungeRoutes = require('./routes/lounge');
const reviewRoutes = require('./routes/reviews');
const youtubeAgentRoutes = require('./routes/youtubeAgent');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/seller', sellerNewRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/lounge', loungeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/youtube-agent', youtubeAgentRoutes);

// Health check
app.get('/', async (req, res) => {
  console.log('🔍 Health check requested');
  let promptCount = 0;
  try {
    const Prompt = require('./models/Prompt');
    promptCount = await Prompt.countDocuments();
    console.log('📊 Prompt count from health check (using model):', promptCount);
  } catch (err) {
    console.error('❌ Error counting prompts in health check:', err.message);
  }

  res.json({ 
    message: "Prompt by Niti API - System Online", 
    port: PORT,
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    readyState: mongoose.connection.readyState,
    dbName: mongoose.connection.name,
    promptCount
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
