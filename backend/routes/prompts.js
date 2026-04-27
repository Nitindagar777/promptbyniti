const express = require('express');
const router = express.Router();
const Prompt = require('../models/Prompt');
const jwt = require('jsonwebtoken');

// Middleware: Auth Check
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'No token' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
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

// GET Single Prompt
router.get('/:id', async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id).populate('seller', 'name');
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });
    res.json({ success: true, prompt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
