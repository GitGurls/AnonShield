import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const SEVERITY_COLORS = { low: '#00cc88', medium: '#ff9900', high: '#ff6644', critical: '#ff2244' };

export default function ThreatMonitor() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/threat/summary')
      .then(r => setSummary(r.data.summary))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const s = {
    wrap: { background: 'var(--bg2)', border: '1px solid var(--border)', padding: 32 },
    row: { display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 },
    card: (color) => ({ flex: 1, minWidth: 100, background: 'var(--bg)', border: `1px solid ${color}30`, padding: '16px 20px' }),
    cardNum: (color) => ({ fontSize: 28, fontWeight: 800, color, fontFamily: "'Space Mono',monospace" }),
    cardLabel: { fontSize: 11, color: 'var(--text2)', fontFamily: "'IBM Plex Mono',monospace", letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 },
    item: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    dot: (c) => ({ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }),
    text: { flex: 1, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: 'var(--text2)' },
    time: { fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text2)' }
  };

  if (loading) return <div style={{ padding: 32, color: 'var(--text2)', fontFamily: "'IBM Plex Mono',monospace" }}>Loading threat data...</div>;

  const sev = summary?.bySeverity || {};

  return (
    <div style={s.wrap}>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 24 }}>Threat Intelligence Summary</div>
      <div style={s.row}>
        {Object.entries(sev).map(([level, count]) => (
          <div key={level} style={s.card(SEVERITY_COLORS[level])}>
            <div style={s.cardNum(SEVERITY_COLORS[level])}>{count}</div>
            <div style={s.cardLabel}>{level}</div>
          </div>
        ))}
      </div>
      <div style={{ fontWeight: 600, marginBottom: 16 }}>Recent Threats</div>
      {summary?.recent?.length > 0 ? summary.recent.map(t => (
        <div key={t._id} style={s.item}>
          <div style={s.dot(SEVERITY_COLORS[t.severity])} />
          <div style={s.text}>{t.threatType.replace('_', ' ').toUpperCase()} — {t.source || 'Unknown source'}</div>
          <div style={s.time}>{new Date(t.timestamp).toLocaleTimeString()}</div>
          <div style={{ fontSize: 11, color: t.resolved ? '#00cc88' : '#ff6644', fontFamily: "'IBM Plex Mono',monospace" }}>
            {t.resolved ? 'RESOLVED' : 'BLOCKED'}
          </div>
        </div>
      )) : (
        <div style={{ color: 'var(--text2)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, padding: '16px 0' }}>
          ✓ No threats detected
        </div>
      )}
    </div>
  );
}
