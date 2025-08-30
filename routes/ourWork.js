const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const OurWork = require('../models/OurWork');
const auth = require('../middleware/auth');

// Define the public URL path for your uploaded files
const PUBLIC_UPLOADS_URL_PATH = '/uploads/prod';
// Define the subdirectory for our work images within the volume
const OUR_WORK_SUBDIR = 'ourwork';
// Construct the full path for our work uploads
const UPLOAD_DESTINATION = path.join(PUBLIC_UPLOADS_URL_PATH, OUR_WORK_SUBDIR);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = '/app/uploads/prod/ourwork';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get all our work posts (public)
router.get('/', async (req, res) => {
  try {
    const ourWork = await OurWork.find({ active: true }).sort({ order: 1, createdAt: -1 });
    res.json(ourWork);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all our work posts (admin)
router.get('/admin', auth, async (req, res) => {
  try {
    const ourWork = await OurWork.find().sort({ order: 1, createdAt: -1 });
    res.json(ourWork);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single our work post
router.get('/:id', async (req, res) => {
  try {
    const ourWork = await OurWork.findById(req.params.id);
    if (!ourWork) {
      return res.status(404).json({ message: 'Our work post not found' });
    }
    res.json(ourWork);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new our work post
router.post('/', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { title, customerName, description, order } = req.body;
    
    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => {
        const imagePath = path.join(PUBLIC_UPLOADS_URL_PATH, OUR_WORK_SUBDIR, file.filename).replace(/\\/g, '/');
        return imagePath;
      });
    }

    const ourWork = new OurWork({
      title,
      customerName,
      description,
      images,
      order: order || 0
    });

    const savedOurWork = await ourWork.save();
    res.status(201).json(savedOurWork);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update our work post
router.put('/:id', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { title, customerName, description, order, existingImages } = req.body;
    
    let ourWork = await OurWork.findById(req.params.id);
    if (!ourWork) {
      return res.status(404).json({ message: 'Our work post not found' });
    }

    // Handle new image uploads
    let images = existingImages ? JSON.parse(existingImages) : [];
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => {
        const imagePath = path.join(PUBLIC_UPLOADS_URL_PATH, OUR_WORK_SUBDIR, file.filename).replace(/\\/g, '/');
        return imagePath;
      });
      images = [...images, ...newImages];
    }

    ourWork.title = title;
    ourWork.customerName = customerName;
    ourWork.description = description;
    ourWork.images = images;
    ourWork.order = order || 0;

    const updatedOurWork = await ourWork.save();
    res.json(updatedOurWork);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete our work post
router.delete('/:id', auth, async (req, res) => {
  try {
    const ourWork = await OurWork.findById(req.params.id);
    if (!ourWork) {
      return res.status(404).json({ message: 'Our work post not found' });
    }

    // Delete associated images from filesystem
    if (ourWork.images && ourWork.images.length > 0) {
      ourWork.images.forEach(imagePath => {
        const fullPath = imagePath.replace(PUBLIC_UPLOADS_URL_PATH, '/app/uploads/prod');
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    await OurWork.findByIdAndDelete(req.params.id);
    res.json({ message: 'Our work post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
