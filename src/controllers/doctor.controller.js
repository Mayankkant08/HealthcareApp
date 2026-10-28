const doctorService = require('../services/doctor.service');
const ApiResponse = require('../utils/apiResponse');

/**
 * Add a new doctor (Authenticated users only)
 * POST /api/doctors/
 */
const createDoctor = async (req, res, next) => {
  try {
    const doctor = await doctorService.createDoctor(req.body);
    return ApiResponse.created(res, 'Doctor added successfully', doctor);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve all doctors
 * GET /api/doctors/
 */
const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await doctorService.getAllDoctors();
    return ApiResponse.success(res, 'Doctors retrieved successfully', doctors);
  } catch (error) {
    next(error);
  }
};

/**
 * Get details of a specific doctor
 * GET /api/doctors/:id/
 */
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);
    return ApiResponse.success(res, 'Doctor details retrieved successfully', doctor);
  } catch (error) {
    next(error);
  }
};

/**
 * Update doctor details
 * PUT /api/doctors/:id/
 */
const updateDoctor = async (req, res, next) => {
  try {
    const updated = await doctorService.updateDoctor(req.params.id, req.body);
    return ApiResponse.success(res, 'Doctor details updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a doctor record
 * DELETE /api/doctors/:id/
 */
const deleteDoctor = async (req, res, next) => {
  try {
    const result = await doctorService.deleteDoctor(req.params.id);
    return ApiResponse.success(res, 'Doctor record deleted successfully', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};
