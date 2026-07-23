const mongoose = require('mongoose');
const Prompt = require('./models/Prompt');
require('dotenv').config();

console.time('DB Query Time');
mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  const prompts = await Prompt.find({ status: 'approved' })
    .select('-instructions -template')
    .sort({ createdAt: -1 })
    .lean();
  console.timeEnd('DB Query Time');
  console.log('Found prompts count:', prompts.length);
  mongoose.disconnect();
}).catch(e => {
  console.error('DB Error:', e.message);
  process.exit(1);
});
