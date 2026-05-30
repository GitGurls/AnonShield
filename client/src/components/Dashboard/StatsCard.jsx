import React from 'react';

export default function StatsCard({ label, value, change, color = 'var(--accent)' }) {
  return (
    <div style={{
      background: 'var(--bg3)', border: '1px solid var(--border)',
      padding: 24, flex: 1, minWidth: 150
    }}>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text2)', letterSpacing: 2, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color, fontFamily: "'Space Mono',monospace", margin: '8px 0 4px' }}>
        {value ?? '—'}
      </div>
      {change && (
        <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono',monospace", color: '#00cc88' }}>
          {change}
        </div>
      )}
    </div>
  );
}
