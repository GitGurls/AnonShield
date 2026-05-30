import React, { useState } from 'react';
import { generateKeyPair, sha256 } from '../../utils/crypto';

const adjectives = ['phantom','silent','hidden','shadow','cipher','ghost','zero','null','void','stealth'];
const nouns      = ['node','proxy','vault','key','chain','shield','grid','nexus','core','layer'];
const emojis     = ['🔮','🛡️','🔐','👁️','🌑','⚡','🔒','🎭','🌐','💎'];

function randomHex(len) {
  return Array.from(crypto.getRandomValues(new Uint8Array(len))).map(b => b.toString(16).padStart(2,'0')).join('').slice(0, len);
}

export default function IdentityGenerator({ onGenerated }) {
  const [identity, setIdentity] = useState(null);
  const [loading, setLoading]   = useState(false);

  const generate = async () => {
    setLoading(true);
    const kp   = generateKeyPair();
    const hash = await sha256(kp.publicKey);
    const handle = `@${adjectives[Math.floor(Math.random()*adjectives.length)]}_${nouns[Math.floor(Math.random()*nouns.length)]}_${randomHex(4)}`;
    const emoji  = emojis[Math.floor(Math.random()*emojis.length)];
    const id     = { ...kp, publicKeyHash: hash, handle, emoji };
    setIdentity(id);
    setLoading(false);
    onGenerated?.(id);
  };

  const s = {
    wrap: { background: 'var(--bg2)', border: '1px solid var(--border)', padding: 32 },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
    genBtn: { background: 'rgba(0,255,178,0.1)', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '10px 24px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, letterSpacing: 2, cursor: 'pointer', textTransform: 'uppercase' },
    card: { background: 'var(--bg)', border: '1px solid var(--border)', padding: 24, display: 'grid', gridTemplateColumns: '80px 1fr', gap: 24 },
    avatar: { width: 80, height: 80, background: 'var(--bg3)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 },
    fieldLabel: { fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'var(--text2)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
    fieldValue: { fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, color: 'var(--accent)', wordBreak: 'break-all', marginBottom: 14 },
    badge: (color) => ({ display: 'inline-block', background: `${color}15`, border: `1px solid ${color}40`, padding: '3px 10px', fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", color, marginRight: 8, marginTop: 8 })
  };

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 18 }}>Anonymous Identity Generator</div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>
            ED25519 keypair — no personal data required
          </div>
        </div>
        <button style={s.genBtn} onClick={generate} disabled={loading}>
          {loading ? 'Generating...' : '⚡ Generate New Identity'}
        </button>
      </div>

      {identity ? (
        <div style={s.card}>
          <div style={s.avatar}>{identity.emoji}</div>
          <div>
            <div style={s.fieldLabel}>Anonymous Handle</div>
            <div style={s.fieldValue}>{identity.handle}</div>
            <div style={s.fieldLabel}>Public Key</div>
            <div style={s.fieldValue}>{identity.publicKey}</div>
            <div style={s.fieldLabel}>Public Key Hash (SHA-256)</div>
            <div style={{ ...s.fieldValue, fontSize: 11 }}>{identity.publicKeyHash}</div>
            <span style={s.badge('#00FFB2')}>ANONYMOUS</span>
            <span style={s.badge('#0066FF')}>ED25519</span>
            <span style={s.badge('#FF3366')}>ENCRYPTED</span>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 13 }}>
          Click "Generate" to create your cryptographic identity
        </div>
      )}
    </div>
  );
}
