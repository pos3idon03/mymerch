const mongoose = require('mongoose');

const customOrderSchema = new mongoose.Schema({
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }],
  quantities: [{
    type: Number,
    required: true
  }],
  image: {
    type: String
  },
  options: [{
    type: String
  }],
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    //required: true
  },
  orderStatus: {
    type: String,
    enum: ['Submitted', 'In Progress', 'Completed', 'Rejected'],
    default: 'Submitted',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CustomOrder', customOrderSchema); 