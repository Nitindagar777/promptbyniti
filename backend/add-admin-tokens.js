/**
 * One-time script: Add 1000 tokens to admin account
 * Email: nitindagar0800@gmail.com
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

async function addTokens() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email: 'nitindagar0800@gmail.com' });

    if (!user) {
      console.log('❌ User not found with email: nitindagar0800@gmail.com');
      process.exit(1);
    }

    console.log(`📋 Found user: ${user.name} (${user.email})`);
    console.log(`   Current credits: ${user.credits}`);

    user.credits += 1000;
    await user.save();

    console.log(`✅ Added 1000 tokens!`);
    console.log(`   New credits: ${user.credits}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

addTokens();
