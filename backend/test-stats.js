const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Prompt = require('./models/Prompt');

const testStats = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email: 'nitindagar0800@gmail.com' });
    
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }
    
    console.log(`User ID: ${user._id}`);
    
    const sellerIdStr = user._id.toString();
    const sellerIdObj = new mongoose.Types.ObjectId(user._id);
    
    const prompts = await Prompt.find({ 
      $or: [
        { seller: sellerIdObj },
        { seller: sellerIdStr }
      ]
    });
    
    console.log(`Query Results: Found ${prompts.length} prompts directly from DB.`);
    
    if (prompts.length > 0) {
      console.log(`First prompt ID: ${prompts[0]._id}, Seller: ${prompts[0].seller}`);
      console.log(`Type of Seller in DB: ${typeof prompts[0].seller}, isObjectId: ${prompts[0].seller instanceof mongoose.Types.ObjectId}`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

testStats();
