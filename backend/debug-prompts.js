const mongoose = require('mongoose');
require('dotenv').config();
const Prompt = require('./models/Prompt');
const User = require('./models/User');

const debug = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('--- DEBUG START ---');

    const users = await User.find();
    console.log(`Total Users: ${users.length}`);
    users.forEach(u => console.log(`User: ${u.email} ID: ${u._id}`));

    const prompts = await Prompt.find();
    console.log(`Total Prompts: ${prompts.length}`);
    prompts.forEach(p => {
      console.log(`Prompt: "${p.name}" ID: ${p._id} Seller ID: ${p.seller} Status: ${p.status}`);
    });

    console.log('--- DEBUG END ---');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

debug();
