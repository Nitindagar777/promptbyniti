const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const router = express.Router();

// Fix SSL cert issues in development (Windows)
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Initialize Razorpay
console.log('🔑 Razorpay Key ID:', process.env.RAZORPAY_KEY_ID ? '✅ Loaded' : '❌ Missing');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const PLANS = {
  free: { name: 'Starter', priceUSD: 0, priceINR: 0, credits: 2 },
  pro: { name: 'Creator', priceUSD: 10, priceINR: 849, credits: 25 },
  unlimited: { name: 'Studio', priceUSD: 29, priceINR: 2449, credits: 80 }
};

// Middleware: Auth Check
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// POST /api/payment/create-order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = PLANS[planId];

    if (!plan || planId === 'free') {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    const options = {
      amount: plan.priceINR * 100, // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    // Save transaction as pending
    await Transaction.create({
      userId: req.userId,
      planId,
      amount: plan.priceINR,
      orderId: order.id,
      status: 'pending'
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('Create order error:', err.message);
    console.error('Full error:', JSON.stringify(err, null, 2));
    res.status(500).json({ success: false, message: 'Could not create payment order' });
  }
});

// POST /api/payment/verify-payment
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Update transaction status
      const transaction = await Transaction.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { 
          paymentId: razorpay_payment_id, 
          signature: razorpay_signature, 
          status: 'completed' 
        },
        { new: true }
      );

      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction record not found' });
      }

      // Update User Plan and Credits
      const plan = PLANS[transaction.planId];
      await User.findByIdAndUpdate(req.userId, {
        plan: transaction.planId,
        $inc: { credits: plan.credits } // Add new packs to existing ones
      });

      res.json({ success: true, message: 'Payment verified and plan upgraded' });
    } else {
      await Transaction.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: 'failed' }
      );
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (err) {
    console.error('Verify payment error:', err.message);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
});

module.exports = router;
