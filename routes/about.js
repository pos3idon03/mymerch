const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const About = require('../models/About');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = '/app/uploads/about';
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

// @route   GET /api/about
// @desc    Get active about content
// @access  Public
router.get('/', async (req, res) => {
  try {
    const about = await About.findOne({ active: true }).sort({ createdAt: -1 });
    res.json(about);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/about/admin
// @desc    Get all about content (admin)
// @access  Private
router.get('/admin', auth, async (req, res) => {
  try {
    const about = await About.find().sort({ createdAt: -1 });
    res.json(about);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/about
// @desc    Create about content
// @access  Private
router.post('/', auth, upload.single('bannerImage'), async (req, res) => {
  try {
    const { title, content, active } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Banner image is required' });
    }

    const bannerImage = `/app/uploads/about/${req.file.filename}`;

    const about = new About({
      bannerImage,
      title,
      content,
      active: active === 'true'
    });

    await about.save();
    res.json(about);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/about/:id
// @desc    Update about content
// @access  Private
router.put('/:id', auth, upload.single('bannerImage'), async (req, res) => {
  try {
    const { title, content, active } = req.body;
    
    let about = await About.findById(req.params.id);
    if (!about) {
      return res.status(404).json({ message: 'About content not found' });
    }

    const updateData = {
      title,
      content,
      active: active === 'true'
    };

    if (req.file) {
      updateData.bannerImage = `/app/uploads/about/${req.file.filename}`;
    }

    about = await About.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(about);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/about/:id
// @desc    Delete about content
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const about = await About.findById(req.params.id);
    if (!about) {
      return res.status(404).json({ message: 'About content not found' });
    }

    await About.findByIdAndDelete(req.params.id);
    res.json({ message: 'About content removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 