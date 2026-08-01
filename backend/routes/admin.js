const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Prompt = require('../models/Prompt');
const Transaction = require('../models/Transaction');
const Withdrawal = require('../models/Withdrawal');
const SystemSettings = require('../models/SystemSettings');
const jwt = require('jsonwebtoken');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'No authorization header provided' });

    const token = authHeader.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ success: false, message: 'Invalid token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    const user = await User.findById(decoded.id);
    if (!user || !user.email) {
      return res.status(403).json({ success: false, message: 'Admin access denied' });
    }

    const userEmail = user.email.toLowerCase().trim();
    const isAdminUser = userEmail === 'nitindagar0800@gmail.com' || user.role === 'admin' || user.isAdmin === true;

    if (!isAdminUser) {
      return res.status(403).json({ success: false, message: 'Admin access denied' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// GET Admin Stats
router.get('/stats', isAdmin, async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const promptsCount = await Prompt.countDocuments();
    const pendingPrompts = await Prompt.countDocuments({ status: 'pending' });

    const completedTransactions = await Transaction.find({ status: 'completed' }).select('amount').lean();
    const totalRevenue = completedTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    
    // Aggregation instead of Prompt.find() to prevent memory overhead & socket timeouts
    const salesAgg = await Prompt.aggregate([{ $group: { _id: null, totalSales: { $sum: '$sales' } } }]);
    const platformPromptSales = salesAgg[0]?.totalSales || 0;

    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      stats: {
        usersCount,
        promptsCount,
        pendingPrompts,
        totalRevenue: totalRevenue, 
        salesCount: platformPromptSales,
        pendingWithdrawals
      }
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET All Users
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password -otp').sort({ createdAt: -1 }).lean();
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
    
    // Prevent banning the main admin
    if (user.email.toLowerCase().trim() === 'nitindagar0800@gmail.com') {
      return res.status(403).json({ success: false, message: 'Cannot ban system admin' });
    }

    user.isBanned = isBanned;
    await user.save();
    
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET All Prompts (Lightweight list without heavy base64 samples)
router.get('/prompts', isAdmin, async (req, res) => {
  try {
    const prompts = await Prompt.find()
      .select('name seller priceTokens tokens sales status createdAt generateType category thumbnail model rejectionReason')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, prompts });
  } catch (err) {
    console.error('Error fetching admin prompts:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Single Prompt Details (Full view on demand)
router.get('/prompts/:id', isAdmin, async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id).populate('seller', 'name email').lean();
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });
    res.json({ success: true, prompt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const promptRoutes = require('./prompts');

// UPDATE Prompt Status, Category, or Model Flag
router.patch('/prompts/:id', isAdmin, async (req, res) => {
  try {
    const { status, rejectionReason, category, isModel } = req.body;
    const updateData = {};

    if (status) {
      if (!['approved', 'rejected', 'pending'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
      updateData.status = status;
      if (status === 'rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
    }

    if (category !== undefined) {
      updateData.category = category;
    }

    if (isModel !== undefined) {
      updateData.category = isModel ? 'models' : (category || 'general');
    }

    const prompt = await Prompt.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (typeof promptRoutes.clearFeedCache === 'function') promptRoutes.clearFeedCache();
    res.json({ success: true, prompt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE Prompt
router.delete('/prompts/:id', isAdmin, async (req, res) => {
  try {
    const prompt = await Prompt.findByIdAndDelete(req.params.id);
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });
    if (typeof promptRoutes.clearFeedCache === 'function') promptRoutes.clearFeedCache();
    res.json({ success: true, message: 'Prompt deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET All Transactions
router.get('/transactions', isAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 }).lean();
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
      .sort({ createdAt: -1 })
      .lean();
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

    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    // If withdrawal is REJECTED, refund the tokens to their wallet
    if (status === 'rejected' && withdrawal.status !== 'rejected') {
      const seller = await User.findById(withdrawal.sellerId);
      if (seller) {
        console.log(`Refunding ${withdrawal.amount} tokens to user ${seller.email} due to rejection`);
        seller.walletTokens = (seller.walletTokens || 0) + withdrawal.amount;
        await seller.save();
      }
    }

    withdrawal.status = status;
    if (status === 'rejected' && req.body.rejectionReason) {
      withdrawal.rejectionReason = req.body.rejectionReason;
    }
    await withdrawal.save();
    
    // Refresh to get populated data
    const updatedWithdrawal = await Withdrawal.findById(withdrawal._id).populate('sellerId', 'name email avatar paymentMethod');

    res.json({ success: true, withdrawal: updatedWithdrawal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET System Settings
router.get('/settings', isAdmin, async (req, res) => {
  try {
    let settings = await SystemSettings.findOne().lean();
    if (!settings) {
      const newSettings = new SystemSettings();
      await newSettings.save();
      settings = newSettings.toObject();
    }
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE System Settings
router.post('/settings', isAdmin, async (req, res) => {
  try {
    const { geminiApiKey, paidGeminiApiKey, geminiModel, groqApiKeys, pollinationsApiKey, promptCreationRules, modelSectionVisible, modelAutoLoop } = req.body;
    let settings = await SystemSettings.findOne();
    if (!settings) settings = new SystemSettings();
    
    if (geminiApiKey !== undefined) settings.geminiApiKey = geminiApiKey;
    if (paidGeminiApiKey !== undefined) settings.paidGeminiApiKey = paidGeminiApiKey;
    if (geminiModel !== undefined) settings.geminiModel = geminiModel;
    if (groqApiKeys !== undefined) settings.groqApiKeys = Array.isArray(groqApiKeys) ? groqApiKeys : [];
    if (pollinationsApiKey !== undefined) settings.pollinationsApiKey = pollinationsApiKey;
    if (modelSectionVisible !== undefined) settings.modelSectionVisible = modelSectionVisible;
    if (modelAutoLoop !== undefined) settings.modelAutoLoop = modelAutoLoop;
    if (promptCreationRules !== undefined) {
      // Normalize rules: convert any legacy strings to objects
      settings.promptCreationRules = promptCreationRules.map(r => {
        if (typeof r === 'string') return { text: r, example: '' };
        return r;
      });
    }
    
    settings.updatedAt = Date.now();
    await settings.save();
    
    res.json({ success: true, settings, message: 'Settings updated successfully' });
  } catch (err) {
    console.error('❌ ERROR UPDATING SETTINGS:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Model Prompts List (Explicit endpoint for /api/admin/model)
router.get('/model', isAdmin, async (req, res) => {
  try {
    const prompts = await Prompt.find()
      .select('name seller priceTokens tokens sales status createdAt generateType category thumbnail model rejectionReason')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, prompts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
