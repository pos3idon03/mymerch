// middleware/tokenBlacklist.js

const BlacklistedToken = require('../models/BlacklistedToken');

// Add a token to the blacklist
async function blacklistToken(token) {
  try {
    await BlacklistedToken.create({ token });
  } catch (err) {
    // Ignore duplicate errors
    if (err.code !== 11000) {
      throw err;
    }
  }
}

// Check if a token is blacklisted
async function isTokenBlacklisted(token) {
  const found = await BlacklistedToken.findOne({ token });
  return !!found;
}

module.exports = { blacklistToken, isTokenBlacklisted }; 