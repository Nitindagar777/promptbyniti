const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function resetFreePrompts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const usersColl = mongoose.connection.db.collection('users');
    const result = await usersColl.updateMany({}, { $set: { hasUsedFreePrompt: false } });
    console.log(`Successfully reset hasUsedFreePrompt to false for ${result.modifiedCount} users!`);

    process.exit(0);
  } catch (err) {
    console.error('Reset failed:', err);
    process.exit(1);
  }
}

resetFreePrompts();
