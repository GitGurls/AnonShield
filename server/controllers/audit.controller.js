const AuditLog = require('../models/AuditLog.model');
const auditService = require('../services/audit.service');
const { hashIP } = require('../utils/privacy');

// GET /api/audit/log
exports.getAuditLog = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action } = req.query;
    const filter = { identityHash: req.user.identityHash };
    if (action) filter.action = action;

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-ipHash -userAgent'); // Don't expose hashed IPs in client

    const total = await AuditLog.countDocuments(filter);

    await auditService.log({
      identityHash: req.user.identityHash,
      action: 'AUDIT_VIEWED',
      ipHash: hashIP(req.ip)
    });

    res.json({ success: true, logs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};
