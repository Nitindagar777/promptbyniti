const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Prompt = require('./models/Prompt');

async function cleanDuplicates() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/prompt_gene';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB:', uri.split('@')[1] || uri);

  const prompts = await Prompt.find({}).sort({ createdAt: -1 });
  console.log('Total prompts in DB:', prompts.length);

  const seenTitles = new Set();
  const duplicatesToDelete = [];

  for (const p of prompts) {
    const titleKey = (p.name || p.title || '').trim().toLowerCase();
    if (!titleKey) continue;
    if (seenTitles.has(titleKey)) {
      duplicatesToDelete.push(p._id);
      console.log('Found duplicate to remove:', p.name, p._id);
    } else {
      seenTitles.add(titleKey);
    }
  }

  if (duplicatesToDelete.length > 0) {
    const delRes = await Prompt.deleteMany({ _id: { $in: duplicatesToDelete } });
    console.log('✅ Deleted duplicate prompts count:', delRes.deletedCount);
  } else {
    console.log('✅ No duplicate prompts found.');
  }

  await mongoose.disconnect();
}

cleanDuplicates().catch(err => {
  console.error('Error cleaning duplicates:', err);
  process.exit(1);
});
