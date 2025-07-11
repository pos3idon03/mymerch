const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Banner = require('../models/Banner');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = '/app/uploads/banners';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
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

// @route   GET /api/banner
// @desc    Get all active banners
// @access  Public
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ active: true }).sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/banner
// @desc    Create a banner
// @access  Private
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, link, order, placement } = req.body;
    
    const image = req.file ? `/uploads/banners/${req.file.filename}` : '';

    const banner = new Banner({
      title,
      subtitle,
      image,
      link,
      order: order ? parseInt(order) : 0,
      placement
    });

    await banner.save();
    res.json(banner);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/banner/:id
// @desc    Update a banner
// @access  Private
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, link, order, active, placement } = req.body;
    
    let banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    const updateData = {
      title,
      subtitle,
      link,
      order: order ? parseInt(order) : banner.order,
      active: active === 'true',
      placement
    };

    if (req.file) {
      updateData.image = `/uploads/banners/${req.file.filename}`;
    }

    banner = await Banner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(banner);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/banner/:id
// @desc    Delete a banner
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Banner removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 