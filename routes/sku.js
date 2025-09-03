const express = require('express');
const router = express.Router();
const SKU = require('../models/SKU');
const auth = require('../middleware/auth');

// Get all SKUs
router.get('/', auth, async (req, res) => {
  try {
    const skus = await SKU.find({ active: true }).sort({ skuCode: 1 });
    res.json(skus);
  } catch (error) {
    console.error('Error fetching SKUs:', error);
    res.status(500).json({ message: 'Error fetching SKUs' });
  }
});

// Get SKU by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const sku = await SKU.findById(req.params.id);
    if (!sku) {
      return res.status(404).json({ message: 'SKU not found' });
    }
    res.json(sku);
  } catch (error) {
    console.error('Error fetching SKU:', error);
    res.status(500).json({ message: 'Error fetching SKU' });
  }
});

// Create new SKU
router.post('/', auth, async (req, res) => {
  try {
    const { productDescription, vendor, priceWithoutVAT, minimumOrderItems } = req.body;

    // Validate required fields
    if (!productDescription || !vendor || !priceWithoutVAT || !minimumOrderItems) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate numeric fields
    if (priceWithoutVAT < 0 || minimumOrderItems < 1) {
      return res.status(400).json({ message: 'Invalid numeric values' });
    }

    const sku = new SKU({
      productDescription,
      vendor,
      priceWithoutVAT: parseFloat(priceWithoutVAT),
      minimumOrderItems: parseInt(minimumOrderItems)
    });
    console.log('SKU before save:', sku);
    await sku.save();
    console.log('SKU after save:', sku);
    
    // Ensure SKU code was generated
    if (!sku.skuCode) {
      console.error('SKU code was not generated, attempting manual generation');
      const lastSKU = await SKU.findOne({}, {}, { sort: { skuCode: -1 } });
      let nextNumber = 1;
      
      if (lastSKU && lastSKU.skuCode) {
        const match = lastSKU.skuCode.match(/P(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      
      sku.skuCode = `P${nextNumber.toString().padStart(4, '0')}`;
      await sku.save();
    }
    
    res.status(201).json(sku);
  } catch (error) {
    console.error('Error creating SKU:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'SKU code already exists' });
    } else {
      res.status(500).json({ message: 'Error creating SKU' });
    }
  }
});

// Update SKU
router.put('/:id', auth, async (req, res) => {
  try {
    const { productDescription, vendor, priceWithoutVAT, minimumOrderItems, active } = req.body;

    const sku = await SKU.findById(req.params.id);
    if (!sku) {
      return res.status(404).json({ message: 'SKU not found' });
    }

    // Update fields if provided
    if (productDescription !== undefined) sku.productDescription = productDescription;
    if (vendor !== undefined) sku.vendor = vendor;
    if (priceWithoutVAT !== undefined) sku.priceWithoutVAT = parseFloat(priceWithoutVAT);
    if (minimumOrderItems !== undefined) sku.minimumOrderItems = parseInt(minimumOrderItems);
    if (active !== undefined) sku.active = active;

    await sku.save();
    res.json(sku);
  } catch (error) {
    console.error('Error updating SKU:', error);
    res.status(500).json({ message: 'Error updating SKU' });
  }
});

// Delete SKU (soft delete by setting active to false)
router.delete('/:id', auth, async (req, res) => {
  try {
    const sku = await SKU.findById(req.params.id);
    if (!sku) {
      return res.status(404).json({ message: 'SKU not found' });
    }

    sku.active = false;
    await sku.save();
    res.json({ message: 'SKU deleted successfully' });
  } catch (error) {
    console.error('Error deleting SKU:', error);
    res.status(500).json({ message: 'Error deleting SKU' });
  }
});

module.exports = router;
