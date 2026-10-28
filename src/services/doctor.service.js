const { Doctor, Patient, PatientDoctorMapping } = require('../models');
const ApiError = require('../utils/apiError');

/**
 * Add a new doctor
 */
const createDoctor = async (data) => {
  const doctor = await Doctor.create({
    name: data.name,
    specialization: data.specialization,
    email: data.email,
    phone: data.phone || data.contact_number || null,
    years_of_experience: data.years_of_experience !== undefined ? data.years_of_experience : 0,
  });

  return doctor;
};

/**
 * Retrieve all doctors
 */
const getAllDoctors = async () => {
  const doctors = await Doctor.findAll({
    order: [['createdAt', 'DESC']],
  });
  return doctors;
};

/**
 * Get details of a specific doctor
 */
const getDoctorById = async (id) => {
  const doctor = await Doctor.findByPk(id);

  if (!doctor) {
    throw ApiError.notFound(`Doctor with ID ${id} not found`);
  }

  const mappings = await PatientDoctorMapping.findAll({
    where: { doctor_id: id },
    include: [{ model: Patient, as: 'patient' }],
  });

  const doctorData = doctor.toJSON();
  doctorData.assignedPatients = mappings.map((m) => ({
    mapping_id: m.id,
    assigned_date: m.assigned_date,
    notes: m.notes,
    ...(m.patient ? m.patient.toJSON() : {}),
  }));

  return doctorData;
};

/**
 * Update doctor details
 */
const updateDoctor = async (id, updateData) => {
  const doctor = await Doctor.findByPk(id);

  if (!doctor) {
    throw ApiError.notFound(`Doctor with ID ${id} not found`);
  }

  const allowedFields = ['name', 'specialization', 'email', 'phone', 'contact_number', 'years_of_experience'];
  const updatePayload = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      if (field === 'contact_number') {
        updatePayload.phone = updateData[field];
      } else {
        updatePayload[field] = updateData[field];
      }
    }
  }

  await doctor.update(updatePayload);
  return doctor;
};

/**
 * Delete a doctor record
 */
const deleteDoctor = async (id) => {
  const doctor = await Doctor.findByPk(id);

  if (!doctor) {
    throw ApiError.notFound(`Doctor with ID ${id} not found`);
  }

  await doctor.destroy();
  return { id: Number(id), message: 'Doctor record deleted successfully' };
};

module.exports = {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};
