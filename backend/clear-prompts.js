const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Prompt = require('./models/Prompt');

dotenv.config();

const clearAllPrompts = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/prompt_gene';
    console.log('🔌 Connecting to MongoDB:', mongoUri);
    await mongoose.connect(mongoUri);

    const countBefore = await Prompt.countDocuments();
    console.log(`📊 Found ${countBefore} existing prompts in database.`);

    const result = await Prompt.deleteMany({});
    console.log(`🧹 Successfully deleted ${result.deletedCount} prompts from database!`);

    const countAfter = await Prompt.countDocuments();
    console.log(`✅ Current prompt count in DB: ${countAfter}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing prompts:', err);
    process.exit(1);
  }
};

clearAllPrompts();
