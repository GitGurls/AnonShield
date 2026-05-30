import React, { useEffect, useState } from 'react';
import Navbar from '../components/Layout/Navbar';
import api from '../services/api';

const ACTION_COLORS = {
  IDENTITY_CREATED: '#00FFB2', AUTHENTICATED: '#00cc88',
  VAULT_STORE: '#0099ff',      VAULT_ACCESS: '#0066FF', VAULT_DELETE: '#ff6644',
  THREAT_REPORTED: '#ff9900',  THREAT_RESOLVED: '#00cc88',
  ZKP_GENERATED: '#cc88ff',    AUDIT_VIEWED: '#7A9BAD'
};

export default function AuditPage() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/audit/log').then(r => setLogs(r.data.logs)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const s = {
    page:    { paddingTop: 80, minHeight: '100vh', background: 'var(--bg)' },
    inner:   { maxWidth: 1200, margin: '0 auto', padding: '48px' },
    heading: { fontSize: 32, fontWeight: 800, marginBottom: 8 },
    sub:     { fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, color: 'var(--text2)', marginBottom: 40 },
    table:   { width: '100%', borderCollapse: 'collapse' },
    th:      { fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text2)', letterSpacing: 2, textTransform: 'uppercase', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)' },
    td:      { fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: 'var(--text2)', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' },
    actionBadge: (action) => ({ display: 'inline-block', background: `${ACTION_COLORS[action] || '#7A9BAD'}15`, border: `1px solid ${ACTION_COLORS[action] || '#7A9BAD'}40`, padding: '3px 10px', fontSize: 11, color: ACTION_COLORS[action] || '#7A9BAD' })
  };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.inner}>
        <div style={s.heading}>Audit Trail</div>
        <div style={s.sub}>Immutable, cryptographically signed log of all data access events</div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 32, color: 'var(--text2)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 13 }}>Loading audit log...</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Timestamp</th>
                  <th style={s.th}>Action</th>
                  <th style={s.th}>Resource</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? logs.map(log => (
                  <tr key={log._id}>
                    <td style={s.td}>{new Date(log.timestamp).toLocaleString()}</td>
                    <td style={s.td}><span style={s.actionBadge(log.action)}>{log.action}</span></td>
                    <td style={s.td}>{log.resourceHash ? log.resourceHash.substring(0, 16) + '...' : '—'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} style={{ ...s.td, textAlign: 'center', padding: 32 }}>No audit entries found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
