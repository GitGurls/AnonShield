const Identity = require('../models/Identity.model');
const VaultDoc = require('../models/VaultDoc.model');
const Threat = require('../models/Threat.model');

// GET /api/stats — Public global stats
exports.getStats = async (req, res, next) => {
  try {
    const [identities, threatsBlocked, docsEncrypted] = await Promise.all([
      Identity.countDocuments({ active: true }),
      Threat.countDocuments({ blocked: true }),
      VaultDoc.countDocuments()
    ]);
    res.json({ success: true, identitiesProtected: identities, threatsBlocked, docsEncrypted });
  } catch (err) {
    next(err);
  }
};
