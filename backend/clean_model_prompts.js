const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();
const mongoose = require('mongoose');
const Prompt = require('./models/Prompt');

async function cleanModelPrompts() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not defined in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Delete all prompts where category is 'model' or 'models' (case insensitive)
    const result = await Prompt.deleteMany({
      category: { $regex: /^models?$/i }
    });

    console.log(`✅ Successfully deleted ${result.deletedCount} Model Prompts from MongoDB!`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error deleting model prompts:', err);
    process.exit(1);
  }
}

cleanModelPrompts();
