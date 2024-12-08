// backend/utils/tokenService.js
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

module.exports = {
  generateToken: (user) => {
    return jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '7d' });
  },
  verifyToken: (token) => jwt.verify(token, jwtSecret),
};
