const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Prompt = require('../models/Prompt');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'No token' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid session' });
  }
};

// GET: Fetch Buyer Stats & Library
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: 'purchasedPrompts',
      populate: { path: 'seller', select: 'name avatar' }
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Calculate real total spent by summing the prices of all purchased prompts
    const totalSpent = user.purchasedPrompts.reduce((sum, p) => {
      const price = p.priceTokens || p.tokens || 5;
      return sum + price;
    }, 0);
    
    res.json({
      success: true,
      stats: {
        totalPurchased: user.purchasedPrompts.length,
        totalSpent: totalSpent,
        library: user.purchasedPrompts.sort((a, b) => b.createdAt - a.createdAt),
        credits: user.credits
      }
    });
  } catch (err) {
    console.error('Buyer stats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
