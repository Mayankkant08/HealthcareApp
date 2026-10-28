const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const env = require('../config/env');
const ApiError = require('../utils/apiError');

/**
 * Generate a JWT token for a user
 * @param {object} user - User object with id and email
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    env.jwt.secret,
    {
      expiresIn: env.jwt.expiresIn,
    }
  );
};

/**
 * Register a new user
 * @param {object} data - { name, email, password }
 */
const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw ApiError.conflict('A user with this email address already exists');
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
  });

  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    token,
    access: token, // Django SimpleJWT compatibility
  };
};

/**
 * Authenticate user and return JWT
 * @param {object} data - { email, password }
 */
const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ where: { email: normalizedEmail } });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
    access: token, // Django SimpleJWT compatibility
  };
};

module.exports = {
  registerUser,
  loginUser,
  generateToken,
};
