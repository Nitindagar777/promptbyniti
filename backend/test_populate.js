const mongoose = require('mongoose');
const Prompt = require('./models/Prompt');
const User = require('./models/User'); // ensure User model registered
require('dotenv').config();

async function runTest() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('Connected to DB');

  console.time('WITHOUT populate');
  const p1 = await Prompt.find({ status: 'approved' })
    .select('-instructions -template')
    .sort({ createdAt: -1 })
    .lean();
  console.timeEnd('WITHOUT populate');
  console.log('p1 count:', p1.length);

  console.time('WITH populate');
  const p2 = await Prompt.find({ status: 'approved' })
    .populate('seller', 'name avatar socialLinks followers')
    .select('-instructions -template')
    .sort({ createdAt: -1 })
    .lean();
  console.timeEnd('WITH populate');
  console.log('p2 count:', p2.length);

  mongoose.disconnect();
}

runTest().catch(console.error);
