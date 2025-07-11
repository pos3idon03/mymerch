const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');

const router = express.Router();


// Define the public URL path for your uploaded files
const PUBLIC_UPLOADS_URL_PATH = '/uploads/prod'; // This is what the browser will use
// Define the subdirectory for banners within the volume
const BLOGS_SUBDIR = 'blogs';
// Construct the full path for banners uploads
const UPLOAD_DESTINATION = path.join(PUBLIC_UPLOADS_URL_PATH, BLOGS_SUBDIR);


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = '/app/uploads/prod/blogs';
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

// @route   GET /api/blog
// @desc    Get all published blogs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/blog/recent
// @desc    Get recent blogs (limit 3)
// @access  Public
router.get('/recent', async (req, res) => {
  try {
    const blogs = await Blog.find({ published: true })
      .sort({ createdAt: -1 })
      .limit(3);
    res.json(blogs);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/blog/:id
// @desc    Get blog by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/blog
// @desc    Create a blog
// @access  Private
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, context, excerpt, author, tags, published } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Blog image is required' });
    }

    const image = path.join(PUBLIC_UPLOADS_URL_PATH, BLOGS_SUBDIR, req.file.filename).replace(/\\/g, '/');

    const blog = new Blog({
      title,
      image,
      context,
      excerpt,
      author,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      published: published === 'true'
    });

    await blog.save();
    res.json(blog);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/blog/:id
// @desc    Update a blog
// @access  Private
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, context, excerpt, author, tags, published } = req.body;
    
    let blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const updateData = {
      title,
      context,
      excerpt,
      author,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      published: published === 'true'
    };

    if (req.file) {
      updateData.image = path.join(PUBLIC_UPLOADS_URL_PATH, BLOGS_SUBDIR, req.file.filename).replace(/\\/g, '/');
    }

    blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(blog);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/blog/:id
// @desc    Delete a blog
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 