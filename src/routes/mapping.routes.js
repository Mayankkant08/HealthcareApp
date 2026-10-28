const express = require('express');
const router = express.Router();
const mappingController = require('../controllers/mapping.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createMappingSchema,
  patientIdParamSchema,
  mappingIdParamSchema,
} = require('../validations/mapping.validation');

// Mapping endpoints require authentication
router.use(authenticate);

// POST /api/mappings/ - Assign a doctor to a patient
router.post('/', validate(createMappingSchema, 'body'), mappingController.createMapping);

// GET /api/mappings/ - Retrieve all patient-doctor mappings
router.get('/', mappingController.getAllMappings);

// GET /api/mappings/<patient_id>/ - Get all doctors assigned to a specific patient
router.get(
  '/:patient_id',
  validate(patientIdParamSchema, 'params'),
  mappingController.getDoctorsByPatient
);

// DELETE /api/mappings/<id>/ - Remove a doctor from a patient
router.delete(
  '/:id',
  validate(mappingIdParamSchema, 'params'),
  mappingController.deleteMapping
);

module.exports = router;
