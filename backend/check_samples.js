const mongoose = require('mongoose');
const Prompt = require('./models/Prompt');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

mongoose.connect(MONGO_URI).then(async () => {
  // Search for floating library prompt
  const prompts = await Prompt.find({ status: 'approved' }).lean();
  
  console.log('Total approved prompts:', prompts.length);
  console.log('\nAll titles:');
  prompts.forEach((p, i) => {
    console.log(i + ':', p.title || p.name);
  });
  
  // Check one that might be the "Infinite Floating Library" 
  const libraryPrompt = prompts.find(p => 
    (p.title || p.name || '').toLowerCase().includes('float') || 
    (p.title || p.name || '').toLowerCase().includes('library') ||
    (p.title || p.name || '').toLowerCase().includes('infinite')
  );
  
  if (libraryPrompt) {
    console.log('\n=== Found library prompt ===');
    console.log('Title:', libraryPrompt.title || libraryPrompt.name);
    console.log('Thumbnail:', libraryPrompt.thumbnail);
    (libraryPrompt.samples || []).forEach((s, i) => {
      const url = typeof s === 'object' ? (s.output || s.url || '') : s;
      console.log('Sample ' + i + ':', url);
    });
  }
  
  // Also show first prompt's full sample data
  if (prompts.length > 0) {
    const first = prompts[prompts.length - 1]; // Last prompt (most recently created based on sort)
    console.log('\n=== Last prompt (newest) ===');
    console.log('Title:', first.title || first.name);
    console.log('Thumbnail:', first.thumbnail);
    (first.samples || []).forEach((s, i) => {
      const url = typeof s === 'object' ? (s.output || s.url || '') : s;
      console.log('Sample ' + i + ':', url);
    });
  }
  
  mongoose.disconnect();
}).catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
