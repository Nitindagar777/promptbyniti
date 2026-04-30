const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Prompt = require('../models/Prompt');
const Transaction = require('../models/Transaction');
const Withdrawal = require('../models/Withdrawal');
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
    const completedTransactions = await Transaction.find({ status: 'completed' });
    const totalRevenue = completedTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const allTransactions = await Transaction.find();

    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      stats: {
        usersCount,
        promptsCount,
        pendingPrompts,
        totalRevenue: totalRevenue, 
        salesCount: completedTransactions.length,
        pendingWithdrawals
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

// UPDATE User Ban Status
router.patch('/users/:id/ban', isAdmin, async (req, res) => {
  try {
    const { isBanned } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Prevent banning the admin
    if (user.email === 'nitindagar0800@gmail.com') {
      return res.status(403).json({ success: false, message: 'Cannot ban admin' });
    }

    user.isBanned = isBanned;
    await user.save();
    
    res.json({ success: true, user });
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

// GET All Withdrawal Requests
router.get('/withdrawals', isAdmin, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate('sellerId', 'name email avatar paymentMethod')
      .sort({ createdAt: -1 });
    res.json({ success: true, withdrawals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE Withdrawal Status
router.patch('/withdrawals/:id', isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const withdrawal = await Withdrawal.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    ).populate('sellerId', 'name email avatar paymentMethod');

    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    res.json({ success: true, withdrawal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
