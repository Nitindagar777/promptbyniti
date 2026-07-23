const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Prompt = require('../models/Prompt');
const jwt = require('jsonwebtoken');
const SystemSettings = require('../models/SystemSettings');

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

const cloudinary = require('cloudinary').v2;

const uploadToCloudinary = async (base64String) => {
  if (!base64String || !base64String.startsWith('data:')) return base64String;
  try {
    const result = await cloudinary.uploader.upload(base64String, {
      resource_type: 'auto',
      folder: 'prompt_gene'
    });
    return result.secure_url;
  } catch (err) {
    console.error('Cloudinary upload error:', err.message || err);
    return base64String;
  }
};

// POST Create Prompt
router.post('/', auth, async (req, res) => {
  try {
    const payload = { ...req.body };

    // Normalize template property if passed as 'prompt' or 'promptTemplate'
    if (!payload.template && (payload.prompt || payload.promptTemplate)) {
      payload.template = payload.prompt || payload.promptTemplate;
    }
    if (!payload.template) {
      payload.template = payload.name || 'AI Prompt Template';
    }
    
    // Upload thumbnail if it's base64
    if (payload.thumbnail) {
      payload.thumbnail = await uploadToCloudinary(payload.thumbnail);
    }
    
    // Upload samples if they are base64
    if (payload.samples && payload.samples.length > 0) {
      for (let i = 0; i < payload.samples.length; i++) {
        if (payload.samples[i].output) {
          payload.samples[i].output = await uploadToCloudinary(payload.samples[i].output);
        }
      }
    }

    const prompt = new Prompt({
      ...payload,
      seller: req.userId,
      status: 'approved'
    });
    await prompt.save();

    // Sync creator's social links to their User document and all their prompts
    if (payload.socialLinks) {
      await User.findByIdAndUpdate(req.userId, {
        $set: { socialLinks: payload.socialLinks }
      });
      await Prompt.updateMany(
        { seller: req.userId },
        { $set: { socialLinks: payload.socialLinks } }
      );
    }

    feedCache = null; // Clear cache on new prompt creation
    res.status(201).json({ success: true, prompt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

let feedCache = null;
let feedCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 min in-memory RAM cache for instant 0ms responses

// GET All Approved Prompts (Public)
router.get('/', async (req, res) => {
  try {
    const now = Date.now();
    if (feedCache && (now - feedCacheTime < CACHE_TTL)) {
      return res.json({ success: true, prompts: feedCache });
    }

    const limitParam = parseInt(req.query.limit);
    const limit = (!isNaN(limitParam) && limitParam > 0) ? limitParam : 150;
    console.log('📡 Public feed request received, fetching approved prompts...');
    
    const prompts = await Prompt.aggregate([
      { $match: { status: 'approved' } },
      { $sort: { createdAt: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          title: 1,
          name: 1,
          description: 1,
          keywords: 1,
          category: 1,
          generateType: 1,
          model: 1,
          price: 1,
          thumbnail: 1,
          views: 1,
          sales: 1,
          averageRating: 1,
          seller: 1,
          createdAt: 1,
          samples: {
            $filter: {
              input: {
                $map: {
                  input: { $ifNull: ['$samples', []] },
                  as: 's',
                  in: '$$s.output'
                }
              },
              as: 'outUrl',
              cond: {
                $and: [
                  { $ne: ['$$outUrl', null] },
                  { $ne: ['$$outUrl', ''] },
                  { $not: [{ $regexMatch: { input: '$$outUrl', regex: '^data:' } }] }
                ]
              }
            }
          }
        }
      }
    ]);
    console.log(`✅ Fetched ${prompts.length} approved prompts from DB via fast aggregation`);

    const normalizedPrompts = prompts.map(p => ({
      ...p,
      samples: (p.samples && p.samples.length > 0) ? p.samples : (p.thumbnail ? [p.thumbnail] : [])
    }));

    if (normalizedPrompts.length > 0) {
      feedCache = normalizedPrompts;
      feedCacheTime = Date.now();
    }

    res.json({ success: true, prompts: normalizedPrompts });
  } catch (err) {
    console.error('❌ Error fetching prompts:', err.message);
    if (feedCache) {
      return res.json({ success: true, prompts: feedCache });
    }
    res.status(500).json({ success: false, message: err.message, prompts: [] });
  }
});

// GET Prompt Creation Rules (Public)
router.get('/rules', async (req, res) => {
  try {
    const settings = await SystemSettings.findOne();
    const rules = settings ? settings.promptCreationRules : [];
    res.json({ success: true, rules });
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
    ).populate('seller', 'name avatar socialLinks followers');
    
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
      console.log('🔍 PURCHASE CHECK:', {
        reqUserId: req.userId,
        sellerId: prompt.seller?._id?.toString(),
        isSeller,
        isBuyer,
        userPurchases: user?.purchasedPrompts?.map(p => p.toString()),
        promptId: req.params.id
      });
      if (isSeller || isBuyer) isAuthorized = true;
    } else {
      console.log('🔍 PURCHASE CHECK: No req.userId - user not authenticated');
    }

    res.json({ 
      success: true, 
      prompt: promptObj, 
      isPurchased: isAuthorized 
    });
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

    // BLOCK EDIT IF SOLD
    if (prompt.sales > 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden: This prompt has already been purchased by users and cannot be edited to maintain content consistency.' 
      });
    }

    // Update fields and auto-approve for instant feed updates
    const updatedData = { ...req.body, status: 'approved' };
    const updatedPrompt = await Prompt.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    // Sync creator's social links to their User document and all their prompts
    if (req.body.socialLinks) {
      await User.findByIdAndUpdate(req.userId, {
        $set: { socialLinks: req.body.socialLinks }
      });
      await Prompt.updateMany(
        { seller: req.userId },
        { $set: { socialLinks: req.body.socialLinks } }
      );
    }
    
    feedCache = null; // Clear cache on update
    res.json({ success: true, prompt: updatedPrompt, message: 'Prompt updated successfully' });
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

    // BLOCK DELETE IF SOLD
    if (prompt.sales > 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden: This prompt has already been purchased by users and cannot be deleted to preserve their lifetime access.' 
      });
    }

    await Prompt.findByIdAndDelete(req.params.id);
    feedCache = null; // Clear cache on deletion
    res.json({ success: true, message: 'Prompt deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Submit Review (Requires Purchase)
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const promptId = req.params.id;
    const userId = req.userId;

    // 1. Verify prompt exists
    const prompt = await Prompt.findById(promptId);
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });

    // 2. Verify user has purchased it
    const user = await User.findById(userId);
    const hasPurchased = user.purchasedPrompts.some(p => p.toString() === promptId);
    if (!hasPurchased) {
      return res.status(403).json({ success: false, message: 'You must purchase this prompt before reviewing it.' });
    }

    // 3. Check if user already reviewed
    const alreadyReviewed = prompt.reviews.find(r => r.user.toString() === userId.toString());
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this prompt.' });
    }

    // 4. Add review
    const newReview = {
      user: userId,
      userName: user.name,
      userAvatar: user.avatar,
      rating: Number(rating),
      comment
    };

    prompt.reviews.push(newReview);
    
    // 5. Update stats
    prompt.totalReviews = prompt.reviews.length;
    prompt.averageRating = prompt.reviews.reduce((acc, item) => item.rating + acc, 0) / prompt.reviews.length;

    await prompt.save();
    res.json({ success: true, message: 'Review submitted successfully', prompt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Creator Reply to Review
router.post('/:id/reviews/:reviewId/reply', auth, async (req, res) => {
  try {
    const { reply } = req.body;
    const { id, reviewId } = req.params;
    console.log('📬 CREATOR REPLY ATTEMPT:', { promptId: id, reviewId, userId: req.userId });

    const prompt = await Prompt.findById(id);
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found' });

    // Check if the current user is the seller
    if (prompt.seller.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Only the creator can reply to reviews' });
    }

    // Find the specific review
    const review = prompt.reviews.id(reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    review.reply = reply;
    await prompt.save();

    res.json({ success: true, message: 'Reply posted successfully', prompt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
