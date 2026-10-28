const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createPatientSchema,
  updatePatientSchema,
  patientIdParamSchema,
} = require('../validations/patient.validation');

// All patient endpoints require authentication
router.use(authenticate);

// POST /api/patients/ - Add a new patient
router.post('/', validate(createPatientSchema, 'body'), patientController.createPatient);

// GET /api/patients/ - Retrieve all patients created by authenticated user
router.get('/', patientController.getPatients);

// GET /api/patients/<id>/ - Get details of a specific patient
router.get('/:id', validate(patientIdParamSchema, 'params'), patientController.getPatientById);

// PUT /api/patients/<id>/ - Update patient details
router.put(
  '/:id',
  validate(patientIdParamSchema, 'params'),
  validate(updatePatientSchema, 'body'),
  patientController.updatePatient
);

// DELETE /api/patients/<id>/ - Delete a patient record
router.delete('/:id', validate(patientIdParamSchema, 'params'), patientController.deletePatient);

module.exports = router;
