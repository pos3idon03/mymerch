const jwt = require('jsonwebtoken');
const { isTokenBlacklisted } = require('./tokenBlacklist');

module.exports = async function(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Blacklist check (now async)
  if (await isTokenBlacklisted(token)) {
    return res.status(401).json({ message: 'Token is blacklisted' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 