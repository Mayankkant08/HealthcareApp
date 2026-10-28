/**
 * Interactive / Standalone Endpoint Verification Runner
 * Runs a complete end-to-end lifecycle verification of every endpoint required by the PDF
 */
process.env.NODE_ENV = 'test';
process.env.USE_PG_MEM = 'true';

const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

const results = [];

const recordResult = (method, endpoint, expectedStatus, actualStatus, description) => {
  const passed = expectedStatus === actualStatus;
  results.push({
    Method: method,
    Endpoint: endpoint,
    Expected: expectedStatus,
    Actual: actualStatus,
    Status: passed ? 'PASSED ✅' : 'FAILED ❌',
    Description: description,
  });
};

const runVerification = async () => {
  console.log('\n======================================================');
  console.log('  HEALTHCARE BACKEND - ENDPOINT VERIFICATION SUITE');
  console.log('======================================================\n');

  await sequelize.authenticate();
  await sequelize.sync({ force: true });

  let userToken = '';
  let patientId = null;
  let doctorId = null;
  let mappingId = null;

  // 1. Health check
  let res = await request(app).get('/api/health');
  recordResult('GET', '/api/health', 200, res.status, 'Health Check');

  // 2. Authentication
  res = await request(app)
    .post('/api/auth/register/')
    .send({ name: 'Dr. John Watson', email: 'watson@example.com', password: 'Password123' });
  recordResult('POST', '/api/auth/register/', 201, res.status, 'Register new user');
  userToken = res.body?.data?.token;

  res = await request(app)
    .post('/api/auth/login/')
    .send({ email: 'watson@example.com', password: 'Password123' });
  recordResult('POST', '/api/auth/login/', 200, res.status, 'Login user & retrieve JWT token');

  // 3. Patients
  res = await request(app)
    .post('/api/patients/')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      name: 'Sherlock Holmes',
      age: 38,
      gender: 'Male',
      contact_number: '+44 20 7946 0919',
      address: '221B Baker Street, London',
      medical_history: 'Tobacco use, exceptional mental agility',
    });
  recordResult('POST', '/api/patients/', 201, res.status, 'Add a new patient (Authenticated)');
  patientId = res.body?.data?.id;

  res = await request(app)
    .get('/api/patients/')
    .set('Authorization', `Bearer ${userToken}`);
  recordResult('GET', '/api/patients/', 200, res.status, 'Retrieve all patients created by user');

  res = await request(app)
    .get(`/api/patients/${patientId}/`)
    .set('Authorization', `Bearer ${userToken}`);
  recordResult('GET', '/api/patients/<id>/', 200, res.status, 'Get details of specific patient');

  res = await request(app)
    .put(`/api/patients/${patientId}/`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({ age: 39 });
  recordResult('PUT', '/api/patients/<id>/', 200, res.status, 'Update patient details');

  // 4. Doctors
  res = await request(app)
    .post('/api/doctors/')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      name: 'Dr. Gregory House',
      specialization: 'Infectious Disease & Nephrology',
      email: 'house@princetonplainsboro.edu',
      phone: '+1 609 555 0142',
      years_of_experience: 25,
    });
  recordResult('POST', '/api/doctors/', 201, res.status, 'Add a new doctor (Authenticated)');
  doctorId = res.body?.data?.id;

  res = await request(app)
    .get('/api/doctors/')
    .set('Authorization', `Bearer ${userToken}`);
  recordResult('GET', '/api/doctors/', 200, res.status, 'Retrieve all doctors');

  res = await request(app)
    .get(`/api/doctors/${doctorId}/`)
    .set('Authorization', `Bearer ${userToken}`);
  recordResult('GET', '/api/doctors/<id>/', 200, res.status, 'Get details of specific doctor');

  res = await request(app)
    .put(`/api/doctors/${doctorId}/`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({ years_of_experience: 26 });
  recordResult('PUT', '/api/doctors/<id>/', 200, res.status, 'Update doctor details');

  // 5. Patient-Doctor Mappings
  res = await request(app)
    .post('/api/mappings/')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      patient_id: patientId,
      doctor_id: doctorId,
      notes: 'Initial clinical assessment assigned',
    });
  recordResult('POST', '/api/mappings/', 201, res.status, 'Assign doctor to a patient');
  mappingId = res.body?.data?.id;

  res = await request(app)
    .get('/api/mappings/')
    .set('Authorization', `Bearer ${userToken}`);
  recordResult('GET', '/api/mappings/', 200, res.status, 'Retrieve all patient-doctor mappings');

  res = await request(app)
    .get(`/api/mappings/${patientId}/`)
    .set('Authorization', `Bearer ${userToken}`);
  recordResult('GET', '/api/mappings/<patient_id>/', 200, res.status, 'Get all doctors assigned to a patient');

  res = await request(app)
    .delete(`/api/mappings/${mappingId}/`)
    .set('Authorization', `Bearer ${userToken}`);
  recordResult('DELETE', '/api/mappings/<id>/', 200, res.status, 'Remove doctor from patient');

  // 6. Delete records
  res = await request(app)
    .delete(`/api/patients/${patientId}/`)
    .set('Authorization', `Bearer ${userToken}`);
  recordResult('DELETE', '/api/patients/<id>/', 200, res.status, 'Delete patient record');

  res = await request(app)
    .delete(`/api/doctors/${doctorId}/`)
    .set('Authorization', `Bearer ${userToken}`);
  recordResult('DELETE', '/api/doctors/<id>/', 200, res.status, 'Delete doctor record');

  console.table(results);

  const allPassed = results.every((r) => r.Status.includes('PASSED'));
  console.log(`\nVerification Summary: ${results.filter((r) => r.Status.includes('PASSED')).length}/${results.length} endpoints passed.`);

  await sequelize.close();
  process.exit(allPassed ? 0 : 1);
};

runVerification().catch((err) => {
  console.error('Test verification failed:', err);
  process.exit(1);
});
