// middleware/tokenBlacklist.js

// In-memory blacklist (for production, use Redis or a database)
const tokenBlacklist = new Set();

function blacklistToken(token) {
  tokenBlacklist.add(token);
}

function isTokenBlacklisted(token) {
  return tokenBlacklist.has(token);
}

module.exports = { blacklistToken, isTokenBlacklisted }; 