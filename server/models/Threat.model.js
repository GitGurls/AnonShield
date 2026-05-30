const mongoose = require('mongoose');

const ThreatSchema = new mongoose.Schema({
  identityHash: { type: String, required: true, index: true },
  threatType: {
    type: String,
    enum: ['breach', 'exposure', 'phishing', 'surveillance', 'malware', 'credential_stuffing', 'doxxing'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  source:      { type: String, maxlength: 255 },
  description: { type: String, maxlength: 1000 },
  blocked:     { type: Boolean, default: true },
  resolved:    { type: Boolean, default: false },
  resolvedAt:  { type: Date, default: null },
  timestamp:   { type: Date, default: Date.now, immutable: true }
}, { versionKey: false });

module.exports = mongoose.model('Threat', ThreatSchema);
