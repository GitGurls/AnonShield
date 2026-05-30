require('dotenv').config();
const mongoose = require('mongoose');
const crypto   = require('crypto');

const Identity = require('../server/models/Identity.model');
const Threat   = require('../server/models/Threat.model');
const AuditLog = require('../server/models/AuditLog.model');

const randomHex = (n) => crypto.randomBytes(n).toString('hex');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anonshield');
  console.log('Connected to MongoDB');

  await Promise.all([Identity.deleteMany({}), Threat.deleteMany({}), AuditLog.deleteMany({})]);
  console.log('Cleared existing data');

  const identities = await Identity.insertMany([
    { publicKeyHash: randomHex(32), anonymousHandle: '@phantom_node_a1b2', threatLevel: 'safe' },
    { publicKeyHash: randomHex(32), anonymousHandle: '@shadow_vault_c3d4', threatLevel: 'low' },
    { publicKeyHash: randomHex(32), anonymousHandle: '@cipher_grid_e5f6',  threatLevel: 'safe' }
  ]);
  console.log(`Created ${identities.length} sample identities`);

  await Threat.insertMany([
    { identityHash: identities[0].publicKeyHash, threatType: 'breach',   severity: 'high',   source: 'HaveIBeenPwned', description: 'Email found in breach database', blocked: true },
    { identityHash: identities[0].publicKeyHash, threatType: 'phishing', severity: 'medium', source: 'URL scanner',    description: 'Phishing link clicked', blocked: true },
    { identityHash: identities[1].publicKeyHash, threatType: 'exposure', severity: 'low',    source: 'Dark web scan',  description: 'Username exposure detected', blocked: true }
  ]);
  console.log('Created sample threats');

  console.log('\n✓ Database seeded successfully!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
