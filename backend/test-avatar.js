const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const checkAvatar = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email: 'nitindagar0800@gmail.com' });
    
    if (user) {
      console.log(`User Name: ${user.name}`);
      console.log(`User Avatar: ${user.avatar || 'EMPTY'}`);
    } else {
      console.log('User not found!');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkAvatar();
