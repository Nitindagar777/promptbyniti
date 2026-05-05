const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Prompt = require('../models/Prompt');

async function checkPrompts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const count = await Prompt.countDocuments();
    console.log('Total prompts:', count);
    
    const statuses = await Prompt.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('Statuses:', statuses);
    
    const sizes = await mongoose.connection.db.collection('prompts').aggregate([
      { $project: { 
        name: 1, 
        thumbnailSize: { $strLenCP: { $ifNull: ["$thumbnail", ""] } },
        samplesSize: { $size: { $ifNull: ["$samples", []] } },
        firstSampleSize: { $strLenCP: { $ifNull: [{ $arrayElemAt: ["$samples.output", 0] }, ""] } }
      } }
    ]).toArray();
    console.log('Document sizes:', JSON.stringify(sizes, null, 2));
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Check failed:', err);
  }
}

checkPrompts();
