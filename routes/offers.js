const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const SKU = require('../models/SKU');
const auth = require('../middleware/auth');

// Get all offers
router.get('/', auth, async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate('items.sku', 'skuCode productDescription vendor priceWithoutVAT')
      .sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ message: 'Error fetching offers' });
  }
});

// Get offer by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate('items.sku', 'skuCode productDescription vendor priceWithoutVAT');
    
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    res.json(offer);
  } catch (error) {
    console.error('Error fetching offer:', error);
    res.status(500).json({ message: 'Error fetching offer' });
  }
});

// Create new offer
router.post('/', auth, async (req, res) => {
  try {
    const { customerName, offerDate, items } = req.body;

    // Validate required fields
    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Customer name and at least one item are required' });
    }

    // Validate and calculate item costs
    const processedItems = [];
    for (const item of items) {
      const { sku, quantity, printCostPerItem, marginPercentage } = item;

      if (!sku || !quantity || printCostPerItem === undefined || marginPercentage === undefined) {
        return res.status(400).json({ message: 'All item fields are required' });
      }

      // Get SKU details
      const skuDoc = await SKU.findById(sku);
      if (!skuDoc) {
        return res.status(400).json({ message: `SKU with ID ${sku} not found` });
      }

      // Calculate costs and prices
      const totalCostWithoutVAT = (skuDoc.priceWithoutVAT + parseFloat(printCostPerItem)) * parseInt(quantity);
      const costVAT = totalCostWithoutVAT * 0.24;
      const totalCost = totalCostWithoutVAT + costVAT;
      
      // Net Revenue = Total Cost * (1 + Margin)
      const netRevenue = totalCost * (1 + parseFloat(marginPercentage) / 100);
      const vat = netRevenue * 0.24;
      const totalRevenue = netRevenue + vat;
      
      // Calculate per-item values
      const sellingPricePerItemWithoutVAT = netRevenue / parseInt(quantity);
      const sellingPricePerItemWithVAT = totalRevenue / parseInt(quantity);
      const profit = totalRevenue - totalCost;
      const profitPerItem = profit / parseInt(quantity);

      processedItems.push({
        sku: sku,
        quantity: parseInt(quantity),
        printCostPerItem: parseFloat(printCostPerItem),
        marginPercentage: parseFloat(marginPercentage),
        totalCostWithoutVAT,
        costVAT,
        totalCost,
        netRevenue,
        vat,
        totalRevenue,
        profit,
        sellingPricePerItemWithoutVAT,
        sellingPricePerItemWithVAT,
        profitPerItem
      });
    }

    const offer = new Offer({
      customerName,
      offerDate: offerDate ? new Date(offerDate) : new Date(),
      items: processedItems
    });

    await offer.save();
    
    // Populate the saved offer with SKU details
    const populatedOffer = await Offer.findById(offer._id)
      .populate('items.sku', 'skuCode productDescription vendor priceWithoutVAT');
    
    res.status(201).json(populatedOffer);
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ message: 'Error creating offer' });
  }
});

// Update offer
router.put('/:id', auth, async (req, res) => {
  try {
    const { customerName, offerDate, items, status } = req.body;

    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Update basic fields
    if (customerName !== undefined) offer.customerName = customerName;
    if (offerDate !== undefined) offer.offerDate = new Date(offerDate);
    if (status !== undefined) offer.status = status;

    // Update items if provided
    if (items && Array.isArray(items)) {
      const processedItems = [];
      for (const item of items) {
        const { sku, quantity, printCostPerItem, marginPercentage } = item;

        if (!sku || !quantity || printCostPerItem === undefined || marginPercentage === undefined) {
          return res.status(400).json({ message: 'All item fields are required' });
        }

        // Get SKU details
        const skuDoc = await SKU.findById(sku);
        if (!skuDoc) {
          return res.status(400).json({ message: `SKU with ID ${sku} not found` });
        }

        // Calculate costs and prices
        const totalCostWithoutVAT = (skuDoc.priceWithoutVAT + parseFloat(printCostPerItem)) * parseInt(quantity);
        const costVAT = totalCostWithoutVAT * 0.24;
        const totalCost = totalCostWithoutVAT + costVAT;
        
        // Net Revenue = Total Cost * (1 + Margin)
        const netRevenue = totalCost * (1 + parseFloat(marginPercentage) / 100);
        const vat = netRevenue * 0.24;
        const totalRevenue = netRevenue + vat;
        
        // Calculate per-item values
        const sellingPricePerItemWithoutVAT = netRevenue / parseInt(quantity);
        const sellingPricePerItemWithVAT = totalRevenue / parseInt(quantity);
        const profit = totalRevenue - totalCost;
        const profitPerItem = profit / parseInt(quantity);

        processedItems.push({
          sku: sku,
          quantity: parseInt(quantity),
          printCostPerItem: parseFloat(printCostPerItem),
          marginPercentage: parseFloat(marginPercentage),
          totalCostWithoutVAT,
          costVAT,
          totalCost,
          netRevenue,
          vat,
          totalRevenue,
          profit,
          sellingPricePerItemWithoutVAT,
          sellingPricePerItemWithVAT,
          profitPerItem
        });
      }
      offer.items = processedItems;
    }

    await offer.save();
    
    // Populate the updated offer with SKU details
    const populatedOffer = await Offer.findById(offer._id)
      .populate('items.sku', 'skuCode productDescription vendor priceWithoutVAT');
    
    res.json(populatedOffer);
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({ message: 'Error updating offer' });
  }
});

// Delete offer
router.delete('/:id', auth, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Error deleting offer:', error);
    res.status(500).json({ message: 'Error deleting offer' });
  }
});

module.exports = router;
