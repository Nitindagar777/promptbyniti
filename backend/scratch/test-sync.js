const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const User = require('../models/User');
const Prompt = require('../models/Prompt');

async function run() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/prompt_gene';
    await mongoose.connect(uri);
    console.log('Connected!');

    // Find Nitin Dagar user
    const user = await User.findOne({ email: 'nitindagar0800@gmail.com' });
    if (!user) {
      console.log('User not found');
      await mongoose.disconnect();
      return;
    }

    const originalLinks = user.socialLinks || {};
    console.log('Original Nitin Dagar links:', originalLinks);

    // Update user social links
    const testLinks = {
      ...originalLinks,
      website: 'https://test-sync-success.com'
    };

    console.log('Updating user profile with test links...');
    user.socialLinks = testLinks;
    await user.save();

    // Propagate to all prompts (imitating profile PUT endpoint logic)
    console.log('Propagating user social links to prompts...');
    await Prompt.updateMany(
      { seller: user._id },
      { $set: { socialLinks: testLinks } }
    );

    // Verify prompts are updated
    const prompts = await Prompt.find({ seller: user._id }).limit(3);
    console.log(`Checking ${prompts.length} prompts...`);
    prompts.forEach(p => {
      console.log(`Prompt: ${p.name || p.title} (${p._id}) - Link:`, p.socialLinks?.website);
    });

    const allSuccessful = prompts.every(p => p.socialLinks?.website === 'https://test-sync-success.com');
    if (allSuccessful) {
      console.log('✅ Success: All prompts synced automatically!');
    } else {
      console.log('❌ Failure: Not all prompts were synced.');
    }

    // Revert changes
    console.log('Reverting changes...');
    user.socialLinks = originalLinks;
    await user.save();
    await Prompt.updateMany(
      { seller: user._id },
      { $set: { socialLinks: originalLinks } }
    );

    console.log('Changes reverted successfully.');
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
