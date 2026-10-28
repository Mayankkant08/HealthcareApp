const { Sequelize } = require('sequelize');
const env = require('../config/env');

let sequelize;

if (env.db.usePgMem) {
  // Use pg-mem in-memory PostgreSQL engine for self-contained execution and testing
  const { newDb } = require('pg-mem');
  const memDb = newDb({
    autoCreateForeignKeyIndices: true,
  });
  
  // Register pg extensions and functions needed by Postgres
  memDb.public.registerFunction({
    name: 'version',
    args: [],
    implementation: () => 'PostgreSQL 15.0 (pg-mem)',
  });

  const pgModule = memDb.adapters.createPg();

  sequelize = new Sequelize({
    dialect: 'postgres',
    dialectModule: pgModule,
    logging: false,
  });
} else {
  // Connect to actual PostgreSQL database
  sequelize = new Sequelize(
    env.db.database,
    env.db.username,
    env.db.password,
    {
      host: env.db.host,
      port: env.db.port,
      dialect: 'postgres',
      logging: env.nodeEnv === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

// Initialize models
const User = require('./User')(sequelize);
const Patient = require('./Patient')(sequelize);
const Doctor = require('./Doctor')(sequelize);
const PatientDoctorMapping = require('./PatientDoctorMapping')(sequelize);

// Model Associations
// 1. User <-> Patient (One-to-Many)
User.hasMany(Patient, {
  foreignKey: 'userId',
  as: 'patients',
  onDelete: 'CASCADE',
});
Patient.belongsTo(User, {
  foreignKey: 'userId',
  as: 'creator',
});

// 2. Patient <-> PatientDoctorMapping (One-to-Many)
Patient.hasMany(PatientDoctorMapping, {
  foreignKey: 'patient_id',
  as: 'mappings',
  onDelete: 'CASCADE',
});
PatientDoctorMapping.belongsTo(Patient, {
  foreignKey: 'patient_id',
  as: 'patient',
});

// 3. Doctor <-> PatientDoctorMapping (One-to-Many)
Doctor.hasMany(PatientDoctorMapping, {
  foreignKey: 'doctor_id',
  as: 'mappings',
  onDelete: 'CASCADE',
});
PatientDoctorMapping.belongsTo(Doctor, {
  foreignKey: 'doctor_id',
  as: 'doctor',
});

// 4. Patient <-> Doctor (Many-to-Many through PatientDoctorMapping)
Patient.belongsToMany(Doctor, {
  through: PatientDoctorMapping,
  foreignKey: 'patient_id',
  otherKey: 'doctor_id',
  as: 'assignedDoctors',
});
Doctor.belongsToMany(Patient, {
  through: PatientDoctorMapping,
  foreignKey: 'doctor_id',
  otherKey: 'patient_id',
  as: 'assignedPatients',
});

module.exports = {
  sequelize,
  Sequelize,
  User,
  Patient,
  Doctor,
  PatientDoctorMapping,
};
