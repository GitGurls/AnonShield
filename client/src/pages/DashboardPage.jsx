import React, { useEffect, useState } from 'react';
import Navbar from '../components/Layout/Navbar';
import StatsCard from '../components/Dashboard/StatsCard';
import api from '../services/api';

export default function DashboardPage() {
  const [me,      setMe]      = useState(null);
  const [threats, setThreats] = useState(null);

  useEffect(() => {
    api.get('/identity/me').then(r => setMe(r.data)).catch(() => {});
    api.get('/threat/summary').then(r => setThreats(r.data.summary)).catch(() => {});
  }, []);

  const s = {
    page:  { paddingTop: 80, minHeight: '100vh', background: 'var(--bg)' },
    inner: { maxWidth: 1200, margin: '0 auto', padding: '48px 48px' },
    heading: { fontSize: 32, fontWeight: 800, marginBottom: 8 },
    sub: { fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, color: 'var(--text2)', marginBottom: 40 },
    row: { display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' },
    section: { background: 'var(--bg2)', border: '1px solid var(--border)', padding: 28, marginBottom: 24 },
    sectionTitle: { fontWeight: 600, fontSize: 16, marginBottom: 20 },
    actItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    dot: c => ({ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }),
    actText: { flex: 1, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: 'var(--text2)' },
    actTime: { fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text2)' }
  };

  const activity = [
    { color: 'var(--accent)',  text: 'Identity authenticated successfully',        time: '2m ago' },
    { color: '#0066FF',        text: 'Document stored in encrypted vault (2.3 MB)', time: '14m ago' },
    { color: '#FF3366',        text: 'Threat detected: credential exposure alert',  time: '1h ago' },
    { color: 'var(--accent)',  text: 'ZK-Proof generated for age verification',     time: '3h ago' },
  ];

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.inner}>
        <div style={s.heading}>Privacy Dashboard</div>
        <div style={s.sub}>Your anonymous digital identity command center</div>

        <div style={s.row}>
          <StatsCard label="Active Identities"  value={me?.stats ? '1' : '—'}                  change="↑ Secure" />
          <StatsCard label="Threats Blocked"    value={threats?.blocked ?? '—'}                  change="↑ All blocked" color="#ff6644" />
          <StatsCard label="Vault Documents"    value={me?.stats?.vaultDocs ?? '—'}              change="End-to-end encrypted" color="#0099ff" />
          <StatsCard label="Privacy Score"      value={me ? '98%' : '—'}                         change="↑ Excellent" />
        </div>

        <div style={s.section}>
          <div style={s.sectionTitle}>Recent Activity</div>
          {activity.map((a, i) => (
            <div key={i} style={s.actItem}>
              <div style={s.dot(a.color)} />
              <div style={s.actText}>{a.text}</div>
              <div style={s.actTime}>{a.time}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={s.section}>
            <div style={s.sectionTitle}>Threat Breakdown</div>
            {threats?.byType && Object.entries(threats.byType).map(([type, count]) => (
              <div key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 13 }}>
                <span style={{ color: 'var(--text2)' }}>{type.replace('_', ' ').toUpperCase()}</span>
                <span style={{ color: 'var(--accent)' }}>{count}</span>
              </div>
            ))}
            {!threats?.byType && <div style={{ color: 'var(--text2)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 13 }}>No threats recorded</div>}
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>Privacy Guarantees</div>
            {['Zero PII stored', 'Keys never leave device', 'IPs hashed (irreversible)', 'Audit logs immutable', 'Open source code'].map(g => (
              <div key={g} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 13 }}>
                <span style={{ color: 'var(--accent)' }}>✓</span>
                <span style={{ color: 'var(--text2)' }}>{g}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
