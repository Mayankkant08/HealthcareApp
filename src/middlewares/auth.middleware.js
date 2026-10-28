const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/apiError');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw ApiError.unauthorized('Authentication credentials were not provided');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || (parts[0] !== 'Bearer' && parts[0] !== 'JWT')) {
      throw ApiError.unauthorized('Invalid authorization header format. Expected Bearer <token>');
    }

    const token = parts[1];

    let decoded;
    try {
      decoded = jwt.verify(token, env.jwt.secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Authentication token has expired');
      }
      throw ApiError.unauthorized('Invalid authentication token');
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw ApiError.unauthorized('User associated with this token no longer exists');
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
