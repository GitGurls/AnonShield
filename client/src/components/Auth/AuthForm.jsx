import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { generateKeyPair, sha256 } from '../../utils/crypto';

export default function AuthForm() {
  const [mode, setMode]       = useState('login');   // 'login' | 'register'
  const [step, setStep]       = useState(1);
  const [keyPair, setKeyPair] = useState(null);
  const [handle, setHandle]   = useState('');
  const [keyHash, setKeyHash] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register }   = useAuth();
  const navigate              = useNavigate();

  const handleGenerate = async () => {
    const kp = generateKeyPair();
    const hash = await sha256(kp.publicKey);
    setKeyPair(kp);
    setKeyHash(hash);
    setStep(2);
  };

  const handleRegister = async () => {
    if (!handle.trim()) { setError('Handle is required'); return; }
    setLoading(true); setError('');
    const result = await register(keyHash, handle.trim());
    setLoading(false);
    if (result.success) navigate('/dashboard');
    else setError(result.error);
  };

  const handleLogin = async () => {
    if (!keyHash.trim()) { setError('Enter your public key hash'); return; }
    setLoading(true); setError('');
    const result = await login(keyHash.trim());
    setLoading(false);
    if (result.success) navigate('/dashboard');
    else setError(result.error);
  };

  const s = {
    wrap: { background: 'var(--bg2)', border: '1px solid var(--border)', padding: 40, maxWidth: 500, width: '100%' },
    tab: { display: 'flex', marginBottom: 32, borderBottom: '1px solid var(--border)' },
    tabBtn: (active) => ({
      flex: 1, background: 'none', border: 'none',
      padding: '12px 0', cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace",
      fontSize: 13, letterSpacing: 1, textTransform: 'uppercase',
      color: active ? 'var(--accent)' : 'var(--text2)',
      borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent'
    }),
    label: { display: 'block', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text2)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
    input: { width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px 16px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, outline: 'none', marginBottom: 20 },
    btn: { width: '100%', background: 'var(--accent)', color: 'var(--bg)', border: 'none', padding: 14, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 },
    secondaryBtn: { width: '100%', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', padding: 12, cursor: 'pointer', fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 },
    error: { color: 'var(--accent3)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, marginBottom: 16 },
    codeBox: { background: 'var(--bg)', border: '1px solid var(--border)', padding: 12, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--accent)', wordBreak: 'break-all', marginBottom: 20, lineHeight: 1.6 }
  };

  return (
    <div style={s.wrap}>
      <div style={s.tab}>
        <button style={s.tabBtn(mode === 'register')} onClick={() => { setMode('register'); setStep(1); }}>New Identity</button>
        <button style={s.tabBtn(mode === 'login')}    onClick={() => setMode('login')}>Authenticate</button>
      </div>

      {error && <div style={s.error}>⚠ {error}</div>}

      {mode === 'register' && step === 1 && (
        <>
          <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, color: 'var(--text2)', marginBottom: 24, lineHeight: 1.7 }}>
            Generate a cryptographic keypair. Your private key stays on your device — never sent to our server.
          </p>
          <button style={s.btn} onClick={handleGenerate}>⚡ Generate Keypair</button>
        </>
      )}

      {mode === 'register' && step === 2 && keyPair && (
        <>
          <label style={s.label}>Your Public Key Hash (save this!)</label>
          <div style={s.codeBox}>{keyHash}</div>
          <label style={s.label}>Choose Anonymous Handle</label>
          <input style={s.input} value={handle} onChange={e => setHandle(e.target.value)} placeholder="@phantom_node_..." />
          <button style={s.btn} onClick={handleRegister} disabled={loading}>
            {loading ? 'Creating...' : 'Create Anonymous Identity →'}
          </button>
        </>
      )}

      {mode === 'login' && (
        <>
          <label style={s.label}>Public Key Hash</label>
          <input style={s.input} value={keyHash} onChange={e => setKeyHash(e.target.value)} placeholder="64-character hex hash..." />
          <button style={s.btn} onClick={handleLogin} disabled={loading}>
            {loading ? 'Authenticating...' : 'Authenticate Anonymously →'}
          </button>
        </>
      )}
    </div>
  );
}
