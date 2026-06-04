const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Review = require('../models/Review');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    if (user.isBanned) return res.status(403).json({ success: false, message: 'Your account has been banned.' });
    
    req.userId = decoded.id;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
};

// GET /api/reviews — Fetch latest 20 reviews (public, no auth needed)
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/reviews — Submit a new review (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const { quote, stars } = req.body;

    if (!quote || !quote.trim()) {
      return res.status(400).json({ success: false, message: 'Review text is required' });
    }
    if (stars === undefined || stars < 0.5 || stars > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 0.5 and 5' });
    }

    const newReview = new Review({
      quote: quote.trim(),
      stars,
      name: req.user.name || req.user.email.split('@')[0] || 'AI Artist',
      avatar: req.user.avatar || '',
      userId: req.userId
    });

    await newReview.save();

    res.status(201).json({ success: true, review: newReview });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
