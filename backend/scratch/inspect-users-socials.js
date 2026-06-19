const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const User = require('../models/User');
const Prompt = require('../models/Prompt');

async function run() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/prompt_gene';
    await mongoose.connect(uri);
    console.log('Connected!');

    // Find any user with non-empty socialLinks
    const users = await User.find({});
    let usersWithLinks = 0;
    users.forEach(u => {
      const links = u.socialLinks || {};
      const hasLinks = Object.values(links).some(url => url && url.trim() !== '');
      if (hasLinks) {
        usersWithLinks++;
        console.log(`User: ${u.name} has links:`, links);
      }
    });
    console.log(`Total users with links: ${usersWithLinks} / ${users.length}`);

    // Find any prompt with non-empty socialLinks
    const prompts = await Prompt.find({});
    let promptsWithLinks = 0;
    prompts.forEach(p => {
      const links = p.socialLinks || {};
      const hasLinks = Object.values(links).some(url => url && url.trim() !== '');
      if (hasLinks) {
        promptsWithLinks++;
        console.log(`Prompt: ${p.name || p.title} (${p._id}) has links:`, links);
      }
    });
    console.log(`Total prompts with links: ${promptsWithLinks} / ${prompts.length}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
