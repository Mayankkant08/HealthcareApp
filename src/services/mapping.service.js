const { PatientDoctorMapping, Patient, Doctor } = require('../models');
const ApiError = require('../utils/apiError');

/**
 * Assign a doctor to a patient
 */
const createMapping = async (data) => {
  const patientId = data.patient_id || data.patientId;
  const doctorId = data.doctor_id || data.doctorId;

  // Validate patient exists
  const patient = await Patient.findByPk(patientId);
  if (!patient) {
    throw ApiError.notFound(`Patient with ID ${patientId} not found`);
  }

  // Validate doctor exists
  const doctor = await Doctor.findByPk(doctorId);
  if (!doctor) {
    throw ApiError.notFound(`Doctor with ID ${doctorId} not found`);
  }

  // Check for existing mapping
  const existingMapping = await PatientDoctorMapping.findOne({
    where: {
      patient_id: patientId,
      doctor_id: doctorId,
    },
  });

  if (existingMapping) {
    throw ApiError.conflict('Doctor is already assigned to this patient');
  }

  const mapping = await PatientDoctorMapping.create({
    patient_id: patientId,
    doctor_id: doctorId,
    assigned_date: data.assigned_date || new Date(),
    notes: data.notes || null,
  });

  // Return mapping with related info
  const createdMapping = await PatientDoctorMapping.findByPk(mapping.id, {
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'name', 'age', 'gender', 'contact_number'],
      },
      {
        model: Doctor,
        as: 'doctor',
        attributes: ['id', 'name', 'specialization', 'email', 'phone'],
      },
    ],
  });

  return createdMapping;
};

/**
 * Retrieve all patient-doctor mappings
 */
const getAllMappings = async () => {
  const mappings = await PatientDoctorMapping.findAll({
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'name', 'age', 'gender', 'contact_number'],
      },
      {
        model: Doctor,
        as: 'doctor',
        attributes: ['id', 'name', 'specialization', 'email', 'phone'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return mappings;
};

/**
 * Get all doctors assigned to a specific patient
 */
const getDoctorsByPatient = async (patientId) => {
  const patient = await Patient.findByPk(patientId);
  if (!patient) {
    throw ApiError.notFound(`Patient with ID ${patientId} not found`);
  }

  const mappings = await PatientDoctorMapping.findAll({
    where: { patient_id: patientId },
    include: [
      {
        model: Doctor,
        as: 'doctor',
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return {
    patient: {
      id: patient.id,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
    },
    totalDoctors: mappings.length,
    doctors: mappings.map((m) => ({
      mapping_id: m.id,
      assigned_date: m.assigned_date,
      notes: m.notes,
      ...m.doctor.toJSON(),
    })),
  };
};

/**
 * Remove a doctor from a patient (delete mapping)
 */
const deleteMapping = async (id) => {
  const mapping = await PatientDoctorMapping.findByPk(id);

  if (!mapping) {
    throw ApiError.notFound(`Patient-doctor mapping with ID ${id} not found`);
  }

  await mapping.destroy();
  return { id: Number(id), message: 'Patient-doctor mapping removed successfully' };
};

module.exports = {
  createMapping,
  getAllMappings,
  getDoctorsByPatient,
  deleteMapping,
};
