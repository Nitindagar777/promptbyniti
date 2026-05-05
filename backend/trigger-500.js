const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function triggerError() {
  const token = jwt.sign({ id: 'any_valid_id_or_not_checked_strictly_by_script' }, process.env.JWT_SECRET || 'your_jwt_secret');
  // Wait, I need a valid admin user ID from the DB to pass the isAdmin check if it fetches from DB.
  // Actually, I'll just use the secret to sign a token for the admin email if I can.
  // But isAdmin in admin.js does: const user = await User.findById(decoded.id);
  
  console.log('Fetching an admin user ID...');
  const mongoose = require('mongoose');
  const User = require('./models/User');
  await mongoose.connect(process.env.MONGODB_URI);
  const admin = await User.findOne({ email: 'nitindagar0800@gmail.com' });
  if (!admin) {
    console.error('Admin user not found');
    process.exit(1);
  }
  
  const adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'your_jwt_secret');
  
  console.log('Sending POST to /api/admin/settings...');
  try {
    const res = await fetch('http://localhost:8845/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        promptCreationRules: [{ text: 'Test Rule', example: 'Test Example' }]
      })
    });
    
    const data = await res.json();
    console.log('Response Status:', res.status);
    console.log('Response Body:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Request failed:', err);
  }
  
  process.exit(0);
}

triggerError();
