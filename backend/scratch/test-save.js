const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const User = require('../models/User');

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('Connected!');

    const user = await User.findOne({ email: 'nitindagar0800@gmail.com' });
    if (!user) {
      console.log('User not found!');
      await mongoose.disconnect();
      return;
    }

    console.log('Current socialLinks:', user.socialLinks);

    // Simulate update payload
    const newLinks = {
      ...user.socialLinks,
      linkedin: 'https://www.linkedin.com/in/nitin-dagar/',
      facebook: 'https://www.facebook.com/profile.php?id=61588163244686'
    };

    console.log('Updating user to:', newLinks);

    await User.findByIdAndUpdate(user._id, {
      $set: { socialLinks: newLinks }
    });

    // Fetch again
    const updatedUser = await User.findById(user._id);
    console.log('Updated socialLinks in DB:', updatedUser.socialLinks);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
