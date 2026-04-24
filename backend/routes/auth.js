const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const User = require('../models/User');

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
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 400px; margin: auto;">
        <h2 style="color: #f97316; text-align: center;">Verification Code</h2>
        <p style="font-size: 16px; color: #333;">Your 4-digit verification code for Prompt by Niti is:</p>
        <div style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 10px; color: #06b6d4; padding: 20px; background: #f8fafc; border-radius: 8px;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #666; margin-top: 20px;">This code will expire in 10 minutes.</p>
      </div>
    `
  };
  return transporter.sendMail(mailOptions);
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
    console.log('Register attempt:', email);

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      console.log('User already verified:', email);
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (user) {
      console.log('Updating unverified user:', email);
      user.name = name;
      user.password = password;
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      console.log('Creating new unverified user:', email);
      user = await User.create({
        name,
        email,
        password,
        provider: 'local',
        otp,
        otpExpires,
        isVerified: false
      });
    }

    // Send Email
    console.log('Sending OTP to:', email);
    await sendOTPEmail(email, otp);
    console.log('OTP sent successfully');

    res.json({ success: true, message: 'Verification code sent to your email', step: 'verify' });
  } catch (err) {
    console.error('Register error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: 'Could not send verification email. Please check your email address.' });
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
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.provider === 'google' && !user.password) {
      return res.status(400).json({ success: false, message: 'Please use Google Sign-in' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send Email
    await sendOTPEmail(email, otp);

    res.json({ success: true, message: 'Verification code sent to your email', step: 'verify' });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// POST /api/auth/verify-otp — Step 2
// ============================================
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('Verify OTP attempt:', email, otp);

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for verification:', email);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check OTP
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      console.log('Invalid or expired OTP for:', email);
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    // Clear OTP and verify
    user.otp = null;
    user.otpExpires = null;
    user.isVerified = true;
    await user.save();
    console.log('User verified successfully:', email);

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
        plan: user.plan
      }
    });
  } catch (err) {
    console.error('Verify OTP error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// POST /api/auth/google — Google OAuth Login
// ============================================
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.provider = 'google';
        if (picture) user.avatar = picture;
        user.isVerified = true; // Google users are pre-verified
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture || '',
        provider: 'google',
        credits: 10,
        plan: 'free',
        isVerified: true
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
        credits: user.credits,
        plan: user.plan
      }
    });
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(401).json({ success: false, message: 'Google authentication failed' });
  }
});

// ============================================
// GET /api/auth/me — Get current user
// ============================================
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isVerified) {
      return res.status(401).json({ success: false, message: 'Not authenticated or verified' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        credits: user.credits,
        plan: user.plan
      }
    });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

module.exports = router;
