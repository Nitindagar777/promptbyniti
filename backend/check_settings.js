const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const SystemSettings = require('./models/SystemSettings');

async function checkDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prompt_marketplace');
    const settings = await SystemSettings.findOne();
    console.log('Settings in DB:', JSON.stringify(settings, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error checking DB:', error);
    process.exit(1);
  }
}

checkDB();
