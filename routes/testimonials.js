const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Testimonial = require('../models/Testimonial');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = '/app/uploads/testimonials';
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

// @route   GET /api/testimonials
// @desc    Get all active testimonials
// @access  Public
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ active: true }).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/testimonials
// @desc    Create a testimonial
// @access  Private
router.post('/', auth, upload.single('companyLogo'), async (req, res) => {
  try {
    const { customerName, testimonial, active } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Company logo is required' });
    }

    const companyLogo = `/app/uploads/testimonials/${req.file.filename}`;

    const testimonialDoc = new Testimonial({
      customerName,
      companyLogo,
      testimonial,
      active: active === 'true'
    });

    await testimonialDoc.save();
    res.json(testimonialDoc);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/testimonials/:id
// @desc    Update a testimonial
// @access  Private
router.put('/:id', auth, upload.single('companyLogo'), async (req, res) => {
  try {
    const { customerName, testimonial, active } = req.body;
    
    let testimonialDoc = await Testimonial.findById(req.params.id);
    if (!testimonialDoc) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    const updateData = {
      customerName,
      testimonial,
      active: active === 'true'
    };

    if (req.file) {
      updateData.companyLogo = `/app/uploads/testimonials/${req.file.filename}`;
    }

    testimonialDoc = await Testimonial.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(testimonialDoc);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/testimonials/:id
// @desc    Delete a testimonial
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Testimonial removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 