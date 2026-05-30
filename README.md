# 🔐 AnonShield
### Anonymous Digital Identity & Data Protection Network

> **Codorra Hackathon 2026** | Cybersecurity Track | MERN Stack  
> Built in 48 hours — Zero PII stored, Zero Trust Architecture.

---

## 📁 Project Structure (MVC)

```
anonshield/
│
├── server/                        # Backend — Node.js + Express
│   ├── index.js                   # Entry point + Socket.io
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── rateLimit.js           # Rate limiter config
│   ├── models/                    # M — Mongoose schemas
│   │   ├── Identity.model.js
│   │   ├── VaultDoc.model.js
│   │   ├── Threat.model.js
│   │   └── AuditLog.model.js
│   ├── controllers/               # C — Business logic
│   │   ├── identity.controller.js
│   │   ├── vault.controller.js
│   │   ├── threat.controller.js
│   │   ├── audit.controller.js
│   │   └── stats.controller.js
│   ├── routes/                    # V (Router layer)
│   │   ├── identity.routes.js
│   │   ├── vault.routes.js
│   │   ├── threat.routes.js
│   │   ├── audit.routes.js
│   │   └── stats.routes.js
│   ├── middleware/
│   │   ├── authenticate.js        # JWT verification
│   │   ├── validate.js            # express-validator
│   │   └── errorHandler.js        # Global error handler
│   ├── services/
│   │   ├── audit.service.js       # Audit logging service
│   │   └── threat.service.js      # AI threat scoring
│   └── utils/
│       ├── logger.js              # Winston logger
│       └── privacy.js             # IP hashing utility
│
├── client/                        # Frontend — React
│   └── src/
│       ├── App.js                 # Router + PrivateRoute
│       ├── context/
│       │   └── AuthContext.js     # Global auth state
│       ├── hooks/
│       │   ├── useAuth.js         # Auth hook
│       │   └── useSocket.js       # Socket.io hook
│       ├── pages/
│       │   ├── LandingPage.jsx    # Public homepage
│       │   ├── DashboardPage.jsx  # Overview
│       │   ├── VaultPage.jsx      # Encrypted docs
│       │   ├── ThreatsPage.jsx    # Threat monitor
│       │   ├── IdentityPage.jsx   # Identity generator
│       │   └── AuditPage.jsx      # Audit trail
│       ├── components/
│       │   ├── Auth/AuthForm.jsx          # Register + Login
│       │   ├── Layout/Navbar.jsx          # Navigation
│       │   ├── Dashboard/StatsCard.jsx    # Stat widgets
│       │   ├── Identity/IdentityGenerator # Key generation
│       │   ├── Vault/EncryptionDemo.jsx   # AES-256 demo
│       │   └── Threats/ThreatMonitor.jsx  # Threat list
│       ├── services/
│       │   └── api.js             # Axios + JWT interceptor
│       └── utils/
│           └── crypto.js          # Web Crypto API wrapper
│
├── docker/
│   ├── Dockerfile.server
│   └── Dockerfile.client
├── scripts/
│   └── seed.js                    # DB seeder
├── docker-compose.yml
├── package.json
└── .env.example
```

---

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone https://github.com/your-team/anonshield
cd anonshield
npm run install:all

# 2. Setup environment
cp .env.example .env
# Edit .env with your values

# 3. Run (dev mode — runs both server + client)
npm run dev:full

# OR with Docker
docker-compose up --build
```

**URLs:**
- Frontend → http://localhost:3000
- API → http://localhost:5000
- Health → http://localhost:5000/api/health

---

## 📡 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/identity/register` | ❌ | Create anonymous identity |
| POST | `/api/identity/authenticate` | ❌ | Login with key hash |
| GET  | `/api/identity/me` | ✅ | Get identity + stats |
| DELETE | `/api/identity/deactivate` | ✅ | Deactivate identity |
| POST | `/api/vault/store` | ✅ | Store encrypted document |
| GET  | `/api/vault/list` | ✅ | List vault documents |
| GET  | `/api/vault/:id` | ✅ | Get encrypted document |
| DELETE | `/api/vault/:id` | ✅ | Delete document |
| POST | `/api/threat/report` | ✅ | Report threat |
| GET  | `/api/threat/summary` | ✅ | Threat summary |
| PATCH | `/api/threat/:id/resolve` | ✅ | Resolve threat |
| GET  | `/api/audit/log` | ✅ | Immutable audit trail |
| GET  | `/api/stats` | ❌ | Public global stats |

---

## 🔐 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Web Crypto API |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (RS256), bcryptjs |
| Real-time | Socket.io |
| Encryption | AES-256-GCM (client-side), ED25519 |
| Security | Helmet.js, express-rate-limit, express-validator |
| Logging | Winston |
| DevOps | Docker, Docker Compose, Nginx |

---

## 🛡️ Privacy Architecture

- ✅ **Zero PII stored** — No email, phone, name ever collected
- ✅ **Client-side encryption** — Keys derived from passphrase, never sent to server
- ✅ **IP hashing** — Raw IPs never stored; only SHA-256 hashes with salt
- ✅ **Immutable audit logs** — Write-once, cryptographically verifiable
- ✅ **Zero-knowledge ready** — ZK-SNARK integration points built in

---

*Built with ❤️ for Codorra Hackathon 2026 — Cybersecurity Track*
