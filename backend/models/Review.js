const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  quote: {
    type: String,
    required: true,
    maxlength: 500
  },
  stars: {
    type: Number,
    required: true,
    min: 0.5,
    max: 5
  },
  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
