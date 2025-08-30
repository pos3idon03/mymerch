const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Testimonial = require('../models/Testimonial');
const auth = require('../middleware/auth');

const router = express.Router();

// Define the public URL path for your uploaded files
const PUBLIC_UPLOADS_URL_PATH = '/uploads/prod'; // This is what the browser will use
// Define the subdirectory for testimonials within the volume
const TESTIMONIALS_SUBDIR = 'testimonials';
// Construct the full path for testimonials uploads
const UPLOAD_DESTINATION = path.join(PUBLIC_UPLOADS_URL_PATH, TESTIMONIALS_SUBDIR);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // This is the physical path on the volume
    const uploadDir = '/app/uploads/prod/testimonials';
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

// @route   GET /api/testimonials/admin
// @desc    Get all testimonials (including inactive) - Admin only
// @access  Private
router.get('/admin', auth, async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
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
    
    const testimonialData = {
      customerName,
      testimonial,
      active: active === 'true'
    };

    // Only add companyLogo if a file was uploaded
    if (req.file) {
      testimonialData.companyLogo = path.join(PUBLIC_UPLOADS_URL_PATH, TESTIMONIALS_SUBDIR, req.file.filename).replace(/\\/g, '/');
    }

    const testimonialDoc = new Testimonial(testimonialData);

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
      updateData.companyLogo = path.join(PUBLIC_UPLOADS_URL_PATH, TESTIMONIALS_SUBDIR, req.file.filename).replace(/\\/g, '/');
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

    // Optional: Delete the actual file from the volume when the testimonial is deleted
    // This helps in cleaning up unused files and managing volume space.
    if (testimonial.companyLogo) {
        // Step 1: Get the relative path after "/uploads/"
        const relativeImagePath = testimonial.companyLogo.startsWith('/uploads/') 
        ? testimonial.companyLogo.substring('/uploads'.length) 
        : testimonial.companyLogo; // Fallback if prefix is different

        // Step 2: Combine with the actual disk mount path
        const imagePathOnDisk = path.join('/app/uploads/prod', relativeImagePath);
        if (fs.existsSync(imagePathOnDisk)) {
            fs.unlinkSync(imagePathOnDisk);
            console.log(`Deleted image file from volume: ${imagePathOnDisk}`);
        } else {
            console.warn(`Image file not found on disk: ${imagePathOnDisk}`);
        }
    }

    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Testimonial removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 