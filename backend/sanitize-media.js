const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Prompt = require('./models/Prompt');

const sanitize = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const prompts = await Prompt.find();
    console.log(`Checking ${prompts.length} prompts...`);

    for (const p of prompts) {
      let updated = false;
      
      // If thumbnail is a broken string
      if (p.thumbnail === 'undefined' || p.thumbnail === 'null' || (typeof p.thumbnail === 'string' && p.thumbnail.trim() === '')) {
        p.thumbnail = undefined;
        updated = true;
      }

      // Check samples
      if (p.samples && Array.isArray(p.samples)) {
        for (let i = 0; i < p.samples.length; i++) {
          const sample = p.samples[i];
          const output = typeof sample === 'object' ? sample.output : sample;
          if (output === 'undefined' || output === 'null' || (typeof output === 'string' && output.trim() === '')) {
             if (typeof sample === 'object') {
                 p.samples[i].output = undefined;
             } else {
                 p.samples[i] = undefined;
             }
             updated = true;
          }
        }
        p.samples = p.samples.filter(s => s !== undefined);
      }

      if (updated) {
        console.log(`♻️ Sanitized media for: ${p.name || p.title}`);
        await p.save();
      }
    }

    console.log('✅ Sanitization complete.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

sanitize();
