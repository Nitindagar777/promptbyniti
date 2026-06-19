const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const User = require('../models/User');
const Prompt = require('../models/Prompt');

async function run() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/prompt_gene';
    await mongoose.connect(uri);
    console.log('Connected!');

    // Find all prompts
    const prompts = await Prompt.find({});
    console.log(`Scanning ${prompts.length} prompts...`);

    let migratedCount = 0;

    for (const prompt of prompts) {
      const links = prompt.socialLinks || {};
      const hasLinks = Object.values(links).some(url => url && url.trim() !== '');

      if (hasLinks && prompt.seller) {
        // Find the seller user
        const sellerUser = await User.findById(prompt.seller);
        if (sellerUser) {
          const sellerLinks = sellerUser.socialLinks || {};
          const sellerHasLinks = Object.values(sellerLinks).some(url => url && url.trim() !== '');

          // Copy links if the user doesn't have them in their profile yet
          if (!sellerHasLinks) {
            sellerUser.socialLinks = links;
            await sellerUser.save();
            migratedCount++;
            console.log(`Migrated social links from prompt "${prompt.name || prompt.title}" to seller "${sellerUser.name}" (${sellerUser.email})`);
          }
        }
      }
    }

    console.log(`Migration completed. Updated ${migratedCount} users.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
