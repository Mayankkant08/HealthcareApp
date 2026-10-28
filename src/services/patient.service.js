const { Patient, Doctor, PatientDoctorMapping } = require('../models');
const ApiError = require('../utils/apiError');

/**
 * Add a new patient record created by the authenticated user
 */
const createPatient = async (userId, data) => {
  const patient = await Patient.create({
    name: data.name,
    age: data.age,
    gender: data.gender,
    contact_number: data.contact_number || data.phone || null,
    address: data.address || null,
    medical_history: data.medical_history || null,
    userId,
  });

  return patient;
};

/**
 * Retrieve all patients created by the authenticated user
 */
const getPatientsByUser = async (userId) => {
  const patients = await Patient.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });
  return patients;
};

/**
 * Get details of a specific patient by ID
 */
const getPatientById = async (id) => {
  const patient = await Patient.findByPk(id);

  if (!patient) {
    throw ApiError.notFound(`Patient with ID ${id} not found`);
  }

  const mappings = await PatientDoctorMapping.findAll({
    where: { patient_id: id },
    include: [{ model: Doctor, as: 'doctor' }],
  });

  const patientData = patient.toJSON();
  patientData.assignedDoctors = mappings.map((m) => ({
    mapping_id: m.id,
    assigned_date: m.assigned_date,
    notes: m.notes,
    ...(m.doctor ? m.doctor.toJSON() : {}),
  }));

  return patientData;
};

/**
 * Update patient details
 */
const updatePatient = async (id, userId, updateData) => {
  const patient = await Patient.findByPk(id);

  if (!patient) {
    throw ApiError.notFound(`Patient with ID ${id} not found`);
  }

  // Ensure patient belongs to authenticated user
  if (patient.userId !== userId) {
    throw ApiError.forbidden('You do not have permission to update this patient record');
  }

  const allowedFields = ['name', 'age', 'gender', 'contact_number', 'phone', 'address', 'medical_history'];
  const updatePayload = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      if (field === 'phone') {
        updatePayload.contact_number = updateData[field];
      } else {
        updatePayload[field] = updateData[field];
      }
    }
  }

  await patient.update(updatePayload);
  return patient;
};

/**
 * Delete a patient record
 */
const deletePatient = async (id, userId) => {
  const patient = await Patient.findByPk(id);

  if (!patient) {
    throw ApiError.notFound(`Patient with ID ${id} not found`);
  }

  if (patient.userId !== userId) {
    throw ApiError.forbidden('You do not have permission to delete this patient record');
  }

  await patient.destroy();
  return { id: Number(id), message: 'Patient record deleted successfully' };
};

module.exports = {
  createPatient,
  getPatientsByUser,
  getPatientById,
  updatePatient,
  deletePatient,
};
