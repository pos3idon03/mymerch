const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const CustomOrder = require('../models/CustomOrder');

const router = express.Router();

// Define the public URL path for uploaded files
const PUBLIC_UPLOADS_URL_PATH = '/uploads/prod';
const TEST_IDEA_SUBDIR = 'testYourIdea';
const UPLOAD_DESTINATION = path.join(PUBLIC_UPLOADS_URL_PATH, TEST_IDEA_SUBDIR);

// Multer config for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = '/app/uploads/prod/testYourIdea';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'test-idea-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// POST /api/test-your-idea/submit
router.post('/submit', upload.single('designImage'), async (req, res) => {
  try {
    const { productType, productColor, quantity, email } = req.body;
    
    // Validate required fields
    if (!productType || !quantity || !email) {
      return res.status(400).json({ 
        message: 'Missing required fields: productType, quantity, and email are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Please provide a valid email address' 
      });
    }

    // Validate quantity
    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum < 1 || quantityNum > 100) {
      return res.status(400).json({ 
        message: 'Quantity must be a number between 1 and 100' 
      });
    }

    // Validate product type
    const validProductTypes = ['tshirt', 'tote', 'cap', 'lanyard'];
    if (!validProductTypes.includes(productType)) {
      return res.status(400).json({ 
        message: 'Invalid product type' 
      });
    }

    // Handle image upload
    let imagePath = '';
    if (req.file) {
      imagePath = path.join(PUBLIC_UPLOADS_URL_PATH, TEST_IDEA_SUBDIR, req.file.filename).replace(/\\/g, '/');
    } else {
      return res.status(400).json({ 
        message: 'Design image is required' 
      });
    }

    // Create custom order
    const order = new CustomOrder({
      products: [], // We'll store product type in options for now
      quantities: [quantityNum],
      image: imagePath,
      options: [
        `Product Type: ${productType}`,
        `Product Color: ${productColor}`,
        `Design Type: Test Your Idea`,
        `Canvas Design: Custom uploaded image`
      ],
      email: email,
      phone: '', // Optional for test your idea
      orderStatus: 'Submitted'
    });

    await order.save();

    // Send success response
    res.status(201).json({
      message: 'Order submitted successfully',
      orderId: order._id,
      order: {
        id: order._id,
        productType,
        quantity: quantityNum,
        email: order.email,
        image: order.image,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('Test Your Idea submission error:', error);
    
    // Handle specific errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'Image file is too large. Maximum size is 5MB.' 
      });
    }
    
    if (error.message === 'Only image files are allowed') {
      return res.status(400).json({ 
        message: 'Only image files (JPG, PNG, GIF) are allowed.' 
      });
    }

    res.status(500).json({ 
      message: 'An error occurred while submitting your order. Please try again.' 
    });
  }
});

// GET /api/test-your-idea/stats (admin only - for future use)
router.get('/stats', async (req, res) => {
  try {
    const stats = await CustomOrder.aggregate([
      {
        $match: {
          'options': { $regex: /Test Your Idea/ }
        }
      },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalOrders = await CustomOrder.countDocuments({
      'options': { $regex: /Test Your Idea/ }
    });

    res.json({
      totalOrders,
      statusBreakdown: stats
    });
  } catch (error) {
    console.error('Error fetching Test Your Idea stats:', error);
    res.status(500).json({ 
      message: 'Error fetching statistics' 
    });
  }
});

module.exports = router; 