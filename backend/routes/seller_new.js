const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Prompt = require('../models/Prompt');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Withdrawal = require('../models/Withdrawal');
const jwt = require('jsonwebtoken');

// Middleware: Auth Check
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    if (user.isBanned) return res.status(403).json({ success: false, message: 'Your account has been banned.' });

    // Auto-verify if they have a valid token but flag is missing
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }
    
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// GET Seller Stats
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const sellerIdObj = new mongoose.Types.ObjectId(req.userId);
    const prompts = await Prompt.find({ seller: sellerIdObj });
    
    // REAL DATA CALCULATIONS
    const totalViews = prompts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalSales = prompts.reduce((sum, p) => sum + (p.sales || 0), 0);
    const totalEarnings = user.walletTokens || 0;
    
    // Calculate total tokens withdrawn
    const completedWithdrawals = await Withdrawal.find({ sellerId: sellerIdObj, status: 'completed' });
    const totalWithdrawn = completedWithdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);

    // Performance Data (Last 7 days sales)
    const dailyTokens = [0, 0, 0, 0, 0, 0, 0]; 
    // In a real scenario, we'd query a 'Sales' model, but here we'll distribute totalSales for the chart
    for (let i = 0; i < 7; i++) {
        dailyTokens[i] = Math.floor(totalSales / 7);
    }

    res.json({
      success: true,
      stats: {
        totalEarnings: totalEarnings,
        totalSales: totalSales,
        totalViews: totalViews,
        activePrompts: prompts.length,
        conversionRate: totalViews > 0 ? ((totalSales / totalViews) * 100).toFixed(1) + '%' : '0%',
        prompts: prompts.sort((a, b) => b.createdAt - a.createdAt),
        recentActivity: [],
        recentPayouts: (await Withdrawal.find({ sellerId: sellerIdObj }).sort({ createdAt: -1 }).limit(10)).map(w => {
          const doc = w.toObject();
          if (doc.status === 'rejected' && !doc.rejectionReason) {
            doc.rejectionReason = "Please contact support for more details regarding this rejection.";
          }
          return doc;
        }),
        dailyEarnings: dailyTokens.map(s => s * 5), // Tokens earned
        performanceGrowth: 0,
        earningGrowth: 0,
        salesGrowth: 0
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST: Request Withdrawal
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount, method, details } = req.body;
    if (!amount || !method || !details) {
      return res.status(400).json({ success: false, message: 'Missing withdrawal details' });
    }

    const user = await User.findById(req.userId);
    if (user.walletTokens < amount) {
      return res.status(400).json({ success: false, message: `Insufficient balance. You only have ${user.walletTokens} tokens.` });
    }

    const withdrawal = new Withdrawal({
      sellerId: req.userId,
      amount,
      method,
      details
    });

    // Deduct from wallet immediately to prevent double-withdraw
    user.walletTokens -= amount;
    await user.save();

    await withdrawal.save();
    res.json({ success: true, message: 'Withdrawal request submitted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET: Fetch Saved Payment Method
router.get('/payment-method', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ success: true, paymentMethod: user.paymentMethod || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST: Save Payment Method
router.post('/payment-method', auth, async (req, res) => {
  try {
    const { type, upiId, bankName, accountHolder, accountNumber, ifscCode, paypalEmail, swiftCode, note } = req.body;
    
    console.log(`Explicitly setting payment method for user ${req.userId}:`, type);

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          'paymentMethod.method': type,
          'paymentMethod.upiId': upiId || '',
          'paymentMethod.bankName': bankName || '',
          'paymentMethod.accountHolder': accountHolder || '',
          'paymentMethod.accountNumber': accountNumber || '',
          'paymentMethod.ifscCode': ifscCode || '',
          'paymentMethod.paypalEmail': paypalEmail || '',
          'paymentMethod.swiftCode': swiftCode || '',
          'paymentMethod.note': note || ''
        }
      },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'Payment method saved successfully', paymentMethod: user.paymentMethod });
  } catch (err) {
    console.error('Save payment method error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

