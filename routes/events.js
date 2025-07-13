const express = require('express');
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Define the public URL path for your uploaded files
const PUBLIC_UPLOADS_URL_PATH = '/uploads/prod'; // This is what the browser will use
const EVENTS_SUBDIR = 'events';
const UPLOAD_DESTINATION = path.join(PUBLIC_UPLOADS_URL_PATH, EVENTS_SUBDIR);
const PHYSICAL_UPLOAD_DIR = '/app' + UPLOAD_DESTINATION;

// Configure multer for file uploads (image and favicon)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(PHYSICAL_UPLOAD_DIR)) {
      fs.mkdirSync(PHYSICAL_UPLOAD_DIR, { recursive: true });
    }
    cb(null, PHYSICAL_UPLOAD_DIR);
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

// Accept both image and favicon fields
const multiUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'favicon', maxCount: 1 }
]);

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
// @desc    Create an event (with direct image and favicon upload)
// @access  Private
router.post('/', auth, multiUpload, async (req, res) => {
  try {
    const { name, description, active } = req.body;

    let image = req.body.image;
    let favicon = req.body.favicon;

    if (req.files && req.files.image) {
      image = path.join(PUBLIC_UPLOADS_URL_PATH, EVENTS_SUBDIR, req.files.image[0].filename).replace(/\\/g, '/');
    }
    if (req.files && req.files.favicon) {
      favicon = path.join(PUBLIC_UPLOADS_URL_PATH, EVENTS_SUBDIR, req.files.favicon[0].filename).replace(/\\/g, '/');
    }

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
// @desc    Update an event (with direct image and favicon upload)
// @access  Private
router.put('/:id', auth, multiUpload, async (req, res) => {
  try {
    const { name, description, active } = req.body;

    let updateData = {
      name,
      description,
      active
    };

    if (req.files && req.files.image) {
      updateData.image = path.join(PUBLIC_UPLOADS_URL_PATH, EVENTS_SUBDIR, req.files.image[0].filename).replace(/\\/g, '/');
    } else if (req.body.image) {
      updateData.image = req.body.image;
    }

    if (req.files && req.files.favicon) {
      updateData.favicon = path.join(PUBLIC_UPLOADS_URL_PATH, EVENTS_SUBDIR, req.files.favicon[0].filename).replace(/\\/g, '/');
    } else if (req.body.favicon) {
      updateData.favicon = req.body.favicon;
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
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
// @desc    Upload event image (PNG/JPG/WEBP only) - legacy/manual
// @access  Private
router.post('/upload', auth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded or invalid file type' });
  }
  res.json({ imageUrl: path.join(PUBLIC_UPLOADS_URL_PATH, EVENTS_SUBDIR, req.file.filename).replace(/\\/g, '/') });
});

module.exports = router; 