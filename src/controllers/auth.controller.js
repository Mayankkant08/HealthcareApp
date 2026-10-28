const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');

/**
 * Register a new user
 * POST /api/auth/register/
 */
const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    return ApiResponse.created(res, 'User registered successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Log in a user and return JWT token
 * POST /api/auth/login/
 */
const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    return ApiResponse.success(res, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
