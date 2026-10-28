const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middlewares/error.middleware');
const ApiError = require('./utils/apiError');
const env = require('./config/env');

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Healthcare Backend API is running',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// API Routes
app.use('/api', routes);

// 404 Handler for undefined routes
app.use((req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
