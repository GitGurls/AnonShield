const AuditLog = require('../models/AuditLog.model');

exports.log = async ({ identityHash, action, resourceHash, ipHash, userAgent, signature }) => {
  try {
    await AuditLog.create({ identityHash, action, resourceHash, ipHash, userAgent, signature });
  } catch (err) {
    // Audit failures should never crash the app
    console.error('Audit log error:', err.message);
  }
};
