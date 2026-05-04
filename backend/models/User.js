const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 6,
    select: false // Don't return password by default
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&auto=format&fit=crop&q=60'
  },
  bio: {
    type: String,
    default: '',
    maxlength: 200
  },
  googleId: {
    type: String,
    default: null
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  credits: {
    type: Number,
    default: 0 // No free tokens for new users
  },
  walletTokens: {
    type: Number,
    default: 0 // Earned tokens available for withdrawal
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'unlimited'],
    default: 'free'
  },
  otp: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    method: {
      type: String,
      enum: ['UPI', 'BANK', 'INTL'],
      default: null
    },
    upiId: { type: String, default: '' },
    bankName: { type: String, default: '' },
    accountHolder: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    paypalEmail: { type: String, default: '' },
    swiftCode: { type: String, default: '' },
    note: { type: String, default: '' }
  },
  purchasedPrompts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prompt'
  }]
}, {
  timestamps: true
});

// Hash password before saving (only for local accounts)
userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
