const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
  bannerImage: {
    type: String,
    required: false
  },
  title: {
    type: String,
    required: false,
    trim: true
  },
  content: {
    type: String,
    required: false,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('About', aboutSchema); 