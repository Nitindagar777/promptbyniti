const mongoose = require('mongoose');

const LoungeMessageSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#10b981'
  },
  badge: {
    type: String,
    default: '👾 Human'
  },
  text: {
    type: String,
    default: ''
  },
  image: {
    type: String, // Cloudinary secure URL
    default: null
  },
  time: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null means public group chat, otherwise it is private 1-on-1 direct message
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('LoungeMessage', LoungeMessageSchema);
