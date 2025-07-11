const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

const router = express.Router();

// Define the public URL path for your uploaded files
const PUBLIC_UPLOADS_URL_PATH = '/uploads/prod'; // This is what the browser will use
// Define the subdirectory for banners within the volume
const PRODUCTS_SUBDIR = 'products';
// Construct the full path for banners uploads
const UPLOAD_DESTINATION = path.join(PUBLIC_UPLOADS_URL_PATH, PRODUCTS_SUBDIR);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = '/app/uploads/prod/products';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Update multer to accept both image and favicon files
const multiUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'favicon', maxCount: 1 }
]);

// @route   GET /api/products
// @desc    Get all active products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ active: true })
      .populate('categories', 'name')
      .populate('events', 'name')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products (limit 6)
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ active: true })
      .populate('categories', 'name')
      .populate('events', 'name')
      .sort({ createdAt: -1 })
      .limit(6);
    res.json(products);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categories', 'name description')
      .populate('events', 'name description');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/products
// @desc    Create a product
// @access  Private
router.post('/', auth, multiUpload, async (req, res) => {
  try {
    const { title, description, categories, events, active } = req.body;
    
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    //const image = `/app/uploads/products/${req.files.image[0].filename}`;
    //const favicon = req.files.favicon ? `/app/uploads/products/${req.files.favicon[0].filename}` : '';

    const image = path.join(PUBLIC_UPLOADS_URL_PATH, PRODUCTS_SUBDIR, req.files.image[0].filename).replace(/\\/g, '/');
    const favicon = req.files.favicon ? path.join(PUBLIC_UPLOADS_URL_PATH, PRODUCTS_SUBDIR, req.files.favicon[0].filename).replace(/\\/g, '/') : '';
    
    const product = new Product({
      title,
      description,
      image,
      favicon,
      categories: categories ? JSON.parse(categories) : [],
      events: events ? JSON.parse(events) : [],
      active: active === 'true'
    });

    await product.save();
    
    // Populate category before sending response
    await product.populate('categories', 'name');
    await product.populate('events', 'name');
    res.json(product);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private
router.put('/:id', auth, multiUpload, async (req, res) => {
  try {
    const { title, description, categories, events, active } = req.body;
    
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updateData = {
      title,
      description,
      categories: categories ? JSON.parse(categories) : [],
      events: events ? JSON.parse(events) : [],
      active: active === 'true'
    };

    if (req.files && req.files.image) {
      updateData.image = path.join(PUBLIC_UPLOADS_URL_PATH, PRODUCTS_SUBDIR, req.files.image[0].filename).replace(/\\/g, '/');
    }
    if (req.files && req.files.favicon) {
      updateData.favicon = path.join(PUBLIC_UPLOADS_URL_PATH, PRODUCTS_SUBDIR, req.files.favicon[0].filename).replace(/\\/g, '/');
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('categories', 'name').populate('events', 'name');

    res.json(product);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 