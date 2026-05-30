import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navLinks = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/identity',  label: 'Identity' },
  { to: '/vault',     label: 'Vault' },
  { to: '/threats',   label: 'Threats' },
  { to: '/audit',     label: 'Audit Log' },
];

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 48px',
    background: 'rgba(5,10,14,0.9)', backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(0,255,178,0.15)'
  },
  logo: {
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 600,
    color: '#00FFB2', letterSpacing: 2, textDecoration: 'none'
  },
  links: { display: 'flex', gap: 32, listStyle: 'none' },
  link: {
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
    letterSpacing: 1, textTransform: 'uppercase', textDecoration: 'none',
    color: '#7A9BAD', transition: 'color 0.2s'
  },
  activeLink: { color: '#00FFB2' },
  logoutBtn: {
    background: 'transparent', border: '1px solid rgba(255,51,102,0.4)',
    color: '#FF3366', padding: '7px 18px', cursor: 'pointer',
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 1,
    textTransform: 'uppercase', transition: 'all 0.2s'
  }
};

export default function Navbar() {
  const { logout, identity } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.logo}>ANON<span style={{ color: '#7A9BAD' }}>SHIELD</span></Link>
      <ul style={styles.links}>
        {navLinks.map(({ to, label }) => (
          <li key={to}>
            <Link to={to} style={{ ...styles.link, ...(pathname === to ? styles.activeLink : {}) }}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {identity && (
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#7A9BAD' }}>
            {identity.handle}
          </span>
        )}
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
