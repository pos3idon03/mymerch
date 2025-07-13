const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: false
  },
  link: {
    type: String,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  placement: {
    type: String,
    enum: [
      'homepage',
      'custom-order',
      'offer-banner',
      'customers-banner',
      'categories',
      'event-banner',
      'other'
    ],
    default: 'other',
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Banner', bannerSchema); 