const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const SystemSettings = require('./models/SystemSettings');

async function testFetch() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    try {
      let settings = await SystemSettings.findOne();
      console.log('Fetch success:', settings ? 'Found' : 'Not found');
      if (!settings) {
        console.log('Attempting to create defaults...');
        settings = new SystemSettings();
        await settings.save();
        console.log('Defaults saved');
      }
      console.log('Settings data:', JSON.stringify(settings, null, 2));
    } catch (err) {
      console.error('FETCH ERROR:', err);
    }

    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
}

testFetch();
