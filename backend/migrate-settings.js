const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const SystemSettings = require('./models/SystemSettings');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    let settings = await SystemSettings.findOne();
    if (settings) {
      console.log('Current settings found');
      
      // Check if rules need migration
      const needsMigration = settings.promptCreationRules.some(r => typeof r === 'string');
      
      if (needsMigration) {
        console.log('Migrating rules...');
        settings.promptCreationRules = settings.promptCreationRules.map(r => {
          if (typeof r === 'string') {
            return { text: r, example: '' };
          }
          return r;
        });
        await settings.save();
        console.log('Migration complete');
      } else {
        console.log('No migration needed');
      }
    } else {
      console.log('No settings found, creating default...');
      settings = new SystemSettings();
      await settings.save();
      console.log('Defaults created');
    }

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
