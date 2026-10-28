const Joi = require('joi');

const createDoctorSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required().messages({
    'string.empty': 'Doctor name is required',
    'any.required': 'Doctor name is required',
  }),
  specialization: Joi.string().trim().min(2).max(150).required().messages({
    'string.empty': 'Specialization is required',
    'any.required': 'Specialization is required',
  }),
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Valid email address is required',
    'any.required': 'Doctor email is required',
  }),
  phone: Joi.string().trim().allow('', null).optional(),
  contact_number: Joi.string().trim().allow('', null).optional(),
  years_of_experience: Joi.number().integer().min(0).max(100).optional(),
});

const updateDoctorSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).optional(),
  specialization: Joi.string().trim().min(2).max(150).optional(),
  email: Joi.string().trim().email().optional(),
  phone: Joi.string().trim().allow('', null).optional(),
  contact_number: Joi.string().trim().allow('', null).optional(),
  years_of_experience: Joi.number().integer().min(0).max(100).optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

const doctorIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'Doctor ID must be an integer',
    'number.positive': 'Doctor ID must be a positive integer',
    'any.required': 'Doctor ID is required',
  }),
});

module.exports = {
  createDoctorSchema,
  updateDoctorSchema,
  doctorIdParamSchema,
};
