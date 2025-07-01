const express = require('express');
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer storage config for PNG images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/events/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Only PNG files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

// @route   GET /api/events
// @desc    Get all active events
// @access  Public
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ active: true }).sort({ name: 1 });
    res.json(events);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/events/all
// @desc    Get all events (including inactive)
// @access  Private
router.get('/all', auth, async (req, res) => {
  try {
    const events = await Event.find().sort({ name: 1 });
    res.json(events);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/events
// @desc    Create an event
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, active, image, favicon } = req.body;

    const event = new Event({
      name,
      description,
      active: active !== undefined ? active : true,
      image,
      favicon
    });

    await event.save();
    res.json(event);
  } catch (error) {
    console.error(error.message);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Event name already exists' });
    } else {
      res.status(500).send('Server error');
    }
  }
});

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, active, image, favicon } = req.body;

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { name, description, active, image, favicon },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error(error.message);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Event name already exists' });
    } else {
      res.status(500).send('Server error');
    }
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/events/upload
// @desc    Upload event image (PNG only)
// @access  Private
router.post('/upload', auth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded or invalid file type' });
  }
  res.json({ imageUrl: `/uploads/events/${req.file.filename}` });
});

module.exports = router; 