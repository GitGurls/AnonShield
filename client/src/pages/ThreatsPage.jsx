import React from 'react';
import Navbar from '../components/Layout/Navbar';
import ThreatMonitor from '../components/Threats/ThreatMonitor';

export default function ThreatsPage() {
  const s = {
    page:    { paddingTop: 80, minHeight: '100vh', background: 'var(--bg)' },
    inner:   { maxWidth: 1200, margin: '0 auto', padding: '48px' },
    heading: { fontSize: 32, fontWeight: 800, marginBottom: 8 },
    sub:     { fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, color: 'var(--text2)', marginBottom: 40 }
  };
  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.inner}>
        <div style={s.heading}>Threat Intelligence</div>
        <div style={s.sub}>AI-powered real-time monitoring of your identity exposure</div>
        <ThreatMonitor />
      </div>
    </div>
  );
}
