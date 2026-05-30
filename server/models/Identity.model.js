const mongoose = require('mongoose');

const IdentitySchema = new mongoose.Schema({
  // No personal data ever stored — only cryptographic hashes
  publicKeyHash: {
    type: String,
    required: [true, 'Public key hash is required'],
    unique: true,
    index: true,
    match: /^[a-f0-9]{64}$/ // SHA-256 hex
  },
  anonymousHandle: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 64
  },
  encryptedMetadata: {
    type: String,  // AES-256-GCM encrypted on client — server never sees plaintext
    default: null
  },
  threatLevel: {
    type: String,
    enum: ['safe', 'low', 'medium', 'high', 'critical'],
    default: 'safe'
  },
  active: { type: Boolean, default: true },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now, immutable: true }
}, {
  versionKey: false,
  timestamps: false
});

// Never return sensitive fields
IdentitySchema.methods.toSafeJSON = function () {
  return {
    handle: this.anonymousHandle,
    threatLevel: this.threatLevel,
    active: this.active,
    lastActive: this.lastActive,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('Identity', IdentitySchema);
