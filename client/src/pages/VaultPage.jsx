import React, { useEffect, useState } from 'react';
import Navbar from '../components/Layout/Navbar';
import EncryptionDemo from '../components/Vault/EncryptionDemo';
import api from '../services/api';

export default function VaultPage() {
  const [docs,    setDocs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/vault/list').then(r => setDocs(r.data.docs)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const s = {
    page:    { paddingTop: 80, minHeight: '100vh', background: 'var(--bg)' },
    inner:   { maxWidth: 1200, margin: '0 auto', padding: '48px' },
    heading: { fontSize: 32, fontWeight: 800, marginBottom: 8 },
    sub:     { fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, color: 'var(--text2)', marginBottom: 40 },
    section: { background: 'var(--bg2)', border: '1px solid var(--border)', padding: 28, marginBottom: 32 },
    secTitle:{ fontWeight: 600, fontSize: 16, marginBottom: 8 },
    secDesc: { fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: 'var(--text2)', marginBottom: 24 },
    docRow:  { display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    docIcon: { fontSize: 20, width: 32, textAlign: 'center' },
    docName: { flex: 1, fontFamily: "'IBM Plex Mono',monospace", fontSize: 13 },
    docSize: { fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: 'var(--text2)' },
    docDate: { fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text2)' },
    badge:   { background: 'rgba(0,255,178,0.08)', border: '1px solid var(--border)', padding: '3px 10px', fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", color: 'var(--accent)' }
  };

  const typeIcon = { document: '📄', credential: '🔑', note: '📝', key: '🗝️', image: '🖼️', other: '📦' };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.inner}>
        <div style={s.heading}>Encrypted Vault</div>
        <div style={s.sub}>AES-256-GCM client-side encryption — we never see your plaintext</div>

        <div style={s.section}>
          <div style={s.secTitle}>Live Encryption Demo</div>
          <div style={s.secDesc}>Try encrypting and decrypting data using Web Crypto API</div>
          <EncryptionDemo />
        </div>

        <div style={s.section}>
          <div style={s.secTitle}>Your Vault Documents</div>
          <div style={s.secDesc}>All documents stored encrypted — only you can decrypt with your passphrase</div>
          {loading ? (
            <div style={{ color: 'var(--text2)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 13 }}>Loading...</div>
          ) : docs.length > 0 ? docs.map(doc => (
            <div key={doc._id} style={s.docRow}>
              <div style={s.docIcon}>{typeIcon[doc.docType] || '📦'}</div>
              <div style={s.docName}>{doc.fileName || `Document (${doc.docType})`}</div>
              <div style={s.docSize}>{doc.sizeBytes ? `${(doc.sizeBytes / 1024).toFixed(1)} KB` : '—'}</div>
              <div style={s.badge}>ENCRYPTED</div>
              <div style={s.docDate}>{new Date(doc.createdAt).toLocaleDateString()}</div>
            </div>
          )) : (
            <div style={{ color: 'var(--text2)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, padding: '20px 0' }}>
              No documents stored yet. Upload your first encrypted document above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
