const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema({
  geminiApiKey: { type: String, default: '' },
  promptCreationRules: { 
    type: [String], 
    default: [
      "Prompt must be unique and not copied from other sources.",
      "High-quality sample outputs (3) are mandatory.",
      "Instructions must be clear and reproducible.",
      "No NSFW or illegal content generation allowed.",
      "Title should be descriptive and catchy."
    ] 
  },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema);
