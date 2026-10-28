const patientService = require('../services/patient.service');
const ApiResponse = require('../utils/apiResponse');

/**
 * Add a new patient (Authenticated users only)
 * POST /api/patients/
 */
const createPatient = async (req, res, next) => {
  try {
    const patient = await patientService.createPatient(req.user.id, req.body);
    return ApiResponse.created(res, 'Patient created successfully', patient);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve all patients created by the authenticated user
 * GET /api/patients/
 */
const getPatients = async (req, res, next) => {
  try {
    const patients = await patientService.getPatientsByUser(req.user.id);
    return ApiResponse.success(res, 'Patients retrieved successfully', patients);
  } catch (error) {
    next(error);
  }
};

/**
 * Get details of a specific patient
 * GET /api/patients/:id/
 */
const getPatientById = async (req, res, next) => {
  try {
    const patient = await patientService.getPatientById(req.params.id);
    return ApiResponse.success(res, 'Patient details retrieved successfully', patient);
  } catch (error) {
    next(error);
  }
};

/**
 * Update patient details
 * PUT /api/patients/:id/
 */
const updatePatient = async (req, res, next) => {
  try {
    const updated = await patientService.updatePatient(req.params.id, req.user.id, req.body);
    return ApiResponse.success(res, 'Patient details updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a patient record
 * DELETE /api/patients/:id/
 */
const deletePatient = async (req, res, next) => {
  try {
    const result = await patientService.deletePatient(req.params.id, req.user.id);
    return ApiResponse.success(res, 'Patient record deleted successfully', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};
