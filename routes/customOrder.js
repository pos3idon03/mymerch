const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const CustomOrder = require('../models/CustomOrder');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// Define the public URL path for your uploaded files
const PUBLIC_UPLOADS_URL_PATH = '/uploads/prod'; // This is what the browser will use
// Define the subdirectory for banners within the volume
const CUSTOM_ORDER_SUBDIR = 'customOrders';
// Construct the full path for banners uploads
const UPLOAD_DESTINATION = path.join(PUBLIC_UPLOADS_URL_PATH, CUSTOM_ORDER_SUBDIR);

// Multer config for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = '/app/uploads/prod/customOrders';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// POST /api/custom-order
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { products, quantities, options, email, phone } = req.body;
    if (!products || !quantities || !email || !phone) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const image = req.file ? path.join(PUBLIC_UPLOADS_URL_PATH, CUSTOM_ORDER_SUBDIR, req.file.filename).replace(/\\/g, '/') : '';
    const order = new CustomOrder({
      products: JSON.parse(products),
      quantities: JSON.parse(quantities),
      image,
      options: options ? JSON.parse(options) : [],
      email,
      phone
    });
    await order.save();
    res.json(order);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// GET /api/custom-order (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const orders = await CustomOrder.find().populate('products', 'title favicon').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// PUT /api/custom-order/:id (admin only, update status)
router.put('/:id', auth, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    if (!orderStatus) {
      return res.status(400).json({ message: 'Order status is required' });
    }
    const order = await CustomOrder.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    ).populate('products', 'title favicon');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// DELETE /api/custom-order/:id (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await CustomOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    await CustomOrder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 