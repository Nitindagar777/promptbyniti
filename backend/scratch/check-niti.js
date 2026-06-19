const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const User = require('../models/User');
const Prompt = require('../models/Prompt');

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('Connected!');

    const user = await User.findOne({ email: 'nitindagar0800@gmail.com' });
    if (!user) {
      console.log('User not found!');
    } else {
      console.log('User Nitin Dagar socialLinks:', user.socialLinks);
    }

    const prompts = await Prompt.find({ seller: user?._id });
    console.log(`Total prompts for seller: ${prompts.length}`);
    prompts.forEach((p, idx) => {
      if (idx < 5) {
        console.log(`Prompt: ${p.name || p.title} (${p._id}) socialLinks:`, p.socialLinks);
      }
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
