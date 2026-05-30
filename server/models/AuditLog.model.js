const mongoose = require('mongoose');

// Immutable audit trail — no updates or deletes allowed
const AuditSchema = new mongoose.Schema({
  identityHash: { type: String, index: true },
  action: {
    type: String,
    enum: [
      'IDENTITY_CREATED', 'AUTHENTICATED', 'IDENTITY_DEACTIVATED',
      'VAULT_STORE', 'VAULT_ACCESS', 'VAULT_DELETE',
      'THREAT_REPORTED', 'THREAT_RESOLVED',
      'ZKP_GENERATED', 'ZKP_VERIFIED',
      'AUDIT_VIEWED'
    ],
    required: true
  },
  resourceHash: { type: String, default: null },
  ipHash:       { type: String },      // Hashed IP — never raw
  userAgent:    { type: String, maxlength: 512 },
  signature:    { type: String },      // Ed25519 signature of log entry
  timestamp:    { type: Date, default: Date.now, immutable: true }
}, {
  versionKey: false,
  // Prevent any updates — audit logs are write-once
  strict: true
});

// Disable update operations on audit log
AuditSchema.pre(['updateOne', 'findOneAndUpdate', 'updateMany'], function () {
  throw new Error('Audit logs are immutable — updates are not allowed.');
});

module.exports = mongoose.model('AuditLog', AuditSchema);
