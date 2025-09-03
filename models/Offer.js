const mongoose = require('mongoose');

const offerItemSchema = new mongoose.Schema({
  sku: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SKU',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  printCostPerItem: {
    type: Number,
    required: true,
    min: 0
  },
  marginPercentage: {
    type: Number,
    required: true,
    min: 0
  },
  // Calculated fields
  totalCostWithoutVAT: {
    type: Number,
    required: false
  },
  costVAT: {
    type: Number,
    required: false
  },
  totalCost: {
    type: Number,
    required: false
  },
  sellingPricePerItemWithoutVAT: {
    type: Number,
    required: false
  },
  netRevenue: {
    type: Number,
    required: false
  },
  vat: {
    type: Number,
    required: false
  },
  sellingPricePerItemWithVAT: {
    type: Number,
    required: false
  },
  totalRevenue: {
    type: Number,
    required: false
  }
});

const offerSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  offerDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  items: [offerItemSchema],
  // Calculated totals
  totalCost: {
    type: Number,
    required: false
  },
  totalRevenue: {
    type: Number,
    required: false
  },
  totalProfit: {
    type: Number,
    required: false
  },
  profitMargin: {
    type: Number,
    required: false
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'accepted', 'rejected'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate totals
offerSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalCost = this.items.reduce((sum, item) => sum + item.totalCost, 0);
    this.totalRevenue = this.items.reduce((sum, item) => sum + item.totalRevenue, 0);
    this.totalProfit = this.totalRevenue - this.totalCost;
    this.profitMargin = this.totalRevenue > 0 ? (this.totalProfit / this.totalRevenue) * 100 : 0;
  } else {
    this.totalCost = 0;
    this.totalRevenue = 0;
    this.totalProfit = 0;
    this.profitMargin = 0;
  }
  next();
});

module.exports = mongoose.model('Offer', offerSchema);
