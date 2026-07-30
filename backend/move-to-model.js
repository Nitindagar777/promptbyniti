const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const promptSchema = new mongoose.Schema({
  name: String,
  title: String,
  category: String,
  description: String,
  template: String
}, { strict: false });

const Prompt = mongoose.model('Prompt', promptSchema);

async function movePromptsToModel() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🍃 Connected to MongoDB...');

    const prompts = await Prompt.find();
    let updatedCount = 0;

    for (const p of prompts) {
      const text = `${p.name || ''} ${p.title || ''} ${p.description || ''} ${p.template || ''}`.toLowerCase();
      
      const isModelPrompt = text.includes('latina model') || 
                            text.includes('asian model') || 
                            text.includes('brunette model') || 
                            text.includes('massive bust') || 
                            text.includes('cleavage') || 
                            text.includes('model,') || 
                            text.includes('model ');

      if (isModelPrompt && p.category !== 'model') {
        console.log(`📌 Updating prompt [${p.name || p.title}] category from '${p.category}' -> 'model'`);
        p.category = 'model';
        await p.save();
        updatedCount++;
      }
    }

    console.log(`✅ Successfully moved ${updatedCount} prompt(s) to the 'model' category!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating prompt categories:', err.message);
    process.exit(1);
  }
}

movePromptsToModel();
