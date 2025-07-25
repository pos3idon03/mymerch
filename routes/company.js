const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Company = require('../models/Company');
const auth = require('../middleware/auth');


// Define the public URL path for your uploaded files
const PUBLIC_UPLOADS_URL_PATH = '/uploads/prod'; // This is what the browser will use
// Define the subdirectory for banners within the volume
const COMPANY_SUBDIR = 'assets';
// Construct the full path for banners uploads
const UPLOAD_DESTINATION = path.join(PUBLIC_UPLOADS_URL_PATH, COMPANY_SUBDIR);


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = '/app/uploads/prod/assets';
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

// Get settings (public)
router.get('/settings', async (req, res) => {
  try {
    let settings = await Company.findOne();
    if (!settings) settings = await Company.create({});
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update settings (admin only, supports logo/favicon upload)
router.put('/settings', auth, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Files received:', req.files);
    console.log('Body received:', req.body);
    
    let settings = await Company.findOne();
    if (!settings) {
      console.log('Creating new company settings');
      settings = await Company.create({});
    }

    // Handle file uploads
    if (req.files && req.files.logo) {
      const logoPath = path.join(PUBLIC_UPLOADS_URL_PATH, COMPANY_SUBDIR, req.files.logo[0].filename).replace(/\\/g, '/');
      console.log('Setting logo path:', logoPath);
      settings.logo = logoPath;
    }
    if (req.files && req.files.favicon) {
      const faviconPath = path.join(PUBLIC_UPLOADS_URL_PATH, COMPANY_SUBDIR, req.files.favicon[0].filename).replace(/\\/g, '/');
      console.log('Setting favicon path:', faviconPath);
      settings.favicon = faviconPath;
    }

    // Handle text fields
    const fields = ['facebook', 'instagram', 'twitter', 'linkedin', 'location', 'telephone', 'email'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    console.log('Saving settings:', settings);
    await settings.save();
    console.log('Settings saved successfully');
    res.json(settings);
  } catch (error) {
    console.error('Error updating company settings:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 