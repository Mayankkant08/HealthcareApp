const mappingService = require('../services/mapping.service');
const ApiResponse = require('../utils/apiResponse');

/**
 * Assign a doctor to a patient
 * POST /api/mappings/
 */
const createMapping = async (req, res, next) => {
  try {
    const mapping = await mappingService.createMapping(req.body);
    return ApiResponse.created(res, 'Doctor assigned to patient successfully', mapping);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve all patient-doctor mappings
 * GET /api/mappings/
 */
const getAllMappings = async (req, res, next) => {
  try {
    const mappings = await mappingService.getAllMappings();
    return ApiResponse.success(res, 'Patient-doctor mappings retrieved successfully', mappings);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all doctors assigned to a specific patient
 * GET /api/mappings/:patient_id/
 */
const getDoctorsByPatient = async (req, res, next) => {
  try {
    const result = await mappingService.getDoctorsByPatient(req.params.patient_id);
    return ApiResponse.success(res, 'Doctors assigned to patient retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a doctor from a patient
 * DELETE /api/mappings/:id/
 */
const deleteMapping = async (req, res, next) => {
  try {
    const result = await mappingService.deleteMapping(req.params.id);
    return ApiResponse.success(res, 'Doctor removed from patient successfully', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMapping,
  getAllMappings,
  getDoctorsByPatient,
  deleteMapping,
};
