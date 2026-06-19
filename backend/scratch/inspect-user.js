const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const User = require('../models/User');

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('Connected!');

    const user = await User.findOne({ email: 'fastfact455@gmail.com' });
    console.log('User raw document:', user);
    console.log('User socialLinks:', user?.socialLinks);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
