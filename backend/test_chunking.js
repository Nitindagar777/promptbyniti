const mongoose = require('mongoose');
const Prompt = require('./models/Prompt');
require('dotenv').config();

async function runChunkTest() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to Atlas');

  console.time('Chunk 1: 60 items');
  const c1 = await Prompt.find({ status: 'approved' })
    .select('_id title name description keywords category generateType model price thumbnail samples views sales averageRating seller createdAt')
    .sort({ createdAt: -1 })
    .limit(60)
    .lean();
  console.timeEnd('Chunk 1: 60 items');
  console.log('Chunk 1 count:', c1.length);

  mongoose.disconnect();
}

runChunkTest().catch(console.error);
