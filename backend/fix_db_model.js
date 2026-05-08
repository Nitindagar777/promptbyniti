const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const SystemSettings = require('./models/SystemSettings');

async function fixModel() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prompt_marketplace');
    const settings = await SystemSettings.findOne();
    
    if (settings) {
      console.log('Current Model in DB:', settings.geminiModel);
      settings.geminiModel = 'gemini-flash-latest';
      await settings.save();
      console.log('Updated Model in DB to: gemini-flash-latest');
    } else {
      console.log('No settings found to update.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing model in DB:', error);
    process.exit(1);
  }
}

fixModel();
