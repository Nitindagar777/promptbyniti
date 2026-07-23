const mongoose = require('mongoose');
const Prompt = require('./models/Prompt');
require('dotenv').config();

async function createIndex() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://nitindagar:nitindagar0800@nitin.w8mylqb.mongodb.net/test');
  console.log('Connected to DB');

  console.time('CreateIndex');
  await Prompt.collection.createIndex({ status: 1, createdAt: -1 });
  console.timeEnd('CreateIndex');
  console.log('Index status:1, createdAt:-1 created successfully!');

  console.time('QueryWithIndex');
  const prompts = await Prompt.find({ status: 'approved' })
    .select('-instructions -template')
    .sort({ createdAt: -1 })
    .lean();
  console.timeEnd('QueryWithIndex');
  console.log('Prompts count:', prompts.length);

  mongoose.disconnect();
}

createIndex().catch(console.error);
