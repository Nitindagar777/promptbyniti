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
      path: 'c:\\Users\\nitin.LAPTOP-NAG2MKGV\\Desktop\\prompt_gene\\public\\image.png',
      cid: 'logo'
    }]
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

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been banned.' });
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
      if (user.isBanned) {
        return res.status(403).json({ success: false, message: 'Your account has been banned.' });
      }

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
        credits: 2,
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

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been banned. Please contact support.' });
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

// ============================================
// PUT /api/auth/profile — Update user profile
// ============================================
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, bio, avatar } = req.body;

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    
    if (avatar && avatar.startsWith('data:image')) {
      console.log('Uploading new avatar to Cloudinary...');
      const uploadRes = await cloudinary.uploader.upload(avatar, {
        folder: 'niti_avatars',
        width: 300,
        height: 300,
        crop: 'fill'
      });
      user.avatar = uploadRes.secure_url;
      console.log('Avatar uploaded successfully:', user.avatar);
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
        bio: user.bio,
        credits: user.credits,
        plan: user.plan
      }
    });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(401).json({ success: false, message: 'Session expired or invalid' });
  }
});

// ============================================
// POST /api/auth/forgot-password
// ============================================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User with this email not found' });

    if (user.provider === 'google') {
      return res.status(400).json({ success: false, message: 'This account uses Google login. Please sign in with Google.' });
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send Email
    await sendOTPEmail(email, otp);

    res.json({ success: true, message: 'Reset code sent to your email' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// POST /api/auth/verify-reset-otp
// ============================================
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

// ============================================
// POST /api/auth/reset-password
// ============================================
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Session expired. Please try again.' });
    }

    // Hash and save new password
    user.password = password; // Mongoose middleware will hash it if defined
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password reset successfully',
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
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
