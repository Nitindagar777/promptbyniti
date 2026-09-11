const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const LoungeMessage = require('../models/LoungeMessage');
const User = require('../models/User');
const Prompt = require('../models/Prompt');
const Announcement = require('../models/Announcement');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;

const ADMIN_EMAIL = 'nitindagar0800@gmail.com';

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

// Helper to upload images to Cloudinary
const uploadToCloudinary = async (base64String) => {
  if (!base64String || !base64String.startsWith('data:')) return base64String;
  try {
    const result = await cloudinary.uploader.upload(base64String, {
      resource_type: 'image',
      format: 'webp',
      folder: 'prompt_gene_lounge'
    });
    return result.secure_url;
  } catch (err) {
    console.error('Lounge image upload error:', err.message || err);
    return base64String;
  }
};

// GET: Fetch all public lounge messages (General Group Discussion)
router.get('/', async (req, res) => {
  try {
    // Fetch last 150 public messages (recipientId is null or not present)
    const messages = await LoungeMessage.find({
      $or: [ { recipientId: null }, { recipientId: { $exists: false } } ]
    })
      .sort({ createdAt: -1 })
      .limit(150)
      .lean();
    
    res.json({ success: true, messages: messages.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET: Fetch admin user ID dynamically
router.get('/admin-info', async (req, res) => {
  try {
    const admin = await User.findOne({ email: ADMIN_EMAIL }).select('_id name avatar').lean();
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }
    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET: Fetch 1-on-1 private direct messages between current user and admin (or target user if logged in user is admin or chatting in private mode)
router.get('/direct', auth, async (req, res) => {
  try {
    const adminUser = await User.findOne({ email: ADMIN_EMAIL }).lean();
    if (!adminUser) return res.status(404).json({ success: false, message: 'Admin user not found' });
    const adminId = adminUser._id;
    const isCurrentUserAdmin = req.user.email === ADMIN_EMAIL;

    let targetUserId = req.query.targetUserId;
    if (!targetUserId) {
      if (!isCurrentUserAdmin) {
        // For general users, default target user is the admin
        targetUserId = adminId.toString();
      } else {
        // If admin is logged in but hasn't selected a user to chat with
        return res.json({ success: true, messages: [] });
      }
    }

    // Mark incoming messages as read when fetched/opened
    console.log('--- FETCH DIRECT MESSAGES ---', { isCurrentUserAdmin, targetUserId, reqUserId: req.userId });
    if (targetUserId) {
      const updateResult = await LoungeMessage.updateMany(
        { 
          userId: new mongoose.Types.ObjectId(targetUserId.toString()), 
          recipientId: new mongoose.Types.ObjectId(req.userId.toString()), 
          isRead: { $ne: true } 
        },
        { $set: { isRead: true } }
      );
      console.log('Marked messages as read:', updateResult);
    }

    const messages = await LoungeMessage.find({
      $or: [
        { userId: req.userId, recipientId: targetUserId },
        { userId: targetUserId, recipientId: req.userId }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(150)
      .lean();

    res.json({ success: true, messages: messages.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET: Fetch active direct contacts list (Admin Only)
router.get('/contacts', auth, async (req, res) => {
  try {
    if (req.user.email !== ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const adminId = req.userId;
    console.log('--- FETCH CONTACTS ROUTE ---', { adminId });

    // Find all messages involving the admin
    const messages = await LoungeMessage.find({
      $or: [ { userId: adminId }, { recipientId: adminId } ]
    }).lean();

    const contactIds = new Set();
    messages.forEach(m => {
      if (m.userId && m.userId.toString() !== adminId.toString()) contactIds.add(m.userId.toString());
      if (m.recipientId && m.recipientId.toString() !== adminId.toString()) contactIds.add(m.recipientId.toString());
    });

    const contacts = await User.find({ _id: { $in: Array.from(contactIds) } })
      .select('name email avatar')
      .lean();

    // Map contacts to check if they have unread messages to the admin
    const contactsWithUnread = await Promise.all(contacts.map(async (c) => {
      const unreadCount = await LoungeMessage.countDocuments({
        userId: new mongoose.Types.ObjectId(c._id.toString()),
        recipientId: new mongoose.Types.ObjectId(adminId.toString()),
        isRead: { $ne: true }
      });
      console.log(`Unread count for ${c.name} (${c._id}):`, unreadCount);
      return {
        ...c,
        hasUnread: unreadCount > 0
      };
    }));

    res.json({ success: true, contacts: contactsWithUnread });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET: Fetch 1-on-1 private contacts (buyers/sellers/recent chats) (Auth required)
router.get('/private-contacts', auth, async (req, res) => {
  try {
    const currentUserId = req.userId;

    // 1. Find all users who are sellers of prompts purchased by currentUserId
    const currentUser = await User.findById(currentUserId).populate('purchasedPrompts').lean();
    const sellersSet = new Set();
    if (currentUser && currentUser.purchasedPrompts) {
      currentUser.purchasedPrompts.forEach(p => {
        if (p.seller && p.seller.toString() !== currentUserId.toString()) {
          sellersSet.add(p.seller.toString());
        }
      });
    }

    // 2. Find all users who have purchased prompts created by currentUserId
    const myPrompts = await Prompt.find({ seller: currentUserId }).select('_id').lean();
    const myPromptIds = myPrompts.map(p => p._id.toString());
    
    const customers = await User.find({
      purchasedPrompts: { $in: myPromptIds },
      _id: { $ne: currentUserId }
    }).select('_id').lean();
    const customersSet = new Set(customers.map(c => c._id.toString()));

    // 3. Find all users who have direct private message history with currentUserId (excluding the admin)
    const adminUser = await User.findOne({ email: ADMIN_EMAIL }).lean();
    const adminIdStr = adminUser ? adminUser._id.toString() : '';

    const directMessages = await LoungeMessage.find({
      recipientId: { $ne: null },
      $or: [
        { userId: currentUserId },
        { recipientId: currentUserId }
      ]
    }).lean();

    const historySet = new Set();
    directMessages.forEach(m => {
      const uId = m.userId?.toString();
      const rId = m.recipientId?.toString();
      if (uId && uId !== currentUserId && uId !== adminIdStr) historySet.add(uId);
      if (rId && rId !== currentUserId && rId !== adminIdStr) historySet.add(rId);
    });

    // Combine all unique contact user IDs
    const allContactIds = new Set([
      ...Array.from(sellersSet),
      ...Array.from(customersSet),
      ...Array.from(historySet)
    ]);

    // Fetch details for all these unique users
    const privateContacts = await User.find({ _id: { $in: Array.from(allContactIds) } })
      .select('name email avatar')
      .lean();

    // Map each contact to include if they have unread messages to currentUserId
    const privateContactsWithUnread = await Promise.all(privateContacts.map(async (c) => {
      const unreadCount = await LoungeMessage.countDocuments({
        userId: new mongoose.Types.ObjectId(c._id.toString()),
        recipientId: new mongoose.Types.ObjectId(currentUserId.toString()),
        isRead: { $ne: true }
      });
      return {
        ...c,
        hasUnread: unreadCount > 0
      };
    }));

    res.json({ success: true, contacts: privateContactsWithUnread });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST: Post a new message (public or 1-on-1 direct message)
router.post('/', auth, async (req, res) => {
  try {
    const { text, image, time, recipientId } = req.body;
    console.log('--- POST NEW MESSAGE ROUTE ---', { text, recipientId, senderId: req.userId });
    if (!text && !image) {
      return res.status(400).json({ success: false, message: 'Message text or image required' });
    }

    let imageUrl = null;
    if (image) {
      imageUrl = await uploadToCloudinary(image);
    }

    const newMessage = new LoungeMessage({
      username: req.user.name || req.user.email.split('@')[0] || 'Guest_User',
      color: req.user.email === ADMIN_EMAIL ? '#f97316' : '#10b981', // Admin has distinctive orange color
      badge: req.user.email === ADMIN_EMAIL ? '🛡️ Admin' : '👾 Human',
      text: text || '',
      image: imageUrl,
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userId: req.userId,
      recipientId: recipientId || null,
      isRead: false
    });

    await newMessage.save();
    console.log('Saved message successfully:', { id: newMessage._id, isRead: newMessage.isRead, recipientId: newMessage.recipientId });
    res.status(201).json({ success: true, message: newMessage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET: Fetch unread direct messages count for the current user
router.get('/unread-count', auth, async (req, res) => {
  try {
    const unreadCount = await LoungeMessage.countDocuments({
      recipientId: new mongoose.Types.ObjectId(req.userId.toString()),
      isRead: { $ne: true }
    });
    res.json({ success: true, count: unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET: Fetch all announcements (Seed defaults if collection is empty)
router.get('/announcements', async (req, res) => {
  try {
    let list = await Announcement.find({}).sort({ createdAt: -1 }).lean();
    if (list.length === 0) {
      // Seed default announcements
      const defaults = [
        {
          title: 'Prompt by Niti v2.0 is Live!',
          desc: 'We have updated our prompt generation engine with advanced contextual memory and support for Claude 3.5 Sonnet. Tokens are now credited instantly!',
          tag: 'LATEST',
          tagColor: '#38bdf8',
          type: 'latest',
          date: 'May 23, 2026'
        },
        {
          title: 'Weekly Prompt Challenge #14',
          desc: 'Build the best "3D Isometric Illustration Generator" prompt for Midjourney v6.1. The top 3 creators win 500 bonus tokens and front-page features!',
          tag: 'CHALLENGE',
          tagColor: '#fb923c',
          type: 'challenge',
          date: 'May 22, 2026'
        },
        {
          title: 'Enhanced Prompt Verification',
          desc: 'All submitted marketplace prompts are now automatically screened by our AI validation sandbox to ensure 100% execution compatibility.',
          tag: 'SECURITY',
          tagColor: '#ef4444',
          type: 'security',
          date: 'May 20, 2026'
        },
        {
          title: 'Live Q&A with Nitin Dagar',
          desc: 'Join us next Saturday inside the Lounge for a live group discussion on prompt engineering tips, marketplace insights, and upcoming features.',
          tag: 'EVENT',
          tagColor: '#a855f7',
          type: 'event',
          date: 'May 18, 2026'
        }
      ];
      await Announcement.insertMany(defaults);
      list = await Announcement.find({}).sort({ createdAt: -1 }).lean();
    }
    res.json({ success: true, announcements: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST: Add new announcement (Admin Only)
router.post('/announcements', auth, async (req, res) => {
  try {
    if (req.user.email !== ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: 'Unauthorized access. Admin only.' });
    }
    const { title, desc, tag, tagColor, type } = req.body;
    if (!title || !desc) {
      return res.status(400).json({ success: false, message: 'Title and description required.' });
    }
    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    const newAnnouncement = new Announcement({
      title,
      desc,
      tag: tag || 'LATEST',
      tagColor: tagColor || '#38bdf8',
      type: type || 'latest',
      date: dateStr
    });
    await newAnnouncement.save();
    res.status(201).json({ success: true, announcement: newAnnouncement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT: Edit existing announcement (Admin Only)
router.put('/announcements/:id', auth, async (req, res) => {
  try {
    if (req.user.email !== ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: 'Unauthorized access. Admin only.' });
    }
    const { title, desc, tag, tagColor, type } = req.body;
    
    const updated = await Announcement.findByIdAndUpdate(
      req.params.id,
      { $set: { title, desc, tag, tagColor, type } },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }
    res.json({ success: true, announcement: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE: Delete announcement (Admin Only)
router.delete('/announcements/:id', auth, async (req, res) => {
  try {
    if (req.user.email !== ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: 'Unauthorized access. Admin only.' });
    }
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }
    res.json({ success: true, message: 'Announcement deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
