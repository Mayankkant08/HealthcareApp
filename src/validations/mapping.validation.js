const Joi = require('joi');

const createMappingSchema = Joi.object({
  patient_id: Joi.number().integer().positive().optional(),
  patientId: Joi.number().integer().positive().optional(),
  doctor_id: Joi.number().integer().positive().optional(),
  doctorId: Joi.number().integer().positive().optional(),
  assigned_date: Joi.date().iso().optional(),
  notes: Joi.string().trim().allow('', null).optional(),
})
  .or('patient_id', 'patientId')
  .or('doctor_id', 'doctorId')
  .messages({
    'object.missing': 'Both patient_id and doctor_id are required',
  });

const patientIdParamSchema = Joi.object({
  patient_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Patient ID must be an integer',
    'number.positive': 'Patient ID must be a positive integer',
    'any.required': 'Patient ID is required',
  }),
});

const mappingIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'Mapping ID must be an integer',
    'number.positive': 'Mapping ID must be a positive integer',
    'any.required': 'Mapping ID is required',
  }),
});

module.exports = {
  createMappingSchema,
  patientIdParamSchema,
  mappingIdParamSchema,
};
