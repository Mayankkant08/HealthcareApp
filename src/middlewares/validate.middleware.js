const ApiError = require('../utils/apiError');

/**
 * Middleware factory to validate request parts against Joi schema
 * @param {import('joi').ObjectSchema} schema - Joi schema
 * @param {'body' | 'params' | 'query'} [source='body'] - Part of request to validate
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[source];
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
      }));
      const message = errorDetails.map((e) => e.message).join(', ');
      return next(ApiError.badRequest(`Validation failed: ${message}`, errorDetails));
    }

    // Replace request data with sanitized validated data
    req[source] = value;
    return next();
  };
};

module.exports = validate;
