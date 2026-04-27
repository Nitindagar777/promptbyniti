const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Prompt = require('../models/Prompt');
const Transaction = require('../models/Transaction');
const jwt = require('jsonwebtoken');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'No token' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    const user = await User.findById(decoded.id);
    if (!user || user.email !== 'nitindagar0800@gmail.com') {
      return res.status(403).json({ success: false, message: 'Admin access denied' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// GET Admin Stats
router.get('/stats', isAdmin, async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const promptsCount = await Prompt.countDocuments();
    const pendingPrompts = await Prompt.countDocuments({ status: 'pending' });
    const transactions = await Transaction.find();
    const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

    res.json({
      success: true,
      stats: {
        usersCount,
        promptsCount,
        pendingPrompts,
        totalRevenue: totalRevenue / 100, // Assuming amount is in cents/paise
        salesCount: transactions.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET All Users
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET All Prompts
router.get('/prompts', isAdmin, async (req, res) => {
  try {
    const prompts = await Prompt.find().populate('seller', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, prompts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE Prompt Status
router.patch('/prompts/:id', isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const prompt = await Prompt.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, prompt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET All Transactions
router.get('/transactions', isAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
