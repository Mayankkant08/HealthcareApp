const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.USE_PG_MEM = 'true';

const app = require('../src/app');
const { sequelize } = require('../src/models');

test.before(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
});

test.after(async () => {
  await sequelize.close();
});

test('Healthcare Backend API - Complete Test Suite', async (t) => {
  let user1Token = '';
  let user1Id = null;
  let user2Token = '';
  let patient1Id = null;
  let patient2Id = null;
  let doctor1Id = null;
  let doctor2Id = null;
  let mapping1Id = null;

  // 1. Health check
  await t.test('GET /api/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
  });

  // 2. Authentication APIs
  await t.test('POST /api/auth/register/ - should successfully register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register/')
      .send({
        name: 'Dr. Sarah Connor',
        email: 'sarah.connor@example.com',
        password: 'Password123!',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, 'sarah.connor@example.com');
    assert.ok(res.body.data.token);
    user1Token = res.body.data.token;
    user1Id = res.body.data.user.id;
  });

  await t.test('POST /api/auth/register/ - should reject duplicate email with 409', async () => {
    const res = await request(app)
      .post('/api/auth/register/')
      .send({
        name: 'Sarah Duplicate',
        email: 'sarah.connor@example.com',
        password: 'Password123!',
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /api/auth/register/ - should reject missing fields with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register/')
      .send({
        email: 'incomplete@example.com',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /api/auth/login/ - should successfully login and return JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login/')
      .send({
        email: 'sarah.connor@example.com',
        password: 'Password123!',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.ok(res.body.data.access);
  });

  await t.test('POST /api/auth/login/ - should reject invalid credentials with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login/')
      .send({
        email: 'sarah.connor@example.com',
        password: 'WrongPassword!',
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  // Register a second user to test ownership and authorization checks
  await t.test('Register second user for authorization boundary testing', async () => {
    const res = await request(app)
      .post('/api/auth/register/')
      .send({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
      });

    assert.equal(res.status, 201);
    user2Token = res.body.data.token;
  });

  // 3. Patient Management APIs
  await t.test('POST /api/patients/ - should reject unauthenticated request with 401', async () => {
    const res = await request(app)
      .post('/api/patients/')
      .send({
        name: 'Bruce Wayne',
        age: 35,
        gender: 'Male',
      });

    assert.equal(res.status, 401);
  });

  await t.test('POST /api/patients/ - should add a new patient for authenticated user', async () => {
    const res = await request(app)
      .post('/api/patients/')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Bruce Wayne',
        age: 35,
        gender: 'Male',
        contact_number: '+1-555-0100',
        address: '1007 Mountain Drive, Gotham',
        medical_history: 'Minor concussion, fractured ribs in 2024',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Bruce Wayne');
    assert.equal(res.body.data.userId, user1Id);
    patient1Id = res.body.data.id;
  });

  await t.test('POST /api/patients/ - should add second patient by user 2', async () => {
    const res = await request(app)
      .post('/api/patients/')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        name: 'Clark Kent',
        age: 34,
        gender: 'Male',
        contact_number: '+1-555-0199',
        address: 'Metropolis',
        medical_history: 'None reported',
      });

    assert.equal(res.status, 201);
    patient2Id = res.body.data.id;
  });

  await t.test('GET /api/patients/ - should retrieve only patients created by authenticated user', async () => {
    const res = await request(app)
      .get('/api/patients/')
      .set('Authorization', `Bearer ${user1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(Array.isArray(res.body.data), true);
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0].id, patient1Id);
    assert.equal(res.body.data[0].name, 'Bruce Wayne');
  });

  await t.test('GET /api/patients/<id>/ - should get details of a specific patient', async () => {
    const res = await request(app)
      .get(`/api/patients/${patient1Id}/`)
      .set('Authorization', `Bearer ${user1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.id, patient1Id);
    assert.equal(res.body.data.name, 'Bruce Wayne');
  });

  await t.test('GET /api/patients/<id>/ - should return 404 for non-existent patient', async () => {
    const res = await request(app)
      .get('/api/patients/99999/')
      .set('Authorization', `Bearer ${user1Token}`);

    assert.equal(res.status, 404);
  });

  await t.test('PUT /api/patients/<id>/ - should prevent unauthorized user from updating another user patient', async () => {
    const res = await request(app)
      .put(`/api/patients/${patient1Id}/`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        name: 'Hacked Name',
      });

    assert.equal(res.status, 403);
  });

  await t.test('PUT /api/patients/<id>/ - should update patient details successfully by owner', async () => {
    const res = await request(app)
      .put(`/api/patients/${patient1Id}/`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        age: 36,
        medical_history: 'Annual checkup clear. Minor concussion resolved.',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.age, 36);
    assert.equal(res.body.data.medical_history, 'Annual checkup clear. Minor concussion resolved.');
  });

  // 4. Doctor Management APIs
  await t.test('POST /api/doctors/ - should reject unauthenticated request with 401', async () => {
    const res = await request(app)
      .post('/api/doctors/')
      .send({
        name: 'Dr. Gregory House',
        specialization: 'Diagnostic Medicine',
        email: 'dr.house@hospital.org',
      });

    assert.equal(res.status, 401);
  });

  await t.test('POST /api/doctors/ - should add a new doctor (authenticated)', async () => {
    const res = await request(app)
      .post('/api/doctors/')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Dr. Gregory House',
        specialization: 'Diagnostic Medicine',
        email: 'dr.house@hospital.org',
        phone: '+1-555-0200',
        years_of_experience: 20,
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Dr. Gregory House');
    doctor1Id = res.body.data.id;
  });

  await t.test('POST /api/doctors/ - should add a second doctor', async () => {
    const res = await request(app)
      .post('/api/doctors/')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Dr. Allison Cameron',
        specialization: 'Immunology',
        email: 'dr.cameron@hospital.org',
        phone: '+1-555-0201',
        years_of_experience: 8,
      });

    assert.equal(res.status, 201);
    doctor2Id = res.body.data.id;
  });

  await t.test('GET /api/doctors/ - should retrieve all doctors', async () => {
    const res = await request(app)
      .get('/api/doctors/')
      .set('Authorization', `Bearer ${user1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.length >= 2, true);
  });

  await t.test('GET /api/doctors/<id>/ - should get details of a specific doctor', async () => {
    const res = await request(app)
      .get(`/api/doctors/${doctor1Id}/`)
      .set('Authorization', `Bearer ${user1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.id, doctor1Id);
    assert.equal(res.body.data.specialization, 'Diagnostic Medicine');
  });

  await t.test('PUT /api/doctors/<id>/ - should update doctor details', async () => {
    const res = await request(app)
      .put(`/api/doctors/${doctor1Id}/`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        years_of_experience: 21,
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.years_of_experience, 21);
  });

  // 5. Patient-Doctor Mapping APIs
  await t.test('POST /api/mappings/ - should assign a doctor to a patient', async () => {
    const res = await request(app)
      .post('/api/mappings/')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        patient_id: patient1Id,
        doctor_id: doctor1Id,
        notes: 'Primary physician assignment for comprehensive diagnosis',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.patient_id, patient1Id);
    assert.equal(res.body.data.doctor_id, doctor1Id);
    mapping1Id = res.body.data.id;
  });

  await t.test('POST /api/mappings/ - should reject duplicate assignment with 409', async () => {
    const res = await request(app)
      .post('/api/mappings/')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        patient_id: patient1Id,
        doctor_id: doctor1Id,
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /api/mappings/ - should assign second doctor to patient', async () => {
    const res = await request(app)
      .post('/api/mappings/')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        patient_id: patient1Id,
        doctor_id: doctor2Id,
        notes: 'Immunology consultation',
      });

    assert.equal(res.status, 201);
  });

  await t.test('GET /api/mappings/ - should retrieve all patient-doctor mappings', async () => {
    const res = await request(app)
      .get('/api/mappings/')
      .set('Authorization', `Bearer ${user1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.length >= 2, true);
  });

  await t.test('GET /api/mappings/<patient_id>/ - should get all doctors assigned to a specific patient', async () => {
    const res = await request(app)
      .get(`/api/mappings/${patient1Id}/`)
      .set('Authorization', `Bearer ${user1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.patient.id, patient1Id);
    assert.equal(res.body.data.doctors.length, 2);
  });

  await t.test('DELETE /api/mappings/<id>/ - should remove a doctor from a patient', async () => {
    const res = await request(app)
      .delete(`/api/mappings/${mapping1Id}/`)
      .set('Authorization', `Bearer ${user1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  await t.test('GET /api/mappings/<patient_id>/ - should reflect doctor removal', async () => {
    const res = await request(app)
      .get(`/api/mappings/${patient1Id}/`)
      .set('Authorization', `Bearer ${user1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.doctors.length, 1);
  });

  // 6. Delete endpoints cleanup testing
  await t.test('DELETE /api/patients/<id>/ - should delete a patient record', async () => {
    const res = await request(app)
      .delete(`/api/patients/${patient1Id}/`)
      .set('Authorization', `Bearer ${user1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    // Verify patient is gone
    const verifyRes = await request(app)
      .get(`/api/patients/${patient1Id}/`)
      .set('Authorization', `Bearer ${user1Token}`);
    assert.equal(verifyRes.status, 404);
  });

  await t.test('DELETE /api/doctors/<id>/ - should delete a doctor record', async () => {
    const res = await request(app)
      .delete(`/api/doctors/${doctor2Id}/`)
      .set('Authorization', `Bearer ${user1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    // Verify doctor is gone
    const verifyRes = await request(app)
      .get(`/api/doctors/${doctor2Id}/`)
      .set('Authorization', `Bearer ${user1Token}`);
    assert.equal(verifyRes.status, 404);
  });
});
