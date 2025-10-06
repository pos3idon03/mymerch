const mongoose = require('mongoose');

const MockupSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DesignStudioProduct',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  colorName: {
    type: String,
    required: true
  },
  view: {
    type: String,
    enum: ['front', 'back'],
    default: 'front'
  },
  designData: {
    type: String,
    required: true
  },
  mockupImage: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
});

const DesignStudioOrderSchema = new mongoose.Schema({
  mockups: [MockupSchema],
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  totalQuantity: {
    type: Number,
    required: true,
    default: 0
  },
  orderStatus: {
    type: String,
    enum: ['Submitted', 'In Review', 'Quoted', 'Approved', 'In Production', 'Completed', 'Cancelled'],
    default: 'Submitted'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DesignStudioOrder', DesignStudioOrderSchema);

