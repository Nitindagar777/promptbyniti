const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkRaw() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const settingsColl = mongoose.connection.db.collection('systemsettings');
    const settings = await settingsColl.findOne();
    
    if (settings) {
      console.log('Raw settings in DB:', JSON.stringify(settings, null, 2));
      
      const rules = settings.promptCreationRules;
      const needsFix = rules.some(r => typeof r === 'string');
      
      if (needsFix) {
        console.log('Fixing raw data...');
        const fixedRules = rules.map(r => {
          if (typeof r === 'string') return { text: r, example: '' };
          return r;
        });
        await settingsColl.updateOne({ _id: settings._id }, { $set: { promptCreationRules: fixedRules } });
        console.log('Raw fix complete');
      } else {
        console.log('Raw data looks fine (no strings found)');
      }
    } else {
      console.log('No settings found in collection');
    }

    process.exit(0);
  } catch (err) {
    console.error('Check failed:', err);
    process.exit(1);
  }
}

checkRaw();
