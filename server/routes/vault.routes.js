const express = require('express');
const router = express.Router();
const vaultController = require('../controllers/vault.controller');
const authenticate = require('../middleware/authenticate');
const { vaultLimiter } = require('../config/rateLimit');

// All vault routes require authentication
router.use(authenticate);

router.post('/store',   vaultLimiter, vaultController.storeDocument);
router.get('/list',     vaultController.listDocuments);
router.get('/:id',      vaultController.getDocument);
router.delete('/:id',   vaultController.deleteDocument);

module.exports = router;
