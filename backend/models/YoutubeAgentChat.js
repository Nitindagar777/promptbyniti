const mongoose = require('mongoose');

const youtubeAgentChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [{
    sender: {
      type: String,
      enum: ['user', 'agent'],
      required: true
    },
    text: {
      type: String,
      default: ''
    },
    structuredData: {
      type: mongoose.Schema.Types.Mixed,
      default: null // Stores parsed JSON output (e.g. video plans, calendars)
    },
    suggestedSteps: {
      type: [String],
      default: [] // Recommended next actions for the creator
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('YoutubeAgentChat', youtubeAgentChatSchema);
