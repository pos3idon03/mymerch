const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { blacklistToken, isTokenBlacklisted } = require('./tokenBlacklist');

const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware - Headers:', req.headers); // Debug log
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Auth middleware - Token:', token); // Debug log
    
    if (!token) {
      console.log('Auth middleware - No token found'); // Debug log
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    if (isTokenBlacklisted(token)) {
      console.log('Auth middleware - Token blacklisted'); // Debug log
      return res.status(401).json({ message: 'Token is blacklisted' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Auth middleware - Decoded token:', decoded); // Debug log
    
    const user = await User.findById(decoded.userId);
    console.log('Auth middleware - User found:', user ? 'Yes' : 'No'); // Debug log

    if (!user) {
      console.log('Auth middleware - User not found'); // Debug log
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    console.log('Auth middleware - Authentication successful'); // Debug log
    next();
  } catch (error) {
    console.error('Auth middleware - Error:', error.message); // Debug log
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth; 