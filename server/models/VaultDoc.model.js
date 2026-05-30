const mongoose = require('mongoose');

const VaultDocSchema = new mongoose.Schema({
  identityHash: {
    type: String,
    required: true,
    index: true
  },
  // All data is client-side encrypted before storage
  encryptedData: { type: String, required: true },
  iv:            { type: String, required: true },   // AES-GCM IV
  authTag:       { type: String, required: true },   // AES-GCM auth tag
  docType: {
    type: String,
    enum: ['document', 'credential', 'note', 'key', 'image', 'other'],
    default: 'document'
  },
  fileName:  { type: String, maxlength: 255 },  // Encrypted filename
  sizeBytes: { type: Number, min: 0 },
  ipfsHash:  { type: String, default: null },   // IPFS CID if distributed
  createdAt: { type: Date, default: Date.now, immutable: true }
}, { versionKey: false });

module.exports = mongoose.model('VaultDoc', VaultDocSchema);
