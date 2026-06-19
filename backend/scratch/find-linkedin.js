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
      await mongoose.disconnect();
      return;
    }

    console.log('User Nitin Dagar socialLinks:', user.socialLinks);

    const prompts = await Prompt.find({ seller: user._id });
    console.log(`Total prompts: ${prompts.length}`);
    
    let hasLinkedin = false;
    prompts.forEach((p) => {
      if (p.socialLinks && (p.socialLinks.linkedin || p.socialLinks.LinkedIn)) {
        console.log(`Found LinkedIn on Prompt "${p.name}" (${p._id}):`, p.socialLinks);
        hasLinkedin = true;
      }
    });

    if (!hasLinkedin) {
      console.log('No prompts with LinkedIn found.');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
