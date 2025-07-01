const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: false,
    trim: true
  },
  answer: {
    type: String,
    required: false,
    trim: true
  },
  order: {
    type: Number,
    required: false,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FAQ', faqSchema); 