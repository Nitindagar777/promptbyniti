const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const connect = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const Prompt = require('./models/Prompt');

const uploadToCloudinary = async (base64String) => {
  if (!base64String || !base64String.startsWith('data:')) return base64String;
  try {
    const result = await cloudinary.uploader.upload(base64String, {
      resource_type: 'auto',
      folder: 'prompt_gene'
    });
    return result.secure_url;
  } catch (err) {
    console.error('Upload failed, retrying once...', err.message);
    try {
        const result = await cloudinary.uploader.upload(base64String, {
            resource_type: 'auto',
            folder: 'prompt_gene'
        });
        return result.secure_url;
    } catch (e) {
        console.error('Final failure:', e.message);
        return base64String;
    }
  }
};

const run = async () => {
  await connect();
  const promptIds = await Prompt.find({}).select('_id').lean();
  
  for (const { _id } of promptIds) {
    const prompt = await Prompt.findById(_id);
    let updated = false;
    
    if (prompt.thumbnail && prompt.thumbnail.startsWith('data:')) {
        prompt.thumbnail = await uploadToCloudinary(prompt.thumbnail);
        updated = true;
    }
    
    for (let i = 0; i < prompt.samples.length; i++) {
        if (prompt.samples[i].output && prompt.samples[i].output.startsWith('data:')) {
            console.log(`Migrating ${_id} sample ${i}...`);
            prompt.samples[i].output = await uploadToCloudinary(prompt.samples[i].output);
            updated = true;
        }
    }
    
    if (updated) {
        prompt.markModified('samples');
        await prompt.save();
        console.log(`Updated prompt ${_id}`);
    }
  }
  console.log('Migration finished!');
  process.exit(0);
};

run();
