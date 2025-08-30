const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');

const router = express.Router();

// Define the public URL path for your uploaded files
const PUBLIC_UPLOADS_URL_PATH = '/uploads/prod';
// Define the subdirectory for customers within the volume
const CUSTOMERS_SUBDIR = 'customers';
// Construct the full path for customers uploads
const UPLOAD_DESTINATION = path.join(PUBLIC_UPLOADS_URL_PATH, CUSTOMERS_SUBDIR);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // This is the physical path on the volume
    const uploadDir = '/app/uploads/prod/customers';
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

// @route   GET /api/customers
// @desc    Get all active customers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find({ active: true }).sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/customers/admin
// @desc    Get all customers (admin)
// @access  Private
router.get('/admin', auth, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/customers
// @desc    Create a customer
// @access  Private
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { name, active } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const customerData = {
      name,
      active: active === 'true',
      image: path.join(PUBLIC_UPLOADS_URL_PATH, CUSTOMERS_SUBDIR, req.file.filename).replace(/\\/g, '/')
    };

    const customerDoc = new Customer(customerData);
    await customerDoc.save();
    res.json(customerDoc);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/customers/:id
// @desc    Update a customer
// @access  Private
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const { name, active } = req.body;
    
    let customerDoc = await Customer.findById(req.params.id);
    if (!customerDoc) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const updateData = {
      name,
      active: active === 'true'
    };

    // Only update image if a new file was uploaded
    if (req.file) {
      // Delete old image if it exists
      if (customerDoc.image) {
        const oldImagePath = customerDoc.image.replace(PUBLIC_UPLOADS_URL_PATH, '/app/uploads/prod');
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.image = path.join(PUBLIC_UPLOADS_URL_PATH, CUSTOMERS_SUBDIR, req.file.filename).replace(/\\/g, '/');
    }

    customerDoc = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.json(customerDoc);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/customers/:id
// @desc    Delete a customer
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const customerDoc = await Customer.findById(req.params.id);
    if (!customerDoc) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Delete image file if it exists
    if (customerDoc.image) {
      const imagePath = customerDoc.image.replace(PUBLIC_UPLOADS_URL_PATH, '/app/uploads/prod');
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
