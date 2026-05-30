import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/Auth/AuthForm';
import api from '../services/api';

export default function LandingPage() {
  const [stats,    setStats]    = useState({});
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const s = {
    page: { minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' },
    grid: { position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(0,255,178,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,178,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' },
    nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', position: 'relative', zIndex: 10 },
    logo: { fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 600, color: 'var(--accent)', letterSpacing: 2 },
    navBtn: { background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '8px 20px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, letterSpacing: 2, cursor: 'pointer', textTransform: 'uppercase' },
    hero: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '90vh', textAlign: 'center', padding: '80px 24px 40px', position: 'relative', zIndex: 1 },
    badge: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,255,178,0.08)', border: '1px solid var(--border)', padding: '6px 16px', marginBottom: 32, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: 2, color: 'var(--accent)', textTransform: 'uppercase' },
    h1: { fontSize: 'clamp(38px,7vw,88px)', fontWeight: 800, lineHeight: 1.0, letterSpacing: -2, marginBottom: 24 },
    sub: { fontFamily: "'IBM Plex Mono',monospace", color: 'var(--text2)', fontSize: 15, lineHeight: 1.8, maxWidth: 580, marginBottom: 48 },
    actions: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 80 },
    btnPrimary: { background: 'var(--accent)', color: 'var(--bg)', border: 'none', padding: '14px 32px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, letterSpacing: 2, cursor: 'pointer', textTransform: 'uppercase', fontWeight: 700 },
    btnOutline: { background: 'transparent', color: 'var(--text)', border: '1px solid rgba(255,255,255,0.2)', padding: '14px 32px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, letterSpacing: 2, cursor: 'pointer', textTransform: 'uppercase' },
    stats: { display: 'flex', gap: 48, justifyContent: 'center', flexWrap: 'wrap' },
    statNum: { fontSize: 36, fontWeight: 800, color: 'var(--accent)', fontFamily: "'Space Mono',monospace" },
    statLabel: { fontSize: 12, color: 'var(--text2)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 },
    modal: { position: 'fixed', inset: 0, background: 'rgba(5,10,14,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }
  };

  return (
    <div style={s.page}>
      <div style={s.grid} />
      <nav style={s.nav}>
        <div style={s.logo}>ANON<span style={{ color: 'var(--text2)' }}>SHIELD</span></div>
        <button style={s.navBtn} onClick={() => setShowAuth(true)}>Launch App →</button>
      </nav>

      <section style={s.hero}>
        <div style={s.badge}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          Codorra Hackathon 2026 — Cybersecurity Track
        </div>
        <h1 style={s.h1}>
          Anonymous<br />
          <span style={{ color: 'var(--accent)' }}>Digital Identity</span><br />
          <span style={{ color: 'var(--accent2)' }}>&amp; Data Protection</span>
        </h1>
        <p style={s.sub}>
          Zero-knowledge proofs. End-to-end encryption. Decentralized identity management.<br />
          Your data. Your identity. Your control.
        </p>
        <div style={s.actions}>
          <button style={s.btnPrimary} onClick={() => setShowAuth(true)}>Get Anonymous ID</button>
          <button style={s.btnOutline}>View on GitHub</button>
        </div>
        <div style={s.stats}>
          <div style={{ textAlign: 'center' }}>
            <div style={s.statNum}>{stats.identitiesProtected?.toLocaleString() || '12,847'}</div>
            <div style={s.statLabel}>Identities Protected</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={s.statNum}>{stats.threatsBlocked?.toLocaleString() || '98,231'}</div>
            <div style={s.statLabel}>Threats Blocked</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={s.statNum}>256</div>
            <div style={s.statLabel}>Bit Encryption</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={s.statNum}>0</div>
            <div style={s.statLabel}>PII Stored</div>
          </div>
        </div>
      </section>

      {showAuth && (
        <div style={s.modal} onClick={e => e.target === e.currentTarget && setShowAuth(false)}>
          <AuthForm />
        </div>
      )}
    </div>
  );
}
