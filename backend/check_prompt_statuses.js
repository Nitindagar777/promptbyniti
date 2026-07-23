const mongoose = require('mongoose');
const Prompt = require('./models/Prompt');
require('dotenv').config();

async function checkStatuses() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const total = await Prompt.countDocuments({});
  const approved = await Prompt.countDocuments({ status: 'approved' });
  const pending = await Prompt.countDocuments({ status: 'pending' });
  const noStatus = await Prompt.countDocuments({ status: { $exists: false } });
  const nullStatus = await Prompt.countDocuments({ status: null });

  console.log(`Total documents in prompts collection: ${total}`);
  console.log(`Approved: ${approved}`);
  console.log(`Pending: ${pending}`);
  console.log(`No status field: ${noStatus}`);
  console.log(`Null status: ${nullStatus}`);

  // Find all distinct statuses
  const distinctStatuses = await Prompt.distinct('status');
  console.log('Distinct status values in DB:', distinctStatuses);

  mongoose.disconnect();
}

checkStatuses().catch(console.error);
