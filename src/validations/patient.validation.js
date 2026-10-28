const Joi = require('joi');

const createPatientSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required().messages({
    'string.empty': 'Patient name is required',
    'any.required': 'Patient name is required',
  }),
  age: Joi.number().integer().min(0).max(150).required().messages({
    'number.base': 'Age must be a valid integer',
    'number.min': 'Age cannot be negative',
    'number.max': 'Age must be realistic (<= 150)',
    'any.required': 'Age is required',
  }),
  gender: Joi.string().trim().valid('Male', 'Female', 'Other', 'male', 'female', 'other').required().messages({
    'any.only': 'Gender must be one of: Male, Female, Other',
    'any.required': 'Gender is required',
  }),
  contact_number: Joi.string().trim().allow('', null).optional(),
  phone: Joi.string().trim().allow('', null).optional(),
  address: Joi.string().trim().allow('', null).optional(),
  medical_history: Joi.string().trim().allow('', null).optional(),
});

const updatePatientSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).optional(),
  age: Joi.number().integer().min(0).max(150).optional(),
  gender: Joi.string().trim().valid('Male', 'Female', 'Other', 'male', 'female', 'other').optional(),
  contact_number: Joi.string().trim().allow('', null).optional(),
  phone: Joi.string().trim().allow('', null).optional(),
  address: Joi.string().trim().allow('', null).optional(),
  medical_history: Joi.string().trim().allow('', null).optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

const patientIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'Patient ID must be an integer',
    'number.positive': 'Patient ID must be a positive integer',
    'any.required': 'Patient ID is required',
  }),
});

module.exports = {
  createPatientSchema,
  updatePatientSchema,
  patientIdParamSchema,
};
