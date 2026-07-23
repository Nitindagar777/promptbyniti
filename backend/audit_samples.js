const mongoose = require('mongoose');
const Prompt = require('./models/Prompt');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

mongoose.connect(MONGO_URI).then(async () => {
  const prompts = await Prompt.find({ status: 'approved' }).lean();
  console.log('Total approved prompts:', prompts.length);
  
  const sampleCounts = {};
  prompts.forEach(p => {
    const cnt = (p.samples || []).length;
    sampleCounts[cnt] = (sampleCounts[cnt] || 0) + 1;
    if (cnt < 4) {
      console.log(`Prompt with ${cnt} samples: "${p.title || p.name}" (ID: ${p._id})`);
    }
  });
  
  console.log('Sample Count Distribution:', sampleCounts);
  mongoose.disconnect();
}).catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
