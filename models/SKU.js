const mongoose = require('mongoose');

const skuSchema = new mongoose.Schema({
  skuCode: {
    type: String,
    required: false,
    unique: true,
    trim: true
  },
  productDescription: {
    type: String,
    required: true,
    trim: true
  },
  vendor: {
    type: String,
    required: true,
    trim: true
  },
  priceWithoutVAT: {
    type: Number,
    required: true,
    min: 0
  },
  minimumOrderItems: {
    type: Number,
    required: true,
    min: 1
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate SKU code
skuSchema.pre('save', async function(next) {
  if (this.isNew && !this.skuCode) {
    try {
      // Find the highest SKU code
      const lastSKU = await this.constructor.findOne({}, {}, { sort: { skuCode: -1 } });
      let nextNumber = 1;
      
      if (lastSKU && lastSKU.skuCode) {
        // Extract number from SKU code (e.g., "P0001" -> 1)
        const match = lastSKU.skuCode.match(/P(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      
      // Generate new SKU code with zero padding
      this.skuCode = `P${nextNumber.toString().padStart(4, '0')}`;
      console.log(`Generated SKU code: ${this.skuCode}`);
    } catch (error) {
      console.error('Error generating SKU code:', error);
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('SKU', skuSchema);
