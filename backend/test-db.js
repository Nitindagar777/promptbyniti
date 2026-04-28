const mongoose = require('mongoose');
require('dotenv').config();
const Prompt = require('./models/Prompt');

async function testUpdate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const id = '69f06851596afd56d660c196'; // From user screenshot
    console.log('Testing update for ID:', id);
    
    const result = await Prompt.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (result) {
      console.log('Update successful! New views:', result.views);
    } else {
      console.log('Prompt not found in DB');
      
      // List all prompts to see IDs
      const all = await Prompt.find().limit(5);
      console.log('Available IDs in DB:', all.map(p => p._id));
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testUpdate();
