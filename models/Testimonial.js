const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: false,
    trim: true
  },
  companyLogo: {
    type: String,
    required: false
  },
  testimonial: {
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

module.exports = mongoose.model('Testimonial', testimonialSchema); 