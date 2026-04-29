const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Prompt = require('./models/Prompt');

const checkPrompts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email: 'nitindagar0800@gmail.com' });
    
    if (user) {
      console.log(`User ID: ${user._id}`);
      
      const prompts = await Prompt.find({});
      console.log(`Total prompts in DB: ${prompts.length}`);
      
      for (const p of prompts) {
        console.log(`- Prompt "${p.title || p.name}" | Seller Field: ${p.seller} | Type: ${typeof p.seller}`);
      }
      
      // Test the exact query the server uses
      const query = {
        $or: [
          { seller: user._id },
          { seller: user._id.toString() }
        ]
      };
      
      const matchedPrompts = await Prompt.find(query);
      console.log(`Matched by server query: ${matchedPrompts.length}`);
      
    } else {
      console.log('User not found!');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkPrompts();
