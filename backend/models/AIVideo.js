const mongoose = require('mongoose');

const aiVideoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userSessionId: { type: String }, // For guest users
  person1Image: { type: String, required: true }, // Cloudinary URL or Base64
  person2Image: { type: String, required: true }, // Cloudinary URL or Base64
  action: { type: String, required: true },
  actionLabel: { type: String },
  style: { type: String, required: true },
  duration: { type: Number, default: 5 }, // in seconds
  referenceImageUrl: { type: String },
  geminiAnalysis: { type: String },
  generatedPrompt: { type: String },
  videoUrl: { type: String },
  thumbnailUrl: { type: String },
  status: { 
    type: String, 
    enum: ['uploading', 'analyzing', 'prompting', 'ref_image', 'rendering', 'completed', 'failed'], 
    default: 'uploading' 
  },
  currentStepIndex: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  errorMessage: { type: String, default: '' },
  jobId: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, default: Date.now }
});

aiVideoSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AIVideo', aiVideoSchema);
