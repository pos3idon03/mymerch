const crypto = require('crypto');

/**
 * Generate a cryptographically secure random salt
 * @returns {string} 64-character hexadecimal salt
 */
function generateSalt() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a password with salt using SHA-256
 * Replicates the logic from perform__hashing.py
 * @param {string} password - Plain text password
 * @param {string} salt - Salt to use for hashing
 * @returns {string} 64-character hexadecimal hash
 */
function hashPassword(password, salt) {
  // Combine password and salt (same as perform__hashing.py)
  const saltedPassword = password + salt;
  
  // Create SHA-256 hash
  const hash = crypto.createHash('sha256');
  hash.update(saltedPassword, 'utf-8');
  
  return hash.digest('hex');
}

/**
 * Verify a password against stored salt and hash
 * @param {string} password - Plain text password to verify
 * @param {string} salt - Stored salt
 * @param {string} hash - Stored hash
 * @returns {boolean} True if password matches
 */
function verifyPassword(password, salt, hash) {
  const hashedPassword = hashPassword(password, salt);
  return hashedPassword === hash;
}

/**
 * Generate salt and hash for a password
 * Convenience function for user creation
 * @param {string} password - Plain text password
 * @returns {object} Object containing salt and hash
 */
function generatePasswordData(password) {
  const salt = generateSalt();
  const hash = hashPassword(password, salt);
  
  return {
    salt,
    hash
  };
}

module.exports = {
  generateSalt,
  hashPassword,
  verifyPassword,
  generatePasswordData
};
