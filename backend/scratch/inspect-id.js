const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const User = require('../models/User');

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('Connected!');

    const user = await User.findById('69d06753d5497ddbd5f28d28');
    if (!user) {
      console.log('User 69d06753d5497ddbd5f28d28 NOT found!');
    } else {
      console.log('User found:', user.name, user.email);
    }

    const allUsers = await User.find({}, 'name email');
    console.log('All Users in DB:', allUsers);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
