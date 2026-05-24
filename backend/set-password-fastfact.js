/**
 * Script to set a password for fastfact455@gmail.com
 * This user previously used Google login and needs a password set
 * so they can login directly with email + password (no OTP).
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const TARGET_EMAIL = 'fastfact455@gmail.com';
const NEW_PASSWORD = 'FastFact@455'; // Set this password for the user

async function setPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = require('./models/User');

    // Find the user
    const user = await User.findOne({ email: TARGET_EMAIL }).select('+password');
    
    if (!user) {
      console.log(`❌ User with email ${TARGET_EMAIL} NOT found in database.`);
      process.exit(1);
    }

    console.log(`✅ Found user:`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Provider: ${user.provider}`);
    console.log(`   Has password: ${!!user.password}`);
    console.log(`   isVerified: ${user.isVerified}`);
    console.log(`   GoogleId: ${user.googleId || 'none'}`);

    // Set the password - the pre-save hook will hash it
    user.password = NEW_PASSWORD;
    user.isVerified = true; // Make sure user is verified
    await user.save();

    console.log(`\n✅ Password has been set successfully!`);
    console.log(`   Email: ${TARGET_EMAIL}`);
    console.log(`   Password: ${NEW_PASSWORD}`);
    console.log(`\n   This user can now login directly with email + password (no OTP needed).`);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

setPassword();
