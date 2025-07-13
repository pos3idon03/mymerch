const express = require('express');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Define the public URL path for your uploaded files
const PUBLIC_UPLOADS_URL_PATH = '/uploads/prod'; // This is what the browser will use
// Define the subdirectory for categories within the volume
const CATEGORIES_SUBDIR = 'categories';
// Construct the full path for categories uploads
const UPLOAD_DESTINATION = path.join(PUBLIC_UPLOADS_URL_PATH, CATEGORIES_SUBDIR);

// Multer storage config for PNG images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // This is the physical path on the volume
    const uploadDir = '/app/uploads/prod/categories';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Only PNG files are allowed!'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5000000 } // 5MB limit
});

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

    // Optional: Delete the actual files from the volume when the category is deleted
    if (category.image) {
      const relativeImagePath = category.image.startsWith('/uploads/') 
        ? category.image.substring('/uploads'.length) 
        : category.image;
      const imagePathOnDisk = path.join('/app/uploads/prod', relativeImagePath);
      if (fs.existsSync(imagePathOnDisk)) {
        fs.unlinkSync(imagePathOnDisk);
        console.log(`Deleted image file from volume: ${imagePathOnDisk}`);
      }
    }

    if (category.favicon) {
      const relativeFaviconPath = category.favicon.startsWith('/uploads/') 
        ? category.favicon.substring('/uploads'.length) 
        : category.favicon;
      const faviconPathOnDisk = path.join('/app/uploads/prod', relativeFaviconPath);
      if (fs.existsSync(faviconPathOnDisk)) {
        fs.unlinkSync(faviconPathOnDisk);
        console.log(`Deleted favicon file from volume: ${faviconPathOnDisk}`);
      }
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
  res.json({ imageUrl: path.join(PUBLIC_UPLOADS_URL_PATH, CATEGORIES_SUBDIR, req.file.filename).replace(/\\/g, '/') });
});

module.exports = router; 