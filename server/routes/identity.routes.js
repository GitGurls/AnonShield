const express = require('express');
const router = express.Router();
const identityController = require('../controllers/identity.controller');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { body } = require('express-validator');
const { authLimiter } = require('../config/rateLimit');

// Validation rules
const registerRules = [
  body('publicKeyHash').matches(/^[a-f0-9]{64}$/).withMessage('Invalid public key hash format'),
  body('anonymousHandle').isLength({ min: 3, max: 64 }).withMessage('Handle must be 3-64 characters')
];

const authRules = [
  body('publicKeyHash').matches(/^[a-f0-9]{64}$/).withMessage('Invalid public key hash format')
];

// Public routes
router.post('/register',     authLimiter, registerRules, validate, identityController.register);
router.post('/authenticate', authLimiter, authRules,     validate, identityController.authenticate);

// Protected routes
router.get('/me',            authenticate, identityController.getMe);
router.delete('/deactivate', authenticate, identityController.deactivate);

module.exports = router;
