const mongoose = require('mongoose');
const Prompt = require('./models/Prompt');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

mongoose.connect(MONGO_URI).then(async () => {
  const p = await Prompt.findOne({ status: 'approved' }).lean();
  console.log('=== FULL PROMPT OBJECT ===');
  if (p) {
    console.log('ID:', p._id);
    console.log('Title:', p.title || p.name);
    console.log('Thumbnail:', p.thumbnail);
    console.log('Samples:', JSON.stringify(p.samples, null, 2));
    console.log('All Keys:', Object.keys(p));
  }
  mongoose.disconnect();
}).catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
