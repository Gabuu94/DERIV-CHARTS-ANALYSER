const crypto = require('crypto');

function generatePassword(length = 12) {
  return crypto.randomBytes(length).toString('hex'); // Generate a random password
}

module.exports = generatePassword;
