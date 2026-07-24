const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper: Send OTP Email
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Prompt by Niti" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Verification Code',
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 450px; margin: auto; text-align: center; background-color: #ffffff;">
        <div style="margin-bottom: 24px;">
          <img src="cid:logo" alt="Prompt by Niti" style="height: 60px; width: auto;" />
        </div>
        <h2 style="color: #f97316; margin-bottom: 16px; font-size: 24px;">Verification Code</h2>
        <p style="font-size: 16px; color: #475569; line-height: 1.5; margin-bottom: 24px;">
          Your 4-digit verification code for <strong style="color: #0f172a;">Prompt by Niti</strong> is:
        </p>
        <div style="font-size: 36px; font-weight: 800; text-align: center; letter-spacing: 12px; color: #06b6d4; padding: 24px; background: #f1f5f9; border-radius: 12px; margin-bottom: 24px;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #64748b; margin-top: 20px;">
          This code is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.
        </p>
        <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px;">
          <p style="font-size: 12px; color: #94a3b8; line-height: 1.4;">
            If you didn't request this code, you can safely ignore this email.<br />
            © ${new Date().getFullYear()} Prompt by Niti. All rights reserved.
          </p>
        </div>
      </div>
    `,
    attachments: [{
      filename: 'logo.png',
      path: 'c:\\Users\\nitin.LAPTOP-NAG2MKGV\\Desktop\\prompt_gene\\public\\image1.png',
      cid: 'logo'
    }]
  };
  return transporter.sendMail(mailOptions);
};

// Helper: Admin user check
const ADMIN_EMAIL = 'nitindagar0800@gmail.com';
const isAdminUser = (user) => {
  if (!user) return false;
  const userEmail = (user.email || '').toLowerCase().trim();
  return userEmail === ADMIN_EMAIL.toLowerCase().trim() || user.role === 'admin' || user.isAdmin === true;
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// ============================================
// POST /api/auth/register — Email/Password (Step 1)
// ============================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    const isAdmin = email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
    if (user) {
      user.name = name;
      user.password = password;
      user.otp = otp;
      user.otpExpires = otpExpires;
      user.hasUsedFreePrompt = true;
      user.credits = isAdmin ? 100000 : 2;
      await user.save();
    } else {
      user = await User.create({
        name, email, password, provider: 'local', otp, otpExpires, isVerified: false,
        hasUsedFreePrompt: true,
        credits: isAdmin ? 100000 : 2
      });
    }
    await sendOTPEmail(email, otp);
    res.json({ success: true, message: 'Verification code sent to your email', step: 'verify' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not send verification email.' });
  }
});

// ============================================
// POST /api/auth/login — Email/Password (Step 1)
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    if (user.provider === 'google' && !user.password) {
      return res.status(400).json({ success: false, message: 'Please use Google Sign-in' });
    }
    if (user.isBanned) return res.status(403).json({ success: false, message: 'Your account has been banned.' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    // Skip OTP for fastfact455@gmail.com — direct login with password only
    if (email.toLowerCase() === 'fastfact455@gmail.com') {
      const token = generateToken(user._id);
      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio || '',
          credits: user.credits,
          plan: user.plan,
          hasUsedFreePrompt: user.hasUsedFreePrompt,
          purchasedPrompts: user.purchasedPrompts || [],
          socialLinks: user.socialLinks || {},
          followers: user.followers || [],
          following: user.following || [],
          createdAt: user.createdAt
        }
      });
    }

    if (isAdminUser(user) && user.credits !== 100000) {
      user.credits = 100000;
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();
    await sendOTPEmail(email, otp);
    res.json({ success: true, message: 'Verification code sent to your email', step: 'verify' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// POST /api/auth/verify-otp — Step 2
// ============================================
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }
    user.otp = null;
    user.otpExpires = null;
    user.isVerified = true;
    if (isAdminUser(user)) {
      user.credits = 100000;
    }
    await user.save();
    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio || '',
        credits: user.credits,
        plan: user.plan,
        hasUsedFreePrompt: user.hasUsedFreePrompt,
        purchasedPrompts: user.purchasedPrompts || [],
        socialLinks: user.socialLinks || {},
        followers: user.followers || [],
        following: user.following || [],
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// POST /api/auth/google — Google OAuth Login
// ============================================
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (user) {
      if (user.isBanned) return res.status(403).json({ success: false, message: 'Your account has been banned.' });
      if (!user.googleId) {
        user.googleId = googleId;
        user.provider = 'google';
        if (picture) user.avatar = picture;
        user.isVerified = true;
      }
      if (isAdminUser(user)) {
        user.credits = 100000;
      }
      await user.save();
    } else {
      const isAdmin = email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
      user = await User.create({
        name, email, googleId, avatar: picture || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&auto=format&fit=crop&q=60', provider: 'google',
        credits: isAdmin ? 100000 : 2, plan: 'free', isVerified: true,
        hasUsedFreePrompt: true
      });
    }
    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio || '',
        credits: user.credits,
        plan: user.plan,
        hasUsedFreePrompt: user.hasUsedFreePrompt,
        purchasedPrompts: user.purchasedPrompts || [],
        socialLinks: user.socialLinks || {},
        followers: user.followers || [],
        following: user.following || [],
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Google authentication failed' });
  }
});

// ============================================
// GET /api/auth/me — Get current user
// ============================================
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    if (user.isBanned) return res.status(403).json({ success: false, message: 'Your account has been banned.' });
    if (isAdminUser(user) && user.credits !== 100000) {
      user.credits = 100000;
      await user.save();
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio || '',
        credits: user.credits,
        plan: user.plan,
        hasUsedFreePrompt: user.hasUsedFreePrompt,
        purchasedPrompts: user.purchasedPrompts || [],
        socialLinks: user.socialLinks || {},
        followers: user.followers || [],
        following: user.following || [],
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// ============================================
// PUT /api/auth/profile — Update user profile
// ============================================
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, bio, avatar, socialLinks } = req.body;
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (socialLinks !== undefined) {
      user.socialLinks = socialLinks;
      user.markModified('socialLinks');
      // Propagate social links to all existing prompts created by this user
      const Prompt = require('../models/Prompt');
      try {
        await Prompt.updateMany(
          { seller: user._id },
          { $set: { socialLinks: socialLinks } }
        );
      } catch (err) {
        console.error('Error propagating social links to prompts:', err);
      }
    }
    if (avatar && avatar.startsWith('data:image')) {
      const uploadRes = await cloudinary.uploader.upload(avatar, {
        folder: 'niti_avatars', width: 300, height: 300, crop: 'fill'
      });
      user.avatar = uploadRes.secure_url;
    }
    await user.save();
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio || '',
        credits: user.credits,
        plan: user.plan,
        hasUsedFreePrompt: user.hasUsedFreePrompt,
        purchasedPrompts: user.purchasedPrompts || [],
        socialLinks: user.socialLinks || {},
        followers: user.followers || [],
        following: user.following || [],
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Session expired or invalid' });
  }
});

// ============================================
// POST /api/auth/use-credits — Deduct credits permanently
// ============================================
router.post('/use-credits', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { amount, templateId, isFreePrompt } = req.body;
    const Prompt = require('../models/Prompt'); // Import Prompt model

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (isFreePrompt) {
      if (user.hasUsedFreePrompt) {
        return res.status(400).json({ success: false, message: 'Free prompt already used' });
      }
      user.hasUsedFreePrompt = true;
      await user.save();
      return res.json({ success: true, credits: user.credits, hasUsedFreePrompt: true });
    }

    let finalPrice = amount || 5;
    let sellerId = null;

    // If a template/prompt is being purchased, apply purchase-specific logic
    if (templateId) {
      // ── DUPLICATE PURCHASE CHECK ──
      // Block if user already owns this prompt
      const alreadyOwned = user.purchasedPrompts.some(
        pId => pId.toString() === templateId.toString()
      );
      if (alreadyOwned) {
        return res.status(400).json({ 
          success: false, 
          message: 'You have already purchased this prompt' 
        });
      }

      try {
        const prompt = await Prompt.findById(templateId);
        if (!prompt) {
          return res.status(404).json({ success: false, message: 'Prompt not found' });
        }

        // ── SELF-PURCHASE CHECK ──
        // Prevent buying your own prompt
        if (prompt.seller && prompt.seller.toString() === decoded.id.toString()) {
          return res.status(400).json({ 
            success: false, 
            message: 'You cannot purchase your own prompt' 
          });
        }

        finalPrice = prompt.priceTokens || prompt.tokens || 5;
        sellerId = prompt.seller;

        // Check credits BEFORE making any changes
        if (user.credits < finalPrice) {
          return res.status(400).json({ success: false, message: 'Insufficient tokens' });
        }

        // Deduct credits from buyer
        user.credits -= finalPrice;
        user.purchasedPrompts.push(templateId);
        await user.save();

        // Increment prompt sales counter ONLY after successful credit deduction
        prompt.sales = (prompt.sales || 0) + 1;
        await prompt.save();

        // Handle 80/20 revenue split with seller
        if (sellerId) {
          try {
            const sellerShare = Math.floor(finalPrice * 0.8);
            await User.findByIdAndUpdate(sellerId, {
              $inc: { 
                walletTokens: sellerShare,
                credits: sellerShare 
              }
            });
            console.log(`💰 Sale: Buyer paid ${finalPrice} tokens, Seller received ${sellerShare} tokens (80%)`);
          } catch (err) {
            console.error('Error rewarding seller:', err);
          }
        }
      } catch (err) {
        console.error('Error processing prompt purchase:', err);
        return res.status(500).json({ success: false, message: 'Purchase failed' });
      }
    } else {
      // No templateId — this is a generation credit deduction (not a purchase)
      const ADMIN_EMAIL = 'nitindagar0800@gmail.com';
      const isAdminUser = (user.email && user.email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim()) || user.role === 'admin' || user.isAdmin;

      if (!isAdminUser && user.credits < finalPrice) {
        return res.status(400).json({ success: false, message: 'Insufficient tokens' });
      }

      if (!isAdminUser) {
        user.credits -= finalPrice;
        await user.save();
      }
    }

    res.json({ success: true, credits: user.credits });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid session' });
  }
});

// ============================================
// POST /api/auth/forgot-password, verify-reset-otp, reset-password (Existing)
// ============================================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();
    await sendOTPEmail(email, otp);
    res.json({ success: true, message: 'Reset code sent to your email' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }
    res.json({ success: true, message: 'Code verified' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Session expired' });
    }
    user.password = password;
    user.otp = null;
    user.otpExpires = null;
    await user.save();
    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Password reset successfully',
      token,
      user: {
        id: user._id, name: user.name, email: user.email, avatar: user.avatar,
        bio: user.bio || '',
        credits: user.credits, plan: user.plan,
        hasUsedFreePrompt: user.hasUsedFreePrompt,
        purchasedPrompts: user.purchasedPrompts || [],
        socialLinks: user.socialLinks || {},
        followers: user.followers || [],
        following: user.following || [],
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// POST /api/auth/follow/:id — Follow/Unfollow creator
// ============================================
router.post('/follow/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const token = authHeader.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({ success: false, message: 'Session expired or invalid token' });
    }
    const currentUserId = decoded.id;
    const targetUserId = req.params.id;

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ success: false, message: 'Invalid Creator ID' });
    }

    if (currentUserId === targetUserId) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Ensure array fields exist
    if (!currentUser.following) currentUser.following = [];
    if (!targetUser.followers) targetUser.followers = [];

    // Check if currently following
    const isFollowing = currentUser.following.some(id => id.toString() === targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      success: true,
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length,
      followingCount: currentUser.following.length,
      following: currentUser.following
    });
  } catch (err) {
    console.error('Follow error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// POST /api/auth/admin-login — Secret Admin Passkey Auth
// ============================================
router.post('/admin-login', async (req, res) => {
  try {
    const { passkey, email } = req.body;
    if (passkey !== '@Nitin800' && passkey !== 'admin123') {
      return res.status(401).json({ success: false, message: 'Invalid admin passkey' });
    }

    const adminEmail = email || 'nitindagar0800@gmail.com';
    let user = await User.findOne({ email: adminEmail.toLowerCase().trim() });
    if (!user) {
      user = await User.findOne({ email: 'nitindagar0800@gmail.com' });
    }

    if (!user) {
      user = await User.create({
        name: 'Nitin Dagar (Admin)',
        email: 'nitindagar0800@gmail.com',
        credits: 100000,
        isVerified: true
      });
    } else {
      user.credits = 100000;
      await user.save();
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        credits: user.credits,
        plan: user.plan,
        role: 'admin',
        isAdmin: true
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, message: 'Admin auth failed' });
  }
});

module.exports = router;
