const mongoose = require('mongoose');
const Prompt = require('./models/Prompt');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to Atlas');

  console.time('Test 1: Limit 16 lightweight');
  const t1 = await Prompt.find({ status: 'approved' })
    .select('_id title name category generateType price thumbnail samples views sales averageRating')
    .sort({ createdAt: -1 })
    .limit(16)
    .lean();
  console.timeEnd('Test 1: Limit 16 lightweight');
  console.log('t1 count:', t1.length);

  console.time('Test 2: All 213 lightweight');
  const t2 = await Prompt.find({ status: 'approved' })
    .select('_id title name category generateType price thumbnail samples views sales averageRating')
    .sort({ createdAt: -1 })
    .lean();
  console.timeEnd('Test 2: All 213 lightweight');
  console.log('t2 count:', t2.length);

  mongoose.disconnect();
}

run().catch(console.error);
