const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createDoctorSchema,
  updateDoctorSchema,
  doctorIdParamSchema,
} = require('../validations/doctor.validation');

// Doctor endpoints are secured with authentication
router.use(authenticate);

// POST /api/doctors/ - Add a new doctor
router.post('/', validate(createDoctorSchema, 'body'), doctorController.createDoctor);

// GET /api/doctors/ - Retrieve all doctors
router.get('/', doctorController.getAllDoctors);

// GET /api/doctors/<id>/ - Get details of a specific doctor
router.get('/:id', validate(doctorIdParamSchema, 'params'), doctorController.getDoctorById);

// PUT /api/doctors/<id>/ - Update doctor details
router.put(
  '/:id',
  validate(doctorIdParamSchema, 'params'),
  validate(updateDoctorSchema, 'body'),
  doctorController.updateDoctor
);

// DELETE /api/doctors/<id>/ - Delete a doctor record
router.delete('/:id', validate(doctorIdParamSchema, 'params'), doctorController.deleteDoctor);

module.exports = router;
