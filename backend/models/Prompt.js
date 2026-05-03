const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  generateType: { type: String, enum: ['image', 'video', 'text'], required: true },
  model: { type: String, required: true },
  tokens: { type: Number, default: 5 },
  priceTokens: { type: Number, default: 5 },
  template: { type: String, required: true },
  instructions: { type: String },
  keywords: [{ type: String }],
  thumbnail: { type: String }, // first sample image (base64 or URL)
  samples: [
    {
      input: { type: String },
      output: { type: String } // URL or Base64
    }
  ],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String, default: '' },
  price: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  sales: { type: Number, default: 0 },
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      userName: { type: String, required: true },
      userAvatar: { type: String },
      rating: { type: Number, required: true, min: 0.5, max: 5 },
      comment: { type: String, required: true },
      reply: { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prompt', promptSchema);
