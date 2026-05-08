const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const SystemSettings = require('./models/SystemSettings');

async function testGenerate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prompt_marketplace');
    const settings = await SystemSettings.findOne();
    
    if (!settings || !settings.geminiApiKey) {
      console.error('API Key not found in DB');
      process.exit(1);
    }

    console.log('Using Model:', 'gemini-flash-latest');
    const genAI = new GoogleGenerativeAI(settings.geminiApiKey);
    const geminiModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const systemPrompt = "Generate a JSON test object with { \"success\": true }";

    console.log('Generating content...');
    const result = await geminiModel.generateContent(systemPrompt);
    const response = await result.response;
    console.log('Response received.');
    const text = response.text();
    console.log('Response text:', text);
    
    process.exit(0);
  } catch (error) {
    console.error('Generation Error:', error);
    process.exit(1);
  }
}

testGenerate();
