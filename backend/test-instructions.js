const mongoose = require('mongoose');
require('dotenv').config();
const Prompt = require('./models/Prompt');

const checkInstructions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const prompts = await Prompt.find({});
    
    for (const p of prompts) {
      console.log(`Prompt: "${p.name}"`);
      console.log(`Instructions: ${p.instructions ? p.instructions : 'MISSING OR EMPTY'}`);
      console.log('---');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkInstructions();
