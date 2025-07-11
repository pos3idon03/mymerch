const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Banner = require('../models/Banner');
const auth = require('../middleware/auth');

const router = express.Router();

const BASE_UPLOAD_DIR = 'app/uploads/prod';
const BANNERS_SUBDIR = 'banners'; // Subdirectory within the volume for banners
// Construct the full path for banners uploads
const UPLOAD_DESTINATION = path.join(BASE_UPLOAD_DIR, BANNERS_SUBDIR);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOAD_DESTINATION)) {
      fs.mkdirSync(UPLOAD_DESTINATION, { recursive: true });
    }
    cb(null, UPLOAD_DESTINATION);
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
    
    const image = req.file ? `/${UPLOAD_DESTINATION}/${req.file.filename}` : ''; // Example: /banners/1678889900000-12345.png

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
      // Update the image path similar to the POST request
      updateData.image = `/${UPLOAD_DESTINATION}/${req.file.filename}`;
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

    // Optional: Delete the actual file from the volume when the banner is deleted
    // This helps in cleaning up unused files and managing volume space.
    if (banner.image) {
        const imagePathOnDisk = path.join(UPLOAD_DESTINATION, banner.image);
        if (fs.existsSync(imagePathOnDisk)) {
            fs.unlinkSync(imagePathOnDisk);
            console.log(`Deleted image file from volume: ${imagePathOnDisk}`);
        } else {
            console.warn(`Image file not found on disk: ${imagePathOnDisk}`);
        }
    }

    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Banner removed' });
} catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
}
});

module.exports = router; 