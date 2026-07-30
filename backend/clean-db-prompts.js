const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const promptSchema = new mongoose.Schema({
  name: String,
  description: String,
  template: String,
  prompt: String,
  negativePrompt: String,
  category: String
}, { strict: false });

const Prompt = mongoose.model('Prompt', promptSchema);

async function cleanDatabasePrompts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🍃 Connected to MongoDB for prompt cleanup...');

    const prompts = await Prompt.find();
    let updatedCount = 0;

    for (const p of prompts) {
      let modified = false;

      if (p.name && p.name.includes('+')) {
        p.name = p.name.replace(/\s*\+\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
        modified = true;
      }

      if (p.template && p.template.includes('+')) {
        p.template = p.template.replace(/\s*\+\s*/g, ', ').replace(/\s{2,}/g, ' ').trim();
        modified = true;
      }

      if (p.prompt && p.prompt.includes('+')) {
        p.prompt = p.prompt.replace(/\s*\+\s*/g, ', ').replace(/\s{2,}/g, ' ').trim();
        modified = true;
      }

      if (p.description) {
        let cleanDesc = p.description.replace(/\s*\+\s*/g, ', ').replace(/\s{2,}/g, ' ').trim();
        if (cleanDesc.toLowerCase().includes('professional ai prompt blueprint for') || cleanDesc.includes('+') || cleanDesc.includes('[')) {
          const topic = (p.name || 'photorealistic model').replace(/[^\w\s]/gi, '').trim();
          cleanDesc = `A professional photorealistic AI prompt blueprint for generating high quality ${topic}. Optimized for Midjourney v6 and Flux.1.`;
        }
        if (cleanDesc !== p.description) {
          p.description = cleanDesc;
          modified = true;
        }
      }

      if (modified) {
        await p.save();
        updatedCount++;
      }
    }

    console.log(`✅ Successfully cleaned ${updatedCount} existing prompts in database!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ DB Cleanup Error:', err.message);
    process.exit(1);
  }
}

cleanDatabasePrompts();
