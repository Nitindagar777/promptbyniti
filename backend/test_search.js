const mongoose = require('mongoose');
const Prompt = require('./models/Prompt');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI).then(async () => {
  const prompts = await Prompt.find({ status: 'approved' }).lean();
  console.log('Total approved prompts:', prompts.length);
  
  const query = 'girl';
  
  const matches = prompts.filter(t => {
    const q = query.toLowerCase().trim();
    
    const titleMatch = (t.title || t.name || '').toLowerCase().includes(q);
    const descMatch = (t.description || '').toLowerCase().includes(q);
    const instMatch = (t.instructions || '').toLowerCase().includes(q);
    const tmplMatch = (t.template || '').toLowerCase().includes(q);
    const catMatch = (t.category || '').toLowerCase().includes(q);
    
    let kwMatch = false;
    if (Array.isArray(t.keywords)) kwMatch = t.keywords.some(k => k && String(k).toLowerCase().includes(q));
    else if (typeof t.keywords === 'string') kwMatch = t.keywords.toLowerCase().includes(q);
    
    let sampleInputMatch = false;
    if (Array.isArray(t.samples)) {
      sampleInputMatch = t.samples.some(s => s && (typeof s === 'object' ? (s.input || s.prompt || '') : String(s)).toLowerCase().includes(q));
    }
    
    return titleMatch || descMatch || instMatch || tmplMatch || catMatch || kwMatch || sampleInputMatch;
  });
  
  console.log(`Query "${query}": Found ${matches.length} matching prompts out of ${prompts.length}!`);
  matches.slice(0, 5).forEach((m, i) => {
    console.log(` Match #${i+1}: "${m.title || m.name}" (desc: "${(m.description || '').substring(0, 60)}...")`);
  });
  
  mongoose.disconnect();
}).catch(e => {
  console.error(e);
  process.exit(1);
});
