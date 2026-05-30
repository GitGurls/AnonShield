const Threat = require('../models/Threat.model');
const Identity = require('../models/Identity.model');
const auditService = require('../services/audit.service');
const { hashIP } = require('../utils/privacy');

// POST /api/threat/report
exports.reportThreat = async (req, res, next) => {
  try {
    const { threatType, severity, source, description } = req.body;

    const threat = await Threat.create({
      identityHash: req.user.identityHash,
      threatType, severity, source, description
    });

    // Update identity threat level if critical/high
    if (['critical', 'high'].includes(severity)) {
      await Identity.findOneAndUpdate(
        { publicKeyHash: req.user.identityHash },
        { threatLevel: severity }
      );
    }

    await auditService.log({
      identityHash: req.user.identityHash,
      action: 'THREAT_REPORTED',
      ipHash: hashIP(req.ip)
    });

    // Real-time alert
    if (req.io) {
      req.io.to(`threats:${req.user.identityHash}`).emit('threat:new', {
        id: threat._id, threatType, severity, timestamp: threat.timestamp
      });
    }

    res.status(201).json({ success: true, threat });
  } catch (err) {
    next(err);
  }
};

// GET /api/threat/summary
exports.getThreatSummary = async (req, res, next) => {
  try {
    const threats = await Threat.find({ identityHash: req.user.identityHash })
      .sort({ timestamp: -1 })
      .limit(50);

    const summary = {
      total: threats.length,
      byType: {},
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      blocked: threats.filter(t => t.blocked).length,
      recent: threats.slice(0, 10)
    };

    threats.forEach(t => {
      summary.byType[t.threatType] = (summary.byType[t.threatType] || 0) + 1;
      summary.bySeverity[t.severity]++;
    });

    res.json({ success: true, summary });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/threat/:id/resolve
exports.resolveThreat = async (req, res, next) => {
  try {
    const threat = await Threat.findOneAndUpdate(
      { _id: req.params.id, identityHash: req.user.identityHash },
      { resolved: true, resolvedAt: new Date() },
      { new: true }
    );
    if (!threat) return res.status(404).json({ success: false, error: 'Threat not found.' });

    await auditService.log({
      identityHash: req.user.identityHash,
      action: 'THREAT_RESOLVED',
      resourceHash: req.params.id,
      ipHash: hashIP(req.ip)
    });

    res.json({ success: true, threat });
  } catch (err) {
    next(err);
  }
};
