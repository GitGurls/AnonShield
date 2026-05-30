const Threat = require('../models/Threat.model');

/**
 * AI-powered threat scoring (ML model integration point)
 * In production: integrate TensorFlow.js / HuggingFace BERT model
 */
exports.analyzeThreat = async (identityHash, data) => {
  // Placeholder: rule-based scoring until ML model is integrated
  let score = 0;
  if (data.source === 'dark_web') score += 40;
  if (data.threatType === 'breach') score += 30;
  if (data.threatType === 'credential_stuffing') score += 25;

  const severity = score >= 60 ? 'critical' : score >= 40 ? 'high' : score >= 20 ? 'medium' : 'low';
  return { score, severity };
};

exports.getRecentThreats = async (identityHash, limit = 10) => {
  return Threat.find({ identityHash }).sort({ timestamp: -1 }).limit(limit);
};
