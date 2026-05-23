const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Announcement title is required']
  },
  desc: {
    type: String,
    required: [true, 'Announcement description is required']
  },
  tag: {
    type: String,
    default: 'LATEST'
  },
  tagColor: {
    type: String,
    default: '#38bdf8'
  },
  type: {
    type: String,
    enum: ['latest', 'challenge', 'security', 'event'],
    default: 'latest'
  },
  date: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
