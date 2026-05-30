const crypto = require('crypto');
const VaultDoc = require('../models/VaultDoc.model');
const auditService = require('../services/audit.service');
const { hashIP } = require('../utils/privacy');

// POST /api/vault/store
exports.storeDocument = async (req, res, next) => {
  try {
    const { encryptedData, iv, authTag, docType, fileName, sizeBytes, ipfsHash } = req.body;

    const doc = await VaultDoc.create({
      identityHash: req.user.identityHash,
      encryptedData, iv, authTag, docType, fileName, sizeBytes, ipfsHash
    });

    await auditService.log({
      identityHash: req.user.identityHash,
      action: 'VAULT_STORE',
      resourceHash: crypto.createHash('sha256').update(doc._id.toString()).digest('hex'),
      ipHash: hashIP(req.ip)
    });

    // Emit real-time event
    if (req.io) {
      req.io.to(`threats:${req.user.identityHash}`).emit('vault:stored', {
        docId: doc._id, docType, sizeBytes, timestamp: doc.createdAt
      });
    }

    res.status(201).json({ success: true, id: doc._id, createdAt: doc.createdAt });
  } catch (err) {
    next(err);
  }
};

// GET /api/vault/list
exports.listDocuments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, docType } = req.query;
    const filter = { identityHash: req.user.identityHash };
    if (docType) filter.docType = docType;

    const docs = await VaultDoc.find(filter, { encryptedData: 0 }) // Never return ciphertext in list
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await VaultDoc.countDocuments(filter);

    res.json({ success: true, docs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/vault/:id
exports.getDocument = async (req, res, next) => {
  try {
    const doc = await VaultDoc.findOne({ _id: req.params.id, identityHash: req.user.identityHash });
    if (!doc) return res.status(404).json({ success: false, error: 'Document not found.' });

    await auditService.log({
      identityHash: req.user.identityHash,
      action: 'VAULT_ACCESS',
      resourceHash: req.params.id,
      ipHash: hashIP(req.ip)
    });

    res.json({ success: true, doc });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/vault/:id
exports.deleteDocument = async (req, res, next) => {
  try {
    const doc = await VaultDoc.findOneAndDelete({ _id: req.params.id, identityHash: req.user.identityHash });
    if (!doc) return res.status(404).json({ success: false, error: 'Document not found.' });

    await auditService.log({
      identityHash: req.user.identityHash,
      action: 'VAULT_DELETE',
      resourceHash: req.params.id,
      ipHash: hashIP(req.ip)
    });

    res.json({ success: true, message: 'Document deleted.' });
  } catch (err) {
    next(err);
  }
};
