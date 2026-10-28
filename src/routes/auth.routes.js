const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema } = require('../validations/auth.validation');

// POST /api/auth/register/ (and /register)
router.post('/register', validate(registerSchema), authController.register);
router.post('/register/', validate(registerSchema), authController.register);

// POST /api/auth/login/ (and /login)
router.post('/login', validate(loginSchema), authController.login);
router.post('/login/', validate(loginSchema), authController.login);

module.exports = router;
