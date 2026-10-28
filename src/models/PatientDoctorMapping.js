const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PatientDoctorMapping = sequelize.define(
    'PatientDoctorMapping',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'patients',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'doctors',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      assigned_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'patient_doctor_mappings',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['patient_id', 'doctor_id'],
          name: 'unique_patient_doctor_mapping',
        },
      ],
    }
  );

  return PatientDoctorMapping;
};
