const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  generateType: { type: String, enum: ['image', 'video', 'text'], required: true },
  model: { type: String, required: true },
  tokens: { type: Number, default: 5 },
  template: { type: String, required: true },
  instructions: { type: String },
  keywords: [{ type: String }],
  samples: [
    {
      input: { type: String },
      output: { type: String } // URL or Base64
    }
  ],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  price: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prompt', promptSchema);
