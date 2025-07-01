const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false,
    trim: true
  },
  image: {
    type: String,
    required: false
  },
  context: {
    type: String,
    required: false
  },
  excerpt: {
    type: String,
    trim: true
  },
  author: {
    type: String,
    required: false,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  published: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Blog', blogSchema); 