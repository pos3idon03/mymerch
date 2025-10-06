const mongoose = require('mongoose');

const ColorVariantSchema = new mongoose.Schema({
  colorName: {
    type: String,
    required: true,
    trim: true
  },
  colorCode: {
    type: String,
    required: true,
    trim: true
  },
  frontImage: {
    type: String,
    required: true
  },
  backImage: {
    type: String,
    default: ''
  }
});

const DesignStudioProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['tshirt', 'hoodie', 'mug', 'phone-case', 'tote-bag', 'cap', 'other'],
    default: 'tshirt'
  },
  colorVariants: [ColorVariantSchema],
  printableAreas: {
    front: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      width: { type: Number, default: 300 },
      height: { type: Number, default: 300 }
    },
    back: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      width: { type: Number, default: 300 },
      height: { type: Number, default: 300 }
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DesignStudioProduct', DesignStudioProductSchema);

