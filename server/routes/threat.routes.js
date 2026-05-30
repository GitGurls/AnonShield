const express = require('express');
const router = express.Router();
const threatController = require('../controllers/threat.controller');
const authenticate = require('../middleware/authenticate');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

router.use(authenticate);

const reportRules = [
  body('threatType').isIn(['breach','exposure','phishing','surveillance','malware','credential_stuffing','doxxing']),
  body('severity').isIn(['low','medium','high','critical'])
];

router.post('/report',       reportRules, validate, threatController.reportThreat);
router.get('/summary',       threatController.getThreatSummary);
router.patch('/:id/resolve', threatController.resolveThreat);

module.exports = router;
