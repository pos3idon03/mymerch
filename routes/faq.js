const express = require('express');
const router = express.Router();
const FAQ = require('../models/FAQ');
const auth = require('../middleware/auth');

// Get all FAQs (public)
router.get('/', async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single FAQ (public)
router.get('/:id', async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create FAQ (admin only)
router.post('/', auth, async (req, res) => {
  console.log('FAQ POST route - Request body:', req.body); // Debug log
  console.log('FAQ POST route - User:', req.user); // Debug log
  
  try {
    const { question, answer, order } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }

    const faq = new FAQ({
      question,
      answer,
      order: order || 0
    });

    const newFAQ = await faq.save();
    console.log('FAQ POST route - FAQ created:', newFAQ); // Debug log
    res.status(201).json(newFAQ);
  } catch (error) {
    console.error('FAQ POST route - Error:', error); // Debug log
    res.status(400).json({ message: error.message });
  }
});

// Update FAQ (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { question, answer, order } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }

    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    faq.question = question;
    faq.answer = answer;
    faq.order = order || faq.order;

    const updatedFAQ = await faq.save();
    res.json(updatedFAQ);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete FAQ (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 