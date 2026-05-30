const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Identity = require('../models/Identity.model');
const AuditLog = require('../models/AuditLog.model');
const auditService = require('../services/audit.service');
const { hashIP } = require('../utils/privacy');

// POST /api/identity/register
exports.register = async (req, res, next) => {
  try {
    const { publicKeyHash, anonymousHandle, encryptedMetadata } = req.body;

    const existing = await Identity.findOne({
      $or: [{ publicKeyHash }, { anonymousHandle }]
    });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Identity or handle already exists.' });
    }

    const identity = await Identity.create({ publicKeyHash, anonymousHandle, encryptedMetadata });

    await auditService.log({
      identityHash: publicKeyHash,
      action: 'IDENTITY_CREATED',
      ipHash: hashIP(req.ip),
      userAgent: req.headers['user-agent']
    });

    const token = jwt.sign({ identityHash: publicKeyHash }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

    res.status(201).json({
      success: true,
      token,
      identity: identity.toSafeJSON()
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/identity/authenticate
exports.authenticate = async (req, res, next) => {
  try {
    const { publicKeyHash } = req.body;
    const identity = await Identity.findOne({ publicKeyHash, active: true });
    if (!identity) {
      return res.status(404).json({ success: false, error: 'Identity not found or inactive.' });
    }

    identity.lastActive = new Date();
    await identity.save();

    await auditService.log({
      identityHash: publicKeyHash,
      action: 'AUTHENTICATED',
      ipHash: hashIP(req.ip),
      userAgent: req.headers['user-agent']
    });

    const token = jwt.sign({ identityHash: publicKeyHash }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

    res.json({ success: true, token, identity: identity.toSafeJSON() });
  } catch (err) {
    next(err);
  }
};

// GET /api/identity/me
exports.getMe = async (req, res, next) => {
  try {
    const identity = await Identity.findOne({ publicKeyHash: req.user.identityHash });
    if (!identity) return res.status(404).json({ success: false, error: 'Identity not found.' });

    const VaultDoc = require('../models/VaultDoc.model');
    const Threat = require('../models/Threat.model');

    const [vaultCount, threatCount] = await Promise.all([
      VaultDoc.countDocuments({ identityHash: req.user.identityHash }),
      Threat.countDocuments({ identityHash: req.user.identityHash })
    ]);

    res.json({
      success: true,
      identity: identity.toSafeJSON(),
      stats: { vaultDocs: vaultCount, threatsBlocked: threatCount }
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/identity/deactivate
exports.deactivate = async (req, res, next) => {
  try {
    await Identity.findOneAndUpdate(
      { publicKeyHash: req.user.identityHash },
      { active: false }
    );
    await auditService.log({
      identityHash: req.user.identityHash,
      action: 'IDENTITY_DEACTIVATED',
      ipHash: hashIP(req.ip)
    });
    res.json({ success: true, message: 'Identity deactivated.' });
  } catch (err) {
    next(err);
  }
};
