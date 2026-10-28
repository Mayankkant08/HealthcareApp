const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const patientRoutes = require('./patient.routes');
const doctorRoutes = require('./doctor.routes');
const mappingRoutes = require('./mapping.routes');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Healthcare Backend API',
  });
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/doctors', doctorRoutes);
router.use('/mappings', mappingRoutes);

module.exports = router;
