const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function resetRules() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const settingsColl = mongoose.connection.db.collection('systemsettings');
    await settingsColl.updateOne({}, { $unset: { promptCreationRules: "" } });
    console.log('Cleared promptCreationRules from DB to allow new defaults to load.');

    process.exit(0);
  } catch (err) {
    console.error('Reset failed:', err);
    process.exit(1);
  }
}

resetRules();
