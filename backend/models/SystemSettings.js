const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema({
  geminiApiKey: { type: String, default: '' },
  paidGeminiApiKey: { type: String, default: '' },
  geminiModel: { type: String, default: 'gemini-flash-latest' },
  promptCreationRules: {
    type: Array,
    default: [
      { text: "Prompt must be unique and not copied from other sources.", example: "Avoid generic prompts like 'make a cat'." },
      { text: "High-quality sample outputs (3) are mandatory.", example: "Ensure all 3 samples show different aspects of the prompt." },
      { text: "Instructions must be clear and reproducible.", example: "Include aspect ratios like --ar 16:9 in instructions." },
      { text: "No NSFW or illegal content generation allowed.", example: "" },
      { text: "Title should be descriptive and catchy.", example: "Instead of 'Car', use 'Hyper-realistic Cyberpunk Supercar'." }
    ]
  },
  modelSectionVisible: { type: Boolean, default: true },
  modelAutoLoop: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema);
