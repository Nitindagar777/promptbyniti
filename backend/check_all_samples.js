const mongoose = require('mongoose');
const Prompt = require('./models/Prompt');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI).then(async () => {
  const prompts = await Prompt.find({ status: 'approved' }).lean();
  console.log('Total approved prompts:', prompts.length);
  
  let count4 = 0;
  let countLess = 0;
  
  prompts.forEach((p, i) => {
    const samples = p.samples || [];
    const validSamples = samples.map(s => (typeof s === 'object' ? (s.output || s.url || s.image) : s)).filter(Boolean);
    if (validSamples.length >= 4) {
      count4++;
    } else {
      countLess++;
      console.log(`Prompt #${i} "${p.title || p.name}": has ${validSamples.length} valid sample URLs!`);
    }
  });
  
  console.log(`\nSUMMARY: ${count4} prompts have >= 4 samples. ${countLess} prompts have < 4 samples.`);
  mongoose.disconnect();
}).catch(e => {
  console.error(e);
  process.exit(1);
});
