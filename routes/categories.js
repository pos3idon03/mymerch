const express = require('express');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer storage config for PNG images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/app/uploads/categories/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Only PNG files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

// @route   GET /api/categories
// @desc    Get all active categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ active: true }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/categories/all
// @desc    Get all categories (including inactive)
// @access  Private
router.get('/all', auth, async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/categories
// @desc    Create a category
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, active, image, favicon } = req.body;

    const category = new Category({
      name,
      description,
      active: active !== undefined ? active : true,
      image,
      favicon
    });

    await category.save();
    res.json(category);
  } catch (error) {
    console.error(error.message);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Category name already exists' });
    } else {
      res.status(500).send('Server error');
    }
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, active, image, favicon } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, active, image, favicon },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error(error.message);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Category name already exists' });
    } else {
      res.status(500).send('Server error');
    }
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/categories/upload
// @desc    Upload category image (PNG only)
// @access  Private
router.post('/upload', auth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded or invalid file type' });
  }
  res.json({ imageUrl: `/app/uploads/categories/${req.file.filename}` });
});

module.exports = router; 