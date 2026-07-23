const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Prompt = require('./models/Prompt');
require('dotenv').config();

async function exportFallback() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB for export...');

  const prompts = await Prompt.find({ status: 'approved' })
    .select('_id title name description keywords category generateType model price thumbnail views sales averageRating seller createdAt')
    .sort({ createdAt: -1 })
    .lean();

  const normalizedPrompts = prompts.map(p => ({
    ...p,
    samples: p.thumbnail ? [p.thumbnail] : []
  }));

  const filePath = path.join(__dirname, 'fallback_prompts.json');
  fs.writeFileSync(filePath, JSON.stringify(normalizedPrompts, null, 2));
  console.log(`✅ Exported ${normalizedPrompts.length} fallback prompts to ${filePath}`);

  mongoose.disconnect();
}

exportFallback().catch(console.error);
