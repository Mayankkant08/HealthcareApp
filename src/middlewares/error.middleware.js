const ApiError = require('../utils/apiError');
const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const fields = Object.keys(err.fields || {});
    const fieldMsg = fields.length ? ` for field(s): ${fields.join(', ')}` : '';
    error = ApiError.conflict(`A record with this information already exists${fieldMsg}`);
  }

  // Handle Sequelize Validation Error
  else if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message).join(', ');
    error = ApiError.badRequest(`Validation error: ${messages}`, err.errors);
  }

  // Handle Sequelize Foreign Key Constraint Error
  else if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = ApiError.badRequest('Referenced record does not exist or has dependent records');
  }

  // Handle JSON Syntax Error in request body
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = ApiError.badRequest('Malformed JSON in request payload');
  }

  // Fallback for unhandled errors
  else if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(env.nodeEnv === 'development' && { stack: err.stack }),
  };

  if (env.nodeEnv === 'development' && error.statusCode === 500) {
    console.error('Unhandled Error:', err);
  }

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
