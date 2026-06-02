const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function restrictOldUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const usersColl = mongoose.connection.db.collection('users');
    const result = await usersColl.updateMany({}, { $set: { hasUsedFreePrompt: true } });
    console.log(`Successfully restricted ${result.modifiedCount} old users by setting hasUsedFreePrompt to true!`);

    process.exit(0);
  } catch (err) {
    console.error('Restriction failed:', err);
    process.exit(1);
  }
}

restrictOldUsers();
