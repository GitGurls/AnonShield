import React, { useState } from 'react';
import { encrypt, decrypt } from '../../utils/crypto';

export default function EncryptionDemo() {
  const [plaintext,  setPlaintext]  = useState('My secret identity data...');
  const [passphrase, setPassphrase] = useState('my_secret_passphrase');
  const [encrypted,  setEncrypted]  = useState(null);
  const [decrypted,  setDecrypted]  = useState('');
  const [loading,    setLoading]    = useState(false);
  const [copied,     setCopied]     = useState(false);

  const handleEncrypt = async () => {
    if (!plaintext.trim()) return;
    setLoading(true);
    try {
      const result = await encrypt(plaintext, passphrase);
      setEncrypted(result);
      setDecrypted('');
    } catch (e) {
      alert('Encryption error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!encrypted) return;
    setLoading(true);
    try {
      const result = await decrypt(encrypted.encryptedData, encrypted.iv, passphrase);
      setDecrypted(result);
    } catch {
      setDecrypted('⚠ Decryption failed — wrong passphrase?');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (encrypted) {
      navigator.clipboard.writeText(JSON.stringify(encrypted, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const s = {
    grid: { display: 'grid', gridTemplateColumns: '1fr 50px 1fr', gap: 0, alignItems: 'start' },
    panel: { background: 'var(--bg2)', border: '1px solid var(--border)', padding: 24 },
    label: { fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--text2)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, display: 'block' },
    textarea: { width: '100%', minHeight: 130, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: 12, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, resize: 'vertical', outline: 'none', marginBottom: 12 },
    input: { width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, outline: 'none', marginBottom: 12 },
    btn: (color='var(--accent)') => ({ width: '100%', background: `${color}15`, border: `1px solid ${color}`, color, padding: '10px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: 1, cursor: 'pointer', textTransform: 'uppercase', marginBottom: 8 }),
    arrow: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, fontSize: 22, color: 'var(--accent)' }
  };

  return (
    <div>
      <div style={s.grid}>
        <div style={s.panel}>
          <label style={s.label}>Plaintext Input</label>
          <textarea style={s.textarea} value={plaintext} onChange={e => setPlaintext(e.target.value)} />
          <label style={s.label}>Passphrase</label>
          <input  style={s.input}    value={passphrase} onChange={e => setPassphrase(e.target.value)} type="password" />
          <button style={s.btn()} onClick={handleEncrypt} disabled={loading}>
            🔐 {loading ? 'Encrypting...' : 'Encrypt with AES-256-GCM'}
          </button>
        </div>
        <div style={s.arrow}>→</div>
        <div style={s.panel}>
          <label style={s.label}>Encrypted Output (AES-256-GCM)</label>
          <textarea
            style={s.textarea}
            readOnly
            value={encrypted ? JSON.stringify(encrypted, null, 2) : ''}
            placeholder="Encrypted output appears here..."
          />
          <button style={s.btn()} onClick={handleCopy} disabled={!encrypted}>
            {copied ? '✓ Copied!' : '📋 Copy Encrypted'}
          </button>
          <button style={s.btn('#0066FF')} onClick={handleDecrypt} disabled={!encrypted || loading}>
            🔓 Decrypt to verify
          </button>
          {decrypted && (
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#00cc88', marginTop: 8 }}>
              ✓ Decrypted: {decrypted}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
