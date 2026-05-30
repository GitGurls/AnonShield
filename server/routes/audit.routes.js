const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);
router.get('/log', auditController.getAuditLog);

module.exports = router;
