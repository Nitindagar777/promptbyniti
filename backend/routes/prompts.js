const express = require('express');
const router = express.Router();
const Prompt = require('../models/Prompt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

// Middleware: Auth Check
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'No token' });
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

// POST Create Prompt
router.post('/', auth, async (req, res) => {
  try {
    const prompt = new Prompt({
      ...req.body,
      seller: req.userId,
      status: 'pending'
    });
    await prompt.save();
    res.status(201).json({ success: true, prompt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET All Approved Prompts (Public)
router.get('/', async (req, res) => {
  try {
    const prompts = await Prompt.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json({ success: true, prompts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Middleware: Optional Auth Check (to reveal secret content for buyers)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.userId = decoded.id;
    next();
  } catch (err) {
    next();
  }
};

// GET Single Prompt (Public, but hides secrets unless bought/owned)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const prompt = await Prompt.findByIdAndUpdate(
      req.params.id, 
      { $inc: { views: 1 } }, 
      { returnDocument: 'after' }
    ).populate('seller', 'name avatar');
    
    if (!prompt) {
      return res.status(404).json({ success: false, message: 'Prompt not found' });
    }

    const promptObj = prompt.toObject();
    
    // Authorization check: Is the user the seller or a buyer?
    let isAuthorized = false;
    if (req.userId) {
      const user = await User.findById(req.userId);
      const isSeller = prompt.seller?._id?.toString() === req.userId.toString();
      const isBuyer = user?.purchasedPrompts?.some(pId => pId.toString() === req.params.id);
      if (isSeller || isBuyer) isAuthorized = true;
    }

    // Hide secret fields if NOT authorized
    if (!isAuthorized) {
      delete promptObj.template;
      delete promptObj.instructions;
    }
    
    res.json({ success: true, prompt: promptObj });
  } catch (err) {
    console.error("Error fetching/updating prompt:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT Update Prompt (Requires Auth & Ownership)
router.put('/:id', auth, async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });
    
    // Check ownership
    if (prompt.seller.toString() !== req.userId && prompt.seller.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You do not own this prompt' });
    }

    // Update fields and force status back to pending for admin review
    const updatedData = { ...req.body, status: 'pending' };
    const updatedPrompt = await Prompt.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    
    res.json({ success: true, prompt: updatedPrompt, message: 'Prompt updated and sent for admin review' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE Prompt (Requires Auth & Ownership)
router.delete('/:id', auth, async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });
    
    // Check ownership
    if (prompt.seller.toString() !== req.userId && prompt.seller.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You do not own this prompt' });
    }

    await Prompt.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Prompt deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
