const mongoose = require('mongoose');

const youtubeAgentMemorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  channelName: {
    type: String,
    default: ''
  },
  niche: {
    type: String,
    default: ''
  },
  audience: {
    type: String,
    default: ''
  },
  brandColor: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  goal: {
    type: String,
    default: ''
  },
  tone: {
    type: String,
    default: ''
  },
  editingStyle: {
    type: String,
    default: ''
  },
  uploadFrequency: {
    type: String,
    default: ''
  },
  subscribers: {
    type: Number,
    default: 0
  },
  competitors: {
    type: [String],
    default: []
  },
  generalMemories: {
    type: [String],
    default: []
  },
  analyticsData: {
    views: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },
    watchTime: { type: Number, default: 0 },
    retention: { type: Number, default: 0 },
    parsedAt: { type: Date }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('YoutubeAgentMemory', youtubeAgentMemorySchema);
